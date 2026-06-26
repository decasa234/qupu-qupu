// OSN-25-SD-NAS-FINAL-Q15 — beat steps for the animated explainer.
//
// 3×3 coloured grid: grey region fixed at (5,5).
// Side-sum = 10 forces red₀ = 0.
// Then red₁ ∈ {4,5,6} drives case counts: 5 + 4 + 6 = 15 total valid squares.

export interface ColorGridOSN25NFQ15Beat {
  caption: string
  /** Which region to visually emphasise. */
  highlight: 'none' | 'grey' | 'red' | 'blue' | 'green' | 'all'
  /** Running total of valid squares found so far. */
  tally: number
  showAnswer: boolean
  hold: number
  /** Optional per-case sub-label shown in the tally panel. */
  caseNote?: string
}

export interface ColorGridOSN25NFQ15Story {
  steps: ColorGridOSN25NFQ15Beat[]
  finalIndex: number
}

const EN: ColorGridOSN25NFQ15Beat[] = [
  {
    caption: 'Grey region is fixed at (5, 5). Every side of the square must sum to 10.',
    highlight: 'grey',
    tally: 0,
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Top side: 5 + 5 + red₀ = 10 → red₀ = 0 is forced.',
    highlight: 'red',
    tally: 0,
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Left side: 5 + blue₀ + blue₁ = 10 → blue₀ + blue₁ = 5.',
    highlight: 'blue',
    tally: 0,
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'With red₁ = 4: enumerate blue and green pairs obeying all constraints and no repeated unordered pair → 5 valid squares.',
    highlight: 'all',
    tally: 5,
    showAnswer: false,
    caseNote: 'red₁ = 4 → 5 squares',
    hold: 2600,
  },
  {
    caption: 'With red₁ = 5: two symmetric pair clashes leave 4 valid squares.',
    highlight: 'all',
    tally: 9,
    showAnswer: false,
    caseNote: 'red₁ = 5 → 4 squares',
    hold: 2400,
  },
  {
    caption: 'With red₁ = 6: all 6 blue choices are valid → 6 squares.',
    highlight: 'all',
    tally: 15,
    showAnswer: false,
    caseNote: 'red₁ = 6 → 6 squares',
    hold: 2400,
  },
  {
    caption: 'Total valid squares = 5 + 4 + 6 = 15.',
    highlight: 'all',
    tally: 15,
    showAnswer: true,
    hold: 3200,
  },
]

const ID: ColorGridOSN25NFQ15Beat[] = [
  {
    caption: 'Petak abu-abu sudah tetap: (5, 5). Jumlah setiap sisi persegi harus = 10.',
    highlight: 'grey',
    tally: 0,
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Sisi atas: 5 + 5 + merah₀ = 10 → merah₀ = 0 (sudah pasti).',
    highlight: 'red',
    tally: 0,
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Sisi kiri: 5 + biru₀ + biru₁ = 10 → biru₀ + biru₁ = 5.',
    highlight: 'blue',
    tally: 0,
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Dengan merah₁ = 4: enumerasi pasangan biru dan hijau yang memenuhi semua syarat tanpa pengulangan → 5 persegi valid.',
    highlight: 'all',
    tally: 5,
    showAnswer: false,
    caseNote: 'merah₁ = 4 → 5 persegi',
    hold: 2600,
  },
  {
    caption: 'Dengan merah₁ = 5: dua bentrok pasangan simetri menyisakan 4 persegi valid.',
    highlight: 'all',
    tally: 9,
    showAnswer: false,
    caseNote: 'merah₁ = 5 → 4 persegi',
    hold: 2400,
  },
  {
    caption: 'Dengan merah₁ = 6: semua 6 pilihan biru valid → 6 persegi.',
    highlight: 'all',
    tally: 15,
    showAnswer: false,
    caseNote: 'merah₁ = 6 → 6 persegi',
    hold: 2400,
  },
  {
    caption: 'Total persegi yang mungkin = 5 + 4 + 6 = 15.',
    highlight: 'all',
    tally: 15,
    showAnswer: true,
    hold: 3200,
  },
]

export function buildColorGridOSN25NFQ15Steps(lang: 'en' | 'id'): ColorGridOSN25NFQ15Story {
  const steps = lang === 'id' ? ID : EN
  return { steps, finalIndex: steps.length - 1 }
}
