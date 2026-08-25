import type { ScriptType } from "./types";
import { hexFromRand } from "./rng";

const BECH32 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

function bech32Body(rand: () => number, len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += BECH32[Math.floor(rand() * BECH32.length)]!;
  return s;
}

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function b58(rand: () => number, len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += B58[Math.floor(rand() * B58.length)]!;
  return s;
}

export function makeAddress(script: ScriptType, rand: () => number): string {
  switch (script) {
    case "p2pk":
      return `04${hexFromRand(rand, 32)}`;
    case "p2pkh":
      return `1${b58(rand, 33)}`;
    case "p2wpkh":
      return `bc1q${bech32Body(rand, 38)}`;
    case "p2tr":
      return `bc1p${bech32Body(rand, 58)}`;
    case "pq":
      return `bc1z${bech32Body(rand, 42)}`;
  }
}

export function makeTxid(rand: () => number): string {
  return hexFromRand(rand, 32);
}

const AMOUNTS = [0.015, 0.042, 0.1, 0.25, 0.5, 0.84, 1.2, 2.4, 3.6, 6.9, 12, 21];

export function randomAmount(rand: () => number): number {
  const base = AMOUNTS[Math.floor(rand() * AMOUNTS.length)]!;
  const jitter = 0.85 + rand() * 0.3;
  return Math.round(base * jitter * 1e8) / 1e8;
}

export function randomScript(rand: () => number): ScriptType {
  const r = rand();
  if (r < 0.08) return "p2pkh";
  if (r < 0.55) return "p2wpkh";
  if (r < 0.97) return "p2tr";
  return "p2pk";
}
