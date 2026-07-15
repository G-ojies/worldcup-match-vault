import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { Plus, ShieldCheck } from "lucide-react";
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
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-turf-400" strokeWidth={1.5} aria-hidden />
              <span className="label">Settled by on-chain Merkle proof. No oracle.</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Prediction markets
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50">
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
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
              Create market
            </button>
          )}
        </section>

        <HeroBanner
          totalLocked={fmtSol(totalLocked)}
          activeCount={activeCount}
          trustlessCount={trustlessCount}
          allCount={markets.length}
        />

        <MarketList markets={markets} loading={loading} />
        {/* CC BY 4.0 requires attribution to the photographer plus a licence link. */}
        <footer className="hairline mt-12 pt-6">
          <p className="text-center text-[11px] leading-relaxed text-white/40">
            Banner photo by Krzysztof Popławski,{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 transition-colors duration-100 ease-out hover:text-white"
            >
              CC BY 4.0
            </a>
            , via{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Mecz_pi%C5%82karski_Wis%C5%82a_Krak%C3%B3w_-_Zag%C5%82%C4%99bie_Sosnwoiec,_28_pa%C5%BAdziernika_2022,_Po%C5%BCegnanie_Stadionu_Ludowego,_KP.jpg"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 transition-colors duration-100 ease-out hover:text-white"
            >
              Wikimedia Commons
            </a>
            .
          </p>
        </footer>
      </main>

      <CreateMarketModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={refresh}
      />
    </>
  );
}

/**
 * Same hero device as SharpSignal and GroupStage: photo, diagonal scrim to
 * protect the text, then a bottom-up scrim so the stat row's 11px mono labels
 * clear AA over the floodlit crowd. Measured, not eyeballed.
 */
function HeroBanner({
  totalLocked,
  activeCount,
  trustlessCount,
  allCount,
}: {
  totalLocked: string;
  activeCount: number;
  trustlessCount: number;
  allCount: number;
}) {
  return (
    <section className="card relative mb-8 overflow-hidden">
      <Image
        src="/hero-stadium.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 1152px) 100vw, 1152px"
        className="pointer-events-none select-none object-cover object-[70%_center] opacity-75"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,#0f1518_24%,rgba(15,21,24,0.82)_54%,rgba(15,21,24,0.42))]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,#0f1518_20%,rgba(15,21,24,0.72)_40%,transparent_72%)]" />

      <div className="relative p-5 sm:p-7">
        <h2 className="max-w-md text-xl font-semibold tracking-tight text-white sm:text-2xl">
          No oracle. Just the proof.
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/50">
          Every market resolves against TxODDS’ on-chain Merkle root, so settlement is something
          you can check rather than something you trust.
        </p>

        <div className="hairline mt-6 grid grid-cols-2 gap-x-4 gap-y-5 pt-5 sm:grid-cols-4">
          <Stat label="Value locked" sub="across all pools">
            {totalLocked}
          </Stat>
          <Stat label="Active markets" sub={activeCount ? "open for bets" : "none open"}>
            {String(activeCount)}
          </Stat>
          <Stat label="Trustless" sub="settled by proof">
            {String(trustlessCount)}
          </Stat>
          <Stat label="All markets" sub="lifetime">
            {String(allCount)}
          </Stat>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="stat text-white">{children}</span>
      </div>
      <div className="label mt-1.5 truncate text-[10px] tracking-[0.1em]">{sub}</div>
    </div>
  );
}
