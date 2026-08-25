import { Link } from "@tanstack/react-router";
import { ArrowRight, Cpu, KeyRound, Shield, Timer } from "lucide-react";
import { Header } from "@/components/chrome/header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { RESEARCH, SCENARIOS } from "@/lib/sim/scenarios";
import { formatCompact } from "@/lib/sim/format";
import type { OutcomeKind } from "@/lib/sim/types";
import { cn } from "@/lib/utils";

const LIKELY: Record<
  OutcomeKind,
  { label: string; tone: "ok" | "danger" | "warn" | "sage" | "info" }
> = {
  confirmed: { label: "Often holds", tone: "ok" },
  stolen: { label: "Race often lost", tone: "danger" },
  "hardware-short": { label: "Attack fails", tone: "sage" },
  "pq-safe": { label: "Window closed", tone: "ok" },
  pending: { label: "Open", tone: "info" },
};

export function Landing() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <Header />
      <main>
        <Hero />
        <ClaimStrip />
        <Reality />
        <ScenarioGrid />
        <Mechanics />
        <FooterNote />
      </main>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--color-border) 80%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-border) 80%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 20%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="stagger-in max-w-3xl">
          <p className="mb-5 font-mono text-xs tracking-[0.18em] text-sage uppercase">
            Public mempool · secp256k1 · reported estimate
          </p>
          <h1 className="font-display text-[2.35rem] leading-[1.12] tracking-[-0.03em] text-fg sm:text-5xl lg:text-[3.5rem]">
            Breaking the curve may take 1,200 logical qubits.
            <span className="italic text-muted"> The mempool is the race.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Google Quantum AI researchers reported that secp256k1 — the curve
            behind Bitcoin and many other chains — might fall to 1,200 logical
            qubits and 90 million Toffoli gates. These scenarios show what that
            number would mean for a transaction sitting unconfirmed.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/play/$scenarioId"
              params={{ scenarioId: "fast-clock" }}
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              Run the fast-clock race
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/play/$scenarioId"
              params={{ scenarioId: "today" }}
              className={cn(
                buttonVariants({ size: "lg", variant: "secondary" }),
                "w-full sm:w-auto",
              )}
            >
              Reality check: today’s hardware
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClaimStrip() {
  const items = [
    {
      k: formatCompact(RESEARCH.logicalQubits),
      v: "logical qubits",
      d: "Down from prior 2–4k estimates",
    },
    { k: "90M", v: "Toffoli gates", d: "Circuit size to recover a key" },
    { k: "1.2M", v: "physical qubits", d: "At ~1,000 physical per logical" },
    { k: "~10m", v: "block interval", d: "The window a spend must survive" },
  ];
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={it.v}
            className={cn(
              "px-4 py-6 sm:px-6 sm:py-8",
              i % 2 === 1 && "border-l border-border",
              i >= 2 && "border-t border-border lg:border-t-0",
              "lg:border-l lg:first:border-l-0",
            )}
          >
            <div className="font-display text-3xl tracking-tight text-fg tabular-nums sm:text-4xl">
              {it.k}
            </div>
            <div className="mt-1 text-sm text-fg">{it.v}</div>
            <div className="mt-1 text-xs text-subtle">{it.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Reality() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-2">
        <article className="border-b border-border px-4 py-12 sm:px-6 lg:border-r lg:border-b-0">
          <div className="mb-4 flex items-center gap-2 text-sage">
            <Cpu className="size-4" />
            <span className="font-mono text-xs tracking-[0.16em] uppercase">
              Logical vs physical
            </span>
          </div>
          <h2 className="font-display text-2xl tracking-tight text-fg sm:text-3xl">
            This is not an imminent break.
          </h2>
          <p className="mt-4 max-w-prose leading-relaxed text-muted">
            A logical qubit is an error-corrected unit of quantum information.
            Under current surface-code estimates you still need on the order of
            a thousand physical qubits to host one logical qubit. A machine with
            1,200 logical qubits would imply roughly a million physical qubits —
            far beyond Willow-class chips of ~100 physical qubits.
          </p>
          <p className="mt-4 max-w-prose leading-relaxed text-muted">
            The figure is a planning number. It is a reason to migrate, not a
            reason to move coins in a panic.
          </p>
        </article>
        <article className="px-4 py-12 sm:px-6">
          <div className="mb-4 flex items-center gap-2 text-sage">
            <KeyRound className="size-4" />
            <span className="font-mono text-xs tracking-[0.16em] uppercase">
              The mempool attack
            </span>
          </div>
          <h2 className="font-display text-2xl tracking-tight text-fg sm:text-3xl">
            Fast clocks hunt unconfirmed spends.
          </h2>
          <p className="mt-4 max-w-prose leading-relaxed text-muted">
            When you spend from a hashed address, the signature reveals the
            public key. A sufficiently fast fault-tolerant machine could, in
            principle, recover the private key and broadcast a competing
            higher-fee transaction before the original confirms. Miners follow
            fees. That is the race.
          </p>
          <p className="mt-4 max-w-prose leading-relaxed text-muted">
            Address reuse and legacy pay-to-pubkey outputs skip the wait: the
            key is already public. Post-quantum signatures close the window.
          </p>
        </article>
      </div>
    </section>
  );
}

function ScenarioGrid() {
  return (
    <section id="scenarios" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.16em] text-sage uppercase">
              Six published scenarios
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
              Run the mempool.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted">
            Each scenario is a live, accelerated simulation. Broadcast a spend,
            watch the adversary, and publish the report.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((s) => {
            const likely = LIKELY[s.likely];
            return (
              <Link
                key={s.id}
                to="/play/$scenarioId"
                params={{ scenarioId: s.id }}
                className="group flex flex-col rounded-xl bg-bg-elevated p-4 no-underline shadow-[0_0_0_1px_rgb(255_255_255/0.08)] transition-[box-shadow,transform] duration-150 hover:shadow-[0_0_0_1px_rgb(255_255_255/0.16)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-xs text-subtle">{s.index}</span>
                  <Badge tone={likely.tone}>{likely.label}</Badge>
                </div>
                <h3 className="mt-4 font-display text-xl tracking-tight text-fg">
                  {s.title}
                </h3>
                <p className="mt-1 text-xs text-sage">{s.kicker}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {s.summary}
                </p>
                <span className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm text-fg">
                  Open scenario
                  <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Mechanics() {
  const items = [
    {
      icon: Timer,
      title: "The window",
      body: "A typical Bitcoin block is ~10 minutes. That is the unconfirmed lifetime of a spend — and the only time a hashed-address key is newly visible.",
    },
    {
      icon: Cpu,
      title: "The machine",
      body: "Time-to-break is 90 million Toffoli gates divided by the logical clock, scaled if the machine has fewer than 1,200 logical qubits. Below that threshold, the attack does not start.",
    },
    {
      icon: Shield,
      title: "Responsible disclosure",
      body: "The underlying research was reported as validated with a zero-knowledge proof, without publishing a step-by-step attack. This simulator visualizes timelines, not circuits.",
    },
  ];
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-0 sm:grid-cols-3">
        {items.map((it, i) => (
          <article
            key={it.title}
            className={cn(
              "px-4 py-10 sm:px-6",
              i > 0 && "border-t border-border sm:border-t-0 sm:border-l",
            )}
          >
            <it.icon className="size-4 text-sage" />
            <h3 className="mt-4 font-display text-xl tracking-tight">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{it.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FooterNote() {
  return (
    <footer className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl text-sm text-subtle">
        Educational simulation. It does not break keys, submit network
        transactions, or provide an attack recipe. Hardware, clocks, and
        resource estimates are simplified so the race is visible in seconds.
      </div>
    </footer>
  );
}
