# Mempool Race

Interactive simulator of quantum attacks on Bitcoin’s public mempool.

The briefing uses a reported Google Quantum AI resource estimate: **1,200 logical qubits** and **90 million Toffoli gates** to break secp256k1. A logical qubit is error-corrected. At roughly a thousand physical qubits per logical qubit, that machine is on the order of a million physical qubits — far beyond today’s devices.

This is an educational timeline, not an attack recipe.

## Scenarios

| # | Scenario | What it shows |
|---|---|---|
| 01 | The mempool window | The public key is revealed only when you spend. Slow clocks usually lose to the next block. |
| 02 | Address reuse | The key is already on-chain. The adversary has a head start. |
| 03 | Legacy pay-to-pubkey | No hash hiding the key. The UTXO is a standing target. |
| 04 | Today’s machines | Willow-class ~100 physical qubits. Shor never starts. |
| 05 | Fast-clock fault tolerance | 1,200 logical qubits at a high Toffoli rate. The mempool can lose. |
| 06 | Post-quantum signatures | ML-DSA. The window closes. |

Broadcast a spend, watch confirmation race key recovery, then publish a situation report.

## Run locally

```bash
npm install
npm run dev
```

The app listens on port 8080.

```bash
npm run build
npm run preview
```

## Stack

React 19, TanStack Start, Tailwind v4, Zustand-free React state for the sim engine.

## License

Educational use. Hardware, clocks, and resource estimates are simplified so the race is visible in seconds.
