// IKMC-20-PE-Q12 — storyboard for the two-flowers sum puzzle.
//
// The question: Two flowers each have a number on every petal. One petal is hidden.
// Both flower sums are equal. What number is on the hidden petal?
//
// Solution walk, one idea per beat:
//   0. intro         — show both flowers; state the equal-sum rule.
//   1. sum-flower1   — circle + sum all 5 petals of the large flower: 1+3+5+7+9 = 25.
//   2. sum-flower2   — show the 4 known petals of the small flower: 2+4+6+8 = 20.
//   3. compute       — hidden = 25 − 20 = 5.
//   4. result        — reveal ? = 5 (answer C, green).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type FlowersPhaseId =
  | 'intro'
  | 'sum-flower1'
  | 'sum-flower2'
  | 'compute'
  | 'result'

export interface FlowersBeat {
  phase: FlowersPhaseId
  /** Highlight the large flower (ring + petal count display). */
  highlightLarge: boolean
  /** Highlight the small flower (ring + petal count display). */
  highlightSmall: boolean
  /** Equation text to display below the figure (empty = hidden). */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface FlowersStoryboard {
  steps: FlowersBeat[]
  finalIndex: number
}

export function buildFlowers12PESteps(lang: Lang): FlowersStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FlowersBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightLarge: false,
      highlightSmall: false,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Each flower has a number on every petal. The two flower sums are equal. Find the hidden number!',
        'Setiap bunga memiliki angka di setiap kelopaknya. Jumlah kedua bunga sama. Temukan angka yang tersembunyi!',
      ),
    },

    // Beat 1 — sum the large flower
    {
      phase: 'sum-flower1',
      highlightLarge: true,
      highlightSmall: false,
      equation: '1 + 3 + 5 + 7 + 9 = 25',
      hold: 2600,
      result: false,
      caption: t(
        'Large flower: add all petals → 1 + 3 + 5 + 7 + 9 = 25',
        'Bunga besar: jumlahkan semua kelopak → 1 + 3 + 5 + 7 + 9 = 25',
      ),
    },

    // Beat 2 — sum the visible petals of the small flower
    {
      phase: 'sum-flower2',
      highlightLarge: false,
      highlightSmall: true,
      equation: '2 + 4 + 6 + 8 = 20',
      hold: 2600,
      result: false,
      caption: t(
        'Small flower: known petals add to 2 + 4 + 6 + 8 = 20',
        'Bunga kecil: kelopak yang terlihat berjumlah 2 + 4 + 6 + 8 = 20',
      ),
    },

    // Beat 3 — compute the hidden value
    {
      phase: 'compute',
      highlightLarge: true,
      highlightSmall: true,
      equation: '25 − 20 = 5',
      hold: 2400,
      result: false,
      caption: t(
        'Both sums are equal → hidden petal = 25 − 20 = 5',
        'Kedua jumlah sama → kelopak tersembunyi = 25 − 20 = 5',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlightLarge: false,
      highlightSmall: false,
      equation: '? = 5',
      hold: 0,
      result: true,
      caption: t(
        'The hidden petal is 5 — answer C!',
        'Kelopak tersembunyi adalah 5 — jawaban C!',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
