import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Header({
  solid = false,
  active = "briefing",
}: {
  solid?: boolean;
  active?: "briefing" | "scenarios";
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border",
        solid ? "bg-bg" : "bg-bg/85 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-fg no-underline"
          aria-label="Mempool Race home"
        >
          <img src="/favicon.svg" alt="" className="size-6" width={24} height={24} />
          <span className="font-display text-lg tracking-tight sm:text-xl">
            Mempool Race
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            className={cn(
              "inline-flex min-h-11 items-center rounded-sm px-3 py-2 no-underline transition-colors duration-150",
              active === "briefing" ? "text-fg" : "text-muted hover:text-fg",
            )}
          >
            Briefing
          </Link>
          <Link
            to="/play/$scenarioId"
            params={{ scenarioId: "mempool-window" }}
            className={cn(
              "inline-flex min-h-11 items-center rounded-sm px-3 py-2 no-underline transition-colors duration-150",
              active === "scenarios" ? "text-fg" : "text-muted hover:text-fg",
            )}
          >
            Scenarios
          </Link>
        </nav>
      </div>
    </header>
  );
}
