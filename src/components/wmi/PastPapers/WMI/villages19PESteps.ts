// IKMC-23-PE-Q19 — storyboard for the five-village loop map animation.
//
// Question: "The map shows five villages A, B, C, D and E, and the distances
// in kilometres between them. Only two villages are the same distance apart
// no matter which route you choose. Which are these two villages?"
// Answer: A (B and E)
//
// MAP (single closed loop, no shortcuts):
//   A–B: 7 km  |  B–C: 2 km  |  C–D: 6 km  |  D–E: 4 km  |  E–A: 5 km
//   Total loop = 24 km.
//
// METHOD: For any pair X and Y on a single closed loop, the two routes sum to
// the total loop length (24 km). They are EQUAL only when each route = 24/2 = 12 km.
// So we need: shorter arc = 12 km (and longer arc = 12 km automatically).
//
// CHECK EACH ANSWER PAIR (shorter arc first):
//   A (B and E): B→A→E = 7+5 = 12 | B→C→D→E = 2+6+4 = 12  ✓ EQUAL
//   B (B and D): B→C→D = 2+6 = 8  | B→A→E→D = 7+5+4 = 16  ✗ unequal
//   C (C and E): C→D→E = 6+4 = 10 | C→B→A→E = 2+7+5 = 14  ✗ unequal
//   D (A and C): A→B→C = 7+2 = 9  | A→E→D→C = 5+4+6 = 15  ✗ unequal
//   E (A and D): A→B→C→D = 7+2+6 = 15 | A→E→D = 5+4 = 9   ✗ unequal
//
// ONLY B and E have equal-distance routes (both 12 km). Answer: A.
//
// Beat sequence:
//   0. Intro        — plain map, explain the puzzle goal.
//   1. Try B&D      — light route B→C→D (8) vs B→A→E→D (16) → reject ✗
//   2. Try C&E      — light route C→D→E (10) vs C→B→A→E (14) → reject ✗
//   3. Try B&E (1)  — light short route B→A→E = 7+5 = 12
//   4. Try B&E (2)  — light long route B→C→D→E = 2+6+4 = 12  → equal! ✓
//   5. Result       — both routes lit; B and E in green; confirm Answer A.
//
// Pure (lang) → storyboard. No Math.random, no Date — SSR-safe.

import { edgeKey } from './Villages19PEIllustration'

export type Lang = 'en' | 'id'

// ── Road distances (km) ───────────────────────────────────────────────────────

export const DISTANCES: Record<string, number> = {
  'A-B': 7,
  'B-C': 2,
  'C-D': 6,
  'D-E': 4,
  'A-E': 5,
}

/** Return the km distance between two adjacent villages (either order). */
export function km(a: string, b: string): number {
  const key = edgeKey(a, b)
  const d = DISTANCES[key]
  if (d == null) throw new Error(`no road between ${a} and ${b}`)
  return d
}

/** Sum distances along a trail of adjacent-village ids. */
export function pathKm(trail: string[]): number {
  let sum = 0
  for (let i = 0; i + 1 < trail.length; i++) sum += km(trail[i], trail[i + 1])
  return sum
}

// ── Named trails ─────────────────────────────────────────────────────────────
// B and E — the ANSWER pair (both routes = 12 km)
export const ROUTE_BE_SHORT = ['B', 'A', 'E']        // B→A→E = 7+5 = 12
export const ROUTE_BE_LONG  = ['B', 'C', 'D', 'E']   // B→C→D→E = 2+6+4 = 12

// B and D — one wrong pair (routes: 8 vs 16)
export const ROUTE_BD_SHORT = ['B', 'C', 'D']         // 2+6 = 8
export const ROUTE_BD_LONG  = ['B', 'A', 'E', 'D']    // 7+5+4 = 16

// C and E — another wrong pair (routes: 10 vs 14)
export const ROUTE_CE_SHORT = ['C', 'D', 'E']         // 6+4 = 10
export const ROUTE_CE_LONG  = ['C', 'B', 'A', 'E']    // 2+7+5 = 14

// ── Step type ─────────────────────────────────────────────────────────────────

export interface Villages19PEStep {
  /** Edges to colour amber on the map (current route under exam). */
  highlightEdges: string[]
  /** Edges to colour red (rejected route). */
  rejectEdges: string[]
  /** Village ids to tint amber (trail endpoints for current candidate). */
  highlightNodes: string[]
  /** Village ids to show green (confirmed answer). */
  answerNodes: string[]
  /** Short badge label (km arithmetic), or null on intro / result. */
  badge: string | null
  /** Whether the badge should show ✗ (reject). */
  reject: boolean
  /** Whether the badge should show ✓ (final result). */
  result: boolean
  caption: string
  hold: number
}

export interface Villages19PEStoryboard {
  steps: Villages19PEStep[]
  finalIndex: number
}

// ── Helper: trail → edge key set ──────────────────────────────────────────────
function trailEdges(trail: string[]): string[] {
  const keys: string[] = []
  for (let i = 0; i + 1 < trail.length; i++) {
    keys.push(edgeKey(trail[i], trail[i + 1]))
  }
  return keys
}

// ── Builder ───────────────────────────────────────────────────────────────────

export function buildVillages19PESteps(lang: Lang): Villages19PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // pre-compute km values (anti-drift: all come from the single DISTANCES table)
  const ab = km('A', 'B') // 7
  const bc = km('B', 'C') // 2
  const cd = km('C', 'D') // 6
  const de = km('D', 'E') // 4
  const ea = km('E', 'A') // 5
  const total = ab + bc + cd + de + ea // 24

  const beShort = pathKm(ROUTE_BE_SHORT) // 12
  const beLong  = pathKm(ROUTE_BE_LONG)  // 12
  const bdShort = pathKm(ROUTE_BD_SHORT) // 8
  const bdLong  = pathKm(ROUTE_BD_LONG)  // 16
  const ceShort = pathKm(ROUTE_CE_SHORT) // 10
  const ceLong  = pathKm(ROUTE_CE_LONG)  // 14

  const steps: Villages19PEStep[] = [
    // ── 0: Intro ────────────────────────────────────────────────────────────
    {
      highlightEdges: [],
      rejectEdges: [],
      highlightNodes: [],
      answerNodes: [],
      badge: null,
      reject: false,
      result: false,
      hold: 2600,
      caption: t(
        `The five villages form a single loop of ${total} km. Two villages have equal distances in BOTH directions — find them by checking each pair.`,
        `Lima desa membentuk satu lingkaran ${total} km. Dua desa punya jarak yang SAMA dari dua arah — temukan dengan memeriksa setiap pasangan.`,
      ),
    },

    // ── 1: Try B & D (short route 8, long route 16) → reject ───────────────
    {
      highlightEdges: trailEdges(ROUTE_BD_SHORT),
      rejectEdges: trailEdges(ROUTE_BD_LONG),
      highlightNodes: ['B', 'D'],
      answerNodes: [],
      badge: t(`B & D: ${bdShort} km vs ${bdLong} km ✗`, `B & D: ${bdShort} km vs ${bdLong} km ✗`),
      reject: true,
      result: false,
      hold: 2200,
      caption: t(
        `B & D: route B→C→D = ${bc}+${cd} = ${bdShort} km, but B→A→E→D = ${ab}+${ea}+${de} = ${bdLong} km. Not equal ✗`,
        `B & D: rute B→C→D = ${bc}+${cd} = ${bdShort} km, tapi B→A→E→D = ${ab}+${ea}+${de} = ${bdLong} km. Tidak sama ✗`,
      ),
    },

    // ── 2: Try C & E (short 10, long 14) → reject ──────────────────────────
    {
      highlightEdges: trailEdges(ROUTE_CE_SHORT),
      rejectEdges: trailEdges(ROUTE_CE_LONG),
      highlightNodes: ['C', 'E'],
      answerNodes: [],
      badge: t(`C & E: ${ceShort} km vs ${ceLong} km ✗`, `C & E: ${ceShort} km vs ${ceLong} km ✗`),
      reject: true,
      result: false,
      hold: 2200,
      caption: t(
        `C & E: route C→D→E = ${cd}+${de} = ${ceShort} km, but C→B→A→E = ${bc}+${ab}+${ea} = ${ceLong} km. Not equal ✗`,
        `C & E: rute C→D→E = ${cd}+${de} = ${ceShort} km, tapi C→B→A→E = ${bc}+${ab}+${ea} = ${ceLong} km. Tidak sama ✗`,
      ),
    },

    // ── 3: Try B & E — short route B→A→E = 12 ──────────────────────────────
    {
      highlightEdges: trailEdges(ROUTE_BE_SHORT),
      rejectEdges: [],
      highlightNodes: ['B', 'E'],
      answerNodes: [],
      badge: t(`B & E route 1: ${ab}+${ea} = ${beShort} km`, `B & E rute 1: ${ab}+${ea} = ${beShort} km`),
      reject: false,
      result: false,
      hold: 2200,
      caption: t(
        `B & E: first route B→A→E = ${ab}+${ea} = ${beShort} km. Now check the other direction…`,
        `B & E: rute pertama B→A→E = ${ab}+${ea} = ${beShort} km. Sekarang cek arah sebaliknya…`,
      ),
    },

    // ── 4: Try B & E — long route B→C→D→E = 12 → equal! ───────────────────
    {
      highlightEdges: trailEdges(ROUTE_BE_LONG),
      rejectEdges: [],
      highlightNodes: ['B', 'E'],
      answerNodes: [],
      badge: t(`B & E route 2: ${bc}+${cd}+${de} = ${beLong} km ✓`, `B & E rute 2: ${bc}+${cd}+${de} = ${beLong} km ✓`),
      reject: false,
      result: false,
      hold: 2400,
      caption: t(
        `Other route B→C→D→E = ${bc}+${cd}+${de} = ${beLong} km. Both routes give ${beShort} km — EQUAL!`,
        `Rute lain B→C→D→E = ${bc}+${cd}+${de} = ${beLong} km. Kedua rute = ${beShort} km — SAMA!`,
      ),
    },

    // ── 5: Result — B and E green ───────────────────────────────────────────
    {
      highlightEdges: [...trailEdges(ROUTE_BE_SHORT), ...trailEdges(ROUTE_BE_LONG)],
      rejectEdges: [],
      highlightNodes: [],
      answerNodes: ['B', 'E'],
      badge: t(`B and E: ${beShort} km = ${beLong} km ✓`, `B dan E: ${beShort} km = ${beLong} km ✓`),
      reject: false,
      result: true,
      hold: 0,
      caption: t(
        `Villages B and E are always ${beShort} km apart — no matter which route! Answer: A (B and E).`,
        `Desa B dan E selalu berjarak ${beShort} km — rute mana pun! Jawaban: A (B dan E).`,
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
