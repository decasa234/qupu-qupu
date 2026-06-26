// OSN-25-SD-KAB-Q18 — 2×2 grid permutation storyboard.
//
// Question: Fill a 2×2 grid with 4 different primes each < 40.
// Primes < 40: 2,3,5,7,11,13,17,19,23,29,31,37 → 12 primes
// P(12,4) = 12 × 11 × 10 × 9 = 11,880 → answer C
//
// Beats:
//   0. intro    — blank coloured grid; 4 cells to fill with DIFFERENT primes < 40
//   1. primes   — list all 12 primes < 40
//   2. choices  — cell-by-cell: 12 → 11 → 10 → 9
//   3. multiply — 12 × 11 × 10 × 9 = 11,880
//   4. result   — answer C; trap: 12⁴ = 20,736 counts WITH repetition

export type Lang = 'en' | 'id'

export type GridOSN25KQ18PhaseId = 'intro' | 'primes' | 'choices' | 'multiply' | 'result'

export interface GridOSN25KQ18Beat {
  /** Which animation phase this beat belongs to. */
  phase: GridOSN25KQ18PhaseId
  /**
   * Labels shown inside each cell (row-major order: [0,0], [0,1], [1,0], [1,1]).
   * '?' for blank-intent; a choice count like '12'; '' to hide.
   */
  cellLabels: [string, string, string, string]
  /** Whether to show the prime list row below the grid. */
  showPrimes: boolean
  /** Equation / maths line shown below the figure; '' to hide. */
  equation: string
  /** True only on the final (result) beat. */
  result: boolean
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** Caption text for the explanation box. */
  caption: string
}

export interface GridOSN25KQ18Storyboard {
  steps: GridOSN25KQ18Beat[]
  finalIndex: number
}

export function buildGridOSN25KQ18Steps(lang: Lang): GridOSN25KQ18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: GridOSN25KQ18Beat[] = [
    // Beat 0 — intro: blank grid, state the task
    {
      phase: 'intro',
      cellLabels: ['?', '?', '?', '?'],
      showPrimes: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Fill each of the 4 cells with a DIFFERENT prime number less than 40. How many ways are there?',
        'Isi setiap dari 4 petak dengan bilangan prima BERBEDA yang nilainya kurang dari 40. Ada berapa banyak cara?',
      ),
    },

    // Beat 1 — list the 12 primes
    {
      phase: 'primes',
      cellLabels: ['?', '?', '?', '?'],
      showPrimes: true,
      equation: t(
        '2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37 → 12 primes',
        '2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37 → 12 bilangan prima',
      ),
      hold: 2400,
      result: false,
      caption: t(
        'Primes less than 40: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37 — exactly 12 primes.',
        'Bilangan prima kurang dari 40: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37 — tepat 12 bilangan prima.',
      ),
    },

    // Beat 2 — choices per cell
    {
      phase: 'choices',
      cellLabels: ['12', '11', '10', '9'],
      showPrimes: false,
      equation: t(
        'Cell 1: 12 choices → Cell 2: 11 → Cell 3: 10 → Cell 4: 9',
        'Petak 1: 12 pilihan → Petak 2: 11 → Petak 3: 10 → Petak 4: 9',
      ),
      hold: 2400,
      result: false,
      caption: t(
        'Each cell must hold a DIFFERENT prime. After placing one, the next cell has one fewer choice.',
        'Setiap petak harus berisi prima yang BERBEDA. Setelah menempatkan satu, petak berikutnya memiliki satu pilihan lebih sedikit.',
      ),
    },

    // Beat 3 — multiply
    {
      phase: 'multiply',
      cellLabels: ['12', '11', '10', '9'],
      showPrimes: false,
      equation: 'P(12,4) = 12 × 11 × 10 × 9 = 11.880',
      hold: 2200,
      result: false,
      caption: t(
        'Multiply: 12 × 11 = 132; 132 × 10 = 1,320; 1,320 × 9 = 11,880.',
        'Kalikan: 12 × 11 = 132; 132 × 10 = 1.320; 1.320 × 9 = 11.880.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      cellLabels: ['12', '11', '10', '9'],
      showPrimes: false,
      equation: t('11,880 ways → Answer C', '11.880 cara → Jawaban C'),
      hold: 0,
      result: true,
      caption: t(
        'P(12,4) = 11,880 ways — Answer C. (Trap D: 12⁴ = 20,736 allows the same prime in multiple cells.)',
        'P(12,4) = 11.880 cara — Jawaban C. (Jebakan D: 12⁴ = 20.736 membolehkan prima yang sama di beberapa petak.)',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
