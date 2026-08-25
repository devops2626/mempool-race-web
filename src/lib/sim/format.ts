import type { ScriptType } from "./types";

export function shortId(id: string, size = 4): string {
  if (id.length <= size * 2 + 1) return id;
  return `${id.slice(0, size)}…${id.slice(-size)}`;
}

export function formatBtc(n: number): string {
  if (n >= 100) return n.toFixed(2);
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(6);
}

export function formatSatVb(n: number): string {
  return `${Math.round(n)} sat/vB`;
}

export function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "—";
  if (sec < 1) return `${Math.round(sec * 1000)} ms`;
  if (sec < 90) return `${sec.toFixed(sec < 10 ? 1 : 0)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m < 90) return `${m}m ${s.toString().padStart(2, "0")}s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (h < 48) return `${h}h ${rm}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(Math.round(n));
}

export function scriptLabel(t: ScriptType): string {
  switch (t) {
    case "p2pk":
      return "P2PK";
    case "p2pkh":
      return "P2PKH";
    case "p2wpkh":
      return "P2WPKH";
    case "p2tr":
      return "P2TR";
    case "pq":
      return "ML-DSA";
  }
}

export function scriptHint(t: ScriptType): string {
  switch (t) {
    case "p2pk":
      return "Pays to a raw public key. The key is visible on-chain before any spend.";
    case "p2pkh":
      return "Pays to a hash of the public key. The key is revealed in the spending signature.";
    case "p2wpkh":
      return "Native segwit. Same exposure model as P2PKH: the key appears when you spend.";
    case "p2tr":
      return "Taproot. A tweaked key is revealed at spend time.";
    case "pq":
      return "Post-quantum signature. Shor’s algorithm does not recover the private key.";
  }
}

export function formatQubits(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  if (n < 1) return n.toFixed(2);
  return String(Math.round(n));
}
