import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import type { Outcome } from "./anchor";

export const lamportsToSol = (lamports: number | bigint): number =>
  Number(lamports) / LAMPORTS_PER_SOL;

export const fmtSol = (lamports: number | bigint, dp = 2): string =>
  `${lamportsToSol(lamports).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: dp,
  })} SOL`;

/** Decimal odds derived from pool ratios: odds = totalPool / outcomePool. */
export const odds = (total: number, pool: number): string =>
  pool > 0 ? (total / pool).toFixed(2) : "—";

export const OUTCOME_LABEL: Record<Outcome, string> = {
  home: "Home",
  away: "Away",
  draw: "Draw",
  unresolved: "Unresolved",
};

export const OUTCOME_COLOR: Record<Outcome, string> = {
  home: "text-home",
  away: "text-away",
  draw: "text-draw",
  unresolved: "text-white/60",
};

export const OUTCOME_BG: Record<Outcome, string> = {
  home: "bg-home",
  away: "bg-away",
  draw: "bg-draw",
  unresolved: "bg-white/20",
};

export function timeToKickoff(ts: number): string {
  const diff = ts - Math.floor(Date.now() / 1000);
  if (diff <= 0) return "Kicked off";
  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export const shortKey = (k: string): string => `${k.slice(0, 4)}…${k.slice(-4)}`;

/** Settlement provenance for a market (matches the on-chain `settlement_kind` u8). */
export type SettlementKind = "trustless" | "oracle" | "unsettled";

export function settlementKind(kind: number, isSettled: boolean): SettlementKind {
  if (kind === 2) return "trustless";
  if (kind === 1 || (isSettled && kind === 0)) return "oracle";
  return "unsettled";
}

export const SETTLEMENT_LABEL: Record<SettlementKind, string> = {
  trustless: "Trustless TxLINE proof",
  oracle: "Oracle",
  unsettled: "Not settled",
};
