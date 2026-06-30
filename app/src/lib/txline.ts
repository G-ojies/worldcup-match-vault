/** Browser TxLINE client — talks to our Next.js proxy routes (no secrets here). */
import type { FixtureRecord, ScoreUpdate, StatValidation } from "./txlineTypes";

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) {
    const e = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(e.error || `request failed: ${r.status}`);
  }
  return r.json();
}

export function fetchFixtures(competitionId?: number): Promise<FixtureRecord[]> {
  return getJson(`/api/txline/fixtures${competitionId ? `?competitionId=${competitionId}` : ""}`);
}

export function fetchScores(
  fixtureId: number,
  mode: "snapshot" | "historical" | "updates" = "snapshot"
): Promise<ScoreUpdate[]> {
  return getJson(`/api/txline/scores/${fixtureId}?mode=${mode}`);
}

export function fetchStatValidation(args: {
  fixtureId: number;
  seq: number;
  statKey: number;
  statKey2?: number;
}): Promise<StatValidation> {
  const p = new URLSearchParams({
    fixtureId: String(args.fixtureId),
    seq: String(args.seq),
    statKey: String(args.statKey),
  });
  if (args.statKey2 != null) p.set("statKey2", String(args.statKey2));
  return getJson(`/api/txline/stat-validation?${p.toString()}`);
}

/** Subscribe to the proxied SSE feed. Returns an unsubscribe fn. */
export function subscribeStream(
  feed: "scores" | "odds",
  onMessage: (ev: { event: string; data: any }) => void
): () => void {
  const es = new EventSource(`/api/txline/stream?feed=${feed}`);
  const handle = (e: MessageEvent, name: string) => {
    let data: any = e.data;
    try {
      data = JSON.parse(e.data);
    } catch {
      /* keep raw */
    }
    onMessage({ event: name, data });
  };
  es.onmessage = (e) => handle(e, "message");
  es.addEventListener("heartbeat", (e) => handle(e as MessageEvent, "heartbeat"));
  return () => es.close();
}

/**
 * Derive the home/away full-game goal stat keys for a fixture.
 * statKey 1 = Participant1 goals, 2 = Participant2 goals (period 0).
 */
export function goalKeysFor(f: { Participant1IsHome: boolean }): {
  homeKey: number;
  awayKey: number;
} {
  return f.Participant1IsHome ? { homeKey: 1, awayKey: 2 } : { homeKey: 2, awayKey: 1 };
}

export type { FixtureRecord, ScoreUpdate, StatValidation };
