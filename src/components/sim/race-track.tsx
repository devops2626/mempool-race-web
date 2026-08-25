import { blockProgress, secondsToBlock } from "@/lib/sim/engine";
import { formatDuration } from "@/lib/sim/format";
import { useSim } from "@/lib/sim/context";
import { cn } from "@/lib/utils";

export function RaceTrack() {
  const engine = useSim((s) => s.engine);
  const q = engine.quantum;
  const settled = Boolean(engine.outcome);
  const blockWon =
    engine.outcome?.kind === "confirmed" ||
    engine.outcome?.kind === "pq-safe" ||
    engine.outcome?.kind === "hardware-short";
  const quantumWon = engine.outcome?.kind === "stolen" || q.phase === "recovered";
  const blockPct = settled ? 1 : blockProgress(engine);
  const toBlock = secondsToBlock(engine);
  const qPct = settled && quantumWon ? 1 : q.progress;
  const finite = Number.isFinite(q.timeToBreakSec);

  return (
    <section className="rounded-xl bg-bg-elevated p-4 shadow-[0_0_0_1px_rgb(255_255_255/0.08)] sm:p-5">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-sage uppercase">
            The race
          </p>
          <h2 className="font-display text-xl tracking-tight">
            Confirmation vs key recovery
          </h2>
        </div>
        <p className="font-mono text-xs text-muted tabular-nums">
          Block {engine.blockHeight.toLocaleString()} · t+{formatDuration(engine.simTime)}
        </p>
      </header>

      <Lane
        label="Next block"
        detail={
          settled
            ? blockWon
              ? "included your spend"
              : "included the adversary"
            : `${formatDuration(toBlock)} remaining`
        }
        pct={blockPct}
        tone="block"
      />
      <div className="h-3" />
      <Lane
        label="Quantum adversary"
        detail={
          q.phase === "insufficient"
            ? "no logical qubits"
            : q.phase === "blocked"
              ? "Shor does not apply"
              : q.phase === "idle"
                ? "waiting for a public key"
                : q.phase === "recovered" || quantumWon
                  ? `recovered in ${formatDuration(q.recoveredAt ?? engine.simTime)}`
                  : finite
                    ? `${Math.round(qPct * 100)}% · ${formatDuration(Math.max(0, q.timeToBreakSec * (1 - qPct)))} left`
                    : "not running"
        }
        pct={qPct}
        tone={
          q.phase === "recovered" || quantumWon
            ? "danger"
            : q.phase === "blocked" || q.phase === "insufficient"
              ? "muted"
              : "quantum"
        }
      />

      <p className="mt-4 text-xs leading-relaxed text-subtle">
        {q.phase === "insufficient"
          ? "Without fault-tolerant logical qubits the lower lane never moves. The mempool is only a race if the machine exists."
          : q.phase === "blocked"
            ? "Post-quantum signatures are not secp256k1. Period-finding has nothing to recover."
            : quantumWon
              ? "The lower lane finished first. The adversary replaced your spend with a higher-fee theft."
              : blockWon
                ? "The block arrived first. Your spend confirmed and this UTXO is no longer stealable via the mempool race."
                : "If the lower lane finishes first, the adversary can replace your spend with a higher-fee theft."}
      </p>
    </section>
  );
}

function Lane({
  label,
  detail,
  pct,
  tone,
}: {
  label: string;
  detail: string;
  pct: number;
  tone: "block" | "quantum" | "danger" | "muted";
}) {
  const fill =
    tone === "block"
      ? "bg-sage"
      : tone === "danger"
        ? "bg-danger"
        : tone === "muted"
          ? "bg-subtle"
          : "bg-warn";
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm text-fg">{label}</span>
        <span className="font-mono text-[11px] text-muted tabular-nums">{detail}</span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn("absolute inset-y-0 left-0 origin-left rounded-full", fill)}
          style={{ width: `${Math.min(100, Math.max(0, pct * 100))}%` }}
        />
      </div>
    </div>
  );
}
