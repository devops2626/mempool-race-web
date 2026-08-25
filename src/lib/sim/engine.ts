import { makeAddress, makeTxid, randomAmount, randomScript } from "./addresses";
import { exponential, intRange, mulberry32, range } from "./rng";
import type {
  LogEntry,
  Outcome,
  QuantumState,
  SimConfig,
  Tx,
  Wallet,
} from "./types";

export interface Engine {
  seed: number;
  rand: () => number;
  simTime: number;
  blockHeight: number;
  lastBlockAt: number;
  nextBlockAt: number;
  txs: Tx[];
  wallet: Wallet;
  quantum: QuantumState;
  config: SimConfig;
  outcome: Outcome | null;
  log: LogEntry[];
  userBroadcast: boolean;
  nextBgAt: number;
  logSeq: number;
}

function boundedExp(rand: () => number, mean: number): number {
  const raw = exponential(rand, mean);
  return Math.min(mean * 2.2, Math.max(mean * 0.25, raw));
}

function timeToBreak(config: SimConfig): number {
  if (config.postQuantum) return Number.POSITIVE_INFINITY;
  if (config.logicalQubits < 1200 || config.toffoliHz <= 0) {
    return Number.POSITIVE_INFINITY;
  }
  const qubitFactor = (1200 / config.logicalQubits) ** 2;
  return (config.toffoliGates / config.toffoliHz) * qubitFactor;
}

function physicalQubits(config: SimConfig): number {
  if (config.logicalQubits <= 0) return 100;
  return Math.round(config.logicalQubits * config.physicalPerLogical);
}

function pushLog(
  e: Engine,
  text: string,
  tone: LogEntry["tone"] = "neutral",
): void {
  e.logSeq += 1;
  e.log.unshift({
    id: `log-${e.logSeq}`,
    at: e.simTime,
    text,
    tone,
  });
  if (e.log.length > 24) e.log.length = 24;
}

function makeBackgroundTx(e: Engine): Tx {
  const script = randomScript(e.rand);
  return {
    id: makeTxid(e.rand),
    from: makeAddress(script, e.rand),
    to: makeAddress(script, e.rand),
    amountBtc: randomAmount(e.rand),
    feeSatVb: intRange(e.rand, 4, 80),
    vbytes: intRange(e.rand, 110, 240),
    scriptType: script,
    pubkeyExposed: script === "p2pk",
    status: "mempool",
    isUser: false,
    isAttack: false,
    enteredAt: e.simTime,
  };
}

function initialQuantum(config: SimConfig): QuantumState {
  const ttb = timeToBreak(config);
  const insufficient =
    !config.postQuantum &&
    (config.logicalQubits < 1200 || config.toffoliHz <= 0);
  return {
    phase: config.postQuantum
      ? "blocked"
      : insufficient
        ? "insufficient"
        : "idle",
    progress: 0,
    logicalQubits: config.logicalQubits,
    physicalQubits: physicalQubits(config),
    toffoliGates: config.toffoliGates,
    toffoliHz: config.toffoliHz,
    timeToBreakSec: ttb,
    startedAt: null,
    recoveredAt: null,
    targetTxId: null,
  };
}

export function createEngine(config: SimConfig, seed: number): Engine {
  const rand = mulberry32(seed);
  const wallet: Wallet = {
    address: makeAddress(config.userScript, rand),
    scriptType: config.userScript,
    balanceBtc: config.userAmountBtc,
    pubkeyOnChain: config.pubkeyStartsExposed,
    label: config.userScript === "pq" ? "PQ wallet" : "Your wallet",
  };

  const e: Engine = {
    seed,
    rand,
    simTime: 0,
    blockHeight: 918_440 + intRange(rand, 0, 80),
    lastBlockAt: 0,
    nextBlockAt: boundedExp(rand, config.meanBlockSec),
    txs: [],
    wallet,
    quantum: initialQuantum(config),
    config,
    outcome: null,
    log: [],
    userBroadcast: false,
    nextBgAt: range(rand, 0.4, 1.6),
    logSeq: 0,
  };

  const n = intRange(rand, 9, 14);
  for (let i = 0; i < n; i++) {
    const tx = makeBackgroundTx(e);
    tx.enteredAt = -range(rand, 8, 420);
    e.txs.push(tx);
  }

  if (config.postQuantum) {
    pushLog(e, "Post-quantum signatures active. Shor’s algorithm does not apply.");
  } else if (e.quantum.phase === "insufficient") {
    pushLog(
      e,
      "No fault-tolerant logical qubits available. The adversary is idle.",
    );
  } else if (config.pubkeyStartsExposed) {
    const ttb = e.quantum.timeToBreakSec;
    const head = config.userScript === "p2pk" ? 0.92 : 0.55;
    const startedAgo = Number.isFinite(ttb) ? ttb * head : 0;
    e.quantum.phase = "running";
    e.quantum.startedAt = -startedAgo;
    e.quantum.progress = Number.isFinite(ttb)
      ? Math.min(0.99, startedAgo / ttb)
      : 0;
    pushLog(
      e,
      "Public key is already on-chain. The adversary has a head start.",
      "warn",
    );
  } else {
    pushLog(e, "Mempool is live. Broadcast a spend to open the window.");
  }

  return e;
}

function startQuantum(e: Engine, targetTxId: string | null): void {
  if (e.config.postQuantum) {
    e.quantum.phase = "blocked";
    return;
  }
  if (e.quantum.phase === "insufficient") return;
  if (e.quantum.phase === "recovered") return;
  if (e.quantum.phase === "running") {
    if (targetTxId) e.quantum.targetTxId = targetTxId;
    return;
  }
  e.quantum.phase = "running";
  e.quantum.startedAt = e.simTime;
  e.quantum.targetTxId = targetTxId;
  const t = e.quantum.timeToBreakSec;
  pushLog(
    e,
    `Adversary started period-finding. Estimated ${Number.isFinite(t) ? Math.round(t) + "s" : "∞"} to recover the key.`,
    "warn",
  );
}

export function broadcastUser(e: Engine): boolean {
  if (e.userBroadcast || e.outcome) return false;
  const fee = intRange(e.rand, 12, 28);
  const tx: Tx = {
    id: makeTxid(e.rand),
    from: e.wallet.address,
    to: makeAddress(e.wallet.scriptType === "pq" ? "pq" : "p2wpkh", e.rand),
    amountBtc: Math.round((e.wallet.balanceBtc - 0.00012) * 1e8) / 1e8,
    feeSatVb: fee,
    vbytes: e.wallet.scriptType === "pq" ? 2800 : 141,
    scriptType: e.wallet.scriptType,
    pubkeyExposed: e.wallet.scriptType !== "pq",
    status: "mempool",
    isUser: true,
    isAttack: false,
    enteredAt: e.simTime,
  };
  e.txs.unshift(tx);
  e.userBroadcast = true;
  e.wallet.pubkeyOnChain = e.wallet.scriptType !== "pq";
  pushLog(
    e,
    `Broadcast ${tx.amountBtc.toFixed(4)} BTC · ${fee} sat/vB · ${tx.scriptType.toUpperCase()}.`,
  );

  if (e.config.postQuantum) {
    pushLog(e, "PQ signature reveals no secp256k1 key. Adversary stays blocked.", "ok");
    return true;
  }

  if (e.quantum.phase === "insufficient") {
    pushLog(e, "No cryptographically relevant machine is watching.", "ok");
    return true;
  }

  startQuantum(e, tx.id);
  return true;
}

function steal(e: Engine): void {
  const user = e.txs.find((t) => t.isUser && t.status === "mempool");
  const attackFee = (base: number) =>
    Math.max(250, Math.round(base * e.config.attackFeeMultiplier));

  if (!user) {
    if (
      e.wallet.pubkeyOnChain &&
      e.wallet.scriptType !== "pq" &&
      e.wallet.balanceBtc > 0
    ) {
      const attack: Tx = {
        id: makeTxid(e.rand),
        from: e.wallet.address,
        to: makeAddress("p2tr", e.rand),
        amountBtc: Math.round((e.wallet.balanceBtc - 0.0004) * 1e8) / 1e8,
        feeSatVb: attackFee(40),
        vbytes: 141,
        scriptType: e.wallet.scriptType,
        pubkeyExposed: true,
        status: "mempool",
        isUser: false,
        isAttack: true,
        enteredAt: e.simTime,
      };
      e.txs.unshift(attack);
      e.wallet.balanceBtc = 0;
      pushLog(
        e,
        "Key recovered. Adversary swept the UTXO with a high-fee spend.",
        "danger",
      );
    }
    return;
  }

  user.status = "replaced";
  const attack: Tx = {
    id: makeTxid(e.rand),
    from: user.from,
    to: makeAddress("p2tr", e.rand),
    amountBtc: user.amountBtc,
    feeSatVb: attackFee(user.feeSatVb),
    vbytes: user.vbytes,
    scriptType: user.scriptType,
    pubkeyExposed: true,
    status: "mempool",
    isUser: false,
    isAttack: true,
    enteredAt: e.simTime,
  };
  e.txs.unshift(attack);
  e.wallet.balanceBtc = 0;
  pushLog(
    e,
    `Key recovered. Competing transaction at ${attack.feeSatVb} sat/vB replaces yours in the mempool.`,
    "danger",
  );
}

function settle(
  e: Engine,
  kind: Outcome["kind"],
  recoverTime: number | null,
): void {
  if (e.outcome) return;
  const titles: Record<Outcome["kind"], string> = {
    confirmed: "Confirmed first",
    stolen: "Mempool race lost",
    "hardware-short": "Hardware cannot run the attack",
    "pq-safe": "Post-quantum signatures held",
    pending: "Still in flight",
  };
  const bodies: Record<Outcome["kind"], string> = {
    confirmed:
      "The next block included your spend before the private key was recovered. For this UTXO, the window closed in your favour. Remaining coins at a reused address would still be exposed.",
    stolen:
      "The adversary recovered the secp256k1 private key and broadcast a higher-fee competing spend. Miners follow fees. Your original transaction was replaced in the public mempool.",
    "hardware-short":
      "The watching device has no fault-tolerant logical qubits. Shor’s algorithm does not run. This is the world as of today — the estimate is a planning number, not a present capability.",
    "pq-safe":
      "The spend used a post-quantum signature. Period-finding on the elliptic-curve group does not yield a usable key. The mempool window for this attack is closed.",
    pending: "The race is still open.",
  };
  e.outcome = {
    kind,
    title: titles[kind],
    body: bodies[kind],
    simTime: e.simTime,
    blockTime: kind === "confirmed" ? e.simTime : null,
    recoverTime,
    seed: e.seed,
  };
}

function mineBlock(e: Engine): void {
  e.blockHeight += 1;
  e.lastBlockAt = e.simTime;
  e.nextBlockAt = e.simTime + boundedExp(e.rand, e.config.meanBlockSec);

  const pending = e.txs
    .filter((t) => t.status === "mempool")
    .sort((a, b) => b.feeSatVb - a.feeSatVb);

  const must = pending.filter((t) => t.isUser || t.isAttack);
  const rest = pending.filter((t) => !t.isUser && !t.isAttack);
  const cap = intRange(e.rand, 8, 12);
  const included = [...must, ...rest].slice(0, Math.max(cap, must.length));
  for (const tx of included) {
    tx.status = tx.isAttack ? "stolen" : "confirmed";
    tx.confirmedAt = e.simTime;
  }

  const user = e.txs.find((t) => t.isUser);
  const attack = e.txs.find((t) => t.isAttack);

  if (attack && attack.status === "stolen") {
    if (user && user.status === "mempool") user.status = "dropped";
    pushLog(e, `Block ${e.blockHeight} included the adversary’s spend.`, "danger");
    settle(e, "stolen", e.quantum.recoveredAt);
    return;
  }

  if (user && user.status === "confirmed") {
    pushLog(e, `Block ${e.blockHeight} confirmed your spend.`, "ok");
    if (e.config.postQuantum) settle(e, "pq-safe", null);
    else if (e.quantum.phase === "insufficient") settle(e, "hardware-short", null);
    else settle(e, "confirmed", e.quantum.recoveredAt);
    return;
  }

  pushLog(e, `Block ${e.blockHeight} mined. Your transaction was not in this template.`);
}

export function tick(e: Engine, dt: number): void {
  if (e.outcome) return;
  e.simTime += dt;

  while (e.simTime >= e.nextBgAt) {
    e.txs.unshift(makeBackgroundTx(e));
    e.nextBgAt += range(e.rand, 1.2, 4.5);
  }
  if (e.txs.length > 28) {
    const pinned = e.txs.filter((t) => t.isUser || t.isAttack);
    const rest = e.txs.filter((t) => !t.isUser && !t.isAttack);
    const live = rest.filter((t) => t.status === "mempool");
    const extras = rest.filter((t) => t.status !== "mempool");
    e.txs = [...pinned, ...live, ...extras].slice(0, 28);
  }

  const q = e.quantum;
  if (q.phase === "running" && Number.isFinite(q.timeToBreakSec)) {
    const elapsed = e.simTime - (q.startedAt ?? e.simTime);
    q.progress = Math.min(1, elapsed / q.timeToBreakSec);
    if (q.progress >= 1) {
      q.phase = "recovered";
      q.progress = 1;
      q.recoveredAt = e.simTime;
      steal(e);
    }
  }

  if (e.simTime >= e.nextBlockAt) {
    mineBlock(e);
  }
}

export function bumpUserFee(e: Engine): boolean {
  const user = e.txs.find((t) => t.isUser && t.status === "mempool");
  if (!user || e.outcome) return false;
  user.feeSatVb = Math.round(user.feeSatVb * 1.8);
  pushLog(e, `RBF bump. Your spend is now ${user.feeSatVb} sat/vB.`);
  return true;
}

export function blockProgress(e: Engine): number {
  const span = e.nextBlockAt - e.lastBlockAt;
  if (span <= 0) return 1;
  return Math.min(1, (e.simTime - e.lastBlockAt) / span);
}

export function secondsToBlock(e: Engine): number {
  return Math.max(0, e.nextBlockAt - e.simTime);
}
