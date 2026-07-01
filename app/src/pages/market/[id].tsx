import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import BetForm from "@/components/BetForm";
import ClaimPanel from "@/components/ClaimPanel";
import PoolBars from "@/components/PoolBars";
import VerifiableResolution from "@/components/VerifiableResolution";
import LiveScoreTicker from "@/components/LiveScoreTicker";
import { useMarket, useMyBet } from "@/hooks/useMarkets";
import { useProgram } from "@/hooks/useWallet";
import {
  fmtSol,
  OUTCOME_LABEL,
  odds,
  timeToKickoff,
  settlementKind,
  SETTLEMENT_LABEL,
} from "@/lib/format";

export default function MarketDetail() {
  const router = useRouter();
  const matchId =
    typeof router.query.id === "string" ? decodeURIComponent(router.query.id) : undefined;

  const { market, loading, refresh } = useMarket(matchId);
  const { publicKey } = useProgram();
  const { bet, refresh: refreshBet } = useMyBet(market?.pubkey, publicKey);

  const reload = () => {
    refresh();
    refreshBet();
  };

  const nowSec = Math.floor(Date.now() / 1000);
  const settleOpen = !!market && nowSec >= market.settleNotBefore;
  const showResolution =
    !!market && market.fixtureId > 0 && (settleOpen || market.isSettled);
  const kind = market
    ? settlementKind(market.settlementKind, market.isSettled)
    : "unsettled";

  return (
    <>
      <Head>
        <title>
          {market ? `${market.homeTeam} vs ${market.awayTeam}` : "Market"} · GreYat WorldCup Analytics
        </title>
      </Head>
      <Header />

      <main className="mx-auto max-w-5xl px-5 py-8">
        <Link
          href="/"
          className="mb-6 inline-block rounded text-sm text-white/45 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf-500/60"
        >
          ← All markets
        </Link>

        {loading ? (
          <div className="space-y-6">
            <div className="card h-64 animate-pulse bg-pitch-850/60" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="card h-52 animate-pulse bg-pitch-850/60" />
              <div className="card h-52 animate-pulse bg-pitch-850/60" />
            </div>
          </div>
        ) : !market ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <p className="text-white/60">Market not found.</p>
            <Link href="/" className="btn-ghost">
              Back to markets
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Match header */}
            <div className="card animate-rise p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="truncate font-mono text-xs text-white/40">
                  {market.matchId}
                </span>
                <div className="flex items-center gap-2">
                  {market.isSettled ? (
                    <>
                      <span
                        className={`pill ${
                          kind === "trustless"
                            ? "bg-turf-500/15 text-turf-400"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {kind === "trustless" ? "◈ " : ""}
                        {SETTLEMENT_LABEL[kind]}
                      </span>
                      <span className="pill bg-gold-500/15 text-gold-400">
                        Settled · {OUTCOME_LABEL[market.outcome]}
                      </span>
                    </>
                  ) : settleOpen ? (
                    <span className="pill bg-white/10 text-white/60">Awaiting settlement</span>
                  ) : (
                    <span className="pill bg-turf-500/15 text-turf-400">
                      Kickoff in {timeToKickoff(market.matchTimestamp)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-5 grid grid-cols-3 items-center text-center">
                <TeamOdds
                  team={market.homeTeam}
                  odd={odds(market.totalPool, market.totalHome)}
                  color="text-home"
                />
                <div className="text-xs font-medium uppercase tracking-widest text-white/30">
                  {new Date(market.matchTimestamp * 1000).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                  <div className="mt-0.5 text-[10px] tracking-normal text-white/25">
                    {new Date(market.matchTimestamp * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <TeamOdds
                  team={market.awayTeam}
                  odd={odds(market.totalPool, market.totalAway)}
                  color="text-away"
                />
              </div>

              <PoolBars home={market.totalHome} away={market.totalAway} draw={market.totalDraw} />

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-sm">
                <span className="text-white/45">Total pool</span>
                <span className="tabular-nums font-semibold text-white">
                  {fmtSol(market.totalPool)}
                </span>
              </div>

              {market.fixtureId > 0 && !market.isSettled && (
                <div className="mt-3 border-t border-white/5 pt-3">
                  <LiveScoreTicker fixtureId={market.fixtureId} />
                </div>
              )}
            </div>

            {/* Verifiable resolution — the centerpiece */}
            {showResolution && (
              <VerifiableResolution market={market} onResolved={reload} />
            )}

            {/* Bet / claim + settlement context */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {!market.isSettled ? (
                <BetForm market={market} onDone={reload} />
              ) : bet ? (
                <ClaimPanel market={market} bet={bet} onDone={reload} />
              ) : (
                <div className="card flex items-center justify-center p-6 text-center text-sm text-white/45">
                  You didn’t bet on this market.
                </div>
              )}

              <div className="card p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
                  Settlement
                </h3>
                {market.fixtureId > 0 ? (
                  <p className="text-xs leading-relaxed text-white/55">
                    Bound to{" "}
                    <span className="font-mono text-white/75">
                      TxLINE fixture #{market.fixtureId}
                    </span>
                    . When the match is final, anyone can settle it by submitting
                    TxLINE’s signed score proof — the program verifies the goals
                    against TxODDS’ on-chain Merkle root with{" "}
                    <span className="text-turf-400">no trusted oracle</span>. Payouts
                    use live pool ratios at settlement, minus a 3% protocol fee.
                  </p>
                ) : (
                  <p className="text-xs leading-relaxed text-white/55">
                    This market resolves when the authorized oracle submits the
                    signed final result. Payouts use the live pool ratios at
                    settlement, minus a 3% protocol fee.
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2 text-[11px]">
                  <span className="text-white/35">Goal stat keys</span>
                  <span className="font-mono text-white/60">
                    home {market.homeGoalKey} · away {market.awayGoalKey} · period{" "}
                    {market.goalPeriod}
                  </span>
                </div>
                <div className="mt-2 break-all rounded-xl bg-pitch-950/60 px-3 py-2 font-mono text-[11px] text-white/55">
                  oracle {market.oracleAuthority}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function TeamOdds({ team, odd, color }: { team: string; odd: string; color: string }) {
  return (
    <div>
      <div className="text-xl font-bold text-white">{team}</div>
      <div className={`mt-1 text-sm font-semibold tabular-nums ${color}`}>{odd}x</div>
    </div>
  );
}
