import { useMemo } from "react";
import { AnchorProvider } from "@anchor-lang/core";
import { useConnection, useWallet as useAdapterWallet } from "@solana/wallet-adapter-react";
import { ADMIN_PUBKEY, getProgram, getReadonlyProvider } from "@/lib/anchor";

/**
 * Bridges the wallet-adapter into an Anchor `Program`.
 *
 * - When a wallet is connected, returns a Program signed by that wallet.
 * - Otherwise returns a read-only Program (fetches work, sends don't).
 */
export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAdapterWallet();

  return useMemo(() => {
    const connected = wallet.connected && !!wallet.publicKey;

    const provider = connected
      ? new AnchorProvider(connection, wallet as any, { commitment: "confirmed" })
      : getReadonlyProvider();

    const program = getProgram(provider);

    const isAdmin =
      connected &&
      (!ADMIN_PUBKEY || wallet.publicKey!.equals(ADMIN_PUBKEY));

    return {
      program,
      provider,
      connected,
      publicKey: wallet.publicKey ?? null,
      isAdmin,
    };
  }, [connection, wallet]);
}

export { useAdapterWallet as useWallet };
