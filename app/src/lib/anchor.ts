import { AnchorProvider, Program, BN, type Idl } from "@anchor-lang/core";
import { Connection, PublicKey, type Commitment } from "@solana/web3.js";
import idlJson from "@/idl/worldcup_match_vault.json";

export const IDL = idlJson as Idl;

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ?? (idlJson as any).address
);

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8899";

/** Wallet pubkey allowed to create markets (admin gate in the UI only). */
export const ADMIN_PUBKEY = process.env.NEXT_PUBLIC_ADMIN_PUBKEY
  ? new PublicKey(process.env.NEXT_PUBLIC_ADMIN_PUBKEY)
  : null;

const COMMITMENT: Commitment = "confirmed";

export type Outcome = "home" | "away" | "draw" | "unresolved";

/** Anchor encodes a Rust unit enum as `{ variant: {} }`. */
export const outcomeArg = (o: Outcome) => ({ [o]: {} } as Record<string, object>);
export const outcomeFromAccount = (o: Record<string, object>): Outcome =>
  (Object.keys(o)[0] as Outcome) ?? "unresolved";

export function getConnection(): Connection {
  return new Connection(RPC_URL, COMMITMENT);
}

/** Build a Program bound to the given provider (browser wallet or read-only). */
export function getProgram(provider: AnchorProvider): Program {
  return new Program(IDL, provider);
}

/** Read-only provider with a dummy wallet, for fetching accounts without connecting. */
export function getReadonlyProvider(): AnchorProvider {
  const connection = getConnection();
  const dummy = {
    publicKey: PublicKey.default,
    signTransaction: async (t: any) => t,
    signAllTransactions: async (t: any) => t,
  };
  return new AnchorProvider(connection, dummy as any, { commitment: COMMITMENT });
}

// ----- PDA derivation (mirrors the on-chain seeds) -----

export const marketPda = (matchId: string) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("market"), Buffer.from(matchId)],
    PROGRAM_ID
  )[0];

export const vaultPda = (market: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), market.toBuffer()],
    PROGRAM_ID
  )[0];

export const betPda = (market: PublicKey, bettor: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("bet"), market.toBuffer(), bettor.toBuffer()],
    PROGRAM_ID
  )[0];

export { BN };
