// IKMC-23-PE-Q7 — step-by-step solution storyboard for the racetrack animation.
//
// Question: Pablo puts 10 toy cars on a racetrack. The middle section goes
// through a tunnel. Some cars are inside the tunnel, hidden from view.
// How many cars are in the tunnel?
//
// Strategy: count visible cars outside the tunnel, then subtract from total.
//   Total cars:           10
//   Cars visible (left):   2  (left of tunnel)
//   Cars visible (right):  2  (right of tunnel)
//   Cars visible total:    4
//   Cars in tunnel:   10 − 4 = 6   ← answer B
//
// Animation beats:
//   0. intro       — show the scene; "10 cars in total"
//   1. count left  — highlight 2 cars on the left; running count: 2
//   2. count right — highlight 2 cars on the right; running count: 4
//   3. subtract    — "10 − 4 = 6"; equation animates
//   4. result      — answer badge on tunnel; "6 cars inside — answer B"
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type Phase7 = 'intro' | 'count' | 'subtract' | 'result'

export interface Beat7 {
  phase: Phase7
  /** Indices (into VISIBLE_CARS) of the cars currently highlighted. */
  highlighted: number[]
  /** Running count of visible cars found so far. */
  visibleCount: number
  /** Equation string to show (empty on intro). */
  equation: string
  /** Caption for this beat. */
  caption: string
  /** Auto-hold duration in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Storyboard7 {
  steps: Beat7[]
  finalIndex: number
}

// ── Builder ───────────────────────────────────────────────────────────────────

export function buildRacetrack7PESteps(lang: Lang): Storyboard7 {
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)

  const steps: Beat7[] = []

  // Beat 0 — intro
  steps.push({
    phase: 'intro',
    highlighted: [],
    visibleCount: 0,
    equation: '',
    hold: 2000,
    result: false,
    caption: t(
      'Pablo puts 10 toy cars on a racetrack with a tunnel. Count the cars we can see outside the tunnel.',
      'Pablo meletakkan 10 mobil mainan di jalur balap berterowongan. Hitung mobil yang terlihat di luar terowongan.',
    ),
  })

  // Beat 1 — count left-side cars (indices 0 and 1)
  steps.push({
    phase: 'count',
    highlighted: [0, 1],
    visibleCount: 2,
    equation: t('Visible left: 2', 'Terlihat kiri: 2'),
    hold: 2200,
    result: false,
    caption: t(
      '2 cars are visible on the left side of the tunnel.',
      '2 mobil terlihat di sisi kiri terowongan.',
    ),
  })

  // Beat 2 — count right-side cars (indices 2 and 3)
  steps.push({
    phase: 'count',
    highlighted: [0, 1, 2, 3],
    visibleCount: 4,
    equation: t('Visible: 2 + 2 = 4', 'Terlihat: 2 + 2 = 4'),
    hold: 2200,
    result: false,
    caption: t(
      '2 more cars are visible on the right side. 4 cars visible in total.',
      '2 mobil lagi terlihat di sisi kanan. Total 4 mobil terlihat.',
    ),
  })

  // Beat 3 — subtract
  steps.push({
    phase: 'subtract',
    highlighted: [0, 1, 2, 3],
    visibleCount: 4,
    equation: t('10 − 4 = 6', '10 − 4 = 6'),
    hold: 2600,
    result: false,
    caption: t(
      'Cars in tunnel = total − visible = 10 − 4 = 6.',
      'Mobil di terowongan = total − terlihat = 10 − 4 = 6.',
    ),
  })

  // Beat 4 — result
  steps.push({
    phase: 'result',
    highlighted: [0, 1, 2, 3],
    visibleCount: 4,
    equation: t('Answer: B (6)', 'Jawaban: B (6)'),
    hold: 0,
    result: true,
    caption: t(
      '6 cars are hiding inside the tunnel. Answer: B.',
      '6 mobil bersembunyi di dalam terowongan. Jawaban: B.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
