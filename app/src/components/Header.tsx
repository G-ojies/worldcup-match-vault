import Link from "next/link";
import dynamic from "next/dynamic";

// Wallet button must be client-only to avoid SSR hydration mismatch.
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-pitch-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-turf-500 text-pitch-950">
            ⚽
          </span>
          <div className="leading-tight">
            <div className="text-sm font-bold text-white">WorldCup Match Vault</div>
            <div className="text-[10px] uppercase tracking-widest text-white/35">
              Verifiable prediction markets
            </div>
          </div>
        </Link>
        <WalletMultiButton />
      </div>
    </header>
  );
}
