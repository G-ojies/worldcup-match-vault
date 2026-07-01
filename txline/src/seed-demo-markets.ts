/**
 * Seed demo markets on devnet so the demo video has a full story:
 *   1) ACTIVE market: upcoming fixture, two bets (Home/Away) → shows create + betting
 *   2) FINISHED+UNSETTLED market: bound to fixture 18172280, match_timestamp future
 *      (bets allowed) but settle_not_before in the past (trustless settle allowed now),
 *      Draw + Home bets, LEFT UNSETTLED so the demo can click "Settle trustlessly".
 *   3) The already-settled market from the e2e is left untouched (receipt demo).
 *
 * Idempotent: markets use deterministic match_ids, so re-runs skip existing ones.
 * Run: npm run seed   (from the txline/ package)
 */
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { TxlineClient } from "./txline-client";

const ourIdl = require("../../target/idl/worldcup_match_vault.json");
const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const OUR_PROGRAM = new PublicKey(ourIdl.address);
const FIXTURE_LIVE = 18172280; // Netherlands 1-1 Morocco (World Cup), finished

const log = (...a: any[]) => console.log(...a);
const sol = (l: number) => (l / LAMPORTS_PER_SOL).toFixed(4);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function loadMainWallet(): Keypair {
  const p = process.env.ANCHOR_WALLET || path.join(os.homedir(), ".config", "solana", "id.json");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(p, "utf8"))));
}
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

async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 5): Promise<T> {
  let last: any;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      last = e;
      const msg = String(e?.message || e);
      if (/already in use|custom program error: 0x0/i.test(msg)) throw e; // not transient
      log(`   …retry ${label} (${i + 1}/${tries}): ${msg.slice(0, 80)}`);
      await sleep(2500 * (i + 1));
    }
  }
  throw last;
}

async function fund(connection: Connection, payer: Keypair, to: PublicKey, lamports: number) {
  return withRetry("fund", () => {
    const tx = new Transaction().add(
      SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: to, lamports })
    );
    return anchor.web3.sendAndConfirmTransaction(connection, tx, [payer], {
      commitment: "confirmed",
    });
  });
}

async function exists(connection: Connection, acc: PublicKey): Promise<boolean> {
  return !!(await connection.getAccountInfo(acc));
}

async function createMarket(
  connection: Connection,
  admin: Keypair,
  matchId: string,
  home: string,
  away: string,
  matchTs: number,
  binding: any
) {
  const market = marketPda(matchId);
  const vault = vaultPda(market);
  if (await exists(connection, market)) {
    log(`   market ${matchId} already exists, skipping create`);
    return { market, vault, createSig: "(existing)" };
  }
  const prog = programFor(connection, admin);
  const createSig = await withRetry("create_market", () =>
    prog.methods
      .createMarket(matchId, home, away, new BN(matchTs), admin.publicKey, binding)
      .accounts({ admin: admin.publicKey, market, vault, systemProgram: SystemProgram.programId })
      .rpc()
  );
  log(`   create_market ${matchId}  ${createSig}`);
  return { market, vault, createSig };
}

async function placeBet(
  connection: Connection,
  admin: Keypair,
  market: PublicKey,
  vault: PublicKey,
  outcome: any,
  lamports: number
) {
  const bettor = Keypair.generate();
  await fund(connection, admin, bettor.publicKey, 0.12 * LAMPORTS_PER_SOL);
  const sig = await withRetry("place_bet", () =>
    programFor(connection, bettor)
      .methods.placeBet(outcome, new BN(lamports))
      .accounts({
        bettor: bettor.publicKey,
        market,
        vault,
        bet: betPda(market, bettor.publicKey),
        systemProgram: SystemProgram.programId,
      })
      .rpc()
  );
  return { sig, bettor: bettor.publicKey.toBase58() };
}

async function main() {
  const connection = new Connection(RPC, "confirmed");
  const admin = loadMainWallet();
  log(`network : devnet`);
  log(`program : ${OUR_PROGRAM.toBase58()}`);
  log(`admin   : ${admin.publicKey.toBase58()}  (${sol(await connection.getBalance(admin.publicKey))} SOL)\n`);

  const tx = new TxlineClient();
  const fixtures = await tx.getFixturesSnapshot();
  const nowSec = Math.floor(Date.now() / 1000);
  const nowMs = Date.now();
  const results: any[] = [];

  // ---------- 1) ACTIVE market (upcoming fixture, betting demo) ----------
  log("== 1) ACTIVE market (betting demo) ==");
  const upcoming =
    fixtures
      .filter((f) => f.StartTime > nowMs)
      .sort(
        (a, b) =>
          (a.Competition === "World Cup" ? -1 : 0) - (b.Competition === "World Cup" ? -1 : 0) ||
          a.StartTime - b.StartTime
      )[0] || fixtures[0];
  const upHome = upcoming.Participant1IsHome ? upcoming.Participant1 : upcoming.Participant2;
  const upAway = upcoming.Participant1IsHome ? upcoming.Participant2 : upcoming.Participant1;
  const upMatchId = `WC_${upcoming.FixtureId}_UPCOMING`;
  log(`   fixture ${upcoming.FixtureId} ${upHome} vs ${upAway} (${upcoming.Competition}), kickoff ${new Date(upcoming.StartTime).toISOString()}`);
  const upBinding = {
    fixtureId: new BN(upcoming.FixtureId),
    homeGoalKey: upcoming.Participant1IsHome ? 1 : 2,
    awayGoalKey: upcoming.Participant1IsHome ? 2 : 1,
    goalPeriod: 0,
    settleNotBefore: new BN(Math.floor(upcoming.StartTime / 1000) + 8100),
  };
  const up = await createMarket(
    connection,
    admin,
    upMatchId,
    upHome,
    upAway,
    Math.floor(upcoming.StartTime / 1000),
    upBinding
  );
  const upBets: any[] = [];
  if (up.createSig !== "(existing)") {
    upBets.push({ outcome: "Home", ...(await placeBet(connection, admin, up.market, up.vault, { home: {} }, 0.03 * LAMPORTS_PER_SOL)) });
    upBets.push({ outcome: "Away", ...(await placeBet(connection, admin, up.market, up.vault, { away: {} }, 0.03 * LAMPORTS_PER_SOL)) });
    upBets.forEach((b) => log(`   place_bet ${b.outcome}  ${b.sig}`));
  }
  results.push({ kind: "ACTIVE (betting)", matchId: upMatchId, market: up.market, createSig: up.createSig, bets: upBets });

  // ---------- 2) FINISHED + UNSETTLED market (live settle demo) ----------
  log("\n== 2) FINISHED + UNSETTLED market (live trustless-settle demo) ==");
  const fxLive = fixtures.find((f) => f.FixtureId === FIXTURE_LIVE);
  const p1Home = fxLive ? fxLive.Participant1IsHome : true;
  const liveHome = fxLive ? (p1Home ? fxLive.Participant1 : fxLive.Participant2) : "Netherlands";
  const liveAway = fxLive ? (p1Home ? fxLive.Participant2 : fxLive.Participant1) : "Morocco";
  const liveMatchId = `WC_${FIXTURE_LIVE}_LIVE`;
  const liveBinding = {
    fixtureId: new BN(FIXTURE_LIVE),
    homeGoalKey: p1Home ? 1 : 2,
    awayGoalKey: p1Home ? 2 : 1,
    goalPeriod: 0,
    settleNotBefore: new BN(nowSec - 3600), // past → settlement allowed now
  };
  const live = await createMarket(
    connection,
    admin,
    liveMatchId,
    liveHome,
    liveAway,
    nowSec + 24 * 3600, // future → betting allowed
    liveBinding
  );
  const liveBets: any[] = [];
  if (live.createSig !== "(existing)") {
    liveBets.push({ outcome: "Draw (will win)", ...(await placeBet(connection, admin, live.market, live.vault, { draw: {} }, 0.05 * LAMPORTS_PER_SOL)) });
    liveBets.push({ outcome: "Home (will lose)", ...(await placeBet(connection, admin, live.market, live.vault, { home: {} }, 0.05 * LAMPORTS_PER_SOL)) });
    liveBets.forEach((b) => log(`   place_bet ${b.outcome}  ${b.sig}`));
  }
  results.push({ kind: "FINISHED+UNSETTLED (live settle)", matchId: liveMatchId, market: live.market, createSig: live.createSig, bets: liveBets });

  // ---------- enumerate every market for the report ----------
  log("\n== All markets on-chain ==");
  const prog = programFor(connection, admin);
  const all: any[] = await prog.account.market.all();
  for (const m of all) {
    const a = m.account;
    const outcome = Object.keys(a.outcome)[0];
    const pools = `H ${sol(a.totalHomePool.toNumber())} / D ${sol(a.totalDrawPool.toNumber())} / A ${sol(a.totalAwayPool.toNumber())}`;
    log(
      `  ${a.matchId.padEnd(26)} fixture=${a.fixtureId.toString().padEnd(9)} settled=${a.isSettled} kind=${a.settlementKind} outcome=${outcome}  pools[${pools}]  url=/market/${encodeURIComponent(a.matchId)}`
    );
  }

  log(`\nadmin balance now: ${sol(await connection.getBalance(admin.publicKey))} SOL`);
  log("\nSEED SUMMARY:");
  for (const r of results) {
    log(`  ${r.kind}`);
    log(`    match_id : ${r.matchId}`);
    log(`    url      : /market/${encodeURIComponent(r.matchId)}`);
    log(`    create   : ${r.createSig}`);
    r.bets.forEach((b: any) => log(`    bet ${b.outcome}: ${b.sig}`));
  }
  log("\n✅ Demo markets seeded. Market #2 is UNSETTLED + bound to fixture 18172280. Click 'Settle trustlessly' in the demo.");
}

main().catch((e) => {
  console.error("\n❌ seed failed:", e?.message || e);
  if (e?.logs) console.error(e.logs.join("\n"));
  process.exit(1);
});
