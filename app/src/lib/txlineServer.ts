/**
 * Server-only TxLINE access. Keeps the guest JWT + API token off the client by
 * proxying every TxLINE call through Next.js API routes.
 *
 * Credentials are read from env first, then fall back to the bootstrap output at
 * `../txline/credentials.json` (handy in local dev).
 */
import * as fs from "fs";
import * as path from "path";

export interface TxlineCreds {
  apiOrigin: string;
  jwt: string;
  apiToken: string;
}

let cached: TxlineCreds | null = null;

export function getCreds(): TxlineCreds {
  if (cached) return cached;

  const fromEnv: Partial<TxlineCreds> = {
    apiOrigin: process.env.TXLINE_API_ORIGIN,
    jwt: process.env.TXLINE_JWT,
    apiToken: process.env.TXLINE_API_TOKEN,
  };
  if (fromEnv.apiOrigin && fromEnv.jwt && fromEnv.apiToken) {
    cached = fromEnv as TxlineCreds;
    return cached;
  }

  // Dev fallback: read the bootstrap credentials file.
  const candidates = [
    path.join(process.cwd(), "..", "txline", "credentials.json"),
    path.join(process.cwd(), "txline", "credentials.json"),
  ];
  for (const f of candidates) {
    try {
      const c = JSON.parse(fs.readFileSync(f, "utf8"));
      cached = { apiOrigin: c.apiOrigin, jwt: c.jwt, apiToken: c.apiToken };
      return cached;
    } catch {
      /* try next */
    }
  }
  throw new Error(
    "TxLINE credentials missing. Set TXLINE_API_ORIGIN/TXLINE_JWT/TXLINE_API_TOKEN or run `npm run bootstrap` in ../txline."
  );
}

export function authHeaders(): Record<string, string> {
  const c = getCreds();
  return {
    Authorization: `Bearer ${c.jwt}`,
    "X-Api-Token": c.apiToken,
  };
}

/** Proxy a GET to TxLINE and return the parsed JSON (throws on non-2xx). */
export async function txlineGet<T = any>(pathname: string): Promise<T> {
  const c = getCreds();
  const res = await fetch(`${c.apiOrigin}${pathname}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TxLINE ${pathname} -> ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}
