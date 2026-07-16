/**
 * READ-ONLY. Lists every unsettled market and reports, for each: real result,
 * whether the match is finalised, and whether its daily-scores root is anchored
 * on devnet (which decides trustless kind=2 vs oracle kind=1). No transactions.
 * Run: npm run probe:stuck   (from txline/)
 */
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { TxlineClient } from "./txline-client";
import { buildValidateStatArgs, epochDayFromMs } from "./proof";

const ourIdl = require("../../target/idl/worldcup_match_vault.json");
const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const TXLINE_PROGRAM = new PublicKey(
  process.env.TXLINE_PROGRAM_ID || "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"
);
const log = (...a: any[]) => console.log(...a);

function loadWallet(): Keypair {
  const p = process.env.ANCHOR_WALLET || path.join(os.homedir(), ".config", "solana", "id.json");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(p, "utf8"))));
}
function findFinalUpdate(updates: any[]): any | null {
  if (!updates?.length) return null;
  return (
    [...updates].reverse().find((u) => u.Action === "game_finalised" && u.Stats) ??
    [...updates].sort((a, b) => b.Seq - a.Seq).find((u) => u.Stats) ??
    null
  );
}
const name = (h: number, a: number) => (h > a ? "Home" : h < a ? "Away" : "Draw");

async function main() {
  const connection = new Connection(RPC, "confirmed");
  const admin = loadWallet();
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(admin), { commitment: "confirmed" });
  const prog = new anchor.Program(ourIdl as anchor.Idl, provider);

  const all: any[] = await prog.account.market.all();
  const unsettled = all.filter((m) => !m.account.isSettled);
  log(`admin ${admin.publicKey.toBase58()}  balance ${(await connection.getBalance(admin.publicKey)) / 1e9} SOL`);
  log(`${unsettled.length} unsettled market(s):\n`);

  for (const m of unsettled) {
    const a = m.account;
    const matchId = a.matchId;
    const fixtureId = Number(a.fixtureId);
    let line = `  ${matchId.padEnd(22)} ${a.homeTeam} v ${a.awayTeam}  fixt=${fixtureId} period=${a.goalPeriod}`;
    try {
      const tx = new TxlineClient();
      const updates = await tx.getScoresHistorical(fixtureId);
      const final = findFinalUpdate(updates);
      if (!final) {
        log(line + "  → NOT FINALISED (still upcoming/live)");
        continue;
      }
      const v = await tx.getStatValidation({ fixtureId, seq: final.Seq, statKey: a.homeGoalKey, statKey2: a.awayGoalKey });
      const hg = v.statToProve.value;
      const ag = v.statToProve2!.value;
      const built = buildValidateStatArgs(v, { threshold: 0, comparison: { equalTo: {} }, twoStat: true, op: { subtract: {} } });
      const epochDay = epochDayFromMs(built.pieces.targetTs);
      const [dailyPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("daily_scores_roots"), new BN(epochDay).toArrayLike(Buffer, "le", 2)],
        TXLINE_PROGRAM
      );
      const anchored = !!(await connection.getAccountInfo(dailyPda));
      log(line + `  → ${hg}-${ag} ${name(hg, ag)}  root(day ${epochDay})=${anchored ? "ANCHORED → trustless" : "not anchored → oracle only"}`);
    } catch (e: any) {
      log(line + `  → ERROR ${String(e?.message || e).slice(0, 80)}`);
    }
  }
}
main().catch((e) => { console.error("probe failed:", e?.message || e); process.exit(1); });
