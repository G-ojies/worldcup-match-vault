import { useEffect, useRef, useState } from "react";
import { subscribeStream } from "@/lib/txline";

type State = "connecting" | "live" | "idle" | "error";

/**
 * Subscribes to the proxied TxLINE scores SSE feed and surfaces any update for
 * this fixture. World Cup matches are finished, so this degrades to a calm
 * "no live data" state rather than spinning forever.
 */
export default function LiveScoreTicker({ fixtureId }: { fixtureId: number }) {
  const [state, setState] = useState<State>("connecting");
  const [last, setLast] = useState<string | null>(null);
  const settled = useRef(false);

  useEffect(() => {
    if (!fixtureId) return;
    settled.current = false;
    setState("connecting");

    let unsub = () => {};
    try {
      unsub = subscribeStream("scores", ({ event, data }) => {
        if (event === "heartbeat") return;
        const fid = Number(data?.FixtureId ?? data?.fixtureId);
        if (fid && fid !== fixtureId) return;
        const action = data?.Action ?? data?.action;
        if (action) {
          settled.current = true;
          setState("live");
          setLast(String(action));
        }
      });
    } catch {
      setState("error");
    }

    // No relevant data shortly after connecting → treat as idle (finished match).
    const t = setTimeout(() => {
      if (!settled.current) setState("idle");
    }, 6000);

    return () => {
      clearTimeout(t);
      unsub();
    };
  }, [fixtureId]);

  const dot =
    state === "live"
      ? "bg-turf-400 animate-pulse"
      : state === "connecting"
      ? "bg-gold-400 animate-pulse"
      : state === "error"
      ? "bg-away"
      : "bg-white/25";

  const text =
    state === "live"
      ? `Live · ${last}`
      : state === "connecting"
      ? "Listening for live updates…"
      : state === "error"
      ? "Live feed unavailable"
      : "No live scores match has finished";

  return (
    <div className="flex items-center gap-2 text-xs text-white/45">
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span>{text}</span>
    </div>
  );
}
