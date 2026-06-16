/**
 * WMI-22F3A-Q3 — Nested Triangle storyboard builder.
 *
 * Rule: read digit labels from the most-nested triangle outward,
 * then concatenate to form the number.
 *
 *   Panel 1 — one triangle labelled 4  →  4
 *   Panel 2 — inner "1", outer "2"     →  12
 *   Panel 3 — innermost "2", middle "5", outer "6"  →  256
 *
 * Pure function — no side effects, SSR-safe, deterministic.
 */

export type Lang = 'en' | 'id'

/**
 * Which panel + which layer is currently highlighted.
 *
 *   panel:  1 | 2 | 3   — which of the three figures is in focus
 *   layer:  'outer' | 'mid' | 'inner'  — which ring is being pointed at
 *   built:  the concatenated string built so far (shown as a running total)
 */
export type NestedTriPhase =
  | 'intro-p1'
  | 'intro-p2-inner'
  | 'intro-p2-outer'
  | 'rule'
  | 'p3-inner'
  | 'p3-mid'
  | 'p3-outer'
  | 'answer'

export interface NestedTriStep {
  phase: NestedTriPhase
  /** Which panel to show prominently (1-3, or 0 = rule slide, all panels dim). */
  focusPanel: 0 | 1 | 2 | 3
  /**
   * For the focused panel, which layer is being read this beat.
   * undefined = none highlighted (intro / rule / answer beats).
   */
  highlightLayer?: 'inner' | 'mid' | 'outer'
  /** Running concatenated string built so far for panel 3 ('' until p3 beats). */
  runningP3: string
  /** Whether the final answer badge should appear. */
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface NestedTriStoryboard {
  answer: number
  steps: NestedTriStep[]
  finalIndex: number
}

export function buildNestedTri22G3Steps(lang: Lang): NestedTriStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: NestedTriStep[] = [
    // Beat 0 — panel 1: one triangle, label 4 → the number is just "4"
    {
      phase: 'intro-p1',
      focusPanel: 1,
      highlightLayer: 'outer',
      runningP3: '',
      showAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        'Panel 1 has one triangle with the number 4 inside. One layer → just read "4".',
        'Panel 1 punya satu segitiga berlabel 4. Satu lapis → langsung baca "4".',
      ),
    },
    // Beat 1 — panel 2: inner triangle "1" is the deepest — read it first
    {
      phase: 'intro-p2-inner',
      focusPanel: 2,
      highlightLayer: 'inner',
      runningP3: '',
      showAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        'Panel 2 has a triangle inside another. The inner triangle "1" is the most nested — read it first.',
        'Panel 2 punya segitiga di dalam segitiga. Segitiga dalam "1" paling dalam — baca duluan.',
      ),
    },
    // Beat 2 — panel 2: then read the outer "2" → "12"
    {
      phase: 'intro-p2-outer',
      focusPanel: 2,
      highlightLayer: 'outer',
      runningP3: '',
      showAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        'Then read the outer triangle "2". Put the digits together: "1" + "2" = 12.',
        'Lalu baca segitiga luar "2". Gabung digitnya: "1" + "2" = 12.',
      ),
    },
    // Beat 3 — state the rule
    {
      phase: 'rule',
      focusPanel: 0,
      runningP3: '',
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Rule: always start at the innermost triangle, then work outward. Stick the digits together in that order.',
        'Aturan: mulai dari segitiga paling dalam, lalu ke luar satu per satu. Tulis digitnya berurutan.',
      ),
    },
    // Beat 4 — panel 3: find the innermost (double-outlined) triangle "2"
    {
      phase: 'p3-inner',
      focusPanel: 3,
      highlightLayer: 'inner',
      runningP3: '2',
      showAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        'Panel 3: the double-outlined triangle is the innermost. Its label is 2 → start with "2".',
        'Panel 3: segitiga garis ganda adalah yang paling dalam. Labelnya 2 → mulai dengan "2".',
      ),
    },
    // Beat 5 — panel 3: next layer, single-outline triangle "5" → "25"
    {
      phase: 'p3-mid',
      focusPanel: 3,
      highlightLayer: 'mid',
      runningP3: '25',
      showAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        'The next layer out is the single triangle "5". Append it: "2" + "5" = "25".',
        'Lapis berikutnya adalah segitiga tunggal "5". Tambahkan: "2" + "5" = "25".',
      ),
    },
    // Beat 6 — panel 3: outer big triangle "6" → "256" (final answer)
    {
      phase: 'p3-outer',
      focusPanel: 3,
      highlightLayer: 'outer',
      runningP3: '256',
      showAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        'The big outer triangle is "6". Append it: "25" + "6" = "256".',
        'Segitiga besar paling luar adalah "6". Tambahkan: "25" + "6" = "256".',
      ),
    },
    // Beat 7 — answer
    {
      phase: 'answer',
      focusPanel: 3,
      runningP3: '256',
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        'The third figure equals 256. Answer: D.',
        'Figur ketiga bernilai 256. Jawaban: D.',
      ),
    },
  ]

  return {
    answer: 256,
    steps,
    finalIndex: steps.length - 1,
  }
}
