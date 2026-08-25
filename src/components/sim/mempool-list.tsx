import { Badge } from "@/components/ui/badge";
import { formatBtc, formatSatVb, scriptLabel, shortId } from "@/lib/sim/format";
import { useSim } from "@/lib/sim/context";
import type { Tx, TxStatus } from "@/lib/sim/types";
import { cn } from "@/lib/utils";

const STATUS: Record<TxStatus, { label: string; tone: "neutral" | "ok" | "danger" | "warn" | "info" }> = {
  mempool: { label: "mempool", tone: "info" },
  confirmed: { label: "confirmed", tone: "ok" },
  stolen: { label: "stolen", tone: "danger" },
  replaced: { label: "replaced", tone: "warn" },
  dropped: { label: "dropped", tone: "neutral" },
};

export function MempoolList() {
  const txs = useSim((s) => s.engine.txs);
  const simTime = useSim((s) => s.engine.simTime);
  const pending = txs.filter((t) => t.status === "mempool").length;
  const ordered = [...txs].sort((a, b) => {
    const rank = (t: Tx) => (t.isUser ? 0 : t.isAttack ? 1 : 2);
    return rank(a) - rank(b);
  });

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl bg-bg-elevated p-3 shadow-[0_0_0_1px_rgb(255_255_255/0.08)] sm:p-4">
      <header className="mb-3 flex items-baseline justify-between gap-3 px-1">
        <h2 className="font-display text-xl tracking-tight">Public mempool</h2>
        <p className="font-mono text-xs text-muted tabular-nums">
          {pending} unconfirmed
        </p>
      </header>
      <div className="hidden grid-cols-[minmax(0,1.4fr)_72px_88px_92px] gap-2 px-2 pb-2 font-mono text-[10px] tracking-wider text-subtle uppercase sm:grid">
        <span>Transaction</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Fee</span>
        <span className="text-right">Status</span>
      </div>
      <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain pr-0.5">
        {ordered.map((tx) => (
          <TxRow key={tx.id} tx={tx} now={simTime} />
        ))}
      </ul>
    </section>
  );
}

function TxRow({ tx, now }: { tx: Tx; now: number }) {
  const st = STATUS[tx.status];
  const age = Math.max(0, now - tx.enteredAt);
  return (
    <li
      className={cn(
        "grid grid-cols-1 gap-1 rounded-md px-2.5 py-2 sm:grid-cols-[minmax(0,1.4fr)_72px_88px_92px] sm:items-center sm:gap-2",
        tx.isUser && "bg-sage/10",
        tx.isAttack && "bg-danger/10",
        !tx.isUser && !tx.isAttack && "bg-surface/60",
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-fg tabular-nums">
            {shortId(tx.id, 5)}
          </span>
          {tx.isUser && <Badge tone="sage">yours</Badge>}
          {tx.isAttack && <Badge tone="danger">adversary</Badge>}
        </div>
        <div className="mt-0.5 truncate font-mono text-[11px] text-subtle">
          {scriptLabel(tx.scriptType)} · {age < 1 ? "now" : `${Math.floor(age)}s`}
        </div>
      </div>
      <div className="flex justify-between sm:block sm:text-right">
        <span className="sm:hidden font-mono text-[10px] text-subtle uppercase">Amount</span>
        <span className="font-mono text-xs text-fg tabular-nums">
          {formatBtc(tx.amountBtc)}
        </span>
      </div>
      <div className="flex justify-between sm:block sm:text-right">
        <span className="sm:hidden font-mono text-[10px] text-subtle uppercase">Fee</span>
        <span className="font-mono text-xs text-muted tabular-nums">
          {formatSatVb(tx.feeSatVb)}
        </span>
      </div>
      <div className="flex justify-end">
        <Badge tone={st.tone}>
          {tx.isAttack && tx.status === "stolen" ? "mined" : st.label}
        </Badge>
      </div>
    </li>
  );
}
