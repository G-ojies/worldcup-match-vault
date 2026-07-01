import type { NextApiRequest, NextApiResponse } from "next";
import { txlineGet } from "@/lib/txlineServer";

/** GET /api/txline/fixtures?competitionId=123: latest fixtures snapshot. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { competitionId } = req.query;
    const q = competitionId ? `?competitionId=${Number(competitionId)}` : "";
    const data = await txlineGet(`/api/fixtures/snapshot${q}`);
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(200).json(data);
  } catch (e: any) {
    res.status(502).json({ error: e?.message || "fixtures proxy failed" });
  }
}
