// nestedTriOSN24NT1Q2Steps.ts — OSN-24-SD-NAS-TEORI1-Q2
//
// Teaching walk through the solution (one idea per beat):
//   0. intro  — show the two nested triangles; identify the given data.
//   1. inner  — highlight the inner triangle; compute area = ½ × 3 × 4 = 6.
//   2. ratio  — area ratio 1:5 → outer area = 5 × 6 = 30.
//   3. solve  — outer area = ½ × 12 × a = 30 → 6a = 30 → a = 5.
//   4. result — highlight the answer: a = 5 satuan panjang.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type NestedTriPhase = 'intro' | 'inner' | 'ratio' | 'solve' | 'result'

export interface NestedTriBeat {
  phase: NestedTriPhase
  /** Highlight the inner triangle. */
  highlightInner: boolean
  /** Highlight the outer triangle. */
  highlightOuter: boolean
  /** Equation / arithmetic line shown below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual advance). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface NestedTriStoryboard {
  steps: NestedTriBeat[]
  finalIndex: number
}

export function buildNestedTriOSN24NT1Q2Steps(lang: Lang): NestedTriStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: NestedTriBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightInner: false,
      highlightOuter: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Two nested right triangles. Inner triangle: legs 3 and 4. Outer triangle: legs 12 and a. Ratio of areas = 1 : 5. Find a.',
        'Dua segitiga siku-siku bersarang. Segitiga dalam: kaki 3 dan 4. Segitiga luar: kaki 12 dan a. Perbandingan luas = 1 : 5. Cari a.',
      ),
    },

    // Beat 1 — compute inner area
    {
      phase: 'inner',
      highlightInner: true,
      highlightOuter: false,
      equation: '½ × 3 × 4 = 6',
      hold: 2400,
      result: false,
      caption: t(
        'Inner triangle area = ½ × base × height = ½ × 3 × 4 = 6 square units.',
        'Luas segitiga dalam = ½ × alas × tinggi = ½ × 3 × 4 = 6 satuan persegi.',
      ),
    },

    // Beat 2 — apply the area ratio
    {
      phase: 'ratio',
      highlightInner: false,
      highlightOuter: true,
      equation: '5 × 6 = 30',
      hold: 2400,
      result: false,
      caption: t(
        'Inner : outer = 1 : 5, so outer area = 5 × 6 = 30 square units.',
        'Luas dalam : luar = 1 : 5, jadi luas segitiga luar = 5 × 6 = 30 satuan persegi.',
      ),
    },

    // Beat 3 — solve for a
    {
      phase: 'solve',
      highlightInner: false,
      highlightOuter: false,
      equation: '½ × 12 × a = 30  →  6a = 30  →  a = 5',
      hold: 2600,
      result: false,
      caption: t(
        'Outer area = ½ × 12 × a = 30.  Solving: 6a = 30, so a = 5.',
        'Luas luar = ½ × 12 × a = 30.  Menyelesaikan: 6a = 30, jadi a = 5.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlightInner: false,
      highlightOuter: false,
      equation: 'a = 5',
      hold: 0,
      result: true,
      caption: t(
        'The length of side a is 5 units.',
        'Panjang sisi a adalah 5 satuan panjang.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
