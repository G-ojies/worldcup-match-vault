# TxLINE API: Builder Feedback

Submitted as part of the GreYat WorldCup Analytics entry. Honest notes from integrating TxLINE as the
primary data source and settlement layer.

## What worked well

- **`validate_stat` is the standout primitive.** Being able to verify a score statistic against an
  on-chain Merkle root *and read the boolean back via a CPI* (`get_return_data`) is exactly the right
  shape for a settlement engine. It let us build genuinely trustless resolution with no oracle
  authority. The two-stat `Subtract` + `TraderPredicate` design cleanly expresses "home − away > 0",
  which is all you need for a 1X2 market.
- **The free World Cup tier on devnet is a great on-ramp.** `subscribe(serviceLevelId=1, weeks=4)`
  with no TxL purchase, then `token/activate`, and we had real fixtures in minutes. `request_devnet_faucet`
  in the IDL is a nice touch.
- **The three-stage Merkle proof from `/api/scores/stat-validation` mapped 1:1 onto the on-chain
  types.** Once we had the field mapping, no transformation surprises; `statToProve` passes through
  untouched, proofs are plain `{hash, isRightSibling}` arrays.
- **The daily-scores root PDA was already populated for finished fixtures**, so we could validate a
  real result (Netherlands 1‑1 Morocco) live rather than against a seeded mock.

## Friction / suggestions

1. **`GameState` is unreliable.** On finished fixtures it still read `"scheduled"`. We had to detect
   completion via the `Action` progression (`game_finalised`) and `Score.Total` instead. A trustworthy
   terminal-state flag (or surfacing the game-phase id `F`/`FET`/`FPE`) would remove guesswork; it's
   exactly the signal a settlement engine needs.
2. **Per-field REST response schemas aren't in the docs** (they point to `docs.yaml`). We recovered
   most field names from the IDL record structs and examples, but an explicit JSON schema per endpoint
   (especially `/api/scores/snapshot` and `/api/scores/stat-validation`) would save real time.
3. **Field-name mismatches between proof JSON and IDL args are footguns.** `subTreeProof` feeds the
   arg named `fixture_proof`; `eventStatsSubTreeRoot` (extra "Stats") maps to `events_sub_tree_root`;
   for two-stat, `stat_b` reuses `eventStatRoot` but `statToProve2`/`statProof2`. A one-line note in
   the on-chain-validation example calling these out would prevent silent mis-wiring.
4. **Arg-order divergence between `validate_stat` and `audit_trade_result`** (proofs swapped, `ts`
   last) is easy to copy wrong. Worth a warning in the docs.
5. **IDL discoverability.** The IDL isn't published on-chain (`anchor idl fetch` fails) and there's no
   raw JSON download link. We extracted it from the rendered docs page. A `…/idl/devnet.json` asset
   would help tooling.
6. **The `subscribe` free tier still needs a TxL ATA to exist.** We create it idempotently before
   subscribing; documenting that for the zero-cost path would avoid a confusing first failure.
7. **`/api/scores/historical/{fixtureId}` replies as `text/event-stream`** (`data: {…}` lines), while
   the sibling `/api/scores/snapshot` and `/api/scores/updates` return JSON arrays. The inconsistency
   isn't called out in the docs and quietly breaks a `res.json()` consumer. Documenting which score
   endpoints stream vs. return arrays (and ideally a content-type note) would help.

## Net

The verifiable-data design is genuinely differentiated: `validate_stat` made trustless on-chain
settlement straightforward, which is the hardest part of a prediction market to get right. The rough
edges are documentation/ergonomics, not capability.
