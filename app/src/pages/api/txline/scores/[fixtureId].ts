import type { NextApiRequest, NextApiResponse } from "next";
import { txlineGet } from "@/lib/txlineServer";

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
    let path: string;
    if (mode === "historical") path = `/api/scores/historical/${fixtureId}`;
    else if (mode === "updates") path = `/api/scores/updates/${fixtureId}`;
    else path = `/api/scores/snapshot/${fixtureId}?asOf=${Date.now()}`;
    const data = await txlineGet(path);
    res.status(200).json(data);
  } catch (e: any) {
    res.status(502).json({ error: e?.message || "scores proxy failed" });
  }
}
