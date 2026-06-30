/**
 * Devnet smoke test — exercises the full lifecycle against the deployed program
 * using the exact instructions the frontend sends, and prints real devnet
 * transaction signatures + Solana Explorer links for each step.
 *
 *   create_market → place_bet x3 (home/away/draw) → resolve_market → claim_payout
 *
 * Run: npx ts-node scripts/devnet_smoke.ts
 */
import * as fs from "fs";
import * as os from "os";
import {
  AnchorProvider,
  Program,
  Wallet,
  BN,
  type Idl,
} from "@anchor-lang/core";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";

const idl = JSON.parse(
  fs.readFileSync(`${__dirname}/../target/idl/worldcup_match_vault.json`, "utf8")
) as Idl;

const RPC = process.env.RPC_URL ?? "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey((idl as any).address);

const ex = (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
const sol = (n: number) => `${(n / LAMPORTS_PER_SOL).toFixed(4)} SOL`;
const log = (label: string, sig: string) => {
  console.log(`\n  ✅ ${label}`);
  console.log(`     ${sig}`);
  console.log(`     ${ex(sig)}`);
};

function loadKeypair(path: string): Keypair {
  const raw = JSON.parse(fs.readFileSync(path.replace("~", os.homedir()), "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

const outcomeArg = (o: string) => ({ [o]: {} } as Record<string, object>);

const marketPda = (matchId: string) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("market"), Buffer.from(matchId)],
    PROGRAM_ID
  )[0];
const vaultPda = (market: PublicKey) =>
  PublicKey.findProgramAddressSync([Buffer.from("vault"), market.toBuffer()], PROGRAM_ID)[0];
const betPda = (market: PublicKey, bettor: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("bet"), market.toBuffer(), bettor.toBuffer()],
    PROGRAM_ID
  )[0];

async function main() {
  const connection = new Connection(RPC, "confirmed");
  const admin = loadKeypair("~/.config/solana/id.json");
  const provider = new AnchorProvider(connection, new Wallet(admin), {
    commitment: "confirmed",
  });
  const program = new Program(idl, provider);

  console.log("════════════════════════════════════════════════════════");
  console.log("  WorldCup Match Vault — devnet smoke test");
  console.log("════════════════════════════════════════════════════════");
  console.log(`  RPC:        ${RPC}`);
  console.log(`  Program:    ${PROGRAM_ID.toBase58()}`);
  console.log(`  Admin/payer:${admin.publicKey.toBase58()}`);

  // Distinct wallets for each outcome + the oracle authority.
  const oracle = Keypair.generate();
  const homeBettor = Keypair.generate();
  const awayBettor = Keypair.generate();
  const drawBettor = Keypair.generate();

  // Fund the three bettors from the admin wallet (devnet airdrops are flaky).
  console.log("\n  Funding bettor wallets (0.1 SOL each)…");
  const fundTx = new Transaction();
  for (const b of [homeBettor, awayBettor, drawBettor]) {
    fundTx.add(
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: b.publicKey,
        lamports: 0.1 * LAMPORTS_PER_SOL,
      })
    );
  }
  const fundSig = await provider.sendAndConfirm(fundTx, []);
  log("Funded bettors", fundSig);
  console.log(`     home=${homeBettor.publicKey.toBase58()}`);
  console.log(`     away=${awayBettor.publicKey.toBase58()}`);
  console.log(`     draw=${drawBettor.publicKey.toBase58()}`);
  console.log(`     oracle=${oracle.publicKey.toBase58()}`);

  // Unique match id so reruns don't collide on the market PDA.
  const matchId = `DEVNET_${Date.now()}`;
  const market = marketPda(matchId);
  const vault = vaultPda(market);
  const kickoff = Math.floor(Date.now() / 1000) + 3600;

  // 1) create_market
  let sig = await program.methods
    .createMarket(matchId, "Brazil", "Argentina", new BN(kickoff), oracle.publicKey)
    .accountsPartial({ admin: admin.publicKey, market, vault, systemProgram: SystemProgram.programId })
    .rpc();
  log(`create_market  (${matchId}: Brazil vs Argentina)`, sig);

  // 2) place_bet x3 — home 0.02, away 0.01, draw 0.01 SOL
  const bets: [Keypair, string, number][] = [
    [homeBettor, "home", 0.02],
    [awayBettor, "away", 0.01],
    [drawBettor, "draw", 0.01],
  ];
  for (const [bettor, outcome, amt] of bets) {
    sig = await program.methods
      .placeBet(outcomeArg(outcome), new BN(amt * LAMPORTS_PER_SOL))
      .accountsPartial({
        bettor: bettor.publicKey,
        market,
        vault,
        bet: betPda(market, bettor.publicKey),
        systemProgram: SystemProgram.programId,
      })
      .signers([bettor])
      .rpc();
    log(`place_bet      (${outcome} · ${sol(amt * LAMPORTS_PER_SOL)})`, sig);
  }

  const m1: any = await program.account.market.fetch(market);
  console.log(
    `\n  Pools → home ${sol(Number(m1.totalHomePool))} · away ${sol(
      Number(m1.totalAwayPool)
    )} · draw ${sol(Number(m1.totalDrawPool))}`
  );
  console.log(`  Vault balance: ${sol(await connection.getBalance(vault))}`);

  // 3) resolve_market — oracle signs, admin pays the fee
  sig = await program.methods
    .resolveMarket(outcomeArg("home"))
    .accountsPartial({ oracleAuthority: oracle.publicKey, market })
    .signers([oracle])
    .rpc();
  log("resolve_market (outcome: HOME)", sig);

  // 4) claim_payout — the home bettor (winner) claims
  const balBefore = await connection.getBalance(homeBettor.publicKey);
  sig = await program.methods
    .claimPayout()
    .accountsPartial({
      bettor: homeBettor.publicKey,
      market,
      vault,
      bet: betPda(market, homeBettor.publicKey),
      systemProgram: SystemProgram.programId,
    })
    .signers([homeBettor])
    .rpc();
  log("claim_payout   (winner: home bettor)", sig);

  const balAfter = await connection.getBalance(homeBettor.publicKey);
  console.log(
    `\n  Home bettor balance: ${sol(balBefore)} → ${sol(balAfter)} (Δ +${sol(
      balAfter - balBefore
    )})`
  );
  console.log(`  Vault residual (3% fee): ${sol(await connection.getBalance(vault))}`);

  console.log("\n  Market account:");
  console.log(`     https://explorer.solana.com/address/${market.toBase58()}?cluster=devnet`);
  console.log("\n════════════════════════════════════════════════════════");
  console.log("  ✅ Smoke test complete — all 5 steps confirmed on devnet");
  console.log("════════════════════════════════════════════════════════");
}

main().catch((e) => {
  console.error("\n  ❌ Smoke test failed:", e);
  process.exit(1);
});
