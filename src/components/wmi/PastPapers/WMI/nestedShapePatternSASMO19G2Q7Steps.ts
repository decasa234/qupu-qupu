// nestedShapePatternSASMO19G2Q7Steps.ts
// Beat data for the SASMO-19-G2-Q7 explainer (nested-shape pattern rule).
//
// Rule: the INNER shape of step N becomes the OUTER shape of step N+1.
// Answer D: the missing 5th figure has outer=pentagon and inner=kite.

export type Lang = 'en' | 'id'

export interface NestedShapeBeat {
  /** Which pattern item (0-indexed, 0–3) to ring with an amber halo; null = none. */
  highlight: number | null
  /** Draw a right-pointing arrow from item `from` to item `from+1`; null = none. */
  arrowFrom: number | null
  /** Whether the answer item (pentagon + kite) is revealed in slot 4. */
  showAnswer: boolean
  /** Caption text for this beat. */
  caption: string
  /** Hold duration in ms before auto-advancing. */
  hold: number
  /** True on the final result beat (drives the green card). */
  result: boolean
}

export interface NestedShapeStoryboard {
  steps: NestedShapeBeat[]
  finalIndex: number
}

export function buildNestedShapeSteps(lang: Lang): NestedShapeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: NestedShapeBeat[] = [
    // Beat 0 — observe the pattern
    {
      highlight: null,
      arrowFrom: null,
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        'Each figure has an outer shape and an inner shape. Look for the rule!',
        'Tiap gambar punya bentuk luar dan bentuk dalam. Cari polanya!',
      ),
    },
    // Beat 1 — item 1 → 2: inner square becomes outer of next
    {
      highlight: 0,
      arrowFrom: 0,
      showAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        'Figure 1→2: the inner square becomes the outer shape of figure 2.',
        'Gambar 1→2: persegi di dalam menjadi bentuk luar gambar ke-2.',
      ),
    },
    // Beat 2 — item 2 → 3
    {
      highlight: 1,
      arrowFrom: 1,
      showAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        'Figure 2→3: the inner diamond becomes the outer shape of figure 3.',
        'Gambar 2→3: wajik di dalam menjadi bentuk luar gambar ke-3.',
      ),
    },
    // Beat 3 — item 3 → 4
    {
      highlight: 2,
      arrowFrom: 2,
      showAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        'Figure 3→4: the inner circle becomes the outer shape of figure 4.',
        'Gambar 3→4: lingkaran di dalam menjadi bentuk luar gambar ke-4.',
      ),
    },
    // Beat 4 — item 4 → 5 (reveal answer)
    {
      highlight: 3,
      arrowFrom: 3,
      showAnswer: true,
      hold: 2200,
      result: false,
      caption: t(
        'Figure 4→?: the inner pentagon becomes the outer shape — and the inner must be the starting kite.',
        'Gambar 4→?: segi lima di dalam menjadi bentuk luar — bentuk dalamnya harus layang-layang awal.',
      ),
    },
    // Beat 5 — result
    {
      highlight: null,
      arrowFrom: null,
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        'The missing shape is a pentagon containing a kite — answer D!',
        'Bentuk yang hilang adalah segi lima berisi layang-layang — jawaban D!',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
