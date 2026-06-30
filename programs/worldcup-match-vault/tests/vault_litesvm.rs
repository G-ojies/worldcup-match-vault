//! End-to-end tests for the WorldCup Match Vault program using LiteSVM.
//!
//! Covers the eight required scenarios:
//!   1. create a market
//!   2. place bets on all three outcomes from different wallets
//!   3. reject a bet placed at/after kickoff (clock manipulation)
//!   4. resolve a market with the oracle authority
//!   5. reject resolve from the wrong signer
//!   6. winner claims the correct proportional payout
//!   7. reject a double claim
//!   8. verify the 3% protocol fee is withheld

use anchor_lang::{AccountDeserialize, InstructionData, ToAccountMetas};
use litesvm::LiteSVM;
use solana_clock::Clock;
use solana_instruction::Instruction;
use solana_keypair::Keypair;
use solana_message::{Message, VersionedMessage};
use solana_pubkey::Pubkey;
use solana_signer::Signer;
use solana_transaction::versioned::VersionedTransaction;

use worldcup_match_vault::state::bet::Bet;
use worldcup_match_vault::state::market::{Market, Outcome};
use worldcup_match_vault::{accounts, instruction, ID as PROGRAM_ID};

const LAMPORTS_PER_SOL: u64 = 1_000_000_000;
const NOW: i64 = 1_700_000_000; // fixed baseline clock for determinism

// ---------- helpers ----------

fn program_bytes() -> Vec<u8> {
    include_bytes!("../../../target/deploy/worldcup_match_vault.so").to_vec()
}

fn setup() -> (LiteSVM, Keypair) {
    let mut svm = LiteSVM::new();
    svm.add_program(PROGRAM_ID, &program_bytes()).unwrap();

    // Pin the clock so match timestamps are deterministic.
    let mut clock = svm.get_sysvar::<Clock>();
    clock.unix_timestamp = NOW;
    svm.set_sysvar::<Clock>(&clock);

    let admin = Keypair::new();
    svm.airdrop(&admin.pubkey(), 1_000 * LAMPORTS_PER_SOL).unwrap();
    (svm, admin)
}

fn funded_wallet(svm: &mut LiteSVM, sol: u64) -> Keypair {
    let kp = Keypair::new();
    svm.airdrop(&kp.pubkey(), sol * LAMPORTS_PER_SOL).unwrap();
    kp
}

fn market_pda(match_id: &str) -> Pubkey {
    Pubkey::find_program_address(&[b"market", match_id.as_bytes()], &PROGRAM_ID).0
}

fn vault_pda(market: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(&[b"vault", market.as_ref()], &PROGRAM_ID).0
}

fn bet_pda(market: &Pubkey, bettor: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(&[b"bet", market.as_ref(), bettor.as_ref()], &PROGRAM_ID).0
}

fn send(
    svm: &mut LiteSVM,
    ix: Instruction,
    payer: &Keypair,
    extra_signers: &[&Keypair],
) -> Result<(), litesvm::types::FailedTransactionMetadata> {
    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[ix], Some(&payer.pubkey()), &blockhash);
    let mut signers: Vec<&Keypair> = vec![payer];
    signers.extend_from_slice(extra_signers);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &signers).unwrap();
    svm.send_transaction(tx).map(|_| ())
}

fn create_market_ix(
    admin: &Pubkey,
    match_id: &str,
    home: &str,
    away: &str,
    match_timestamp: i64,
    oracle: &Pubkey,
) -> Instruction {
    let market = market_pda(match_id);
    Instruction {
        program_id: PROGRAM_ID,
        accounts: accounts::CreateMarket {
            admin: *admin,
            market,
            vault: vault_pda(&market),
            system_program: solana_pubkey::Pubkey::from(anchor_lang::system_program::ID.to_bytes()),
        }
        .to_account_metas(None),
        data: instruction::CreateMarket {
            match_id: match_id.to_string(),
            home_team: home.to_string(),
            away_team: away.to_string(),
            match_timestamp,
            oracle_authority: *oracle,
            // Legacy oracle-path markets in these tests bind no TxLINE fixture.
            binding: worldcup_match_vault::instructions::create_market::TxlineBinding::default(),
        }
        .data(),
    }
}

fn place_bet_ix(bettor: &Pubkey, match_id: &str, outcome: Outcome, amount: u64) -> Instruction {
    let market = market_pda(match_id);
    Instruction {
        program_id: PROGRAM_ID,
        accounts: accounts::PlaceBet {
            bettor: *bettor,
            market,
            vault: vault_pda(&market),
            bet: bet_pda(&market, bettor),
            system_program: solana_pubkey::Pubkey::from(anchor_lang::system_program::ID.to_bytes()),
        }
        .to_account_metas(None),
        data: instruction::PlaceBet {
            predicted_outcome: outcome,
            amount,
        }
        .data(),
    }
}

fn resolve_ix(oracle: &Pubkey, match_id: &str, outcome: Outcome) -> Instruction {
    let market = market_pda(match_id);
    Instruction {
        program_id: PROGRAM_ID,
        accounts: accounts::ResolveMarket {
            oracle_authority: *oracle,
            market,
        }
        .to_account_metas(None),
        data: instruction::ResolveMarket { outcome }.data(),
    }
}

fn claim_ix(bettor: &Pubkey, match_id: &str) -> Instruction {
    let market = market_pda(match_id);
    Instruction {
        program_id: PROGRAM_ID,
        accounts: accounts::ClaimPayout {
            bettor: *bettor,
            market,
            vault: vault_pda(&market),
            bet: bet_pda(&market, bettor),
            system_program: solana_pubkey::Pubkey::from(anchor_lang::system_program::ID.to_bytes()),
        }
        .to_account_metas(None),
        data: instruction::ClaimPayout {}.data(),
    }
}

fn load_market(svm: &LiteSVM, match_id: &str) -> Market {
    let acc = svm.get_account(&market_pda(match_id)).expect("market exists");
    Market::try_deserialize(&mut acc.data.as_slice()).unwrap()
}

fn load_bet(svm: &LiteSVM, match_id: &str, bettor: &Pubkey) -> Bet {
    let acc = svm
        .get_account(&bet_pda(&market_pda(match_id), bettor))
        .expect("bet exists");
    Bet::try_deserialize(&mut acc.data.as_slice()).unwrap()
}

// ---------- tests ----------

#[test]
fn test_1_create_market() {
    let (mut svm, admin) = setup();
    let oracle = Keypair::new();
    let mid = "WC2026_001";

    send(
        &mut svm,
        create_market_ix(&admin.pubkey(), mid, "Brazil", "Argentina", NOW + 100_000, &oracle.pubkey()),
        &admin,
        &[],
    )
    .expect("create_market should succeed");

    let m = load_market(&svm, mid);
    assert_eq!(m.match_id, mid);
    assert_eq!(m.home_team, "Brazil");
    assert_eq!(m.away_team, "Argentina");
    assert_eq!(m.outcome, Outcome::Unresolved);
    assert!(!m.is_settled);
    assert_eq!(m.oracle_authority, oracle.pubkey());
    assert_eq!(m.total_home_pool, 0);
}

#[test]
fn test_2_place_bets_all_outcomes() {
    let (mut svm, admin) = setup();
    let oracle = Keypair::new();
    let mid = "WC2026_002";
    send(
        &mut svm,
        create_market_ix(&admin.pubkey(), mid, "France", "Spain", NOW + 100_000, &oracle.pubkey()),
        &admin,
        &[],
    )
    .unwrap();

    let home_bettor = funded_wallet(&mut svm, 10);
    let away_bettor = funded_wallet(&mut svm, 10);
    let draw_bettor = funded_wallet(&mut svm, 10);

    send(&mut svm, place_bet_ix(&home_bettor.pubkey(), mid, Outcome::Home, 2 * LAMPORTS_PER_SOL), &home_bettor, &[]).unwrap();
    send(&mut svm, place_bet_ix(&away_bettor.pubkey(), mid, Outcome::Away, 1 * LAMPORTS_PER_SOL), &away_bettor, &[]).unwrap();
    send(&mut svm, place_bet_ix(&draw_bettor.pubkey(), mid, Outcome::Draw, 1 * LAMPORTS_PER_SOL), &draw_bettor, &[]).unwrap();

    let m = load_market(&svm, mid);
    assert_eq!(m.total_home_pool, 2 * LAMPORTS_PER_SOL);
    assert_eq!(m.total_away_pool, 1 * LAMPORTS_PER_SOL);
    assert_eq!(m.total_draw_pool, 1 * LAMPORTS_PER_SOL);

    // Vault PDA holds the full 4 SOL.
    let vault_bal = svm.get_balance(&vault_pda(&market_pda(mid))).unwrap();
    assert_eq!(vault_bal, 4 * LAMPORTS_PER_SOL);

    let b = load_bet(&svm, mid, &home_bettor.pubkey());
    assert_eq!(b.predicted_outcome, Outcome::Home);
    assert_eq!(b.amount, 2 * LAMPORTS_PER_SOL);
    assert!(!b.claimed);
}

#[test]
fn test_3_bet_after_match_start_fails() {
    let (mut svm, admin) = setup();
    let oracle = Keypair::new();
    let mid = "WC2026_003";
    // Market kicks off in the past relative to the pinned clock.
    send(
        &mut svm,
        create_market_ix(&admin.pubkey(), mid, "Germany", "England", NOW - 10, &oracle.pubkey()),
        &admin,
        &[],
    )
    .unwrap();

    let bettor = funded_wallet(&mut svm, 10);
    let res = send(&mut svm, place_bet_ix(&bettor.pubkey(), mid, Outcome::Home, LAMPORTS_PER_SOL), &bettor, &[]);
    assert!(res.is_err(), "bet after kickoff must be rejected");
}

#[test]
fn test_4_resolve_market() {
    let (mut svm, admin) = setup();
    let oracle = Keypair::new();
    let mid = "WC2026_004";
    send(
        &mut svm,
        create_market_ix(&admin.pubkey(), mid, "Brazil", "Argentina", NOW + 100_000, &oracle.pubkey()),
        &admin,
        &[],
    )
    .unwrap();

    // Oracle co-signs; admin pays the fee (the oracle authority holds no SOL).
    send(&mut svm, resolve_ix(&oracle.pubkey(), mid, Outcome::Home), &admin, &[&oracle]).expect("oracle resolve");

    let m = load_market(&svm, mid);
    assert!(m.is_settled);
    assert_eq!(m.outcome, Outcome::Home);
}

#[test]
fn test_5_resolve_wrong_signer_fails() {
    let (mut svm, admin) = setup();
    let oracle = Keypair::new();
    let imposter = funded_wallet(&mut svm, 10);
    let mid = "WC2026_005";
    send(
        &mut svm,
        create_market_ix(&admin.pubkey(), mid, "Brazil", "Argentina", NOW + 100_000, &oracle.pubkey()),
        &admin,
        &[],
    )
    .unwrap();

    let res = send(&mut svm, resolve_ix(&imposter.pubkey(), mid, Outcome::Home), &imposter, &[]);
    assert!(res.is_err(), "non-oracle resolve must be rejected");

    let m = load_market(&svm, mid);
    assert!(!m.is_settled);
}

#[test]
fn test_6_and_8_claim_payout_and_fee() {
    let (mut svm, admin) = setup();
    let oracle = Keypair::new();
    let mid = "WC2026_006";
    send(
        &mut svm,
        create_market_ix(&admin.pubkey(), mid, "France", "Spain", NOW + 100_000, &oracle.pubkey()),
        &admin,
        &[],
    )
    .unwrap();

    let home_bettor = funded_wallet(&mut svm, 10); // winner
    let away_bettor = funded_wallet(&mut svm, 10);
    let draw_bettor = funded_wallet(&mut svm, 10);
    send(&mut svm, place_bet_ix(&home_bettor.pubkey(), mid, Outcome::Home, 2 * LAMPORTS_PER_SOL), &home_bettor, &[]).unwrap();
    send(&mut svm, place_bet_ix(&away_bettor.pubkey(), mid, Outcome::Away, 1 * LAMPORTS_PER_SOL), &away_bettor, &[]).unwrap();
    send(&mut svm, place_bet_ix(&draw_bettor.pubkey(), mid, Outcome::Draw, 1 * LAMPORTS_PER_SOL), &draw_bettor, &[]).unwrap();

    send(&mut svm, resolve_ix(&oracle.pubkey(), mid, Outcome::Home), &admin, &[&oracle]).unwrap();

    let vault = vault_pda(&market_pda(mid));
    let vault_before = svm.get_balance(&vault).unwrap();

    send(&mut svm, claim_ix(&home_bettor.pubkey(), mid), &home_bettor, &[]).expect("winner claim");

    let vault_after = svm.get_balance(&vault).unwrap();
    let paid = vault_before - vault_after;

    // total_pool = 4 SOL, winning_pool = 2 SOL, bet = 2 SOL.
    // gross = 2 * 4 / 2 = 4 SOL; net = gross * 0.97 = 3.88 SOL.
    let total_pool = 4 * LAMPORTS_PER_SOL;
    let winning_pool = 2 * LAMPORTS_PER_SOL;
    let bet = 2 * LAMPORTS_PER_SOL;
    let gross = (bet as u128 * total_pool as u128 / winning_pool as u128) as u64;
    let expected = (bet as u128 * total_pool as u128 * 9_700 / 10_000 / winning_pool as u128) as u64;
    assert_eq!(paid, expected, "payout must match formula");

    // Fee (3% of gross) stays in the vault.
    let fee = gross - expected;
    assert_eq!(vault_after, fee, "protocol fee must remain in the vault");
    assert!(fee > 0, "fee must be non-zero");

    let b = load_bet(&svm, mid, &home_bettor.pubkey());
    assert!(b.claimed);
}

#[test]
fn test_7_double_claim_fails() {
    let (mut svm, admin) = setup();
    let oracle = Keypair::new();
    let mid = "WC2026_007";
    send(
        &mut svm,
        create_market_ix(&admin.pubkey(), mid, "France", "Spain", NOW + 100_000, &oracle.pubkey()),
        &admin,
        &[],
    )
    .unwrap();

    let home_bettor = funded_wallet(&mut svm, 10);
    let away_bettor = funded_wallet(&mut svm, 10);
    send(&mut svm, place_bet_ix(&home_bettor.pubkey(), mid, Outcome::Home, 2 * LAMPORTS_PER_SOL), &home_bettor, &[]).unwrap();
    send(&mut svm, place_bet_ix(&away_bettor.pubkey(), mid, Outcome::Away, 1 * LAMPORTS_PER_SOL), &away_bettor, &[]).unwrap();
    send(&mut svm, resolve_ix(&oracle.pubkey(), mid, Outcome::Home), &admin, &[&oracle]).unwrap();

    send(&mut svm, claim_ix(&home_bettor.pubkey(), mid), &home_bettor, &[]).expect("first claim ok");
    let res = send(&mut svm, claim_ix(&home_bettor.pubkey(), mid), &home_bettor, &[]);
    assert!(res.is_err(), "second claim must be rejected");
}
