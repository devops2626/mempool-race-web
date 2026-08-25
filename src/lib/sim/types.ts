export type ScriptType = "p2pk" | "p2pkh" | "p2wpkh" | "p2tr" | "pq";

export type TxStatus =
  | "mempool"
  | "confirmed"
  | "stolen"
  | "replaced"
  | "dropped";

export type QuantumPhase =
  | "idle"
  | "insufficient"
  | "running"
  | "recovered"
  | "blocked";

export type OutcomeKind =
  | "confirmed"
  | "stolen"
  | "hardware-short"
  | "pq-safe"
  | "pending";

export interface Tx {
  id: string;
  from: string;
  to: string;
  amountBtc: number;
  feeSatVb: number;
  vbytes: number;
  scriptType: ScriptType;
  pubkeyExposed: boolean;
  status: TxStatus;
  isUser: boolean;
  isAttack: boolean;
  enteredAt: number;
  confirmedAt?: number;
}

export interface Wallet {
  address: string;
  scriptType: ScriptType;
  balanceBtc: number;
  pubkeyOnChain: boolean;
  label: string;
}

export interface QuantumState {
  phase: QuantumPhase;
  progress: number;
  logicalQubits: number;
  physicalQubits: number;
  toffoliGates: number;
  toffoliHz: number;
  timeToBreakSec: number;
  startedAt: number | null;
  recoveredAt: number | null;
  targetTxId: string | null;
}

export interface SimConfig {
  logicalQubits: number;
  physicalPerLogical: number;
  toffoliGates: number;
  toffoliHz: number;
  meanBlockSec: number;
  pubkeyStartsExposed: boolean;
  postQuantum: boolean;
  userAmountBtc: number;
  userScript: ScriptType;
  attackFeeMultiplier: number;
}

export interface Outcome {
  kind: OutcomeKind;
  title: string;
  body: string;
  simTime: number;
  blockTime: number | null;
  recoverTime: number | null;
  seed: number;
}

export interface LogEntry {
  id: string;
  at: number;
  text: string;
  tone: "neutral" | "ok" | "warn" | "danger";
}

export interface Scenario {
  id: string;
  index: string;
  title: string;
  kicker: string;
  summary: string;
  detail: string;
  takeaway: string;
  config: SimConfig;
  likely: OutcomeKind;
}

export type Speed = 1 | 4 | 16;
