import Link from "next/link";
import dynamic from "next/dynamic";
import { Volleyball } from "lucide-react";

// Wallet button must be client-only to avoid SSR hydration mismatch.
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-pitch-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-control bg-turf-500 text-pitch-950">
            <Volleyball className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
          <div className="leading-none">
            <div className="text-[15px] font-semibold tracking-tight text-white">GreYat WorldCup Analytics</div>
            <div className="label mt-1 text-[9px]">Verifiable prediction markets</div>
          </div>
        </Link>
        <WalletMultiButton />
      </div>
    </header>
  );
}
