// IKMC-23-PE-Q11 — storyboard for the token-sum animation.
//
// The question: Four coloured tokens in a row: 10 + ? + ? + 2 = 18.
// Both ? tokens hold the same value x.
// Known sum: 10 + 2 = 12. So 2x = 18 − 12 = 6 → x = 3. Answer: C.
//
// Teaching walk, one idea per beat:
//   0. intro    — show the static token row; state the setup.
//   1. known    — highlight the two known tokens (10 and 2); show 10 + 2 = 12.
//   2. remain   — show 18 − 12 = 6 is left for both ? tokens.
//   3. divide   — divide 6 by 2 → each ? = 3.
//   4. reveal   — fill both ? with 3; confirm 10 + 3 + 3 + 2 = 18.
//   5. result   — green answer pill showing x = 3 → C.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type TokenPhase = 'intro' | 'known' | 'remain' | 'divide' | 'reveal' | 'result'

export interface TokenBeat {
  phase: TokenPhase
  /** Show the two known tokens highlighted (green ring). */
  showKnownHighlight: boolean
  /** Show the equation strip below the figure. */
  equation: string
  /** Reveal the answer (3) in both ? tokens. */
  revealAnswer: boolean
  /** Show the sum-line bracket at the bottom of the SVG. */
  showSumLine: boolean
  /** Caption text for the explanation chip. */
  caption: string
  /** Auto-hold in ms (0 = final / manual advance). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface TokenStoryboard {
  answer: number
  steps: TokenBeat[]
  finalIndex: number
}

export function buildTokens11PESteps(lang: Lang): TokenStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TokenBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showKnownHighlight: false,
      equation: '',
      revealAnswer: false,
      showSumLine: false,
      hold: 1800,
      result: false,
      caption: t(
        'Four tokens in a row: 10 + ? + ? + 2 = 18. The two ? tokens have the same value.',
        'Empat keping berjajar: 10 + ? + ? + 2 = 18. Dua keping tanda tanya bernilai sama.',
      ),
    },

    // Beat 1 — known tokens
    {
      phase: 'known',
      showKnownHighlight: true,
      equation: '10 + 2 = 12',
      revealAnswer: false,
      showSumLine: false,
      hold: 2200,
      result: false,
      caption: t(
        'We know two values: 10 and 2. Together they make 10 + 2 = 12.',
        'Kita tahu dua nilai: 10 dan 2. Keduanya berjumlah 10 + 2 = 12.',
      ),
    },

    // Beat 2 — remaining sum
    {
      phase: 'remain',
      showKnownHighlight: true,
      equation: '18 − 12 = 6',
      revealAnswer: false,
      showSumLine: false,
      hold: 2200,
      result: false,
      caption: t(
        'The total must be 18. The two ? tokens together must make 18 − 12 = 6.',
        'Totalnya harus 18. Kedua keping tanda tanya bersama-sama harus berjumlah 18 − 12 = 6.',
      ),
    },

    // Beat 3 — divide equally
    {
      phase: 'divide',
      showKnownHighlight: true,
      equation: '6 ÷ 2 = 3',
      revealAnswer: false,
      showSumLine: false,
      hold: 2200,
      result: false,
      caption: t(
        'Both ? tokens are equal, so each one = 6 ÷ 2 = 3.',
        'Kedua keping ? bernilai sama, jadi masing-masing = 6 ÷ 2 = 3.',
      ),
    },

    // Beat 4 — reveal answer
    {
      phase: 'reveal',
      showKnownHighlight: false,
      equation: '10 + 3 + 3 + 2 = 18',
      revealAnswer: true,
      showSumLine: true,
      hold: 2200,
      result: false,
      caption: t(
        'Replace each ? with 3: 10 + 3 + 3 + 2 = 18. ✓',
        'Ganti setiap ? dengan 3: 10 + 3 + 3 + 2 = 18. ✓',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      showKnownHighlight: false,
      equation: '10 + 3 + 3 + 2 = 18',
      revealAnswer: true,
      showSumLine: true,
      hold: 0,
      result: true,
      caption: t(
        'Each missing number is 3 — answer C.',
        'Setiap angka yang hilang adalah 3 — jawaban C.',
      ),
    },
  ]

  return { answer: 3, steps, finalIndex: steps.length - 1 }
}
