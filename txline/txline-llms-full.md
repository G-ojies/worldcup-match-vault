# Activate subscription and retrieve API token
Source: https://txline-docs.txodds.com/api-reference/authentication/activate-subscription-and-retrieve-api-token

https://txline.txodds.com/docs/docs.yaml post /api/token/activate
Activate a user subscription and issue a long-lived API token.
Supports three modes based on the on-chain transaction:
1. Legacy subscriptions (pass empty leagues array).
2. Standard matrix subscriptions (pass empty leagues array).
3. Custom matrix subscriptions (pass requested league IDs up to the purchased limit).
The entire request intent must be cryptographically signed by the user's wallet.




# Start a new guest session
Source: https://txline-docs.txodds.com/api-reference/authentication/start-a-new-guest-session

https://txline.txodds.com/docs/docs.yaml post /auth/guest/start
Initiates a new, anonymous guest session and returns a JSON Web Token (JWT).
This token must be provided as a Bearer token in the Authorization header for subsequent calls,
such as the token activation endpoint. This JWT token expires after 30 days.




# Get a Merkle proof for a specific fixture update
Source: https://txline-docs.txodds.com/api-reference/fixtures/get-a-merkle-proof-for-a-specific-fixture-update

https://txline.txodds.com/docs/docs.yaml get /api/fixtures/validation
Each fixture returned or referenced in the TxODDS Oracle API is part of an hourly batch of fixture updates.
Blockchain holds the Merkle root (ultimate cryptographic containment proof) of each fixture belonging to that batch.
This endpoint returns the Merkle proof, i.e., the hashes along the branch of the Merkle tree for the batch up to but not inclusive of that Merkle root.
The user can then call on-chain validation directly to get a cryptographic validation that a given fixture update was published
by TxODDS as confirmed by the published Merkle root. This on-chain transaction requires the fixture record and the Merkle proof returned here.




# Get a Merkle proof for an entire hourly batch of fixtures
Source: https://txline-docs.txodds.com/api-reference/fixtures/get-a-merkle-proof-for-an-entire-hourly-batch-of-fixtures

https://txline.txodds.com/docs/docs.yaml get /api/fixtures/batch-validation
Fixture data is grouped into hourly batches. Each batch is represented by a Merkle Tree, and its root hash is published on-chain.
This Merkle root is contained within the batch's metadata.

This endpoint allows you to validate the integrity of the batch metadata itself. It returns the metadata for the specified hourly batch, along with a Merkle proof.

A user can take this proof and the metadata (which includes the final Merkle root) and use it to verify against a higher-level tree or commitment, thus cryptographically proving the integrity of the entire batch's claimed state.




# Get all fixture updates for a single fixture on a given day
Source: https://txline-docs.txodds.com/api-reference/fixtures/get-all-fixture-updates-for-a-single-fixture-on-a-given-day

https://txline.txodds.com/docs/docs.yaml get /api/fixtures/updates/{epochDay}/{hourOfDay}



# Get the latest snapshot of fixtures, optionally starting at or within 30 days after a given epoch day
Source: https://txline-docs.txodds.com/api-reference/fixtures/get-the-latest-snapshot-of-fixtures-optionally-starting-at-or-within-30-days-after-a-given-epoch-day

https://txline.txodds.com/docs/docs.yaml get /api/fixtures/snapshot



# Get a json array of all odd updates from a specific historical 5-minute interval
Source: https://txline-docs.txodds.com/api-reference/odds/get-a-json-array-of-all-odd-updates-from-a-specific-historical-5-minute-interval

https://txline.txodds.com/docs/docs.yaml get /api/odds/updates/{epochDay}/{hourOfDay}/{interval}



# Get a Merkle proof for a specific odds update
Source: https://txline-docs.txodds.com/api-reference/odds/get-a-merkle-proof-for-a-specific-odds-update

https://txline.txodds.com/docs/docs.yaml get /api/odds/validation
Each odds update is part of a batch whose state is committed to the blockchain via a Merkle root.
This endpoint returns the cryptographic proof for a single odds update, identified by its unique messageId.
The proof consists of the hashes along the branch of the Merkle tree, which can be used to reconstruct the root.
A user can then use this proof and the odds record in an on-chain transaction to cryptographically verify that the odds update was
published by the TxODDS Oracle as confirmed by the on-chain Merkle root.




# Get a real-time Server-Sent Events stream of odds updates
Source: https://txline-docs.txodds.com/api-reference/odds/get-a-real-time-server-sent-events-stream-of-odds-updates

https://txline.txodds.com/docs/docs.yaml get /api/odds/stream
A long-lived stream of odds updates.

The stream consists of two types of events:
1. **Data messages:** These have an `id` in the format `timestamp:index` and `data` containing a JSON object for a single Odds record.
2. **Heartbeats:** These have an `event` field set to `heartbeat` and may have data like `{"Ts": 12345}`.




# Get currently live odds updates for a single fixture
Source: https://txline-docs.txodds.com/api-reference/odds/get-currently-live-odds-updates-for-a-single-fixture

https://txline.txodds.com/docs/docs.yaml get /api/odds/updates/{fixtureId}
Return all available odds offers for a single fixture from the current, in-memory 5-minute cache.



# Get snapshots of the latest odds for a fixture
Source: https://txline-docs.txodds.com/api-reference/odds/get-snapshots-of-the-latest-odds-for-a-fixture

https://txline.txodds.com/docs/docs.yaml get /api/odds/snapshot/{fixtureId}
Return the latest odds for each unique market line for a given fixture. If the 'asOf' parameter is provided, the snapshots are taken at that point in time from historical data. Otherwise, it returns the current live snapshot if it exists within the current 5-minutes interval.



# Request a partially signed purchase quote given the wallet public key and required TxLINE amount in whole units
Source: https://txline-docs.txodds.com/api-reference/purchase/request-a-partially-signed-purchase-quote-given-the-wallet-public-key-and-required-txline-amount-in-whole-units

https://txline.txodds.com/docs/docs.yaml post /api/guest/purchase/quote
Authorize and generate a partially signed Solana transaction for purchasing TxLINE utility tokens.

**Pricing & Fees:**
- **Base Rate:** 1,000 TxLINE = 1 USDT
- **Premium/Markup:** Currently 0% (0 basis points)

**Prerequisites:**
- The `buyerPubkey` wallet must hold an active Associated Token Account (ATA) for USDT.
- The wallet must have a sufficient USDT balance to cover the total quoted cost.

The response includes a financial breakdown of the exact base cost and any applied premium fees. The returned transaction payload must be signed by the user's wallet before submission.




# Get a json array of all score updates from a specific historical 5-minute interval (no live data is returned)
Source: https://txline-docs.txodds.com/api-reference/scores/get-a-json-array-of-all-score-updates-from-a-specific-historical-5-minute-interval-no-live-data-is-returned

https://txline.txodds.com/docs/docs.yaml get /api/scores/updates/{epochDay}/{hourOfDay}/{interval}



# Get a real-time Server-Sent Events stream of scores updates
Source: https://txline-docs.txodds.com/api-reference/scores/get-a-real-time-server-sent-events-stream-of-scores-updates

https://txline.txodds.com/docs/docs.yaml get /api/scores/stream
A long-lived stream of scores updates.

The stream consists of two types of events:
1. **Data messages:** These have an `id` in the format `timestamp:index` and `data` containing a JSON object for a single Scores record.
2. **Heartbeats:** These have an `event` field set to `heartbeat` and may have data like `{"Ts": 12345}`.




# Get a three-stage Merkle proof for a single score statistic
Source: https://txline-docs.txodds.com/api-reference/scores/get-a-three-stage-merkle-proof-for-a-single-score-statistic

https://txline.txodds.com/docs/docs.yaml get /api/scores/stat-validation
This endpoint provides a deep cryptographic proof for one or two statistics within a single scores update. The TxODDS Oracle's data is structured in a three-level Merkle hierarchy:

1. A main batch contains summaries for multiple fixtures.
2. Each fixture summary is the root of a sub-tree of all score update events for that fixture.
3. Each score update event is the root of a sub-tree of all the individual statistics it contains.

This endpoint returns the full set of proofs needed to connect the stat(s) all the way to the main batch root published on-chain.
To request a proof for a second stat (for use in two-stat predicates like comparing home vs. away scores), include the optional `statKey2` query parameter.
With the returned data in hand, the user can execute an on-chain transaction to validate that a supplied `TraderPredicate` with optional `BinaryOperation` holds against the
supplied stat(s), for example, in the case of the single stat, validating that the team's number of touchdowns exceeded 2 at the end of the first quarter, or,
in the case of two stats, validating that the scores difference exceeded 2--see the public repository for on-chain examples: https://github.com/txodds/tx-on-chain.




# Get snapshots for each action in the latest score events for a fixture
Source: https://txline-docs.txodds.com/api-reference/scores/get-snapshots-for-each-action-in-the-latest-score-events-for-a-fixture

https://txline.txodds.com/docs/docs.yaml get /api/scores/snapshot/{fixtureId}



# Get the full sequence of score updates for a single fixture
Source: https://txline-docs.txodds.com/api-reference/scores/get-the-full-sequence-of-score-updates-for-a-single-fixture

https://txline.txodds.com/docs/docs.yaml get /api/scores/historical/{fixtureId}
Return a json array of all score updates for a single fixture provided its start time is between two weeks and six hours in the past from current time.



# Get the sequence of score updates for a single fixture within the current 5-min interval
Source: https://txline-docs.txodds.com/api-reference/scores/get-the-sequence-of-score-updates-for-a-single-fixture-within-the-current-5-min-interval

https://txline.txodds.com/docs/docs.yaml get /api/scores/updates/{fixtureId}
Return a json array of all score updates for a single fixture included within the current 5-minute interval with live data if it exists.



# Fetching Snapshots
Source: https://txline-docs.txodds.com/documentation/examples/fetching-snapshots

Retrieve fixtures, odds, and scores data

<Info>
  **API Endpoints**: Use `https://txline.txodds.com/api/` for mainnet or `https://txline-dev.txodds.com/api/` for devnet
</Info>

<Info>
  **Prerequisites**: Complete [Quickstart activation](/documentation/quickstart) or [World Cup Free Tier activation](/documentation/worldcup) first. The snippets assume `jwt` is the guest JWT from `/auth/guest/start` and `apiToken` is the value returned by `/api/token/activate`.
</Info>

## Fetch Fixtures Snapshot

Get all fixtures for a specific competition or all competitions.

<Note>
  `Participant1IsHome` is the feed's home/away designation for mapping `Participant1` and `Participant2`; it is not a venue guarantee. For neutral competitions such as the World Cup, `Participant1IsHome: true` means `Participant1` is listed as the home side for feed purposes, even if the match is not played in that team's country.
</Note>

```typescript theme={null}
import axios from "axios";

const httpClient = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${jwt}`,
    "X-Api-Token": apiToken
  },
  baseURL: "https://txline.txodds.com",
});

// Get fixtures for specific competition
const fixturesResponse = await httpClient.get("/api/fixtures/snapshot", {
  params: {
    competitionId: 500005, // NCAA Division I FBS
  },
});
const fixtures = fixturesResponse.data;

console.log(`Retrieved ${fixtures.length} fixtures`);
fixtures.slice(0, 3).forEach((fixture, index) => {
  const homeTeam = fixture.Participant1IsHome
    ? fixture.Participant1
    : fixture.Participant2;
  const awayTeam = fixture.Participant1IsHome
    ? fixture.Participant2
    : fixture.Participant1;

  console.log(`${index + 1}. ${homeTeam} vs ${awayTeam}`);
  console.log(`   ID: ${fixture.FixtureId}, Start: ${new Date(fixture.StartTime).toISOString()}`);
});

// Get all fixtures
const allFixturesResponse = await httpClient.get("/api/fixtures/snapshot");
const allFixtures = allFixturesResponse.data;

console.log(`Retrieved ${allFixtures.length} total fixtures`);
```

## Fetch Odds Snapshot

Get odds data for a specific fixture or time period.

```typescript theme={null}
const fixtureId = 17271370;

// Get odds for specific fixture
const fixtureOddsResponse = await httpClient.get(
  `/api/odds/snapshot/${fixtureId}`
);
const fixtureOdds = fixtureOddsResponse.data;

console.log(`Retrieved ${fixtureOdds.length} odds entries`);

// Get odds for time period
const epochDay = 20085;
const hourOfDay = 15;
const interval = 0;

const updatesResponse = await httpClient.get(
  `/api/odds/updates/${epochDay}/${hourOfDay}/${interval}`
);
const updates = updatesResponse.data;

console.log(`Retrieved ${updates.length} odds updates`);
```

## Fetch Scores Snapshot

Get scores data for a specific fixture or time period.

```typescript theme={null}
const fixtureId = 17271370;

// Get scores snapshot for fixture
const snapshotScoresResponse = await httpClient.get(
  `/api/scores/snapshot/${fixtureId}`
);
const snapshotScores = snapshotScoresResponse.data;

console.log(`Retrieved ${snapshotScores.length} snapshot scores entries`);

// Get live scores updates
const liveScoresResponse = await httpClient.get(
  `/api/scores/updates/${fixtureId}`
);
const liveScores = liveScoresResponse.data;

console.log(`Retrieved ${liveScores.length} live scores updates`);

// Get scores for time period
const epochDay = 20085;
const hourOfDay = 15;
const interval = 0;

const historicalUpdatesResponse = await httpClient.get(
  `/api/scores/updates/${epochDay}/${hourOfDay}/${interval}`
);
const historicalUpdates = historicalUpdatesResponse.data;

console.log(`Retrieved ${historicalUpdates.length} historical scores updates`);
```


# On-Chain Validation
Source: https://txline-docs.txodds.com/documentation/examples/onchain-validation

Validate scores data using cryptographic Merkle proofs

<Info>
  **Prerequisites**: Complete the [Quickstart](/documentation/quickstart) guide to set up authentication and subscriptions. The snippets assume `jwt` is the guest JWT from `/auth/guest/start` and `apiToken` is the value returned by `/api/token/activate`.
</Info>

<Info>
  **API Endpoints**: Use `https://txline.txodds.com/api/` for mainnet or `https://txline-dev.txodds.com/api/` for devnet
</Info>

<Info>
  **Program setup**: The `Txoracle` type used below comes from the generated types in [IDL & Types (Mainnet)](/documentation/programs/mainnet) or [IDL & Types (Devnet)](/documentation/programs/devnet). Use [Program Addresses](/documentation/programs/addresses) for program IDs and PDA derivation.
</Info>

## Overview

This guide demonstrates how to validate scores data against on-chain Merkle roots using cryptographic proofs. You'll learn how to fetch validation data and perform both single-stat and two-stat validations.

## Setup

```typescript theme={null}
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, ComputeBudgetProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import axios from "axios";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.Txoracle as anchor.Program<Txoracle>;

// Create HTTP client with authentication
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

## Fetching Scores Data

Retrieve a snapshot of scores for a specific fixture:

```typescript theme={null}
const fixtureId = 17952170;
const response = await httpClient.get(`/api/scores/snapshot/${fixtureId}?asOf=${Date.now()}`);
console.log(`Snapshot for fixture ${fixtureId}:`, response.data);
```

Search for recent score updates:

```typescript theme={null}
const now = new Date();
const targetTime = new Date(now.getTime() - (5 * 300000)); // 25 minutes ago
const epochDay = Math.floor(targetTime.getTime() / 86400000);
const hourOfDay = targetTime.getUTCHours();
const interval = Math.floor(targetTime.getUTCMinutes() / 5);

const updates = await httpClient.get(`/api/scores/updates/${epochDay}/${hourOfDay}/${interval}`);
console.log(`Updates found:`, updates.data);
```

## Single-Stat Validation

Validate a single statistic against on-chain Merkle roots:

```typescript theme={null}
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

## Two-Stat Validation

Validate a comparison between two stats (e.g., score difference). This example builds on the single-stat validation above:

```typescript theme={null}
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

## Real-Time Scores Streaming

Subscribe to real-time scores updates:

```typescript theme={null}
const streamUrl = "https://txline.txodds.com/api/scores/stream";
const streamResponse = await fetch(streamUrl, {
  headers: {
    Authorization: `Bearer ${jwt}`,
    "X-Api-Token": apiToken,
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
  },
});

if (!streamResponse.ok) {
  throw new Error(`Stream failed: ${streamResponse.status}`);
}

// Reuse the readSseMessages and parseSseData helpers from the Streaming Data guide.
for await (const message of readSseMessages(streamResponse)) {
  console.log(message.event ?? "message", parseSseData(message.data));
}
```

## Validation Use Cases

On-chain validation enables trustless verification of:

* **Trading Settlement** - Prove score outcomes for bet settlement
* **Conditional Logic** - Execute smart contract logic based on verified game stats
* **Dispute Resolution** - Provide cryptographic proof of game data
* **Automated Markets** - Settle prediction markets with on-chain verification
* **Score Differentials** - Validate margins and score differences for complex betting scenarios


# Streaming Data
Source: https://txline-docs.txodds.com/documentation/examples/streaming-data

Real-time odds and scores updates via Server-Sent Events

<Info>
  **API Endpoints**: Use `https://txline.txodds.com/api/` for mainnet or `https://txline-dev.txodds.com/api/` for devnet
</Info>

<Info>
  **Prerequisites**: Complete [Quickstart activation](/documentation/quickstart) or [World Cup Free Tier activation](/documentation/worldcup) first. The snippets assume `jwt` is the guest JWT from `/auth/guest/start` and `apiToken` is the value returned by `/api/token/activate`.
</Info>

## SSE Parsing Helper

```typescript theme={null}
type SseMessage = {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
};

function parseSseBlock(block: string): SseMessage | null {
  const message: SseMessage = { data: "" };

  for (const rawLine of block.split(/\r?\n/)) {
    if (!rawLine || rawLine.startsWith(":")) continue;

    const separatorIndex = rawLine.indexOf(":");
    const field = separatorIndex === -1 ? rawLine : rawLine.slice(0, separatorIndex);
    const value =
      separatorIndex === -1
        ? ""
        : rawLine.slice(separatorIndex + 1).replace(/^ /, "");

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
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}
```

## Stream Odds Updates

Connect to the odds stream for real-time updates.

```typescript theme={null}
const streamUrl = "https://txline.txodds.com/api/odds/stream";
const streamResponse = await fetch(streamUrl, {
  headers: {
    Authorization: `Bearer ${jwt}`,
    "X-Api-Token": apiToken,
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
  },
});

if (!streamResponse.ok) {
  throw new Error(`Stream failed: ${streamResponse.status}`);
}

for await (const message of readSseMessages(streamResponse)) {
  console.log(message.event ?? "message", parseSseData(message.data));
}
```

## Stream Scores Updates

Connect to the scores stream for real-time updates.

```typescript theme={null}
const streamUrl = "https://txline.txodds.com/api/scores/stream";
const streamResponse = await fetch(streamUrl, {
  headers: {
    Authorization: `Bearer ${jwt}`,
    "X-Api-Token": apiToken,
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
  },
});

if (!streamResponse.ok) {
  throw new Error(`Stream failed: ${streamResponse.status}`);
}

for await (const message of readSseMessages(streamResponse)) {
  console.log(message.event ?? "message", parseSseData(message.data));
}
```

## Historical Scores

Fetch the complete sequence of score updates for a fixture that started between two weeks and six hours ago.

```typescript theme={null}
import axios from "axios";

const httpClient = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${jwt}`,
    "X-Api-Token": apiToken
  },
  baseURL: "https://txline.txodds.com",
});

const fixtureId = 17952170;
const historicalScores = await httpClient.get(`/api/scores/historical/${fixtureId}`);

console.log(`Retrieved ${historicalScores.data.length} score updates for fixture ${fixtureId}`);
historicalScores.data.forEach((update, index) => {
  console.log(`${index + 1}. Seq: ${update.seq}, TS: ${update.ts}, State: ${update.gameState}`);
});
```

<Info>
  **Historical Availability**: This endpoint only returns data for fixtures with start times between two weeks and six hours in the past from the current time.
</Info>

<Info>
  **Stream Compression**: To reduce bandwidth usage by up to 70-80%, add `"Accept-Encoding": "gzip"` to your headers. You'll need to decompress the response chunks using `gunzipSync()` from Node's `zlib` module before decoding.
</Info>


# World Cup Hackathon Terms and Conditions
Source: https://txline-docs.txodds.com/documentation/legal/hackathon-terms

Official terms and conditions for The TxODDS Hackathon Challenge 2026

# The TxODDS Hackathon Challenge 2026 - Official Terms and Conditions

**IMPORTANT: PLEASE READ THESE TERMS AND CONDITIONS CAREFULLY. BY PARTICIPATING IN THE TxODDS HACKATHON CHALLENGE 2026 (THE "HACKATHON"), YOU AGREE TO BE BOUND BY THESE OFFICIAL TERMS AND CONDITIONS. IF YOU DO NOT AGREE TO ALL OF THESE TERMS, DO NOT PARTICIPATE IN THE HACKATHON.**

## 1. Introduction

1. **TxODDS**: TXODDS Services LLC an Illinois based entity. ("TxODDS", "we," "us," or "our").

2. **Hackathon Goal**: TxODDS streams real-time World Cup data—including scores, match events, and odds—backed by cryptographic signatures anchored on Solana via its TxLINE product. The Hackathon invites developers to leverage these data streams to build interesting and innovative products. The Hackathon is a skill-based competition and winners shall be determined by reference to the judging criteria set out in these Terms and the brief.

3. **Acceptance of Terms**: By registering for or participating in the Hackathon, you ("Participant," "you," or "your") unconditionally accept and agree to comply with and be bound by these Terms and Conditions ("Terms"), and any other rules, terms, guidelines, or policies referenced herein or communicated by TxODDS or Superteam Earn. These Terms are in addition to the terms and conditions contained on the Superteam Earn website which shall also apply to the Hackathon.

4. **Modifications**: TxODDS reserves the right to modify these Terms and Conditions at any time, with or without prior notice. Any changes will be posted on the Hackathon website. It is your responsibility to review these Terms periodically for updates. Continued participation after any modifications signifies your acceptance of the revised Terms.

## 2. Eligibility

1. **General Eligibility**:
   * Participants must be 18 years of age or older.
   * Participants must be legally able to participate in the Hackathon in their jurisdiction.

2. **Exclusions**:
   * Employees, contractors, directors, and officers of TxODDS, its affiliates, subsidiaries or other entities within it's group and immediate family members (spouse, parents, siblings, and children) and/or those living in the same household of each such employee are not eligible to participate.

3. **Team Participation**:
   * Participants may participate individually or as part of a team.
   * Where participating as a team the maximum number of participants which make up a team shall be no more than 3.
   * All team members must meet the individual eligibility requirements.
   * Each team must designate a team leader who will be the primary point of contact with TxODDS and Superteam Earn.

## 3. Registration and Participation

1. **Participation Process**: Participants must register online through the Superteam Earn website [https://superteam.fun](https://superteam.fun). All required information must be provided accurately and completely.

2. **Participation Requirements**:
   * Participants must have access to their own hardware, software, and internet connectivity.
   * Participants must adhere to the Hackathon schedule and deadlines.

## 4. Conduct

1. **Originality**: All submitted projects must be original work created during the Hackathon period. Pre-existing code or components are permitted only if they are publicly available and properly attributed (e.g., open-source libraries, APIs). Significant portions of the project must be developed during the Hackathon.

2. **No Cheating**: Any form of cheating, including but not limited to, plagiarism, submitting work not created by the team, or any attempt to unfairly gain an advantage, will result in immediate disqualification.

3. **Compliance with Laws**: Participants must comply with all applicable local, national, and international laws and regulations including those related to gambling and gambling related technology products. TxODDS may exclude any participant from restricted or prohibited jurisdictions.

4. **Data Privacy**: Participants must respect the privacy of others and comply with all applicable data protection laws.

5. **Consequences of Violations**: TxODDS reserves the right to disqualify any participant or team who violates these Terms or engages in any conduct deemed disruptive, unethical, or harmful to the Hackathon. Disqualified participants will forfeit any prizes.

## 5. Project Submission and Judging

1. **Submission Requirements**:
   * Projects must be submitted and meet the requirements of the brief describing the relevant tracks.
   * Each submission must be provided in a form that enables TxODDS and its judges to access, review, test and evaluate the submission without incurring any fee, charge or expense. Participants shall provide all credentials, documentation, test environments, demonstration materials and other resources reasonably required for evaluation. TxODDS shall not be required to purchase any software, subscription, licence, token, cryptocurrency, digital asset or third-party service, nor establish any blockchain wallet or account with a third party, in order to assess or test a submission. Submissions may be disqualified should this requirement not be met.
   * TxODDS does not operate, control or guarantee the availability, performance, security or functionality of the Solana blockchain or any third-party wallet, validator, RPC provider, exchange, bridge, protocol or other blockchain-related service. Participants are solely responsible for obtaining and maintaining any accounts, wallets, software, tokens, digital assets, network access or other resources required to participate in the Hackathon. Participants shall bear all transaction fees, gas fees, network fees and other costs incurred in connection with their participation. TxODDS shall have no liability for any loss, delay, failed transaction, network disruption, congestion, fork, exploit, security incident, loss of digital assets or other blockchain-related event.
   * The Hackathon is open only to natural persons. Entries must be created, developed and submitted by human participants. Automated systems, bots, autonomous agents, scripts or other non-human entities may not register for, participate in or submit entries to the Hackathon. TxODDS reserves the right to require participants to verify their identity and involvement in the creation of a submission. Any submission which, in TxODDS’ reasonable opinion, has been generated, submitted or materially controlled by a bot, autonomous agent or other non- human process may be disqualified.

2. **Judging Criteria**: Projects will be judged based on the criteria provided in the brief.

3. **Judging Process**: A panel of judges, selected by TxODDS, will evaluate the submissions. The judges' decisions are final and binding.

4. **Disqualification**: TxODDS reserves the right to disqualify any submission that does not meet the specified requirements, violates these Terms, or is deemed inappropriate or offensive.

5. **No Obligation**: Participation in the Hackathon does not create any obligation on TxODDS to licence, acquire, commercialise, fund or otherwise engage with any submission.

## 6. Intellectual Property

1. **Participant Ownership**: Participants retain all ownership and intellectual property rights in their submitted projects and any underlying code, designs, or content created during the Hackathon, subject to the licenses granted herein.

2. **License to TxODDS**: By submitting a project, participants grant TxODDS and its partners a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, and transferable license to:
   * Use, reproduce, distribute, display, test, for purposes related to the Hackathon, including but not limited to:
     * Showcasing winning projects on the Hackathon website, social media, and promotional materials.
     * Internal evaluation and review.
     * Demonstrating the outcomes of the Hackathon to stakeholders.
   * Use participants' names, likenesses, and biographical information in connection with the Hackathon and its promotion.

3. **Third-Party IP**: Participants are responsible for ensuring that their projects do not infringe upon the intellectual property rights of any third party. If a project incorporates third-party code or assets, participants must ensure they have the necessary licenses or permissions for such use and must clearly attribute all third-party intellectual property. Nothing in the Hackathon grants any right to use FIFA branding, logos, marks or intellectual property. Participants must not imply any sponsorship, endorsement or affiliation with FIFA or any tournament organiser.

4. Nothing in the Hackathon or these Terms grants any participant any ownership rights in TxODDS's Data, APIs, software, algorithms, methodologies, scoring systems, blockchain infrastructure or intellectual property rights.

5. **Confidentiality**: TxODDS does not guarantee the confidentiality of any submitted project. Participants should only submit information that they are comfortable making public.

## 7. Data

1. TxODDS shall provide certain Data to the Participant to utilise for the Hackathon. Data is licensed to the Participants solely for participation in the Hackathon. All rights not expressly granted are reserved. The licence automatically terminates upon conclusion of the Hackathon. Participants shall not redistribute, publish, sublicense, sell, share or otherwise make available any Data.

2. Participants shall not attempt to extract, reconstruct, replicate or create competing products using the Data, APIs, methodologies or systems made available by TxODDS.

3. The Data, APIs, software, documentation, data, blockchain infrastructure and all related materials are provided on an "as is" and "as available" basis. To the fullest extent permitted by law, TxODDS disclaims all warranties, representations and conditions, whether express, implied or statutory, including any warranties of accuracy, completeness, availability, merchantability, fitness for a particular purpose and non-infringement.

## 8. Prizes

1. **Prize Details**: The prizes for each track are detailed in the brief. Participants can enter multiple tracks but cannot win more than one prize in total. Unless detailed otherwise, prizes shall be paid in the stablecoin designated by TxODDS. Winners are solely responsible for providing a compatible wallet address and for maintaining access to any wallet, exchange account or other infrastructure required to receive and use the prize. TxODDS shall not be responsible for any loss arising from an incorrect wallet address, loss of wallet access, blockchain network failure, exchange failure, sanctions restrictions, regulatory restrictions, stablecoin de-pegging, market fluctuations, transaction fees or any other event outside TxODDS' control. TxODDS reserves the right in its discretion to substitute an alternative stablecoin or an equivalent cash payment where reasonably necessary for legal, regulatory, technical or operational reasons. Fees (including gas fees) incurred to transfer the prize shall be deducted from the relevant prize unless stated otherwise. Prize payments may come from Superteam Earn.

2. **Prize Conditions**:
   * Prizes are non-transferable and no substitution will be made except as provided TxODDS's sole discretion.
   * Winners are solely responsible for any and all applicable taxes, fees, and surcharges associated with the receipt and use of a prize.
   * Unless Superteam Earn provides otherwise, prizes will be awarded to the participant, and where the winning participants are a team they must nominate one winner to receive the prize and it is the team's responsibility to divide the prize among its members. TxODDS is not responsible for internal team disputes regarding prize distribution.
   * TxODDS reserves the right to substitute a prize of equal or greater value if the advertised prize becomes unavailable.
   * Prize payments may be subject to identity verification, eligibility verification and compliance checks.
   * TxODDS may withhold or refuse payment where it reasonably suspects fraud, rule breaches or ineligibility.
   * TxODDS reserves the right not to award any prize if no submission meets the required standard.

3. **Winner Notification**: Winners will be notified via email to the Participant or if a team to the nominated team leader. Winners may be required to sign and return an affidavit of eligibility and liability/publicity release.

4. **Forfeiture of Prize**: If a potential winner cannot be contacted, fails to sign and/or return any required documents within 30 days from the judge's decision, or is found to be ineligible, the prize may be forfeited and an alternate winner selected.

## 9. Publicity

By participating in the Hackathon, participants grant TxODDS and its partners the right to use their names, likenesses, photographs, voices, and biographical information for promotional and publicity purposes related to the Hackathon, in any media now known or hereafter devised, without further compensation or permission, except where prohibited by law.

## 10. Disclaimer of Warranty; Limitation of Liability

1. **No Warranties**: THE HACKATHON AND ALL PRIZES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

2. **Limitation of Liability**: TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, TXODDS, ITS AFFILIATES, SUBSIDIARIES, AND THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS (COLLECTIVELY, THE "TXODDS PARTIES") SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF: PROFITS, DATA, USE, GOODWILL, OPPORTUNITY OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE HACKATHON OR DATA; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE HACKATHON; (III) ANY CONTENT OBTAINED FROM THE HACKATHON; AND (IV) UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE) OR ANY OTHER LEGAL THEORY, WHETHER OR NOT TXODDS HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE, AND EVEN IF A REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.

3. **Liability Cap**: Nothing in these Terms shall exclude or limit liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any other liability which cannot lawfully be excluded or limited. Subject to the foregoing, TxODDS' total aggregate liability arising out of or in connection with the Hackathon, these Terms, any submission, the Data, any API, platform, blockchain infrastructure, website or related services, whether in contract, tort (including negligence), breach of statutory duty or otherwise, shall not exceed USD 500.

4. **Force Majeure**: TxODDS is not responsible for any inability to hold the Hackathon, or to award prizes, due to delays or failures caused by events beyond its reasonable control, including but not limited to acts of God, war, terrorism, pandemics, natural disasters, strikes, or technical failures.

## 11. Indemnification

You agree to indemnify, defend, and hold harmless TxODDS from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or in any way connected with:

* Your participation in the Hackathon.
* Your violation of these Terms and Conditions.
* Your violation of any rights of another, including but not limited to intellectual property rights.
* Any project or content you submit.
* Your personal information as described in the Privacy Policy.

## 12. Governing Law and Dispute Resolution

1. **Governing Law**: These Terms and Conditions shall be governed by and construed in accordance with the laws of England, without regard to its conflict of law principles.

2. **Dispute Resolution**:
   * **Exclusive Jurisdiction**: Any dispute, controversy, or claim arising out of or relating to these Terms and Conditions or the Hackathon shall be subject to the exclusive jurisdiction of the courts located in England.

3. **Injunctive Relief**: Notwithstanding the foregoing, TxODDS shall have the right to seek injunctive or other equitable relief in any court of competent jurisdiction to prevent the actual or threatened infringement, misappropriation, or violation of its copyrights, trademarks, trade secrets, or other intellectual property rights.

## 13. General Provisions

1. **Entire Agreement**: These Terms and Conditions, together with any documents referenced herein, constitute the entire agreement between you and TxODDS regarding the Hackathon.

2. **Severability**: If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect and enforceable.

3. **No Waiver**: The failure of TxODDS to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision.

4. **Headings**: The headings in these Terms are for convenience only and have no legal or contractual effect.


# Terms and Conditions
Source: https://txline-docs.txodds.com/documentation/legal/terms-and-conditions

Terms and conditions for using the TxLINE API

# Terms and Conditions

## 1. Introduction

**1.1** These Terms and Conditions ("Terms") govern access to and use of the Services made available by TXODDS.

**1.2** By acquiring, holding, accessing or using TxLINE, the Services, APIs or Data, the User agrees to be bound by these Terms.

**1.3** The Services are made available solely for business and commercial use. Consumer, personal or domestic use is prohibited.

## 2. Definitions

**"API"** means the application programming interface made available by TXODDS.

**"Data"** means all sports data, odds data, market data, analytics, statistics, metadata, pricing information, outputs, feeds, compilations and related content made available through the Services.

**"Feedback"** means all comments, ideas, enhancement requests, suggestions, derivative concepts, recommendations, corrections or other feedback relating to the Services, Data, APIs or TxLINE.

**"Services"** means the APIs, web viewers, software, infrastructure, feeds, analytics and related services provided by TXODDS.

**"TxLINE"** means the proprietary closed-loop digital access mechanism used solely to access the Services within the TXODDS ecosystem.

**"User"** means any person or entity accessing or using the Services, Data or TxLINE.

## 3. Services

**3.1** TXODDS provides proprietary sports data infrastructure and related Services.

**3.2** The Services may include:

* (a) live or delayed sports data;
* (b) odds and pricing information;
* (c) sports analytics;
* (d) APIs and developer infrastructure;
* (e) web-based access tools; and
* (f) related data products and infrastructure.

**3.3** TXODDS may modify, suspend, replace, discontinue or update any aspect of the Services, APIs, Data, schemas, formats, taxonomies, competitions, markets, infrastructure or delivery methods at any time.

**3.4** Unless expressly agreed otherwise in writing, no service level agreement, uptime commitment, guaranteed latency commitment or guaranteed availability obligation applies.

## 4. TxLINE

**4.1** TxLINE is a proprietary digital access mechanism solely enabling access to Services made available by TXODDS.

**4.2** TxLINE:

* (a) may only be used within the TXODDS ecosystem;
* (b) does not provide ownership rights, governance rights, dividends or profit participation; and
* (c) is not redeemable for fiat currency, cryptocurrency or any other asset except where required by applicable law.

**4.3** TXODDS may modify, suspend, invalidate, discontinue or replace TxLINE at any time.

**4.4** TxLINE is personal to the User and may not be sold, assigned, transferred, sublicensed, pledged, traded or otherwise made available to any third party.

**4.5** Any purported transfer of TxLINE shall be void.

## 5. Licence

**5.1** Subject to compliance with these Terms, TXODDS grants the User a limited, revocable, non-exclusive, non-transferable and non-sublicensable licence to access and use the Services solely for the User's internal business purposes.

**5.2** No ownership rights are transferred to the User.

**5.3** All rights not expressly granted are reserved by TXODDS.

## 6. Acceptable Use

**6.1** The User shall not:

* (a) resell, redistribute, sublicense or commercially exploit the Services or Data except as expressly authorised;
* (b) publish or disseminate Data publicly;
* (c) create competing services, products or databases;
* (d) reverse engineer, decompile or derive source data, methodologies or structures;
* (e) scrape or harvest Data outside authorised API functionality;
* (f) circumvent technical controls, usage limits or rate limits;
* (g) use the Services or Data for unlawful, sanctioned or fraudulent purposes;
* (h) use shared access, proxy access or pass-through access arrangements;
* (i) cache or mirror Data except as expressly authorised;
* (j) remove proprietary notices;
* (k) use the Services or Data in a manner which may expose TXODDS to legal, regulatory or reputational risk; or
* (l) use the Services or Data in connection with unlawful gambling, wagering or betting activity.

## 7. Sports Data Acknowledgements

**7.1** The User acknowledges and agrees that:

* (a) sports data is inherently dynamic and may contain delays, interruptions, inaccuracies, omissions, corrections or amendments;
* (b) sporting events, fixtures, participants, prices, scores, statistics and related information may change rapidly and without notice;
* (c) Data may be sourced from third-party providers, automated systems, proprietary models, public sources or manual inputs; and
* (d) the timing, sequencing, completeness and accuracy of Data may vary.

**7.2** The User acknowledges that:

* (a) sporting events may be suspended, abandoned, delayed, amended or cancelled;
* (b) Data feeds may be interrupted, corrected, delayed or withdrawn;
* (c) third-party suppliers may discontinue or modify source data; and
* (d) TXODDS may modify or replace Data sources, methodologies or infrastructure at any time.

## 8. Access Basis

**8.1** The Services are provided for informational and infrastructure access purposes only.

**8.2** The User uses the Services and Data entirely at its own risk.

**8.3** The User is solely responsible for independently assessing the suitability, reliability and accuracy of the Services and Data.

**8.4** TXODDS is not responsible for any decisions made by the User or any third party based on the Services and/or Data.

**8.5** The User acknowledges that fees are payable for access to the Services, APIs and infrastructure made available by TXODDS and not for guaranteed receipt, continuity, availability, accuracy or delivery of any particular Data output, event coverage or informational result.

**8.6** Except to the extent expressly required by non-excludable law, TXODDS shall have no obligation to provide refunds, credits, compensation or other remedies arising from:

* (a) interruptions;
* (b) outages;
* (c) latency;
* (d) degraded performance;
* (e) inaccuracies;
* (f) withdrawal of Data;
* (g) suspension of Services; or
* (h) modifications to the Services.

## 9. Compliance Controls

**9.1** TXODDS may, at any time and in its sole discretion:

* (a) reject, suspend, freeze, delay or cancel transactions;
* (b) refuse acquisition or use of TxLINE;
* (c) require identity verification, KYC, source of funds or other compliance information;
* (d) conduct sanctions screening, wallet screening and blockchain analytics;
* (e) impose transaction limits, usage limits or enhanced compliance requirements;
* (f) restrict access from jurisdictions, wallets or categories of users;
* (g) throttle or suspend usage;
* (h) suspend or terminate access pending compliance review; and
* (i) report information where reasonably considered necessary for legal, regulatory, sanctions, AML, fraud prevention or compliance purposes.

**9.2** The User represents and warrants that:

* (a) it is not subject to sanctions or trade restrictions; and
* (b) it shall comply with all applicable laws and regulations.

## 10. Intellectual Property

**10.1** All intellectual property rights in the Services, Data, APIs, TxLINE, software, systems, analytics, methodologies, compilations, outputs and related materials remain vested exclusively in TXODDS and its licensors.

**10.2** No implied licences are granted.

**10.3** The User acknowledges that unauthorised use or disclosure of the Services or Data may cause irreparable harm to TXODDS for which damages alone may not be an adequate remedy and TXODDS shall be entitled to seek injunctive or equitable relief.

## 11. Feedback

**11.1** All Feedback shall become the sole and exclusive property of TXODDS immediately upon creation.

**11.2** The User irrevocably assigns to TXODDS all rights, title and interest in and to Feedback and waives all moral rights to the maximum extent permitted by law.

**11.3** TXODDS may use, commercialise, modify and exploit Feedback without restriction or compensation.

## 12. Disclaimer of Warranties

**12.1** THE SERVICES, DATA, APIS AND TXLINE ARE PROVIDED "AS IS" AND "AS AVAILABLE".

**12.2** TO THE MAXIMUM EXTENT PERMITTED BY LAW, TXODDS DISCLAIMS ALL WARRANTIES, REPRESENTATIONS AND CONDITIONS, WHETHER EXPRESS, IMPLIED OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AVAILABILITY, ACCURACY, LATENCY, PERFORMANCE OR ERROR-FREE OPERATION.

## 13. Limitation of Liability

**13.1** Nothing in these Terms excludes or limits liability which cannot lawfully be excluded or limited, including liability for:

* (a) fraud or fraudulent misrepresentation; or
* (b) death or personal injury caused by negligence.

**13.2** Subject to clause 13.1 and to the maximum extent permitted by law:

* (a) TXODDS shall not be liable for any indirect, incidental, special, consequential, exemplary or punitive losses;
* (b) TXODDS shall not be liable for loss of profits, loss of business, loss of opportunity, loss of revenue, loss of data, loss of goodwill, trading losses, betting losses or regulatory fines;
* (c) TXODDS shall not be liable for interruptions, delays, inaccuracies, omissions, degraded performance or unavailability of the Services or Data;
* (d) TXODDS shall not be liable for third-party supplier failures, telecommunications failures, blockchain failures, wallet failures, cyberattacks, internet outages or force majeure events; and
* (e) TXODDS' total aggregate liability arising out of or in connection with the Services, Data, TxLINE or these Terms shall not exceed the greater of:
  * (i) the fees paid by the User to TXODDS during the twelve months preceding the relevant claim; or
  * (ii) USD \$1,000.

**13.3** The User acknowledges that the pricing and commercial terms reflect the allocation of risk contained in these Terms.

## 14. Indemnity

**14.1** The User shall indemnify, defend and hold harmless TXODDS and its affiliates from and against all claims, liabilities, losses, damages, costs and expenses arising from:

* (a) the User's breach of these Terms;
* (b) misuse of the Services, Data or TxLINE;
* (c) violation of laws or regulations;
* (d) betting, trading or commercial activities;
* (e) redistribution or unauthorised disclosure of Data; or
* (f) infringement of third-party rights.

## 15. Confidentiality

**15.1** The User shall keep confidential all non-public information relating to TXODDS, the Services, APIs, Data, pricing, methodologies and systems.

**15.2** The User shall not disclose such information except where required by law.

## 16. Taxes

**16.1** The User is solely responsible for determining and paying all taxes, duties, levies or governmental charges arising from acquisition, holding, use or redemption of TxLINE or use of the Services.

**16.2** All amounts payable are exclusive of taxes unless expressly stated otherwise.

## 17. Suspension and Termination

**17.1** TXODDS may suspend or terminate access immediately where:

* (a) the User breaches these Terms;
* (b) TXODDS suspects fraud, sanctions concerns or unlawful activity;
* (c) TXODDS believes continued access may expose TXODDS to legal, regulatory, reputational or operational risk; or
* (d) suspension is reasonably considered necessary for compliance purposes.

**17.2** Upon termination:

* (a) all licences granted to the User immediately cease;
* (b) the User shall cease all use of the Services and Data; and
* (c) TXODDS may disable access and invalidate TxLINE.

## 18. Force Majeure

**18.1** TXODDS shall not be liable for delays or failures caused by events beyond its reasonable control including internet outages, supplier failures, cyberattacks, sanctions, acts of government, blockchain failures or force majeure events.

## 19. Relationship of the Parties

**19.1** Nothing in these Terms creates any partnership, joint venture, fiduciary, agency or employment relationship between the parties.

## 20. Assignment

**20.1** The User may not assign or transfer any rights or obligations under these Terms without prior written consent from TXODDS.

**20.2** TXODDS may assign or transfer its rights and obligations freely.

## 21. Evidence

**21.1** TXODDS' systems, records, logs and technical data shall constitute prima facie evidence of usage, transactions, access activity and operational matters relating to the Services and TxLINE.

## 22. Survival

**22.1** Clauses relating to intellectual property, feedback, confidentiality, indemnities, limitations of liability, taxes, compliance obligations and any provisions intended by their nature to survive termination shall survive termination or expiry of these Terms.

## 23. Governing Law

**23.1** These Terms shall be governed by and construed in accordance with the laws of England and Wales.

**23.2** The courts of England and Wales shall have exclusive jurisdiction.

## 24. General

**24.1** If any provision is held invalid or unenforceable, the remaining provisions shall remain in full force and effect.

**24.2** TXODDS may amend these Terms from time to time and any continued use of the Service shall be a deemed acceptance of any such changes.

**24.3** No waiver by TXODDS shall be effective unless in writing.

**24.4** Failure or delay by TXODDS in exercising any right shall not constitute a waiver.

**24.5** These Terms constitute the entire agreement between the parties relating to their subject matter.

**24.6** For the purpose of these Terms any reference to TXODDS means TXODDS SERVICES, LLC an Illinois limited liability company.


# StablePrice Feed
Source: https://txline-docs.txodds.com/documentation/odds/odds-coverage

Leagues covered by the odds feed

## Available Coverage

StablePrice odds coverage currently includes:

* **Soccer**: supported leagues are listed in the downloadable CSV below.
* **NCAAB (College Basketball)**: competition ID `300043`.
* **NCAAF (College Football)**: competition IDs `550001`, `10005930`, `500005`, and `10005302`.

Available markets are returned by the odds API for each covered fixture.

### Soccer

<Card title="Download Soccer Supported Leagues" icon="file-csv" href="https://txodds.github.io/tx-on-chain/assets/SoccerSupportedLeagues.csv">
  Complete list of all supported soccer leagues
</Card>

### NCAAB (College Basketball)

| Competition ID | Coverage                        |
| -------------- | ------------------------------- |
| 300043         | All NCAA Basketball conferences |

### NCAAF (College Football)

| Competition ID | League Name         |
| -------------- | ------------------- |
| 550001         | NCAA Division I FCS |
| 10005930       | NCAA Extra Matches  |
| 500005         | NCAA Division I FBS |
| 10005302       | NCAA Division I (W) |


# Overview
Source: https://txline-docs.txodds.com/documentation/odds/overview

High-fidelity consensus sports pricing powered by TxODDS and anchored on Solana

TxLINE odds are powered by Stable Price, TxODDS' consensus pricing engine, and published to Solana. Every data point is cryptographically verifiable on-chain, allowing you to audit any price at any time with no intermediary required.

Stable Price aggregates lines across global operators, including sharp books absent from standard Western feeds. The engine runs defensive logic to filter outliers, stale lines, and bad data before it ever reaches your application.

## Access & Onboarding

Access is entirely permissionless. Pay in TxL to unlock your throughput tier, and generate an API key instantly. Frictionless access to fast, verifiable data.

***

## Feature Matrix

<CardGroup>
  <Card title="Global Consensus Blend" icon="globe">
    Aggregated odds from the world's most influential and sharp bookmakers.
  </Card>

  <Card title="Defensive Logic" icon="shield-check">
    Built-in de-margining and outlier filtering to protect your market-making.
  </Card>

  <Card title="Cryptographic Auditing" icon="link">
    On-chain anchored records for trustless verification and historic backtesting.
  </Card>

  <Card title="Flexible Performance" icon="gauge">
    60-second batch updates (Build tier) or sub-second real-time streams (Scale tier).
  </Card>
</CardGroup>

<Info>
  **Looking for integration specs?** Jump straight to the [Odds API Reference](/api-reference/odds) to view schemas for full fixture lifecycles and suspension handling.
</Info>


# Program Addresses
Source: https://txline-docs.txodds.com/documentation/programs/addresses

TxLINE Solana program addresses and key accounts

## Mainnet Addresses

| Type           | Address                                        |
| -------------- | ---------------------------------------------- |
| Program ID     | `9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA` |
| TxL Token Mint | `Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL`  |
| USDT Mint      | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` |
| API Endpoint   | `https://txline.txodds.com/api/`               |

## Devnet Addresses

| Type           | Address                                        |
| -------------- | ---------------------------------------------- |
| Program ID     | `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J` |
| TxL Token Mint | `4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG` |
| USDT Mint      | `ELWTKspHKCnCfCiCiqYw1EDH77k8VCP74dK9qytG2Ujh` |
| API Endpoint   | `https://txline-dev.txodds.com/api/`           |

<Warning>
  Use all values from one network only. A devnet subscribe transaction from `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J` must be activated with `https://txline-dev.txodds.com`, and a mainnet subscribe transaction from `9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA` must be activated with `https://txline.txodds.com`.
</Warning>

## API Hosts

| Network | Guest Auth                                       | API Base                             |
| ------- | ------------------------------------------------ | ------------------------------------ |
| Mainnet | `https://txline.txodds.com/auth/guest/start`     | `https://txline.txodds.com/api/`     |
| Devnet  | `https://txline-dev.txodds.com/auth/guest/start` | `https://txline-dev.txodds.com/api/` |

Use the host root for `/auth/guest/start`, then use the matching `/api/token/activate` endpoint after the on-chain `subscribe` transaction confirms.

## Deriving Program Derived Addresses (PDAs)

The program uses several PDAs that you'll need to derive when interacting with it:

```typescript theme={null}
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";

const programId = new PublicKey("9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA");
const txlTokenMint = new PublicKey("Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL");

// For devnet, replace both constants with the devnet values above.

// Token Treasury PDA - owns the vault that collects subscription fees
const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("token_treasury_v2")],
  programId
);

// Token Treasury Vault - the ATA that holds collected TxL tokens
const tokenTreasuryVault = getAssociatedTokenAddressSync(
  txlTokenMint,
  tokenTreasuryPda,
  true, // Allow PDA owner
  TOKEN_2022_PROGRAM_ID
);

// Pricing Matrix PDA - contains service tier pricing information
const [pricingMatrixPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("pricing_matrix")],
  programId
);

// USDT Treasury PDA - owns the vault that collects USDT for token purchases
const [usdtTreasuryPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("usdt_treasury")],
  programId
);

const usdtMint = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");

// USDT Treasury Vault - the ATA that holds collected USDT
const usdtTreasuryVault = getAssociatedTokenAddressSync(
  usdtMint,
  usdtTreasuryPda,
  true,
  TOKEN_2022_PROGRAM_ID
);

// Daily Scores Merkle Roots PDA - for validating scores data
const epochDay = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
const [dailyScoresPda] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("daily_scores_roots"),
    new BN(epochDay).toArrayLike(Buffer, "le", 2)
  ],
  programId
);

// Daily Batch Roots PDA - for validating odds data
const [dailyBatchRootsPda] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("daily_batch_roots"),
    new BN(epochDay).toArrayLike(Buffer, "le", 2)
  ],
  programId
);

// Ten Daily Fixtures Roots PDA - for validating fixtures data
const alignedEpochDay = Math.floor(epochDay / 10) * 10;
const [tenDailyFixturesRootsPda] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("ten_daily_fixtures_roots"),
    new BN(alignedEpochDay).toArrayLike(Buffer, "le", 2)
  ],
  programId
);

console.log("Token Treasury PDA:", tokenTreasuryPda.toBase58());
console.log("Token Treasury Vault:", tokenTreasuryVault.toBase58());
console.log("USDT Treasury PDA:", usdtTreasuryPda.toBase58());
console.log("USDT Treasury Vault:", usdtTreasuryVault.toBase58());
console.log("Pricing Matrix PDA:", pricingMatrixPda.toBase58());
console.log("Daily Scores PDA:", dailyScoresPda.toBase58());
console.log("Daily Batch Roots PDA:", dailyBatchRootsPda.toBase58());
console.log("Ten Daily Fixtures Roots PDA:", tenDailyFixturesRootsPda.toBase58());
```


# IDL & Types (Devnet)
Source: https://txline-docs.txodds.com/documentation/programs/devnet

Interface Definition Language and TypeScript types for TxLINE programs

## Overview

The TxLINE program IDL (Interface Definition Language) defines the structure and interface of the Solana on-chain program. Use these files to interact with the program using Anchor.

***

<Tabs>
  <Tab title="IDL">
    ```json theme={null}
    {
      "address": "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J",
      "metadata": {
        "name": "txoracle",
        "version": "1.5.2",
        "spec": "0.1.0",
        "description": "TxODDS TxLINE Data system"
      },
      "instructions": [
        {
          "name": "audit_trade_result",
          "discriminator": [
            50,
            242,
            243,
            5,
            209,
            75,
            76,
            91
          ],
          "accounts": [
            {
              "name": "payer",
              "writable": true,
              "signer": true
            },
            {
              "name": "daily_scores_merkle_roots",
              "docs": [
                "to match the standard used in insert_scores_root."
              ]
            }
          ],
          "args": [
            {
              "name": "terms",
              "type": {
                "defined": {
                  "name": "MarketIntentParams"
                }
              }
            },
            {
              "name": "fixture_summary",
              "type": {
                "defined": {
                  "name": "ScoresBatchSummary"
                }
              }
            },
            {
              "name": "main_tree_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            },
            {
              "name": "fixture_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            },
            {
              "name": "stat_a",
              "type": {
                "defined": {
                  "name": "StatTerm"
                }
              }
            },
            {
              "name": "stat_b",
              "type": {
                "option": {
                  "defined": {
                    "name": "StatTerm"
                  }
                }
              }
            },
            {
              "name": "ts",
              "type": "i64"
            }
          ]
        },
        {
          "name": "claim_batch_legacy",
          "discriminator": [
            254,
            101,
            89,
            255,
            169,
            75,
            207,
            66
          ],
          "accounts": [
            {
              "name": "payer",
              "writable": true,
              "signer": true
            },
            {
              "name": "daily_resolution_roots"
            },
            {
              "name": "token_mint",
              "docs": [
                "The Mint is now required to perform decimal-safe transfers (TransferChecked)"
              ]
            },
            {
              "name": "token_program"
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "epoch_day",
              "type": "u16"
            },
            {
              "name": "interval_index",
              "type": "u16"
            },
            {
              "name": "terms_hash",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            },
            {
              "name": "winner_is_maker",
              "type": "bool"
            },
            {
              "name": "seq",
              "type": "u32"
            },
            {
              "name": "merkle_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "claim_via_resolution",
          "discriminator": [
            98,
            206,
            250,
            87,
            151,
            135,
            162,
            181
          ],
          "accounts": [
            {
              "name": "winner",
              "writable": true,
              "signer": true
            },
            {
              "name": "daily_resolution_roots"
            },
            {
              "name": "matched_trade",
              "writable": true
            },
            {
              "name": "trade_vault",
              "writable": true
            },
            {
              "name": "winner_token_account",
              "writable": true
            },
            {
              "name": "token_program"
            }
          ],
          "args": [
            {
              "name": "epoch_day",
              "type": "u16"
            },
            {
              "name": "interval_index",
              "type": "u16"
            },
            {
              "name": "merkle_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "close_intent",
          "discriminator": [
            112,
            245,
            154,
            249,
            57,
            126,
            54,
            122
          ],
          "accounts": [
            {
              "name": "maker",
              "writable": true
            },
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "order_intent",
              "writable": true
            },
            {
              "name": "intent_vault",
              "writable": true
            },
            {
              "name": "maker_token_account",
              "writable": true
            },
            {
              "name": "token_mint"
            },
            {
              "name": "token_program"
            }
          ],
          "args": []
        },
        {
          "name": "close_pricing_matrix",
          "discriminator": [
            251,
            118,
            215,
            117,
            22,
            155,
            38,
            73
          ],
          "accounts": [
            {
              "name": "pricing_matrix",
              "writable": true
            },
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "system_program"
            }
          ],
          "args": []
        },
        {
          "name": "create_intent",
          "discriminator": [
            216,
            214,
            79,
            121,
            23,
            194,
            96,
            104
          ],
          "accounts": [
            {
              "name": "maker",
              "writable": true,
              "signer": true
            },
            {
              "name": "order_intent",
              "writable": true
            },
            {
              "name": "intent_vault",
              "writable": true
            },
            {
              "name": "maker_token_account",
              "writable": true
            },
            {
              "name": "token_mint"
            },
            {
              "name": "token_program"
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "intent_id",
              "type": "u64"
            },
            {
              "name": "terms_hash",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            },
            {
              "name": "deposit_amount",
              "type": "u64"
            },
            {
              "name": "expiration_ts",
              "type": "i64"
            },
            {
              "name": "claim_period",
              "type": "u16"
            },
            {
              "name": "fixture_id",
              "type": "i64"
            }
          ]
        },
        {
          "name": "create_trade",
          "discriminator": [
            183,
            82,
            24,
            245,
            248,
            30,
            204,
            246
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "trader_a",
              "writable": true,
              "signer": true
            },
            {
              "name": "trader_b",
              "writable": true,
              "signer": true
            },
            {
              "name": "trader_a_token_account",
              "writable": true
            },
            {
              "name": "trader_b_token_account",
              "writable": true
            },
            {
              "name": "trade_escrow",
              "writable": true
            },
            {
              "name": "escrow_vault",
              "writable": true
            },
            {
              "name": "stake_token_mint"
            },
            {
              "name": "token_treasury_pda",
              "docs": [
                "Hold the PDA that owns the vault and acts as freeze authority"
              ]
            },
            {
              "name": "token_program"
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "trade_id",
              "type": "u64"
            },
            {
              "name": "stake_a",
              "type": "u64"
            },
            {
              "name": "stake_b",
              "type": "u64"
            },
            {
              "name": "trade_terms_hash",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          ]
        },
        {
          "name": "execute_match",
          "discriminator": [
            76,
            47,
            91,
            223,
            20,
            10,
            147,
            232
          ],
          "accounts": [
            {
              "name": "solver",
              "writable": true,
              "signer": true
            },
            {
              "name": "maker_intent",
              "writable": true
            },
            {
              "name": "taker_intent",
              "writable": true
            },
            {
              "name": "maker_vault",
              "writable": true
            },
            {
              "name": "taker_vault",
              "writable": true
            },
            {
              "name": "matched_trade",
              "writable": true
            },
            {
              "name": "trade_vault",
              "writable": true
            },
            {
              "name": "token_mint"
            },
            {
              "name": "token_program"
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "trade_id",
              "type": "u64"
            },
            {
              "name": "maker_stake",
              "type": "u64"
            },
            {
              "name": "taker_stake",
              "type": "u64"
            }
          ]
        },
        {
          "name": "expose_structs",
          "discriminator": [
            142,
            252,
            254,
            118,
            194,
            230,
            160,
            195
          ],
          "accounts": [],
          "args": [
            {
              "name": "_params",
              "type": {
                "defined": {
                  "name": "MarketIntentParams"
                }
              }
            }
          ]
        },
        {
          "name": "initialize_pricing_matrix",
          "discriminator": [
            147,
            32,
            167,
            248,
            235,
            57,
            210,
            6
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "pricing_matrix",
              "writable": true
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "rows",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ServiceRow"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "initialize_treasury_v2",
          "discriminator": [
            18,
            140,
            152,
            210,
            31,
            25,
            22,
            171
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "token_treasury_vault",
              "writable": true
            },
            {
              "name": "token_treasury_pda"
            },
            {
              "name": "subscription_token_mint"
            },
            {
              "name": "system_program"
            },
            {
              "name": "token_program"
            },
            {
              "name": "associated_token_program"
            }
          ],
          "args": []
        },
        {
          "name": "initialize_usdt_treasury",
          "discriminator": [
            81,
            0,
            86,
            241,
            86,
            85,
            243,
            74
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "usdt_treasury_vault",
              "writable": true
            },
            {
              "name": "usdt_treasury_pda"
            },
            {
              "name": "usdt_mint"
            },
            {
              "name": "token_program"
            },
            {
              "name": "associated_token_program"
            },
            {
              "name": "system_program"
            }
          ],
          "args": []
        },
        {
          "name": "insert_batch_root",
          "discriminator": [
            243,
            170,
            208,
            158,
            207,
            29,
            237,
            93
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "daily_batch_roots",
              "writable": true
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "epoch_day",
              "type": "u16"
            },
            {
              "name": "hour_of_day",
              "type": "u8"
            },
            {
              "name": "minute_of_hour",
              "type": "u8"
            },
            {
              "name": "root",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            },
            {
              "name": "account_bump",
              "type": "u8"
            }
          ]
        },
        {
          "name": "insert_fixtures_root",
          "discriminator": [
            18,
            70,
            8,
            160,
            75,
            200,
            109,
            235
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "ten_daily_fixtures_roots",
              "docs": [
                "The address is constrained by the seeds, and we verify the",
                "discriminator and owner inside the instruction."
              ],
              "writable": true
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "epoch_day",
              "type": "u16"
            },
            {
              "name": "index",
              "type": "u64"
            },
            {
              "name": "root",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          ]
        },
        {
          "name": "insert_scores_root",
          "discriminator": [
            137,
            39,
            242,
            97,
            131,
            204,
            100,
            133
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "daily_scores_roots",
              "docs": [
                "The address is constrained by the seeds, and we verify the",
                "discriminator and owner inside the instruction."
              ],
              "writable": true
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "epoch_day",
              "type": "u16"
            },
            {
              "name": "hour_of_day",
              "type": "u8"
            },
            {
              "name": "minute_of_hour",
              "type": "u8"
            },
            {
              "name": "root",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          ]
        },
        {
          "name": "publish_resolution_root",
          "discriminator": [
            191,
            161,
            47,
            36,
            163,
            58,
            31,
            70
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "daily_resolution_roots",
              "writable": true
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "epoch_day",
              "type": "u16"
            },
            {
              "name": "interval_index",
              "type": "u16"
            },
            {
              "name": "root",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          ]
        },
        {
          "name": "purchase_subscription_token_usdt",
          "discriminator": [
            198,
            251,
            223,
            9,
            31,
            184,
            166,
            188
          ],
          "accounts": [
            {
              "name": "buyer",
              "writable": true,
              "signer": true
            },
            {
              "name": "backend_admin",
              "docs": [
                "Require backend server authority to cosign to authorize the purchase"
              ],
              "signer": true
            },
            {
              "name": "usdt_mint"
            },
            {
              "name": "buyer_usdt_account",
              "writable": true
            },
            {
              "name": "usdt_treasury_vault",
              "writable": true
            },
            {
              "name": "usdt_treasury_pda"
            },
            {
              "name": "subscription_token_mint"
            },
            {
              "name": "token_treasury_vault",
              "writable": true
            },
            {
              "name": "token_treasury_pda"
            },
            {
              "name": "buyer_token_account",
              "writable": true
            },
            {
              "name": "token_program"
            },
            {
              "name": "token_2022_program"
            },
            {
              "name": "system_program"
            },
            {
              "name": "associated_token_program"
            }
          ],
          "args": [
            {
              "name": "txline_amount",
              "type": "u64"
            }
          ]
        },
        {
          "name": "refund_batch",
          "discriminator": [
            227,
            54,
            194,
            2,
            78,
            8,
            104,
            29
          ],
          "accounts": [
            {
              "name": "payer",
              "writable": true,
              "signer": true
            },
            {
              "name": "token_mint",
              "docs": [
                "The mint is required for transfer_checked logic"
              ]
            },
            {
              "name": "token_program"
            },
            {
              "name": "system_program"
            }
          ],
          "args": []
        },
        {
          "name": "request_devnet_faucet",
          "discriminator": [
            49,
            178,
            104,
            8,
            23,
            120,
            186,
            21
          ],
          "accounts": [
            {
              "name": "user",
              "writable": true,
              "signer": true
            },
            {
              "name": "faucet_tracker",
              "writable": true
            },
            {
              "name": "usdt_mint",
              "writable": true
            },
            {
              "name": "user_usdt_ata",
              "writable": true
            },
            {
              "name": "usdt_treasury_pda"
            },
            {
              "name": "token_program"
            },
            {
              "name": "associated_token_program"
            },
            {
              "name": "system_program"
            }
          ],
          "args": []
        },
        {
          "name": "settle_matched_trade",
          "discriminator": [
            191,
            233,
            149,
            116,
            32,
            239,
            18,
            65
          ],
          "accounts": [
            {
              "name": "winner",
              "writable": true,
              "signer": true
            },
            {
              "name": "daily_scores_merkle_roots"
            },
            {
              "name": "matched_trade",
              "writable": true
            },
            {
              "name": "trade_vault",
              "writable": true
            },
            {
              "name": "winner_token_account",
              "writable": true
            },
            {
              "name": "token_mint"
            },
            {
              "name": "token_program"
            }
          ],
          "args": [
            {
              "name": "trade_id",
              "type": "u64"
            },
            {
              "name": "ts",
              "type": "i64"
            },
            {
              "name": "fixture_summary",
              "type": {
                "defined": {
                  "name": "ScoresBatchSummary"
                }
              }
            },
            {
              "name": "fixture_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            },
            {
              "name": "main_tree_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            },
            {
              "name": "stat_a",
              "type": {
                "defined": {
                  "name": "StatTerm"
                }
              }
            },
            {
              "name": "stat_b",
              "type": {
                "option": {
                  "defined": {
                    "name": "StatTerm"
                  }
                }
              }
            },
            {
              "name": "terms",
              "type": {
                "defined": {
                  "name": "MarketIntentParams"
                }
              }
            }
          ]
        },
        {
          "name": "settle_trade",
          "discriminator": [
            252,
            176,
            98,
            248,
            73,
            123,
            8,
            157
          ],
          "accounts": [
            {
              "name": "winner",
              "writable": true,
              "signer": true
            },
            {
              "name": "daily_scores_merkle_roots"
            },
            {
              "name": "trade_escrow",
              "writable": true
            },
            {
              "name": "escrow_vault",
              "writable": true
            },
            {
              "name": "winner_token_account",
              "writable": true
            },
            {
              "name": "token_mint"
            },
            {
              "name": "token_treasury_pda"
            },
            {
              "name": "token_program"
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "trade_id",
              "type": "u64"
            },
            {
              "name": "ts",
              "type": "i64"
            },
            {
              "name": "fixture_summary",
              "type": {
                "defined": {
                  "name": "ScoresBatchSummary"
                }
              }
            },
            {
              "name": "fixture_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            },
            {
              "name": "main_tree_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            },
            {
              "name": "predicate",
              "type": {
                "defined": {
                  "name": "TraderPredicate"
                }
              }
            },
            {
              "name": "stat_a",
              "type": {
                "defined": {
                  "name": "StatTerm"
                }
              }
            },
            {
              "name": "stat_b",
              "type": {
                "option": {
                  "defined": {
                    "name": "StatTerm"
                  }
                }
              }
            },
            {
              "name": "op",
              "type": {
                "option": {
                  "defined": {
                    "name": "BinaryExpression"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "subscribe",
          "discriminator": [
            254,
            28,
            191,
            138,
            156,
            179,
            183,
            53
          ],
          "accounts": [
            {
              "name": "user",
              "writable": true,
              "signer": true
            },
            {
              "name": "pricing_matrix"
            },
            {
              "name": "token_mint"
            },
            {
              "name": "user_token_account",
              "writable": true
            },
            {
              "name": "token_treasury_vault",
              "writable": true
            },
            {
              "name": "token_treasury_pda",
              "docs": [
                "Hold the PDA that owns the vault"
              ]
            },
            {
              "name": "token_program"
            },
            {
              "name": "system_program"
            },
            {
              "name": "associated_token_program"
            }
          ],
          "args": [
            {
              "name": "service_level_id",
              "type": "u16"
            },
            {
              "name": "weeks",
              "type": "u8"
            }
          ]
        },
        {
          "name": "update_pricing_matrix",
          "discriminator": [
            177,
            191,
            172,
            252,
            42,
            203,
            8,
            164
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "pricing_matrix",
              "writable": true
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "rows",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ServiceRow"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "validate_fixture",
          "discriminator": [
            231,
            129,
            218,
            86,
            223,
            114,
            21,
            126
          ],
          "accounts": [
            {
              "name": "ten_daily_fixtures_roots",
              "docs": [
                "Constrain the address by seeds to ensure the correct PDA is loaded"
              ]
            }
          ],
          "args": [
            {
              "name": "snapshot",
              "type": {
                "defined": {
                  "name": "Fixture"
                }
              }
            },
            {
              "name": "summary",
              "type": {
                "defined": {
                  "name": "FixtureBatchSummary"
                }
              }
            },
            {
              "name": "sub_tree_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            },
            {
              "name": "main_tree_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "validate_fixture_batch",
          "discriminator": [
            85,
            223,
            204,
            7,
            4,
            87,
            157,
            1
          ],
          "accounts": [
            {
              "name": "ten_daily_fixtures_roots",
              "docs": [
                "Constrain the address by seeds to ensure the correct PDA is loaded"
              ]
            }
          ],
          "args": [
            {
              "name": "index",
              "type": "u8"
            },
            {
              "name": "metadata",
              "type": {
                "defined": {
                  "name": "BatchMetadata"
                }
              }
            },
            {
              "name": "proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "validate_odds",
          "discriminator": [
            192,
            19,
            91,
            138,
            104,
            100,
            212,
            86
          ],
          "accounts": [
            {
              "name": "daily_odds_merkle_roots"
            }
          ],
          "args": [
            {
              "name": "ts",
              "type": "i64"
            },
            {
              "name": "odds_snapshot",
              "type": {
                "defined": {
                  "name": "Odds"
                }
              }
            },
            {
              "name": "summary",
              "type": {
                "defined": {
                  "name": "OddsBatchSummary"
                }
              }
            },
            {
              "name": "sub_tree_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            },
            {
              "name": "main_tree_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "validate_stat",
          "discriminator": [
            107,
            197,
            232,
            90,
            191,
            136,
            105,
            185
          ],
          "accounts": [
            {
              "name": "daily_scores_merkle_roots"
            }
          ],
          "args": [
            {
              "name": "ts",
              "type": "i64"
            },
            {
              "name": "fixture_summary",
              "type": {
                "defined": {
                  "name": "ScoresBatchSummary"
                }
              }
            },
            {
              "name": "fixture_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            },
            {
              "name": "main_tree_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            },
            {
              "name": "predicate",
              "type": {
                "defined": {
                  "name": "TraderPredicate"
                }
              }
            },
            {
              "name": "stat_a",
              "type": {
                "defined": {
                  "name": "StatTerm"
                }
              }
            },
            {
              "name": "stat_b",
              "type": {
                "option": {
                  "defined": {
                    "name": "StatTerm"
                  }
                }
              }
            },
            {
              "name": "op",
              "type": {
                "option": {
                  "defined": {
                    "name": "BinaryExpression"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "withdraw_usdt",
          "discriminator": [
            117,
            75,
            94,
            162,
            178,
            92,
            19,
            141
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "admin_destination",
              "writable": true
            },
            {
              "name": "usdt_treasury_vault",
              "writable": true
            },
            {
              "name": "usdt_treasury_pda"
            },
            {
              "name": "usdt_mint"
            },
            {
              "name": "token_program"
            },
            {
              "name": "associated_token_program"
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "amount",
              "type": "u64"
            }
          ]
        }
      ],
      "accounts": [
        {
          "name": "FaucetTracker",
          "discriminator": [
            247,
            221,
            212,
            62,
            42,
            233,
            215,
            190
          ]
        },
        {
          "name": "MatchedTrade",
          "discriminator": [
            104,
            54,
            182,
            211,
            94,
            15,
            215,
            142
          ]
        },
        {
          "name": "OrderIntent",
          "discriminator": [
            12,
            130,
            12,
            36,
            12,
            221,
            218,
            14
          ]
        },
        {
          "name": "PricingMatrix",
          "discriminator": [
            173,
            13,
            64,
            22,
            248,
            77,
            110,
            106
          ]
        },
        {
          "name": "TradeEscrow",
          "discriminator": [
            251,
            124,
            237,
            23,
            18,
            126,
            198,
            49
          ]
        }
      ],
      "events": [
        {
          "name": "AuditVerifiedEvent",
          "discriminator": [
            249,
            57,
            59,
            176,
            243,
            27,
            132,
            169
          ]
        },
        {
          "name": "BatchClaimExecuted",
          "discriminator": [
            207,
            182,
            115,
            79,
            244,
            25,
            123,
            18
          ]
        },
        {
          "name": "BatchRefundExecuted",
          "discriminator": [
            193,
            25,
            157,
            200,
            184,
            164,
            176,
            252
          ]
        },
        {
          "name": "IntentClosed",
          "discriminator": [
            127,
            229,
            67,
            202,
            91,
            56,
            164,
            0
          ]
        },
        {
          "name": "IntentCreated",
          "discriminator": [
            184,
            46,
            156,
            205,
            169,
            254,
            11,
            108
          ]
        },
        {
          "name": "MatchExecuted",
          "discriminator": [
            42,
            57,
            255,
            224,
            78,
            10,
            39,
            168
          ]
        },
        {
          "name": "TradeSettled",
          "discriminator": [
            22,
            119,
            166,
            225,
            175,
            53,
            93,
            216
          ]
        }
      ],
      "errors": [
        {
          "code": 6000,
          "name": "EventNotActive",
          "msg": "Event is not active"
        },
        {
          "code": 6001,
          "name": "PricesMismatch",
          "msg": "Prices and price names arrays must be the same length"
        },
        {
          "code": 6002,
          "name": "InvalidOddsUpdate",
          "msg": "Invalid odds update for this event"
        },
        {
          "code": 6003,
          "name": "InvalidSubTreeProof",
          "msg": "Invalid sub-tree proof. The snapshot does not belong to the summary."
        },
        {
          "code": 6004,
          "name": "InvalidMainTreeProof",
          "msg": "Invalid main tree proof. The summary does not belong to the on-chain root."
        },
        {
          "code": 6005,
          "name": "TimeSlotMismatch",
          "msg": "Time slot mismatch between snapshot and on-chain root account."
        },
        {
          "code": 6006,
          "name": "InvalidTime",
          "msg": "The provided hour or minute is out of the valid range."
        },
        {
          "code": 6007,
          "name": "RootNotAvailable",
          "msg": "Merkle root for this time slot has not been posted by the oracle."
        },
        {
          "code": 6008,
          "name": "AccountDiscriminatorMismatch",
          "msg": "Mismatched account discriminator."
        },
        {
          "code": 6009,
          "name": "InvalidPda",
          "msg": "The provided daily root account does not match the expected PDA."
        },
        {
          "code": 6010,
          "name": "TimestampMismatch",
          "msg": "The timestamp provided for seed generation does not match the timestamp in the snapshot payload."
        },
        {
          "code": 6011,
          "name": "SliceError",
          "msg": "Could not slice the account data correctly."
        },
        {
          "code": 6012,
          "name": "InvalidOwner",
          "msg": "Invalid account owner."
        },
        {
          "code": 6013,
          "name": "InvalidTimeSlot",
          "msg": "Invalid time slot, must be aligned on a 5-min boundary."
        },
        {
          "code": 6014,
          "name": "StakeStillLocked",
          "msg": "Stake is still locked and cannot be withdrawn yet."
        },
        {
          "code": 6015,
          "name": "InvalidRecipient",
          "msg": "Invalid recipient of the financial transaction."
        },
        {
          "code": 6016,
          "name": "ActiveSubscription",
          "msg": "You already have an active subscription."
        },
        {
          "code": 6017,
          "name": "Unauthorized",
          "msg": "Unauthorized account updater."
        },
        {
          "code": 6018,
          "name": "InvalidAccountOwner",
          "msg": "Invalid account owner."
        },
        {
          "code": 6019,
          "name": "InvalidMintAuthority",
          "msg": "Invalid mint authority."
        },
        {
          "code": 6020,
          "name": "InvalidMint",
          "msg": "Invalid mint."
        },
        {
          "code": 6021,
          "name": "PredicateFailed",
          "msg": "Predicate failed."
        },
        {
          "code": 6022,
          "name": "InvalidFixtureSubTreeProof",
          "msg": "Invalid sub-tree proof for fixture"
        },
        {
          "code": 6023,
          "name": "InvalidStatProof",
          "msg": "Invalid stats proof for event"
        },
        {
          "code": 6024,
          "name": "InvalidStatCombination",
          "msg": "invalid stat combination"
        },
        {
          "code": 6025,
          "name": "MissingSecondStat",
          "msg": "Missing second stat"
        },
        {
          "code": 6026,
          "name": "UnexpectedSecondStat",
          "msg": "Unexpected second stat"
        },
        {
          "code": 6027,
          "name": "Overflow",
          "msg": "Overflow"
        },
        {
          "code": 6028,
          "name": "TradeNotActive",
          "msg": "Trade not active"
        },
        {
          "code": 6029,
          "name": "InvalidTrader",
          "msg": "Invalid trader"
        },
        {
          "code": 6030,
          "name": "WinnerMismatch",
          "msg": "Winner mismatch"
        },
        {
          "code": 6031,
          "name": "TradeTermsMismatch",
          "msg": "Trade terms mismatch"
        },
        {
          "code": 6032,
          "name": "UnauthorizedSettler",
          "msg": "Unauthorized settler"
        },
        {
          "code": 6033,
          "name": "FundsBelowMinimumDeposit",
          "msg": "Funds below minimal deposit amount"
        },
        {
          "code": 6034,
          "name": "InsufficientUserBalance",
          "msg": "Insufficient token balance"
        },
        {
          "code": 6035,
          "name": "ZeroAmount",
          "msg": "Cannot withdraw zero amount"
        },
        {
          "code": 6036,
          "name": "VaultNotEmpty",
          "msg": "Vault not empty"
        },
        {
          "code": 6037,
          "name": "InsufficientVaultBalance",
          "msg": "Insufficient vault balance"
        },
        {
          "code": 6038,
          "name": "CalculationError",
          "msg": "Calculation error"
        },
        {
          "code": 6039,
          "name": "InvalidSubscriptionTs",
          "msg": "Subscription end Ts invalid"
        },
        {
          "code": 6040,
          "name": "CannotShortenSubscription",
          "msg": "Cannot shorten an existing subscription"
        },
        {
          "code": 6041,
          "name": "InvalidWeeks",
          "msg": "Weeks must be a multiple of 4"
        },
        {
          "code": 6042,
          "name": "InvalidTimeAlignment",
          "msg": "Invalid time alignment"
        },
        {
          "code": 6043,
          "name": "InvalidEpochDayAlignment",
          "msg": "Invalid epoch day alignment"
        },
        {
          "code": 6044,
          "name": "AccountDataTooSmall",
          "msg": "Account data too small"
        },
        {
          "code": 6045,
          "name": "InsufficientLiquidity",
          "msg": "Insufficient liquidity"
        },
        {
          "code": 6046,
          "name": "InvalidAmount",
          "msg": "Invalid amount"
        },
        {
          "code": 6047,
          "name": "InvalidExpiration",
          "msg": "Invalid expiration"
        },
        {
          "code": 6048,
          "name": "FixtureMismatch",
          "msg": "Fixture mismatch"
        },
        {
          "code": 6049,
          "name": "PeriodMismatch",
          "msg": "Period mismatch"
        },
        {
          "code": 6050,
          "name": "IntentNotActive",
          "msg": "Intent not active"
        },
        {
          "code": 6051,
          "name": "OrderNotYetExpired",
          "msg": "Order not yet expired"
        },
        {
          "code": 6052,
          "name": "TermsMismatch",
          "msg": "Terms mismatch"
        },
        {
          "code": 6053,
          "name": "StatKeyMismatch",
          "msg": "Stat key mismatch"
        },
        {
          "code": 6054,
          "name": "InvalidVault",
          "msg": "Invalid vault"
        },
        {
          "code": 6055,
          "name": "EquivocationAttempt",
          "msg": "Equivocation attempt"
        },
        {
          "code": 6056,
          "name": "NumericOverflow",
          "msg": "Numeric overflow"
        },
        {
          "code": 6057,
          "name": "InvalidAccountData",
          "msg": "Invalid account data"
        },
        {
          "code": 6058,
          "name": "RateLimitExceeded",
          "msg": "Rate limit exceeded"
        },
        {
          "code": 6059,
          "name": "InvalidServiceLevelId",
          "msg": "Invalid service level Id"
        },
        {
          "code": 6060,
          "name": "InitialRowsLimitExceeded",
          "msg": "Initial rows limit exceeded"
        },
        {
          "code": 6061,
          "name": "MissingStat",
          "msg": "Missing stat"
        },
        {
          "code": 6062,
          "name": "ProofTooLarge",
          "msg": "Proof too large"
        },
        {
          "code": 6063,
          "name": "TradeTooSmall",
          "msg": "Trade too small"
        },
        {
          "code": 6064,
          "name": "MaxRowsLimitExceeded",
          "msg": "Max rows limit exceeded"
        },
        {
          "code": 6065,
          "name": "UnauthorizedAdmin",
          "msg": "Unauthorized admin"
        }
      ],
      "types": [
        {
          "name": "AuditVerifiedEvent",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "auditor",
                "type": "pubkey"
              },
              {
                "name": "terms_hash",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "root_used",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "result",
                "type": "bool"
              },
              {
                "name": "match_timestamp",
                "type": "i64"
              },
              {
                "name": "audit_timestamp",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "BatchClaimExecuted",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "payer",
                "type": "pubkey"
              },
              {
                "name": "trade_count",
                "type": "u16"
              },
              {
                "name": "total_payout_amount",
                "type": "u64"
              },
              {
                "name": "total_rent_reclaimed",
                "type": "u64"
              }
            ]
          }
        },
        {
          "name": "BatchMetadata",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "total_update_count",
                "type": "i32"
              },
              {
                "name": "num_unique_fixtures",
                "type": "i32"
              },
              {
                "name": "overall_batch_start_ts",
                "type": "i64"
              },
              {
                "name": "overall_batch_end_ts",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "BatchRefundExecuted",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "payer",
                "type": "pubkey"
              },
              {
                "name": "trade_count",
                "type": "u16"
              },
              {
                "name": "total_rent_reclaimed",
                "type": "u64"
              }
            ]
          }
        },
        {
          "name": "BinaryExpression",
          "type": {
            "kind": "enum",
            "variants": [
              {
                "name": "Add"
              },
              {
                "name": "Subtract"
              }
            ]
          }
        },
        {
          "name": "Comparison",
          "type": {
            "kind": "enum",
            "variants": [
              {
                "name": "GreaterThan"
              },
              {
                "name": "LessThan"
              },
              {
                "name": "EqualTo"
              }
            ]
          }
        },
        {
          "name": "FaucetTracker",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "last_request_time",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "Fixture",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "ts",
                "type": "i64"
              },
              {
                "name": "start_time",
                "type": "i64"
              },
              {
                "name": "competition",
                "type": "string"
              },
              {
                "name": "competition_id",
                "type": "i32"
              },
              {
                "name": "fixture_group_id",
                "type": "i32"
              },
              {
                "name": "participant1_id",
                "type": "i32"
              },
              {
                "name": "participant1",
                "type": "string"
              },
              {
                "name": "participant2_id",
                "type": "i32"
              },
              {
                "name": "participant2",
                "type": "string"
              },
              {
                "name": "fixture_id",
                "type": "i64"
              },
              {
                "name": "participant1_is_home",
                "type": "bool"
              }
            ]
          }
        },
        {
          "name": "FixtureBatchSummary",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixture_id",
                "type": "i64"
              },
              {
                "name": "competition_id",
                "type": "i32"
              },
              {
                "name": "competition",
                "type": "string"
              },
              {
                "name": "update_stats",
                "type": {
                  "defined": {
                    "name": "FixtureUpdateStats"
                  }
                }
              },
              {
                "name": "update_sub_tree_root",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "FixtureUpdateStats",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "update_count",
                "type": "u32"
              },
              {
                "name": "min_timestamp",
                "type": "i64"
              },
              {
                "name": "max_timestamp",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "IntentClosed",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "maker",
                "type": "pubkey"
              },
              {
                "name": "intent_id",
                "type": "u64"
              },
              {
                "name": "refund_amount",
                "type": "u64"
              },
              {
                "name": "closed_by",
                "type": "pubkey"
              }
            ]
          }
        },
        {
          "name": "IntentCreated",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "maker",
                "type": "pubkey"
              },
              {
                "name": "token_mint",
                "type": "pubkey"
              },
              {
                "name": "intent_id",
                "type": "u64"
              },
              {
                "name": "fixture_id",
                "type": "i64"
              },
              {
                "name": "deposit_amount",
                "type": "u64"
              },
              {
                "name": "expiration_ts",
                "type": "i64"
              },
              {
                "name": "terms_hash",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "IntentState",
          "type": {
            "kind": "enum",
            "variants": [
              {
                "name": "Active"
              },
              {
                "name": "Locked"
              },
              {
                "name": "Closed"
              },
              {
                "name": "Expired"
              }
            ]
          }
        },
        {
          "name": "MarketIntentParams",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixture_id",
                "type": "i64"
              },
              {
                "name": "period",
                "type": "u16"
              },
              {
                "name": "stat_a_key",
                "type": "u32"
              },
              {
                "name": "stat_b_key",
                "type": {
                  "option": "u32"
                }
              },
              {
                "name": "predicate",
                "type": {
                  "defined": {
                    "name": "TraderPredicate"
                  }
                }
              },
              {
                "name": "op",
                "type": {
                  "option": {
                    "defined": {
                      "name": "BinaryExpression"
                    }
                  }
                }
              },
              {
                "name": "negation",
                "type": "bool"
              }
            ]
          }
        },
        {
          "name": "MatchExecuted",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "trade_id",
                "type": "u64"
              },
              {
                "name": "maker",
                "type": "pubkey"
              },
              {
                "name": "taker",
                "type": "pubkey"
              },
              {
                "name": "maker_stake",
                "type": "u64"
              },
              {
                "name": "taker_stake",
                "type": "u64"
              },
              {
                "name": "token_mint",
                "type": "pubkey"
              }
            ]
          }
        },
        {
          "name": "MatchedTrade",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "trade_id",
                "type": "u64"
              },
              {
                "name": "maker",
                "type": "pubkey"
              },
              {
                "name": "taker",
                "type": "pubkey"
              },
              {
                "name": "stake_maker",
                "type": "u64"
              },
              {
                "name": "stake_taker",
                "type": "u64"
              },
              {
                "name": "terms_hash",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "state",
                "type": {
                  "defined": {
                    "name": "TradeState"
                  }
                }
              },
              {
                "name": "bump",
                "type": "u8"
              }
            ]
          }
        },
        {
          "name": "Odds",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixture_id",
                "type": "i64"
              },
              {
                "name": "message_id",
                "type": "string"
              },
              {
                "name": "ts",
                "type": "i64"
              },
              {
                "name": "bookmaker",
                "type": "string"
              },
              {
                "name": "bookmaker_id",
                "type": "i32"
              },
              {
                "name": "super_odds_type",
                "type": "string"
              },
              {
                "name": "game_state",
                "type": {
                  "option": "string"
                }
              },
              {
                "name": "in_running",
                "type": "bool"
              },
              {
                "name": "market_parameters",
                "type": {
                  "option": "string"
                }
              },
              {
                "name": "market_period",
                "type": {
                  "option": "string"
                }
              },
              {
                "name": "price_names",
                "type": {
                  "vec": "string"
                }
              },
              {
                "name": "prices",
                "type": {
                  "vec": "i32"
                }
              }
            ]
          }
        },
        {
          "name": "OddsBatchSummary",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixture_id",
                "type": "i64"
              },
              {
                "name": "update_stats",
                "type": {
                  "defined": {
                    "name": "OddsUpdateStats"
                  }
                }
              },
              {
                "name": "odds_sub_tree_root",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "OddsUpdateStats",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "update_count",
                "type": "u32"
              },
              {
                "name": "min_timestamp",
                "type": "i64"
              },
              {
                "name": "max_timestamp",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "OrderIntent",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "maker",
                "type": "pubkey"
              },
              {
                "name": "intent_id",
                "type": "u64"
              },
              {
                "name": "deposit_amount",
                "type": "u64"
              },
              {
                "name": "remaining_amount",
                "type": "u64"
              },
              {
                "name": "odds",
                "type": "u16"
              },
              {
                "name": "terms_hash",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "fixture_id",
                "type": "i64"
              },
              {
                "name": "period",
                "type": "u16"
              },
              {
                "name": "expiration_ts",
                "type": "i64"
              },
              {
                "name": "state",
                "type": {
                  "defined": {
                    "name": "IntentState"
                  }
                }
              },
              {
                "name": "bump",
                "type": "u8"
              }
            ]
          }
        },
        {
          "name": "PricingMatrix",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "admin",
                "type": "pubkey"
              },
              {
                "name": "rows",
                "type": {
                  "vec": {
                    "defined": {
                      "name": "ServiceRow"
                    }
                  }
                }
              }
            ]
          }
        },
        {
          "name": "ProofNode",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "hash",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "is_right_sibling",
                "type": "bool"
              }
            ]
          }
        },
        {
          "name": "ScoreStat",
          "docs": [
            "The on-chain representation of a single, provable key-value statistic.",
            "This is the leaf of the inner-most Merkle tree."
          ],
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "key",
                "type": "u32"
              },
              {
                "name": "value",
                "type": "i32"
              },
              {
                "name": "period",
                "type": "i32"
              }
            ]
          }
        },
        {
          "name": "ScoresBatchSummary",
          "docs": [
            "The summary for a single fixture's scores events within a 5-minute batch.",
            "This contains the root of the sub-tree of all events for that fixture."
          ],
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixture_id",
                "type": "i64"
              },
              {
                "name": "update_stats",
                "type": {
                  "defined": {
                    "name": "ScoresUpdateStats"
                  }
                }
              },
              {
                "name": "events_sub_tree_root",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "ScoresUpdateStats",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "update_count",
                "type": "i32"
              },
              {
                "name": "min_timestamp",
                "type": "i64"
              },
              {
                "name": "max_timestamp",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "ServiceRow",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "row_id",
                "type": "u16"
              },
              {
                "name": "price_per_week_token",
                "type": "u64"
              },
              {
                "name": "sampling_interval_sec",
                "type": "u32"
              },
              {
                "name": "league_bundle_id",
                "type": "i16"
              },
              {
                "name": "market_bundle_id",
                "type": "i16"
              }
            ]
          }
        },
        {
          "name": "StatTerm",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "stat_to_prove",
                "type": {
                  "defined": {
                    "name": "ScoreStat"
                  }
                }
              },
              {
                "name": "event_stat_root",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "stat_proof",
                "type": {
                  "vec": {
                    "defined": {
                      "name": "ProofNode"
                    }
                  }
                }
              }
            ]
          }
        },
        {
          "name": "TradeEscrow",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "trade_id",
                "type": "u64"
              },
              {
                "name": "trader_a",
                "type": "pubkey"
              },
              {
                "name": "trader_b",
                "type": "pubkey"
              },
              {
                "name": "stake_a",
                "type": "u64"
              },
              {
                "name": "stake_b",
                "type": "u64"
              },
              {
                "name": "trade_terms_hash",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "state",
                "type": {
                  "defined": {
                    "name": "TradeState"
                  }
                }
              },
              {
                "name": "bump",
                "type": "u8"
              },
              {
                "name": "created_at",
                "type": "i64"
              },
              {
                "name": "expires_at",
                "type": "i64"
              },
              {
                "name": "fee_amount",
                "type": "u64"
              },
              {
                "name": "padding",
                "type": {
                  "array": [
                    "u8",
                    64
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "TradeSettled",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "trade_id",
                "type": "u64"
              },
              {
                "name": "winner",
                "type": "pubkey"
              },
              {
                "name": "payout_amount",
                "type": "u64"
              },
              {
                "name": "token_mint",
                "type": "pubkey"
              }
            ]
          }
        },
        {
          "name": "TradeState",
          "type": {
            "kind": "enum",
            "variants": [
              {
                "name": "Active"
              },
              {
                "name": "Resolved"
              },
              {
                "name": "Disputed"
              }
            ]
          }
        },
        {
          "name": "TraderPredicate",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "threshold",
                "type": "i32"
              },
              {
                "name": "comparison",
                "type": {
                  "defined": {
                    "name": "Comparison"
                  }
                }
              }
            ]
          }
        }
      ],
      "constants": [
        {
          "name": "BACKEND_ADMIN_PUBKEY",
          "type": "pubkey",
          "value": "Ah5xwzHxRYBBV3BWHDCHdfzQJfBehzGQcc7A9QX1DLUB"
        },
        {
          "name": "LAMPORTS_PER_SOL",
          "type": "f64",
          "value": "1000000000.0"
        },
        {
          "name": "MIN_DEPOSIT_TOKENS",
          "type": "u64",
          "value": "1000000"
        },
        {
          "name": "MIN_USER_BALANCE",
          "type": "u64",
          "value": "1000000"
        },
        {
          "name": "STAKE_AMOUNT",
          "type": "u64",
          "value": "1"
        },
        {
          "name": "SUBSCRIPTION_DURATION",
          "type": "i64",
          "value": "3600"
        },
        {
          "name": "SUBSCRIPTION_PRICE_TOKEN",
          "type": "u64",
          "value": "1"
        },
        {
          "name": "TOKEN_DECIMALS",
          "type": "u32",
          "value": "6"
        },
        {
          "name": "TOKEN_PRICE_IN_SOL",
          "type": "f64",
          "value": "0.01"
        },
        {
          "name": "TOKEN_PRICE_IN_USDT",
          "type": "u128",
          "value": "1000"
        },
        {
          "name": "TXLINE_MINT",
          "type": "pubkey",
          "value": "4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG"
        },
        {
          "name": "USDT_DECIMALS_FACTOR",
          "type": "u128",
          "value": "1000000"
        },
        {
          "name": "USDT_MINT",
          "type": "pubkey",
          "value": "ELWTKspHKCnCfCiCiqYw1EDH77k8VCP74dK9qytG2Ujh"
        }
      ]
    }
    ```
  </Tab>

  <Tab title="Types">
    ```typescript theme={null}
    /**
     * Program IDL in camelCase format in order to be used in JS/TS.
     *
     * Note that this is only a type helper and is not the actual IDL. The original
     * IDL can be found at `target/idl/txoracle.json`.
     */
    export type Txoracle = {
      "address": "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J",
      "metadata": {
        "name": "txoracle",
        "version": "1.5.2",
        "spec": "0.1.0",
        "description": "TxODDS TxLINE Data system"
      },
      "instructions": [
        {
          "name": "auditTradeResult",
          "discriminator": [
            50,
            242,
            243,
            5,
            209,
            75,
            76,
            91
          ],
          "accounts": [
            {
              "name": "payer",
              "writable": true,
              "signer": true
            },
            {
              "name": "dailyScoresMerkleRoots",
              "docs": [
                "to match the standard used in insert_scores_root."
              ]
            }
          ],
          "args": [
            {
              "name": "terms",
              "type": {
                "defined": {
                  "name": "marketIntentParams"
                }
              }
            },
            {
              "name": "fixtureSummary",
              "type": {
                "defined": {
                  "name": "scoresBatchSummary"
                }
              }
            },
            {
              "name": "mainTreeProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            },
            {
              "name": "fixtureProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            },
            {
              "name": "statA",
              "type": {
                "defined": {
                  "name": "statTerm"
                }
              }
            },
            {
              "name": "statB",
              "type": {
                "option": {
                  "defined": {
                    "name": "statTerm"
                  }
                }
              }
            },
            {
              "name": "ts",
              "type": "i64"
            }
          ]
        },
        {
          "name": "claimBatchLegacy",
          "discriminator": [
            254,
            101,
            89,
            255,
            169,
            75,
            207,
            66
          ],
          "accounts": [
            {
              "name": "payer",
              "writable": true,
              "signer": true
            },
            {
              "name": "dailyResolutionRoots"
            },
            {
              "name": "tokenMint",
              "docs": [
                "The Mint is now required to perform decimal-safe transfers (TransferChecked)"
              ]
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "epochDay",
              "type": "u16"
            },
            {
              "name": "intervalIndex",
              "type": "u16"
            },
            {
              "name": "termsHash",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            },
            {
              "name": "winnerIsMaker",
              "type": "bool"
            },
            {
              "name": "seq",
              "type": "u32"
            },
            {
              "name": "merkleProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "claimViaResolution",
          "discriminator": [
            98,
            206,
            250,
            87,
            151,
            135,
            162,
            181
          ],
          "accounts": [
            {
              "name": "winner",
              "writable": true,
              "signer": true
            },
            {
              "name": "dailyResolutionRoots"
            },
            {
              "name": "matchedTrade",
              "writable": true
            },
            {
              "name": "tradeVault",
              "writable": true
            },
            {
              "name": "winnerTokenAccount",
              "writable": true
            },
            {
              "name": "tokenProgram"
            }
          ],
          "args": [
            {
              "name": "epochDay",
              "type": "u16"
            },
            {
              "name": "intervalIndex",
              "type": "u16"
            },
            {
              "name": "merkleProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "closeIntent",
          "discriminator": [
            112,
            245,
            154,
            249,
            57,
            126,
            54,
            122
          ],
          "accounts": [
            {
              "name": "maker",
              "writable": true
            },
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "orderIntent",
              "writable": true
            },
            {
              "name": "intentVault",
              "writable": true
            },
            {
              "name": "makerTokenAccount",
              "writable": true
            },
            {
              "name": "tokenMint"
            },
            {
              "name": "tokenProgram"
            }
          ],
          "args": []
        },
        {
          "name": "closePricingMatrix",
          "discriminator": [
            251,
            118,
            215,
            117,
            22,
            155,
            38,
            73
          ],
          "accounts": [
            {
              "name": "pricingMatrix",
              "writable": true
            },
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": []
        },
        {
          "name": "createIntent",
          "discriminator": [
            216,
            214,
            79,
            121,
            23,
            194,
            96,
            104
          ],
          "accounts": [
            {
              "name": "maker",
              "writable": true,
              "signer": true
            },
            {
              "name": "orderIntent",
              "writable": true
            },
            {
              "name": "intentVault",
              "writable": true
            },
            {
              "name": "makerTokenAccount",
              "writable": true
            },
            {
              "name": "tokenMint"
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "intentId",
              "type": "u64"
            },
            {
              "name": "termsHash",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            },
            {
              "name": "depositAmount",
              "type": "u64"
            },
            {
              "name": "expirationTs",
              "type": "i64"
            },
            {
              "name": "claimPeriod",
              "type": "u16"
            },
            {
              "name": "fixtureId",
              "type": "i64"
            }
          ]
        },
        {
          "name": "createTrade",
          "discriminator": [
            183,
            82,
            24,
            245,
            248,
            30,
            204,
            246
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "traderA",
              "writable": true,
              "signer": true
            },
            {
              "name": "traderB",
              "writable": true,
              "signer": true
            },
            {
              "name": "traderATokenAccount",
              "writable": true
            },
            {
              "name": "traderBTokenAccount",
              "writable": true
            },
            {
              "name": "tradeEscrow",
              "writable": true
            },
            {
              "name": "escrowVault",
              "writable": true
            },
            {
              "name": "stakeTokenMint"
            },
            {
              "name": "tokenTreasuryPda",
              "docs": [
                "Hold the PDA that owns the vault and acts as freeze authority"
              ]
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "tradeId",
              "type": "u64"
            },
            {
              "name": "stakeA",
              "type": "u64"
            },
            {
              "name": "stakeB",
              "type": "u64"
            },
            {
              "name": "tradeTermsHash",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          ]
        },
        {
          "name": "executeMatch",
          "discriminator": [
            76,
            47,
            91,
            223,
            20,
            10,
            147,
            232
          ],
          "accounts": [
            {
              "name": "solver",
              "writable": true,
              "signer": true
            },
            {
              "name": "makerIntent",
              "writable": true
            },
            {
              "name": "takerIntent",
              "writable": true
            },
            {
              "name": "makerVault",
              "writable": true
            },
            {
              "name": "takerVault",
              "writable": true
            },
            {
              "name": "matchedTrade",
              "writable": true
            },
            {
              "name": "tradeVault",
              "writable": true
            },
            {
              "name": "tokenMint"
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "tradeId",
              "type": "u64"
            },
            {
              "name": "makerStake",
              "type": "u64"
            },
            {
              "name": "takerStake",
              "type": "u64"
            }
          ]
        },
        {
          "name": "exposeStructs",
          "discriminator": [
            142,
            252,
            254,
            118,
            194,
            230,
            160,
            195
          ],
          "accounts": [],
          "args": [
            {
              "name": "params",
              "type": {
                "defined": {
                  "name": "marketIntentParams"
                }
              }
            }
          ]
        },
        {
          "name": "initializePricingMatrix",
          "discriminator": [
            147,
            32,
            167,
            248,
            235,
            57,
            210,
            6
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "pricingMatrix",
              "writable": true
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "rows",
              "type": {
                "vec": {
                  "defined": {
                    "name": "serviceRow"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "initializeTreasuryV2",
          "discriminator": [
            18,
            140,
            152,
            210,
            31,
            25,
            22,
            171
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "tokenTreasuryVault",
              "writable": true
            },
            {
              "name": "tokenTreasuryPda"
            },
            {
              "name": "subscriptionTokenMint"
            },
            {
              "name": "systemProgram"
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "associatedTokenProgram"
            }
          ],
          "args": []
        },
        {
          "name": "initializeUsdtTreasury",
          "discriminator": [
            81,
            0,
            86,
            241,
            86,
            85,
            243,
            74
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "usdtTreasuryVault",
              "writable": true
            },
            {
              "name": "usdtTreasuryPda"
            },
            {
              "name": "usdtMint"
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "associatedTokenProgram"
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": []
        },
        {
          "name": "insertBatchRoot",
          "discriminator": [
            243,
            170,
            208,
            158,
            207,
            29,
            237,
            93
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "dailyBatchRoots",
              "writable": true
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "epochDay",
              "type": "u16"
            },
            {
              "name": "hourOfDay",
              "type": "u8"
            },
            {
              "name": "minuteOfHour",
              "type": "u8"
            },
            {
              "name": "root",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            },
            {
              "name": "accountBump",
              "type": "u8"
            }
          ]
        },
        {
          "name": "insertFixturesRoot",
          "discriminator": [
            18,
            70,
            8,
            160,
            75,
            200,
            109,
            235
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "tenDailyFixturesRoots",
              "docs": [
                "The address is constrained by the seeds, and we verify the",
                "discriminator and owner inside the instruction."
              ],
              "writable": true
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "epochDay",
              "type": "u16"
            },
            {
              "name": "index",
              "type": "u64"
            },
            {
              "name": "root",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          ]
        },
        {
          "name": "insertScoresRoot",
          "discriminator": [
            137,
            39,
            242,
            97,
            131,
            204,
            100,
            133
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "dailyScoresRoots",
              "docs": [
                "The address is constrained by the seeds, and we verify the",
                "discriminator and owner inside the instruction."
              ],
              "writable": true
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "epochDay",
              "type": "u16"
            },
            {
              "name": "hourOfDay",
              "type": "u8"
            },
            {
              "name": "minuteOfHour",
              "type": "u8"
            },
            {
              "name": "root",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          ]
        },
        {
          "name": "publishResolutionRoot",
          "discriminator": [
            191,
            161,
            47,
            36,
            163,
            58,
            31,
            70
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "dailyResolutionRoots",
              "writable": true
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "epochDay",
              "type": "u16"
            },
            {
              "name": "intervalIndex",
              "type": "u16"
            },
            {
              "name": "root",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          ]
        },
        {
          "name": "purchaseSubscriptionTokenUsdt",
          "discriminator": [
            198,
            251,
            223,
            9,
            31,
            184,
            166,
            188
          ],
          "accounts": [
            {
              "name": "buyer",
              "writable": true,
              "signer": true
            },
            {
              "name": "backendAdmin",
              "docs": [
                "Require backend server authority to cosign to authorize the purchase"
              ],
              "signer": true
            },
            {
              "name": "usdtMint"
            },
            {
              "name": "buyerUsdtAccount",
              "writable": true
            },
            {
              "name": "usdtTreasuryVault",
              "writable": true
            },
            {
              "name": "usdtTreasuryPda"
            },
            {
              "name": "subscriptionTokenMint"
            },
            {
              "name": "tokenTreasuryVault",
              "writable": true
            },
            {
              "name": "tokenTreasuryPda"
            },
            {
              "name": "buyerTokenAccount",
              "writable": true
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "token2022Program"
            },
            {
              "name": "systemProgram"
            },
            {
              "name": "associatedTokenProgram"
            }
          ],
          "args": [
            {
              "name": "txlineAmount",
              "type": "u64"
            }
          ]
        },
        {
          "name": "refundBatch",
          "discriminator": [
            227,
            54,
            194,
            2,
            78,
            8,
            104,
            29
          ],
          "accounts": [
            {
              "name": "payer",
              "writable": true,
              "signer": true
            },
            {
              "name": "tokenMint",
              "docs": [
                "The mint is required for transfer_checked logic"
              ]
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": []
        },
        {
          "name": "requestDevnetFaucet",
          "discriminator": [
            49,
            178,
            104,
            8,
            23,
            120,
            186,
            21
          ],
          "accounts": [
            {
              "name": "user",
              "writable": true,
              "signer": true
            },
            {
              "name": "faucetTracker",
              "writable": true
            },
            {
              "name": "usdtMint",
              "writable": true
            },
            {
              "name": "userUsdtAta",
              "writable": true
            },
            {
              "name": "usdtTreasuryPda"
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "associatedTokenProgram"
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": []
        },
        {
          "name": "settleMatchedTrade",
          "discriminator": [
            191,
            233,
            149,
            116,
            32,
            239,
            18,
            65
          ],
          "accounts": [
            {
              "name": "winner",
              "writable": true,
              "signer": true
            },
            {
              "name": "dailyScoresMerkleRoots"
            },
            {
              "name": "matchedTrade",
              "writable": true
            },
            {
              "name": "tradeVault",
              "writable": true
            },
            {
              "name": "winnerTokenAccount",
              "writable": true
            },
            {
              "name": "tokenMint"
            },
            {
              "name": "tokenProgram"
            }
          ],
          "args": [
            {
              "name": "tradeId",
              "type": "u64"
            },
            {
              "name": "ts",
              "type": "i64"
            },
            {
              "name": "fixtureSummary",
              "type": {
                "defined": {
                  "name": "scoresBatchSummary"
                }
              }
            },
            {
              "name": "fixtureProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            },
            {
              "name": "mainTreeProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            },
            {
              "name": "statA",
              "type": {
                "defined": {
                  "name": "statTerm"
                }
              }
            },
            {
              "name": "statB",
              "type": {
                "option": {
                  "defined": {
                    "name": "statTerm"
                  }
                }
              }
            },
            {
              "name": "terms",
              "type": {
                "defined": {
                  "name": "marketIntentParams"
                }
              }
            }
          ]
        },
        {
          "name": "settleTrade",
          "discriminator": [
            252,
            176,
            98,
            248,
            73,
            123,
            8,
            157
          ],
          "accounts": [
            {
              "name": "winner",
              "writable": true,
              "signer": true
            },
            {
              "name": "dailyScoresMerkleRoots"
            },
            {
              "name": "tradeEscrow",
              "writable": true
            },
            {
              "name": "escrowVault",
              "writable": true
            },
            {
              "name": "winnerTokenAccount",
              "writable": true
            },
            {
              "name": "tokenMint"
            },
            {
              "name": "tokenTreasuryPda"
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "tradeId",
              "type": "u64"
            },
            {
              "name": "ts",
              "type": "i64"
            },
            {
              "name": "fixtureSummary",
              "type": {
                "defined": {
                  "name": "scoresBatchSummary"
                }
              }
            },
            {
              "name": "fixtureProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            },
            {
              "name": "mainTreeProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            },
            {
              "name": "predicate",
              "type": {
                "defined": {
                  "name": "traderPredicate"
                }
              }
            },
            {
              "name": "statA",
              "type": {
                "defined": {
                  "name": "statTerm"
                }
              }
            },
            {
              "name": "statB",
              "type": {
                "option": {
                  "defined": {
                    "name": "statTerm"
                  }
                }
              }
            },
            {
              "name": "op",
              "type": {
                "option": {
                  "defined": {
                    "name": "binaryExpression"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "subscribe",
          "discriminator": [
            254,
            28,
            191,
            138,
            156,
            179,
            183,
            53
          ],
          "accounts": [
            {
              "name": "user",
              "writable": true,
              "signer": true
            },
            {
              "name": "pricingMatrix"
            },
            {
              "name": "tokenMint"
            },
            {
              "name": "userTokenAccount",
              "writable": true
            },
            {
              "name": "tokenTreasuryVault",
              "writable": true
            },
            {
              "name": "tokenTreasuryPda",
              "docs": [
                "Hold the PDA that owns the vault"
              ]
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "systemProgram"
            },
            {
              "name": "associatedTokenProgram"
            }
          ],
          "args": [
            {
              "name": "serviceLevelId",
              "type": "u16"
            },
            {
              "name": "weeks",
              "type": "u8"
            }
          ]
        },
        {
          "name": "updatePricingMatrix",
          "discriminator": [
            177,
            191,
            172,
            252,
            42,
            203,
            8,
            164
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "pricingMatrix",
              "writable": true
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "rows",
              "type": {
                "vec": {
                  "defined": {
                    "name": "serviceRow"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "validateFixture",
          "discriminator": [
            231,
            129,
            218,
            86,
            223,
            114,
            21,
            126
          ],
          "accounts": [
            {
              "name": "tenDailyFixturesRoots",
              "docs": [
                "Constrain the address by seeds to ensure the correct PDA is loaded"
              ]
            }
          ],
          "args": [
            {
              "name": "snapshot",
              "type": {
                "defined": {
                  "name": "fixture"
                }
              }
            },
            {
              "name": "summary",
              "type": {
                "defined": {
                  "name": "fixtureBatchSummary"
                }
              }
            },
            {
              "name": "subTreeProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            },
            {
              "name": "mainTreeProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "validateFixtureBatch",
          "discriminator": [
            85,
            223,
            204,
            7,
            4,
            87,
            157,
            1
          ],
          "accounts": [
            {
              "name": "tenDailyFixturesRoots",
              "docs": [
                "Constrain the address by seeds to ensure the correct PDA is loaded"
              ]
            }
          ],
          "args": [
            {
              "name": "index",
              "type": "u8"
            },
            {
              "name": "metadata",
              "type": {
                "defined": {
                  "name": "batchMetadata"
                }
              }
            },
            {
              "name": "proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "validateOdds",
          "discriminator": [
            192,
            19,
            91,
            138,
            104,
            100,
            212,
            86
          ],
          "accounts": [
            {
              "name": "dailyOddsMerkleRoots"
            }
          ],
          "args": [
            {
              "name": "ts",
              "type": "i64"
            },
            {
              "name": "oddsSnapshot",
              "type": {
                "defined": {
                  "name": "odds"
                }
              }
            },
            {
              "name": "summary",
              "type": {
                "defined": {
                  "name": "oddsBatchSummary"
                }
              }
            },
            {
              "name": "subTreeProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            },
            {
              "name": "mainTreeProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "validateStat",
          "discriminator": [
            107,
            197,
            232,
            90,
            191,
            136,
            105,
            185
          ],
          "accounts": [
            {
              "name": "dailyScoresMerkleRoots"
            }
          ],
          "args": [
            {
              "name": "ts",
              "type": "i64"
            },
            {
              "name": "fixtureSummary",
              "type": {
                "defined": {
                  "name": "scoresBatchSummary"
                }
              }
            },
            {
              "name": "fixtureProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            },
            {
              "name": "mainTreeProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            },
            {
              "name": "predicate",
              "type": {
                "defined": {
                  "name": "traderPredicate"
                }
              }
            },
            {
              "name": "statA",
              "type": {
                "defined": {
                  "name": "statTerm"
                }
              }
            },
            {
              "name": "statB",
              "type": {
                "option": {
                  "defined": {
                    "name": "statTerm"
                  }
                }
              }
            },
            {
              "name": "op",
              "type": {
                "option": {
                  "defined": {
                    "name": "binaryExpression"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "withdrawUsdt",
          "discriminator": [
            117,
            75,
            94,
            162,
            178,
            92,
            19,
            141
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "adminDestination",
              "writable": true
            },
            {
              "name": "usdtTreasuryVault",
              "writable": true
            },
            {
              "name": "usdtTreasuryPda"
            },
            {
              "name": "usdtMint"
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "associatedTokenProgram"
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "amount",
              "type": "u64"
            }
          ]
        }
      ],
      "accounts": [
        {
          "name": "faucetTracker",
          "discriminator": [
            247,
            221,
            212,
            62,
            42,
            233,
            215,
            190
          ]
        },
        {
          "name": "matchedTrade",
          "discriminator": [
            104,
            54,
            182,
            211,
            94,
            15,
            215,
            142
          ]
        },
        {
          "name": "orderIntent",
          "discriminator": [
            12,
            130,
            12,
            36,
            12,
            221,
            218,
            14
          ]
        },
        {
          "name": "pricingMatrix",
          "discriminator": [
            173,
            13,
            64,
            22,
            248,
            77,
            110,
            106
          ]
        },
        {
          "name": "tradeEscrow",
          "discriminator": [
            251,
            124,
            237,
            23,
            18,
            126,
            198,
            49
          ]
        }
      ],
      "events": [
        {
          "name": "auditVerifiedEvent",
          "discriminator": [
            249,
            57,
            59,
            176,
            243,
            27,
            132,
            169
          ]
        },
        {
          "name": "batchClaimExecuted",
          "discriminator": [
            207,
            182,
            115,
            79,
            244,
            25,
            123,
            18
          ]
        },
        {
          "name": "batchRefundExecuted",
          "discriminator": [
            193,
            25,
            157,
            200,
            184,
            164,
            176,
            252
          ]
        },
        {
          "name": "intentClosed",
          "discriminator": [
            127,
            229,
            67,
            202,
            91,
            56,
            164,
            0
          ]
        },
        {
          "name": "intentCreated",
          "discriminator": [
            184,
            46,
            156,
            205,
            169,
            254,
            11,
            108
          ]
        },
        {
          "name": "matchExecuted",
          "discriminator": [
            42,
            57,
            255,
            224,
            78,
            10,
            39,
            168
          ]
        },
        {
          "name": "tradeSettled",
          "discriminator": [
            22,
            119,
            166,
            225,
            175,
            53,
            93,
            216
          ]
        }
      ],
      "errors": [
        {
          "code": 6000,
          "name": "eventNotActive",
          "msg": "Event is not active"
        },
        {
          "code": 6001,
          "name": "pricesMismatch",
          "msg": "Prices and price names arrays must be the same length"
        },
        {
          "code": 6002,
          "name": "invalidOddsUpdate",
          "msg": "Invalid odds update for this event"
        },
        {
          "code": 6003,
          "name": "invalidSubTreeProof",
          "msg": "Invalid sub-tree proof. The snapshot does not belong to the summary."
        },
        {
          "code": 6004,
          "name": "invalidMainTreeProof",
          "msg": "Invalid main tree proof. The summary does not belong to the on-chain root."
        },
        {
          "code": 6005,
          "name": "timeSlotMismatch",
          "msg": "Time slot mismatch between snapshot and on-chain root account."
        },
        {
          "code": 6006,
          "name": "invalidTime",
          "msg": "The provided hour or minute is out of the valid range."
        },
        {
          "code": 6007,
          "name": "rootNotAvailable",
          "msg": "Merkle root for this time slot has not been posted by the oracle."
        },
        {
          "code": 6008,
          "name": "accountDiscriminatorMismatch",
          "msg": "Mismatched account discriminator."
        },
        {
          "code": 6009,
          "name": "invalidPda",
          "msg": "The provided daily root account does not match the expected PDA."
        },
        {
          "code": 6010,
          "name": "timestampMismatch",
          "msg": "The timestamp provided for seed generation does not match the timestamp in the snapshot payload."
        },
        {
          "code": 6011,
          "name": "sliceError",
          "msg": "Could not slice the account data correctly."
        },
        {
          "code": 6012,
          "name": "invalidOwner",
          "msg": "Invalid account owner."
        },
        {
          "code": 6013,
          "name": "invalidTimeSlot",
          "msg": "Invalid time slot, must be aligned on a 5-min boundary."
        },
        {
          "code": 6014,
          "name": "stakeStillLocked",
          "msg": "Stake is still locked and cannot be withdrawn yet."
        },
        {
          "code": 6015,
          "name": "invalidRecipient",
          "msg": "Invalid recipient of the financial transaction."
        },
        {
          "code": 6016,
          "name": "activeSubscription",
          "msg": "You already have an active subscription."
        },
        {
          "code": 6017,
          "name": "unauthorized",
          "msg": "Unauthorized account updater."
        },
        {
          "code": 6018,
          "name": "invalidAccountOwner",
          "msg": "Invalid account owner."
        },
        {
          "code": 6019,
          "name": "invalidMintAuthority",
          "msg": "Invalid mint authority."
        },
        {
          "code": 6020,
          "name": "invalidMint",
          "msg": "Invalid mint."
        },
        {
          "code": 6021,
          "name": "predicateFailed",
          "msg": "Predicate failed."
        },
        {
          "code": 6022,
          "name": "invalidFixtureSubTreeProof",
          "msg": "Invalid sub-tree proof for fixture"
        },
        {
          "code": 6023,
          "name": "invalidStatProof",
          "msg": "Invalid stats proof for event"
        },
        {
          "code": 6024,
          "name": "invalidStatCombination",
          "msg": "invalid stat combination"
        },
        {
          "code": 6025,
          "name": "missingSecondStat",
          "msg": "Missing second stat"
        },
        {
          "code": 6026,
          "name": "unexpectedSecondStat",
          "msg": "Unexpected second stat"
        },
        {
          "code": 6027,
          "name": "overflow",
          "msg": "overflow"
        },
        {
          "code": 6028,
          "name": "tradeNotActive",
          "msg": "Trade not active"
        },
        {
          "code": 6029,
          "name": "invalidTrader",
          "msg": "Invalid trader"
        },
        {
          "code": 6030,
          "name": "winnerMismatch",
          "msg": "Winner mismatch"
        },
        {
          "code": 6031,
          "name": "tradeTermsMismatch",
          "msg": "Trade terms mismatch"
        },
        {
          "code": 6032,
          "name": "unauthorizedSettler",
          "msg": "Unauthorized settler"
        },
        {
          "code": 6033,
          "name": "fundsBelowMinimumDeposit",
          "msg": "Funds below minimal deposit amount"
        },
        {
          "code": 6034,
          "name": "insufficientUserBalance",
          "msg": "Insufficient token balance"
        },
        {
          "code": 6035,
          "name": "zeroAmount",
          "msg": "Cannot withdraw zero amount"
        },
        {
          "code": 6036,
          "name": "vaultNotEmpty",
          "msg": "Vault not empty"
        },
        {
          "code": 6037,
          "name": "insufficientVaultBalance",
          "msg": "Insufficient vault balance"
        },
        {
          "code": 6038,
          "name": "calculationError",
          "msg": "Calculation error"
        },
        {
          "code": 6039,
          "name": "invalidSubscriptionTs",
          "msg": "Subscription end Ts invalid"
        },
        {
          "code": 6040,
          "name": "cannotShortenSubscription",
          "msg": "Cannot shorten an existing subscription"
        },
        {
          "code": 6041,
          "name": "invalidWeeks",
          "msg": "Weeks must be a multiple of 4"
        },
        {
          "code": 6042,
          "name": "invalidTimeAlignment",
          "msg": "Invalid time alignment"
        },
        {
          "code": 6043,
          "name": "invalidEpochDayAlignment",
          "msg": "Invalid epoch day alignment"
        },
        {
          "code": 6044,
          "name": "accountDataTooSmall",
          "msg": "Account data too small"
        },
        {
          "code": 6045,
          "name": "insufficientLiquidity",
          "msg": "Insufficient liquidity"
        },
        {
          "code": 6046,
          "name": "invalidAmount",
          "msg": "Invalid amount"
        },
        {
          "code": 6047,
          "name": "invalidExpiration",
          "msg": "Invalid expiration"
        },
        {
          "code": 6048,
          "name": "fixtureMismatch",
          "msg": "Fixture mismatch"
        },
        {
          "code": 6049,
          "name": "periodMismatch",
          "msg": "Period mismatch"
        },
        {
          "code": 6050,
          "name": "intentNotActive",
          "msg": "Intent not active"
        },
        {
          "code": 6051,
          "name": "orderNotYetExpired",
          "msg": "Order not yet expired"
        },
        {
          "code": 6052,
          "name": "termsMismatch",
          "msg": "Terms mismatch"
        },
        {
          "code": 6053,
          "name": "statKeyMismatch",
          "msg": "Stat key mismatch"
        },
        {
          "code": 6054,
          "name": "invalidVault",
          "msg": "Invalid vault"
        },
        {
          "code": 6055,
          "name": "equivocationAttempt",
          "msg": "Equivocation attempt"
        },
        {
          "code": 6056,
          "name": "numericOverflow",
          "msg": "Numeric overflow"
        },
        {
          "code": 6057,
          "name": "invalidAccountData",
          "msg": "Invalid account data"
        },
        {
          "code": 6058,
          "name": "rateLimitExceeded",
          "msg": "Rate limit exceeded"
        },
        {
          "code": 6059,
          "name": "invalidServiceLevelId",
          "msg": "Invalid service level Id"
        },
        {
          "code": 6060,
          "name": "initialRowsLimitExceeded",
          "msg": "Initial rows limit exceeded"
        },
        {
          "code": 6061,
          "name": "missingStat",
          "msg": "Missing stat"
        },
        {
          "code": 6062,
          "name": "proofTooLarge",
          "msg": "Proof too large"
        },
        {
          "code": 6063,
          "name": "tradeTooSmall",
          "msg": "Trade too small"
        },
        {
          "code": 6064,
          "name": "maxRowsLimitExceeded",
          "msg": "Max rows limit exceeded"
        },
        {
          "code": 6065,
          "name": "unauthorizedAdmin",
          "msg": "Unauthorized admin"
        }
      ],
      "types": [
        {
          "name": "auditVerifiedEvent",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "auditor",
                "type": "pubkey"
              },
              {
                "name": "termsHash",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "rootUsed",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "result",
                "type": "bool"
              },
              {
                "name": "matchTimestamp",
                "type": "i64"
              },
              {
                "name": "auditTimestamp",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "batchClaimExecuted",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "payer",
                "type": "pubkey"
              },
              {
                "name": "tradeCount",
                "type": "u16"
              },
              {
                "name": "totalPayoutAmount",
                "type": "u64"
              },
              {
                "name": "totalRentReclaimed",
                "type": "u64"
              }
            ]
          }
        },
        {
          "name": "batchMetadata",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "totalUpdateCount",
                "type": "i32"
              },
              {
                "name": "numUniqueFixtures",
                "type": "i32"
              },
              {
                "name": "overallBatchStartTs",
                "type": "i64"
              },
              {
                "name": "overallBatchEndTs",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "batchRefundExecuted",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "payer",
                "type": "pubkey"
              },
              {
                "name": "tradeCount",
                "type": "u16"
              },
              {
                "name": "totalRentReclaimed",
                "type": "u64"
              }
            ]
          }
        },
        {
          "name": "binaryExpression",
          "type": {
            "kind": "enum",
            "variants": [
              {
                "name": "add"
              },
              {
                "name": "subtract"
              }
            ]
          }
        },
        {
          "name": "comparison",
          "type": {
            "kind": "enum",
            "variants": [
              {
                "name": "greaterThan"
              },
              {
                "name": "lessThan"
              },
              {
                "name": "equalTo"
              }
            ]
          }
        },
        {
          "name": "faucetTracker",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "lastRequestTime",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "fixture",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "ts",
                "type": "i64"
              },
              {
                "name": "startTime",
                "type": "i64"
              },
              {
                "name": "competition",
                "type": "string"
              },
              {
                "name": "competitionId",
                "type": "i32"
              },
              {
                "name": "fixtureGroupId",
                "type": "i32"
              },
              {
                "name": "participant1Id",
                "type": "i32"
              },
              {
                "name": "participant1",
                "type": "string"
              },
              {
                "name": "participant2Id",
                "type": "i32"
              },
              {
                "name": "participant2",
                "type": "string"
              },
              {
                "name": "fixtureId",
                "type": "i64"
              },
              {
                "name": "participant1IsHome",
                "type": "bool"
              }
            ]
          }
        },
        {
          "name": "fixtureBatchSummary",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixtureId",
                "type": "i64"
              },
              {
                "name": "competitionId",
                "type": "i32"
              },
              {
                "name": "competition",
                "type": "string"
              },
              {
                "name": "updateStats",
                "type": {
                  "defined": {
                    "name": "fixtureUpdateStats"
                  }
                }
              },
              {
                "name": "updateSubTreeRoot",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "fixtureUpdateStats",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "updateCount",
                "type": "u32"
              },
              {
                "name": "minTimestamp",
                "type": "i64"
              },
              {
                "name": "maxTimestamp",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "intentClosed",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "maker",
                "type": "pubkey"
              },
              {
                "name": "intentId",
                "type": "u64"
              },
              {
                "name": "refundAmount",
                "type": "u64"
              },
              {
                "name": "closedBy",
                "type": "pubkey"
              }
            ]
          }
        },
        {
          "name": "intentCreated",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "maker",
                "type": "pubkey"
              },
              {
                "name": "tokenMint",
                "type": "pubkey"
              },
              {
                "name": "intentId",
                "type": "u64"
              },
              {
                "name": "fixtureId",
                "type": "i64"
              },
              {
                "name": "depositAmount",
                "type": "u64"
              },
              {
                "name": "expirationTs",
                "type": "i64"
              },
              {
                "name": "termsHash",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "intentState",
          "type": {
            "kind": "enum",
            "variants": [
              {
                "name": "active"
              },
              {
                "name": "locked"
              },
              {
                "name": "closed"
              },
              {
                "name": "expired"
              }
            ]
          }
        },
        {
          "name": "marketIntentParams",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixtureId",
                "type": "i64"
              },
              {
                "name": "period",
                "type": "u16"
              },
              {
                "name": "statAKey",
                "type": "u32"
              },
              {
                "name": "statBKey",
                "type": {
                  "option": "u32"
                }
              },
              {
                "name": "predicate",
                "type": {
                  "defined": {
                    "name": "traderPredicate"
                  }
                }
              },
              {
                "name": "op",
                "type": {
                  "option": {
                    "defined": {
                      "name": "binaryExpression"
                    }
                  }
                }
              },
              {
                "name": "negation",
                "type": "bool"
              }
            ]
          }
        },
        {
          "name": "matchExecuted",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "tradeId",
                "type": "u64"
              },
              {
                "name": "maker",
                "type": "pubkey"
              },
              {
                "name": "taker",
                "type": "pubkey"
              },
              {
                "name": "makerStake",
                "type": "u64"
              },
              {
                "name": "takerStake",
                "type": "u64"
              },
              {
                "name": "tokenMint",
                "type": "pubkey"
              }
            ]
          }
        },
        {
          "name": "matchedTrade",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "tradeId",
                "type": "u64"
              },
              {
                "name": "maker",
                "type": "pubkey"
              },
              {
                "name": "taker",
                "type": "pubkey"
              },
              {
                "name": "stakeMaker",
                "type": "u64"
              },
              {
                "name": "stakeTaker",
                "type": "u64"
              },
              {
                "name": "termsHash",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "state",
                "type": {
                  "defined": {
                    "name": "tradeState"
                  }
                }
              },
              {
                "name": "bump",
                "type": "u8"
              }
            ]
          }
        },
        {
          "name": "odds",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixtureId",
                "type": "i64"
              },
              {
                "name": "messageId",
                "type": "string"
              },
              {
                "name": "ts",
                "type": "i64"
              },
              {
                "name": "bookmaker",
                "type": "string"
              },
              {
                "name": "bookmakerId",
                "type": "i32"
              },
              {
                "name": "superOddsType",
                "type": "string"
              },
              {
                "name": "gameState",
                "type": {
                  "option": "string"
                }
              },
              {
                "name": "inRunning",
                "type": "bool"
              },
              {
                "name": "marketParameters",
                "type": {
                  "option": "string"
                }
              },
              {
                "name": "marketPeriod",
                "type": {
                  "option": "string"
                }
              },
              {
                "name": "priceNames",
                "type": {
                  "vec": "string"
                }
              },
              {
                "name": "prices",
                "type": {
                  "vec": "i32"
                }
              }
            ]
          }
        },
        {
          "name": "oddsBatchSummary",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixtureId",
                "type": "i64"
              },
              {
                "name": "updateStats",
                "type": {
                  "defined": {
                    "name": "oddsUpdateStats"
                  }
                }
              },
              {
                "name": "oddsSubTreeRoot",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "oddsUpdateStats",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "updateCount",
                "type": "u32"
              },
              {
                "name": "minTimestamp",
                "type": "i64"
              },
              {
                "name": "maxTimestamp",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "orderIntent",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "maker",
                "type": "pubkey"
              },
              {
                "name": "intentId",
                "type": "u64"
              },
              {
                "name": "depositAmount",
                "type": "u64"
              },
              {
                "name": "remainingAmount",
                "type": "u64"
              },
              {
                "name": "odds",
                "type": "u16"
              },
              {
                "name": "termsHash",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "fixtureId",
                "type": "i64"
              },
              {
                "name": "period",
                "type": "u16"
              },
              {
                "name": "expirationTs",
                "type": "i64"
              },
              {
                "name": "state",
                "type": {
                  "defined": {
                    "name": "intentState"
                  }
                }
              },
              {
                "name": "bump",
                "type": "u8"
              }
            ]
          }
        },
        {
          "name": "pricingMatrix",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "admin",
                "type": "pubkey"
              },
              {
                "name": "rows",
                "type": {
                  "vec": {
                    "defined": {
                      "name": "serviceRow"
                    }
                  }
                }
              }
            ]
          }
        },
        {
          "name": "proofNode",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "hash",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "isRightSibling",
                "type": "bool"
              }
            ]
          }
        },
        {
          "name": "scoreStat",
          "docs": [
            "The on-chain representation of a single, provable key-value statistic.",
            "This is the leaf of the inner-most Merkle tree."
          ],
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "key",
                "type": "u32"
              },
              {
                "name": "value",
                "type": "i32"
              },
              {
                "name": "period",
                "type": "i32"
              }
            ]
          }
        },
        {
          "name": "scoresBatchSummary",
          "docs": [
            "The summary for a single fixture's scores events within a 5-minute batch.",
            "This contains the root of the sub-tree of all events for that fixture."
          ],
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixtureId",
                "type": "i64"
              },
              {
                "name": "updateStats",
                "type": {
                  "defined": {
                    "name": "scoresUpdateStats"
                  }
                }
              },
              {
                "name": "eventsSubTreeRoot",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "scoresUpdateStats",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "updateCount",
                "type": "i32"
              },
              {
                "name": "minTimestamp",
                "type": "i64"
              },
              {
                "name": "maxTimestamp",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "serviceRow",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "rowId",
                "type": "u16"
              },
              {
                "name": "pricePerWeekToken",
                "type": "u64"
              },
              {
                "name": "samplingIntervalSec",
                "type": "u32"
              },
              {
                "name": "leagueBundleId",
                "type": "i16"
              },
              {
                "name": "marketBundleId",
                "type": "i16"
              }
            ]
          }
        },
        {
          "name": "statTerm",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "statToProve",
                "type": {
                  "defined": {
                    "name": "scoreStat"
                  }
                }
              },
              {
                "name": "eventStatRoot",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "statProof",
                "type": {
                  "vec": {
                    "defined": {
                      "name": "proofNode"
                    }
                  }
                }
              }
            ]
          }
        },
        {
          "name": "tradeEscrow",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "tradeId",
                "type": "u64"
              },
              {
                "name": "traderA",
                "type": "pubkey"
              },
              {
                "name": "traderB",
                "type": "pubkey"
              },
              {
                "name": "stakeA",
                "type": "u64"
              },
              {
                "name": "stakeB",
                "type": "u64"
              },
              {
                "name": "tradeTermsHash",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "state",
                "type": {
                  "defined": {
                    "name": "tradeState"
                  }
                }
              },
              {
                "name": "bump",
                "type": "u8"
              },
              {
                "name": "createdAt",
                "type": "i64"
              },
              {
                "name": "expiresAt",
                "type": "i64"
              },
              {
                "name": "feeAmount",
                "type": "u64"
              },
              {
                "name": "padding",
                "type": {
                  "array": [
                    "u8",
                    64
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "tradeSettled",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "tradeId",
                "type": "u64"
              },
              {
                "name": "winner",
                "type": "pubkey"
              },
              {
                "name": "payoutAmount",
                "type": "u64"
              },
              {
                "name": "tokenMint",
                "type": "pubkey"
              }
            ]
          }
        },
        {
          "name": "tradeState",
          "type": {
            "kind": "enum",
            "variants": [
              {
                "name": "active"
              },
              {
                "name": "resolved"
              },
              {
                "name": "disputed"
              }
            ]
          }
        },
        {
          "name": "traderPredicate",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "threshold",
                "type": "i32"
              },
              {
                "name": "comparison",
                "type": {
                  "defined": {
                    "name": "comparison"
                  }
                }
              }
            ]
          }
        }
      ],
      "constants": [
        {
          "name": "backendAdminPubkey",
          "type": "pubkey",
          "value": "Ah5xwzHxRYBBV3BWHDCHdfzQJfBehzGQcc7A9QX1DLUB"
        },
        {
          "name": "lamportsPerSol",
          "type": "f64",
          "value": "1000000000.0"
        },
        {
          "name": "minDepositTokens",
          "type": "u64",
          "value": "1000000"
        },
        {
          "name": "minUserBalance",
          "type": "u64",
          "value": "1000000"
        },
        {
          "name": "stakeAmount",
          "type": "u64",
          "value": "1"
        },
        {
          "name": "subscriptionDuration",
          "type": "i64",
          "value": "3600"
        },
        {
          "name": "subscriptionPriceToken",
          "type": "u64",
          "value": "1"
        },
        {
          "name": "tokenDecimals",
          "type": "u32",
          "value": "6"
        },
        {
          "name": "tokenPriceInSol",
          "type": "f64",
          "value": "0.01"
        },
        {
          "name": "tokenPriceInUsdt",
          "type": "u128",
          "value": "1000"
        },
        {
          "name": "txlineMint",
          "type": "pubkey",
          "value": "4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG"
        },
        {
          "name": "usdtDecimalsFactor",
          "type": "u128",
          "value": "1000000"
        },
        {
          "name": "usdtMint",
          "type": "pubkey",
          "value": "ELWTKspHKCnCfCiCiqYw1EDH77k8VCP74dK9qytG2Ujh"
        }
      ]
    };
    ```
  </Tab>
</Tabs>


# IDL & Types (Mainnet)
Source: https://txline-docs.txodds.com/documentation/programs/mainnet

Interface Definition Language and TypeScript types for TxLINE programs

## Overview

The TxLINE program IDL (Interface Definition Language) defines the structure and interface of the Solana on-chain program. Use these files to interact with the program using Anchor.

***

<Tabs>
  <Tab title="IDL">
    ```json theme={null}
    {
      "address": "9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA",
      "metadata": {
        "name": "txoracle",
        "version": "1.5.2",
        "spec": "0.1.0",
        "description": "TxODDS TxLINE Data system"
      },
      "instructions": [
        {
          "name": "close_pricing_matrix",
          "discriminator": [
            251,
            118,
            215,
            117,
            22,
            155,
            38,
            73
          ],
          "accounts": [
            {
              "name": "pricing_matrix",
              "writable": true
            },
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "system_program"
            }
          ],
          "args": []
        },
        {
          "name": "initialize_pricing_matrix",
          "discriminator": [
            147,
            32,
            167,
            248,
            235,
            57,
            210,
            6
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "pricing_matrix",
              "writable": true
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "rows",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ServiceRow"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "initialize_treasury_v2",
          "discriminator": [
            18,
            140,
            152,
            210,
            31,
            25,
            22,
            171
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "token_treasury_vault",
              "writable": true
            },
            {
              "name": "token_treasury_pda"
            },
            {
              "name": "subscription_token_mint"
            },
            {
              "name": "system_program"
            },
            {
              "name": "token_program"
            },
            {
              "name": "associated_token_program"
            }
          ],
          "args": []
        },
        {
          "name": "initialize_usdt_treasury",
          "discriminator": [
            81,
            0,
            86,
            241,
            86,
            85,
            243,
            74
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "usdt_treasury_vault",
              "writable": true
            },
            {
              "name": "usdt_treasury_pda"
            },
            {
              "name": "usdt_mint"
            },
            {
              "name": "token_program"
            },
            {
              "name": "associated_token_program"
            },
            {
              "name": "system_program"
            }
          ],
          "args": []
        },
        {
          "name": "insert_batch_root",
          "discriminator": [
            243,
            170,
            208,
            158,
            207,
            29,
            237,
            93
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "daily_batch_roots",
              "writable": true
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "epoch_day",
              "type": "u16"
            },
            {
              "name": "hour_of_day",
              "type": "u8"
            },
            {
              "name": "minute_of_hour",
              "type": "u8"
            },
            {
              "name": "root",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            },
            {
              "name": "account_bump",
              "type": "u8"
            }
          ]
        },
        {
          "name": "insert_fixtures_root",
          "discriminator": [
            18,
            70,
            8,
            160,
            75,
            200,
            109,
            235
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "ten_daily_fixtures_roots",
              "docs": [
                "The address is constrained by the seeds, and we verify the",
                "discriminator and owner inside the instruction."
              ],
              "writable": true
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "epoch_day",
              "type": "u16"
            },
            {
              "name": "index",
              "type": "u64"
            },
            {
              "name": "root",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          ]
        },
        {
          "name": "insert_scores_root",
          "discriminator": [
            137,
            39,
            242,
            97,
            131,
            204,
            100,
            133
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "daily_scores_roots",
              "docs": [
                "The address is constrained by the seeds, and we verify the",
                "discriminator and owner inside the instruction."
              ],
              "writable": true
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "epoch_day",
              "type": "u16"
            },
            {
              "name": "hour_of_day",
              "type": "u8"
            },
            {
              "name": "minute_of_hour",
              "type": "u8"
            },
            {
              "name": "root",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          ]
        },
        {
          "name": "purchase_subscription_token_usdt",
          "discriminator": [
            198,
            251,
            223,
            9,
            31,
            184,
            166,
            188
          ],
          "accounts": [
            {
              "name": "buyer",
              "writable": true,
              "signer": true
            },
            {
              "name": "backend_admin",
              "docs": [
                "Require backend server authority to cosign to authorize the purchase"
              ],
              "signer": true
            },
            {
              "name": "usdt_mint"
            },
            {
              "name": "buyer_usdt_account",
              "writable": true
            },
            {
              "name": "usdt_treasury_vault",
              "writable": true
            },
            {
              "name": "usdt_treasury_pda"
            },
            {
              "name": "subscription_token_mint"
            },
            {
              "name": "token_treasury_vault",
              "writable": true
            },
            {
              "name": "token_treasury_pda"
            },
            {
              "name": "buyer_token_account",
              "writable": true
            },
            {
              "name": "token_program"
            },
            {
              "name": "token_2022_program"
            },
            {
              "name": "system_program"
            },
            {
              "name": "associated_token_program"
            }
          ],
          "args": [
            {
              "name": "txline_amount",
              "type": "u64"
            }
          ]
        },
        {
          "name": "subscribe",
          "discriminator": [
            254,
            28,
            191,
            138,
            156,
            179,
            183,
            53
          ],
          "accounts": [
            {
              "name": "user",
              "writable": true,
              "signer": true
            },
            {
              "name": "pricing_matrix"
            },
            {
              "name": "token_mint"
            },
            {
              "name": "user_token_account",
              "writable": true
            },
            {
              "name": "token_treasury_vault",
              "writable": true
            },
            {
              "name": "token_treasury_pda",
              "docs": [
                "Hold the PDA that owns the vault"
              ]
            },
            {
              "name": "token_program"
            },
            {
              "name": "system_program"
            },
            {
              "name": "associated_token_program"
            }
          ],
          "args": [
            {
              "name": "service_level_id",
              "type": "u16"
            },
            {
              "name": "weeks",
              "type": "u8"
            }
          ]
        },
        {
          "name": "update_pricing_matrix",
          "discriminator": [
            177,
            191,
            172,
            252,
            42,
            203,
            8,
            164
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "pricing_matrix",
              "writable": true
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "rows",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ServiceRow"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "validate_fixture",
          "discriminator": [
            231,
            129,
            218,
            86,
            223,
            114,
            21,
            126
          ],
          "accounts": [
            {
              "name": "ten_daily_fixtures_roots",
              "docs": [
                "Constrain the address by seeds to ensure the correct PDA is loaded"
              ]
            }
          ],
          "args": [
            {
              "name": "snapshot",
              "type": {
                "defined": {
                  "name": "Fixture"
                }
              }
            },
            {
              "name": "summary",
              "type": {
                "defined": {
                  "name": "FixtureBatchSummary"
                }
              }
            },
            {
              "name": "sub_tree_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            },
            {
              "name": "main_tree_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "validate_fixture_batch",
          "discriminator": [
            85,
            223,
            204,
            7,
            4,
            87,
            157,
            1
          ],
          "accounts": [
            {
              "name": "ten_daily_fixtures_roots",
              "docs": [
                "Constrain the address by seeds to ensure the correct PDA is loaded"
              ]
            }
          ],
          "args": [
            {
              "name": "index",
              "type": "u8"
            },
            {
              "name": "metadata",
              "type": {
                "defined": {
                  "name": "BatchMetadata"
                }
              }
            },
            {
              "name": "proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "validate_odds",
          "discriminator": [
            192,
            19,
            91,
            138,
            104,
            100,
            212,
            86
          ],
          "accounts": [
            {
              "name": "daily_odds_merkle_roots"
            }
          ],
          "args": [
            {
              "name": "ts",
              "type": "i64"
            },
            {
              "name": "odds_snapshot",
              "type": {
                "defined": {
                  "name": "Odds"
                }
              }
            },
            {
              "name": "summary",
              "type": {
                "defined": {
                  "name": "OddsBatchSummary"
                }
              }
            },
            {
              "name": "sub_tree_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            },
            {
              "name": "main_tree_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "validate_stat",
          "discriminator": [
            107,
            197,
            232,
            90,
            191,
            136,
            105,
            185
          ],
          "accounts": [
            {
              "name": "daily_scores_merkle_roots"
            }
          ],
          "args": [
            {
              "name": "ts",
              "type": "i64"
            },
            {
              "name": "fixture_summary",
              "type": {
                "defined": {
                  "name": "ScoresBatchSummary"
                }
              }
            },
            {
              "name": "fixture_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            },
            {
              "name": "main_tree_proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "ProofNode"
                  }
                }
              }
            },
            {
              "name": "predicate",
              "type": {
                "defined": {
                  "name": "TraderPredicate"
                }
              }
            },
            {
              "name": "stat_a",
              "type": {
                "defined": {
                  "name": "StatTerm"
                }
              }
            },
            {
              "name": "stat_b",
              "type": {
                "option": {
                  "defined": {
                    "name": "StatTerm"
                  }
                }
              }
            },
            {
              "name": "op",
              "type": {
                "option": {
                  "defined": {
                    "name": "BinaryExpression"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "withdraw_usdt",
          "discriminator": [
            117,
            75,
            94,
            162,
            178,
            92,
            19,
            141
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "admin_destination",
              "writable": true
            },
            {
              "name": "usdt_treasury_vault",
              "writable": true
            },
            {
              "name": "usdt_treasury_pda"
            },
            {
              "name": "usdt_mint"
            },
            {
              "name": "token_program"
            },
            {
              "name": "associated_token_program"
            },
            {
              "name": "system_program"
            }
          ],
          "args": [
            {
              "name": "amount",
              "type": "u64"
            }
          ]
        }
      ],
      "accounts": [
        {
          "name": "PricingMatrix",
          "discriminator": [
            173,
            13,
            64,
            22,
            248,
            77,
            110,
            106
          ]
        }
      ],
      "errors": [
        {
          "code": 6000,
          "name": "EventNotActive",
          "msg": "Event is not active"
        },
        {
          "code": 6001,
          "name": "PricesMismatch",
          "msg": "Prices and price names arrays must be the same length"
        },
        {
          "code": 6002,
          "name": "InvalidOddsUpdate",
          "msg": "Invalid odds update for this event"
        },
        {
          "code": 6003,
          "name": "InvalidSubTreeProof",
          "msg": "Invalid sub-tree proof. The snapshot does not belong to the summary."
        },
        {
          "code": 6004,
          "name": "InvalidMainTreeProof",
          "msg": "Invalid main tree proof. The summary does not belong to the on-chain root."
        },
        {
          "code": 6005,
          "name": "TimeSlotMismatch",
          "msg": "Time slot mismatch between snapshot and on-chain root account."
        },
        {
          "code": 6006,
          "name": "InvalidTime",
          "msg": "The provided hour or minute is out of the valid range."
        },
        {
          "code": 6007,
          "name": "RootNotAvailable",
          "msg": "Merkle root for this time slot has not been posted by the oracle."
        },
        {
          "code": 6008,
          "name": "AccountDiscriminatorMismatch",
          "msg": "Mismatched account discriminator."
        },
        {
          "code": 6009,
          "name": "InvalidPda",
          "msg": "The provided daily root account does not match the expected PDA."
        },
        {
          "code": 6010,
          "name": "TimestampMismatch",
          "msg": "The timestamp provided for seed generation does not match the timestamp in the snapshot payload."
        },
        {
          "code": 6011,
          "name": "SliceError",
          "msg": "Could not slice the account data correctly."
        },
        {
          "code": 6012,
          "name": "InvalidOwner",
          "msg": "Invalid account owner."
        },
        {
          "code": 6013,
          "name": "InvalidTimeSlot",
          "msg": "Invalid time slot, must be aligned on a 5-min boundary."
        },
        {
          "code": 6014,
          "name": "StakeStillLocked",
          "msg": "Stake is still locked and cannot be withdrawn yet."
        },
        {
          "code": 6015,
          "name": "InvalidRecipient",
          "msg": "Invalid recipient of the financial transaction."
        },
        {
          "code": 6016,
          "name": "ActiveSubscription",
          "msg": "You already have an active subscription."
        },
        {
          "code": 6017,
          "name": "Unauthorized",
          "msg": "Unauthorized account updater."
        },
        {
          "code": 6018,
          "name": "InvalidAccountOwner",
          "msg": "Invalid account owner."
        },
        {
          "code": 6019,
          "name": "InvalidMintAuthority",
          "msg": "Invalid mint authority."
        },
        {
          "code": 6020,
          "name": "InvalidMint",
          "msg": "Invalid mint."
        },
        {
          "code": 6021,
          "name": "PredicateFailed",
          "msg": "Predicate failed."
        },
        {
          "code": 6022,
          "name": "InvalidFixtureSubTreeProof",
          "msg": "Invalid sub-tree proof for fixture"
        },
        {
          "code": 6023,
          "name": "InvalidStatProof",
          "msg": "Invalid stats proof for event"
        },
        {
          "code": 6024,
          "name": "InvalidStatCombination",
          "msg": "invalid stat combination"
        },
        {
          "code": 6025,
          "name": "MissingSecondStat",
          "msg": "Missing second stat"
        },
        {
          "code": 6026,
          "name": "UnexpectedSecondStat",
          "msg": "Unexpected second stat"
        },
        {
          "code": 6027,
          "name": "Overflow",
          "msg": "Overflow"
        },
        {
          "code": 6028,
          "name": "TradeNotActive",
          "msg": "Trade not active"
        },
        {
          "code": 6029,
          "name": "InvalidTrader",
          "msg": "Invalid trader"
        },
        {
          "code": 6030,
          "name": "WinnerMismatch",
          "msg": "Winner mismatch"
        },
        {
          "code": 6031,
          "name": "TradeTermsMismatch",
          "msg": "Trade terms mismatch"
        },
        {
          "code": 6032,
          "name": "UnauthorizedSettler",
          "msg": "Unauthorized settler"
        },
        {
          "code": 6033,
          "name": "FundsBelowMinimumDeposit",
          "msg": "Funds below minimal deposit amount"
        },
        {
          "code": 6034,
          "name": "InsufficientUserBalance",
          "msg": "Insufficient token balance"
        },
        {
          "code": 6035,
          "name": "ZeroAmount",
          "msg": "Cannot withdraw zero amount"
        },
        {
          "code": 6036,
          "name": "VaultNotEmpty",
          "msg": "Vault not empty"
        },
        {
          "code": 6037,
          "name": "InsufficientVaultBalance",
          "msg": "Insufficient vault balance"
        },
        {
          "code": 6038,
          "name": "CalculationError",
          "msg": "Calculation error"
        },
        {
          "code": 6039,
          "name": "InvalidSubscriptionTs",
          "msg": "Subscription end Ts invalid"
        },
        {
          "code": 6040,
          "name": "CannotShortenSubscription",
          "msg": "Cannot shorten an existing subscription"
        },
        {
          "code": 6041,
          "name": "InvalidWeeks",
          "msg": "Weeks must be a multiple of 4"
        },
        {
          "code": 6042,
          "name": "InvalidTimeAlignment",
          "msg": "Invalid time alignment"
        },
        {
          "code": 6043,
          "name": "InvalidEpochDayAlignment",
          "msg": "Invalid epoch day alignment"
        },
        {
          "code": 6044,
          "name": "AccountDataTooSmall",
          "msg": "Account data too small"
        },
        {
          "code": 6045,
          "name": "InsufficientLiquidity",
          "msg": "Insufficient liquidity"
        },
        {
          "code": 6046,
          "name": "InvalidAmount",
          "msg": "Invalid amount"
        },
        {
          "code": 6047,
          "name": "InvalidExpiration",
          "msg": "Invalid expiration"
        },
        {
          "code": 6048,
          "name": "FixtureMismatch",
          "msg": "Fixture mismatch"
        },
        {
          "code": 6049,
          "name": "PeriodMismatch",
          "msg": "Period mismatch"
        },
        {
          "code": 6050,
          "name": "IntentNotActive",
          "msg": "Intent not active"
        },
        {
          "code": 6051,
          "name": "OrderNotYetExpired",
          "msg": "Order not yet expired"
        },
        {
          "code": 6052,
          "name": "TermsMismatch",
          "msg": "Terms mismatch"
        },
        {
          "code": 6053,
          "name": "StatKeyMismatch",
          "msg": "Stat key mismatch"
        },
        {
          "code": 6054,
          "name": "InvalidVault",
          "msg": "Invalid vault"
        },
        {
          "code": 6055,
          "name": "EquivocationAttempt",
          "msg": "Equivocation attempt"
        },
        {
          "code": 6056,
          "name": "NumericOverflow",
          "msg": "Numeric overflow"
        },
        {
          "code": 6057,
          "name": "InvalidAccountData",
          "msg": "Invalid account data"
        },
        {
          "code": 6058,
          "name": "RateLimitExceeded",
          "msg": "Rate limit exceeded"
        },
        {
          "code": 6059,
          "name": "InvalidServiceLevelId",
          "msg": "Invalid service level Id"
        },
        {
          "code": 6060,
          "name": "InitialRowsLimitExceeded",
          "msg": "Initial rows limit exceeded"
        },
        {
          "code": 6061,
          "name": "MissingStat",
          "msg": "Missing stat"
        },
        {
          "code": 6062,
          "name": "ProofTooLarge",
          "msg": "Proof too large"
        },
        {
          "code": 6063,
          "name": "TradeTooSmall",
          "msg": "Trade too small"
        },
        {
          "code": 6064,
          "name": "MaxRowsLimitExceeded",
          "msg": "Max rows limit exceeded"
        },
        {
          "code": 6065,
          "name": "UnauthorizedAdmin",
          "msg": "Unauthorized admin"
        }
      ],
      "types": [
        {
          "name": "BatchMetadata",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "total_update_count",
                "type": "i32"
              },
              {
                "name": "num_unique_fixtures",
                "type": "i32"
              },
              {
                "name": "overall_batch_start_ts",
                "type": "i64"
              },
              {
                "name": "overall_batch_end_ts",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "BinaryExpression",
          "type": {
            "kind": "enum",
            "variants": [
              {
                "name": "Add"
              },
              {
                "name": "Subtract"
              }
            ]
          }
        },
        {
          "name": "Comparison",
          "type": {
            "kind": "enum",
            "variants": [
              {
                "name": "GreaterThan"
              },
              {
                "name": "LessThan"
              },
              {
                "name": "EqualTo"
              }
            ]
          }
        },
        {
          "name": "Fixture",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "ts",
                "type": "i64"
              },
              {
                "name": "start_time",
                "type": "i64"
              },
              {
                "name": "competition",
                "type": "string"
              },
              {
                "name": "competition_id",
                "type": "i32"
              },
              {
                "name": "fixture_group_id",
                "type": "i32"
              },
              {
                "name": "participant1_id",
                "type": "i32"
              },
              {
                "name": "participant1",
                "type": "string"
              },
              {
                "name": "participant2_id",
                "type": "i32"
              },
              {
                "name": "participant2",
                "type": "string"
              },
              {
                "name": "fixture_id",
                "type": "i64"
              },
              {
                "name": "participant1_is_home",
                "type": "bool"
              }
            ]
          }
        },
        {
          "name": "FixtureBatchSummary",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixture_id",
                "type": "i64"
              },
              {
                "name": "competition_id",
                "type": "i32"
              },
              {
                "name": "competition",
                "type": "string"
              },
              {
                "name": "update_stats",
                "type": {
                  "defined": {
                    "name": "FixtureUpdateStats"
                  }
                }
              },
              {
                "name": "update_sub_tree_root",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "FixtureUpdateStats",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "update_count",
                "type": "u32"
              },
              {
                "name": "min_timestamp",
                "type": "i64"
              },
              {
                "name": "max_timestamp",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "MarketIntentParams",
          "type": {
            "kind": "struct",
            "fields": []
          }
        },
        {
          "name": "Odds",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixture_id",
                "type": "i64"
              },
              {
                "name": "message_id",
                "type": "string"
              },
              {
                "name": "ts",
                "type": "i64"
              },
              {
                "name": "bookmaker",
                "type": "string"
              },
              {
                "name": "bookmaker_id",
                "type": "i32"
              },
              {
                "name": "super_odds_type",
                "type": "string"
              },
              {
                "name": "game_state",
                "type": {
                  "option": "string"
                }
              },
              {
                "name": "in_running",
                "type": "bool"
              },
              {
                "name": "market_parameters",
                "type": {
                  "option": "string"
                }
              },
              {
                "name": "market_period",
                "type": {
                  "option": "string"
                }
              },
              {
                "name": "price_names",
                "type": {
                  "vec": "string"
                }
              },
              {
                "name": "prices",
                "type": {
                  "vec": "i32"
                }
              }
            ]
          }
        },
        {
          "name": "OddsBatchSummary",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixture_id",
                "type": "i64"
              },
              {
                "name": "update_stats",
                "type": {
                  "defined": {
                    "name": "OddsUpdateStats"
                  }
                }
              },
              {
                "name": "odds_sub_tree_root",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "OddsUpdateStats",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "update_count",
                "type": "u32"
              },
              {
                "name": "min_timestamp",
                "type": "i64"
              },
              {
                "name": "max_timestamp",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "PricingMatrix",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "admin",
                "type": "pubkey"
              },
              {
                "name": "rows",
                "type": {
                  "vec": {
                    "defined": {
                      "name": "ServiceRow"
                    }
                  }
                }
              }
            ]
          }
        },
        {
          "name": "ProofNode",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "hash",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "is_right_sibling",
                "type": "bool"
              }
            ]
          }
        },
        {
          "name": "ScoreStat",
          "docs": [
            "The on-chain representation of a single, provable key-value statistic.",
            "This is the leaf of the inner-most Merkle tree."
          ],
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "key",
                "type": "u32"
              },
              {
                "name": "value",
                "type": "i32"
              },
              {
                "name": "period",
                "type": "i32"
              }
            ]
          }
        },
        {
          "name": "ScoresBatchSummary",
          "docs": [
            "The summary for a single fixture's scores events within a 5-minute batch.",
            "This contains the root of the sub-tree of all events for that fixture."
          ],
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixture_id",
                "type": "i64"
              },
              {
                "name": "update_stats",
                "type": {
                  "defined": {
                    "name": "ScoresUpdateStats"
                  }
                }
              },
              {
                "name": "events_sub_tree_root",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "ScoresUpdateStats",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "update_count",
                "type": "i32"
              },
              {
                "name": "min_timestamp",
                "type": "i64"
              },
              {
                "name": "max_timestamp",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "ServiceRow",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "row_id",
                "type": "u16"
              },
              {
                "name": "price_per_week_token",
                "type": "u64"
              },
              {
                "name": "sampling_interval_sec",
                "type": "u32"
              },
              {
                "name": "league_bundle_id",
                "type": "i16"
              },
              {
                "name": "market_bundle_id",
                "type": "i16"
              }
            ]
          }
        },
        {
          "name": "StatTerm",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "stat_to_prove",
                "type": {
                  "defined": {
                    "name": "ScoreStat"
                  }
                }
              },
              {
                "name": "event_stat_root",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "stat_proof",
                "type": {
                  "vec": {
                    "defined": {
                      "name": "ProofNode"
                    }
                  }
                }
              }
            ]
          }
        },
        {
          "name": "TraderPredicate",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "threshold",
                "type": "i32"
              },
              {
                "name": "comparison",
                "type": {
                  "defined": {
                    "name": "Comparison"
                  }
                }
              }
            ]
          }
        }
      ],
      "constants": [
        {
          "name": "BACKEND_ADMIN_PUBKEY",
          "type": "pubkey",
          "value": "54Wot8oX53yKTtfoJwMc8RHrsqL1p6WC71devAoB1GGT"
        },
        {
          "name": "LAMPORTS_PER_SOL",
          "type": "f64",
          "value": "1000000000.0"
        },
        {
          "name": "MIN_DEPOSIT_TOKENS",
          "type": "u64",
          "value": "1000000"
        },
        {
          "name": "MIN_USER_BALANCE",
          "type": "u64",
          "value": "1000000"
        },
        {
          "name": "STAKE_AMOUNT",
          "type": "u64",
          "value": "250000000"
        },
        {
          "name": "SUBSCRIPTION_DURATION",
          "type": "i64",
          "value": "604800"
        },
        {
          "name": "SUBSCRIPTION_PRICE_TOKEN",
          "type": "u64",
          "value": "25000000"
        },
        {
          "name": "TOKEN_DECIMALS",
          "type": "u32",
          "value": "6"
        },
        {
          "name": "TOKEN_PRICE_IN_SOL",
          "type": "f64",
          "value": "0.01"
        },
        {
          "name": "TOKEN_PRICE_IN_USDT",
          "type": "u128",
          "value": "1000"
        },
        {
          "name": "TXLINE_MINT",
          "type": "pubkey",
          "value": "Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL"
        },
        {
          "name": "USDT_DECIMALS_FACTOR",
          "type": "u128",
          "value": "1000000"
        },
        {
          "name": "USDT_MINT",
          "type": "pubkey",
          "value": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
        }
      ]
    }
    ```
  </Tab>

  <Tab title="Types">
    ```typescript theme={null}
    /**
     * Program IDL in camelCase format in order to be used in JS/TS.
     *
     * Note that this is only a type helper and is not the actual IDL. The original
     * IDL can be found at `target/idl/txoracle.json`.
     */
    export type Txoracle = {
      "address": "9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA",
      "metadata": {
        "name": "txoracle",
        "version": "1.5.2",
        "spec": "0.1.0",
        "description": "TxODDS TxLINE Data system"
      },
      "instructions": [
        {
          "name": "closePricingMatrix",
          "discriminator": [
            251,
            118,
            215,
            117,
            22,
            155,
            38,
            73
          ],
          "accounts": [
            {
              "name": "pricingMatrix",
              "writable": true
            },
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": []
        },
        {
          "name": "initializePricingMatrix",
          "discriminator": [
            147,
            32,
            167,
            248,
            235,
            57,
            210,
            6
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "pricingMatrix",
              "writable": true
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "rows",
              "type": {
                "vec": {
                  "defined": {
                    "name": "serviceRow"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "initializeTreasuryV2",
          "discriminator": [
            18,
            140,
            152,
            210,
            31,
            25,
            22,
            171
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "tokenTreasuryVault",
              "writable": true
            },
            {
              "name": "tokenTreasuryPda"
            },
            {
              "name": "subscriptionTokenMint"
            },
            {
              "name": "systemProgram"
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "associatedTokenProgram"
            }
          ],
          "args": []
        },
        {
          "name": "initializeUsdtTreasury",
          "discriminator": [
            81,
            0,
            86,
            241,
            86,
            85,
            243,
            74
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "usdtTreasuryVault",
              "writable": true
            },
            {
              "name": "usdtTreasuryPda"
            },
            {
              "name": "usdtMint"
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "associatedTokenProgram"
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": []
        },
        {
          "name": "insertBatchRoot",
          "discriminator": [
            243,
            170,
            208,
            158,
            207,
            29,
            237,
            93
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "dailyBatchRoots",
              "writable": true
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "epochDay",
              "type": "u16"
            },
            {
              "name": "hourOfDay",
              "type": "u8"
            },
            {
              "name": "minuteOfHour",
              "type": "u8"
            },
            {
              "name": "root",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            },
            {
              "name": "accountBump",
              "type": "u8"
            }
          ]
        },
        {
          "name": "insertFixturesRoot",
          "discriminator": [
            18,
            70,
            8,
            160,
            75,
            200,
            109,
            235
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "tenDailyFixturesRoots",
              "docs": [
                "The address is constrained by the seeds, and we verify the",
                "discriminator and owner inside the instruction."
              ],
              "writable": true
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "epochDay",
              "type": "u16"
            },
            {
              "name": "index",
              "type": "u64"
            },
            {
              "name": "root",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          ]
        },
        {
          "name": "insertScoresRoot",
          "discriminator": [
            137,
            39,
            242,
            97,
            131,
            204,
            100,
            133
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "dailyScoresRoots",
              "docs": [
                "The address is constrained by the seeds, and we verify the",
                "discriminator and owner inside the instruction."
              ],
              "writable": true
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "epochDay",
              "type": "u16"
            },
            {
              "name": "hourOfDay",
              "type": "u8"
            },
            {
              "name": "minuteOfHour",
              "type": "u8"
            },
            {
              "name": "root",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          ]
        },
        {
          "name": "purchaseSubscriptionTokenUsdt",
          "discriminator": [
            198,
            251,
            223,
            9,
            31,
            184,
            166,
            188
          ],
          "accounts": [
            {
              "name": "buyer",
              "writable": true,
              "signer": true
            },
            {
              "name": "backendAdmin",
              "docs": [
                "Require backend server authority to cosign to authorize the purchase"
              ],
              "signer": true
            },
            {
              "name": "usdtMint"
            },
            {
              "name": "buyerUsdtAccount",
              "writable": true
            },
            {
              "name": "usdtTreasuryVault",
              "writable": true
            },
            {
              "name": "usdtTreasuryPda"
            },
            {
              "name": "subscriptionTokenMint"
            },
            {
              "name": "tokenTreasuryVault",
              "writable": true
            },
            {
              "name": "tokenTreasuryPda"
            },
            {
              "name": "buyerTokenAccount",
              "writable": true
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "token2022Program"
            },
            {
              "name": "systemProgram"
            },
            {
              "name": "associatedTokenProgram"
            }
          ],
          "args": [
            {
              "name": "txlineAmount",
              "type": "u64"
            }
          ]
        },
        {
          "name": "subscribe",
          "discriminator": [
            254,
            28,
            191,
            138,
            156,
            179,
            183,
            53
          ],
          "accounts": [
            {
              "name": "user",
              "writable": true,
              "signer": true
            },
            {
              "name": "pricingMatrix"
            },
            {
              "name": "tokenMint"
            },
            {
              "name": "userTokenAccount",
              "writable": true
            },
            {
              "name": "tokenTreasuryVault",
              "writable": true
            },
            {
              "name": "tokenTreasuryPda",
              "docs": [
                "Hold the PDA that owns the vault"
              ]
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "systemProgram"
            },
            {
              "name": "associatedTokenProgram"
            }
          ],
          "args": [
            {
              "name": "serviceLevelId",
              "type": "u16"
            },
            {
              "name": "weeks",
              "type": "u8"
            }
          ]
        },
        {
          "name": "updatePricingMatrix",
          "discriminator": [
            177,
            191,
            172,
            252,
            42,
            203,
            8,
            164
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "pricingMatrix",
              "writable": true
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "rows",
              "type": {
                "vec": {
                  "defined": {
                    "name": "serviceRow"
                  }
                }
              }
            }
          ]
        },
        {
          "name": "validateFixture",
          "discriminator": [
            231,
            129,
            218,
            86,
            223,
            114,
            21,
            126
          ],
          "accounts": [
            {
              "name": "tenDailyFixturesRoots",
              "docs": [
                "Constrain the address by seeds to ensure the correct PDA is loaded"
              ]
            }
          ],
          "args": [
            {
              "name": "snapshot",
              "type": {
                "defined": {
                  "name": "fixture"
                }
              }
            },
            {
              "name": "summary",
              "type": {
                "defined": {
                  "name": "fixtureBatchSummary"
                }
              }
            },
            {
              "name": "subTreeProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            },
            {
              "name": "mainTreeProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "validateFixtureBatch",
          "discriminator": [
            85,
            223,
            204,
            7,
            4,
            87,
            157,
            1
          ],
          "accounts": [
            {
              "name": "tenDailyFixturesRoots",
              "docs": [
                "Constrain the address by seeds to ensure the correct PDA is loaded"
              ]
            }
          ],
          "args": [
            {
              "name": "index",
              "type": "u8"
            },
            {
              "name": "metadata",
              "type": {
                "defined": {
                  "name": "batchMetadata"
                }
              }
            },
            {
              "name": "proof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "validateOdds",
          "discriminator": [
            192,
            19,
            91,
            138,
            104,
            100,
            212,
            86
          ],
          "accounts": [
            {
              "name": "dailyOddsMerkleRoots"
            }
          ],
          "args": [
            {
              "name": "ts",
              "type": "i64"
            },
            {
              "name": "oddsSnapshot",
              "type": {
                "defined": {
                  "name": "odds"
                }
              }
            },
            {
              "name": "summary",
              "type": {
                "defined": {
                  "name": "oddsBatchSummary"
                }
              }
            },
            {
              "name": "subTreeProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            },
            {
              "name": "mainTreeProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "validateStat",
          "discriminator": [
            107,
            197,
            232,
            90,
            191,
            136,
            105,
            185
          ],
          "accounts": [
            {
              "name": "dailyScoresMerkleRoots"
            }
          ],
          "args": [
            {
              "name": "ts",
              "type": "i64"
            },
            {
              "name": "fixtureSummary",
              "type": {
                "defined": {
                  "name": "scoresBatchSummary"
                }
              }
            },
            {
              "name": "fixtureProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            },
            {
              "name": "mainTreeProof",
              "type": {
                "vec": {
                  "defined": {
                    "name": "proofNode"
                  }
                }
              }
            },
            {
              "name": "predicate",
              "type": {
                "defined": {
                  "name": "traderPredicate"
                }
              }
            },
            {
              "name": "statA",
              "type": {
                "defined": {
                  "name": "statTerm"
                }
              }
            },
            {
              "name": "statB",
              "type": {
                "option": {
                  "defined": {
                    "name": "statTerm"
                  }
                }
              }
            },
            {
              "name": "op",
              "type": {
                "option": {
                  "defined": {
                    "name": "binaryExpression"
                  }
                }
              }
            }
          ],
          "returns": "bool"
        },
        {
          "name": "withdrawUsdt",
          "discriminator": [
            117,
            75,
            94,
            162,
            178,
            92,
            19,
            141
          ],
          "accounts": [
            {
              "name": "authority",
              "writable": true,
              "signer": true
            },
            {
              "name": "adminDestination",
              "writable": true
            },
            {
              "name": "usdtTreasuryVault",
              "writable": true
            },
            {
              "name": "usdtTreasuryPda"
            },
            {
              "name": "usdtMint"
            },
            {
              "name": "tokenProgram"
            },
            {
              "name": "associatedTokenProgram"
            },
            {
              "name": "systemProgram"
            }
          ],
          "args": [
            {
              "name": "amount",
              "type": "u64"
            }
          ]
        }
      ],
      "accounts": [
        {
          "name": "pricingMatrix",
          "discriminator": [
            173,
            13,
            64,
            22,
            248,
            77,
            110,
            106
          ]
        }
      ],
      "errors": [
        {
          "code": 6000,
          "name": "eventNotActive",
          "msg": "Event is not active"
        },
        {
          "code": 6001,
          "name": "pricesMismatch",
          "msg": "Prices and price names arrays must be the same length"
        },
        {
          "code": 6002,
          "name": "invalidOddsUpdate",
          "msg": "Invalid odds update for this event"
        },
        {
          "code": 6003,
          "name": "invalidSubTreeProof",
          "msg": "Invalid sub-tree proof. The snapshot does not belong to the summary."
        },
        {
          "code": 6004,
          "name": "invalidMainTreeProof",
          "msg": "Invalid main tree proof. The summary does not belong to the on-chain root."
        },
        {
          "code": 6005,
          "name": "timeSlotMismatch",
          "msg": "Time slot mismatch between snapshot and on-chain root account."
        },
        {
          "code": 6006,
          "name": "invalidTime",
          "msg": "The provided hour or minute is out of the valid range."
        },
        {
          "code": 6007,
          "name": "rootNotAvailable",
          "msg": "Merkle root for this time slot has not been posted by the oracle."
        },
        {
          "code": 6008,
          "name": "accountDiscriminatorMismatch",
          "msg": "Mismatched account discriminator."
        },
        {
          "code": 6009,
          "name": "invalidPda",
          "msg": "The provided daily root account does not match the expected PDA."
        },
        {
          "code": 6010,
          "name": "timestampMismatch",
          "msg": "The timestamp provided for seed generation does not match the timestamp in the snapshot payload."
        },
        {
          "code": 6011,
          "name": "sliceError",
          "msg": "Could not slice the account data correctly."
        },
        {
          "code": 6012,
          "name": "invalidOwner",
          "msg": "Invalid account owner."
        },
        {
          "code": 6013,
          "name": "invalidTimeSlot",
          "msg": "Invalid time slot, must be aligned on a 5-min boundary."
        },
        {
          "code": 6014,
          "name": "stakeStillLocked",
          "msg": "Stake is still locked and cannot be withdrawn yet."
        },
        {
          "code": 6015,
          "name": "invalidRecipient",
          "msg": "Invalid recipient of the financial transaction."
        },
        {
          "code": 6016,
          "name": "activeSubscription",
          "msg": "You already have an active subscription."
        },
        {
          "code": 6017,
          "name": "unauthorized",
          "msg": "Unauthorized account updater."
        },
        {
          "code": 6018,
          "name": "invalidAccountOwner",
          "msg": "Invalid account owner."
        },
        {
          "code": 6019,
          "name": "invalidMintAuthority",
          "msg": "Invalid mint authority."
        },
        {
          "code": 6020,
          "name": "invalidMint",
          "msg": "Invalid mint."
        },
        {
          "code": 6021,
          "name": "predicateFailed",
          "msg": "Predicate failed."
        },
        {
          "code": 6022,
          "name": "invalidFixtureSubTreeProof",
          "msg": "Invalid sub-tree proof for fixture"
        },
        {
          "code": 6023,
          "name": "invalidStatProof",
          "msg": "Invalid stats proof for event"
        },
        {
          "code": 6024,
          "name": "invalidStatCombination",
          "msg": "invalid stat combination"
        },
        {
          "code": 6025,
          "name": "missingSecondStat",
          "msg": "Missing second stat"
        },
        {
          "code": 6026,
          "name": "unexpectedSecondStat",
          "msg": "Unexpected second stat"
        },
        {
          "code": 6027,
          "name": "overflow",
          "msg": "overflow"
        },
        {
          "code": 6028,
          "name": "tradeNotActive",
          "msg": "Trade not active"
        },
        {
          "code": 6029,
          "name": "invalidTrader",
          "msg": "Invalid trader"
        },
        {
          "code": 6030,
          "name": "winnerMismatch",
          "msg": "Winner mismatch"
        },
        {
          "code": 6031,
          "name": "tradeTermsMismatch",
          "msg": "Trade terms mismatch"
        },
        {
          "code": 6032,
          "name": "unauthorizedSettler",
          "msg": "Unauthorized settler"
        },
        {
          "code": 6033,
          "name": "fundsBelowMinimumDeposit",
          "msg": "Funds below minimal deposit amount"
        },
        {
          "code": 6034,
          "name": "insufficientUserBalance",
          "msg": "Insufficient token balance"
        },
        {
          "code": 6035,
          "name": "zeroAmount",
          "msg": "Cannot withdraw zero amount"
        },
        {
          "code": 6036,
          "name": "vaultNotEmpty",
          "msg": "Vault not empty"
        },
        {
          "code": 6037,
          "name": "insufficientVaultBalance",
          "msg": "Insufficient vault balance"
        },
        {
          "code": 6038,
          "name": "calculationError",
          "msg": "Calculation error"
        },
        {
          "code": 6039,
          "name": "invalidSubscriptionTs",
          "msg": "Subscription end Ts invalid"
        },
        {
          "code": 6040,
          "name": "cannotShortenSubscription",
          "msg": "Cannot shorten an existing subscription"
        },
        {
          "code": 6041,
          "name": "invalidWeeks",
          "msg": "Weeks must be a multiple of 4"
        },
        {
          "code": 6042,
          "name": "invalidTimeAlignment",
          "msg": "Invalid time alignment"
        },
        {
          "code": 6043,
          "name": "invalidEpochDayAlignment",
          "msg": "Invalid epoch day alignment"
        },
        {
          "code": 6044,
          "name": "accountDataTooSmall",
          "msg": "Account data too small"
        },
        {
          "code": 6045,
          "name": "insufficientLiquidity",
          "msg": "Insufficient liquidity"
        },
        {
          "code": 6046,
          "name": "invalidAmount",
          "msg": "Invalid amount"
        },
        {
          "code": 6047,
          "name": "invalidExpiration",
          "msg": "Invalid expiration"
        },
        {
          "code": 6048,
          "name": "fixtureMismatch",
          "msg": "Fixture mismatch"
        },
        {
          "code": 6049,
          "name": "periodMismatch",
          "msg": "Period mismatch"
        },
        {
          "code": 6050,
          "name": "intentNotActive",
          "msg": "Intent not active"
        },
        {
          "code": 6051,
          "name": "orderNotYetExpired",
          "msg": "Order not yet expired"
        },
        {
          "code": 6052,
          "name": "termsMismatch",
          "msg": "Terms mismatch"
        },
        {
          "code": 6053,
          "name": "statKeyMismatch",
          "msg": "Stat key mismatch"
        },
        {
          "code": 6054,
          "name": "invalidVault",
          "msg": "Invalid vault"
        },
        {
          "code": 6055,
          "name": "equivocationAttempt",
          "msg": "Equivocation attempt"
        },
        {
          "code": 6056,
          "name": "numericOverflow",
          "msg": "Numeric overflow"
        },
        {
          "code": 6057,
          "name": "invalidAccountData",
          "msg": "Invalid account data"
        },
        {
          "code": 6058,
          "name": "rateLimitExceeded",
          "msg": "Rate limit exceeded"
        },
        {
          "code": 6059,
          "name": "invalidServiceLevelId",
          "msg": "Invalid service level Id"
        },
        {
          "code": 6060,
          "name": "initialRowsLimitExceeded",
          "msg": "Initial rows limit exceeded"
        },
        {
          "code": 6061,
          "name": "missingStat",
          "msg": "Missing stat"
        },
        {
          "code": 6062,
          "name": "proofTooLarge",
          "msg": "Proof too large"
        },
        {
          "code": 6063,
          "name": "tradeTooSmall",
          "msg": "Trade too small"
        },
        {
          "code": 6064,
          "name": "maxRowsLimitExceeded",
          "msg": "Max rows limit exceeded"
        },
        {
          "code": 6065,
          "name": "unauthorizedAdmin",
          "msg": "Unauthorized admin"
        }
      ],
      "types": [
        {
          "name": "batchMetadata",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "totalUpdateCount",
                "type": "i32"
              },
              {
                "name": "numUniqueFixtures",
                "type": "i32"
              },
              {
                "name": "overallBatchStartTs",
                "type": "i64"
              },
              {
                "name": "overallBatchEndTs",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "binaryExpression",
          "type": {
            "kind": "enum",
            "variants": [
              {
                "name": "add"
              },
              {
                "name": "subtract"
              }
            ]
          }
        },
        {
          "name": "comparison",
          "type": {
            "kind": "enum",
            "variants": [
              {
                "name": "greaterThan"
              },
              {
                "name": "lessThan"
              },
              {
                "name": "equalTo"
              }
            ]
          }
        },
        {
          "name": "fixture",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "ts",
                "type": "i64"
              },
              {
                "name": "startTime",
                "type": "i64"
              },
              {
                "name": "competition",
                "type": "string"
              },
              {
                "name": "competitionId",
                "type": "i32"
              },
              {
                "name": "fixtureGroupId",
                "type": "i32"
              },
              {
                "name": "participant1Id",
                "type": "i32"
              },
              {
                "name": "participant1",
                "type": "string"
              },
              {
                "name": "participant2Id",
                "type": "i32"
              },
              {
                "name": "participant2",
                "type": "string"
              },
              {
                "name": "fixtureId",
                "type": "i64"
              },
              {
                "name": "participant1IsHome",
                "type": "bool"
              }
            ]
          }
        },
        {
          "name": "fixtureBatchSummary",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixtureId",
                "type": "i64"
              },
              {
                "name": "competitionId",
                "type": "i32"
              },
              {
                "name": "competition",
                "type": "string"
              },
              {
                "name": "updateStats",
                "type": {
                  "defined": {
                    "name": "fixtureUpdateStats"
                  }
                }
              },
              {
                "name": "updateSubTreeRoot",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "fixtureUpdateStats",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "updateCount",
                "type": "u32"
              },
              {
                "name": "minTimestamp",
                "type": "i64"
              },
              {
                "name": "maxTimestamp",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "marketIntentParams",
          "type": {
            "kind": "struct",
            "fields": []
          }
        },
        {
          "name": "odds",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixtureId",
                "type": "i64"
              },
              {
                "name": "messageId",
                "type": "string"
              },
              {
                "name": "ts",
                "type": "i64"
              },
              {
                "name": "bookmaker",
                "type": "string"
              },
              {
                "name": "bookmakerId",
                "type": "i32"
              },
              {
                "name": "superOddsType",
                "type": "string"
              },
              {
                "name": "gameState",
                "type": {
                  "option": "string"
                }
              },
              {
                "name": "inRunning",
                "type": "bool"
              },
              {
                "name": "marketParameters",
                "type": {
                  "option": "string"
                }
              },
              {
                "name": "marketPeriod",
                "type": {
                  "option": "string"
                }
              },
              {
                "name": "priceNames",
                "type": {
                  "vec": "string"
                }
              },
              {
                "name": "prices",
                "type": {
                  "vec": "i32"
                }
              }
            ]
          }
        },
        {
          "name": "oddsBatchSummary",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixtureId",
                "type": "i64"
              },
              {
                "name": "updateStats",
                "type": {
                  "defined": {
                    "name": "oddsUpdateStats"
                  }
                }
              },
              {
                "name": "oddsSubTreeRoot",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "oddsUpdateStats",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "updateCount",
                "type": "u32"
              },
              {
                "name": "minTimestamp",
                "type": "i64"
              },
              {
                "name": "maxTimestamp",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "pricingMatrix",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "admin",
                "type": "pubkey"
              },
              {
                "name": "rows",
                "type": {
                  "vec": {
                    "defined": {
                      "name": "serviceRow"
                    }
                  }
                }
              }
            ]
          }
        },
        {
          "name": "proofNode",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "hash",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "isRightSibling",
                "type": "bool"
              }
            ]
          }
        },
        {
          "name": "scoreStat",
          "docs": [
            "The on-chain representation of a single, provable key-value statistic.",
            "This is the leaf of the inner-most Merkle tree."
          ],
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "key",
                "type": "u32"
              },
              {
                "name": "value",
                "type": "i32"
              },
              {
                "name": "period",
                "type": "i32"
              }
            ]
          }
        },
        {
          "name": "scoresBatchSummary",
          "docs": [
            "The summary for a single fixture's scores events within a 5-minute batch.",
            "This contains the root of the sub-tree of all events for that fixture."
          ],
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "fixtureId",
                "type": "i64"
              },
              {
                "name": "updateStats",
                "type": {
                  "defined": {
                    "name": "scoresUpdateStats"
                  }
                }
              },
              {
                "name": "eventsSubTreeRoot",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "scoresUpdateStats",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "updateCount",
                "type": "i32"
              },
              {
                "name": "minTimestamp",
                "type": "i64"
              },
              {
                "name": "maxTimestamp",
                "type": "i64"
              }
            ]
          }
        },
        {
          "name": "serviceRow",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "rowId",
                "type": "u16"
              },
              {
                "name": "pricePerWeekToken",
                "type": "u64"
              },
              {
                "name": "samplingIntervalSec",
                "type": "u32"
              },
              {
                "name": "leagueBundleId",
                "type": "i16"
              },
              {
                "name": "marketBundleId",
                "type": "i16"
              }
            ]
          }
        },
        {
          "name": "statTerm",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "statToProve",
                "type": {
                  "defined": {
                    "name": "scoreStat"
                  }
                }
              },
              {
                "name": "eventStatRoot",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "statProof",
                "type": {
                  "vec": {
                    "defined": {
                      "name": "proofNode"
                    }
                  }
                }
              }
            ]
          }
        },
        {
          "name": "traderPredicate",
          "type": {
            "kind": "struct",
            "fields": [
              {
                "name": "threshold",
                "type": "i32"
              },
              {
                "name": "comparison",
                "type": {
                  "defined": {
                    "name": "comparison"
                  }
                }
              }
            ]
          }
        }
      ],
      "constants": [
        {
          "name": "backendAdminPubkey",
          "type": "pubkey",
          "value": "54Wot8oX53yKTtfoJwMc8RHrsqL1p6WC71devAoB1GGT"
        },
        {
          "name": "lamportsPerSol",
          "type": "f64",
          "value": "1000000000.0"
        },
        {
          "name": "minDepositTokens",
          "type": "u64",
          "value": "1000000"
        },
        {
          "name": "minUserBalance",
          "type": "u64",
          "value": "1000000"
        },
        {
          "name": "stakeAmount",
          "type": "u64",
          "value": "250000000"
        },
        {
          "name": "subscriptionDuration",
          "type": "i64",
          "value": "604800"
        },
        {
          "name": "subscriptionPriceToken",
          "type": "u64",
          "value": "25000000"
        },
        {
          "name": "tokenDecimals",
          "type": "u32",
          "value": "6"
        },
        {
          "name": "tokenPriceInSol",
          "type": "f64",
          "value": "0.01"
        },
        {
          "name": "tokenPriceInUsdt",
          "type": "u128",
          "value": "1000"
        },
        {
          "name": "txlineMint",
          "type": "pubkey",
          "value": "Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL"
        },
        {
          "name": "usdtDecimalsFactor",
          "type": "u128",
          "value": "1000000"
        },
        {
          "name": "usdtMint",
          "type": "pubkey",
          "value": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
        }
      ]
    };

    ```
  </Tab>
</Tabs>


# Quickstart
Source: https://txline-docs.txodds.com/documentation/quickstart

Get started with the TxLINE API in minutes

## Overview

TxLINE provides cryptographically verifiable sports data through a hybrid Solana on-chain and TxODDS off-chain system. Access fixtures, odds, and scores with time-limited API tokens secured by on-chain subscriptions.

***

## Getting Started

<Info>
  **Want to try for free?** Check out our [World Cup Free Tier](/documentation/worldcup) for instant access to World Cup and International Friendlies data with no payment required.
</Info>

Choose the path that matches your use case:

* **Free World Cup path**: Follow the [World Cup Free Tier](/documentation/worldcup) guide for service levels 1 or 12. No TxL purchase is required.
* **Paid subscription path**: Continue below to purchase TxL if needed, subscribe on-chain, and activate an API token.

## Select Your Network

Pick one network and use it consistently for every step. The Solana RPC, program ID, TxL mint, guest JWT, and activation endpoint must all be on the same network.

```typescript theme={null}
import * as anchor from "@coral-xyz/anchor";
import type { Txoracle } from "./types/txoracle"; // Use the matching mainnet/devnet type
import txoracleIdl from "./idl/txoracle.json"; // Use the matching mainnet/devnet IDL
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import axios from "axios";
import nacl from "tweetnacl";

const NETWORK: "mainnet" | "devnet" = "mainnet";

const CONFIG = {
  mainnet: {
    rpcUrl: "https://api.mainnet-beta.solana.com",
    apiOrigin: "https://txline.txodds.com",
    programId: new PublicKey("9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA"),
    txlTokenMint: new PublicKey("Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL"),
  },
  devnet: {
    rpcUrl: "https://api.devnet.solana.com",
    apiOrigin: "https://txline-dev.txodds.com",
    programId: new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"),
    txlTokenMint: new PublicKey("4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG"),
  },
} as const;

const { rpcUrl, apiOrigin, programId, txlTokenMint } = CONFIG[NETWORK];
const apiBaseUrl = `${apiOrigin}/api`;

const connection = new Connection(rpcUrl, "confirmed");
const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});
anchor.setProvider(provider);

const program = new anchor.Program<Txoracle>(
  txoracleIdl as Txoracle,
  provider
);

if (!program.programId.equals(programId)) {
  throw new Error(
    `Loaded IDL program ${program.programId.toBase58()} does not match ${NETWORK} program ${programId.toBase58()}`
  );
}
```

<Warning>
  Do not activate a devnet transaction on `https://txline.txodds.com`, and do not activate a mainnet transaction on `https://txline-dev.txodds.com`. Use the matching `apiOrigin` from the selected network.
</Warning>

## Purchase TxL (Optional)

<Info>
  **Note**: Purchasing TxL tokens is optional. We offer [free tiers for World Cup and International Friendlies](/documentation/worldcup) data with no payment required. View all [subscription tiers](/documentation/subscription-tiers) to see free and premium options.
</Info>

In order to purchase TxL, your wallet will need to be funded with USDT. If you don't have USDT on Solana, you can swap for it using [Jupiter](https://jup.ag/) or another exchange.

TxL purchases use a 2-step process: request a quote from the backend, then verify and sign the transaction locally.

### Step 1: Request Purchase Quote

```typescript theme={null}
// Get guest JWT
const authResponse = await axios.post(`${apiOrigin}/auth/guest/start`);
const jwt = authResponse.data.token;

// Request purchase quote
const txlineAmount = 50; // Amount of TxL tokens to purchase

const quoteResponse = await fetch(`${apiBaseUrl}/guest/purchase/quote`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`
  },
  body: JSON.stringify({
    buyerPubkey: wallet.publicKey.toBase58(),
    txlineAmount: txlineAmount
  })
});

const quoteData = await quoteResponse.json();
console.log(`Base Cost: ${quoteData.baseUsdtCost} USDT`);
console.log(`Premium Fee: ${quoteData.feeUsdtAmount} USDT`);
console.log(`Total: ${quoteData.totalUsdtCharged} USDT`);
```

### Step 2: Verify and Sign Transaction

```typescript theme={null}
// Deserialize the transaction from the quote
const txBuffer = Buffer.from(quoteData.transactionBase64, "base64");
const transaction = anchor.web3.Transaction.from(txBuffer);

// Verify transaction safety locally (recommended)
// This ensures the transaction matches what you requested

// Sign the transaction with either a local Keypair or a wallet adapter
const signedTransaction =
  "secretKey" in wallet
    ? (transaction.partialSign(wallet), transaction)
    : await wallet.signTransaction(transaction);

// Broadcast to Solana
const txSignature = await connection.sendRawTransaction(signedTransaction.serialize(), {
  skipPreflight: false,
  preflightCommitment: "confirmed"
});

// Confirm transaction
await connection.confirmTransaction(txSignature, "confirmed");
console.log("Purchase successful:", txSignature);
```

<Note>
  TxODDS may refuse purchase requests and ask for KYC (Know Your Customer) verification in accordance with compliance requirements.
</Note>

## Subscribe On-Chain

Subscribe to TxLINE on-chain after choosing a service level. Paid tiers require TxL; the free World Cup tiers do not require a TxL purchase. Choose between a standard subscription or a custom league selection.

Derive the shared accounts once before using either subscription tab:

```typescript theme={null}
const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("token_treasury_v2")],
  program.programId
);

const tokenTreasuryVault = getAssociatedTokenAddressSync(
  txlTokenMint,
  tokenTreasuryPda,
  true,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
);

const [pricingMatrixPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("pricing_matrix")],
  program.programId
);

const userTokenAccount = getAssociatedTokenAddressSync(
  txlTokenMint,
  provider.wallet.publicKey,
  false,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
);
```

<Tabs>
  <Tab title="Standard Subscription">
    ```typescript theme={null}
    const SERVICE_LEVEL_ID = 1;
    const DURATION_WEEKS = 4;
    const SELECTED_LEAGUES: number[] = []; // Standard bundle

    const txSig = await program.methods
      .subscribe(SERVICE_LEVEL_ID, DURATION_WEEKS)
      .accounts({
        user: provider.wallet.publicKey,
        pricingMatrix: pricingMatrixPda,
        tokenMint: txlTokenMint,
        userTokenAccount,
        tokenTreasuryVault,
        tokenTreasuryPda,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    ```
  </Tab>

  <Tab title="Custom Leagues">
    ```typescript theme={null}
    const SERVICE_LEVEL_ID = 3;
    const DURATION_WEEKS = 4;
    const SELECTED_LEAGUES = [500001]; // Your league IDs

    const txSig = await program.methods
      .subscribe(SERVICE_LEVEL_ID, DURATION_WEEKS)
      .accounts({
        user: provider.wallet.publicKey,
        pricingMatrix: pricingMatrixPda,
        tokenMint: txlTokenMint,
        userTokenAccount,
        tokenTreasuryVault,
        tokenTreasuryPda,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    ```
  </Tab>
</Tabs>

## Activate Your API Token

After subscribing on-chain, activate your API access by signing the transaction and calling the activation endpoint.

```typescript theme={null}
// Get guest JWT
const authResponse = await axios.post(`${apiOrigin}/auth/guest/start`);
const jwt = authResponse.data.token;

// Sign the subscription transaction
const messageString = `${txSig}:${SELECTED_LEAGUES.join(",")}:${jwt}`;
const message = new TextEncoder().encode(messageString);

// For SELECTED_LEAGUES = [], this signs `${txSig}::${jwt}`.
async function signActivationMessage(message: Uint8Array): Promise<Uint8Array> {
  if ("signMessage" in wallet && wallet.signMessage) {
    return wallet.signMessage(message);
  }

  const localPayer = (provider.wallet as anchor.Wallet & {
    payer?: anchor.web3.Keypair;
  }).payer;

  if (localPayer) {
    return nacl.sign.detached(message, localPayer.secretKey);
  }

  throw new Error("Wallet must support signMessage, or run with a local Anchor payer.");
}

const signatureBytes = await signActivationMessage(message);
const walletSignature = Buffer.from(signatureBytes).toString("base64");

// Activate API access
const activationResponse = await axios.post(
  `${apiBaseUrl}/token/activate`,
  {
    txSig,
    walletSignature,
    leagues: SELECTED_LEAGUES,
  },
  { headers: { Authorization: `Bearer ${jwt}` } }
);

const apiToken = activationResponse.data.token || activationResponse.data;
```

You're now ready to use the API. Send both activated credentials with data API requests:

| Header          | Value                                        |
| --------------- | -------------------------------------------- |
| `Authorization` | `Bearer ${jwt}` from `/auth/guest/start`     |
| `X-Api-Token`   | `apiToken` returned by `/api/token/activate` |

## Next Steps

* View the complete [API Reference](/api-reference/authentication/start-a-new-guest-session) to explore all available endpoints
* Check out [Subscription Tiers](/documentation/subscription-tiers) for pricing and plan options
* Try the [World Cup Free Tier](/documentation/worldcup) for instant free access


# Basketball Feed
Source: https://txline-docs.txodds.com/documentation/scores/basketball-feed

TxODDS US Basketball Feed documentation

## Coverage

Basketball score encodings and feed semantics are documented below. Use the shared [Schedule](/documentation/scores/schedule) and fixtures snapshot API for current basketball fixture availability.

## On-Chain Specifications

These specifications define how basketball game phases and statistics are encoded for on-chain operations, including cryptographic validation and trading settlement.

### Game Phase Encoding

| Name | ID | Description          | Competition Type |
| ---- | -- | -------------------- | ---------------- |
| NS   | 1  | Not started          | All              |
| Q1   | 2  | Quarter 1            | NBA              |
| Q1B  | 3  | Quarter 1 break      | NBA              |
| Q2   | 4  | Quarter 2            | NBA              |
| HT   | 5  | Halftime             | All              |
| Q3   | 6  | Quarter 3            | NBA              |
| Q3B  | 7  | Quarter 3 break      | NBA              |
| Q4   | 8  | Quarter 4            | NBA              |
| F    | 9  | Ended                | All              |
| WO   | 10 | Waiting for Overtime | All              |
| OT   | 11 | Overtime             | All              |
| OB   | 12 | Overtime Break       | All              |
| FO   | 13 | Ended after Overtime | All              |
| H1   | 19 | First half           | NCAA             |
| H2   | 20 | Second half          | NCAA             |

### Stat Period Encoding

Stats are encoded with a formula: `(half * 1000 OR quarter * 10000) + base_key`

These encodings are used for on-chain validation proofs and trading settlement.

**Full Game Stats (Keys 1-36):**

| Key | Statistic                                |
| --- | ---------------------------------------- |
| 1   | Participant 1 Total Score                |
| 2   | Participant 2 Total Score                |
| 3   | Participant 1 Total Fouls                |
| 4   | Participant 2 Total Fouls                |
| 5   | Participant 1 Total Personal Fouls       |
| 6   | Participant 2 Total Personal Fouls       |
| 7   | Participant 1 Total Blocks               |
| 8   | Participant 2 Total Blocks               |
| 9   | Participant 1 Total Rebounds             |
| 10  | Participant 2 Total Rebounds             |
| 11  | Participant 1 Total free throws made     |
| 12  | Participant 2 Total free throws made     |
| 13  | Participant 1 Total 2-points made        |
| 14  | Participant 2 Total 2-points made        |
| 15  | Participant 1 Total 3-points made        |
| 16  | Participant 2 Total 3-points made        |
| 17  | Participant 1 Total free throws missed   |
| 18  | Participant 2 Total free throws missed   |
| 19  | Participant 1 Total 2-points missed      |
| 20  | Participant 2 Total 2-points missed      |
| 21  | Participant 1 Total 3-points missed      |
| 22  | Participant 2 Total 3-points missed      |
| 23  | Participant 1 Total free throws attempts |
| 24  | Participant 2 Total free throws attempts |
| 25  | Participant 1 Total 2-points attempts    |
| 26  | Participant 2 Total 2-points attempts    |
| 27  | Participant 1 Total 3-points attempts    |
| 28  | Participant 2 Total 3-points attempts    |
| 29  | Participant 1 Total Assists              |
| 30  | Participant 2 Total Assists              |
| 31  | Participant 1 Total Turnovers            |
| 32  | Participant 2 Total Turnovers            |
| 33  | Participant 1 Total Steals               |
| 34  | Participant 2 Total Steals               |
| 35  | Participant 1 Total Used timeouts        |
| 36  | Participant 2 Total Used timeouts        |

**Period-Specific Stats** - Add period multiplier to base keys:

* **First Half (H1)**: Add 1000
* **Second Half (H2)**: Add 2000
* **Quarter 1**: Add 10000
* **Quarter 2**: Add 20000
* **Quarter 3**: Add 30000
* **Quarter 4**: Add 40000

**Usage:** These encodings are required when validating score data against on-chain Merkle roots, creating trading offers, or settling trades with cryptographic proofs.

## Documentation

<Card title="Download" icon="file-pdf" href="https://txodds.github.io/tx-on-chain/assets/txodds-basketball-feed-v1.14.2.pdf">
  Complete documentation for the TxODDS US Basketball data feed
</Card>


# American Football Feed
Source: https://txline-docs.txodds.com/documentation/scores/football-feed

TxODDS US Football Feed documentation

## Coverage

US football score encodings and feed semantics are documented below. Use the shared [Schedule](/documentation/scores/schedule) and fixtures snapshot API for current US football fixture availability.

## On-Chain Specifications

These specifications define how football game phases and statistics are encoded for on-chain operations, including cryptographic validation and trading settlement.

### Game Phase Encoding

**Standard Phases:**

| Name | ID | Description           |
| ---- | -- | --------------------- |
| NS   | 1  | Not started           |
| Q1   | 2  | Quarter 1 in play     |
| Q1B  | 3  | Quarter 1 break       |
| Q2   | 4  | Quarter 2 in play     |
| HT   | 5  | Halftime              |
| Q3   | 6  | Quarter 3 in play     |
| Q3B  | 7  | Quarter 3 break       |
| Q4   | 8  | Quarter 4 in play     |
| F    | 9  | Ended (finished)      |
| WO   | 10 | Waiting for Overtime  |
| OT   | 11 | Overtime              |
| OB   | 12 | Overtime Break        |
| FO   | 13 | Ended after Overtime  |
| I    | 14 | Interrupted           |
| A    | 15 | Abandoned             |
| C    | 16 | Cancelled             |
| TXCC | 17 | TX Coverage Cancelled |
| TXCS | 18 | TX Coverage Suspended |

**Overtime Phases:**

| Name | ID   | Description         |
| ---- | ---- | ------------------- |
| OT1  | 1011 | Overtime 1          |
| OB1  | 1012 | Overtime 1 break    |
| OT2  | 2011 | Overtime 2          |
| OB2  | 2012 | Overtime 2 break    |
| ...  | ...  | (continues to OT12) |

### Stat Period Encoding

Stats are encoded with a formula: `(half * 1000 OR quarter * 10000) + base_key`

These encodings are used for on-chain validation proofs and trading settlement.

**Full Game Stats (Keys 1-16):**

| Key | Statistic                                     |
| --- | --------------------------------------------- |
| 1   | Participant 1 Total Score                     |
| 2   | Participant 2 Total Score                     |
| 3   | Participant 1 Total Touchdowns                |
| 4   | Participant 2 Total Touchdowns                |
| 5   | Participant 1 Total Field Goals               |
| 6   | Participant 2 Total Field Goals               |
| 7   | Participant 1 Total 1pt Conversions           |
| 8   | Participant 2 Total 1pt Conversions           |
| 9   | Participant 1 Total 2pt Conversions           |
| 10  | Participant 2 Total 2pt Conversions           |
| 11  | Participant 1 Total Safeties                  |
| 12  | Participant 2 Total Safeties                  |
| 13  | Participant 1 Total 1pt Safeties              |
| 14  | Participant 2 Total 1pt Safeties              |
| 15  | Participant 1 Total Defensive 2pt Conversions |
| 16  | Participant 2 Total Defensive 2pt Conversions |

**Period-Specific Stats** - Add period multiplier to base keys:

* **First Half (H1)**: Add 1000 (e.g., key 1001 = Participant 1 1st Half Score)
* **Second Half (H2)**: Add 2000 (e.g., key 2001 = Participant 1 2nd Half Score)
* **Quarter 1**: Add 10000 (e.g., key 10001 = Participant 1 Q1 Score)
* **Quarter 2**: Add 20000 (e.g., key 20001 = Participant 1 Q2 Score)
* **Quarter 3**: Add 30000 (e.g., key 30001 = Participant 1 Q3 Score)
* **Quarter 4**: Add 40000 (e.g., key 40001 = Participant 1 Q4 Score)

**Usage:** These encodings are required when validating score data against on-chain Merkle roots, creating trading offers, or settling trades with cryptographic proofs.

## Documentation

<Card title="Download" icon="file-pdf" href="https://txodds.github.io/tx-on-chain/assets/txodds-us-football-feed-v1.17.4.pdf">
  Complete documentation for the TxODDS US Football data feed
</Card>


# Overview
Source: https://txline-docs.txodds.com/documentation/scores/overview

In-venue, scout-verified play-by-play data for US college sports

The TxLINE scores feed delivers granular, real-time play-by-play data for NCAA Football and NCAA Basketball. Collected in-venue by TxODDS scouts and instantly cross-verified by US-based analysts, this feed bypasses repurposed broadcast delays to give you raw, sub-second sports data.

Every stat is encoded and published to Solana, validating directly against on-chain Merkle roots. Any score, period, or player stat is verifiable permissionlessly at any time.

## Built for Settlement & Micro-Markets

This feed is purpose-built for high-frequency betting environments: in-play markets, player props, and micro-betting.

* **Deterministic Encoding:** Every stat maps to a fixed cryptographic key with period multipliers applied on top.
* **Reliable Proofs:** If you are building automated smart contract settlement logic or validation proofs, the exact layout schemas are defined in the technical specifications below.

## Technical Capabilities

<CardGroup>
  <Card title="Scout-Sourced Data" icon="stadium">
    Direct-from-stadium collection removes broadcast lag and delay vulnerabilities.
  </Card>

  <Card title="Deterministic Architecture" icon="code">
    Fixed-key encoding tailored for programmatic trade settlement and smart contracts.
  </Card>

  <Card title="High-Availability Pipelines" icon="server">
    Redundant infrastructure engineered for zero data loss during peak tournament events.
  </Card>
</CardGroup>


# Schedule
Source: https://txline-docs.txodds.com/documentation/scores/schedule

Confirmed fixtures currently listed for TxLINE match data coverage

## World Cup - Group Stage

### June 14, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team   | Away Team |
| --------- | ------ | ------------- | ----------------------- | ---------- | ----------- | --------- |
| 17588316  | Soccer | International | World Cup > Group Stage | 01:00      | Haiti       | Scotland  |
| 17926689  | Soccer | International | World Cup > Group Stage | 04:00      | Australia   | Turkey    |
| 17588318  | Soccer | International | World Cup > Group Stage | 17:00      | Germany     | Curacao   |
| 17588305  | Soccer | International | World Cup > Group Stage | 20:00      | Netherlands | Japan     |
| 17588239  | Soccer | International | World Cup > Group Stage | 23:00      | Ivory Coast | Ecuador   |

### June 15, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team    | Away Team  |
| --------- | ------ | ------------- | ----------------------- | ---------- | ------------ | ---------- |
| 17926553  | Soccer | International | World Cup > Group Stage | 02:00      | Sweden       | Tunisia    |
| 17588403  | Soccer | International | World Cup > Group Stage | 16:00      | Spain        | Cape Verde |
| 17588230  | Soccer | International | World Cup > Group Stage | 19:00      | Belgium      | Egypt      |
| 17588311  | Soccer | International | World Cup > Group Stage | 22:00      | Saudi Arabia | Uruguay    |

### June 16, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team | Away Team   |
| --------- | ------ | ------------- | ----------------------- | ---------- | --------- | ----------- |
| 17588241  | Soccer | International | World Cup > Group Stage | 01:00      | Iran      | New Zealand |
| 17588306  | Soccer | International | World Cup > Group Stage | 19:00      | France    | Senegal     |
| 17926828  | Soccer | International | World Cup > Group Stage | 22:00      | Iraq      | Norway      |

### June 17, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team | Away Team |
| --------- | ------ | ------------- | ----------------------- | ---------- | --------- | --------- |
| 17588322  | Soccer | International | World Cup > Group Stage | 01:00      | Argentina | Algeria   |
| 17588405  | Soccer | International | World Cup > Group Stage | 04:00      | Austria   | Jordan    |
| 17926703  | Soccer | International | World Cup > Group Stage | 17:00      | Portugal  | Congo DR  |
| 17588228  | Soccer | International | World Cup > Group Stage | 20:00      | England   | Croatia   |
| 17588406  | Soccer | International | World Cup > Group Stage | 23:00      | Ghana     | Panama    |

### June 18, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team      | Away Team            |
| --------- | ------ | ------------- | ----------------------- | ---------- | -------------- | -------------------- |
| 17588399  | Soccer | International | World Cup > Group Stage | 02:00      | Uzbekistan     | Colombia             |
| 17926765  | Soccer | International | World Cup > Group Stage | 16:00      | Czech Republic | South Africa         |
| 17926603  | Soccer | International | World Cup > Group Stage | 19:00      | Switzerland    | Bosnia & Herzegovina |
| 17588238  | Soccer | International | World Cup > Group Stage | 22:00      | Canada         | Qatar                |

### June 19, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team | Away Team   |
| --------- | ------ | ------------- | ----------------------- | ---------- | --------- | ----------- |
| 17588223  | Soccer | International | World Cup > Group Stage | 01:00      | Mexico    | South Korea |
| 17588388  | Soccer | International | World Cup > Group Stage | 19:00      | USA       | Australia   |
| 17588397  | Soccer | International | World Cup > Group Stage | 22:00      | Scotland  | Morocco     |

### June 20, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team   | Away Team   |
| --------- | ------ | ------------- | ----------------------- | ---------- | ----------- | ----------- |
| 17588317  | Soccer | International | World Cup > Group Stage | 00:30      | Brazil      | Haiti       |
| 17588229  | Soccer | International | World Cup > Group Stage | 03:00      | Turkey      | Paraguay    |
| 17926687  | Soccer | International | World Cup > Group Stage | 17:00      | Netherlands | Sweden      |
| 17588240  | Soccer | International | World Cup > Group Stage | 20:00      | Germany     | Ivory Coast |
| 17588320  | Soccer | International | World Cup > Group Stage | 23:00      | Ecuador     | Curacao     |

### June 21, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team | Away Team    |
| --------- | ------ | ------------- | ----------------------- | ---------- | --------- | ------------ |
| 17588310  | Soccer | International | World Cup > Group Stage | 04:00      | Tunisia   | Japan        |
| 17588232  | Soccer | International | World Cup > Group Stage | 16:00      | Spain     | Saudi Arabia |
| 17588390  | Soccer | International | World Cup > Group Stage | 19:00      | Belgium   | Iran         |
| 17588235  | Soccer | International | World Cup > Group Stage | 22:00      | Uruguay   | Cape Verde   |

### June 22, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team   | Away Team |
| --------- | ------ | ------------- | ----------------------- | ---------- | ----------- | --------- |
| 17588242  | Soccer | International | World Cup > Group Stage | 01:00      | New Zealand | Egypt     |
| 17588389  | Soccer | International | World Cup > Group Stage | 17:00      | Argentina   | Austria   |
| 17926647  | Soccer | International | World Cup > Group Stage | 21:00      | France      | Iraq      |

### June 23, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team | Away Team  |
| --------- | ------ | ------------- | ----------------------- | ---------- | --------- | ---------- |
| 17588313  | Soccer | International | World Cup > Group Stage | 00:00      | Norway    | Senegal    |
| 17588244  | Soccer | International | World Cup > Group Stage | 03:00      | Jordan    | Algeria    |
| 17588231  | Soccer | International | World Cup > Group Stage | 17:00      | Portugal  | Uzbekistan |
| 17588324  | Soccer | International | World Cup > Group Stage | 20:00      | England   | Ghana      |
| 17588401  | Soccer | International | World Cup > Group Stage | 23:00      | Panama    | Croatia    |

### June 24, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team            | Away Team |
| --------- | ------ | ------------- | ----------------------- | ---------- | -------------------- | --------- |
| 17926615  | Soccer | International | World Cup > Group Stage | 02:00      | Colombia             | Congo DR  |
| 17588303  | Soccer | International | World Cup > Group Stage | 19:00      | Switzerland          | Canada    |
| 17926766  | Soccer | International | World Cup > Group Stage | 19:00      | Bosnia & Herzegovina | Qatar     |
| 17588319  | Soccer | International | World Cup > Group Stage | 22:00      | Morocco              | Haiti     |
| 17588398  | Soccer | International | World Cup > Group Stage | 22:00      | Scotland             | Brazil    |

### June 25, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team      | Away Team   |
| --------- | ------ | ------------- | ----------------------- | ---------- | -------------- | ----------- |
| 17588395  | Soccer | International | World Cup > Group Stage | 01:00      | South Africa   | South Korea |
| 17926764  | Soccer | International | World Cup > Group Stage | 01:00      | Czech Republic | Mexico      |
| 17588302  | Soccer | International | World Cup > Group Stage | 20:00      | Ecuador        | Germany     |
| 17588321  | Soccer | International | World Cup > Group Stage | 20:00      | Curacao        | Ivory Coast |
| 17588236  | Soccer | International | World Cup > Group Stage | 23:00      | Tunisia        | Netherlands |
| 17926686  | Soccer | International | World Cup > Group Stage | 23:00      | Japan          | Sweden      |

### June 26, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team | Away Team |
| --------- | ------ | ------------- | ----------------------- | ---------- | --------- | --------- |
| 17588229  | Soccer | International | World Cup > Group Stage | 02:00      | Paraguay  | Australia |
| 17926593  | Soccer | International | World Cup > Group Stage | 02:00      | Turkey    | USA       |
| 17588234  | Soccer | International | World Cup > Group Stage | 19:00      | Norway    | France    |
| 17926740  | Soccer | International | World Cup > Group Stage | 19:00      | Senegal   | Iraq      |

### June 27, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team   | Away Team    |
| --------- | ------ | ------------- | ----------------------- | ---------- | ----------- | ------------ |
| 17588314  | Soccer | International | World Cup > Group Stage | 00:00      | Cape Verde  | Saudi Arabia |
| 17588404  | Soccer | International | World Cup > Group Stage | 00:00      | Uruguay     | Spain        |
| 17588309  | Soccer | International | World Cup > Group Stage | 03:00      | Egypt       | Iran         |
| 17588323  | Soccer | International | World Cup > Group Stage | 03:00      | New Zealand | Belgium      |
| 17588245  | Soccer | International | World Cup > Group Stage | 21:00      | Croatia     | Ghana        |
| 17588402  | Soccer | International | World Cup > Group Stage | 21:00      | Panama      | England      |
| 17588391  | Soccer | International | World Cup > Group Stage | 23:30      | Colombia    | Portugal     |
| 17926704  | Soccer | International | World Cup > Group Stage | 23:30      | Congo DR    | Uzbekistan   |

### June 28, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team | Away Team |
| --------- | ------ | ------------- | ----------------------- | ---------- | --------- | --------- |
| 17588325  | Soccer | International | World Cup > Group Stage | 02:00      | Jordan    | Argentina |
| 17588326  | Soccer | International | World Cup > Group Stage | 02:00      | Algeria   | Austria   |

## World Cup - Round of 32

### June 28, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team    | Away Team |
| --------- | ------ | ------------- | ----------------------- | ---------- | ------------ | --------- |
| 18167317  | Soccer | International | World Cup > Round of 32 | 19:00      | South Africa | Canada    |

### June 29, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team | Away Team |
| --------- | ------ | ------------- | ----------------------- | ---------- | --------- | --------- |
| 18172489  | Soccer | International | World Cup > Round of 32 | 17:00      | Brazil    | Japan     |
| 18175983  | Soccer | International | World Cup > Round of 32 | 20:30      | Germany   | Paraguay  |

### June 30, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team   | Away Team |
| --------- | ------ | ------------- | ----------------------- | ---------- | ----------- | --------- |
| 18172260  | Soccer | International | World Cup > Round of 32 | 01:00      | Netherlands | Morocco   |
| 18175397  | Soccer | International | World Cup > Round of 32 | 17:00      | Ivory Coast | Norway    |
| 18175981  | Soccer | International | World Cup > Round of 32 | 21:00      | France      | Sweden    |

### July 1, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team | Away Team |
| --------- | ------ | ------------- | ----------------------- | ---------- | --------- | --------- |
| 18179759  | Soccer | International | World Cup > Round of 32 | 01:00      | Mexico    | Ecuador   |
| 18179764  | Soccer | International | World Cup > Round of 32 | 16:00      | England   | Congo DR  |
| 18179550  | Soccer | International | World Cup > Round of 32 | 20:00      | Belgium   | Senegal   |

### July 2, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team | Away Team            |
| --------- | ------ | ------------- | ----------------------- | ---------- | --------- | -------------------- |
| 18172379  | Soccer | International | World Cup > Round of 32 | 00:00      | USA       | Bosnia & Herzegovina |
| 18179551  | Soccer | International | World Cup > Round of 32 | 19:00      | Spain     | Austria              |
| 18179763  | Soccer | International | World Cup > Round of 32 | 23:00      | Portugal  | Croatia              |

### July 3, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team   | Away Team  |
| --------- | ------ | ------------- | ----------------------- | ---------- | ----------- | ---------- |
| 18179552  | Soccer | International | World Cup > Round of 32 | 03:00      | Switzerland | Algeria    |
| 18176123  | Soccer | International | World Cup > Round of 32 | 18:00      | Australia   | Egypt      |
| 18175918  | Soccer | International | World Cup > Round of 32 | 22:00      | Argentina   | Cape Verde |

### July 4, 2026

| fixtureId | Sport  | Country       | Fixture Group           | Time (UTC) | Home Team | Away Team |
| --------- | ------ | ------------- | ----------------------- | ---------- | --------- | --------- |
| 18179549  | Soccer | International | World Cup > Round of 32 | 01:30      | Colombia  | Ghana     |

***

<Note>
  All times are displayed in UTC. Fixtures are subject to change. All matches include Scores and StablePrice Odds coverage.
</Note>

<Info>
  **Coverage Details**: The schedule above lists fixtures confirmed for TxLINE match data coverage. Use the fixtures snapshot API for current fixture availability.
</Info>


# Soccer Feed
Source: https://txline-docs.txodds.com/documentation/scores/soccer-feed

TxODDS Soccer Feed documentation

<Card title="World Cup 2026 Free Coverage" icon="trophy" href="/documentation/worldcup">
  Get free access to World Cup & International Friendlies data with TxLINE's complimentary tiers. Real-time and 60-second delayed options available.
</Card>

## Coverage

For a complete list of upcoming soccer fixtures and competitions covered by TxLINE, please refer to the [Schedule](/documentation/scores/schedule).

## On-Chain Specifications

These specifications define how soccer game phases and statistics are encoded for on-chain operations, including cryptographic validation and trading settlement.

### Game Phase Encoding

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

### Stat Period Encoding

Stats are encoded with a formula: `(period * 1000) + base_key`

These encodings are used for on-chain validation proofs and trading settlement.

**Full Game Stats (Keys 1-8):**

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

**Period-Specific Stats** - Add period multiplier to base keys:

* **First Half (H1)**: Add 1000 (e.g., key 1001 = Participant 1 H1 Goals)
* **Second Half (H2)**: Add 2000 (e.g., key 2001 = Participant 1 H2 Goals)
* **Extra Time 1 (ET1)**: Add 3000 (e.g., key 3001 = Participant 1 ET1 Goals)
* **Extra Time 2 (ET2)**: Add 4000 (e.g., key 4001 = Participant 1 ET2 Goals)
* **Penalty Shootout (PE)**: Add 5000 (e.g., key 5001 = Participant 1 PE Goals)

**Usage:** These encodings are required when validating score data against on-chain Merkle roots, creating trading offers, or settling trades with cryptographic proofs.

## Documentation

<Card title="Download" icon="file-pdf" href="https://txodds.github.io/tx-on-chain/assets/txodds-soccer-feed-v1.0.pdf">
  Complete documentation for the TxODDS Soccer data feed
</Card>


# Subscription Tiers
Source: https://txline-docs.txodds.com/documentation/subscription-tiers

TxLINE subscription levels and pricing

## Overview

TxLINE offers flexible data access subscriptions, each available with configurable league selections. Subscriptions are priced per 28-day period, and you can choose how many periods you want to subscribe for.

## Subscription Tiers & Pricing

**Conversion Rate**: 1 USD = 1,000 TxL

<Info>
  **What's Included**: All subscriptions include Scores and StablePrice Odds
</Info>

<Tabs>
  <Tab title="Mainnet">
    | ID | Bundle                     | Delay      | Price/28 Days             |
    | -- | -------------------------- | ---------- | ------------------------- |
    | 1  | World Cup & Int Friendlies | 60 seconds | Free                      |
    | 12 | World Cup & Int Friendlies | Real-time  | Free                      |
    | 2  | 10 Leagues                 | 60 seconds | 500,000 TxL (\$500)       |
    | 3  | 25 Leagues                 | 60 seconds | 750,000 TxL (\$750)       |
    | 4  | 50 Leagues                 | 60 seconds | 1,000,000 TxL (\$1,000)   |
    | 5  | 100 Leagues                | 60 seconds | 1,250,000 TxL (\$1,250)   |
    | 6  | All Leagues                | 60 seconds | 2,500,000 TxL (\$2,500)   |
    | 7  | 10 Leagues                 | Real-time  | 5,000,000 TxL (\$5,000)   |
    | 8  | 25 Leagues                 | Real-time  | 7,500,000 TxL (\$7,500)   |
    | 9  | 50 Leagues                 | Real-time  | 10,000,000 TxL (\$10,000) |
    | 10 | 100 Leagues                | Real-time  | 12,500,000 TxL (\$12,500) |
    | 11 | All Leagues                | Real-time  | 25,000,000 TxL (\$25,000) |
  </Tab>

  <Tab title="Devnet">
    | ID | Bundle                     | Delay      | Price/28 Days |
    | -- | -------------------------- | ---------- | ------------- |
    | 1  | World Cup & Int Friendlies | 60 seconds | Free          |
  </Tab>
</Tabs>

<Info>
  **Subscription Duration**: Subscriptions must be purchased in multiples of 4 weeks (28 days). Minimum term is 4 weeks.
</Info>

## Confirm

You can verify the current pricing directly from the on-chain program:

```typescript theme={null}
const [pricingMatrixPda] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("pricing_matrix")],
  program.programId
);

const matrix = await program.account.pricingMatrix.fetch(pricingMatrixPda);

matrix.rows.forEach((row) => {
  console.log({
    serviceLevel: row.rowId,
    tokensPerWeek: row.pricePerWeekToken,
    samplingInterval: row.samplingIntervalSec,
    leagueBundle: row.leagueBundleId,
    marketBundle: row.marketBundleId
  });
});
```

<Info>
  **Pricing subject to change**: Pricing structure may be updated at any time. Active subscriptions will honor the terms agreed upon at the time of purchase.
</Info>


# World Cup Free Tier
Source: https://txline-docs.txodds.com/documentation/worldcup

Access World Cup and International Friendlies data for free with TxLINE's complimentary tiers

## Start Building with Free World Cup Data

Experience the power of TxLINE's sports data API with our complimentary free tiers. Get instant access to World Cup and International Friendlies data with no payment required, no credit card needed, and no commitment. Choose between 60-second delayed data or real-time data - both completely free!

## What's Included

<CardGroup>
  <Card title="Two Free Tiers Available" icon="trophy">
    **Service Level 1**: World Cup & Int Friendlies with 60-second delay
    **Service Level 12**: World Cup & Int Friendlies in real-time
  </Card>

  <Card title="Historical Replay" icon="clock-rotate-left">
    Full access to historical data for past matches and events analysis.
  </Card>

  <Card title="On-Chain Verification" icon="shield-check">
    Cryptographically verifiable data with Solana blockchain anchoring.
  </Card>

  <Card title="Production Ready" icon="rocket">
    Same reliable infrastructure as our premium tiers with comprehensive documentation.
  </Card>
</CardGroup>

<Info>
  **Perfect For**: Developers building proof-of-concepts, hobbyist projects, learning platforms, or testing TxLINE before upgrading to real-time data.
</Info>

## Getting Started

### Step 1: Choose a Network and Set Up Your Wallet

Use the same network for every step: the Solana RPC, TxLINE program ID, guest JWT, and activation endpoint must all match. A devnet subscription transaction cannot be activated on the mainnet API host.

```bash theme={null}
npm install @coral-xyz/anchor @solana/web3.js @solana/spl-token axios tweetnacl
```

```typescript theme={null}
import * as anchor from "@coral-xyz/anchor";
import type { Txoracle } from "./types/txoracle"; // Use the matching mainnet/devnet type
import txoracleIdl from "./idl/txoracle.json"; // Use the matching mainnet/devnet IDL
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import axios from "axios";
import nacl from "tweetnacl";

const NETWORK: "mainnet" | "devnet" = "devnet";

const CONFIG = {
  mainnet: {
    rpcUrl: "https://api.mainnet-beta.solana.com",
    apiOrigin: "https://txline.txodds.com",
    programId: new PublicKey("9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA"),
    txlTokenMint: new PublicKey("Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL"),
  },
  devnet: {
    rpcUrl: "https://api.devnet.solana.com",
    apiOrigin: "https://txline-dev.txodds.com",
    programId: new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"),
    txlTokenMint: new PublicKey("4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG"),
  },
} as const;

const { rpcUrl, apiOrigin, programId, txlTokenMint } = CONFIG[NETWORK];
const apiBaseUrl = `${apiOrigin}/api`;

const connection = new Connection(rpcUrl, "confirmed");
const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});
anchor.setProvider(provider);

const program = new anchor.Program<Txoracle>(
  txoracleIdl as Txoracle,
  provider
);

if (!program.programId.equals(programId)) {
  throw new Error(
    `Loaded IDL program ${program.programId.toBase58()} does not match ${NETWORK} program ${programId.toBase58()}`
  );
}
```

### Step 2: Subscribe to Free Tier

Choose between the free service levels that are enabled on your network. Mainnet offers service level `1` for 60-second delayed World Cup and International Friendlies data and service level `12` for real-time data. Devnet currently documents service level `1`; check the on-chain pricing matrix before using any other devnet row.

```typescript theme={null}
// Free tier configuration - choose one:
const SERVICE_LEVEL_ID = 1;  // World Cup & Int Friendlies (60-second delay)
// const SERVICE_LEVEL_ID = 12; // Mainnet real-time World Cup & Int Friendlies
const DURATION_WEEKS = 4; // Subscribe for 4 weeks at a time
const SELECTED_LEAGUES: number[] = []; // Empty for standard bundle

const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("token_treasury_v2")],
  program.programId
);

const tokenTreasuryVault = getAssociatedTokenAddressSync(
  txlTokenMint,
  tokenTreasuryPda,
  true,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
);

const [pricingMatrixPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("pricing_matrix")],
  program.programId
);

const userTokenAccount = getAssociatedTokenAddressSync(
  txlTokenMint,
  provider.wallet.publicKey,
  false,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
);

// Subscribe on-chain
const txSig = await program.methods
  .subscribe(SERVICE_LEVEL_ID, DURATION_WEEKS)
  .accounts({
    user: provider.wallet.publicKey,
    pricingMatrix: pricingMatrixPda,
    tokenMint: txlTokenMint,
    userTokenAccount,
    tokenTreasuryVault,
    tokenTreasuryPda,
    tokenProgram: TOKEN_2022_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

console.log("Subscription transaction:", txSig);
```

<Note>
  **No Payment Required**: Free tiers require no TxL payment. The transaction still registers your wallet subscription on-chain and must be activated with the matching TxLINE API host.
</Note>

### Step 3: Activate Your API Access

After subscribing on-chain, activate your API token by signing and calling our activation endpoint.

```typescript theme={null}
// Get guest authentication token
const authResponse = await axios.post(`${apiOrigin}/auth/guest/start`);
const jwt = authResponse.data.token;

// Create message to sign
const messageString = `${txSig}:${SELECTED_LEAGUES.join(",")}:${jwt}`;
const message = new TextEncoder().encode(messageString);

// For SELECTED_LEAGUES = [], this signs `${txSig}::${jwt}`.
async function signActivationMessage(message: Uint8Array): Promise<Uint8Array> {
  if ("signMessage" in wallet && wallet.signMessage) {
    return wallet.signMessage(message);
  }

  const localPayer = (provider.wallet as anchor.Wallet & {
    payer?: anchor.web3.Keypair;
  }).payer;

  if (localPayer) {
    return nacl.sign.detached(message, localPayer.secretKey);
  }

  throw new Error("Wallet must support signMessage, or run with a local Anchor payer.");
}

const signatureBytes = await signActivationMessage(message);
const walletSignature = Buffer.from(signatureBytes).toString("base64");

// Activate your API access
const activationResponse = await axios.post(
  `${apiBaseUrl}/token/activate`,
  {
    txSig,
    walletSignature,
    leagues: SELECTED_LEAGUES,
  },
  {
    headers: { Authorization: `Bearer ${jwt}` }
  }
);

// Save your API token
const apiToken = activationResponse.data.token || activationResponse.data;
console.log("API Token activated successfully!");
```

### Step 4: Make Your First API Call

You're all set! Start fetching World Cup and International Friendlies data using your activated API credentials.

Check out the complete [API Reference](/api-reference/authentication/start-a-new-guest-session) for available endpoints including:

* **Fixtures** - Get upcoming and current fixture metadata
* **Odds** - Fetch snapshots, historical updates, and stream StablePrice odds
* **Scores** - Fetch snapshots, historical updates, and stream score events
* **Validation Proofs** - Retrieve fixture, odds, and score proofs for on-chain validation

Data API endpoints use `Authorization: Bearer ${jwt}` for the guest JWT and `X-Api-Token: ${apiToken}` for the activated API token.

## Ready for More?

Love the free tier? Upgrade to unlock:

<CardGroup>
  <Card title="Real-Time Data" icon="bolt">
    Zero delay live data for time-sensitive applications
  </Card>

  <Card title="1000+ Leagues" icon="trophy">
    Access to all major leagues worldwide
  </Card>

  <Card title="Custom Leagues" icon="sliders">
    Choose exactly which leagues you need
  </Card>
</CardGroup>

View our [Subscription Tiers](/documentation/subscription-tiers) to see all available options. Paid tiers start from just **500,000 TxL (\$500) per 28 days**.

## Frequently Asked Questions

<AccordionGroup>
  <Accordion title="Do I need to renew my free subscription?">
    All subscriptions can be purchased for any duration in multiples of 4 weeks (28 days), up to 12 months. Simply re-subscribe when your access expires. There's no cost to renew free tiers.
  </Accordion>

  <Accordion title="Can I upgrade from free tier to paid?">
    Absolutely! You can upgrade at any time by subscribing to a paid tier. Your new subscription will take effect immediately.
  </Accordion>

  <Accordion title="Is there a rate limit on free tier?">
    No rate limits on API calls. However, data has a 60-second delay compared to premium real-time tiers.
  </Accordion>

  <Accordion title="What happens if I don't renew?">
    Your API access will expire after the subscription period ends. You can re-subscribe at any time to regain access.
  </Accordion>

  <Accordion title="Can I use this for commercial projects?">
    Yes! The free tier can be used for commercial projects. However, for production applications, we recommend upgrading to real-time data for the best user experience.
  </Accordion>
</AccordionGroup>

***

<Info>
  **Ready to start?** Follow the steps above to get your free API access in under 5 minutes. No credit card required.
</Info>


