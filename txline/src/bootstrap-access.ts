/**
 * TxLINE devnet access bootstrap.
 *
 * Flow (free World Cup tier no TxL purchase needed):
 *   1. POST  {apiOrigin}/auth/guest/start            -> guest JWT
 *   2. on-chain subscribe(serviceLevelId, weeks)     -> txSig
 *   3. POST  {apiOrigin}/api/token/activate          -> apiToken
 *   4. verify with GET {apiOrigin}/api/fixtures/snapshot
 *
 * Writes ./credentials.json (gitignored) with { jwt, apiToken, ... }.
 *
 * Usage:
 *   TXLINE_NETWORK=devnet npm run bootstrap
 *   (wallet defaults to ~/.config/solana/id.json; override with ANCHOR_WALLET)
 */
import * as anchor from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import axios from "axios";
import nacl from "tweetnacl";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import {
  active,
  apiBaseUrl,
  NETWORK,
  FREE_SERVICE_LEVEL,
  DURATION_WEEKS,
  CREDENTIALS_PATH,
} from "./config";

const idl = require("../txline_devnet.idl.json");

function loadWallet(): Keypair {
  const p =
    process.env.ANCHOR_WALLET ||
    path.join(os.homedir(), ".config", "solana", "id.json");
  const secret = JSON.parse(fs.readFileSync(p, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

async function main() {
  const SELECTED_LEAGUES: number[] = []; // standard World Cup bundle
  console.log(`\n=== TxLINE access bootstrap (${NETWORK}) ===`);
  console.log(`apiOrigin : ${active.apiOrigin}`);
  console.log(`program   : ${active.programId.toBase58()}`);

  const keypair = loadWallet();
  console.log(`wallet    : ${keypair.publicKey.toBase58()}`);

  const connection = new Connection(active.rpcUrl, "confirmed");
  const bal = await connection.getBalance(keypair.publicKey);
  console.log(`balance   : ${(bal / 1e9).toFixed(4)} SOL`);
  if (bal < 0.02 * 1e9) {
    throw new Error("Wallet needs ~0.05 SOL on devnet for fees. Run: solana airdrop 1 --url devnet");
  }

  const wallet = new anchor.Wallet(keypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);
  const program = new anchor.Program(idl as anchor.Idl, provider);

  if (!program.programId.equals(active.programId)) {
    throw new Error(
      `IDL program ${program.programId.toBase58()} != ${NETWORK} ${active.programId.toBase58()}`
    );
  }

  // --- derive shared accounts ---
  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_treasury_v2")],
    program.programId
  );
  const tokenTreasuryVault = getAssociatedTokenAddressSync(
    active.txlTokenMint,
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
    active.txlTokenMint,
    keypair.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Ensure the user's TxL ATA exists (free tier transfers 0 but the account must be valid).
  const ataInfo = await connection.getAccountInfo(userTokenAccount);
  if (!ataInfo) {
    console.log("creating user TxL ATA (idempotent)...");
    const ix = createAssociatedTokenAccountIdempotentInstruction(
      keypair.publicKey,
      userTokenAccount,
      keypair.publicKey,
      active.txlTokenMint,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const tx = new Transaction().add(ix);
    const sig = await provider.sendAndConfirm(tx, []);
    console.log("  ATA created:", sig);
  } else {
    console.log("user TxL ATA already exists.");
  }

  // --- 1. guest JWT ---
  console.log("\n[1/3] POST /auth/guest/start ...");
  const authResp = await axios.post(`${active.apiOrigin}/auth/guest/start`);
  const jwt: string = authResp.data.token;
  console.log("  jwt:", jwt ? jwt.slice(0, 24) + "..." : "(none)");
  if (!jwt) throw new Error("No JWT returned from /auth/guest/start");

  // --- 2. subscribe on-chain ---
  console.log(`\n[2/3] subscribe(serviceLevelId=${FREE_SERVICE_LEVEL}, weeks=${DURATION_WEEKS}) ...`);
  let txSig: string;
  try {
    txSig = await program.methods
      .subscribe(FREE_SERVICE_LEVEL, DURATION_WEEKS)
      .accounts({
        user: keypair.publicKey,
        pricingMatrix: pricingMatrixPda,
        tokenMint: active.txlTokenMint,
        userTokenAccount,
        tokenTreasuryVault,
        tokenTreasuryPda,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("  subscribe txSig:", txSig);
  } catch (e: any) {
    console.error("  subscribe failed.");
    if (e.logs) console.error(e.logs.join("\n"));
    throw e;
  }
  await connection.confirmTransaction(txSig, "confirmed");

  // --- 3. activate API token ---
  console.log("\n[3/3] POST /api/token/activate ...");
  const messageString = `${txSig}:${SELECTED_LEAGUES.join(",")}:${jwt}`;
  const message = new TextEncoder().encode(messageString);
  const signatureBytes = nacl.sign.detached(message, keypair.secretKey);
  const walletSignature = Buffer.from(signatureBytes).toString("base64");

  const activation = await axios.post(
    `${apiBaseUrl}/token/activate`,
    { txSig, walletSignature, leagues: SELECTED_LEAGUES },
    { headers: { Authorization: `Bearer ${jwt}` } }
  );
  const apiToken: string = activation.data.token || activation.data;
  console.log("  apiToken:", typeof apiToken === "string" ? apiToken.slice(0, 24) + "..." : apiToken);

  // --- persist ---
  const creds = {
    network: NETWORK,
    apiOrigin: active.apiOrigin,
    wallet: keypair.publicKey.toBase58(),
    serviceLevel: FREE_SERVICE_LEVEL,
    weeks: DURATION_WEEKS,
    subscribeTx: txSig,
    jwt,
    apiToken,
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(creds, null, 2));
  console.log(`\nSaved credentials -> ${CREDENTIALS_PATH}`);

  // --- verify ---
  console.log("\n[verify] GET /api/fixtures/snapshot ...");
  const snap = await axios.get(`${apiBaseUrl}/fixtures/snapshot`, {
    headers: { Authorization: `Bearer ${jwt}`, "X-Api-Token": apiToken },
  });
  const arr = Array.isArray(snap.data) ? snap.data : snap.data?.fixtures || [];
  console.log(`  fixtures returned: ${arr.length}`);
  if (arr[0]) console.log("  sample:", JSON.stringify(arr[0]).slice(0, 300));

  console.log("\n✅ Access ready. Credentials saved.");
}

main().catch((e) => {
  console.error("\n❌ bootstrap failed:", e?.response?.data || e?.message || e);
  process.exit(1);
});
