# Demo Video — Word-for-Word Script + Recording Playbook

Target length **~3:30–4:30** (hard cap 5:00). Read the narration aloud at a normal pace; the
**[DO]** lines tell you what to click while you talk. Everything referenced is already staged and live.

---

## Part 1 — Pre-flight (do this BEFORE hitting record)

1. **Clean browser profile.** Open a fresh browser profile (or a profile) with **only your Solana
   wallet extension** (Phantom or Solflare) enabled. Disable all other wallet extensions — this kills
   the `window.cardano` extension error that pops the red overlay.
2. **Wallet on Devnet, funded.** Switch the wallet network to **Devnet**. Fund it with ~**0.3 SOL**
   from the faucet (https://faucet.solana.com — you already have a faucet tab open).
3. **Pick the URL:**
   - **Production (recommended, proves it's deployed):** https://worldcup-match-vault.vercel.app
   - Fallback: `http://localhost:3000` (dev server; run `cd app && npm run dev`).
4. **Open these tabs, in order:** (1) the dApp, (2) Solana Explorer set to **devnet**
   (https://explorer.solana.com/?cluster=devnet), (3) optionally the GitHub repo.
5. **Recorder:** OBS Studio (or SimpleScreenRecorder). Capture **screen + microphone**, 1080p.
   Do a 10-second test recording and play it back to confirm audio + clarity.
6. **Zoom the browser to ~110–125%** so text is readable in the video.
7. Close notifications / other apps. Silence phone.

> **One quirk to know:** the `Netherlands vs Morocco` market's *live-odds header* may be blank
> (that TxLINE fixture aged out of the live feed) — this is fine, the pools and settlement work
> perfectly. That's why you show **live odds on the England market** and use **Netherlands vs
> Morocco only for the bet → settle → claim** flow.

---

## Part 2 — The script (narration + actions)

### [0:00–0:25] Hook
> "This is **GreYat WorldCup Analytics** — on-chain World Cup prediction markets on Solana that
> settle **without trusting any oracle**. You stake SOL on Home, Draw, or Away. When a match ends,
> the result isn't asserted by an admin — it's cryptographically **proven** against TxODDS's own
> signed score data, right on-chain. Let me show you."

**[DO]** Start on the markets grid (home page). Let the stat cards (TVL / Active / Trustless
settlements) be visible.

### [0:25–1:05] The data layer (TxLINE)
> "Every market here is populated from **live TxLINE fixtures**. Total value locked, active markets,
> and trustless settlements are all read straight from the chain. Let me open this one — England
> versus Congo DR. You can see live odds, the pool for each outcome, and the implied payout, all
> driven by TxLINE's score and odds streams. Each market is **bound at creation** to a specific
> TxLINE fixture ID and the exact goal stat-keys it settles against — and that binding is what makes
> settlement trustless."

**[DO]** Click the **England vs Congo DR** card. Point the cursor at the live odds, pool bars, and
the fixture binding line in the Settlement box.

### [1:05–1:55] Place a bet
> "Let's place a bet. I'll connect my devnet wallet... and I'll stake on the **Draw** for
> Netherlands versus Morocco. Watch the pool bar and payout preview update instantly. That's a real
> transaction — here it is on Solana Explorer."

**[DO]** Go back, open **Netherlands vs Morocco** (`WC_18172280_LIVE`). Connect wallet. Place a small
**Draw** bet (e.g. **0.02 SOL**) — *bet Draw specifically, because Draw is the winning outcome and
this lets you claim on camera later.* Approve in wallet. Click through to the bet tx on Explorer.

### [1:55–3:20] Trustless settlement — THE moment
> "Now the part that matters. This match has finished one-one. I click **Settle trustlessly**. Here's
> what happens under the hood: the app fetches the final score from TxLINE, then a **three-stage
> Merkle proof** for the home and away goals. It submits one instruction — `resolve_market_trustless`
> — which makes a **cross-program call into TxODDS's own `validate_stat`**, verifying that proof
> against the on-chain daily-scores Merkle root. The program reads back the boolean and only settles
> if the proof checks out.
>
> And here's the **receipt**. The two proven stat leaves — home one, away one. The predicate: home
> minus away equals zero, so the outcome is **Draw**. The proof-node counts, and the exact daily-root
> PDA it verified against. And this badge: *'Verified against TxODDS on-chain Merkle root. No oracle
> authority.'* Here's the settlement transaction on Explorer — you can see the **inner instruction**
> calling the TxLINE program. No signer could have forced this; a wrong claim simply reverts."

**[DO]** Click **Settle trustlessly**, approve in wallet. When the **Verifiable Resolution** receipt
renders, slowly cursor over: the stat leaves → predicate → proof nodes → daily-root PDA → the badge.
Open the settlement tx on Explorer and point at the inner instruction to the TxLINE program.

### [3:20–4:05] Claim + integrity
> "Because I bet on the Draw — the winning outcome — I can now **claim**. My SOL balance goes up by
> my proportional share of the pools, minus a small protocol fee. Losers can't claim, and the market
> can't be settled twice. The only thing anyone trusts here is TxODDS's signed data — not me, not an
> admin, not an oracle key."

**[DO]** Click **Claim**, approve. Show the wallet balance increase (and/or the claim tx). Briefly
show the market is now in a settled state that can't be re-settled.

### [4:05–4:40] Close
> "That's GreYat WorldCup Analytics — live TxLINE data in, cryptographic settlement out. It's
> deployed and fully working on **devnet**, on TxLINE's **free World Cup tier**, with seven passing
> on-chain tests and a full end-to-end settlement flow. Built with **TxLINE as the primary data
> source** and **`validate_stat` as the settlement engine**. Thanks for watching."

**[DO]** Return to the markets grid. Optionally flash the deployed program id and the GitHub repo.

---

## Part 3 — After recording

1. **Trim** the dead air at the start/end. Confirm it's **under 5:00**.
2. **Upload** to YouTube (**Unlisted**) or Loom. Make sure link-sharing is on ("anyone with the link").
3. **Send me the link** — I'll paste it into `docs/SUBMISSION.md`, check the last box, and commit/push.
4. Submit the Superteam Earn form using the ready answers in `docs/SUBMISSION.md`.

---

## Retake notes
- The **live settle** on `WC_18172280_LIVE` is **one-shot** — once settled it stays settled. If you
  fluff that take, ask me to **seed a fresh unsettled market** and I'll stage a new one in ~30s.
- The already-settled market `WC_18172280_ry5ws` shows the **receipt UI repeatably** — good for
  re-recording just the receipt explanation without consuming the live market.
- **Backup if devnet RPC is slow mid-record:** in a terminal run `cd txline && npm run e2e` and
  narrate the output + the resulting Explorer txs — the on-chain result is identical. Keep the
  receipt UI as the on-screen visual.
