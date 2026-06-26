// OSN-25-SD-NAS-SEMIFINAL-Q8 — explainer storyboard
//
// Survey: 300 students, 4 Sunday activities.
// Given:  Membaca Buku = 60 (20%), Belajar Kelompok = 90 (30%)
// Unknown: Olahraga = b°, Bermain Game = a°
//
// Beats:
//   0. intro       — full chart; list all knowns
//   1. remaining   — 300 − 60 − 90 = 150 for the two unknowns
//   2. ratio       — game = 1.5 × sports → 2.5s = 150 → s=60, g=90
//   3. angle-a     — a° = 90/300 × 360 = 108°
//   4. angle-b     — b° = 60/300 × 360 = 72°
//   5. diff        — selisih = 108° − 72° = 36°

export type Lang = 'en' | 'id'

export type PiePhaseId =
  | 'intro'
  | 'remaining'
  | 'ratio'
  | 'angle-a'
  | 'angle-b'
  | 'diff'

export interface PieBeat {
  phase: PiePhaseId
  /**
   * Which sector(s) to draw at full opacity.
   * 'all'          → all sectors full opacity
   * 'both-unknown' → only 'olahraga' + 'game' full; others dimmed
   * 'olahraga'     → only olahraga full
   * 'game'         → only game full
   */
  highlight: 'all' | 'both-unknown' | 'olahraga' | 'game'
  /** Replace a° with its computed value (108°). */
  revealA: boolean
  /** Replace b° with its computed value (72°). */
  revealB: boolean
  equation: string
  caption: string
  hold: number
  result: boolean
}

export function buildPieChartOSN25NSFQ8Steps(lang: Lang): {
  steps: PieBeat[]
  finalIndex: number
} {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PieBeat[] = [
    {
      phase: 'intro',
      highlight: 'all',
      revealA: false,
      revealB: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        '300 students were surveyed. Reading books: 60 students (20%). Group study: 90 students (30%). We need to find a° and b°.',
        '300 murid disurvei. Membaca buku: 60 murid (20%). Belajar kelompok: 90 murid (30%). Kita perlu mencari a° dan b°.',
      ),
    },
    {
      phase: 'remaining',
      highlight: 'both-unknown',
      revealA: false,
      revealB: false,
      equation: '300 − 60 − 90 = 150',
      hold: 2200,
      result: false,
      caption: t(
        'The remaining 150 students chose either sports or gaming.',
        'Sisa 150 murid memilih olahraga atau bermain game.',
      ),
    },
    {
      phase: 'ratio',
      highlight: 'both-unknown',
      revealA: false,
      revealB: false,
      equation: '2,5 × s = 150  →  s = 60,  game = 90',
      hold: 2600,
      result: false,
      caption: t(
        'Gaming = 1.5 × sports (50% more). So sports + 1.5 × sports = 2.5s = 150 → sports = 60 students, gaming = 90 students.',
        'Game = 1,5 × olahraga (50% lebih banyak). Jadi olahraga + 1,5 × olahraga = 2,5s = 150 → olahraga = 60 murid, game = 90 murid.',
      ),
    },
    {
      phase: 'angle-a',
      highlight: 'game',
      revealA: true,
      revealB: false,
      equation: 'a° = 90 ÷ 300 × 360° = 108°',
      hold: 2200,
      result: false,
      caption: t(
        'Bermain Game sector: 90 out of 300 students → (90/300) × 360° = 108°.',
        'Sektor Bermain Game: 90 dari 300 murid → (90/300) × 360° = 108°.',
      ),
    },
    {
      phase: 'angle-b',
      highlight: 'olahraga',
      revealA: true,
      revealB: true,
      equation: 'b° = 60 ÷ 300 × 360° = 72°',
      hold: 2200,
      result: false,
      caption: t(
        'Olahraga sector: 60 out of 300 students → (60/300) × 360° = 72°.',
        'Sektor Olahraga: 60 dari 300 murid → (60/300) × 360° = 72°.',
      ),
    },
    {
      phase: 'diff',
      highlight: 'all',
      revealA: true,
      revealB: true,
      equation: '108° − 72° = 36°',
      hold: 0,
      result: true,
      caption: t(
        'Difference in degrees = a° − b° = 108° − 72° = 36°.',
        'Selisih sudut = a° − b° = 108° − 72° = 36°.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
