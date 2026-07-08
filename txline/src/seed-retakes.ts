/**
 * Maintain-N retake markets. Ensures there are always RETAKE_TARGET (default 3)
 * UNSETTLED "Netherlands vs Morocco" markets bound to fixture 18172280 (verified
 * to settle -> Draw), so the demo video always has a fresh "Settle trustlessly"
 * to click. Creates only the shortfall; does nothing when the target is met.
 * Skips entirely if the admin balance is below RETAKE_FLOOR_SOL (default 0.5).
 *
 * Designed to run unattended from cron. Idempotent and self-limiting.
 * Run:  npx ts-node src/seed-retakes.ts
 * Env:  RETAKE_TARGET=3  RETAKE_FLOOR_SOL=0.5  SOLANA_RPC_URL=...
 */
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import {
  Connection, Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const ourIdl = require("../../target/idl/worldcup_match_vault.json");
const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const OUR_PROGRAM = new PublicKey(ourIdl.address);
const FIXTURE = 18172280; // Netherlands 1-1 Morocco (World Cup) -> Draw
const TARGET = Number(process.env.RETAKE_TARGET || 3);
const FLOOR = Number(process.env.RETAKE_FLOOR_SOL || 0.5);
const PER_MARKET_COST = 0.28; // ~ funding + rent + bets, SOL (conservative)

const sol = (l: number) => (l / LAMPORTS_PER_SOL).toFixed(4);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const log = (...a: any[]) => console.log(...a);

function loadMainWallet(): Keypair {
  const p = process.env.ANCHOR_WALLET || path.join(os.homedir(), ".config", "solana", "id.json");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(p, "utf8"))));
}
function programFor(c: Connection, kp: Keypair): anchor.Program {
  return new anchor.Program(ourIdl as anchor.Idl,
    new anchor.AnchorProvider(c, new anchor.Wallet(kp), { commitment: "confirmed" }));
}
const marketPda = (m: string) =>
  PublicKey.findProgramAddressSync([Buffer.from("market"), Buffer.from(m)], OUR_PROGRAM)[0];
const vaultPda = (mkt: PublicKey) =>
  PublicKey.findProgramAddressSync([Buffer.from("vault"), mkt.toBuffer()], OUR_PROGRAM)[0];
const betPda = (mkt: PublicKey, b: PublicKey) =>
  PublicKey.findProgramAddressSync([Buffer.from("bet"), mkt.toBuffer(), b.toBuffer()], OUR_PROGRAM)[0];

async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 4): Promise<T> {
  let last: any;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e: any) {
      last = e; const msg = String(e?.message || e);
      if (/already in use|custom program error: 0x0/i.test(msg)) throw e;
      log(`   ...retry ${label} (${i + 1}/${tries}): ${msg.slice(0, 80)}`);
      await sleep(2500 * (i + 1));
    }
  }
  throw last;
}
async function fund(c: Connection, payer: Keypair, to: PublicKey, lamports: number) {
  return withRetry("fund", () =>
    anchor.web3.sendAndConfirmTransaction(
      c, new Transaction().add(SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: to, lamports })),
      [payer], { commitment: "confirmed" }));
}
async function placeBet(c: Connection, admin: Keypair, market: PublicKey, vault: PublicKey, outcome: any, lamports: number) {
  const bettor = Keypair.generate();
  await fund(c, admin, bettor.publicKey, 0.09 * LAMPORTS_PER_SOL);
  return withRetry("place_bet", () =>
    programFor(c, bettor).methods.placeBet(outcome, new BN(lamports))
      .accounts({ bettor: bettor.publicKey, market, vault, bet: betPda(market, bettor.publicKey), systemProgram: SystemProgram.programId })
      .rpc());
}

async function main() {
  const connection = new Connection(RPC, "confirmed");
  const admin = loadMainWallet();
  const balSol = (await connection.getBalance(admin.publicKey)) / LAMPORTS_PER_SOL;
  log(`admin ${admin.publicKey.toBase58()}  balance ${balSol.toFixed(4)} SOL  target=${TARGET}  floor=${FLOOR}`);

  if (balSol < FLOOR) { log(`balance below floor (${FLOOR}) -> skip, no markets created.`); return; }

  const prog = programFor(connection, admin);
  const all: any[] = await prog.account.market.all();
  const unsettled = all.filter((m) => m.account.fixtureId.toString() === String(FIXTURE) && !m.account.isSettled);
  log(`unsettled fixture-${FIXTURE} spares on-chain: ${unsettled.length}`);
  let need = Math.max(0, TARGET - unsettled.length);
  if (need === 0) { log(`target met -> nothing to do.`); return; }

  // Respect the floor while creating: don't dip below FLOOR.
  const affordable = Math.max(0, Math.floor((balSol - FLOOR) / PER_MARKET_COST));
  if (affordable < need) { log(`can afford ${affordable} of ${need} needed without breaching floor.`); need = affordable; }
  if (need === 0) { log(`insufficient headroom above floor -> skip.`); return; }

  const nowSec = Math.floor(Date.now() / 1000);
  const binding = { fixtureId: new BN(FIXTURE), homeGoalKey: 1, awayGoalKey: 2, goalPeriod: 0, settleNotBefore: new BN(nowSec - 3600) };
  const stamp = Date.now().toString(36);
  for (let i = 0; i < need; i++) {
    const matchId = `WC_${FIXTURE}_R${stamp}${i}`;
    const market = marketPda(matchId), vault = vaultPda(market);
    try {
      await withRetry("create_market", () =>
        prog.methods.createMarket(matchId, "Netherlands", "Morocco", new BN(nowSec + 24 * 3600), admin.publicKey, binding)
          .accounts({ admin: admin.publicKey, market, vault, systemProgram: SystemProgram.programId }).rpc());
      await placeBet(connection, admin, market, vault, { draw: {} }, 0.05 * LAMPORTS_PER_SOL);
      await placeBet(connection, admin, market, vault, { home: {} }, 0.05 * LAMPORTS_PER_SOL);
      log(`+ created ${matchId}  url=/market/${matchId}`);
    } catch (e: any) {
      log(`! failed ${matchId}: ${(e?.message || e).toString().slice(0, 120)}`);
    }
  }
  const after: any[] = await prog.account.market.all();
  const nowUnsettled = after.filter((m) => m.account.fixtureId.toString() === String(FIXTURE) && !m.account.isSettled).length;
  log(`done. unsettled spares now: ${nowUnsettled}. balance ${sol(await connection.getBalance(admin.publicKey))} SOL`);
}
main().catch((e) => { console.error("seed-retakes failed:", e?.message || e); process.exit(1); });
