/**
 * Auto-settle knockout markets trustlessly as their matches finish.
 *
 * For every unsettled WC_<fixtureId>_KO market whose settle_not_before has
 * passed, this: (1) finds the finalised score update, (2) fetches the live
 * 3-stage Merkle proof, (3) checks the TxLINE daily-scores root PDA is
 * anchored on devnet, (4) CPIs into validate_stat via resolve_market_trustless
 * to settle to the proven outcome — NO oracle authority.
 *
 * Safe to run on a cron: idempotent (skips already-settled), skips matches
 * that are not finished yet or whose root is not anchored, and isolates
 * per-market failures so one bad market never blocks the others.
 * Run: npm run settle:ko   (from the txline/ package)
 */
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, ComputeBudgetProgram } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { TxlineClient } from "./txline-client";
import { buildValidateStatArgs, epochDayFromMs } from "./proof";

const ourIdl = require("../../target/idl/worldcup_match_vault.json");
const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const OUR_PROGRAM = new PublicKey(ourIdl.address);
const TXLINE_PROGRAM = new PublicKey(
  process.env.TXLINE_PROGRAM_ID || "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"
);
// _K2 markets carry the corrected binding (goal-period 100 + 90-min finality
// gate). Old _KO markets were bound to period 0 and can never settle
// trustlessly, so they are intentionally excluded here.
const KO_RE = /^WC_\d+_K2$/;

const log = (...a: any[]) => console.log(...a);
const sol = (l: number) => (l / 1e9).toFixed(4);

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

/** GameState is unreliable — key off the game_finalised action, else the highest Seq with stats. */
function findFinalUpdate(updates: any[]): any | null {
  if (!updates?.length) return null;
  return (
    [...updates].reverse().find((u) => u.Action === "game_finalised" && u.Stats) ??
    [...updates].sort((a, b) => b.Seq - a.Seq).find((u) => u.Stats) ??
    null
  );
}
const outcomeArg = (h: number, a: number) =>
  h > a ? { home: {} } : h < a ? { away: {} } : { draw: {} };
const outcomeName = (h: number, a: number) => (h > a ? "Home" : h < a ? "Away" : "Draw");

async function settleOne(connection: Connection, admin: Keypair, prog: anchor.Program, m: any) {
  const a = m.account;
  const matchId: string = a.matchId;
  const fixtureId = Number(a.fixtureId);
  const homeKey = a.homeGoalKey;
  const awayKey = a.awayGoalKey;
  const nowSec = Math.floor(Date.now() / 1000);

  if (nowSec < Number(a.settleNotBefore)) {
    log(`  ⏳ ${matchId} (${a.homeTeam} v ${a.awayTeam}) — before settle window, skip`);
    return "waiting";
  }

  const tx = new TxlineClient();
  const updates = await tx.getScoresHistorical(fixtureId);
  const final = findFinalUpdate(updates);
  if (!final) {
    log(`  ⏳ ${matchId} (${a.homeTeam} v ${a.awayTeam}) — not finalised yet, skip`);
    return "waiting";
  }

  const validation = await tx.getStatValidation({
    fixtureId,
    seq: final.Seq,
    statKey: homeKey,
    statKey2: awayKey,
  });
  const homeGoals = validation.statToProve.value;
  const awayGoals = validation.statToProve2!.value;

  const built = buildValidateStatArgs(validation, {
    threshold: 0,
    comparison: { equalTo: {} }, // unused by resolve (predicate derived from outcome)
    twoStat: true,
    op: { subtract: {} },
  });
  const { fixtureSummary, fixtureProof, mainTreeProof, statA, statB, targetTs } = built.pieces;

  const epochDay = epochDayFromMs(targetTs);
  const [dailyPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("daily_scores_roots"), new BN(epochDay).toArrayLike(Buffer, "le", 2)],
    TXLINE_PROGRAM
  );
  if (!(await connection.getAccountInfo(dailyPda))) {
    log(
      `  🔒 ${matchId} (${a.homeTeam} ${homeGoals}-${awayGoals} ${a.awayTeam}) — daily-scores root not anchored on devnet (epochDay ${epochDay}), skip`
    );
    return "unanchored";
  }

  const cu = ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 });
  const sig = await prog.methods
    .resolveMarketTrustless(
      outcomeArg(homeGoals, awayGoals),
      new BN(targetTs),
      fixtureSummary,
      fixtureProof,
      mainTreeProof,
      statA,
      statB
    )
    .accounts({
      resolver: admin.publicKey,
      market: m.publicKey,
      dailyScoresMerkleRoots: dailyPda,
      txlineProgram: TXLINE_PROGRAM,
    })
    .preInstructions([cu])
    .rpc();

  const mkt: any = await prog.account.market.fetch(m.publicKey);
  const settled = Object.keys(mkt.outcome)[0];
  log(
    `  ✅ ${matchId} (${a.homeTeam} ${homeGoals}-${awayGoals} ${a.awayTeam}) → ${outcomeName(homeGoals, awayGoals)} settled=${mkt.isSettled} kind=${mkt.settlementKind}  ${sig}`
  );
  return "settled";
}

async function main() {
  const connection = new Connection(RPC, "confirmed");
  const admin = loadMainWallet();
  const prog = programFor(connection, admin);
  log(`network : devnet`);
  log(`admin   : ${admin.publicKey.toBase58()}  (${sol(await connection.getBalance(admin.publicKey))} SOL)`);

  const all: any[] = await prog.account.market.all();
  const targets = all.filter((m) => KO_RE.test(m.account.matchId) && !m.account.isSettled);
  log(`${targets.length} unsettled knockout market(s) to check\n`);

  const tally: Record<string, number> = {};
  for (const m of targets) {
    try {
      const r = await settleOne(connection, admin, prog, m);
      tally[r] = (tally[r] || 0) + 1;
    } catch (e: any) {
      tally.error = (tally.error || 0) + 1;
      log(`  ❌ ${m.account.matchId} — ${String(e?.message || e).slice(0, 140)}`);
    }
  }
  log(`\nsummary: ${JSON.stringify(tally)}  admin balance ${sol(await connection.getBalance(admin.publicKey))} SOL`);
}

main().catch((e) => {
  console.error("❌ settle:ko failed:", e?.message || e);
  process.exit(1);
});
