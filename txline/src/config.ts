import { PublicKey } from "@solana/web3.js";

export type Network = "mainnet" | "devnet";

// Pick the network via TXLINE_NETWORK env var; default devnet (free World Cup tier lives here).
export const NETWORK: Network =
  (process.env.TXLINE_NETWORK as Network) || "devnet";

export const CONFIG = {
  mainnet: {
    rpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
    apiOrigin: "https://txline.txodds.com",
    programId: new PublicKey("9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA"),
    txlTokenMint: new PublicKey("Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL"),
    usdtMint: new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
  },
  devnet: {
    rpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    apiOrigin: "https://txline-dev.txodds.com",
    programId: new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"),
    txlTokenMint: new PublicKey("4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG"),
    usdtMint: new PublicKey("ELWTKspHKCnCfCiCiqYw1EDH77k8VCP74dK9qytG2Ujh"),
  },
} as const;

export const active = CONFIG[NETWORK];
export const apiBaseUrl = `${active.apiOrigin}/api`;

// World Cup & International Friendlies free tier.
//   1  = 60s-delayed (devnet + mainnet)
//   12 = real-time   (mainnet only)
export const FREE_SERVICE_LEVEL = Number(process.env.TXLINE_SERVICE_LEVEL || 1);
export const DURATION_WEEKS = Number(process.env.TXLINE_WEEKS || 4);

export const CREDENTIALS_PATH = require("path").join(
  __dirname,
  "..",
  "credentials.json"
);
