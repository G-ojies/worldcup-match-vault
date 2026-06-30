import * as anchor from "@anchor-lang/core";
import { Program, BN, web3 } from "@anchor-lang/core";
import { assert } from "chai";

const { PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram } = web3;

// Load the generated IDL; programId is read from `idl.address`.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const idl = require("../target/idl/worldcup_match_vault.json");

// Anchor encodes a Rust unit enum as `{ variantNameCamel: {} }`.
const Outcome = {
  Home: { home: {} },
  Away: { away: {} },
  Draw: { draw: {} },
} as const;

describe("worldcup-match-vault", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = new anchor.Program(idl, provider) as Program;

  const now = () => Math.floor(Date.now() / 1000);

  const marketPda = (matchId: string) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("market"), Buffer.from(matchId)],
      program.programId
    )[0];

  const vaultPda = (market: web3.PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), market.toBuffer()],
      program.programId
    )[0];

  const betPda = (market: web3.PublicKey, bettor: web3.PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), market.toBuffer(), bettor.toBuffer()],
      program.programId
    )[0];

  async function airdrop(pk: web3.PublicKey, sol: number) {
    const sig = await provider.connection.requestAirdrop(pk, sol * LAMPORTS_PER_SOL);
    const bh = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({ signature: sig, ...bh });
  }

  async function fundedWallet(sol: number): Promise<web3.Keypair> {
    const kp = Keypair.generate();
    await airdrop(kp.publicKey, sol);
    return kp;
  }

  // Helpers to drive each instruction.
  async function createMarket(
    matchId: string,
    home: string,
    away: string,
    ts: number,
    oracle: web3.PublicKey
  ) {
    const market = marketPda(matchId);
    await program.methods
      .createMarket(matchId, home, away, new BN(ts), oracle)
      .accountsPartial({
        admin: provider.wallet.publicKey,
        market,
        vault: vaultPda(market),
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    return market;
  }

  async function placeBet(
    matchId: string,
    bettor: web3.Keypair,
    outcome: any,
    lamports: number
  ) {
    const market = marketPda(matchId);
    await program.methods
      .placeBet(outcome, new BN(lamports))
      .accountsPartial({
        bettor: bettor.publicKey,
        market,
        vault: vaultPda(market),
        bet: betPda(market, bettor.publicKey),
        systemProgram: SystemProgram.programId,
      })
      .signers([bettor])
      .rpc();
  }

  async function resolve(matchId: string, oracle: web3.Keypair, outcome: any) {
    const market = marketPda(matchId);
    await program.methods
      .resolveMarket(outcome)
      .accountsPartial({ oracleAuthority: oracle.publicKey, market })
      .signers([oracle])
      .rpc();
  }

  async function claim(matchId: string, bettor: web3.Keypair) {
    const market = marketPda(matchId);
    await program.methods
      .claimPayout()
      .accountsPartial({
        bettor: bettor.publicKey,
        market,
        vault: vaultPda(market),
        bet: betPda(market, bettor.publicKey),
        systemProgram: SystemProgram.programId,
      })
      .signers([bettor])
      .rpc();
  }

  before(async () => {
    // Fund the provider wallet so it can pay transaction fees.
    await airdrop(provider.wallet.publicKey, 100);
  });

  it("1. creates a market", async () => {
    const oracle = Keypair.generate();
    const mid = "TS_001";
    const market = await createMarket(mid, "Brazil", "Argentina", now() + 3600, oracle.publicKey);

    const m: any = await program.account.market.fetch(market);
    assert.equal(m.matchId, mid);
    assert.equal(m.homeTeam, "Brazil");
    assert.equal(m.awayTeam, "Argentina");
    assert.deepEqual(m.outcome, { unresolved: {} });
    assert.isFalse(m.isSettled);
    assert.ok(m.oracleAuthority.equals(oracle.publicKey));
    assert.equal(m.totalHomePool.toNumber(), 0);
  });

  it("2. places bets on all three outcomes from different wallets", async () => {
    const oracle = Keypair.generate();
    const mid = "TS_002";
    const market = await createMarket(mid, "France", "Spain", now() + 3600, oracle.publicKey);

    const homeBettor = await fundedWallet(5);
    const awayBettor = await fundedWallet(5);
    const drawBettor = await fundedWallet(5);

    await placeBet(mid, homeBettor, Outcome.Home, 2 * LAMPORTS_PER_SOL);
    await placeBet(mid, awayBettor, Outcome.Away, 1 * LAMPORTS_PER_SOL);
    await placeBet(mid, drawBettor, Outcome.Draw, 1 * LAMPORTS_PER_SOL);

    const m: any = await program.account.market.fetch(market);
    assert.equal(m.totalHomePool.toNumber(), 2 * LAMPORTS_PER_SOL);
    assert.equal(m.totalAwayPool.toNumber(), 1 * LAMPORTS_PER_SOL);
    assert.equal(m.totalDrawPool.toNumber(), 1 * LAMPORTS_PER_SOL);

    const vaultBal = await provider.connection.getBalance(vaultPda(market));
    assert.equal(vaultBal, 4 * LAMPORTS_PER_SOL);

    const b: any = await program.account.bet.fetch(betPda(market, homeBettor.publicKey));
    assert.deepEqual(b.predictedOutcome, Outcome.Home);
    assert.equal(b.amount.toNumber(), 2 * LAMPORTS_PER_SOL);
    assert.isFalse(b.claimed);
  });

  it("3. rejects a bet placed after match start", async () => {
    const oracle = Keypair.generate();
    const mid = "TS_003";
    // Kickoff already passed.
    await createMarket(mid, "Germany", "England", now() - 100, oracle.publicKey);

    const bettor = await fundedWallet(5);
    try {
      await placeBet(mid, bettor, Outcome.Home, LAMPORTS_PER_SOL);
      assert.fail("expected BetAfterMatchStart");
    } catch (e: any) {
      assert.include(e.toString(), "BetAfterMatchStart");
    }
  });

  it("4. resolves a market with the oracle authority", async () => {
    const oracle = Keypair.generate();
    const mid = "TS_004";
    const market = await createMarket(mid, "Brazil", "Argentina", now() + 3600, oracle.publicKey);

    await resolve(mid, oracle, Outcome.Home);

    const m: any = await program.account.market.fetch(market);
    assert.isTrue(m.isSettled);
    assert.deepEqual(m.outcome, Outcome.Home);
  });

  it("5. rejects resolve from the wrong signer", async () => {
    const oracle = Keypair.generate();
    const imposter = await fundedWallet(5);
    const mid = "TS_005";
    const market = await createMarket(mid, "Brazil", "Argentina", now() + 3600, oracle.publicKey);

    try {
      await resolve(mid, imposter, Outcome.Home);
      assert.fail("expected UnauthorizedOracle");
    } catch (e: any) {
      // has_one mismatch surfaces as a constraint error / UnauthorizedOracle.
      assert.match(e.toString(), /UnauthorizedOracle|ConstraintHasOne|has one/i);
    }

    const m: any = await program.account.market.fetch(market);
    assert.isFalse(m.isSettled);
  });

  it("6 & 8. winner claims the correct proportional payout with 3% fee withheld", async () => {
    const oracle = Keypair.generate();
    const mid = "TS_006";
    const market = await createMarket(mid, "France", "Spain", now() + 3600, oracle.publicKey);

    const homeBettor = await fundedWallet(5); // winner
    const awayBettor = await fundedWallet(5);
    const drawBettor = await fundedWallet(5);
    await placeBet(mid, homeBettor, Outcome.Home, 2 * LAMPORTS_PER_SOL);
    await placeBet(mid, awayBettor, Outcome.Away, 1 * LAMPORTS_PER_SOL);
    await placeBet(mid, drawBettor, Outcome.Draw, 1 * LAMPORTS_PER_SOL);

    await resolve(mid, oracle, Outcome.Home);

    const vault = vaultPda(market);
    const vaultBefore = await provider.connection.getBalance(vault);

    await claim(mid, homeBettor);

    const vaultAfter = await provider.connection.getBalance(vault);
    const paid = vaultBefore - vaultAfter;

    // total=4, winning=2, bet=2 → gross = 4 SOL, net = 3.88 SOL, fee = 0.12 SOL.
    // Compute with BN in the SAME integer order as the program to avoid the JS
    // float precision loss on `bet * total * 9700` (which exceeds 2^53).
    const total = new BN(4 * LAMPORTS_PER_SOL);
    const winning = new BN(2 * LAMPORTS_PER_SOL);
    const bet = new BN(2 * LAMPORTS_PER_SOL);
    const gross = bet.mul(total).div(winning).toNumber();
    const expected = bet.mul(total).muln(9700).divn(10000).div(winning).toNumber();

    assert.equal(paid, expected, "payout must match the formula");
    assert.equal(vaultAfter, gross - expected, "3% fee must remain in the vault");
    assert.isAbove(gross - expected, 0, "fee must be non-zero");

    const b: any = await program.account.bet.fetch(betPda(market, homeBettor.publicKey));
    assert.isTrue(b.claimed);
  });

  it("7. rejects a double claim", async () => {
    const oracle = Keypair.generate();
    const mid = "TS_007";
    await createMarket(mid, "France", "Spain", now() + 3600, oracle.publicKey);

    const homeBettor = await fundedWallet(5);
    const awayBettor = await fundedWallet(5);
    await placeBet(mid, homeBettor, Outcome.Home, 2 * LAMPORTS_PER_SOL);
    await placeBet(mid, awayBettor, Outcome.Away, 1 * LAMPORTS_PER_SOL);
    await resolve(mid, oracle, Outcome.Home);

    await claim(mid, homeBettor); // first claim succeeds
    try {
      await claim(mid, homeBettor);
      assert.fail("expected AlreadyClaimed");
    } catch (e: any) {
      assert.include(e.toString(), "AlreadyClaimed");
    }
  });
});
