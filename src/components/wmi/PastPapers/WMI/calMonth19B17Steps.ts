// calMonth19B17Steps — SEAMO 2019 Paper B Q17
//
// "There was a month with 5 Sundays. 3 of those Sundays were on even dates.
//  Which day was the 24th?"
//
// Answer: A — Monday
//
// Storyboard:
//   0. intro       — show the blank calendar; state the two facts.
//   1. try-d2      — highlight Sundays if first Sunday = 2: {2,9,16,23,30}
//   2. even-check  — circle the even Sundays: 2, 16, 30 → 3 even ✓
//   3. locate-24   — highlight the 24th cell (one after Sunday the 23rd)
//   4. result      — reveal "Mon" inside the 24th cell → answer A
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export interface CalMonthBeat {
  /** Show the Sunday teal highlights. */
  showSundays: boolean
  /** Highlight the three even Sunday cells with an extra ring (2, 16, 30). */
  showEvenRing: boolean
  /** Highlight the 24th cell in amber. */
  showTarget: boolean
  /** Show "Mon" inside the 24th cell. */
  showAnswer: boolean
  /** Equation / maths line to display; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CalMonthStoryboard {
  steps: CalMonthBeat[]
  finalIndex: number
}

export function buildCalMonth19B17Steps(lang: Lang): CalMonthStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CalMonthBeat[] = [
    // Beat 0 — intro
    {
      showSundays: false,
      showEvenRing: false,
      showTarget: false,
      showAnswer: false,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        '5 Sundays in one month. Sundays fall on d, d+7, d+14, d+21, d+28. For 3 to be even, d must be even.',
        '5 hari Minggu dalam satu bulan. Hari Minggu jatuh pada d, d+7, d+14, d+21, d+28. Agar 3 genap, d harus genap.',
      ),
    },

    // Beat 1 — try d=2 (first even d that fits 5 Sundays in ≤31 days)
    {
      showSundays: true,
      showEvenRing: false,
      showTarget: false,
      showAnswer: false,
      equation: 'd = 2 → Sundays: 2, 9, 16, 23, 30',
      hold: 2200,
      result: false,
      caption: t(
        'Try d = 2 (smallest even): Sundays on 2, 9, 16, 23, 30 — fits in a 30-day month ✓',
        'Coba d = 2 (genap terkecil): Minggu pada 2, 9, 16, 23, 30 — muat di bulan 30 hari ✓',
      ),
    },

    // Beat 2 — check even Sundays
    {
      showSundays: true,
      showEvenRing: true,
      showTarget: false,
      showAnswer: false,
      equation: '2 (even), 9 (odd), 16 (even), 23 (odd), 30 (even) → 3 even ✓',
      hold: 2400,
      result: false,
      caption: t(
        'Even Sundays: 2, 16, 30 — that\'s exactly 3. The condition is satisfied!',
        'Minggu genap: 2, 16, 30 — tepat 3 buah. Kondisi terpenuhi!',
      ),
    },

    // Beat 3 — locate 24th
    {
      showSundays: true,
      showEvenRing: true,
      showTarget: true,
      showAnswer: false,
      equation: '24th = 23rd (Sun) + 1 day',
      hold: 2200,
      result: false,
      caption: t(
        '23rd is a Sunday. The 24th is the very next day — one day after Sunday.',
        'Tanggal 23 adalah hari Minggu. Tanggal 24 adalah hari berikutnya — satu hari setelah Minggu.',
      ),
    },

    // Beat 4 — result
    {
      showSundays: true,
      showEvenRing: true,
      showTarget: true,
      showAnswer: true,
      equation: '24th → Monday → A',
      hold: 0,
      result: true,
      caption: t(
        'The 24th is a Monday — answer A.',
        'Tanggal 24 adalah hari Senin — jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
