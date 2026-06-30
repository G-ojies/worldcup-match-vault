import type { NextApiRequest, NextApiResponse } from "next";
import { txlineGet } from "@/lib/txlineServer";

/**
 * GET /api/txline/stat-validation?fixtureId=&seq=&statKey=&statKey2=
 * Returns the three-stage Merkle proof for one/two score statistics — the
 * payload fed into the on-chain `validate_stat` settlement.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fixtureId, seq, statKey, statKey2 } = req.query;
  if (!fixtureId || !seq || !statKey) {
    return res.status(400).json({ error: "fixtureId, seq, statKey are required" });
  }
  const params = new URLSearchParams({
    fixtureId: String(Number(fixtureId)),
    seq: String(Number(seq)),
    statKey: String(Number(statKey)),
  });
  if (statKey2) params.set("statKey2", String(Number(statKey2)));
  try {
    const data = await txlineGet(`/api/scores/stat-validation?${params.toString()}`);
    res.status(200).json(data);
  } catch (e: any) {
    res.status(502).json({ error: e?.message || "stat-validation proxy failed" });
  }
}
