# GreYat WorldCup Analytics — Technical Documentation

**Track:** TxODDS × Superteam — Prediction Markets & Settlement (World Cup)
**One-liner:** On-chain World Cup prediction markets on Solana that settle **trustlessly** from
TxLINE's cryptographically-signed score data — no oracle authority in the settlement path.

---

## Core idea

Most prediction markets resolve by trusting an off-chain oracle to push the result. This one
doesn't. Markets settle by **proving the final score against TxODDS's own on-chain Merkle root**
via a Cross-Program Invocation into TxLINE's `validate_stat` instruction. The settlement transaction
is permissionless: anyone can submit the TxLINE Merkle proof, and the market settles **only if
TxLINE's program cryptographically confirms it**. A false claim makes `validate_stat` return `false`
and the transaction reverts.

This is the track's "Custom On-Chain Settlement Engine" pattern: our program CPIs into
`validate_stat` to confirm match outcomes trustlessly and release escrowed SOL.

## How settlement works (the differentiator)

```
place_bet (SOL) ─┐
                 ├─▶ resolve_market_trustless ──CPI──▶ TxLINE.validate_stat ──▶ bool
create_market ───┘        (anyone, with a            (verifies proof against
  (binds a TxLINE          TxLINE Merkle proof)        daily_scores_roots PDA)
   fixture + goal keys)
```

`resolve_market_trustless`:
1. **Binds** the proof to this market's `fixture_id`, the configured home/away goal stat-keys, and
   the goal period — so a resolver can't submit another match's proof or the wrong statistic.
2. **Enforces finality** — refuses to settle before `settle_not_before` (kickoff + full time) and
   requires the proven scores batch's `max_timestamp` to reach full time (no settling on an in-play
   score).
3. **Derives the predicate from the claimed outcome** (`home − away > 0` ⇒ Home, `< 0` ⇒ Away,
   `= 0` ⇒ Draw) using `validate_stat`'s two-stat `Subtract` expression — so the claimed outcome is
   bound to what the proof actually shows.
4. **CPIs `validate_stat`** and reads the returned `bool` via `get_return_data`; the market settles
   only on `true`.
5. Emits `MarketResolvedTrustless { fixture_id, outcome, home_goals, away_goals, proof_ts, resolver }`.

The legacy `resolve_market` (a registered `oracle_authority` signs the outcome) is kept only as a
labelled fallback; the demo uses the trustless path.

### Proven live on devnet

Validated end-to-end against real data: **fixture `18172280` — Netherlands 1‑1 Morocco (World Cup)**,
seq `1427`. `validate_stat` returned `GreaterThan=false, LessThan=false, EqualTo=true` ⇒ **Draw**,
matching the real result, confirmed against TxLINE's signed `daily_scores_roots` PDA.

**Deployed (devnet):** program `E5ffcawirq6hVse98NJVDGQ4RSkkNAYWzN2RNoRAikzJ`. Full trustless flow on-chain:

| Step | Devnet signature |
| --- | --- |
| create_market | `ME6eAr9pDL7DT42uHPd8YVgwncpZoLs8L6Gad73LDTJkRs2uN1FyRt6fMmbLfCchP16HVwFkcn3Ph4UHzjWLj99` |
| place_bet (Draw) | `3uqH5jfZM2f1jmmGEYqwCKX4SPfmFEvfK2NiiSizy6AWkmf1XFC1z6HzRj4po64aAMcpaX1u5v3TXbDVbCRHN814` |
| place_bet (Home) | `3Ya39KzsMbwNDseE85J1AYaMbcQykwAWUqJJqwnpEWDFHN1W9MSebeUMU6d4Rt2qzYbnCZNc9AW2ubWaNXfu6G6A` |
| **resolve_market_trustless** | `4wfFF3VqH5dk3zuWq5JuSKuU4uVsXgxQwzi1c94tRm6zYkVHHHcDpEcVy7LNdCjTTygxi8gtAf1TEwAmBhUnPVXf` |
| claim_payout | `2p2849BN4BHpPZcmxfbSArDhRSXiGiJCJQ8QD2PW38xFFKxhMihiMJpFThiEjaHii4X9PCur2pzuBsywxcsP6Ew` |

Reproduce: `cd txline && npm run e2e`.

## TxLINE endpoints used

| Endpoint | Use in this project |
| --- | --- |
| `POST /auth/guest/start` | Guest JWT for the access bootstrap |
| on-chain `subscribe(serviceLevelId=1, weeks=4)` | Free World Cup tier subscription (devnet) |
| `POST /api/token/activate` | Activates the long-lived `X-Api-Token` |
| `GET /api/fixtures/snapshot` | Market creation — lists World Cup fixtures, `Participant1IsHome` → home/away goal keys |
| `GET /api/scores/snapshot/{fixtureId}` | Live/last score + event actions for the market UI |
| `GET /api/scores/historical/{fixtureId}` | Final score + the `seq` of `game_finalised` for settlement |
| `GET /api/scores/stat-validation` | **The settlement input** — three-stage Merkle proof for the home & away goal stats |
| `GET /api/scores/stream`, `/api/odds/stream` | SSE live feed (proxied server-side; powers the live ticker) |
| on-chain `validate_stat` (CPI) | Trustless settlement check against `daily_scores_roots` |

Stat keys (soccer, full-game period 0): `1` = Participant1 total goals, `2` = Participant2 total goals.

## Architecture

```
programs/worldcup-match-vault/   Anchor program
  src/txline_cpi.rs               validate_stat CPI + IDL-mirrored types + get_return_data
  src/instructions/
    resolve_market_trustless.rs   trustless settlement (the differentiator)
    create_market.rs / place_bet.rs / claim_payout.rs / resolve_market.rs
txline/                          TS access bootstrap + TxLINE client + proof builder
  bootstrap-access.ts            guest/start → subscribe → token/activate
  txline-client.ts / proof.ts    REST/SSE client + stat-validation → validate_stat arg mapping
app/                             Next.js dApp
  pages/api/txline/*             server-side proxy (keeps JWT/API-token off the client)
  lib/txline.ts / proof.ts       browser client + proof builder
  components/…                   markets, betting, claims, Verifiable Resolution panel
```

## Build & run

```bash
# program
anchor build && anchor deploy --provider.cluster devnet
cargo test -p worldcup-match-vault --test vault_litesvm   # 7 passing

# TxLINE access (writes txline/credentials.json)
cd txline && npm install && npm run bootstrap && npm run probe

# frontend
cd app && npm install && npm run dev
```
