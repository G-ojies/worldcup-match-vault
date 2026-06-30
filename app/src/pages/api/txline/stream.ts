import type { NextApiRequest, NextApiResponse } from "next";
import { getCreds, authHeaders } from "@/lib/txlineServer";

export const config = { api: { bodyParser: false, responseLimit: false } };

/**
 * GET /api/txline/stream?feed=scores|odds
 * Server-side proxy for the TxLINE SSE feed (the browser can't set the auth
 * headers EventSource requires, so we relay the stream with credentials here).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const feed = req.query.feed === "odds" ? "odds" : "scores";
  const { apiOrigin } = getCreds();

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const controller = new AbortController();
  req.on("close", () => controller.abort());

  try {
    const upstream = await fetch(`${apiOrigin}/api/${feed}/stream`, {
      headers: { ...authHeaders(), Accept: "text/event-stream", "Cache-Control": "no-cache" },
      signal: controller.signal,
    });
    if (!upstream.ok || !upstream.body) {
      res.write(`event: error\ndata: upstream ${upstream.status}\n\n`);
      return res.end();
    }
    const reader = (upstream.body as any).getReader();
    const decoder = new TextDecoder();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
  } catch (e: any) {
    if (e?.name !== "AbortError") {
      res.write(`event: error\ndata: ${String(e?.message).slice(0, 120)}\n\n`);
    }
  } finally {
    res.end();
  }
}
