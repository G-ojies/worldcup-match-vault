# Deploying the frontend (Vercel)

The dApp is a standard Next.js 14 app in `app/`. The only non-obvious part is that the TxLINE proxy
routes (`app/src/pages/api/txline/*`) run **server-side** and need the guest JWT + API token as
environment variables (so the token never reaches the browser).

## 1. Get fresh TxLINE credentials

The guest JWT expires ~30 days after issue. Before deploying (and again if judging is >30 days later),
re-bootstrap:

```bash
cd txline && npm run bootstrap     # writes txline/credentials.json
cat txline/credentials.json        # copy apiOrigin, jwt, apiToken
```

## 2. Set Vercel environment variables

In the Vercel project → Settings → Environment Variables (Production + Preview):

| Variable | Value | Exposure |
| --- | --- | --- |
| `TXLINE_API_ORIGIN` | `https://txline-dev.txodds.com` | server-only |
| `TXLINE_JWT` | `<jwt from credentials.json>` | server-only |
| `TXLINE_API_TOKEN` | `<apiToken from credentials.json>` | server-only |
| `NEXT_PUBLIC_RPC_URL` | `https://api.devnet.solana.com` (or a paid devnet RPC for reliability) | public |
| `NEXT_PUBLIC_PROGRAM_ID` | `E5ffcawirq6hVse98NJVDGQ4RSkkNAYWzN2RNoRAikzJ` | public |
| `NEXT_PUBLIC_TXLINE_PROGRAM_ID` | `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J` | public |
| `NEXT_PUBLIC_ADMIN_PUBKEY` | *(optional)* gate the create-market button | public |

`txlineServer.ts` reads the `TXLINE_*` env vars first and only falls back to the local
`credentials.json` file in dev — so on Vercel the three server vars are required.

## 3. Deploy

```bash
cd app
vercel            # link the project (root directory = app)
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard with **Root Directory = `app`** and the env vars
above; pushes to `main` then auto-deploy.

> A paid devnet RPC (Helius/Triton/QuickNode) is recommended for the public demo — the public
> `api.devnet.solana.com` endpoint rate-limits under load and can make wallet reads flaky.

## Notes

- `next.config.js` already sets browser fallbacks for the Node core modules some Solana deps import.
- SSE proxy (`/api/txline/stream`) streams server-side; it works on Vercel's Node runtime. World Cup
  fixtures are finished, so the live ticker gracefully shows "match has finished" — expected.
- The settlement flow signs with the connected browser wallet (Phantom/Solflare/Backpack) on devnet.
