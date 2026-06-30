/**
 * TxLINE devnet client — authed REST + SSE access to TxODDS World Cup data.
 *
 * Loads ./credentials.json (written by bootstrap-access.ts) and attaches the
 * two required auth headers to every request:
 *   Authorization: Bearer <jwt>   X-Api-Token: <apiToken>
 */
import axios, { AxiosInstance } from "axios";
import * as fs from "fs";
import * as path from "path";

export interface Credentials {
  network: "mainnet" | "devnet";
  apiOrigin: string;
  wallet: string;
  jwt: string;
  apiToken: string;
}

// ---- record types (PascalCase REST, see INTEGRATION.md §2) ----

export interface FixtureRecord {
  FixtureId: number;
  StartTime: number; // ms epoch
  Participant1: string;
  Participant2: string;
  Participant1IsHome: boolean;
  Participant1Id: number;
  Participant2Id: number;
  Competition: string;
  CompetitionId: number;
  FixtureGroupId: number;
  Ts: number;
}

/** A score-update action. `Stats` is a flat map of encoded statKey -> value. */
export interface ScoreUpdate {
  FixtureId: number;
  Seq: number;
  Ts: number;
  Action: string;
  GameState: string;
  Score?: Record<string, any>;
  Stats?: Record<string, number>;
  [k: string]: any;
}

/** Raw response of GET /api/scores/stat-validation. */
export interface StatValidation {
  ts: number;
  statToProve: { key: number; value: number; period: number };
  eventStatRoot: number[];
  summary: {
    fixtureId: number;
    updateStats: { updateCount: number; minTimestamp: number; maxTimestamp: number };
    eventStatsSubTreeRoot: number[];
  };
  statProof: ProofNodeJson[];
  subTreeProof: ProofNodeJson[];
  mainTreeProof: ProofNodeJson[];
  statToProve2?: { key: number; value: number; period: number };
  statProof2?: ProofNodeJson[];
}

export interface ProofNodeJson {
  hash: number[] | string | Uint8Array;
  isRightSibling: boolean;
}

export function loadCredentials(p?: string): Credentials {
  const file = p || path.join(__dirname, "..", "credentials.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export class TxlineClient {
  readonly creds: Credentials;
  private http: AxiosInstance;

  constructor(creds?: Credentials) {
    this.creds = creds || loadCredentials();
    this.http = axios.create({
      baseURL: this.creds.apiOrigin,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.creds.jwt}`,
        "X-Api-Token": this.creds.apiToken,
      },
    });
  }

  // ---- snapshots / REST ----

  async getFixturesSnapshot(competitionId?: number): Promise<FixtureRecord[]> {
    const r = await this.http.get("/api/fixtures/snapshot", {
      params: competitionId ? { competitionId } : undefined,
    });
    return r.data;
  }

  async getScoresSnapshot(fixtureId: number): Promise<ScoreUpdate[]> {
    const r = await this.http.get(`/api/scores/snapshot/${fixtureId}?asOf=${Date.now()}`);
    return r.data;
  }

  async getScoresHistorical(fixtureId: number): Promise<ScoreUpdate[]> {
    const r = await this.http.get(`/api/scores/historical/${fixtureId}`);
    return r.data;
  }

  async getScoresUpdates(fixtureId: number): Promise<ScoreUpdate[]> {
    const r = await this.http.get(`/api/scores/updates/${fixtureId}`);
    return r.data;
  }

  async getOddsSnapshot(fixtureId: number, asOf?: number): Promise<any[]> {
    const r = await this.http.get(`/api/odds/snapshot/${fixtureId}`, {
      params: asOf ? { asOf } : undefined,
    });
    return r.data;
  }

  /** Three-stage Merkle proof for one (or two) score statistics. */
  async getStatValidation(args: {
    fixtureId: number;
    seq: number;
    statKey: number;
    statKey2?: number;
  }): Promise<StatValidation> {
    const r = await this.http.get("/api/scores/stat-validation", { params: args });
    return r.data;
  }

  // ---- SSE streams (verbatim reader from INTEGRATION.md §6) ----

  async *streamScores(): AsyncGenerator<{ event: string; data: any }> {
    yield* this.stream("/api/scores/stream");
  }
  async *streamOdds(): AsyncGenerator<{ event: string; data: any }> {
    yield* this.stream("/api/odds/stream");
  }

  private async *stream(pathname: string): AsyncGenerator<{ event: string; data: any }> {
    const res = await fetch(`${this.creds.apiOrigin}${pathname}`, {
      headers: {
        Authorization: `Bearer ${this.creds.jwt}`,
        "X-Api-Token": this.creds.apiToken,
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
    if (!res.ok || !res.body) throw new Error(`Stream failed: ${res.status}`);
    const reader = (res.body as any).getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let sep = buffer.match(/\r?\n\r?\n/);
        while (sep?.index !== undefined) {
          const block = buffer.slice(0, sep.index);
          buffer = buffer.slice(sep.index + sep[0].length);
          const msg = parseSseBlock(block);
          if (msg) yield { event: msg.event ?? "message", data: parseSseData(msg.data) };
          sep = buffer.match(/\r?\n\r?\n/);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

type SseMessage = { id?: string; event?: string; data: string };
function parseSseBlock(block: string): SseMessage | null {
  const message: SseMessage = { data: "" };
  for (const rawLine of block.split(/\r?\n/)) {
    if (!rawLine || rawLine.startsWith(":")) continue;
    const i = rawLine.indexOf(":");
    const field = i === -1 ? rawLine : rawLine.slice(0, i);
    const value = i === -1 ? "" : rawLine.slice(i + 1).replace(/^ /, "");
    if (field === "data") message.data += `${value}\n`;
    if (field === "event") message.event = value;
    if (field === "id") message.id = value;
  }
  message.data = message.data.replace(/\n$/, "");
  return message.data || message.event || message.id ? message : null;
}
function parseSseData(data: string) {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}
