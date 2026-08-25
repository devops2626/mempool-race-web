import { formatDuration } from "@/lib/sim/format";
import { useSim } from "@/lib/sim/context";
import { cn } from "@/lib/utils";

export function EventLog() {
  const log = useSim((s) => s.engine.log);
  return (
    <section className="rounded-xl bg-bg-elevated p-4 shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
      <h2 className="font-display text-lg tracking-tight">Ledger</h2>
      <ol className="mt-3 flex max-h-48 flex-col gap-2 overflow-y-auto sm:max-h-56">
        {log.map((entry) => (
          <li key={entry.id} className="flex gap-3 text-xs leading-relaxed">
            <span className="w-14 shrink-0 font-mono text-subtle tabular-nums">
              {formatDuration(entry.at)}
            </span>
            <span
              className={cn(
                "text-muted",
                entry.tone === "ok" && "text-ok",
                entry.tone === "warn" && "text-warn",
                entry.tone === "danger" && "text-danger",
              )}
            >
              {entry.text}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
