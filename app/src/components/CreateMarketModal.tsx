import { useEffect, useMemo, useRef, useState } from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useProgram } from "@/hooks/useWallet";
import { BN, marketPda, vaultPda } from "@/lib/anchor";
import { fetchFixtures, goalKeysFor } from "@/lib/txline";
import type { FixtureRecord } from "@/lib/txlineTypes";

/** ~8100s after kickoff ≈ full time + stoppage + buffer; gates trustless settle. */
const SETTLE_BUFFER_SECS = 8100;

function teamsOf(f: FixtureRecord) {
  return f.Participant1IsHome
    ? { home: f.Participant1, away: f.Participant2 }
    : { home: f.Participant2, away: f.Participant1 };
}

function isFeatured(f: FixtureRecord) {
  return /world cup|friendl/i.test(f.Competition || "");
}

export default function CreateMarketModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { program, publicKey } = useProgram();
  const [fixtures, setFixtures] = useState<FixtureRecord[]>([]);
  const [loadingFx, setLoadingFx] = useState(false);
  const [fxError, setFxError] = useState<string | null>(null);
  const [selected, setSelected] = useState<FixtureRecord | null>(null);

  const [matchId, setMatchId] = useState("");
  const [kickoff, setKickoff] = useState(""); // datetime-local (betting close)
  const [oracle, setOracle] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setFxError(null);
    setLoadingFx(true);
    fetchFixtures()
      .then((fx) => {
        const sorted = [...fx].sort((a, b) => a.StartTime - b.StartTime);
        setFixtures(sorted);
      })
      .catch((e) => setFxError(e?.message ?? "Could not load TxLINE fixtures"))
      .finally(() => setLoadingFx(false));
    if (publicKey) setOracle(publicKey.toBase58());
  }, [open, publicKey]);

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const ordered = useMemo(() => {
    const featured = fixtures.filter(isFeatured);
    return featured.length ? featured : fixtures;
  }, [fixtures]);

  function selectFixture(f: FixtureRecord) {
    setSelected(f);
    setErr(null);
    const suffix = Date.now().toString(36).slice(-5);
    setMatchId(`WC_${f.FixtureId}_${suffix}`);
    // Prefill betting close to kickoff; editable for live-betting demos.
    const local = new Date(f.StartTime - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setKickoff(local);
  }

  const derived = useMemo(() => {
    if (!selected) return null;
    const { home, away } = teamsOf(selected);
    const { homeKey, awayKey } = goalKeysFor(selected);
    const startSec = Math.floor(selected.StartTime / 1000);
    return {
      home,
      away,
      homeKey,
      awayKey,
      startSec,
      settleNotBefore: startSec + SETTLE_BUFFER_SECS,
    };
  }, [selected]);

  async function submit() {
    if (!selected || !derived || !publicKey) return;
    setBusy(true);
    setErr(null);
    try {
      // match_timestamp (betting close): edited value, defaulting to StartTime.
      const editedSec = kickoff
        ? Math.floor(new Date(kickoff).getTime() / 1000)
        : derived.startSec;
      const oracleKey = new PublicKey(oracle);
      const market = marketPda(matchId);

      const binding = {
        fixtureId: new BN(selected.FixtureId),
        homeGoalKey: derived.homeKey,
        awayGoalKey: derived.awayKey,
        goalPeriod: 0,
        settleNotBefore: new BN(derived.settleNotBefore),
      };

      await program.methods
        .createMarket(
          matchId,
          derived.home,
          derived.away,
          new BN(editedSec),
          oracleKey,
          binding
        )
        .accountsPartial({
          admin: publicKey,
          market,
          vault: vaultPda(market),
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      onCreated();
      onClose();
      setSelected(null);
    } catch (e: any) {
      const s = e?.toString() ?? "Failed to create market";
      setErr(
        s.includes("already in use")
          ? "A market with this id already exists — change the match id."
          : s.slice(0, 220)
      );
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  let oracleValid = false;
  try {
    oracleValid = !!new PublicKey(oracle);
  } catch {
    oracleValid = false;
  }
  const ready = !!selected && !!matchId && !!kickoff && oracleValid && !busy;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-fade"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Create prediction market"
        className="card w-full max-w-lg p-6 outline-none animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Create market</h2>
            <p className="mt-0.5 text-xs text-white/45">
              Bound to a live TxLINE fixture — settles from its signed score data.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf-500/60"
          >
            ✕
          </button>
        </div>

        {/* Fixture picker */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/45">
            TxLINE fixtures
          </p>

          {loadingFx ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-pitch-850/70" />
              ))}
            </div>
          ) : fxError ? (
            <div className="rounded-xl border border-away/30 bg-away/10 p-3 text-xs text-away">
              {fxError}
              <button
                onClick={() => {
                  setLoadingFx(true);
                  fetchFixtures()
                    .then((fx) =>
                      setFixtures([...fx].sort((a, b) => a.StartTime - b.StartTime))
                    )
                    .catch((e) => setFxError(e?.message ?? "Retry failed"))
                    .finally(() => setLoadingFx(false));
                }}
                className="ml-2 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          ) : ordered.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-pitch-950/50 p-3 text-xs text-white/45">
              No fixtures in the TxLINE feed right now.
            </div>
          ) : (
            <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
              {ordered.slice(0, 30).map((f) => {
                const { home, away } = teamsOf(f);
                const active = selected?.FixtureId === f.FixtureId;
                return (
                  <button
                    key={f.FixtureId}
                    onClick={() => selectFixture(f)}
                    aria-pressed={active}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf-500/60 ${
                      active
                        ? "border-turf-500/60 bg-turf-500/10"
                        : "border-white/8 bg-pitch-950/40 hover:border-white/20"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">
                        {home} <span className="text-white/30">v</span> {away}
                      </div>
                      <div className="truncate text-[11px] text-white/40">
                        {f.Competition} · {new Date(f.StartTime).toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 font-mono text-[10px] ${
                        active ? "text-turf-400" : "text-white/30"
                      }`}
                    >
                      #{f.FixtureId}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Derived market params */}
        {selected && derived && (
          <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Home (proven by key 1·2)">
                <div className="input cursor-default truncate text-white/80">
                  {derived.home}
                </div>
              </Field>
              <Field label="Away">
                <div className="input cursor-default truncate text-white/80">
                  {derived.away}
                </div>
              </Field>
            </div>

            <Field label="Market id">
              <input
                className="input font-mono text-xs"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </Field>

            <Field label="Betting closes (kickoff)">
              <input
                type="datetime-local"
                className="input"
                value={kickoff}
                onChange={(e) => setKickoff(e.target.value)}
              />
            </Field>

            <Field label="Oracle authority (fallback only)">
              <input
                className="input font-mono text-xs"
                value={oracle}
                onChange={(e) => setOracle(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </Field>

            <div className="rounded-xl border border-turf-500/15 bg-turf-500/[0.06] px-3 py-2.5 text-[11px] leading-relaxed text-white/55">
              <span className="font-medium text-turf-400">TxLINE binding</span> ·
              fixture <span className="font-mono">#{selected.FixtureId}</span>, goal keys{" "}
              <span className="font-mono">
                {derived.homeKey}/{derived.awayKey}
              </span>
              , period <span className="font-mono">0</span>. Trustless settlement
              unlocks{" "}
              <span className="text-white/75">
                {new Date(derived.settleNotBefore * 1000).toLocaleString()}
              </span>
              .
            </div>
          </div>
        )}

        {err && <p className="mt-3 text-xs text-away">{err}</p>}

        <button
          onClick={submit}
          disabled={!ready}
          className="btn-primary mt-5 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-900"
        >
          {busy ? "Creating…" : selected ? "Create market" : "Select a fixture"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/50">{label}</span>
      {children}
    </label>
  );
}
