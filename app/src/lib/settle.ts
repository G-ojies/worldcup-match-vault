/**
 * Trustless settlement helpers mirror the proven devnet e2e
 * (`txline/src/devnet-trustless-e2e.ts`) translated to the app's
 * `@anchor-lang/core` Program client. No oracle authority is involved:
 * the proof is verified on-chain against TxLINE's daily-scores Merkle root.
 */
import { PublicKey, ComputeBudgetProgram } from "@solana/web3.js";
import { BN, outcomeArg, type Outcome } from "@/lib/anchor";
import {
  buildSettlementProof,
  epochDayFromMs,
  outcomeFromGoals,
  type SettlementProof,
} from "@/lib/proof";
import { fetchScores, fetchStatValidation } from "@/lib/txline";
import type { ScoreUpdate, StatValidation } from "@/lib/txlineTypes";

/** TxLINE program that owns the daily-scores Merkle roots (devnet). */
export const TXLINE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_TXLINE_PROGRAM_ID ??
    "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"
);

export type ResolvedOutcome = Exclude<Outcome, "unresolved">;

/** Daily-scores root PDA for the epoch day containing `targetTs` (seconds). */
export function dailyScoresPda(targetTs: number): PublicKey {
  const epochDay = epochDayFromMs(targetTs);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("daily_scores_roots"), new BN(epochDay).toArrayLike(Buffer, "le", 2)],
    TXLINE_PROGRAM_ID
  )[0];
}

/**
 * Locate the finalised score update. `GameState` is unreliable, so we key off
 * the `game_finalised` action (latest one with stats), falling back to the
 * highest `Seq` carrying a stats map.
 */
export function findFinalUpdate(updates: ScoreUpdate[]): ScoreUpdate | null {
  if (!updates?.length) return null;
  return (
    [...updates].reverse().find((u) => u.Action === "game_finalised" && u.Stats) ??
    [...updates].sort((a, b) => b.Seq - a.Seq).find((u) => u.Stats) ??
    null
  );
}

export interface BuiltSettlement {
  fixtureId: number;
  seq: number;
  validation: StatValidation;
  proof: SettlementProof;
  outcome: ResolvedOutcome;
  homeGoals: number;
  awayGoals: number;
  dailyPda: PublicKey;
  epochDay: number;
}

/**
 * Fetch the live TxLINE proof for a finished fixture and assemble every piece
 * `resolve_market_trustless` needs. `statKey = homeGoalKey` so `statToProve`
 * is the home goals leaf and `statToProve2` the away goals leaf.
 */
export async function buildSettlement(args: {
  fixtureId: number;
  homeGoalKey: number;
  awayGoalKey: number;
  mode?: "historical" | "snapshot";
}): Promise<BuiltSettlement> {
  const updates = await fetchScores(args.fixtureId, args.mode ?? "historical");
  const final = findFinalUpdate(updates);
  if (!final) {
    throw new Error("No finalised score update found for this fixture yet.");
  }
  const validation = await fetchStatValidation({
    fixtureId: args.fixtureId,
    seq: final.Seq,
    statKey: args.homeGoalKey,
    statKey2: args.awayGoalKey,
  });
  const proof = buildSettlementProof(validation);
  const outcome = outcomeFromGoals(proof.homeGoals, proof.awayGoals);
  return {
    fixtureId: args.fixtureId,
    seq: final.Seq,
    validation,
    proof,
    outcome,
    homeGoals: proof.homeGoals,
    awayGoals: proof.awayGoals,
    dailyPda: dailyScoresPda(proof.targetTs),
    epochDay: epochDayFromMs(proof.targetTs),
  };
}

/**
 * Send `resolve_market_trustless`, mirroring the canonical devnet e2e call:
 * a 1.4M-CU budget for the Merkle CPI, the four required accounts, and the
 * outcome derived purely from the proven goals.
 */
export async function resolveMarketTrustless(
  program: any,
  args: { market: PublicKey; resolver: PublicKey; built: BuiltSettlement }
): Promise<string> {
  const { proof, outcome, dailyPda } = args.built;
  const cu = ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 });
  return program.methods
    .resolveMarketTrustless(
      outcomeArg(outcome),
      proof.ts,
      proof.fixtureSummary,
      proof.fixtureProof,
      proof.mainTreeProof,
      proof.statHome,
      proof.statAway
    )
    .accounts({
      resolver: args.resolver,
      market: args.market,
      dailyScoresMerkleRoots: dailyPda,
      txlineProgram: TXLINE_PROGRAM_ID,
    })
    .preInstructions([cu])
    .rpc();
}
