import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Header } from "@/components/chrome/header";
import { EventLog } from "@/components/sim/event-log";
import { MempoolList } from "@/components/sim/mempool-list";
import { OutcomeReport } from "@/components/sim/outcome-report";
import { RaceTrack } from "@/components/sim/race-track";
import { SidePanel } from "@/components/sim/side-panel";
import { SimProvider, useSim } from "@/lib/sim/context";
import { SCENARIOS } from "@/lib/sim/scenarios";
import { cn } from "@/lib/utils";

export function SimApp({ scenarioId }: { scenarioId: string }) {
  return (
    <SimProvider key={scenarioId} scenarioId={scenarioId}>
      <SimAppInner />
    </SimProvider>
  );
}

function SimAppInner() {
  const scenario = useSim((s) => s.scenario);
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [scenario.id]);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <Header solid active="scenarios" />
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
            {SCENARIOS.map((s) => (
              <Link
                key={s.id}
                ref={s.id === scenario.id ? activeRef : undefined}
                to="/play/$scenarioId"
                params={{ scenarioId: s.id }}
                className={cn(
                  "shrink-0 rounded-full px-3 py-2 text-sm no-underline transition-colors duration-150",
                  s.id === scenario.id
                    ? "bg-accent text-accent-fg"
                    : "text-muted hover:bg-surface hover:text-fg",
                )}
              >
                <span className="mr-1.5 font-mono text-[10px] opacity-70">{s.index}</span>
                {s.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
        <div className="max-w-3xl">
          <p className="font-mono text-[10px] tracking-[0.16em] text-sage uppercase">
            Scenario {scenario.index}
          </p>
          <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl">
            {scenario.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
            {scenario.detail}
          </p>
        </div>

        <OutcomeReport />

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <div className="flex min-h-0 flex-col gap-4">
            <RaceTrack />
            <div className="flex min-h-[22rem] flex-col">
              <MempoolList />
            </div>
            <EventLog />
          </div>
          <SidePanel />
        </div>
      </main>
    </div>
  );
}
