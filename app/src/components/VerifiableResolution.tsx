import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import type { MarketView } from "@/hooks/useMarkets";
import { useProgram } from "@/hooks/useWallet";
import {
  buildSettlement,
  resolveMarketTrustless,
  type BuiltSettlement,
} from "@/lib/settle";
import { OUTCOME_LABEL, timeToKickoff } from "@/lib/format";

type Phase = "idle" | "working" | "done" | "error";

const explorerTx = (sig: string) =>
  `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
const explorerAcc = (addr: string) =>
  `https://explorer.solana.com/address/${addr}?cluster=devnet`;

const PREDICATE: Record<BuiltSettlement["outcome"], { sym: string; word: string }> = {
  home: { sym: ">", word: "Home" },
  away: { sym: "<", word: "Away" },
  draw: { sym: "=", word: "Draw" },
};

export default function VerifiableResolution({
  market,
  onResolved,
}: {
  market: MarketView;
  onResolved: () => void;
}) {
  const { connected, publicKey } = useProgram();
  const { program } = useProgram();
  const [phase, setPhase] = useState<Phase>("idle");
  const [built, setBuilt] = useState<BuiltSettlement | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [step, setStep] = useState<string>("");

  const nowSec = Math.floor(Date.now() / 1000);
  const settleOpen = nowSec >= market.settleNotBefore;
  const alreadyTrustless = market.isSettled && market.settlementKind === 2;
  const hasBinding = market.fixtureId > 0;

  // No TxLINE binding → this market can't be settled trustlessly.
  if (!hasBinding) return null;

  async function run(sendTx: boolean) {
    setPhase("working");
    setErr(null);
    try {
      setStep("Fetching final score from TxLINE…");
      const b = await buildSettlement({
        fixtureId: market.fixtureId,
        homeGoalKey: market.homeGoalKey,
        awayGoalKey: market.awayGoalKey,
        mode: "historical",
      });
      setBuilt(b);

      if (sendTx) {
        if (!connected || !publicKey) {
          throw new Error("Connect a wallet to submit the settlement.");
        }
        setStep("Verifying Merkle proof on-chain & settling…");
        const signature = await resolveMarketTrustless(program, {
          market: new PublicKey(market.pubkey),
          resolver: publicKey,
          built: b,
        });
        setSig(signature);
        onResolved();
      }
      setPhase("done");
      setStep("");
    } catch (e: any) {
      setErr((e?.toString() ?? "Settlement failed").slice(0, 220));
      setPhase("error");
      setStep("");
    }
  }

  const working = phase === "working";

  return (
    <section className="card overflow-hidden">
      {/* Header band */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-gradient-to-r from-turf-500/10 to-transparent px-5 py-4">
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-turf-500/15 text-turf-400"
        >
          ◈
        </span>
        <div>
          <h3 className="text-sm font-semibold text-white">Verifiable resolution</h3>
          <p className="text-xs text-white/45">
            Settle from TxODDS data proven on-chain, no oracle authority.
          </p>
        </div>
      </div>

      <div className="p-5">
        {/* Action / status row */}
        {!built && (
          <>
            {alreadyTrustless ? (
              <p className="mb-4 text-sm text-white/60">
                This market was settled trustlessly. Rebuild the live proof to
                inspect the exact leaves and Merkle path it was verified against.
              </p>
            ) : !settleOpen ? (
              <p className="mb-4 text-sm text-white/60">
                Trustless settlement unlocks{" "}
                <span className="text-white/85">
                  in {timeToKickoff(market.settleNotBefore)}
                </span>{" "}
                (after full time). The score proof isn’t final until then.
              </p>
            ) : (
              <p className="mb-4 text-sm text-white/60">
                The match is final. Anyone can settle this market by submitting
                TxLINE’s signed score proof the program verifies it against the
                on-chain Merkle root.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {alreadyTrustless ? (
                <button
                  onClick={() => run(false)}
                  disabled={working}
                  className="btn-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-900"
                >
                  {working ? "Rebuilding proof…" : "Show verification proof"}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => run(true)}
                    disabled={working || !settleOpen || market.isSettled}
                    className="btn-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-900"
                  >
                    {working ? "Settling…" : "Settle trustlessly"}
                  </button>
                  <button
                    onClick={() => run(false)}
                    disabled={working}
                    className="btn-ghost focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  >
                    Preview proof
                  </button>
                </>
              )}
            </div>

            {working && step && (
              <p className="mt-3 flex items-center gap-2 text-xs text-turf-400">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-turf-400" />
                {step}
              </p>
            )}
            {!connected && settleOpen && !alreadyTrustless && (
              <p className="mt-2 text-xs text-white/40">
                Connect a wallet to submit. Previewing needs no wallet.
              </p>
            )}
            {err && <p className="mt-3 text-xs text-away">{err}</p>}
          </>
        )}

        {/* Proof receipt */}
        {built && <ProofReceipt built={built} market={market} sig={sig} err={err} />}
      </div>
    </section>
  );
}

function ProofReceipt({
  built,
  market,
  sig,
  err,
}: {
  built: BuiltSettlement;
  market: MarketView;
  sig: string | null;
  err: string | null;
}) {
  const v = built.validation;
  const pred = PREDICATE[built.outcome];
  const diff = built.homeGoals - built.awayGoals;

  return (
    <div className="animate-rise space-y-4">
      {/* Verdict badge */}
      <div className="flex items-center justify-between rounded-2xl border border-turf-500/25 bg-turf-500/10 px-4 py-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-turf-400/80">
            Proven outcome
          </div>
          <div className="text-lg font-bold text-white">
            {market.homeTeam} {built.homeGoals}
            <span className="px-2 text-white/30">–</span>
            {built.awayGoals} {market.awayTeam}
          </div>
        </div>
        <span className="pill bg-turf-500 px-3 py-1 text-pitch-950">
          {OUTCOME_LABEL[built.outcome]}
        </span>
      </div>

      {/* Proven stat leaves */}
      <div className="grid grid-cols-2 gap-3">
        <StatLeaf
          title="Home goals leaf"
          stat={v.statToProve}
          color="text-home"
        />
        <StatLeaf
          title="Away goals leaf"
          stat={v.statToProve2 ?? { key: market.awayGoalKey, value: built.awayGoals, period: 0 }}
          color="text-away"
        />
      </div>

      {/* Derived predicate */}
      <div className="rounded-xl bg-pitch-950/60 px-4 py-3 font-mono text-sm text-white/80">
        <span className="text-white/40">predicate&nbsp;</span>
        home − away = {built.homeGoals} − {built.awayGoals} ={" "}
        <span className="font-semibold text-white">{diff}</span>{" "}
        <span className="text-turf-400">
          {pred.sym} 0 → {pred.word}
        </span>
      </div>

      {/* Proof node counts */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <NodeStat label="Sub-tree" n={v.subTreeProof?.length ?? 0} />
        <NodeStat label="Main-tree" n={v.mainTreeProof?.length ?? 0} />
        <NodeStat label="Stat (home)" n={v.statProof?.length ?? 0} />
        <NodeStat label="Stat (away)" n={v.statProof2?.length ?? 0} />
      </div>

      {/* PDA + fixture */}
      <dl className="space-y-1.5 text-xs">
        <KV label="Fixture" mono>
          #{built.fixtureId} · seq {built.seq} · epoch day {built.epochDay}
        </KV>
        <KV label="Daily-scores root PDA" mono>
          <a
            href={`https://explorer.solana.com/address/${built.dailyPda.toBase58()}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            className="break-all text-turf-400 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf-500/60"
          >
            {built.dailyPda.toBase58()}
          </a>
        </KV>
      </dl>

      {/* Trust badge */}
      <div className="flex items-center gap-2 rounded-xl border border-turf-500/30 bg-gradient-to-r from-turf-500/15 to-turf-500/[0.04] px-4 py-3">
        <span aria-hidden className="text-turf-400">
          ✓
        </span>
        <span className="text-xs font-medium text-turf-400">
          Verified against TxODDS on-chain Merkle root no oracle authority.
        </span>
      </div>

      {sig && (
        <a
          href={explorerTx(sig)}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost w-full justify-center text-turf-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf-500/60"
        >
          View settlement tx on Solana Explorer ↗
        </a>
      )}
      {!sig && market.isSettled && (
        <a
          href={explorerAcc(market.pubkey)}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost w-full justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          View market account on Solana Explorer ↗
        </a>
      )}
      {err && <p className="text-xs text-away">{err}</p>}
    </div>
  );
}

function StatLeaf({
  title,
  stat,
  color,
}: {
  title: string;
  stat: { key: number; value: number; period: number };
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-pitch-950/40 p-3">
      <div className={`text-[11px] font-medium ${color}`}>{title}</div>
      <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-white">
        {stat.value}
      </div>
      <div className="mt-1 font-mono text-[10px] text-white/35">
        key {stat.key} · period {stat.period}
      </div>
    </div>
  );
}

function NodeStat({ label, n }: { label: string; n: number }) {
  return (
    <div className="rounded-xl bg-pitch-950/50 px-3 py-2 text-center">
      <div className="font-mono text-base font-semibold tabular-nums text-white">
        {n}
      </div>
      <div className="text-[10px] text-white/40">{label}</div>
    </div>
  );
}

function KV({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <dt className="text-white/40">{label}</dt>
      <dd className={mono ? "font-mono text-white/70" : "text-white/70"}>{children}</dd>
    </div>
  );
}
