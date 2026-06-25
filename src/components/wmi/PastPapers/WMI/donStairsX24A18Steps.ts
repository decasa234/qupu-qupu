// SEAMOX-24-A-Q18 — animation storyboard.
//
// Question: 8 steps/flight; 2 flights per level; 90 s/flight; home on 6th floor.
// How many minutes does Don take to reach home?  Answer: 15 min
//
// Solution:
//   Levels to climb: 6 − 1 = 5
//   Total flights:   5 × 2 = 10
//   Total seconds:  10 × 90 = 900 s
//   Minutes:        900 ÷ 60 = 15 min
//
// Beats:
//   0. intro   — static figure; orient Don at F1, home at F6.
//   1. levels  — all 5 staircases highlighted; "6 − 1 = 5 levels".
//   2. flights — "5 × 2 = 10 flights total".
//   3. seconds — "10 × 90 = 900 s".
//   4. result  — "900 ÷ 60 = 15 min" (green).
//
// Pure builder: (lang) → storyboard. SSR-safe, no Date, no Math.random.

export type Lang = 'en' | 'id'
export type DonStairsPhase = 'intro' | 'levels' | 'flights' | 'seconds' | 'result'

export interface DonStairsBeat {
  phase: DonStairsPhase
  /** Floor-to-floor staircase segments to highlight (1 = F1→F2, 5 = F5→F6). */
  highlightFloors: number[]
  /** Short equation shown in the pill above the caption. */
  equation: string
  /** Caption text below the figure. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  result: boolean
}

export interface DonStairsStoryboard {
  steps: DonStairsBeat[]
  finalIndex: number
}

export function buildDonStairsX24A18Steps(lang: Lang): DonStairsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const ALL = [1, 2, 3, 4, 5]

  const steps: DonStairsBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightFloors: [],
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Don is at floor 1. His home is on the 6th floor. Each level has 2 flights of stairs taking 90 s each.',
        'Don berada di lantai 1. Rumahnya di lantai 6. Setiap level memiliki 2 penerbangan tangga masing-masing 90 detik.',
      ),
    },

    // Beat 1 — count levels
    {
      phase: 'levels',
      highlightFloors: ALL,
      equation: t('6 − 1 = 5 levels', '6 − 1 = 5 level'),
      hold: 2400,
      result: false,
      caption: t(
        'Don starts at floor 1 and climbs to floor 6 — that is 6 − 1 = 5 levels to climb.',
        'Don mulai di lantai 1 dan naik ke lantai 6 — itu 6 − 1 = 5 level yang harus didaki.',
      ),
    },

    // Beat 2 — multiply by 2 flights
    {
      phase: 'flights',
      highlightFloors: ALL,
      equation: t('5 × 2 = 10 flights', '5 × 2 = 10 penerbangan'),
      hold: 2400,
      result: false,
      caption: t(
        'Each level has 2 flights of stairs: 5 × 2 = 10 flights in total.',
        'Setiap level memiliki 2 penerbangan tangga: 5 × 2 = 10 penerbangan total.',
      ),
    },

    // Beat 3 — multiply by 90 seconds
    {
      phase: 'seconds',
      highlightFloors: ALL,
      equation: t('10 × 90 = 900 s', '10 × 90 = 900 dtk'),
      hold: 2400,
      result: false,
      caption: t(
        'Each flight takes 90 seconds: 10 × 90 = 900 seconds.',
        'Setiap penerbangan membutuhkan 90 detik: 10 × 90 = 900 detik.',
      ),
    },

    // Beat 4 — convert to minutes (result)
    {
      phase: 'result',
      highlightFloors: ALL,
      equation: t('900 ÷ 60 = 15 min', '900 ÷ 60 = 15 menit'),
      hold: 0,
      result: true,
      caption: t(
        '900 seconds ÷ 60 = 15 minutes. Don takes 15 minutes to reach home.',
        '900 detik ÷ 60 = 15 menit. Don membutuhkan 15 menit untuk sampai ke rumahnya.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
