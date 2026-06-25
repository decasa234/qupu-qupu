// SEAMOX-24-A-Q9 — beat-by-beat steps for the explainer.
//
// Strategy: "assume all same, then adjust for the difference"
//   Beat 0 — intro: read the problem setup
//   Beat 1 — allSame: give all 11 children 2 balloons → 11 × 2 = 22
//   Beat 2 — extra: remaining = 34 − 22 = 12, each girl gets 2 extra
//   Beat 3 — girls: girls = 12 ÷ 2 = 6 ✓ (answer)
//
// Bound to seed quantities:
//   TOTAL_CHILDREN = 11, TOTAL_BALLOONS = 34
//   BOY_BALLOONS = 2, GIRL_BALLOONS = 4, ANSWER = 6

export type Lang = 'en' | 'id'

// Problem constants — bound to seed breakdown.quantities
export const TOTAL_CHILDREN = 11
export const TOTAL_BALLOONS = 34
export const BOY_BALLOONS   = 2
export const GIRL_BALLOONS  = 4
export const EXTRA_PER_GIRL = GIRL_BALLOONS - BOY_BALLOONS   // 2
export const BASE_TOTAL     = TOTAL_CHILDREN * BOY_BALLOONS  // 22
export const EXTRA_TOTAL    = TOTAL_BALLOONS - BASE_TOTAL    // 12
export const ANSWER         = EXTRA_TOTAL / EXTRA_PER_GIRL   // 6

export type BirthdayBalloonsX24A9Phase = 'intro' | 'allSame' | 'extra' | 'girls'

export interface BirthdayBalloonsX24A9Step {
  phase: BirthdayBalloonsX24A9Phase
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface BirthdayBalloonsX24A9Storyboard {
  answer: number
  steps: BirthdayBalloonsX24A9Step[]
  finalIndex: number
}

export function buildBirthdayBalloonsX24A9Steps(lang: Lang): BirthdayBalloonsX24A9Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BirthdayBalloonsX24A9Step[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      equation: '',
      hold: 1400,
      result: false,
      caption: t(
        'There are 11 children. Boys get 2 balloons, girls get 4. Altogether 34 balloons. How many girls?',
        'Ada 11 anak. Laki-laki mendapat 2 balon, perempuan mendapat 4. Seluruhnya 34 balon. Berapa anak perempuan?',
      ),
    },
    // Beat 1 — give everyone the minimum (2 balloons)
    {
      phase: 'allSame',
      equation: t('11 × 2 = 22 balloons', '11 × 2 = 22 balon'),
      hold: 2200,
      result: false,
      caption: t(
        'Give all 11 children 2 balloons each: 11 × 2 = 22 balloons handed out.',
        'Berikan semua 11 anak 2 balon masing-masing: 11 × 2 = 22 balon dibagikan.',
      ),
    },
    // Beat 2 — extra balloons left for girls
    {
      phase: 'extra',
      equation: t('34 − 22 = 12 extra', '34 − 22 = 12 ekstra'),
      hold: 2200,
      result: false,
      caption: t(
        '34 − 22 = 12 balloons remain. Each girl needs 2 extra (4 − 2 = 2).',
        '34 − 22 = 12 balon tersisa. Setiap anak perempuan butuh 2 ekstra (4 − 2 = 2).',
      ),
    },
    // Beat 3 — solve for girls
    {
      phase: 'girls',
      equation: t('Girls = 12 ÷ 2 = 6 ✓', 'Perempuan = 12 ÷ 2 = 6 ✓'),
      hold: 0,
      result: true,
      caption: t(
        '12 extra balloons ÷ 2 extra per girl = 6 girls. There are 6 girls at the party.',
        '12 balon ekstra ÷ 2 ekstra per anak perempuan = 6. Ada 6 anak perempuan di pesta.',
      ),
    },
  ]

  return { answer: ANSWER, steps, finalIndex: steps.length - 1 }
}
