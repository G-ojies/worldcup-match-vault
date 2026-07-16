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
      {/* min-h (not fixed h) + min-w-0 + shrink-0 on the button: the long
          "GreYat WorldCup Analytics" wordmark wraps within its own space on
          narrow screens instead of colliding with the wallet button. */}
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-5 py-2.5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-control bg-turf-500 text-pitch-950">
            <Volleyball className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 leading-tight">
            <div className="text-sm font-semibold leading-tight tracking-tight text-white sm:text-[15px]">GreYat WorldCup Analytics</div>
            <div className="label mt-0.5 truncate text-[9px]">Verifiable prediction markets</div>
          </div>
        </Link>
        <div className="shrink-0">
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
