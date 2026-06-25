// HKIMO-20-P2H-Q20 — beat-by-beat storyboard for the polygon-ear sequence.
//
// Pattern: each figure adds one triangular ear to a pentagon base.
//   Figure 1 → 6 edges, Figure 2 → 7 edges, Figure 3 → 8 edges.
//   General: figure n → n + 5 edges.
//   Figure 6 → 6 + 5 = 11 edges (the answer).
//
// Teaching walk:
//   0. intro   — show all three figures; read the counts.
//   1. pattern — observe +1 per step; 6, 7, 8, …
//   2. formula — figure n has n + 5 edges (show formula).
//   3. answer  — figure 6: 6 + 5 = 11.

export type Lang = 'en' | 'id'

export type EarPhase = 'intro' | 'pattern' | 'formula' | 'answer'

export interface EarBeat {
  phase: EarPhase
  /** Which figure panel to highlight (null = none, 'all' = all three). */
  highlightPanel: 1 | 2 | 3 | 'all' | null
  showFormula: boolean
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface EarStoryboard {
  steps: EarBeat[]
  finalIndex: number
}

// ── seed quantities (bound to breakdown.quantities) ───────────────────────────
export const EDGE_1 = 6
export const EDGE_2 = 7
export const EDGE_3 = 8
export const STEP_SIZE = 1
export const FIGURE_N = 6
export const ANSWER = 11  // FIGURE_N + 5

// ── storyboard builder ────────────────────────────────────────────────────────

export function buildPolyEarSeqHK20P2Q20Steps(lang: Lang): EarStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: EarBeat[] = [
    {
      phase: 'intro',
      highlightPanel: 'all',
      showFormula: false,
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        `Three figures given: Figure 1 has ${EDGE_1} edges, Figure 2 has ${EDGE_2} edges, Figure 3 has ${EDGE_3} edges.`,
        `Tiga bangun diberikan: Bangun 1 punya ${EDGE_1} sisi, Bangun 2 punya ${EDGE_2} sisi, Bangun 3 punya ${EDGE_3} sisi.`,
      ),
    },
    {
      phase: 'pattern',
      highlightPanel: 'all',
      showFormula: false,
      showAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        `Pattern: ${EDGE_1}, ${EDGE_2}, ${EDGE_3}, … — each figure adds +${STEP_SIZE} edge (one new triangular ear per step).`,
        `Pola: ${EDGE_1}, ${EDGE_2}, ${EDGE_3}, … — setiap bangun bertambah +${STEP_SIZE} sisi (satu "telinga" segitiga baru per langkah).`,
      ),
    },
    {
      phase: 'formula',
      highlightPanel: null,
      showFormula: true,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `General rule: Figure n has ${EDGE_1} + (n − 1) = n + 5 edges.`,
        `Rumus umum: Bangun ke-n punya ${EDGE_1} + (n − 1) = n + 5 sisi.`,
      ),
    },
    {
      phase: 'answer',
      highlightPanel: null,
      showFormula: true,
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `Figure ${FIGURE_N}: ${FIGURE_N} + 5 = ${ANSWER} edges. Answer: ${ANSWER}.`,
        `Bangun ke-${FIGURE_N}: ${FIGURE_N} + 5 = ${ANSWER} sisi. Jawaban: ${ANSWER}.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
