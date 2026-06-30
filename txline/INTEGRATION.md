# TxLINE / TxODDS Oracle — Settlement-Engine Integration Reference

Distilled from `txline-llms-full.md` (full API docs dump). This is the wiring reference for
fetching data, streaming, and converting `stat-validation` proof JSON into on-chain
`validate_stat` arguments.

> Casing note: the **REST/JSON** layer uses mixed casing (PascalCase for fixture records like
> `FixtureId`, camelCase for proof JSON like `eventStatsSubTreeRoot`). The **on-chain Anchor**
> types use `snake_case` in the raw IDL and `camelCase` in the generated TS `Txoracle` type.
> Field-name mismatches between JSON keys and Anchor args are called out explicitly below —
> they are the main footgun.

---

## 1. Hosts, Networks & Auth

### Hosts (verbatim)

| Network | apiOrigin                        | Guest Auth (`POST`)                              | apiBaseUrl = apiOrigin + `/api`      |
| ------- | -------------------------------- | ------------------------------------------------ | ------------------------------------ |
| Mainnet | `https://txline.txodds.com`      | `https://txline.txodds.com/auth/guest/start`     | `https://txline.txodds.com/api`      |
| Devnet  | `https://txline-dev.txodds.com`  | `https://txline-dev.txodds.com/auth/guest/start` | `https://txline-dev.txodds.com/api`  |

**Devnet (this project): `apiOrigin = https://txline-dev.txodds.com`, `apiBaseUrl = https://txline-dev.txodds.com/api`.**

WARNING (verbatim): use all values from one network only. A devnet `subscribe` tx
(program `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`) must be activated against
`https://txline-dev.txodds.com`; a mainnet `subscribe` (program
`9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA`) against `https://txline.txodds.com`.

### Program Addresses

| Type           | Mainnet                                        | Devnet                                         |
| -------------- | ---------------------------------------------- | ---------------------------------------------- |
| Program ID     | `9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA` | `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J` |
| TxL Token Mint | `Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL`  | `4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG` |
| USDT Mint      | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` | `ELWTKspHKCnCfCiCiqYw1EDH77k8VCP74dK9qytG2Ujh` |

### Auth headers (ALL data requests)

`jwt` = guest JWT from `POST /auth/guest/start` (expires after 30 days).
`apiToken` = value returned by `POST /api/token/activate`.

```
Content-Type: application/json
Authorization: Bearer <jwt>
X-Api-Token: <apiToken>
```

Verbatim axios client:

```typescript
const httpClient = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${jwt}`,
    "X-Api-Token": apiToken
  },
  baseURL: "https://txline.txodds.com",   // devnet: "https://txline-dev.txodds.com"
});
```

Auth flow: `POST /auth/guest/start` → JWT; on-chain `subscribe` tx; `POST /api/token/activate`
(Bearer JWT) → long-lived `apiToken`. Activate supports 3 modes (legacy / standard-matrix → empty
leagues array; custom-matrix → requested league IDs). The whole activate intent is wallet-signed.

---

## 2. Snapshot / REST Endpoints

> The docs dump enumerates HTTP method + path + path/query params + verbatim example calls, but the
> full per-field REST response JSON schemas are served from `docs.yaml` and are **NOT field-enumerated
> in this dump**. Where a record's fields are not given, this is marked **NOT IN DOCS (field-level)**.
> Field names that ARE recoverable (from examples or from the IDL record structs used in on-chain
> validation) are listed.

### Fixtures

**`GET /api/fixtures/snapshot`** — latest fixtures snapshot, optionally starting at or within 30 days
after a given epoch day.
- Query params: `competitionId` (int, optional — e.g. `500005` = NCAA Division I FBS). The "epochDay
  variant" is the same endpoint with an optional epoch-day query param (the docs title it "optionally
  starting at or within 30 days after a given epoch day"); **exact epochDay query param name = NOT IN
  DOCS** (only the `competitionId` param is shown in examples).
- Returns: JSON array of fixture records. Field names (PascalCase, from example; types inferred from
  the IDL `fixture` struct):

| JSON field             | Type    | IDL `fixture` field   | Notes |
| ---------------------- | ------- | --------------------- | ----- |
| `FixtureId`            | i64     | `fixtureId`           | |
| `StartTime`            | i64 ms  | `startTime`           | `new Date(fixture.StartTime)` is valid ms epoch |
| `Participant1`         | string  | `participant1`        | |
| `Participant2`         | string  | `participant2`        | |
| `Participant1IsHome`   | bool    | `participant1IsHome`  | feed home/away mapping, NOT a venue guarantee |
| `Participant1Id`       | i32     | `participant1Id`      | |
| `Participant2Id`       | i32     | `participant2Id`      | |
| `Competition`          | string  | `competition`         | |
| `CompetitionId`        | i32     | `competitionId`       | |
| `FixtureGroupId`       | i32     | `fixtureGroupId`      | |
| `Ts`                   | i64     | `ts`                  | update timestamp |

  (Exact JSON casing of secondary fields beyond `FixtureId`/`StartTime`/`Participant*`/`Participant1IsHome`
  is **NOT IN DOCS**; the table maps to the on-chain `fixture` record which is what the proof covers.)

Example usage (verbatim):
```typescript
const fixturesResponse = await httpClient.get("/api/fixtures/snapshot", {
  params: { competitionId: 500005 },
});
const allFixtures = (await httpClient.get("/api/fixtures/snapshot")).data; // all competitions
```

**`GET /api/fixtures/updates/{epochDay}/{hourOfDay}`** — all fixture updates for fixtures on a given
day/hour. Path params: `epochDay` (int), `hourOfDay` (0–23). Response: **NOT IN DOCS (field-level)**.

**`GET /api/fixtures/validation`** (Merkle proof for ONE fixture update) — returns the Merkle proof
(branch hashes up to, not incl., the on-chain root) for a single fixture update. Use with the fixture
record for on-chain fixture validation. Query params + response schema: **NOT IN DOCS (field-level)**;
on-chain consumer types are `fixture`/`fixtureBatchSummary` + `proofNode[]` (see §6).

**`GET /api/fixtures/batch-validation`** (Merkle proof for an entire hourly batch) — returns the hourly
batch metadata (incl. its final Merkle root) plus a Merkle proof to verify the batch's claimed state
against a higher-level commitment. Query params + response: **NOT IN DOCS (field-level)**. On-chain type:
`fixtureBatchSummary { fixtureId:i64, competitionId:i32, competition:string, updateStats:FixtureUpdateStats, updateSubTreeRoot:[u8;32] }`.

Fixtures are grouped into **hourly** batches; each batch's Merkle root is published on-chain.
Fixtures PDA uses a 10-day window (see §5).

### Odds

**`GET /api/odds/snapshot/{fixtureId}`** — latest odds for each unique market line for a fixture.
- Path: `fixtureId`. Query: `asOf` (ms epoch, optional — historical point-in-time snapshot; without it,
  returns the current live snapshot if within the current 5-minute interval).
- Returns: array of odds records. Field names from the IDL `odds` record struct (camelCase):

| JSON field         | Type              |
| ------------------ | ----------------- |
| `fixtureId`        | i64               |
| `messageId`        | string            |
| `ts`               | i64               |
| `bookmaker`        | string            |
| `bookmakerId`      | i32               |
| `superOddsType`    | string            |
| `gameState`        | option\<string>   |
| `inRunning`        | bool              |
| `marketParameters` | option\<string>   |
| `marketPeriod`     | option\<string>   |
| `priceNames`       | vec\<string>      |
| `prices`           | vec\<i32>         |

**`GET /api/odds/updates/{fixtureId}`** — all live odds offers for a fixture from the current in-memory
5-minute cache. Path: `fixtureId`. Response: array of odds records (same shape as above).

**`GET /api/odds/updates/{epochDay}/{hourOfDay}/{interval}`** — all odds updates from a specific historical
5-minute interval. Path: `epochDay`, `hourOfDay` (0–23), `interval` (0–11, = floor(minute/5)).

**`GET /api/odds/validation`** — Merkle proof for a single odds update identified by its unique
`messageId`. Query: `messageId` (string). Returns proof branch hashes. On-chain consumer types:
`odds` record + `oddsBatchSummary { fixtureId:i64, updateStats:OddsUpdateStats, oddsSubTreeRoot:[u8;32] }`
+ `proofNode[]`. Field-level response: **NOT IN DOCS**.

### Scores

**`GET /api/scores/snapshot/{fixtureId}`** — snapshots for each action in the latest score events for a
fixture. Path: `fixtureId`. Query: `asOf` (ms epoch, optional, e.g. `?asOf=${Date.now()}`). Returns: array.
Per-element field-level schema: **NOT IN DOCS** (the score-update record JSON keys known from the historical
example are `seq`, `ts`, `gameState` — see below).

**`GET /api/scores/updates/{fixtureId}`** — score updates for a fixture within the current 5-minute
interval (incl. live data if present). Path: `fixtureId`. Returns array.

**`GET /api/scores/updates/{epochDay}/{hourOfDay}/{interval}`** — all score updates from a specific
historical 5-minute interval (NO live data). Path: `epochDay`, `hourOfDay`, `interval`.
Interval computation (verbatim): `interval = Math.floor(targetTime.getUTCMinutes() / 5)`,
`hourOfDay = targetTime.getUTCHours()`, `epochDay = Math.floor(targetTime.getTime() / 86400000)`.

**`GET /api/scores/historical/{fixtureId}`** — FULL sequence of score updates for a fixture. Only returns
data when the fixture's start time is between **two weeks and six hours** in the past. Path: `fixtureId`.
Returns array; each element has at least `seq`, `ts`, `gameState` (verbatim example):
```typescript
historicalScores.data.forEach((update) => {
  console.log(`Seq: ${update.seq}, TS: ${update.ts}, State: ${update.gameState}`);
});
```
There is no documented separate "5-min-interval variant" of `historical`; the 5-minute-interval scope is
served by `GET /api/scores/updates/{fixtureId}` (current 5-min interval) and
`GET /api/scores/updates/{epochDay}/{hourOfDay}/{interval}` (historical 5-min interval).

**`GET /api/scores/stat-validation`** — the three-stage Merkle proof. **See §3 (most important).**

### Purchase (optional)

**`POST /api/guest/purchase/quote`** — partially-signed Solana tx to buy TxLINE. Body: `buyerPubkey`,
required TxLINE whole-unit amount. Base rate 1,000 TxLINE = 1 USDT; premium 0%. Buyer needs a USDT ATA +
balance. Response includes cost breakdown + tx payload to sign. Field-level schema: **NOT IN DOCS**.

---

## 3. `GET /api/scores/stat-validation` — Three-Stage Merkle Proof (CRITICAL)

Proves one or two statistics inside a single score update against the on-chain main batch root.
Three-level Merkle hierarchy: main batch → per-fixture summary (root of that fixture's events sub-tree) →
per-event stat sub-tree (leaf = a single `ScoreStat`).

### Query params

| Param        | Type | Required | Meaning |
| ------------ | ---- | -------- | ------- |
| `fixtureId`  | int  | yes      | fixture id (e.g. `17952170`) |
| `seq`        | int  | yes      | score-update sequence number within the fixture (e.g. `941`) |
| `statKey`    | int  | yes      | encoded stat key (e.g. `1002`; see §5 encoding) |
| `statKey2`   | int  | no       | second encoded stat key for two-stat predicates (e.g. `1003`) |

### Response shape (JSON keys, from the verbatim example) → Anchor `validate_stat` args

The raw IDL `validate_stat` args (snake_case), in order, with `returns: "bool"`:

```
ts                : i64
fixture_summary   : ScoresBatchSummary
fixture_proof     : ProofNode[]
main_tree_proof   : ProofNode[]
predicate         : TraderPredicate
stat_a            : StatTerm
stat_b            : Option<StatTerm>
op                : Option<BinaryExpression>
```

On-chain type defs (raw IDL):
```
ScoresBatchSummary { fixture_id:i64, update_stats:ScoresUpdateStats, events_sub_tree_root:[u8;32] }
ScoresUpdateStats  { update_count:i32, min_timestamp:i64, max_timestamp:i64 }
StatTerm           { stat_to_prove:ScoreStat, event_stat_root:[u8;32], stat_proof:ProofNode[] }
ScoreStat          { key:u32, value:i32, period:i32 }
ProofNode          { hash:[u8;32], is_right_sibling:bool }
TraderPredicate    { threshold:i32, comparison:Comparison }
Comparison         = enum { GreaterThan, LessThan, EqualTo }
BinaryExpression   = enum { Add, Subtract }
```

**Exact JSON-key → Anchor-arg mapping (from the verbatim example at `documentation/examples/onchain-validation`):**

| Anchor arg / field                       | JSON source key                                | Transform        |
| ---------------------------------------- | ---------------------------------------------- | ---------------- |
| `ts` (i64)                               | `validation.summary.updateStats.minTimestamp`  | `new BN(...)` (this is `targetTs`) |
| `fixture_summary.fixture_id`             | `validation.summary.fixtureId`                 | `new BN(...)`    |
| `fixture_summary.update_stats.update_count`  | `validation.summary.updateStats.updateCount`    | as-is            |
| `fixture_summary.update_stats.min_timestamp` | `validation.summary.updateStats.minTimestamp`   | `new BN(...)`    |
| `fixture_summary.update_stats.max_timestamp` | `validation.summary.updateStats.maxTimestamp`   | `new BN(...)`    |
| `fixture_summary.events_sub_tree_root` ([u8;32]) | `validation.summary.eventStatsSubTreeRoot` | `toBytes32(...)` ⚠ key name |
| `fixture_proof` (ProofNode[])            | `validation.subTreeProof`                      | `toProofNodes(...)` ⚠ key name |
| `main_tree_proof` (ProofNode[])          | `validation.mainTreeProof`                     | `toProofNodes(...)` |
| `stat_a.stat_to_prove` (ScoreStat)       | `validation.statToProve`                       | passed as-is (object `{key,value,period}`) |
| `stat_a.event_stat_root` ([u8;32])       | `validation.eventStatRoot`                     | `toBytes32(...)` |
| `stat_a.stat_proof` (ProofNode[])        | `validation.statProof`                         | `toProofNodes(...)` |
| `stat_b.stat_to_prove` (when `statKey2`) | `validation.statToProve2`                      | passed as-is     |
| `stat_b.event_stat_root`                 | `validation.eventStatRoot`                     | `toBytes32(...)` ⚠ SAME key as stat_a (both stats share one event) |
| `stat_b.stat_proof`                      | `validation.statProof2`                        | `toProofNodes(...)` |
| `predicate`                              | client-defined `{ threshold, comparison }`     | not from API     |
| `op`                                     | client-defined `{ add:{} } / { subtract:{} } / null` | not from API |

Each `ProofNode` JSON element = `{ hash: <base64|0x-hex|number[]>, isRightSibling: boolean }`
→ `{ hash: toBytes32(hash), isRightSibling }`.

> ⚠ MAPPING GOTCHAS — flag these when wiring:
> 1. JSON `eventStatsSubTreeRoot` (note the extra "Stats") feeds the Anchor field
>    `events_sub_tree_root` / `eventsSubTreeRoot`. The names are NOT identical — do not search-replace.
> 2. JSON `subTreeProof` feeds the arg named `fixture_proof`. Name mismatch is intentional per docs.
> 3. For two-stat, `stat_b` uses `eventStatRoot` (the SAME key as `stat_a`), but `statProof2` /
>    `statToProve2`. This is consistent because both stats live in the same score-update event, so they
>    share one `event_stat_root` — but it looks like a typo if you expect `eventStatRoot2`.
> 4. `statToProve` / `statToProve2` are passed to Anchor untransformed, so the JSON objects must already
>    be `{ key:u32, value:i32, period:i32 }`. The exact JSON field names inside `statToProve` are not
>    spelled out in the dump beyond this passthrough — assume `{ key, value, period }` per `ScoreStat`.
> 5. Arg ORDER for `validate_stat` is `(ts, fixture_summary, fixture_proof, main_tree_proof, predicate,
>    stat_a, stat_b, op)`. NOTE: the related `auditTradeResult` instruction takes a DIFFERENT order —
>    `(terms, fixtureSummary, mainTreeProof, fixtureProof, statA, statB, ts)` with mainTreeProof/fixtureProof
>    SWAPPED and `ts` LAST. Don't copy arg order between the two.

Account required by `validate_stat`: `daily_scores_merkle_roots` (the daily-scores PDA, see §5).
`returns: bool`. Use `.view()` for read-only settlement checks.

---

## 4. SSE Streams

**`GET /api/odds/stream`** and **`GET /api/scores/stream`** — long-lived Server-Sent Events.

Required headers:
```
Authorization: Bearer <jwt>
X-Api-Token: <apiToken>
Accept: text/event-stream
Cache-Control: no-cache
```
Optional: `Accept-Encoding: gzip` (reduces bandwidth ~70–80%; you must `gunzipSync()` each chunk via
Node `zlib` before decoding).

Event types emitted by BOTH streams:
1. **Data message** — has SSE `id` in the format `timestamp:index`; `data` is a JSON object for a single
   record (an Odds record on `/odds/stream`; a Scores record on `/scores/stream`). The `data` JSON schema
   for the odds stream = the `odds` record in §2. The scores-record JSON schema is **NOT IN DOCS
   (field-level)** beyond `seq` / `ts` / `gameState`.
2. **Heartbeat** — SSE `event: heartbeat`; `data` may be e.g. `{"Ts": 12345}`.

Consume with `message.event ?? "message"` and `JSON.parse(message.data)`.

---

## 5. PDA Derivation & epochDay

`epochDay` (for daily PDAs) = `Math.floor(<ms timestamp> / (24 * 60 * 60 * 1000))`. In the validation
example it is derived from `validation.summary.updateStats.minTimestamp` (which is in **ms**).

Daily Scores Merkle Roots PDA (used by `validate_stat`) — **seeds = `"daily_scores_roots"` + epochDay as
2-byte little-endian** (confirmed verbatim):
```typescript
const epochDay = Math.floor(targetTs / (24 * 60 * 60 * 1000));   // targetTs = minTimestamp (ms)
const [dailyScoresPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("daily_scores_roots"), new BN(epochDay).toArrayLike(Buffer, "le", 2)],
  program.programId
);
```

Other PDAs (verbatim seeds):

| PDA                          | Seeds                                                                       |
| ---------------------------- | --------------------------------------------------------------------------- |
| Token Treasury               | `["token_treasury_v2"]`                                                      |
| Pricing Matrix               | `["pricing_matrix"]`                                                         |
| USDT Treasury                | `["usdt_treasury"]`                                                          |
| Daily Scores Roots (scores)  | `["daily_scores_roots", u16 epochDay LE]`                                    |
| Daily Batch Roots (odds)     | `["daily_batch_roots", u16 epochDay LE]`                                     |
| Ten Daily Fixtures Roots     | `["ten_daily_fixtures_roots", u16 alignedEpochDay LE]`, `aligned=floor(epochDay/10)*10` |

Treasury vaults are ATAs of the treasury PDA under `TOKEN_2022_PROGRAM_ID` (allowOwnerOffCurve=true).

---

## 6. Verbatim On-Chain Validation Example Code

### Setup + helpers (`toBytes32`, `toProofNodes`)

```typescript
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, ComputeBudgetProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import axios from "axios";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.Txoracle as anchor.Program<Txoracle>;

const httpClient = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${jwt}`,
    "X-Api-Token": apiToken
  },
  baseURL: "https://txline.txodds.com",
});

function toBytes32(value: string | number[] | Uint8Array): number[] {
  const bytes = Array.isArray(value)
    ? Uint8Array.from(value)
    : value instanceof Uint8Array
      ? value
      : value.startsWith("0x")
        ? Buffer.from(value.slice(2), "hex")
        : Buffer.from(value, "base64");

  if (bytes.length !== 32) {
    throw new Error(`Expected 32 bytes, received ${bytes.length}`);
  }
  return Array.from(bytes);
}

function toProofNodes(nodes: Array<{ hash: string | number[] | Uint8Array; isRightSibling: boolean }>) {
  return nodes.map((node) => ({
    hash: toBytes32(node.hash),
    isRightSibling: node.isRightSibling,
  }));
}
```

### Single-stat validation (verbatim)

```typescript
// Fetch validation data from API
const response = await httpClient.get("/api/scores/stat-validation", {
  params: {
    fixtureId: 17952170,
    seq: 941,
    statKey: 1002
  }
});
const validation = response.data;

// Prepare fixture summary
const fixtureSummary = {
  fixtureId: new BN(validation.summary.fixtureId),
  updateStats: {
    updateCount: validation.summary.updateStats.updateCount,
    minTimestamp: new BN(validation.summary.updateStats.minTimestamp),
    maxTimestamp: new BN(validation.summary.updateStats.maxTimestamp),
  },
  eventsSubTreeRoot: toBytes32(validation.summary.eventStatsSubTreeRoot),
};

// Prepare Merkle proofs
const fixtureProof = toProofNodes(validation.subTreeProof);
const mainTreeProof = toProofNodes(validation.mainTreeProof);

// Prepare stat to validate
const stat1 = {
  statToProve: validation.statToProve,
  eventStatRoot: toBytes32(validation.eventStatRoot),
  statProof: toProofNodes(validation.statProof),
};

// Define validation predicate
const predicate = {
  threshold: 0,
  comparison: { greaterThan: {} },
};

// Find the daily scores PDA
const targetTs = validation.summary.updateStats.minTimestamp;
const epochDay = Math.floor(targetTs / (24 * 60 * 60 * 1000));

const [dailyScoresPda] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("daily_scores_roots"),
    new BN(epochDay).toArrayLike(Buffer, "le", 2),
  ],
  program.programId
);

// Execute validation using view (read-only simulation)
const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
  units: 1_400_000
});

try {
  const isValid = await program.methods
    .validateStat(
      new BN(targetTs),
      fixtureSummary,
      fixtureProof,
      mainTreeProof,
      predicate,
      stat1,
      null,  // No second stat
      null   // No operator
    )
    .accounts({
      dailyScoresMerkleRoots: dailyScoresPda
    })
    .preInstructions([computeBudgetIx])
    .view();

  if (isValid) {
    console.log("On-chain stat validation passed");
  } else {
    console.log("On-chain stat validation rejected the predicate");
  }
} catch (err) {
  console.error("Validation simulation failed:", err);
}
```

### Two-stat validation (verbatim)

```typescript
// Fetch validation data including a second stat
const response2 = await httpClient.get("/api/scores/stat-validation", {
  params: {
    fixtureId: 17952170,
    seq: 941,
    statKey: 1002,
    statKey2: 1003
  }
});
const validation2 = response2.data;

// Prepare second stat (stat1 is already defined above)
const stat2 = {
  statToProve: validation2.statToProve2,
  eventStatRoot: toBytes32(validation2.eventStatRoot),
  statProof: toProofNodes(validation2.statProof2),
};

// Define operation and predicate
const op = { subtract: {} };
const predicate2 = {
  threshold: 5,
  comparison: { lessThan: {} },
};

// Execute two-stat validation (reuses variables from single-stat example)
const isValid2 = await program.methods
  .validateStat(
    new BN(targetTs),
    fixtureSummary,
    fixtureProof,
    mainTreeProof,
    predicate2,
    stat1,
    stat2,
    op
  )
  .accounts({
    dailyScoresMerkleRoots: dailyScoresPda,
  })
  .preInstructions([computeBudgetIx])
  .view();

console.log("Two-stat validation result:", isValid2);
```

### Snapshot fetch (verbatim)

```typescript
const fixtureId = 17952170;
const response = await httpClient.get(`/api/scores/snapshot/${fixtureId}?asOf=${Date.now()}`);
console.log(`Snapshot for fixture ${fixtureId}:`, response.data);

// Recent score updates by interval
const now = new Date();
const targetTime = new Date(now.getTime() - (5 * 300000)); // 25 minutes ago
const epochDay = Math.floor(targetTime.getTime() / 86400000);
const hourOfDay = targetTime.getUTCHours();
const interval = Math.floor(targetTime.getUTCMinutes() / 5);
const updates = await httpClient.get(`/api/scores/updates/${epochDay}/${hourOfDay}/${interval}`);
```

### SSE streaming (verbatim)

```typescript
// Helpers
type SseMessage = { id?: string; event?: string; data: string; retry?: number };

function parseSseBlock(block: string): SseMessage | null {
  const message: SseMessage = { data: "" };
  for (const rawLine of block.split(/\r?\n/)) {
    if (!rawLine || rawLine.startsWith(":")) continue;
    const separatorIndex = rawLine.indexOf(":");
    const field = separatorIndex === -1 ? rawLine : rawLine.slice(0, separatorIndex);
    const value =
      separatorIndex === -1 ? "" : rawLine.slice(separatorIndex + 1).replace(/^ /, "");
    if (field === "data") message.data += `${value}\n`;
    if (field === "event") message.event = value;
    if (field === "id") message.id = value;
    if (field === "retry") message.retry = Number(value);
  }
  message.data = message.data.replace(/\n$/, "");
  return message.data || message.event || message.id ? message : null;
}

async function* readSseMessages(response: Response): AsyncGenerator<SseMessage> {
  if (!response.body) throw new Error("Stream response has no body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let separator = buffer.match(/\r?\n\r?\n/);
      while (separator?.index !== undefined) {
        const block = buffer.slice(0, separator.index);
        buffer = buffer.slice(separator.index + separator[0].length);
        const message = parseSseBlock(block);
        if (message) yield message;
        separator = buffer.match(/\r?\n\r?\n/);
      }
    }
    buffer += decoder.decode();
    const message = parseSseBlock(buffer);
    if (message) yield message;
  } finally {
    reader.releaseLock();
  }
}

function parseSseData(data: string) {
  try { return JSON.parse(data); } catch { return data; }
}

// Connect (scores; swap URL for "/api/odds/stream")
const streamUrl = "https://txline.txodds.com/api/scores/stream";
const streamResponse = await fetch(streamUrl, {
  headers: {
    Authorization: `Bearer ${jwt}`,
    "X-Api-Token": apiToken,
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
  },
});
if (!streamResponse.ok) throw new Error(`Stream failed: ${streamResponse.status}`);
for await (const message of readSseMessages(streamResponse)) {
  console.log(message.event ?? "message", parseSseData(message.data));
}
```

---

## 7. Soccer Feed Encodings (World Cup)

### Game-phase ID table

| Name | ID | Description                    |
| ---- | -- | ------------------------------ |
| NS   | 1  | Not started                    |
| H1   | 2  | First half in play             |
| HT   | 3  | Halftime                       |
| H2   | 4  | Second half in play            |
| F    | 5  | Ended (finished)               |
| WET  | 6  | Waiting for Extra Time         |
| ET1  | 7  | Extra Time first half in play  |
| HTET | 8  | Extra Time halftime            |
| ET2  | 9  | Extra Time second half in play |
| FET  | 10 | Ended after Extra Time         |
| WPE  | 11 | Waiting for Penalty Shootout   |
| PE   | 12 | Penalty Shootout in progress   |
| FPE  | 13 | Ended after Penalty Shootout   |
| I    | 14 | Interrupted                    |
| A    | 15 | Abandoned                      |
| C    | 16 | Cancelled                      |
| TXCC | 17 | TX Coverage Cancelled          |
| TXCS | 18 | TX Coverage Suspended          |
| P    | 19 | Postponed                      |

### Stat key encoding — `(period * 1000) + base_key`

Base keys 1–8 (full-game totals):

| Key | Statistic                        |
| --- | -------------------------------- |
| 1   | Participant 1 Total Goals        |
| 2   | Participant 2 Total Goals        |
| 3   | Participant 1 Total Yellow Cards |
| 4   | Participant 2 Total Yellow Cards |
| 5   | Participant 1 Total Red Cards    |
| 6   | Participant 2 Total Red Cards    |
| 7   | Participant 1 Total Corners      |
| 8   | Participant 2 Total Corners      |

Period multipliers (added to base key):

| Period               | Add  | Example |
| -------------------- | ---- | ------- |
| Full game            | 0    | `2` = P2 Total Goals |
| First Half (H1)      | 1000 | `1001` = P1 H1 Goals |
| Second Half (H2)     | 2000 | `2001` = P1 H2 Goals |
| Extra Time 1 (ET1)   | 3000 | `3001` = P1 ET1 Goals |
| Extra Time 2 (ET2)   | 4000 | `4001` = P1 ET2 Goals |
| Penalty Shootout (PE)| 5000 | `5001` = P1 PE Goals |

> Worked example from the validation snippet: `statKey: 1002` = `1000 + 2` = Participant 2 First-Half
> Total Goals; `statKey2: 1003` = `1000 + 3` = Participant 1 First-Half Total Yellow Cards.
> (The on-chain `ScoreStat.period` field is a separate `i32`; the `key` is the full encoded value.)

### Other feeds (for reference; settlement engine is soccer/World Cup)

- **Basketball** stat encoding uses `(half*1000 OR quarter*10000) + base_key`; full-game keys 1–36; phase
  IDs include NS=1, Q1=2…Q4=8, HT=5, F=9, OT=11, H1=19, H2=20 (NCAA). Period adds: H1+1000, H2+2000,
  Q1+10000, Q2+20000, Q3+30000, Q4+40000.
- **American Football** stat encoding `(half*1000 OR quarter*10000) + base_key`; full-game keys 1–16
  (1/2 = P1/P2 Total Score, 3/4 = Touchdowns, 5/6 = Field Goals, 7/8 = 1pt Conversions, …); standard
  phases NS=1…F=9, plus overtime phases OT1=1011, OB1=1012, OT2=2011, OB2=2012 (…to OT12).

---

## 8. On-Chain Anchor Constants (devnet IDL, txoracle v1.5.2)

`TOKEN_DECIMALS = 6`, `USDT_DECIMALS_FACTOR = 1_000_000`, `TOKEN_PRICE_IN_USDT = 1000`,
`MIN_DEPOSIT_TOKENS = 1_000_000`, `SUBSCRIPTION_DURATION = 3600` (s), `STAKE_AMOUNT = 1`,
`TXLINE_MINT = 4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG` (devnet),
`USDT_MINT = ELWTKspHKCnCfCiCiqYw1EDH77k8VCP74dK9qytG2Ujh` (devnet),
`BACKEND_ADMIN_PUBKEY = Ah5xwzHxRYBBV3BWHDCHdfzQJfBehzGQcc7A9QX1DLUB`.
The `Txoracle` TS type / IDL come from `documentation/programs/devnet` (devnet) or `…/mainnet`.
