/**
 * End-to-end trustless settlement on devnet against REAL TxLINE data.
 *
 * Flow:
 *   create_market (bound to TxLINE fixture 18172280, Netherlands 1-1 Morocco)
 *   -> place_bet (Draw = winner, Home = loser) from two funded wallets
 *   -> resolve_market_trustless: fetch the live 3-stage Merkle proof, CPI into
 *      TxLINE validate_stat, settles to Draw with NO oracle authority
 *   -> claim_payout for the Draw bettor.
 *
 * Run: npm run e2e   (from the txline/ package)
 */
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { TxlineClient } from "./txline-client";
import { buildValidateStatArgs, epochDayFromMs } from "./proof";

const ourIdl = require("../../target/idl/worldcup_match_vault.json");

const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const TXLINE_PROGRAM = new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");
const FIXTURE_ID = 18172280; // Netherlands vs Morocco (World Cup), final 1-1 -> Draw
const SEQ = 1427;

const OUR_PROGRAM = new PublicKey(ourIdl.address);

function loadMainWallet(): Keypair {
  const p = process.env.ANCHOR_WALLET || path.join(os.homedir(), ".config", "solana", "id.json");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(p, "utf8"))));
}

const log = (...a: any[]) => console.log(...a);
const sol = (l: number) => (l / LAMPORTS_PER_SOL).toFixed(4);

function programFor(connection: Connection, kp: Keypair): anchor.Program {
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(kp), {
    commitment: "confirmed",
  });
  return new anchor.Program(ourIdl as anchor.Idl, provider);
}

const marketPda = (matchId: string) =>
  PublicKey.findProgramAddressSync([Buffer.from("market"), Buffer.from(matchId)], OUR_PROGRAM)[0];
const vaultPda = (market: PublicKey) =>
  PublicKey.findProgramAddressSync([Buffer.from("vault"), market.toBuffer()], OUR_PROGRAM)[0];
const betPda = (market: PublicKey, bettor: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("bet"), market.toBuffer(), bettor.toBuffer()],
    OUR_PROGRAM
  )[0];

async function fund(connection: Connection, payer: Keypair, to: PublicKey, lamports: number) {
  const tx = new Transaction().add(
    SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: to, lamports })
  );
  return anchor.web3.sendAndConfirmTransaction(connection, tx, [payer], { commitment: "confirmed" });
}

async function main() {
  const connection = new Connection(RPC, "confirmed");
  const admin = loadMainWallet();
  log(`network   : devnet`);
  log(`program   : ${OUR_PROGRAM.toBase58()}`);
  log(`admin     : ${admin.publicKey.toBase58()}  (${sol(await connection.getBalance(admin.publicKey))} SOL)`);

  const tx = new TxlineClient();

  // --- determine home/away stat-key mapping from the fixture ---
  const fixtures = await tx.getFixturesSnapshot();
  const fx = fixtures.find((f) => f.FixtureId === FIXTURE_ID);
  const p1Home = fx ? fx.Participant1IsHome : true;
  const home = fx ? (p1Home ? fx.Participant1 : fx.Participant2) : "Netherlands";
  const away = fx ? (p1Home ? fx.Participant2 : fx.Participant1) : "Morocco";
  // statKey 1 = Participant1 total goals, 2 = Participant2 total goals (full game).
  const homeKey = p1Home ? 1 : 2;
  const awayKey = p1Home ? 2 : 1;
  log(`fixture   : ${FIXTURE_ID} ${home} vs ${away}  (P1IsHome=${p1Home}, homeKey=${homeKey}, awayKey=${awayKey})`);

  const matchId = `WC_${FIXTURE_ID}_${Date.now().toString(36).slice(-5)}`;
  const market = marketPda(matchId);
  const vault = vaultPda(market);
  log(`match_id  : ${matchId}`);
  log(`market PDA: ${market.toBase58()}`);

  const adminProgram = programFor(connection, admin);

  // --- 1. create_market: bets allowed until a FUTURE kickoff; trustless settle allowed now (past gate) ---
  const nowSec = Math.floor(Date.now() / 1000);
  const matchTimestamp = new BN(nowSec + 24 * 3600); // future: betting open
  const settleNotBefore = new BN(nowSec - 3600); // past: settlement allowed now
  const binding = {
    fixtureId: new BN(FIXTURE_ID),
    homeGoalKey: homeKey,
    awayGoalKey: awayKey,
    goalPeriod: 0,
    settleNotBefore,
  };

  const createSig = await adminProgram.methods
    .createMarket(matchId, home, away, matchTimestamp, admin.publicKey, binding)
    .accounts({
      admin: admin.publicKey,
      market,
      vault,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  log(`\n[1] create_market         ${createSig}`);

  // --- 2. place two bets from funded throwaway wallets ---
  const drawBettor = Keypair.generate();
  const homeBettor = Keypair.generate();
  await fund(connection, admin, drawBettor.publicKey, 0.2 * LAMPORTS_PER_SOL);
  await fund(connection, admin, homeBettor.publicKey, 0.2 * LAMPORTS_PER_SOL);

  const BET = new BN(0.05 * LAMPORTS_PER_SOL);
  const drawSig = await programFor(connection, drawBettor).methods
    .placeBet({ draw: {} }, BET)
    .accounts({
      bettor: drawBettor.publicKey,
      market,
      vault,
      bet: betPda(market, drawBettor.publicKey),
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  log(`[2] place_bet Draw  (win) ${drawSig}`);

  const homeSig = await programFor(connection, homeBettor).methods
    .placeBet({ home: {} }, BET)
    .accounts({
      bettor: homeBettor.publicKey,
      market,
      vault,
      bet: betPda(market, homeBettor.publicKey),
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  log(`[2] place_bet Home (lose) ${homeSig}`);

  // --- 3. fetch the live proof and settle trustlessly via validate_stat CPI ---
  const validation = await tx.getStatValidation({
    fixtureId: FIXTURE_ID,
    seq: SEQ,
    statKey: homeKey,
    statKey2: awayKey,
  });
  const homeGoals = validation.statToProve.value;
  const awayGoals = validation.statToProve2!.value;
  log(`\nproven score: ${home} ${homeGoals} - ${awayGoals} ${away}  => Draw`);

  const built = buildValidateStatArgs(validation, {
    threshold: 0,
    comparison: { equalTo: {} },
    twoStat: true,
    op: { subtract: {} },
  });
  const { fixtureSummary, fixtureProof, mainTreeProof, statA, statB, targetTs } = built.pieces;

  // Derive the TxLINE daily-scores PDA for the match epoch day.
  const epochDay = epochDayFromMs(targetTs);
  const [dailyScoresPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("daily_scores_roots"), new BN(epochDay).toArrayLike(Buffer, "le", 2)],
    TXLINE_PROGRAM
  );
  log(`daily PDA : ${dailyScoresPda.toBase58()} (epochDay ${epochDay})`);

  const cu = ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 });
  const resolveSig = await adminProgram.methods
    .resolveMarketTrustless(
      { draw: {} },
      new BN(targetTs),
      fixtureSummary,
      fixtureProof,
      mainTreeProof,
      statA, // home
      statB // away
    )
    .accounts({
      resolver: admin.publicKey,
      market,
      dailyScoresMerkleRoots: dailyScoresPda,
      txlineProgram: TXLINE_PROGRAM,
    })
    .preInstructions([cu])
    .rpc();
  log(`\n[3] resolve_market_trustless ${resolveSig}`);

  const mkt: any = await adminProgram.account.market.fetch(market);
  const outcomeKey = Object.keys(mkt.outcome)[0];
  log(`    settled outcome: ${outcomeKey}  is_settled=${mkt.isSettled}  settlement_kind=${mkt.settlementKind} (2=TxLINE proof)`);
  if (outcomeKey !== "draw") throw new Error(`expected draw, got ${outcomeKey}`);

  // --- 4. winning (Draw) bettor claims payout ---
  const before = await connection.getBalance(drawBettor.publicKey);
  const claimSig = await programFor(connection, drawBettor).methods
    .claimPayout()
    .accounts({
      bettor: drawBettor.publicKey,
      market,
      vault,
      bet: betPda(market, drawBettor.publicKey),
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  const after = await connection.getBalance(drawBettor.publicKey);
  log(`\n[4] claim_payout (Draw)   ${claimSig}`);
  log(`    Draw bettor balance ${sol(before)} -> ${sol(after)} SOL  (+${sol(after - before)})`);
  if (after <= before) throw new Error("claim did not increase balance");

  log(`\n✅ TRUSTLESS SETTLEMENT END-TO-END ON DEVNET: settled by TxLINE Merkle proof, no oracle.`);
  log(`\nSIGNATURES:`);
  log(`  create_market            ${createSig}`);
  log(`  place_bet Draw           ${drawSig}`);
  log(`  place_bet Home           ${homeSig}`);
  log(`  resolve_market_trustless ${resolveSig}`);
  log(`  claim_payout             ${claimSig}`);
}

main().catch((e) => {
  console.error("\n❌ e2e failed:", e?.message || e);
  if (e?.logs) console.error(e.logs.join("\n"));
  process.exit(1);
});
