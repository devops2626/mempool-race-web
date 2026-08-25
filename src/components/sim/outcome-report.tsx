import { FileText, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/sim/format";
import { RESEARCH } from "@/lib/sim/scenarios";
import { useSim } from "@/lib/sim/context";
import type { OutcomeKind } from "@/lib/sim/types";

const TONE: Record<OutcomeKind, "ok" | "danger" | "sage" | "warn" | "info"> = {
  confirmed: "ok",
  stolen: "danger",
  "hardware-short": "sage",
  "pq-safe": "ok",
  pending: "info",
};

export function OutcomeReport() {
  const outcome = useSim((s) => s.engine.outcome);
  const published = useSim((s) => s.published);
  const publish = useSim((s) => s.publish);
  const reset = useSim((s) => s.reset);
  const scenario = useSim((s) => s.scenario);
  const engine = useSim((s) => s.engine);

  if (!outcome) return null;

  if (!published) {
    return (
      <div className="rounded-xl bg-bg-elevated p-4 shadow-[0_0_0_1px_rgb(255_255_255/0.08)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge tone={TONE[outcome.kind]}>{outcome.kind.replace("-", " ")}</Badge>
            <h2 className="mt-3 font-display text-2xl tracking-tight">{outcome.title}</h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
              {outcome.body}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button onClick={publish} className="sm:min-w-44">
            <FileText className="size-4" />
            Publish report
          </Button>
          <Button variant="secondary" onClick={reset}>
            <RotateCcw className="size-4" />
            Run again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <article className="rounded-xl bg-bg-elevated p-5 shadow-[0_0_0_1px_rgb(255_255_255/0.08)] sm:p-6">
      <header className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-sage uppercase">
            Situation report · {scenario.index}
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight">{scenario.title}</h2>
          <p className="mt-1 text-sm text-muted">{scenario.kicker}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-sm p-2 text-muted transition-colors hover:text-fg"
          aria-label="Close report and reset"
        >
          <X className="size-4" />
        </button>
      </header>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <Field k="Outcome" v={outcome.title} />
        <Field k="Simulated time" v={formatDuration(outcome.simTime)} />
        <Field
          k="Key recovery"
          v={outcome.recoverTime == null ? "did not finish" : formatDuration(outcome.recoverTime)}
        />
        <Field k="Seed" v={`0x${engine.seed.toString(16)}`} />
      </dl>

      <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted">{outcome.body}</p>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-fg">{scenario.takeaway}</p>

      <div className="mt-6 rounded-md bg-surface px-4 py-3 text-xs leading-relaxed text-subtle">
        Assumptions: {RESEARCH.logicalQubits.toLocaleString()} logical qubits and{" "}
        {RESEARCH.toffoliGates.toLocaleString()} Toffoli gates to break {RESEARCH.curve},
        as reported from Google Quantum AI work. Physical-qubit overhead is a round
        {` ${RESEARCH.physicalPerLogical.toLocaleString()}:1`} encoding. This report is
        an educational simulation, not a cryptographic result.
      </div>

      <div className="mt-5">
        <Button variant="secondary" onClick={reset}>
          <RotateCcw className="size-4" />
          New run
        </Button>
      </div>
    </article>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] text-subtle">{k}</dt>
      <dd className="mt-0.5 font-mono text-sm text-fg">{v}</dd>
    </div>
  );
}
