import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Storyboard for WMI-20F1A-Q23: hidden-digit subtraction 8🍌 − 🍌🍓 = 36
// (both bananas = same digit). Seed hint_steps deduction:
//   No borrow: 8 − banana = 3 → banana = 5, but 85 − 36 = 49 starts with 4 ✗.
//   Borrow: 8 − 1 − banana = 3 → banana = 4. Top 84, subtrahend 84 − 36 = 48,
//   strawberry = 8. Check 84 − 48 = 36 ✓.

export interface FruitSubStep {
  revealBanana: boolean
  revealStrawberry: boolean
  highlight: 'none' | 'tens' | 'ones' | 'all'
  /** A tried banana digit (amber badge); crossed out when failed. */
  bananaGuess: { digit: number; failed: boolean } | null
  /** Show the borrow notation on the top row. */
  borrow: boolean
  /** Show the green check beside 36. */
  showCheck: boolean
  caption: string
  hold: number
  result: boolean
}

export interface FruitSubStoryboard {
  answer: number
  steps: FruitSubStep[]
  finalIndex: number
}

export function buildFruitSubtraction20Steps(lang: Lang): FruitSubStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FruitSubStep[] = [
    {
      revealBanana: false,
      revealStrawberry: false,
      highlight: 'all',
      bananaGuess: null,
      borrow: false,
      showCheck: false,
      hold: 2000,
      result: false,
      caption: t(
        'The top is 8-banana, take away banana-strawberry, and 36 is left. Both bananas hide the SAME digit!',
        'Bilangan atasnya 8-pisang, dikurangi pisang-stroberi, hasilnya 36. Kedua pisang menyembunyikan angka yang SAMA!',
      ),
    },
    {
      revealBanana: false,
      revealStrawberry: false,
      highlight: 'tens',
      bananaGuess: { digit: 5, failed: true },
      borrow: false,
      showCheck: false,
      hold: 2200,
      result: false,
      caption: t(
        'Try with NO borrowing: 8 − banana = 3, so banana = 5? Then the top is 85, and 85 − 36 = 49 — but 49 starts with 4, not 5 ✗',
        'Coba TANPA meminjam: 8 − pisang = 3, jadi pisang = 5? Berarti atasnya 85, dan 85 − 36 = 49 — tapi 49 berawalan 4, bukan 5 ✗',
      ),
    },
    {
      revealBanana: true,
      revealStrawberry: false,
      highlight: 'tens',
      bananaGuess: null,
      borrow: true,
      showCheck: false,
      hold: 2200,
      result: false,
      caption: t(
        'So the ones place must borrow 1! Now the tens says 8 − 1 − banana = 3, so banana = 4.',
        'Berarti satuannya meminjam 1! Sekarang puluhannya 8 − 1 − pisang = 3, jadi pisang = 4.',
      ),
    },
    {
      revealBanana: true,
      revealStrawberry: true,
      highlight: 'ones',
      bananaGuess: null,
      borrow: true,
      showCheck: false,
      hold: 2000,
      result: false,
      caption: t(
        'The top number is 84, so the subtrahend is 84 − 36 = 48 — the strawberry is 8!',
        'Bilangan atasnya 84, jadi pengurangnya 84 − 36 = 48 — stroberinya 8!',
      ),
    },
    {
      revealBanana: true,
      revealStrawberry: true,
      highlight: 'none',
      bananaGuess: null,
      borrow: true,
      showCheck: true,
      hold: 0,
      result: true,
      caption: t(
        'Check: 84 − 48 = 36 ✓ The subtrahend is 48.',
        'Periksa: 84 − 48 = 36 ✓ Pengurangnya adalah 48.',
      ),
    },
  ]

  return { answer: 48, steps, finalIndex: steps.length - 1 }
}
