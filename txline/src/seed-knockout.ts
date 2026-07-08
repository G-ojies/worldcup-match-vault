/**
 * Seed prediction markets for the CURRENT World Cup knockout fixtures so the
 * live app reflects the matches being played right now (not the older group
 * stage). Each market is bound to its real fixture (correct goal-keys + a
 * settle_not_before gated to real full-time), so once a match finishes and its
 * scores Merkle root anchors on devnet, "Settle trustlessly" works on a
 * current fixture.
 *
 * Idempotent: markets use deterministic match_ids (WC_<fixtureId>_KO), so
 * re-runs skip fixtures that already have a market.
 * Run: npm run seed:ko   (from the txline/ package)
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
const WC = 72; // World Cup competitionId
const SKIP_FIXTURES = new Set([18172280]); // aged demo fixture kept by the retake cron

const BET_LAMPORTS = 0.02 * LAMPORTS_PER_SOL;
const FUND_LAMPORTS = 0.045 * LAMPORTS_PER_SOL;

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
      if (/already in use|custom program error: 0x0/i.test(msg)) throw e;
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
    return anchor.web3.sendAndConfirmTransaction(connection, tx, [payer], { commitment: "confirmed" });
  });
}
const exists = async (connection: Connection, acc: PublicKey) =>
  !!(await connection.getAccountInfo(acc));

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
    log(`   market ${matchId} already exists, skipping`);
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
  await fund(connection, admin, bettor.publicKey, FUND_LAMPORTS);
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
  return { sig };
}

async function main() {
  const connection = new Connection(RPC, "confirmed");
  const admin = loadMainWallet();
  log(`network : devnet`);
  log(`program : ${OUR_PROGRAM.toBase58()}`);
  log(`admin   : ${admin.publicKey.toBase58()}  (${sol(await connection.getBalance(admin.publicKey))} SOL)\n`);

  const tx = new TxlineClient();
  const fixtures = (await tx.getFixturesSnapshot(WC)).filter(
    (f) => f.CompetitionId === WC && !SKIP_FIXTURES.has(f.FixtureId)
  );
  // Play order: earliest kickoff first.
  fixtures.sort((a, b) => a.StartTime - b.StartTime);
  const nowSec = Math.floor(Date.now() / 1000);
  log(`${fixtures.length} current World Cup fixtures to seed:\n`);

  const results: any[] = [];
  for (const f of fixtures) {
    const home = f.Participant1IsHome ? f.Participant1 : f.Participant2;
    const away = f.Participant1IsHome ? f.Participant2 : f.Participant1;
    const matchId = `WC_${f.FixtureId}_KO`;
    const startSec = Math.floor(f.StartTime / 1000);
    // Keep betting open for the demo: real kickoff if it is still in the
    // future, otherwise a short synthetic window for already-started matches.
    const matchTs = startSec > nowSec + 1800 ? startSec : nowSec + 6 * 3600;
    const binding = {
      fixtureId: new BN(f.FixtureId),
      homeGoalKey: f.Participant1IsHome ? 1 : 2,
      awayGoalKey: f.Participant1IsHome ? 2 : 1,
      goalPeriod: 0,
      settleNotBefore: new BN(startSec + 8100), // real full-time gate (~135 min)
    };
    log(`== ${home} vs ${away}  (fixture ${f.FixtureId}, kickoff ${new Date(f.StartTime).toISOString()}) ==`);
    const m = await createMarket(connection, admin, matchId, home, away, matchTs, binding);
    const bets: any[] = [];
    if (m.createSig !== "(existing)") {
      bets.push({ outcome: "Home", ...(await placeBet(connection, admin, m.market, m.vault, { home: {} }, BET_LAMPORTS)) });
      bets.push({ outcome: "Away", ...(await placeBet(connection, admin, m.market, m.vault, { away: {} }, BET_LAMPORTS)) });
      bets.forEach((b) => log(`   place_bet ${b.outcome}  ${b.sig}`));
    }
    results.push({ matchId, home, away, createSig: m.createSig, bets });
    log("");
  }

  log("== SUMMARY ==");
  for (const r of results) {
    const state = r.createSig === "(existing)" ? "exists" : "created";
    log(`  ${state.padEnd(8)} ${r.matchId.padEnd(20)} ${r.home} vs ${r.away}  /market/${encodeURIComponent(r.matchId)}`);
  }
  log(`\nadmin balance now: ${sol(await connection.getBalance(admin.publicKey))} SOL`);
  log("✅ Knockout markets seeded — live app now shows the current World Cup matchups.");
}

main().catch((e) => {
  console.error("\n❌ seed:ko failed:", e?.message || e);
  if (e?.logs) console.error(e.logs.join("\n"));
  process.exit(1);
});
