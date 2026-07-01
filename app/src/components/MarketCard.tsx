import Link from "next/link";
import type { MarketView } from "@/hooks/useMarkets";
import { fmtSol, OUTCOME_LABEL, timeToKickoff } from "@/lib/format";
import PoolBars from "./PoolBars";

export default function MarketCard({ market }: { market: MarketView }) {
  const kickoff = timeToKickoff(market.matchTimestamp);
  const started = market.matchTimestamp <= Math.floor(Date.now() / 1000);
  const trustless = market.isSettled && market.settlementKind === 2;

  return (
    <Link
      href={`/market/${encodeURIComponent(market.matchId)}`}
      className="card group block p-5 transition hover:border-turf-500/30 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-950"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="truncate font-mono text-xs text-white/40">{market.matchId}</span>
        {market.isSettled ? (
          <span className="flex shrink-0 items-center gap-1.5">
            {trustless && (
              <span
                className="pill bg-turf-500/15 text-turf-400"
                title="Settled trustlessly from TxLINE's onchain Merkle root"
              >
                ◈ Trustless
              </span>
            )}
            <span className="pill bg-gold-500/15 text-gold-400">
              Settled · {OUTCOME_LABEL[market.outcome]}
            </span>
          </span>
        ) : started ? (
          <span className="pill bg-white/10 text-white/60">Awaiting result</span>
        ) : (
          <span className="pill bg-turf-500/15 text-turf-400">Live · {kickoff}</span>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-lg font-semibold text-white">{market.homeTeam}</span>
        <span className="text-xs font-medium text-white/30">vs</span>
        <span className="text-lg font-semibold text-white">{market.awayTeam}</span>
      </div>

      <PoolBars home={market.totalHome} away={market.totalAway} draw={market.totalDraw} compact />

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-white/45">
        <span>Total pool</span>
        <span className="tabular-nums font-semibold text-white/80">
          {fmtSol(market.totalPool)}
        </span>
      </div>
    </Link>
  );
}
