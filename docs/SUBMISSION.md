# Superteam Earn: Submission Answers

Ready-to-paste answers for the TxODDS "Prediction Markets and Settlement" submission form.
Fill the bracketed links before submitting.

---

**Project name:** GreYat WorldCup Analytics

**One-line pitch:** On-chain World Cup prediction markets on Solana that settle trustlessly from
TxLINE's signed score data. Markets resolve via a CPI into TxODDS's `validate_stat`, with no oracle
authority.

**Demo video (≤5 min, mandatory):** `[FILL: Loom/YouTube link]`

**Public GitHub repo:** https://github.com/G-ojies/worldcup-match-vault

**Application access (deployed build):**
- Frontend (live, devnet): **https://worldcup-match-vault.vercel.app**
- Deployed program (devnet): `E5ffcawirq6hVse98NJVDGQ4RSkkNAYWzN2RNoRAikzJ`
- Reproducible end-to-end on devnet: `cd txline && npm run e2e`
- Live settlement tx (proof of working build): `4wfFF3VqH5dk3zuWq5JuSKuU4uVsXgxQwzi1c94tRm6zYkVHHHcDpEcVy7LNdCjTTygxi8gtAf1TEwAmBhUnPVXf`

**Track / category:** Custom On-Chain Settlement Engine + Verifiable Resolution UI.

---

## Brief technical documentation

**Core idea.** Most prediction markets resolve by trusting an off-chain oracle. GreYat WorldCup Analytics
settles by *proving* the final score against TxODDS's own on-chain Merkle root. The settlement
instruction `resolve_market_trustless` CPIs into TxLINE's `validate_stat`, reads the returned boolean
via `get_return_data`, and releases escrowed SOL only if the proof verifies. Resolution is
permissionless and a false claim reverts. There is no trusted authority in the settlement path.

**Technical highlights.**
- Custom Anchor settlement engine: derives the outcome predicate (`home − away >0/<0/=0`) and binds
  it to the claimed result, the market's `fixture_id`, the goal stat-keys, and a full-time finality
  gate before invoking `validate_stat`.
- IDL-mirrored CPI types + `get_return_data` decoding of the returned `bool`.
- Verifiable Resolution UI: renders the Merkle-proof "receipt" (proven stat leaves, predicate, proof
  nodes, daily-root PDA) and links the on-chain settlement tx.
- Validated live on devnet against a real World Cup fixture (NED 1‑1 MAR → Draw).
- 7 passing LiteSVM tests; full devnet e2e (create → bet → trustless settle → claim).

**Business highlight.** Trustless settlement removes the single biggest counterparty risk in
prediction markets (a dishonest/compromised oracle), which is exactly what makes on-chain sportsbooks
and parametric prop-bets safe to scale on TxLINE.

**TxLINE endpoints used.**
- `POST /auth/guest/start`, on-chain `subscribe(1,4)`, `POST /api/token/activate` (free World Cup tier)
- `GET /api/fixtures/snapshot`: markets
- `GET /api/scores/snapshot/{fixtureId}`, `GET /api/scores/historical/{fixtureId}`: final score + seq
- `GET /api/scores/stat-validation`: three-stage Merkle proof (settlement input)
- `GET /api/scores/stream`, `GET /api/odds/stream`: live feed (proxied)
- on-chain `validate_stat` (CPI): trustless settlement check

## Feedback (experience using the TxLINE API)

See [FEEDBACK.md](../FEEDBACK.md). Short version: `validate_stat` is an excellent settlement primitive
and the free devnet World Cup tier is a great on-ramp; the main friction was an unreliable `GameState`
field (had to use `Action: game_finalised` + `Score.Total`), missing per-field REST schemas, and a few
proof-JSON↔IDL field-name mismatches worth documenting.

## Eligibility checklist

- [x] Uses TxLINE data as the primary source
- [x] Deployed build (devnet) using TxLINE feeds
- [x] Working build, not a concept/wireframe
- [x] Frontend deployed and linked: https://worldcup-match-vault.vercel.app
- [x] Public repo pushed to GitHub: https://github.com/G-ojies/worldcup-match-vault
- [ ] Demo video recorded and linked
