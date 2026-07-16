import { useCallback, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { betPda, marketPda, outcomeFromAccount, type Outcome } from "@/lib/anchor";
import { useProgram } from "./useWallet";

// Demo fixtures whose score history has aged out of the TxLINE devnet feed
// (verified: 0 score + 0 odds updates). Their matches can never finalise or
// settle, so their unsettled markets are hidden to avoid a permanent
// "Awaiting result" on finished matches. Settled receipts still show.
const AGED_OUT_FIXTURES = new Set<number>([18172280, 18179764, 18175397]);

export interface MarketView {
  pubkey: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  matchTimestamp: number;
  outcome: Outcome;
  totalHome: number;
  totalAway: number;
  totalDraw: number;
  totalPool: number;
  oracleAuthority: string;
  isSettled: boolean;
  // TxLINE binding + settlement provenance.
  fixtureId: number;
  homeGoalKey: number;
  awayGoalKey: number;
  goalPeriod: number;
  settleNotBefore: number;
  /** 0 = unsettled, 1 = oracle, 2 = trustless TxLINE Merkle proof. */
  settlementKind: number;
}

export interface BetView {
  pubkey: string;
  predictedOutcome: Outcome;
  amount: number;
  claimed: boolean;
}

function normalize(pubkey: PublicKey, acc: any): MarketView {
  const totalHome = Number(acc.totalHomePool);
  const totalAway = Number(acc.totalAwayPool);
  const totalDraw = Number(acc.totalDrawPool);
  return {
    pubkey: pubkey.toBase58(),
    matchId: acc.matchId,
    homeTeam: acc.homeTeam,
    awayTeam: acc.awayTeam,
    matchTimestamp: Number(acc.matchTimestamp),
    outcome: outcomeFromAccount(acc.outcome),
    totalHome,
    totalAway,
    totalDraw,
    totalPool: totalHome + totalAway + totalDraw,
    oracleAuthority: acc.oracleAuthority.toBase58(),
    isSettled: acc.isSettled,
    fixtureId: Number(acc.fixtureId),
    homeGoalKey: Number(acc.homeGoalKey),
    awayGoalKey: Number(acc.awayGoalKey),
    goalPeriod: Number(acc.goalPeriod),
    settleNotBefore: Number(acc.settleNotBefore),
    settlementKind: Number(acc.settlementKind),
  };
}

/** Fetch all markets in the program. */
export function useMarkets() {
  const { program } = useProgram();
  const [markets, setMarkets] = useState<MarketView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await (program.account as any).market.all();
      const views = all
        .map((a: any) => normalize(a.publicKey, a.account))
        // Hide the superseded first-gen knockout markets (WC_<id>_KO). They were
        // bound to goal-period 0 and cannot settle trustlessly; the _K2 markets
        // carry the corrected binding and replace them one-for-one.
        .filter((m: MarketView) => !/^WC_\d+_KO$/.test(m.matchId))
        // Hide the aged-out demo markets. These fixtures have been purged from
        // the TxLINE devnet feed (0 score updates), so their matches can never
        // finalise or settle — leaving them visible showed "Awaiting result"
        // forever on ended matches. Settled receipts for these fixtures still
        // show (only unsettled dead markets are hidden).
        .filter((m: MarketView) => !(AGED_OUT_FIXTURES.has(m.fixtureId) && !m.isSettled))
        .sort((a: MarketView, b: MarketView) => a.matchTimestamp - b.matchTimestamp);
      setMarkets(views);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load markets");
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { markets, loading, error, refresh };
}

/** Fetch a single market by its match id. */
export function useMarket(matchId: string | undefined) {
  const { program } = useProgram();
  const [market, setMarket] = useState<MarketView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!matchId) return;
    setLoading(true);
    setError(null);
    try {
      const pda = marketPda(matchId);
      const acc = await (program.account as any).market.fetch(pda);
      setMarket(normalize(pda, acc));
    } catch (e: any) {
      setError(e?.message ?? "Market not found");
      setMarket(null);
    } finally {
      setLoading(false);
    }
  }, [program, matchId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { market, loading, error, refresh };
}

/** Fetch the connected wallet's bet on a given market (if any). */
export function useMyBet(marketPubkey: string | undefined, bettor: PublicKey | null) {
  const { program } = useProgram();
  const [bet, setBet] = useState<BetView | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!marketPubkey || !bettor) {
      setBet(null);
      return;
    }
    setLoading(true);
    try {
      const pda = betPda(new PublicKey(marketPubkey), bettor);
      const acc = await (program.account as any).bet.fetchNullable(pda);
      setBet(
        acc
          ? {
              pubkey: pda.toBase58(),
              predictedOutcome: outcomeFromAccount(acc.predictedOutcome),
              amount: Number(acc.amount),
              claimed: acc.claimed,
            }
          : null
      );
    } finally {
      setLoading(false);
    }
  }, [program, marketPubkey, bettor]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { bet, loading, refresh };
}
