import type { Scenario, SimConfig } from "./types";

const BASE: Omit<SimConfig, "pubkeyStartsExposed" | "postQuantum" | "userScript" | "toffoliHz" | "logicalQubits"> = {
  physicalPerLogical: 1000,
  toffoliGates: 90_000_000,
  meanBlockSec: 600,
  userAmountBtc: 12.5,
  attackFeeMultiplier: 3.2,
};

export const SCENARIOS: Scenario[] = [
  {
    id: "mempool-window",
    index: "01",
    title: "The mempool window",
    kicker: "Hashed address, first spend",
    summary:
      "You broadcast a spend from a hashed address. The signature reveals the public key. A fault-tolerant machine starts Shor’s algorithm only after that moment.",
    detail:
      "P2WPKH and P2PKH hide the public key behind a hash until you spend. The dangerous interval is the time your transaction sits unconfirmed. If a quantum computer recovers the key before the next block, it can sign a competing transaction with a higher fee and steal the same coins.",
    takeaway:
      "Even with the 1,200-logical-qubit estimate, the attacker must finish inside one block interval. Slow logical clocks lose this race; fast ones may not.",
    likely: "confirmed",
    config: {
      ...BASE,
      logicalQubits: 1200,
      toffoliHz: 8_000,
      pubkeyStartsExposed: false,
      postQuantum: false,
      userScript: "p2wpkh",
    },
  },
  {
    id: "address-reuse",
    index: "02",
    title: "Address reuse",
    kicker: "Public key already on-chain",
    summary:
      "This address has been spent from before. The public key is already public. The adversary can start cracking before you even broadcast.",
    detail:
      "Address reuse is the sharpest mempool failure mode. Once a hashed address has been spent, every remaining UTXO at that key is as exposed as a pay-to-pubkey output. A quantum adversary does not need to wait for your next signature — the clock is already running.",
    takeaway:
      "Never reuse addresses. Exposure begins at the first spend, not the second. This is true today for privacy, and decisive under a cryptographically relevant quantum computer.",
    likely: "stolen",
    config: {
      ...BASE,
      logicalQubits: 1200,
      toffoliHz: 80_000,
      pubkeyStartsExposed: true,
      postQuantum: false,
      userScript: "p2wpkh",
    },
  },
  {
    id: "legacy-p2pk",
    index: "03",
    title: "Legacy pay-to-pubkey",
    kicker: "Key visible before any spend",
    summary:
      "Some early outputs pay directly to a public key. There is no hash hiding it. Anyone can start the attack as soon as the UTXO exists.",
    detail:
      "Pay-to-pubkey (P2PK) was used in the coinbase of early blocks and in some satoshi-era payments. The locking script contains the raw key. A quantum attacker does not need a mempool transaction at all — they can derive the private key at leisure and sweep the coins whenever the machine is ready.",
    takeaway:
      "Unhashed keys have no mempool window. They are simply a standing target. Migration off P2PK is a quantum-readiness issue, not a fee issue.",
    likely: "stolen",
    config: {
      ...BASE,
      logicalQubits: 1200,
      toffoliHz: 80_000,
      pubkeyStartsExposed: true,
      postQuantum: false,
      userScript: "p2pk",
    },
  },
  {
    id: "today",
    index: "04",
    title: "Today’s machines",
    kicker: "Willow-class, ~100 physical qubits",
    summary:
      "Current superconducting chips have on the order of a hundred physical qubits. They cannot host 1,200 error-corrected logical qubits. Shor’s algorithm does not run.",
    detail:
      "A logical qubit is a highly stable, error-corrected unit. Surface-code estimates still put thousands of physical qubits behind each logical qubit. Google’s Willow-class devices are a remarkable physics result and still three to four orders of magnitude short of a cryptographically relevant machine. This scenario is the reality check.",
    takeaway:
      "Funds are not at risk from this attack today. The estimate is a planning number, not a countdown clock. Hardware at this scale is likely decades away.",
    likely: "hardware-short",
    config: {
      ...BASE,
      logicalQubits: 0,
      toffoliHz: 0,
      physicalPerLogical: 1000,
      pubkeyStartsExposed: false,
      postQuantum: false,
      userScript: "p2wpkh",
    },
  },
  {
    id: "fast-clock",
    index: "05",
    title: "Fast-clock fault tolerance",
    kicker: "1,200 logical qubits, high Toffoli rate",
    summary:
      "A hypothetical fault-tolerant machine runs 90 million Toffoli gates fast enough to finish inside one Bitcoin block. The mempool becomes a race the network can lose.",
    detail:
      "The research figure is 1,200 logical qubits and 90 million Toffoli gates to break secp256k1. Time-to-solution then depends on the logical clock. At a high Toffoli throughput, key recovery can complete in minutes — while a typical spend still sits in the public mempool waiting for the next block.",
    takeaway:
      "If a cryptographically relevant machine is also a fast one, waiting for on-chain confirmation is not a defense. The industry needs post-quantum signatures before that machine exists.",
    likely: "stolen",
    config: {
      ...BASE,
      logicalQubits: 1200,
      toffoliHz: 250_000,
      pubkeyStartsExposed: false,
      postQuantum: false,
      userScript: "p2wpkh",
    },
  },
  {
    id: "post-quantum",
    index: "06",
    title: "Post-quantum signatures",
    kicker: "ML-DSA closes the window",
    summary:
      "Replace ECDSA/Schnorr with a NIST post-quantum scheme. Shor’s algorithm no longer yields the private key. The mempool race ends.",
    detail:
      "ML-DSA (Dilithium) and SPHINCS+ are standardized. They produce larger signatures and need a careful migration for Bitcoin and other chains, but they are not broken by the elliptic-curve attack in this simulator. A quantum adversary watching the mempool learns nothing it can spend.",
    takeaway:
      "The 1,200-qubit estimate is an argument to migrate, not a reason to panic. Post-quantum signatures remove this class of mempool attack entirely.",
    likely: "pq-safe",
    config: {
      ...BASE,
      logicalQubits: 1200,
      toffoliHz: 250_000,
      pubkeyStartsExposed: false,
      postQuantum: true,
      userScript: "pq",
    },
  },
];

export function scenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export const RESEARCH = {
  source: "Google Quantum AI (reported estimate)",
  logicalQubits: 1200,
  toffoliGates: 90_000_000,
  previousLogical: "2,000–4,000",
  physicalPerLogical: 1000,
  physicalEstimate: 1_200_000,
  willowPhysical: 100,
  curve: "secp256k1",
} as const;
