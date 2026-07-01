import type { NextApiRequest, NextApiResponse } from "next";
import { txlineGet, txlineGetSseArray } from "@/lib/txlineServer";

/**
 * GET /api/txline/scores/{fixtureId}?mode=snapshot|historical|updates
 * Proxies the matching TxLINE scores endpoint.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const fixtureId = Number(req.query.fixtureId);
  const mode = (req.query.mode as string) || "snapshot";
  if (!Number.isFinite(fixtureId)) {
    return res.status(400).json({ error: "invalid fixtureId" });
  }
  try {
    let data: any;
    if (mode === "historical") {
      // historical replays as text/event-stream parse `data:` lines to an array.
      data = await txlineGetSseArray(`/api/scores/historical/${fixtureId}`);
    } else if (mode === "updates") {
      data = await txlineGet(`/api/scores/updates/${fixtureId}`);
    } else {
      data = await txlineGet(`/api/scores/snapshot/${fixtureId}?asOf=${Date.now()}`);
    }
    res.status(200).json(data);
  } catch (e: any) {
    res.status(502).json({ error: e?.message || "scores proxy failed" });
  }
}
