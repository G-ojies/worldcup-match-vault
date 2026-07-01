/**
 * Live proof: fetch a real TxLINE stat-validation proof for a finished fixture
 * and verify it on devnet via the TxLINE program's `validate_stat` (read-only
 * `.view()`), confirming the boolean result matches the real final score.
 */
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { TxlineClient } from "./txline-client";
import { buildValidateStatArgs, epochDayFromMs, ComparisonArg } from "./proof";

const IDL = require("../txline_devnet.idl.json");
const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

function loadWallet(): Keypair {
  const p = process.env.ANCHOR_WALLET || path.join(os.homedir(), ".config", "solana", "id.json");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(p, "utf8"))));
}

async function main() {
  const tx = new TxlineClient();
  console.log(`network=${tx.creds.apiOrigin}`);

  // 1. Find a finished fixture (StartTime in the past) with a game_finalised action.
  const fixtures = await tx.getFixturesSnapshot();
  const now = Date.now();
  const past = fixtures.filter((f) => f.StartTime < now).sort((a, b) => b.StartTime - a.StartTime);
  if (!past.length) throw new Error("No past fixtures available in the free-tier feed right now.");

  let chosen: { fixtureId: number; seq: number; p1: number; p2: number; home1: boolean } | null = null;
  for (const f of past) {
    const updates = await tx.getScoresSnapshot(f.FixtureId);
    const finalUpdate =
      [...updates].reverse().find((u) => u.Action === "game_finalised" && u.Stats) ||
      [...updates].sort((a, b) => b.Seq - a.Seq).find((u) => u.Stats);
    if (!finalUpdate || !finalUpdate.Stats) continue;
    const p1 = Number(finalUpdate.Stats["1"] ?? 0); // Participant1 total goals
    const p2 = Number(finalUpdate.Stats["2"] ?? 0); // Participant2 total goals
    chosen = { fixtureId: f.FixtureId, seq: finalUpdate.Seq, p1, p2, home1: f.Participant1IsHome };
    console.log(
      `\nfixture ${f.FixtureId}: ${f.Participant1} ${p1}-${p2} ${f.Participant2} ` +
        `(seq ${finalUpdate.Seq}, P1IsHome=${f.Participant1IsHome}) ${f.Competition}`
    );
    break;
  }
  if (!chosen) throw new Error("No finished fixture with a goals stat found.");

  // home/away mapping: statKey 1 = P1 goals, statKey 2 = P2 goals.
  const homeKey = chosen.home1 ? 1 : 2;
  const awayKey = chosen.home1 ? 2 : 1;
  const homeGoals = chosen.home1 ? chosen.p1 : chosen.p2;
  const awayGoals = chosen.home1 ? chosen.p2 : chosen.p1;
  const realOutcome = homeGoals > awayGoals ? "Home" : homeGoals < awayGoals ? "Away" : "Draw";
  console.log(`home=${homeGoals} away=${awayGoals} -> real regulation outcome: ${realOutcome}`);

  // 2. Fetch the two-stat proof: home goals (statKey) and away goals (statKey2).
  const validation = await tx.getStatValidation({
    fixtureId: chosen.fixtureId,
    seq: chosen.seq,
    statKey: homeKey,
    statKey2: awayKey,
  });
  console.log(
    `proof: statToProve=${JSON.stringify(validation.statToProve)} ` +
      `statToProve2=${JSON.stringify(validation.statToProve2)} ` +
      `proofNodes(sub/main/stat)=${validation.subTreeProof.length}/${validation.mainTreeProof.length}/${validation.statProof.length}`
  );

  // 3. Build a read-only Program on devnet and the daily-scores PDA.
  const connection = new Connection(RPC, "confirmed");
  const wallet = new anchor.Wallet(loadWallet());
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  const program = new anchor.Program(IDL as anchor.Idl, provider);

  const epochDay = epochDayFromMs(validation.summary.updateStats.minTimestamp);
  const [dailyScoresPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("daily_scores_roots"), new BN(epochDay).toArrayLike(Buffer, "le", 2)],
    program.programId
  );
  const pdaInfo = await connection.getAccountInfo(dailyScoresPda);
  console.log(
    `epochDay=${epochDay} dailyScoresPda=${dailyScoresPda.toBase58()} ` +
      `exists=${!!pdaInfo} size=${pdaInfo?.data.length ?? 0}`
  );

  // 4. Try each comparison on (home - away) and report the boolean.
  const cu = ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 });
  const comparisons: Array<[string, ComparisonArg]> = [
    ["GreaterThan (Home)", { greaterThan: {} }],
    ["LessThan (Away)", { lessThan: {} }],
    ["EqualTo (Draw)", { equalTo: {} }],
  ];
  const results: Record<string, boolean | string> = {};
  for (const [label, comparison] of comparisons) {
    const { args } = buildValidateStatArgs(validation, {
      threshold: 0,
      comparison,
      twoStat: true,
      op: { subtract: {} },
    });
    try {
      const ok = await program.methods
        .validateStat(...(args as any))
        .accounts({ dailyScoresMerkleRoots: dailyScoresPda })
        .preInstructions([cu])
        .view();
      results[label] = ok;
      console.log(`  ${label}: ${ok}`);
    } catch (e: any) {
      results[label] = `ERR ${e?.message?.slice(0, 160) || e}`;
      console.log(`  ${label}: ERR ${(e?.message || e).toString().slice(0, 200)}`);
    }
  }

  // 5. Cross-check.
  const provenOutcome =
    results["GreaterThan (Home)"] === true
      ? "Home"
      : results["LessThan (Away)"] === true
      ? "Away"
      : results["EqualTo (Draw)"] === true
      ? "Draw"
      : "UNDETERMINED";
  console.log(`\nproven on-chain outcome = ${provenOutcome}; real outcome = ${realOutcome}`);
  console.log(provenOutcome === realOutcome ? "✅ MATCH trustless settlement verified live" : "⚠️ mismatch / undetermined");
}

main().catch((e) => {
  console.error("probe failed:", e?.response?.data || e?.message || e);
  process.exit(1);
});
