// SIMOC-21-G1-Q15 — storyboard for the Euler-path explainer.
//
// Strategy: count odd-degree vertices in each figure.
//   0 or 2 odd-degree → can be drawn without lifting the pen.
//   More than 2 → impossible.
//
// Beat plan (7 beats):
//   0. intro     — the rule: odd-degree vertex count decides traceability.
//   1. figA      — A: 2 odd (BL, BR) → drawable.
//   2. figB      — B: 2 odd (BL, BR) → drawable.
//   3. figC      — C: 0 odd (all even) → drawable.
//   4. figD      — D: 4 odd (TL, TR, ML, MC) → NOT drawable! (answer)
//   5. figE      — E: 2 odd → drawable.
//   6. result    — only D cannot → answer D.

export type Lang = 'en' | 'id'

export type EulerPhase =
  | 'intro'
  | 'figA'
  | 'figB'
  | 'figC'
  | 'figD'
  | 'figE'
  | 'result'

export interface EulerBeat {
  phase: EulerPhase
  /** Which option letter is highlighted (null for non-figure beats). */
  active: 'A' | 'B' | 'C' | 'D' | 'E' | null
  /** Number of odd-degree vertices in the active figure. */
  oddCount: number | null
  /** Whether the active figure is the ANSWER (cannot be traced). */
  isAnswer: boolean
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface EulerStoryboard {
  steps: EulerBeat[]
  finalIndex: number
}

export function buildEulerFiguresSIMOC21G1Q15Steps(lang: Lang): EulerStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: EulerBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      active: null,
      oddCount: null,
      isAnswer: false,
      equation: t('0 or 2 odd → OK', '0 atau 2 ganjil → bisa'),
      hold: 2600,
      result: false,
      caption: t(
        'A figure can be traced in one stroke if it has 0 or 2 vertices where an odd number of lines meet (Euler path rule). We count these "odd-degree" vertices for each option.',
        'Sebuah gambar bisa ditelusuri dalam satu coretan jika memiliki 0 atau 2 titik tempat jumlah garis yang bertemu adalah ganjil (aturan jalur Euler). Kita hitung titik "berderajat ganjil" di setiap gambar.',
      ),
    },

    // Beat 1 — Figure A
    {
      phase: 'figA',
      active: 'A',
      oddCount: 2,
      isAnswer: false,
      equation: t('2 odd → can draw', '2 ganjil → bisa digambar'),
      hold: 2200,
      result: false,
      caption: t(
        'Figure A: the two bottom corners of the trapezoid each have 3 lines meeting — that is 2 odd-degree vertices → can be drawn.',
        'Gambar A: dua sudut bawah trapesium masing-masing bertemu 3 garis — itu 2 titik berderajat ganjil → bisa digambar.',
      ),
    },

    // Beat 2 — Figure B
    {
      phase: 'figB',
      active: 'B',
      oddCount: 2,
      isAnswer: false,
      equation: t('2 odd → can draw', '2 ganjil → bisa digambar'),
      hold: 2200,
      result: false,
      caption: t(
        'Figure B: the two bottom corners of the rectangle each have 3 lines meeting — 2 odd-degree vertices → can be drawn.',
        'Gambar B: dua sudut bawah persegi panjang masing-masing bertemu 3 garis — 2 titik berderajat ganjil → bisa digambar.',
      ),
    },

    // Beat 3 — Figure C
    {
      phase: 'figC',
      active: 'C',
      oddCount: 0,
      isAnswer: false,
      equation: t('0 odd → can draw', '0 ganjil → bisa digambar'),
      hold: 2200,
      result: false,
      caption: t(
        'Figure C: every vertex has an even number of lines meeting — 0 odd-degree vertices → can be drawn (and even returns to the starting point).',
        'Gambar C: setiap titik bertemu jumlah garis yang genap — 0 titik berderajat ganjil → bisa digambar (bahkan kembali ke titik awal).',
      ),
    },

    // Beat 4 — Figure D (the answer)
    {
      phase: 'figD',
      active: 'D',
      oddCount: 4,
      isAnswer: true,
      equation: t('4 odd → CANNOT draw', '4 ganjil → TIDAK BISA digambar'),
      hold: 2600,
      result: false,
      caption: t(
        'Figure D: four vertices each have 3 lines meeting (top-left, top-right, mid-left, inner corner) — 4 odd-degree vertices → impossible to trace without lifting the pen!',
        'Gambar D: empat titik masing-masing bertemu 3 garis (kiri-atas, kanan-atas, tengah-kiri, sudut dalam) — 4 titik berderajat ganjil → tidak mungkin ditelusuri tanpa mengangkat pena!',
      ),
    },

    // Beat 5 — Figure E
    {
      phase: 'figE',
      active: 'E',
      oddCount: 2,
      isAnswer: false,
      equation: t('2 odd → can draw', '2 ganjil → bisa digambar'),
      hold: 2200,
      result: false,
      caption: t(
        'Figure E: the two points where the diagonal line crosses the outer circle each have 3 lines — 2 odd-degree vertices → can be drawn.',
        'Gambar E: dua titik perpotongan garis diagonal dengan lingkaran luar masing-masing bertemu 3 garis — 2 titik berderajat ganjil → bisa digambar.',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      active: 'D',
      oddCount: 4,
      isAnswer: true,
      equation: 'D',
      hold: 0,
      result: true,
      caption: t(
        'A, B, C and E all have 0 or 2 odd-degree vertices → drawable. Only D has 4 odd-degree vertices → cannot be traced. Answer: D.',
        'A, B, C, dan E semuanya punya 0 atau 2 titik berderajat ganjil → bisa digambar. Hanya D yang punya 4 titik berderajat ganjil → tidak bisa ditelusuri. Jawaban: D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
