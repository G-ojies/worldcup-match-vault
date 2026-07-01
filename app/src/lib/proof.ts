/**
 * Convert TxLINE stat-validation proof JSON into on-chain `validate_stat` /
 * `resolve_market_trustless` args (browser-safe). Mapping per INTEGRATION.md §3:
 *   - JSON `subTreeProof`                  -> `fixture_proof`
 *   - JSON `summary.eventStatsSubTreeRoot` -> `fixture_summary.eventsSubTreeRoot`
 *   - stat_b reuses `eventStatRoot` (same key as stat_a) + `statToProve2`/`statProof2`
 */
import { BN } from "@anchor-lang/core";
import type { ProofNodeJson, StatValidation } from "./txlineTypes";

function b64ToBytes(b64: string): Uint8Array {
  if (typeof atob === "function") {
    const bin = atob(b64);
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  }
  // Node fallback (used by API routes / scripts)
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

export function toBytes32(value: number[] | string | Uint8Array): number[] {
  let bytes: Uint8Array;
  if (Array.isArray(value)) bytes = Uint8Array.from(value);
  else if (value instanceof Uint8Array) bytes = value;
  else if (value.startsWith("0x"))
    bytes = Uint8Array.from((value.slice(2).match(/.{1,2}/g) || []).map((h) => parseInt(h, 16)));
  else bytes = b64ToBytes(value);
  if (bytes.length !== 32) throw new Error(`Expected 32 bytes, got ${bytes.length}`);
  return Array.from(bytes);
}

export function toProofNodes(nodes: ProofNodeJson[]) {
  return (nodes || []).map((n) => ({
    hash: toBytes32(n.hash),
    isRightSibling: n.isRightSibling,
  }));
}

function statTerm(statToProve: any, eventStatRoot: number[] | string, statProof: ProofNodeJson[]) {
  return {
    statToProve, // { key, value, period }, passed untransformed
    eventStatRoot: toBytes32(eventStatRoot),
    statProof: toProofNodes(statProof),
  };
}

/** Settlement pieces for our `resolve_market_trustless(claimedOutcome, ts, fixtureSummary, fixtureProof, mainTreeProof, statHome, statAway)`. */
export interface SettlementProof {
  targetTs: number;
  ts: BN;
  fixtureSummary: any;
  fixtureProof: any[];
  mainTreeProof: any[];
  statHome: any; // StatTerm for the home goal stat
  statAway: any; // StatTerm for the away goal stat
  homeGoals: number;
  awayGoals: number;
}

/**
 * Build settlement pieces from a two-stat proof where `statKey = homeKey` and
 * `statKey2 = awayKey` (so statToProve = home goals, statToProve2 = away goals).
 */
export function buildSettlementProof(v: StatValidation): SettlementProof {
  if (!v.statToProve2 || !v.statProof2) {
    throw new Error("stat-validation response missing statToProve2/statProof2 (need statKey2)");
  }
  const targetTs = v.summary.updateStats.minTimestamp;
  const fixtureSummary = {
    fixtureId: new BN(v.summary.fixtureId),
    updateStats: {
      updateCount: v.summary.updateStats.updateCount,
      minTimestamp: new BN(v.summary.updateStats.minTimestamp),
      maxTimestamp: new BN(v.summary.updateStats.maxTimestamp),
    },
    eventsSubTreeRoot: toBytes32(v.summary.eventStatsSubTreeRoot),
  };
  return {
    targetTs,
    ts: new BN(targetTs),
    fixtureSummary,
    fixtureProof: toProofNodes(v.subTreeProof),
    mainTreeProof: toProofNodes(v.mainTreeProof),
    statHome: statTerm(v.statToProve, v.eventStatRoot, v.statProof),
    statAway: statTerm(v.statToProve2, v.eventStatRoot, v.statProof2),
    homeGoals: v.statToProve.value,
    awayGoals: v.statToProve2.value,
  };
}

/** epochDay (u16 LE seed) for the daily-scores PDA. */
export function epochDayFromMs(ms: number): number {
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export function outcomeFromGoals(home: number, away: number): "home" | "away" | "draw" {
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
}
