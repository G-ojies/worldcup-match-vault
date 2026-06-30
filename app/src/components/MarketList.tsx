import { useMemo, useState } from "react";
import type { MarketView } from "@/hooks/useMarkets";
import MarketCard from "./MarketCard";

type Filter = "active" | "settled" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "settled", label: "Settled" },
  { key: "all", label: "All" },
];

export default function MarketList({
  markets,
  loading,
}: {
  markets: MarketView[];
  loading: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("active");

  const filtered = useMemo(() => {
    if (filter === "all") return markets;
    if (filter === "settled") return markets.filter((m) => m.isSettled);
    return markets.filter((m) => !m.isSettled);
  }, [markets, filter]);

  return (
    <section>
      <div className="mb-5 flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`pill px-3 py-1 transition ${
              filter === f.key
                ? "bg-turf-500 text-pitch-950"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-white/40">
          {filtered.length} market{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-56 animate-pulse bg-pitch-850/60" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex h-48 flex-col items-center justify-center text-center text-white/50">
          <p className="text-lg font-medium">No {filter} markets yet</p>
          <p className="mt-1 text-sm text-white/35">
            An admin can create one from the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MarketCard key={m.pubkey} market={m} />
          ))}
        </div>
      )}
    </section>
  );
}
