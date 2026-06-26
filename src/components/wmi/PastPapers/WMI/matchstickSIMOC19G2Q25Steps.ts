// SIMOC-19-G2-Q25 — Matchstick "869" → greatest number (9651).
// 5-beat storyboard: intro, highlight-removed-segs, transform, arrange, result.
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type MatchPhase = 'intro' | 'highlight' | 'transform' | 'arrange' | 'result'

export interface MatchBeat {
  phase: MatchPhase
  /** Show the original "869" digit display. */
  showOriginal: boolean
  /** While showOriginal: draw the 2 segments being removed from "8" in red. */
  dimExtraSegs: boolean
  /** Show "5  6  9  1" — the 4 freed digits before ordering. */
  showIntermediate: boolean
  /** Show "9651" — the final arranged answer. */
  showResult: boolean
  /** On result beat: show stick-count labels under each digit. */
  showVerify: boolean
  equation: string
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  result: boolean
}

export interface MatchStoryboard {
  steps: MatchBeat[]
  finalIndex: number
}

export function buildMatchstickSIMOC19G2Q25Steps(lang: Lang): MatchStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MatchBeat[] = [
    {
      phase: 'intro',
      showOriginal: true, dimExtraSegs: false, showIntermediate: false,
      showResult: false, showVerify: false,
      equation: '7 + 6 + 6 = 19',
      hold: 2200, result: false,
      caption: t(
        'Number 869 uses 19 matchsticks: digit 8 needs 7, digit 6 needs 6, digit 9 needs 6.',
        'Angka 869 menggunakan 19 korek api: digit 8 butuh 7, digit 6 butuh 6, digit 9 butuh 6.',
      ),
    },
    {
      phase: 'highlight',
      showOriginal: true, dimExtraSegs: true, showIntermediate: false,
      showResult: false, showVerify: false,
      equation: '8 (7) → 5 (5): free 2 sticks',
      hold: 2200, result: false,
      caption: t(
        'Remove 2 sticks from digit 8 to get digit 5. The 2 freed sticks form digit 1 (needs only 2).',
        'Ambil 2 korek dari digit 8 untuk membuat digit 5. Dua korek yang dibebaskan membentuk digit 1 (hanya butuh 2).',
      ),
    },
    {
      phase: 'transform',
      showOriginal: false, dimExtraSegs: false, showIntermediate: true,
      showResult: false, showVerify: false,
      equation: '5, 6, 9, 1 — 4 digits!',
      hold: 2200, result: false,
      caption: t(
        'Now 4 digits: 5, 6, 9, 1. Any 4-digit number beats any 3-digit number.',
        'Sekarang 4 digit: 5, 6, 9, 1. Bilangan 4-digit selalu mengalahkan bilangan 3-digit.',
      ),
    },
    {
      phase: 'arrange',
      showOriginal: false, dimExtraSegs: false, showIntermediate: false,
      showResult: true, showVerify: false,
      equation: '9 > 6 > 5 > 1 → 9651',
      hold: 2200, result: false,
      caption: t(
        'Sort 9, 6, 5, 1 from greatest to smallest → 9651.',
        'Susun 9, 6, 5, 1 dari terbesar ke terkecil → 9651.',
      ),
    },
    {
      phase: 'result',
      showOriginal: false, dimExtraSegs: false, showIntermediate: false,
      showResult: true, showVerify: true,
      equation: '9(6) + 6(6) + 5(5) + 1(2) = 19 ✓',
      hold: 0, result: true,
      caption: t(
        '6+6+5+2 = 19 ✓. Greatest possible number = 9651.',
        '6+6+5+2 = 19 ✓. Bilangan terbesar yang mungkin = 9651.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
