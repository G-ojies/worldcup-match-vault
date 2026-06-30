# Demo Video Script — WorldCup Match Vault (≤ 5:00)

Goal: prove a **working, deployed** build and make the **trustless settlement** unmistakable. The demo
video is the primary judging artifact, so lead with the differentiator and show real on-chain proof.

Record at 1080p, screen + voiceover. Have these ready in tabs: the dApp (devnet), Solana Explorer
(devnet), the GitHub repo, and a terminal in `txline/`.

---

### 0:00–0:30 — Hook + what it is
- "World Cup prediction markets that settle **without trusting any oracle**. The only thing we trust is
  TxODDS's own signed score data, anchored on Solana."
- One line on the model: stake SOL on Home/Draw/Away; when the match is final, the result is **proven**
  on-chain, not asserted.

### 0:30–1:15 — The data layer (TxLINE)
- Show the markets grid populated from **live TxLINE fixtures** (`/api/fixtures/snapshot`).
- Open a market: live score/odds, pools, implied odds. Mention the SSE stream powering it.
- "Every market is bound to a TxLINE `fixture_id` and the exact goal stat-keys at creation time."

### 1:15–2:15 — Place bets (the user flow)
- Connect wallet (devnet). Place a **Draw** bet and a **Home** bet from two wallets on the
  Netherlands vs Morocco market. Show pool bars + payout preview update.
- Briefly show the bet tx on Explorer.

### 2:15–3:45 — Trustless settlement (THE moment)
- Click **"Settle trustlessly."** Narrate what happens:
  1. fetch the final score from TxLINE (`game_finalised`, 1‑1),
  2. fetch the **three-stage Merkle proof** (`/api/scores/stat-validation`, statKey 1 & 2),
  3. submit `resolve_market_trustless`, which **CPIs into TxODDS's `validate_stat`** to verify the
     proof against the on-chain `daily_scores_roots` root.
- Show the **Verifiable Resolution receipt**: the two proven stat leaves (home 1 / away 1), the
  predicate `home − away = 0 → Draw`, proof-node counts, the daily-root PDA, and the badge
  **"Verified against TxODDS on-chain Merkle root — no oracle authority."**
- Open the settlement tx on Explorer; point out the inner instruction to the TxLINE program and the
  `MarketResolvedTrustless` event. "No signer could have forced this — a wrong claim reverts."

### 3:45–4:30 — Claim + integrity
- Winning (Draw) bettor clicks **Claim**; show SOL balance increase and the claim tx.
- Show that the loser cannot claim and the market can't be re-settled.
- Optional: try to settle with a mismatched outcome and show `validate_stat` rejecting it.

### 4:30–5:00 — Close
- Recap: "Live TxLINE data in, cryptographic settlement out — deployed on devnet, fully working."
- Flash: deployed program id, GitHub repo, and that it runs on the **free World Cup tier**.
- "Built with TxLINE as the primary data source and the `validate_stat` primitive as the settlement
  engine."

---

**Backup if live RPC is slow:** pre-run `cd txline && npm run e2e` and narrate the terminal output +
the resulting Explorer txs; the on-chain result is identical. Keep the receipt UI as the visual.
