import { Pause, Play, Radio, RotateCcw, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatBtc,
  formatCompact,
  formatDuration,
  formatQubits,
  scriptHint,
  scriptLabel,
  shortId,
} from "@/lib/sim/format";
import { useSim } from "@/lib/sim/context";
import type { Speed } from "@/lib/sim/types";

const SPEEDS: Speed[] = [1, 4, 16];

export function SidePanel() {
  const engine = useSim((s) => s.engine);
  const running = useSim((s) => s.running);
  const speed = useSim((s) => s.speed);
  const play = useSim((s) => s.play);
  const pause = useSim((s) => s.pause);
  const setSpeed = useSim((s) => s.setSpeed);
  const broadcast = useSim((s) => s.broadcast);
  const bump = useSim((s) => s.bump);
  const reset = useSim((s) => s.reset);
  const scenario = useSim((s) => s.scenario);
  const q = engine.quantum;
  const user = engine.txs.find((t) => t.isUser);

  return (
    <div className="flex flex-col gap-3">
      <section className="rounded-xl bg-bg-elevated p-4 shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        <p className="font-mono text-[10px] tracking-[0.16em] text-sage uppercase">
          {engine.wallet.label}
        </p>
        <p className="mt-2 break-all font-mono text-xs text-muted">
          {shortId(engine.wallet.address, 8)}
        </p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="font-display text-3xl tracking-tight tabular-nums">
              {formatBtc(engine.wallet.balanceBtc)}
            </div>
            <div className="text-xs text-subtle">BTC</div>
          </div>
          <Badge tone={engine.wallet.pubkeyOnChain ? "warn" : "sage"}>
            {engine.wallet.pubkeyOnChain ? "pubkey exposed" : "pubkey hashed"}
          </Badge>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          {scriptLabel(engine.wallet.scriptType)} — {scriptHint(engine.wallet.scriptType)}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            onClick={broadcast}
            disabled={engine.userBroadcast || Boolean(engine.outcome)}
            className="w-full"
          >
            <Radio className="size-4" />
            Broadcast spend
          </Button>
          <Button
            variant="secondary"
            onClick={bump}
            disabled={!user || user.status !== "mempool"}
            className="w-full"
          >
            <Zap className="size-4" />
            RBF fee bump
          </Button>
        </div>
      </section>

      <section className="rounded-xl bg-bg-elevated p-4 shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        <p className="font-mono text-[10px] tracking-[0.16em] text-sage uppercase">
          Adversary
        </p>
        <h3 className="mt-1 font-display text-xl tracking-tight">Watching the mempool</h3>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Stat k="Logical qubits" v={formatQubits(q.logicalQubits)} />
          <Stat k="Physical (est.)" v={formatQubits(q.physicalQubits)} />
          <Stat k="Toffoli gates" v={formatCompact(q.toffoliGates)} />
          <Stat
            k="Logical clock"
            v={q.toffoliHz > 0 ? `${formatCompact(q.toffoliHz)} Hz` : "—"}
          />
          <Stat
            k="Time to break"
            v={Number.isFinite(q.timeToBreakSec) ? formatDuration(q.timeToBreakSec) : "never"}
          />
          <Stat k="Phase" v={q.phase} />
        </dl>
      </section>

      <section className="rounded-xl bg-bg-elevated p-4 shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        <p className="font-mono text-[10px] tracking-[0.16em] text-sage uppercase">
          Clock
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => (running ? pause() : play())}
            className="min-w-24"
          >
            {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {running ? "Pause" : "Run"}
          </Button>
          {SPEEDS.map((sp) => (
            <Button
              key={sp}
              variant={speed === sp ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSpeed(sp)}
              className="min-w-14"
            >
              {sp}×
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
        <p className="mt-3 text-xs text-subtle">
          Time is compressed so a ten-minute block is watchable. Seed{" "}
          {engine.seed.toString(16)}.
        </p>
        <p className="mt-2 text-xs text-muted">{scenario.takeaway}</p>
      </section>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] text-subtle">{k}</dt>
      <dd className="mt-0.5 font-mono text-sm capitalize text-fg tabular-nums">{v}</dd>
    </div>
  );
}
