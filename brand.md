# Brand — MatchVault (GreYat WorldCup Analytics)

_Status: active — sibling system set 2026-07-15_

On-chain World Cup prediction markets. The tone is verifiable, not promotional: the product's
whole claim is that you can *check* settlement rather than trust it, so the design should feel
like instrumentation, not marketing.

MatchVault is a **sibling** of SharpSignal (`worldcup-sharp-signal`) and GroupStage
(`group-stage`), not a clone. The three share a skeleton so they read as one studio; each
keeps the accent that fits its job.

| Shared across the three tracks | MatchVault keeps its own |
|---|---|
| Geist + Geist Mono | **Emerald** accent `turf-500 #10b981` (not violet, not the spectrum) |
| `.label` mono uppercase micro-caps, 11px / 0.14em | Pitch-night base `#0a0e0f`, card `#0f1518` |
| Hairline borders, flat cards, no glow/blur | Outcome semantics: `home #38bdf8`, `away #fb7185`, `draw #a78bfa` |
| One radius scale: `--radius` 14px, `--radius-sm` 8px | `gold` for champion/settled emphasis |
| Hero banner: photo → diagonal scrim → bottom scrim → stat row | |
| `.stat` / `.tnum` tabular figures | |
| lucide-react icons, `strokeWidth={1.5}` | |
| Pill buttons, 100ms transitions naming their properties | |

The outcome colours (sky/rose/violet) are **semantic, not decorative** — they map to
home/draw/away everywhere and must stay consistent across PoolBars, MarketCard and BetForm.
That is why the accent is emerald: it leaves those three free to mean one thing each.

## Two constraints worth not re-litigating

1. **Font vars are bridged on `.font-root`, not `:root`.** A `var()` inside a custom property
   is substituted at the element that *declares* it. geist's `.variable` classes live on the
   wrapper `<div>` in `_app.tsx`, so bridging on `:root` — where `--font-geist-sans` is
   undefined — invalidates the declaration and the page **silently falls back to serif**.
   Pages Router can't put the classes on `<html>` because next/font isn't supported in
   `_document`. (This bit GroupStage first; caught here before it shipped.)
2. **`transpilePackages: ["geist"]` in `next.config.js` is load-bearing.** geist is ESM and
   imports `next/font/local` as a bare directory; Node's ESM resolver rejects directory
   imports and `next build` dies at page-data collection, *after* printing
   "✓ Compiled successfully".

## Contrast

Hero stat labels sit over a floodlit crowd photo. Measured on the rendered page (hide the
text, sample the background): `.label` **4.65:1**, white stat **15.65:1**. The label clears
AA but with thin margin — if the photo, its opacity or the scrims change, re-measure rather
than assume. The bottom-up scrim is what earns it.

## Imagery

Banner photo by Krzysztof Popławski, CC BY 4.0, via Wikimedia Commons. Self-hosted in
`app/public/hero-stadium.jpg`, shared with the other two tracks. Attribution in the footer is
a licence condition, not a courtesy. No FIFA marks, trophies or player likenesses: those are
trademarked and these are public entries.

## Voice

Plain and checkable. "No oracle. Just the proof." State what settles a market and how it can
be verified. No em dashes in rendered copy; the `—` returned by `format.ts` for an empty pool
is a no-value marker, not prose.
