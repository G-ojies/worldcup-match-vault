import { Keypair, PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import type { Outcome } from "./anchor";

/**
 * Mock TxODDS oracle.
 *
 * In production this module would call the TxODDS feed and verify a signed
 * payload from their oracle authority. Until we have API keys it:
 *   - tries the public football-data.org World Cup feed, and
 *   - falls back to the hardcoded fixtures below.
 *
 * `signOracleResult` simulates the verifiable-data step: it serializes the
 * outcome and signs it with the oracle keypair, exactly how a real feed would
 * attest to a result before `resolve_market` is called.
 */

export type MatchResult = "home" | "away" | "draw" | null;

export interface OracleMatch {
  id: string;
  home: string;
  away: string;
  timestamp: number; // unix seconds (kickoff)
  result: MatchResult;
}

const MOCK_MATCHES: OracleMatch[] = [
  { id: "WC2026_001", home: "Brazil", away: "Argentina", timestamp: 1750000000, result: null },
  { id: "WC2026_002", home: "France", away: "Spain", timestamp: 1750086400, result: "home" },
  { id: "WC2026_003", home: "Germany", away: "England", timestamp: 1750172800, result: "draw" },
];

const FOOTBALL_DATA_URL =
  "https://api.football-data.org/v4/competitions/WC/matches";
// Replace with a real key from https://www.football-data.org/ to use live data.
const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_DATA_KEY ?? "YOUR_FREE_API_KEY";

function mapStatusToResult(m: any): MatchResult {
  if (m?.score?.winner === "HOME_TEAM") return "home";
  if (m?.score?.winner === "AWAY_TEAM") return "away";
  if (m?.score?.winner === "DRAW") return "draw";
  return null;
}

/** Fetch World Cup fixtures, falling back to mocks on any failure. */
export async function getMatches(): Promise<OracleMatch[]> {
  try {
    const res = await fetch(FOOTBALL_DATA_URL, {
      headers: { "X-Auth-Token": API_KEY },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const matches: OracleMatch[] = (data.matches ?? []).map((m: any) => ({
      id: `WC_${m.id}`,
      home: m.homeTeam?.name ?? "TBD",
      away: m.awayTeam?.name ?? "TBD",
      timestamp: Math.floor(new Date(m.utcDate).getTime() / 1000),
      result: mapStatusToResult(m),
    }));
    return matches.length ? matches : MOCK_MATCHES;
  } catch {
    return MOCK_MATCHES;
  }
}

export async function getMatchResult(matchId: string): Promise<MatchResult> {
  const matches = await getMatches();
  return matches.find((m) => m.id === matchId)?.result ?? null;
}

export interface SignedOracleResult {
  matchId: string;
  outcome: Outcome;
  oracle: string; // base58 pubkey
  message: string; // canonical signed message
  signature: string; // base64 signature
}

/**
 * Simulate TxODDS verifiable data: serialize the outcome and sign it with the
 * oracle keypair. A relayer would verify this before submitting `resolve_market`.
 */
export function signOracleResult(
  matchId: string,
  outcome: Outcome,
  keypair: Keypair
): SignedOracleResult {
  const message = JSON.stringify({ matchId, outcome });
  const bytes = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(bytes, keypair.secretKey);
  return {
    matchId,
    outcome,
    oracle: keypair.publicKey.toBase58(),
    message,
    signature: Buffer.from(signature).toString("base64"),
  };
}

/** Verify a signed oracle result (the check a relayer/program guard performs). */
export function verifyOracleResult(
  signed: SignedOracleResult,
  oracle: PublicKey
): boolean {
  try {
    const bytes = new TextEncoder().encode(signed.message);
    const sig = Buffer.from(signed.signature, "base64");
    return nacl.sign.detached.verify(bytes, sig, oracle.toBytes());
  } catch {
    return false;
  }
}

export { MOCK_MATCHES };
