// Storyboard builder for WMI-22F3A-Q2 — "In how many of the five circles is
// exactly 1/3 shaded?" (answer C = 3).
//
// Strategy: check each circle in turn — reduce the fraction shown and compare
// to 1/3.  Keep a running tally of hits.  Final beat lands on the answer.

export type Lang = 'en' | 'id'

export interface PieThirdsStep {
  /** Which circle (1-based) is currently in focus; null = intro or conclusion. */
  circleIndex: number | null
  /** Arithmetic label shown, e.g. "2/6 = 1/3". */
  fraction: string
  /** Whether this circle passes the 1/3 test. */
  passes: boolean
  /** Running count of circles that pass so far (undefined on intro beat). */
  tally: number | undefined
  /** Caption text. */
  caption: string
  /** Hold duration in ms; 0 = final (no auto-advance). */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface PieThirdsStoryboard {
  steps: PieThirdsStep[]
  finalIndex: number
}

// Verified per-circle data (matches the illustration file exactly).
const CIRCLES = [
  { segments: 3,  shaded: 1,  passes: true,  reduced: '1/3'   },
  { segments: 10, shaded: 4,  passes: false, reduced: '4/10 = 2/5' },
  { segments: 6,  shaded: 2,  passes: true,  reduced: '2/6 = 1/3'  },
  { segments: 12, shaded: 4,  passes: true,  reduced: '4/12 = 1/3' },
  { segments: 12, shaded: 5,  passes: false, reduced: '5/12'       },
]

export function buildPieThirdsSteps(lang: Lang): PieThirdsStoryboard {
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)

  const steps: PieThirdsStep[] = []

  // Beat 0 — intro
  steps.push({
    circleIndex: null,
    fraction: '',
    passes: false,
    tally: undefined,
    hold: 1800,
    result: false,
    caption: t(
      'Which circles show exactly 1/3 shaded? Check each one!',
      'Lingkaran mana yang tepat 1/3-nya diarsir? Periksa satu per satu!',
    ),
  })

  let tally = 0

  CIRCLES.forEach((c, i) => {
    if (c.passes) tally++

    const circleLabel = t(`Circle ${i + 1}`, `Lingkaran ${i + 1}`)
    const tickOrCross = c.passes ? '✓' : '✗'

    let caption: string
    if (c.passes) {
      caption = t(
        `${circleLabel}: ${c.reduced} ${tickOrCross}  Count so far: ${tally}`,
        `${circleLabel}: ${c.reduced} ${tickOrCross}  Hitung: ${tally}`,
      )
    } else {
      caption = t(
        `${circleLabel}: ${c.reduced} ${tickOrCross}  Not 1/3 — skip.`,
        `${circleLabel}: ${c.reduced} ${tickOrCross}  Bukan 1/3 — lewati.`,
      )
    }

    steps.push({
      circleIndex: i,
      fraction: c.reduced,
      passes: c.passes,
      tally: c.passes ? tally : tally,
      hold: c.passes ? 1800 : 2100,
      result: false,
      caption,
    })
  })

  // Final beat — conclusion
  steps.push({
    circleIndex: null,
    fraction: '',
    passes: true,
    tally: 3,
    hold: 0,
    result: true,
    caption: t(
      'Circles 1, 3 and 4 each show 1/3 shaded → 3 circles.  Answer: C',
      'Lingkaran 1, 3, dan 4 masing-masing menunjukkan 1/3 diarsir → 3 lingkaran.  Jawaban: C',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
