import { useState } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import MarketList from "@/components/MarketList";
import CreateMarketModal from "@/components/CreateMarketModal";
import { useMarkets } from "@/hooks/useMarkets";
import { useProgram } from "@/hooks/useWallet";
import { fmtSol } from "@/lib/format";

export default function Home() {
  const { markets, loading, refresh } = useMarkets();
  const { connected, isAdmin } = useProgram();
  const [showCreate, setShowCreate] = useState(false);

  const totalLocked = markets.reduce((s, m) => s + m.totalPool, 0);
  const activeCount = markets.filter((m) => !m.isSettled).length;
  const trustlessCount = markets.filter((m) => m.settlementKind === 2).length;

  return (
    <>
      <Head>
        <title>GreYat WorldCup Analytics</title>
        <meta name="description" content="On-chain World Cup prediction markets on Solana" />
      </Head>

      <Header />

      <main className="mx-auto max-w-6xl px-5 py-8">
        <section className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-turf-500/25 bg-turf-500/10 px-2.5 py-0.5 text-[11px] font-medium text-turf-400">
              ◈ Settled by on-chain Merkle proof no oracle
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Prediction markets
            </h1>
            <p className="mt-1 max-w-xl text-sm text-white/50">
              Bet SOL on World Cup outcomes. Markets settle trustlessly from
              TxLINE’s signed score data, verified against TxODDS’ on-chain Merkle
              root. Winners claim a proportional share of the pools.
            </p>
          </div>
          {connected && isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-950"
            >
              + Create market
            </button>
          )}
        </section>

        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total value locked" value={fmtSol(totalLocked)} />
          <Stat label="Active markets" value={String(activeCount)} />
          <Stat label="Trustless settlements" value={String(trustlessCount)} />
          <Stat label="All markets" value={String(markets.length)} />
        </section>

        <MarketList markets={markets} loading={loading} />
      </main>

      <CreateMarketModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={refresh}
      />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-white/40">{label}</div>
      <div className="mt-1 text-xl font-bold tabular-nums text-white">{value}</div>
    </div>
  );
}
