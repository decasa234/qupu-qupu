import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-24F1A-Q14 (Grade 1): nine numbered cookies, each with a SHAPE
// (circle/square/triangle) and a DOT COUNT (1/2/4). Five trios are offered; a
// trio is "the same kind" iff all three share a SHAPE *or* all three share a DOT
// count. The question asks which trio is NOT the same kind.
//
//   A 1,4,9  → circle, circle, circle           → same SHAPE   ✓
//   B 7,8,9  → 4, 4, 4 dots                      → same DOTS    ✓
//   C 2,5,6  → 1, 1, 1 dots                      → same DOTS    ✓
//   D 3,6,8  → triangle, triangle, triangle      → same SHAPE   ✓
//   E 1,3,6  → circle/triangle/triangle (mixed) and 2/2/1 dots (mixed) → NEITHER ✗
// So E is the odd one out (answer E).
//
// One trio per beat: light it, name what it shares (or that it shares nothing),
// stamp ✓/✗. The four matching trios are rejected as "same kind" candidates; the
// one that shares NEITHER property is the answer. Result beat lands on E.

const SHAPE_LABEL = (lang: Lang): Record<'circle' | 'square' | 'triangle', string> =>
  lang === 'id'
    ? { circle: 'lingkaran', square: 'persegi', triangle: 'segitiga' }
    : { circle: 'circles', square: 'squares', triangle: 'triangles' }

export type CookieSortPhase = 'intro' | 'try' | 'result'

export interface CookieSortStep {
  phase: CookieSortPhase
  /** The trio of cookie numbers lit on this beat (null on the intro). */
  litGroup: number[] | null
  /** The option letter for this trio (A..E), or null on the intro. */
  label: string | null
  /** True when this trio is "the same kind" (shares a property) — a ✓ beat. */
  ok: boolean
  /** True on the odd-one-out beats (E + result) — a ✗ / answer beat. */
  odd: boolean
  caption: string
  hold: number
  result: boolean
}

export interface CookieSortStoryboard {
  answer: string // 'E'
  oddGroup: number[] // [1, 3, 6]
  steps: CookieSortStep[]
  finalIndex: number
}

export function buildCookieSort24G1Steps(lang: Lang): CookieSortStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const SH = SHAPE_LABEL(lang)

  const steps: CookieSortStep[] = [
    {
      phase: 'intro',
      litGroup: null,
      label: null,
      ok: false,
      odd: false,
      hold: 1600,
      result: false,
      caption: t(
        'A group is "the same kind" if all 3 share a shape OR all 3 share the same dots. Which group is the odd one out?',
        'Satu kelompok "sejenis" kalau ketiganya satu bentuk ATAU jumlah titiknya sama. Mana kelompok yang berbeda?',
      ),
    },
    {
      phase: 'try',
      litGroup: [1, 4, 9],
      label: 'A',
      ok: true,
      odd: false,
      hold: 1900,
      result: false,
      caption: t(
        `A = 1, 4, 9 — all ${SH.circle}. Same shape ✓ same kind.`,
        `A = 1, 4, 9 — semua ${SH.circle}. Satu bentuk ✓ sejenis.`,
      ),
    },
    {
      phase: 'try',
      litGroup: [7, 8, 9],
      label: 'B',
      ok: true,
      odd: false,
      hold: 1900,
      result: false,
      caption: t(
        'B = 7, 8, 9 — all have 4 dots. Same dots ✓ same kind.',
        'B = 7, 8, 9 — semua 4 titik. Jumlah titik sama ✓ sejenis.',
      ),
    },
    {
      phase: 'try',
      litGroup: [2, 5, 6],
      label: 'C',
      ok: true,
      odd: false,
      hold: 1900,
      result: false,
      caption: t(
        'C = 2, 5, 6 — all have 1 dot. Same dots ✓ same kind.',
        'C = 2, 5, 6 — semua 1 titik. Jumlah titik sama ✓ sejenis.',
      ),
    },
    {
      phase: 'try',
      litGroup: [3, 6, 8],
      label: 'D',
      ok: true,
      odd: false,
      hold: 1900,
      result: false,
      caption: t(
        `D = 3, 6, 8 — all ${SH.triangle}. Same shape ✓ same kind.`,
        `D = 3, 6, 8 — semua ${SH.triangle}. Satu bentuk ✓ sejenis.`,
      ),
    },
    {
      phase: 'try',
      litGroup: [1, 3, 6],
      label: 'E',
      ok: false,
      odd: true,
      hold: 2200,
      result: false,
      caption: t(
        'E = 1, 3, 6 — shapes circle/triangle/triangle differ, dots 2/2/1 differ. Shares nothing ✗.',
        'E = 1, 3, 6 — bentuk lingkaran/segitiga/segitiga beda, titik 2/2/1 beda. Tidak ada yang sama ✗.',
      ),
    },
    {
      phase: 'result',
      litGroup: [1, 3, 6],
      label: 'E',
      ok: false,
      odd: true,
      hold: 0,
      result: true,
      caption: t(
        'E is the odd one out — not sorted the same way. Answer: E.',
        'E adalah yang berbeda — tidak terkelompok sama. Jawaban: E.',
      ),
    },
  ]

  return {
    answer: 'E',
    oddGroup: [1, 3, 6],
    steps,
    finalIndex: steps.length - 1,
  }
}
