import { fmtSol, odds } from "@/lib/format";

interface Props {
  home: number;
  away: number;
  draw: number;
  compact?: boolean;
}

/** Three proportional bars showing relative pool sizes for each outcome. */
export default function PoolBars({ home, away, draw, compact }: Props) {
  const total = home + away + draw;
  const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0);

  const rows: { label: string; value: number; color: string; bar: string }[] = [
    { label: "Home", value: home, color: "text-home", bar: "bg-home" },
    { label: "Draw", value: draw, color: "text-draw", bar: "bg-draw" },
    { label: "Away", value: away, color: "text-away", bar: "bg-away" },
  ];

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2.5"}>
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className={`font-medium ${r.color}`}>{r.label}</span>
            <span className="tabular-nums text-white/55">
              {fmtSol(r.value)} · {odds(total, r.value)}x
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className={`h-full rounded-full ${r.bar} transition-all`}
              style={{ width: `${pct(r.value)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
