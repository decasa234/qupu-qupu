// Animation steps for IKMC-19-PE-Q3 — necklace pattern matching.
//
// Strategy:
//   1. Show the necklace and identify its repeating unit.
//   2. Read off the 4-bead unit: white → black → black → gray.
//   3. Check each option A–E against the necklace sequence.
//   4. Land on C (white, black, black, gray = one full repeating unit).

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { NECKLACE_CYCLE, OPTIONS_N3 } from './Necklace3Illustration'
import type { BeadColor } from './Necklace3Illustration'

export type NecklacePhase = 'intro' | 'unit' | 'check' | 'result'

export interface NecklaceStep {
  phase: NecklacePhase
  /** Which option label is currently being checked, or null. */
  checkLabel: 'A' | 'B' | 'C' | 'D' | 'E' | null
  /** Whether the checked option passes or fails, or null if not yet decided. */
  checkPass: boolean | null
  /** Indices within the necklace to highlight (the repeating unit on show/unit phases). */
  highlightIndices: number[]
  /** Which answer label to crown as correct (result phase). */
  answerLabel: 'A' | 'B' | 'C' | 'D' | 'E' | null
  caption: string
  hold: number
  result: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function t(lang: Lang, en: string, id: string): string {
  return lang === 'id' ? id : en
}

function colorName(c: BeadColor, lang: Lang): string {
  if (lang === 'id') {
    return c === 'W' ? 'putih' : c === 'B' ? 'hitam' : 'abu-abu'
  }
  return c === 'W' ? 'white' : c === 'B' ? 'black' : 'gray'
}

function cycleDesc(lang: Lang): string {
  const names = NECKLACE_CYCLE.map((c) => colorName(c, lang))
  return names.join(', ')
}

/**
 * Check whether `seq` appears as a consecutive sub-sequence (cyclic) in the
 * infinite repetition of NECKLACE_CYCLE.
 */
function isValidSegment(seq: BeadColor[]): boolean {
  const cycle = NECKLACE_CYCLE
  const L = seq.length
  const C = cycle.length
  // Try every starting position within one cycle (wrap around)
  for (let start = 0; start < C; start++) {
    let ok = true
    for (let j = 0; j < L; j++) {
      if (seq[j] !== cycle[(start + j) % C]) {
        ok = false
        break
      }
    }
    if (ok) return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Storyboard builder
// ---------------------------------------------------------------------------

export interface NecklaceStoryboard {
  steps: NecklaceStep[]
  finalIndex: number
}

const LABELS: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E']

/** Indices of the first repeating-unit beads to highlight (0-based, 12 total). */
const UNIT_INDICES = [0, 1, 2, 3]  // first occurrence of the 4-bead unit

export function buildNecklace3Steps(lang: Lang): NecklaceStoryboard {
  const steps: NecklaceStep[] = []

  // Beat 0 — intro: show the full necklace
  steps.push({
    phase: 'intro',
    checkLabel: null,
    checkPass: null,
    highlightIndices: [],
    answerLabel: null,
    hold: 1600,
    result: false,
    caption: t(
      lang,
      'Look at the circular necklace — the beads repeat in a fixed order.',
      'Lihat kalung melingkar ini — manik-maniknya berulang dalam urutan tetap.',
    ),
  })

  // Beat 1 — highlight one repeating unit
  steps.push({
    phase: 'unit',
    checkLabel: null,
    checkPass: null,
    highlightIndices: UNIT_INDICES,
    answerLabel: null,
    hold: 2000,
    result: false,
    caption: t(
      lang,
      `The repeating unit is: ${cycleDesc(lang)} — then it starts over.`,
      `Unit yang berulang adalah: ${cycleDesc(lang)} — lalu dimulai lagi.`,
    ),
  })

  // Beats 2–6 — check each option A–E
  for (const label of LABELS) {
    const beads = OPTIONS_N3[label]
    const pass = isValidSegment(beads)
    const beadNames = beads.map((c) => colorName(c, lang)).join(', ')
    steps.push({
      phase: 'check',
      checkLabel: label,
      checkPass: pass,
      highlightIndices: [],
      answerLabel: null,
      hold: pass ? 1800 : 1200,
      result: false,
      caption: t(
        lang,
        `${label}: ${beadNames} — ${pass ? 'found in the necklace ✓' : 'NOT found in the necklace ✗'}`,
        `${label}: ${beadNames} — ${pass ? 'ada di kalung ✓' : 'TIDAK ada di kalung ✗'}`,
      ),
    })
  }

  // Beat 7 — result
  steps.push({
    phase: 'result',
    checkLabel: 'C',
    checkPass: true,
    highlightIndices: [],
    answerLabel: 'C',
    hold: 0,
    result: true,
    caption: t(
      lang,
      'Only C (white, black, black, gray) is a consecutive part of the necklace → answer C.',
      'Hanya C (putih, hitam, hitam, abu-abu) yang merupakan bagian berurutan dari kalung → jawaban C.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
