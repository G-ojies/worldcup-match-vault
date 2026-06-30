import { useMemo, useState } from "react";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import type { MarketView } from "@/hooks/useMarkets";
import { useProgram } from "@/hooks/useWallet";
import { BN, betPda, outcomeArg, vaultPda, type Outcome } from "@/lib/anchor";
import { fmtSol } from "@/lib/format";

const CHOICES: { key: Outcome; label: string; ring: string; active: string }[] = [
  { key: "home", label: "Home", ring: "hover:border-home/50", active: "border-home bg-home/10 text-home" },
  { key: "draw", label: "Draw", ring: "hover:border-draw/50", active: "border-draw bg-draw/10 text-draw" },
  { key: "away", label: "Away", ring: "hover:border-away/50", active: "border-away bg-away/10 text-away" },
];

export default function BetForm({
  market,
  onDone,
}: {
  market: MarketView;
  onDone: () => void;
}) {
  const { program, connected, publicKey } = useProgram();
  const [choice, setChoice] = useState<Outcome>("home");
  const [amount, setAmount] = useState("1");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const started = market.matchTimestamp <= Math.floor(Date.now() / 1000);
  const lamports = Math.round((parseFloat(amount) || 0) * LAMPORTS_PER_SOL);

  // Estimated payout if this outcome wins, including the 3% fee.
  const estPayout = useMemo(() => {
    if (lamports <= 0) return 0;
    const poolFor =
      choice === "home" ? market.totalHome : choice === "away" ? market.totalAway : market.totalDraw;
    const newWinning = poolFor + lamports;
    const newTotal = market.totalPool + lamports;
    return Math.floor((lamports * newTotal * 9700) / 10000 / newWinning);
  }, [choice, lamports, market]);

  async function submit() {
    if (!connected || !publicKey) {
      setErr("Connect a wallet first.");
      return;
    }
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const marketPk = new PublicKey(market.pubkey);
      const sig = await program.methods
        .placeBet(outcomeArg(choice), new BN(lamports))
        .accountsPartial({
          bettor: publicKey,
          market: marketPk,
          vault: vaultPda(marketPk),
          bet: betPda(marketPk, publicKey),
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setMsg(`Bet placed · ${sig.slice(0, 8)}…`);
      onDone();
    } catch (e: any) {
      const s = e?.toString() ?? "Transaction failed";
      setErr(
        s.includes("already in use")
          ? "You already have a bet on this market."
          : s.includes("BetAfterMatchStart")
          ? "Betting is closed — the match has started."
          : s.slice(0, 160)
      );
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || !connected || started || market.isSettled || lamports <= 0;

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">
        Place a bet
      </h3>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {CHOICES.map((c) => (
          <button
            key={c.key}
            onClick={() => setChoice(c.key)}
            disabled={market.isSettled || started}
            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition disabled:opacity-40 ${
              choice === c.key
                ? c.active
                : `border-white/10 text-white/70 ${c.ring}`
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <label className="mb-1 block text-xs text-white/50">Amount (SOL)</label>
      <input
        type="number"
        min="0"
        step="0.1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={market.isSettled || started}
        className="input mb-3 tabular-nums"
      />

      <div className="mb-4 flex items-center justify-between rounded-xl bg-pitch-950/60 px-3 py-2 text-sm">
        <span className="text-white/50">Est. payout if {choice} wins</span>
        <span className="tabular-nums font-semibold text-turf-400">{fmtSol(estPayout)}</span>
      </div>

      <button onClick={submit} disabled={disabled} className="btn-primary w-full">
        {busy ? "Confirming…" : started ? "Betting closed" : "Place bet"}
      </button>

      {!connected && (
        <p className="mt-2 text-center text-xs text-white/40">Connect a wallet to bet.</p>
      )}
      {msg && <p className="mt-2 text-center text-xs text-turf-400">{msg}</p>}
      {err && <p className="mt-2 text-center text-xs text-away">{err}</p>}
    </div>
  );
}
