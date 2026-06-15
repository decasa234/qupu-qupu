/**
 * Storyboard builder for WMI-22F1A-Q25 — edge-matching jigsaw (Grade 1).
 *
 * A 3×3 frame. The TOP row is already placed; its bottom bumps (red, yellow,
 * yellow) are the colour clues sitting directly above the empty cells A, B, C.
 * Pick a piece for each cell so every TOUCHING edge carries the SAME colour;
 * pieces may be rotated. The solver-verified unique fit is
 *   A = piece 7 (turned ½), B = piece 2, C = piece 5 (turned ¼)
 * giving the 3-digit answer 725.
 *
 * The animation fills one cell per beat and NAMES the matching edge colour, so a
 * Grade-1 reader sees WHY each piece belongs. Captions are derived from PIECES +
 * SOLUTION (via `rotateEdges`) so they can never drift from the figure.
 *
 * Pure function — no Math.random, no Date. SSR-safe and deterministic.
 */

import type { Lang } from '../concepts/explainers/makeTenSteps'
import {
  PIECES,
  SOLUTION,
  rotateEdges,
  type EdgeColor,
  type Placement,
} from './EdgeMatch22G1Illustration'

export const EDGE_MATCH_G1_ANSWER = '725'

/** Which cells are filled on a beat (passed straight to `<EdgeBoard placed>`). */
export type EdgePlaced = Partial<Record<'A' | 'B' | 'C', Placement>>

export type EdgeMatchG1Phase = 'start' | 'cellA' | 'cellB' | 'cellC' | 'result'

export interface EdgeMatchG1Step {
  phase: EdgeMatchG1Phase
  /** Pieces dropped into A/B/C so far (cumulative). */
  placed: EdgePlaced
  /** Cell highlighted on this beat (a thin glow ring), or null on start/result. */
  focus?: 'A' | 'B' | 'C'
  caption: string
  hold: number
  result: boolean
}

export interface EdgeMatchG1Storyboard {
  answer: string
  steps: EdgeMatchG1Step[]
  finalIndex: number
}

// --- Verified edge colours, derived once from PIECES + SOLUTION -------------
// The top-row bumps above A / B / C (consistent with the unique solution).
const ABOVE_A: EdgeColor = 'red'
const ABOVE_B: EdgeColor = 'yellow'
const ABOVE_C: EdgeColor = 'yellow'

const eA = rotateEdges(PIECES[SOLUTION.A.piece], SOLUTION.A.rot) // top red, right yellow
const eB = rotateEdges(PIECES[SOLUTION.B.piece], SOLUTION.B.rot) // top yellow, left yellow, right outline
const eC = rotateEdges(PIECES[SOLUTION.C.piece], SOLUTION.C.rot) // top yellow, left outline

/** Kid-friendly colour name for a notch colour, bilingual. */
function colorName(c: EdgeColor, lang: Lang): string {
  const id = lang === 'id'
  switch (c) {
    case 'red':
      return id ? 'merah' : 'red'
    case 'yellow':
      return id ? 'kuning' : 'yellow'
    case 'outline':
      return id ? 'putih' : 'white'
    case 'striped':
      return id ? 'belang' : 'striped'
    default:
      return id ? 'rata' : 'flat'
  }
}

export function buildEdgeMatch22G1Steps(lang: Lang): EdgeMatchG1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const cn = (c: EdgeColor) => colorName(c, lang)

  const steps: EdgeMatchG1Step[] = [
    {
      phase: 'start',
      placed: {},
      hold: 2600,
      result: false,
      caption: t(
        'Rule: where two pieces TOUCH, the colours must MATCH. We may turn a piece around. The top row is already placed, so look at the colour bump hanging above each empty box A, B, C.',
        'Aturan: di tempat dua potongan BERSENTUHAN, warnanya harus SAMA. Potongan boleh diputar. Baris atas sudah terpasang, jadi lihat warna tonjolan yang menggantung di atas tiap kotak kosong A, B, C.',
      ),
    },
    {
      phase: 'cellA',
      placed: { A: SOLUTION.A },
      focus: 'A',
      hold: 2400,
      result: false,
      caption: t(
        `Box A has a ${cn(ABOVE_A)} bump above it. Turn piece ${SOLUTION.A.piece} so its top is ${cn(eA.top)} — now top to bottom they MATCH (${cn(ABOVE_A)} meets ${cn(eA.top)}). A = ${SOLUTION.A.piece}.`,
        `Di atas kotak A ada tonjolan ${cn(ABOVE_A)}. Putar potongan ${SOLUTION.A.piece} agar atasnya ${cn(eA.top)} — sekarang atas dan bawah COCOK (${cn(ABOVE_A)} ketemu ${cn(eA.top)}). A = ${SOLUTION.A.piece}.`,
      ),
    },
    {
      phase: 'cellB',
      placed: { A: SOLUTION.A, B: SOLUTION.B },
      focus: 'B',
      hold: 2400,
      result: false,
      caption: t(
        `Box B: above it is a ${cn(ABOVE_B)} bump, and piece ${SOLUTION.B.piece}'s top is ${cn(eB.top)} — match! Its left side is ${cn(eB.left)} and A's right side is ${cn(eA.right)} — match again. B = ${SOLUTION.B.piece}.`,
        `Kotak B: di atasnya tonjolan ${cn(ABOVE_B)}, dan atas potongan ${SOLUTION.B.piece} berwarna ${cn(eB.top)} — cocok! Sisi kirinya ${cn(eB.left)} dan sisi kanan A ${cn(eA.right)} — cocok lagi. B = ${SOLUTION.B.piece}.`,
      ),
    },
    {
      phase: 'cellC',
      placed: { A: SOLUTION.A, B: SOLUTION.B, C: SOLUTION.C },
      focus: 'C',
      hold: 2400,
      result: false,
      caption: t(
        `Box C: above it is a ${cn(ABOVE_C)} bump. Turn piece ${SOLUTION.C.piece} so its top is ${cn(eC.top)} — match! Its left side is ${cn(eC.left)} and B's right side is ${cn(eB.right)} — match. C = ${SOLUTION.C.piece}.`,
        `Kotak C: di atasnya tonjolan ${cn(ABOVE_C)}. Putar potongan ${SOLUTION.C.piece} agar atasnya ${cn(eC.top)} — cocok! Sisi kirinya ${cn(eC.left)} dan sisi kanan B ${cn(eB.right)} — cocok. C = ${SOLUTION.C.piece}.`,
      ),
    },
    {
      phase: 'result',
      placed: { A: SOLUTION.A, B: SOLUTION.B, C: SOLUTION.C },
      hold: 0,
      result: true,
      caption: t(
        `Read the boxes left to right: A = ${SOLUTION.A.piece}, B = ${SOLUTION.B.piece}, C = ${SOLUTION.C.piece} → ${EDGE_MATCH_G1_ANSWER}.`,
        `Baca kotak dari kiri ke kanan: A = ${SOLUTION.A.piece}, B = ${SOLUTION.B.piece}, C = ${SOLUTION.C.piece} → ${EDGE_MATCH_G1_ANSWER}.`,
      ),
    },
  ]

  return {
    answer: EDGE_MATCH_G1_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
