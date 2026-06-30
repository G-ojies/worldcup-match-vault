/**
 * Convert TxLINE stat-validation proof JSON into on-chain `validate_stat` args.
 * Mapping per INTEGRATION.md §3 — mind the key-name gotchas:
 *   - JSON `subTreeProof`            -> arg `fixture_proof`
 *   - JSON `summary.eventStatsSubTreeRoot` -> `fixture_summary.eventsSubTreeRoot`
 *   - stat_b reuses `eventStatRoot` (same key as stat_a) + `statToProve2` / `statProof2`
 */
import { BN } from "@coral-xyz/anchor";
import type { ProofNodeJson, StatValidation } from "./txline-client";

export function toBytes32(value: number[] | string | Uint8Array): number[] {
  let bytes: Uint8Array;
  if (Array.isArray(value)) bytes = Uint8Array.from(value);
  else if (value instanceof Uint8Array) bytes = value;
  else if (value.startsWith("0x")) bytes = Uint8Array.from(Buffer.from(value.slice(2), "hex"));
  else bytes = Uint8Array.from(Buffer.from(value, "base64"));
  if (bytes.length !== 32) throw new Error(`Expected 32 bytes, got ${bytes.length}`);
  return Array.from(bytes);
}

export function toProofNodes(nodes: ProofNodeJson[]) {
  return (nodes || []).map((n) => ({
    hash: toBytes32(n.hash),
    isRightSibling: n.isRightSibling,
  }));
}

export type ComparisonArg =
  | { greaterThan: {} }
  | { lessThan: {} }
  | { equalTo: {} };
export type OpArg = { add: {} } | { subtract: {} } | null;

export interface BuildOpts {
  threshold: number;
  comparison: ComparisonArg;
  /** include the second stat (statToProve2/statProof2) and an operator */
  twoStat?: boolean;
  op?: OpArg;
}

/** A StatTerm built from the proof JSON. */
function statTerm(statToProve: any, eventStatRoot: number[] | string, statProof: ProofNodeJson[]) {
  return {
    statToProve, // { key:u32, value:i32, period:i32 } — passed untransformed
    eventStatRoot: toBytes32(eventStatRoot),
    statProof: toProofNodes(statProof),
  };
}

/**
 * Returns the positional argument tuple for
 * `program.methods.validateStat(...args)` in IDL order:
 *   (ts, fixtureSummary, fixtureProof, mainTreeProof, predicate, statA, statB, op)
 */
export function buildValidateStatArgs(v: StatValidation, opts: BuildOpts) {
  const targetTs = v.summary.updateStats.minTimestamp; // also drives epochDay

  const fixtureSummary = {
    fixtureId: new BN(v.summary.fixtureId),
    updateStats: {
      updateCount: v.summary.updateStats.updateCount,
      minTimestamp: new BN(v.summary.updateStats.minTimestamp),
      maxTimestamp: new BN(v.summary.updateStats.maxTimestamp),
    },
    eventsSubTreeRoot: toBytes32(v.summary.eventStatsSubTreeRoot),
  };

  const fixtureProof = toProofNodes(v.subTreeProof); // ⚠ subTreeProof -> fixture_proof
  const mainTreeProof = toProofNodes(v.mainTreeProof);

  const statA = statTerm(v.statToProve, v.eventStatRoot, v.statProof);

  const predicate = { threshold: opts.threshold, comparison: opts.comparison };

  let statB: any = null;
  let op: OpArg = null;
  if (opts.twoStat) {
    if (!v.statToProve2 || !v.statProof2) throw new Error("twoStat requested but statToProve2/statProof2 missing");
    statB = statTerm(v.statToProve2, v.eventStatRoot, v.statProof2); // ⚠ reuses eventStatRoot
    op = opts.op ?? { subtract: {} };
  }

  return {
    targetTs,
    args: [new BN(targetTs), fixtureSummary, fixtureProof, mainTreeProof, predicate, statA, statB, op] as const,
    // expose the raw pieces too (used by the on-chain settlement client)
    pieces: { targetTs, fixtureSummary, fixtureProof, mainTreeProof, statA, statB, op, predicate },
  };
}

/** Daily-scores PDA seed value: 2-byte LE u16 epochDay = floor(minTs_ms / 86400000). */
export function epochDayFromMs(ms: number): number {
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}
