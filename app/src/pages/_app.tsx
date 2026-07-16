import "@/styles/globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { RPC_URL } from "@/lib/anchor";

export default function App({ Component, pageProps }: AppProps) {
  // Phantom, Solflare, Backpack et al. register via the Wallet Standard and are
  // auto-detected. No need to bundle individual adapters.
  return (
    <div className={`font-root ${GeistSans.variable} ${GeistMono.variable}`}>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </Head>
      <ConnectionProvider endpoint={RPC_URL} config={{ commitment: "confirmed" }}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <Component {...pageProps} />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}
