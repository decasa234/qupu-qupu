// SEAMOX-20-A-Q19 — storyboard for the shape-analogy explainer.
//
// Question: plain diamond → square with diagonals (X).
//           Subdivided triangle (4 small triangles) → which of A/B/C/D?
// Answer: B — plain inverted triangle.
//
// Transformation rule:
//   The diamond is a square rotated 45°. Rotating it back 45° gives the
//   axis-aligned square, and its lines of symmetry (diagonals = X) appear.
//   Equivalently: the outer shape "stabilises" and its axis-of-symmetry lines emerge.
//   Applying to the upward subdivided triangle: rotate 180° (flip vertically) and
//   take only the plain outline — the subdivisions are the source's annotation,
//   but the result returns to a clean shape.
//
// Teaching beats:
//   0. observe   — look at the example pair: diamond → square with X.
//   1. rule      — the shape is flipped / rotated and shows clean symmetry lines.
//   2. apply     — apply to the triangle: it flips to point downward (inverted).
//   3. eliminate — A still has subdivisions (extra lines), C and D add new lines
//                  not in the rule; B is the plain inverted triangle.
//   4. result    — answer B.
//
// Pure builder: (lang) => storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type AnalPhaseId =
  | 'observe'
  | 'rule'
  | 'apply'
  | 'eliminate'
  | 'result'

export interface AnalBeat {
  phase: AnalPhaseId
  /** Which option label is highlighted (null = none) */
  activeOption: 'A' | 'B' | 'C' | 'D' | null
  /** Is the highlighted option the correct answer? */
  isAnswer: boolean
  /** Whether to show a cross over the active option (wrong) */
  showCross: boolean
  /** Caption text */
  caption: string
  /** Auto-hold duration ms (0 = final / manual) */
  hold: number
  /** True only on the result beat */
  result: boolean
}

export interface AnalStoryboard {
  steps: AnalBeat[]
  finalIndex: number
}

export function buildShapeAnalogy20A19Steps(lang: Lang): AnalStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AnalBeat[] = [
    // Beat 0 — observe the example pair
    {
      phase: 'observe',
      activeOption: null,
      isAnswer: false,
      showCross: false,
      hold: 2400,
      result: false,
      caption: t(
        'Look at the first row: a plain diamond → a square with two diagonals (X inside).',
        'Perhatikan baris pertama: berlian polos → persegi dengan dua diagonal (pola X di dalamnya).',
      ),
    },

    // Beat 1 — identify the rule
    {
      phase: 'rule',
      activeOption: null,
      isAnswer: false,
      showCross: false,
      hold: 2600,
      result: false,
      caption: t(
        'The rule: rotate the shape 180° (flip it) — it goes from pointing up/diagonal to pointing down/straight. The inner details reset to the plain outline.',
        'Aturan: putar bentuk 180° (balik) — dari menunjuk ke atas/diagonal menjadi menunjuk ke bawah/lurus. Detail dalam hilang, kembali ke garis luar saja.',
      ),
    },

    // Beat 2 — apply to the subdivided triangle
    {
      phase: 'apply',
      activeOption: null,
      isAnswer: false,
      showCross: false,
      hold: 2400,
      result: false,
      caption: t(
        'Apply to the upward subdivided triangle: flip it 180° → it now points downward, and the inner subdivisions vanish, leaving just the plain outline.',
        'Terapkan pada segitiga ke atas yang dibagi: balik 180° → sekarang menunjuk ke bawah, subdivisi dalam hilang, tersisa hanya garis luar polos.',
      ),
    },

    // Beat 3 — eliminate wrong options
    {
      phase: 'eliminate',
      activeOption: 'A',
      isAnswer: false,
      showCross: true,
      hold: 2000,
      result: false,
      caption: t(
        'A still shows subdivisions (extra interior lines) — that contradicts the rule. Eliminate A.',
        'A masih menampilkan subdivisi (garis dalam ekstra) — bertentangan dengan aturan. Coret A.',
      ),
    },

    // Beat 4 — eliminate C
    {
      phase: 'eliminate',
      activeOption: 'C',
      isAnswer: false,
      showCross: true,
      hold: 2000,
      result: false,
      caption: t(
        'C has three median cevians from vertices — those lines are not in the original triangle. Eliminate C.',
        'C punya tiga garis median dari simpul — garis itu tidak ada pada segitiga asal. Coret C.',
      ),
    },

    // Beat 5 — eliminate D
    {
      phase: 'eliminate',
      activeOption: 'D',
      isAnswer: false,
      showCross: true,
      hold: 2000,
      result: false,
      caption: t(
        'D has a Y-pattern from top corners — again, new lines not in the rule. Eliminate D.',
        'D punya pola-Y dari sudut atas — lagi-lagi garis baru yang tidak ada dalam aturan. Coret D.',
      ),
    },

    // Beat 6 — result: B is the answer
    {
      phase: 'result',
      activeOption: 'B',
      isAnswer: true,
      showCross: false,
      hold: 0,
      result: true,
      caption: t(
        'B is a plain inverted triangle — just the outline, no extra lines. This matches the rule perfectly. Answer: B.',
        'B adalah segitiga terbalik polos — hanya garis luar, tanpa garis ekstra. Cocok dengan aturan. Jawaban: B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
