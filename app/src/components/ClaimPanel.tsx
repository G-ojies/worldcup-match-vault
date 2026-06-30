import { useMemo, useState } from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import type { MarketView, BetView } from "@/hooks/useMarkets";
import { useProgram } from "@/hooks/useWallet";
import { betPda, vaultPda } from "@/lib/anchor";
import { fmtSol, OUTCOME_LABEL } from "@/lib/format";

export default function ClaimPanel({
  market,
  bet,
  onDone,
}: {
  market: MarketView;
  bet: BetView;
  onDone: () => void;
}) {
  const { program, connected, publicKey } = useProgram();
  const [busy, setBusy] = useState(false);
  const [sig, setSig] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const won = market.isSettled && bet.predictedOutcome === market.outcome;

  const claimable = useMemo(() => {
    if (!won) return 0;
    const winningPool =
      market.outcome === "home"
        ? market.totalHome
        : market.outcome === "away"
        ? market.totalAway
        : market.totalDraw;
    if (winningPool <= 0) return 0;
    return Math.floor((bet.amount * market.totalPool * 9700) / 10000 / winningPool);
  }, [won, market, bet]);

  async function claim() {
    if (!connected || !publicKey) return;
    setBusy(true);
    setErr(null);
    try {
      const marketPk = new PublicKey(market.pubkey);
      const signature = await program.methods
        .claimPayout()
        .accountsPartial({
          bettor: publicKey,
          market: marketPk,
          vault: vaultPda(marketPk),
          bet: betPda(marketPk, publicKey),
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setSig(signature);
      onDone();
    } catch (e: any) {
      setErr((e?.toString() ?? "Claim failed").slice(0, 160));
    } finally {
      setBusy(false);
    }
  }

  if (!market.isSettled) return null;

  return (
    <div className="card p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
        Your position
      </h3>

      <div className="mb-4 space-y-1.5 text-sm">
        <Row label="Your pick" value={OUTCOME_LABEL[bet.predictedOutcome]} />
        <Row label="Staked" value={fmtSol(bet.amount)} />
        <Row label="Result" value={OUTCOME_LABEL[market.outcome]} />
      </div>

      {bet.claimed ? (
        <div className="rounded-xl bg-white/5 px-3 py-2 text-center text-sm text-white/60">
          Winnings already claimed ✓
        </div>
      ) : won ? (
        <>
          <div className="mb-3 flex items-center justify-between rounded-xl bg-turf-500/10 px-3 py-2.5">
            <span className="text-sm text-turf-400">Claimable</span>
            <span className="tabular-nums text-lg font-bold text-turf-400">
              {fmtSol(claimable)}
            </span>
          </div>
          <button onClick={claim} disabled={busy} className="btn-primary w-full">
            {busy ? "Claiming…" : "Claim winnings"}
          </button>
        </>
      ) : (
        <div className="rounded-xl bg-away/10 px-3 py-2 text-center text-sm text-away">
          This bet didn’t win.
        </div>
      )}

      {sig && (
        <p className="mt-3 break-all text-center text-xs text-turf-400">
          ✓ {sig}
        </p>
      )}
      {err && <p className="mt-2 text-center text-xs text-away">{err}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/45">{label}</span>
      <span className="font-medium text-white/85">{value}</span>
    </div>
  );
}
