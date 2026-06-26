// SASMO 2019 Grade 4 Q14 — storyboard for the shaded-fraction explainer.
//
// Question: Which of the 5 figures has the LARGEST shaded fraction?
// Answer: D (shaded 3/4 — the largest)
//
// Strategy — compare shaded fractions one figure at a time:
//   Beat 0 — intro:   "Compare the shaded part of each figure — NOT the total size."
//   Beat 1 — A & B:   "A is a cross: top full + 3 half-triangles = 5/8. B alternates = 1/2."
//   Beat 2 — C & E:   "C is a square with alternating triangles = 1/2. E has one big tri = 1/2."
//   Beat 3 — D:       "D: 12 out of 16 equal cells shaded = 3/4 — the largest!"
//   Beat 4 — result:  "Answer D."
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type ShadedFracPhase = 'intro' | 'ab' | 'ce' | 'highlight-d' | 'result'

export interface ShadedFracBeat {
  phase: ShadedFracPhase
  /** Which option label(s) to highlight; empty = show all equally. */
  highlight: string[]
  /** Short fraction comparison shown in the equation row. */
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface ShadedFracStoryboard {
  steps: ShadedFracBeat[]
  finalIndex: number
}

export function buildShadedFractionSASMO19G4Q14Steps(lang: Lang): ShadedFracStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShadedFracBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlight: [],
      equation: '',
      caption: t(
        'Compare the shaded fraction of each figure — not its total size.',
        'Bandingkan pecahan yang diarsir dari setiap gambar — bukan ukuran totalnya.',
      ),
      hold: 2200,
      result: false,
    },
    // Beat 1 — figures A & B
    {
      phase: 'ab',
      highlight: ['A', 'B'],
      equation: t('A = 5/8   B = 1/2', 'A = 5/8   B = 1/2'),
      caption: t(
        'Figure A (cross): top cell full + 3 half-triangles → 5/8 shaded. Figure B: alternating triangles → 1/2.',
        'Gambar A (palang): kotak atas penuh + 3 segitiga setengah → 5/8. Gambar B: segitiga bergantian → 1/2.',
      ),
      hold: 2800,
      result: false,
    },
    // Beat 2 — figures C & E
    {
      phase: 'ce',
      highlight: ['C', 'E'],
      equation: t('C = 1/2   E = 1/2', 'C = 1/2   E = 1/2'),
      caption: t(
        'Figure C (square grid): alternating triangles → 1/2. Figure E: one large right-triangle → 1/2.',
        'Gambar C (kisi persegi): segitiga bergantian → 1/2. Gambar E: satu segitiga besar → 1/2.',
      ),
      hold: 2800,
      result: false,
    },
    // Beat 3 — highlight D
    {
      phase: 'highlight-d',
      highlight: ['D'],
      equation: t('D = 12/16 = 3/4', 'D = 12/16 = 3/4'),
      caption: t(
        'Figure D: 12 out of 16 equal cells are shaded → 3/4. That is larger than 5/8, 1/2, 1/2, 1/2!',
        'Gambar D: 12 dari 16 sel yang sama diarsir → 3/4. Itu lebih besar dari 5/8, 1/2, 1/2, 1/2!',
      ),
      hold: 3000,
      result: false,
    },
    // Beat 4 — result
    {
      phase: 'result',
      highlight: ['D'],
      equation: t('3/4 > 5/8 > 1/2', '3/4 > 5/8 > 1/2'),
      caption: t(
        'Figure D has the largest shaded fraction (3/4). Answer: D.',
        'Gambar D memiliki pecahan diarsir terbesar (3/4). Jawaban: D.',
      ),
      hold: 2500,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
