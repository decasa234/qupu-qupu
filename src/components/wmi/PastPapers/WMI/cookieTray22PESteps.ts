// IKMC-21-PE-Q22 — storyboard for the cookie tray / plate animation.
//
// The question: each participant baked one tray of 10 cookies (2×5 grid,
// 5 distinct shapes). The plate has 12 cookies. What is the minimum number
// of trays needed to fill the plate? → Answer C (3).
//
// Teaching walk, one idea per beat:
//   0. intro    — show both figures; state the question.
//   1. tray     — highlight the tray pattern: 10 cookies, 5 shapes.
//   2. count    — count the cookies on the plate: 12 total.
//   3. group1   — light the first tray-group on the plate (4 cookies from tray 1).
//   4. group2   — light the second tray-group (4 cookies from tray 2).
//   5. group3   — light the third tray-group (4 cookies from tray 3).
//   6. result   — minimum 3 trays → answer C.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type CookieTrayPhase =
  | 'intro'
  | 'tray'
  | 'count'
  | 'group1'
  | 'group2'
  | 'group3'
  | 'result'

export interface CookieTrayBeat {
  phase: CookieTrayPhase
  /** Which cookie indices (0-9) to highlight on the tray (null = none). */
  litTrayIndices: number[] | null
  /** Which tray-group index (0/1/2) to highlight on the plate (null = none). */
  litPlateGroup: number | null
  /** Equation / count line; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CookieTrayStoryboard {
  steps: CookieTrayBeat[]
  finalIndex: number
}

export function buildCookieTray22PESteps(lang: Lang): CookieTrayStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CookieTrayBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      litTrayIndices: null,
      litPlateGroup: null,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Each participant baked one tray of cookies (left). We need to fill the plate (right). What is the minimum number of trays needed?',
        'Setiap peserta memanggang satu nampan kue (kiri). Kita perlu mengisi piring (kanan). Berapa nampan minimum yang diperlukan?',
      ),
    },

    // Beat 1 — identify the tray pattern
    {
      phase: 'tray',
      litTrayIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      litPlateGroup: null,
      equation: '1 nampan = 10 kue',
      hold: 2000,
      result: false,
      caption: t(
        'One tray holds 10 cookies arranged in 2 rows of 5 — a fixed pattern.',
        'Satu nampan berisi 10 kue dalam 2 baris × 5 kolom — pola tetap.',
      ),
    },

    // Beat 2 — count the plate cookies
    {
      phase: 'count',
      litTrayIndices: null,
      litPlateGroup: null,
      equation: t('Plate: 12 cookies', 'Piring: 12 kue'),
      hold: 2000,
      result: false,
      caption: t(
        'The plate has 12 cookies. Can 1 tray (10 cookies) fill it? No — not enough. Can 2 trays (20 cookies)? We need to check the shapes.',
        'Piring berisi 12 kue. Cukup 1 nampan (10 kue)? Tidak. Cukup 2 nampan? Kita perlu cek bentuknya.',
      ),
    },

    // Beat 3 — tray group 1 (red)
    {
      phase: 'group1',
      litTrayIndices: null,
      litPlateGroup: 0,
      equation: t('Tray 1 →', 'Nampan 1 →'),
      hold: 2000,
      result: false,
      caption: t(
        'The red cookies come from the first tray (4 cookies from tray 1 placed on the plate).',
        'Kue merah berasal dari nampan pertama (4 kue dari nampan 1 diletakkan di piring).',
      ),
    },

    // Beat 4 — tray group 2 (blue)
    {
      phase: 'group2',
      litTrayIndices: null,
      litPlateGroup: 1,
      equation: t('Tray 2 →', 'Nampan 2 →'),
      hold: 2000,
      result: false,
      caption: t(
        'The blue cookies come from the second tray — we need a second tray to add more cookies.',
        'Kue biru berasal dari nampan kedua — kita perlu nampan kedua untuk menambah kue.',
      ),
    },

    // Beat 5 — tray group 3 (green)
    {
      phase: 'group3',
      litTrayIndices: null,
      litPlateGroup: 2,
      equation: t('Tray 3 →', 'Nampan 3 →'),
      hold: 2000,
      result: false,
      caption: t(
        'The green cookies come from a third tray. The plate needs cookies from 3 separate trays.',
        'Kue hijau berasal dari nampan ketiga. Piring membutuhkan kue dari 3 nampan berbeda.',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      litTrayIndices: null,
      litPlateGroup: null,
      equation: t('3 trays → C', '3 nampan → C'),
      hold: 0,
      result: true,
      caption: t(
        'The plate needs at least 3 trays of cookies. Answer: C (3).',
        'Piring membutuhkan minimal 3 nampan kue. Jawaban: C (3).',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
