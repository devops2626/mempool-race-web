export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickSeed(): number {
  return (Math.floor(Math.random() * 0xfffffffe) + 1) >>> 0;
}

export function hexFromRand(rand: () => number, bytes: number): string {
  let out = "";
  for (let i = 0; i < bytes; i++) {
    out += Math.floor(rand() * 256)
      .toString(16)
      .padStart(2, "0");
  }
  return out;
}

export function exponential(rand: () => number, mean: number): number {
  const u = Math.min(0.999999, Math.max(1e-9, rand()));
  return -Math.log(1 - u) * mean;
}

export function range(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}

export function intRange(rand: () => number, min: number, max: number): number {
  return Math.floor(range(rand, min, max + 1));
}
