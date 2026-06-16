// WMI-22F3A-Q13 — Storyboard builder for the median-championship explainer.
//
// Strategy: count wins → sort ascending → find 5th of 9 (median) → map count to country.
//
// Sorted counts (verified, sum = 50):
//   1, 1, 1, 2, [3], 8, 8, 13, 13
//   index: 0  1  2  3   4   5  6   7   8
//   median index = 4 → value 3 → Netherlands (index 4 in WIN_COUNTS)

export type Lang = 'en' | 'id'

export type MedianPhase =
  | 'show-chart'
  | 'explain-median'
  | 'lineup'
  | 'find-fifth'
  | 'answer'

export interface MedianStep {
  phase: MedianPhase
  /** Index in WIN_COUNTS to spotlight (0-based), or null. */
  highlightIndex: number | null
  /** The sorted lineup of counts to display, or null (hide lineup row). */
  lineup: ReadonlyArray<number> | null
  /** Index within `lineup` that is the median (circled/highlighted). */
  medianLineupIndex: number | null
  /** True on the final answer beat. */
  isAnswer: boolean
  caption: string
  hold: number
}

export interface MedianStoryboard {
  steps: MedianStep[]
  finalIndex: number
  /** Count value at the median position. */
  medianCount: number
  /** Country name at the median position. */
  medianCountry: string
  /** 0-based index in WIN_COUNTS of the median row. */
  medianRowIndex: number
}

// The sorted win counts (must match WIN_COUNTS order in the illustration).
const SORTED_COUNTS = [1, 1, 1, 2, 3, 8, 8, 13, 13] as const
const MEDIAN_LINEUP_INDEX = 4   // 5th of 9
const MEDIAN_COUNT = 3
const MEDIAN_COUNTRY = 'Netherlands'
const MEDIAN_ROW_INDEX = 4      // 0-based index in WIN_COUNTS

export function buildChampionMedianSteps(lang: Lang): MedianStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MedianStep[] = [
    // Beat 0 — show the bar chart, explain we counted.
    {
      phase: 'show-chart',
      highlightIndex: null,
      lineup: null,
      medianLineupIndex: null,
      isAnswer: false,
      hold: 1800,
      caption: t(
        'We counted how many championships each country won over 50 years.',
        'Kita hitung berapa kali setiap negara menang dalam 50 tahun terakhir.',
      ),
    },

    // Beat 1 — explain what "median" means.
    {
      phase: 'explain-median',
      highlightIndex: null,
      lineup: null,
      medianLineupIndex: null,
      isAnswer: false,
      hold: 2000,
      caption: t(
        'The question asks for the MEDIAN — the middle value when the counts are lined up in order.',
        'Soal mencari MEDIAN — nilai tengah saat jumlah kemenangan diurutkan dari kecil ke besar.',
      ),
    },

    // Beat 2 — reveal the sorted lineup.
    {
      phase: 'lineup',
      highlightIndex: null,
      lineup: SORTED_COUNTS,
      medianLineupIndex: null,
      isAnswer: false,
      hold: 2100,
      caption: t(
        'Line them up from smallest to largest: 1, 1, 1, 2, 3, 8, 8, 13, 13.',
        'Urutkan dari terkecil ke terbesar: 1, 1, 1, 2, 3, 8, 8, 13, 13.',
      ),
    },

    // Beat 3 — point to the 5th (middle) value.
    {
      phase: 'find-fifth',
      highlightIndex: null,
      lineup: SORTED_COUNTS,
      medianLineupIndex: MEDIAN_LINEUP_INDEX,
      isAnswer: false,
      hold: 2200,
      caption: t(
        '9 numbers → the middle is the 5th one → that value is 3.',
        '9 angka → yang tengah adalah angka ke-5 → nilainya adalah 3.',
      ),
    },

    // Beat 4 — map count 3 back to Netherlands (spotlight its bar).
    {
      phase: 'answer',
      highlightIndex: MEDIAN_ROW_INDEX,
      lineup: SORTED_COUNTS,
      medianLineupIndex: MEDIAN_LINEUP_INDEX,
      isAnswer: true,
      hold: 0,
      caption: t(
        `Which country has 3 wins? Netherlands! Answer: A.`,
        `Negara mana yang menang 3 kali? Belanda! Jawaban: A.`,
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
    medianCount: MEDIAN_COUNT,
    medianCountry: MEDIAN_COUNTRY,
    medianRowIndex: MEDIAN_ROW_INDEX,
  }
}
