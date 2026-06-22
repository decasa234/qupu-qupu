// IKMC-19-EC-Q2 — storyboard for the dot-bar notation animation.
//
// The question: each dot = 1, each bar = 5. Which picture stands for 12?
// Answer: C (2 dots + 2 bars = 2 + 10 = 12).
//
// Teaching walk, one idea per beat:
//   0. intro    — state the rule: dot = 1, bar = 5.
//   1. target   — figure out 12 = 2 bars + 2 dots (decompose 12).
//   2. testA    — A: 1 dot + 2 bars = 1 + 10 = 11 ≠ 12. Eliminated.
//   3. testB    — B: 1 dot + 3 bars = 1 + 15 = 16 ≠ 12. Eliminated.
//   4. testC    — C: 2 dots + 2 bars = 2 + 10 = 12 ✓ — answer!
//   5. trapD    — D: also 2 + 2 = 12, but wrong layout — C is canonical.
//   6. testE    — E: 4 dots + 3 bars = 4 + 15 = 19 ≠ 12. Eliminated.
//   7. result   — C is the answer.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type DotBar2ECPhase =
  | 'intro'
  | 'target'
  | 'testA'
  | 'testB'
  | 'testC'
  | 'trapD'
  | 'testE'
  | 'result'

export interface DotBar2ECBeat {
  /** Animation phase */
  phase: DotBar2ECPhase
  /** Which choice label is being highlighted (or null for non-option beats). */
  activeChoice: 'A' | 'B' | 'C' | 'D' | 'E' | null
  /** Whether the active choice is correct (green) or wrong (red/grey). */
  activeResult: 'correct' | 'wrong' | 'trap' | null
  /** Set of choices already eliminated. */
  eliminated: ReadonlySet<string>
  /** Arithmetic equation / key string; '' to hide. */
  equation: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface DotBar2ECStoryboard {
  steps: DotBar2ECBeat[]
  finalIndex: number
}

export function buildDotBar2ECSteps(lang: Lang): DotBar2ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DotBar2ECBeat[] = [
    // Beat 0 — intro: state the decoding rule
    {
      phase: 'intro',
      activeChoice: null,
      activeResult: null,
      eliminated: new Set(),
      equation: t('dot = 1, bar = 5', 'titik = 1, batang = 5'),
      hold: 2200,
      result: false,
      caption: t(
        'Each dot stands for 1. Each bar stands for 5. (Example: 1 bar + 3 dots = 5 + 3 = 8.)',
        'Setiap titik bernilai 1. Setiap batang bernilai 5. (Contoh: 1 batang + 3 titik = 5 + 3 = 8.)',
      ),
    },

    // Beat 1 — target: decompose 12
    {
      phase: 'target',
      activeChoice: null,
      activeResult: null,
      eliminated: new Set(),
      equation: '12 = 5 + 5 + 1 + 1',
      hold: 2200,
      result: false,
      caption: t(
        'We need bars × 5 + dots × 1 = 12. That is 2 bars (= 10) + 2 dots (= 2) = 12.',
        'Kita butuh batang × 5 + titik × 1 = 12. Yaitu 2 batang (= 10) + 2 titik (= 2) = 12.',
      ),
    },

    // Beat 2 — test A
    {
      phase: 'testA',
      activeChoice: 'A',
      activeResult: 'wrong',
      eliminated: new Set(['A']),
      equation: '1 + 10 = 11 ≠ 12',
      hold: 2000,
      result: false,
      caption: t(
        'A: 1 dot + 2 bars = 1 + 10 = 11. Not 12 — eliminated.',
        'A: 1 titik + 2 batang = 1 + 10 = 11. Bukan 12 — dieliminasi.',
      ),
    },

    // Beat 3 — test B
    {
      phase: 'testB',
      activeChoice: 'B',
      activeResult: 'wrong',
      eliminated: new Set(['A', 'B']),
      equation: '1 + 15 = 16 ≠ 12',
      hold: 2000,
      result: false,
      caption: t(
        'B: 1 dot + 3 bars = 1 + 15 = 16. Not 12 — eliminated.',
        'B: 1 titik + 3 batang = 1 + 15 = 16. Bukan 12 — dieliminasi.',
      ),
    },

    // Beat 4 — test C (the answer)
    {
      phase: 'testC',
      activeChoice: 'C',
      activeResult: 'correct',
      eliminated: new Set(['A', 'B']),
      equation: '2 + 10 = 12 ✓',
      hold: 2400,
      result: false,
      caption: t(
        'C: 2 dots + 2 bars = 2 + 10 = 12. This is 12!',
        'C: 2 titik + 2 batang = 2 + 10 = 12. Ini sama dengan 12!',
      ),
    },

    // Beat 5 — trap D
    {
      phase: 'trapD',
      activeChoice: 'D',
      activeResult: 'trap',
      eliminated: new Set(['A', 'B']),
      equation: '2 + 10 = 12, tapi…',
      hold: 2200,
      result: false,
      caption: t(
        'D: also 2 dots + 2 bars = 12, but the arrangement is different from the standard grouping. C has the canonical layout — so C is the intended answer.',
        'D: juga 2 titik + 2 batang = 12, tetapi susunannya berbeda dari pengelompokan standar. C memiliki tata letak yang kanonik — jadi C adalah jawaban yang dimaksud.',
      ),
    },

    // Beat 6 — test E
    {
      phase: 'testE',
      activeChoice: 'E',
      activeResult: 'wrong',
      eliminated: new Set(['A', 'B', 'E']),
      equation: '4 + 15 = 19 ≠ 12',
      hold: 2000,
      result: false,
      caption: t(
        'E: 4 dots + 3 bars = 4 + 15 = 19. Not 12 — eliminated.',
        'E: 4 titik + 3 batang = 4 + 15 = 19. Bukan 12 — dieliminasi.',
      ),
    },

    // Beat 7 — result
    {
      phase: 'result',
      activeChoice: 'C',
      activeResult: 'correct',
      eliminated: new Set(['A', 'B', 'E']),
      equation: '2 + 10 = 12 → C',
      hold: 0,
      result: true,
      caption: t(
        'Picture C (2 dots + 2 bars = 12) is the answer.',
        'Gambar C (2 titik + 2 batang = 12) adalah jawabannya.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
