import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  broadcastUser,
  bumpUserFee,
  createEngine,
  tick,
  type Engine,
} from "./engine";
import { scenarioById, SCENARIOS } from "./scenarios";
import type { Scenario, Speed } from "./types";

export const TICK_MS = 50;
export const BASE_SCALE = 40;

function seedFromId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function cloneEngine(e: Engine): Engine {
  return {
    ...e,
    txs: e.txs.map((t) => ({ ...t })),
    quantum: { ...e.quantum },
    wallet: { ...e.wallet },
    log: e.log.map((l) => ({ ...l })),
    config: { ...e.config },
    outcome: e.outcome ? { ...e.outcome } : null,
  };
}

export interface SimApi {
  scenario: Scenario;
  engine: Engine;
  running: boolean;
  speed: Speed;
  published: boolean;
  play: () => void;
  pause: () => void;
  setSpeed: (s: Speed) => void;
  broadcast: () => void;
  bump: () => void;
  reset: () => void;
  publish: () => void;
}

const SimContext = createContext<SimApi | null>(null);

export function SimProvider({
  scenarioId,
  children,
}: {
  scenarioId: string;
  children: ReactNode;
}) {
  const scenario = scenarioById(scenarioId) ?? SCENARIOS[0]!;
  const [engine, setEngine] = useState<Engine>(() =>
    createEngine(scenario.config, seedFromId(scenario.id)),
  );
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<Speed>(4);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(1.25, (now - last) / 1000);
      last = now;
      if (dt <= 0) return;
      setEngine((prev) => {
        if (prev.outcome) return prev;
        const copy = cloneEngine(prev);
        tick(copy, dt * speed * BASE_SCALE);
        return copy;
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [running, speed]);

  useEffect(() => {
    if (engine.outcome && running) setRunning(false);
  }, [engine.outcome, running]);

  const play = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const broadcast = useCallback(() => {
    setEngine((prev) => {
      const copy = cloneEngine(prev);
      if (!broadcastUser(copy)) return prev;
      return copy;
    });
    setRunning(true);
  }, []);
  const bump = useCallback(() => {
    setEngine((prev) => {
      const copy = cloneEngine(prev);
      if (!bumpUserFee(copy)) return prev;
      return copy;
    });
  }, []);
  const reset = useCallback(() => {
    const next = scenarioById(scenarioId) ?? SCENARIOS[0]!;
    setEngine(createEngine(next.config, (Math.random() * 0xffffffff) >>> 0));
    setRunning(false);
    setPublished(false);
  }, [scenarioId]);
  const publish = useCallback(() => setPublished(true), []);

  const value = useMemo<SimApi>(
    () => ({
      scenario,
      engine,
      running,
      speed,
      published,
      play,
      pause,
      setSpeed,
      broadcast,
      bump,
      reset,
      publish,
    }),
    [
      scenario,
      engine,
      running,
      speed,
      published,
      play,
      pause,
      broadcast,
      bump,
      reset,
      publish,
    ],
  );

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
}

export function useSim<T>(selector: (s: SimApi) => T): T {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSim must be used within SimProvider");
  return selector(ctx);
}
