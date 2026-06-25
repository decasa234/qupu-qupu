// SEAMO-21-A-Q7 — storyboard for the coin-triangle animation.
//
// Wattaria places coins along the 3 sides of a triangle, such that there are
// 6 coins on each side. Total = 3 × 6 − 3 = 15. Answer: A.
//
// Teaching walk — one idea per beat:
//   0. intro   — show the coin triangle; state the setup.
//   1. sides   — 3 sides × 6 coins; corner coins turn amber.
//   2. naive   — 3 × 6 = 18 but corners highlighted red.
//   3. corners — spotlight the 3 corner coins that are double-counted.
//   4. fix     — subtract 3 corners: 18 − 3 = 15.
//   5. result  — confirm answer 15, choice A.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'
export type PhaseId = 'intro' | 'sides' | 'naive' | 'corners' | 'fix' | 'result'

export interface TriangleBeat {
  phase: PhaseId
  /** Highlight corner coins differently from edge coins. */
  cornerHighlight: boolean
  /** Colour for corner coins. */
  cornerColor: string
  /** Colour for edge coins. */
  edgeColor: string
  /** Equation pill text. Empty string = hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface TriangleStoryboard {
  steps: TriangleBeat[]
  finalIndex: number
}

const GOLD   = '#F59E0B'
const AMBER  = '#D97706'
const RED    = '#EF4444'
const GREEN  = '#10B981'
const GREY   = '#9CA3AF'

export function buildCoinTriangle21A7Steps(lang: Lang): TriangleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TriangleBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      cornerHighlight: false,
      cornerColor: GOLD,
      edgeColor: GOLD,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Wattaria arranges coins in a triangle. There are 6 coins on each side, and each corner coin is shared by two sides.',
        'Wattaria menyusun koin membentuk segitiga. Ada 6 koin di setiap sisi, dan koin sudut digunakan bersama oleh dua sisi.',
      ),
    },

    // Beat 1 — 6 coins per side
    {
      phase: 'sides',
      cornerHighlight: false,
      cornerColor: AMBER,
      edgeColor: GOLD,
      equation: t('3 sides × 6 coins = ?', '3 sisi × 6 koin = ?'),
      hold: 2200,
      result: false,
      caption: t(
        'Each side has 6 coins. The triangle has 3 sides. A quick count gives 3 × 6 = 18 — but wait!',
        'Setiap sisi punya 6 koin. Segitiga memiliki 3 sisi. Hitung cepat: 3 × 6 = 18 — tapi tunggu dulu!',
      ),
    },

    // Beat 2 — naive overcounting
    {
      phase: 'naive',
      cornerHighlight: false,
      cornerColor: RED,
      edgeColor: GREY,
      equation: t('3 × 6 = 18  (too many!)', '3 × 6 = 18  (terlalu banyak!)'),
      hold: 2400,
      result: false,
      caption: t(
        'If we just multiply 3 × 6 = 18, each corner coin is counted twice — once for each side it belongs to!',
        'Jika kita hanya hitung 3 × 6 = 18, setiap koin sudut dihitung dua kali — sekali untuk setiap sisi yang menyertainya!',
      ),
    },

    // Beat 3 — spotlight the 3 corner coins
    {
      phase: 'corners',
      cornerHighlight: true,
      cornerColor: RED,
      edgeColor: GOLD,
      equation: t('3 corners counted twice', '3 sudut dihitung 2 kali'),
      hold: 2400,
      result: false,
      caption: t(
        'The 3 highlighted corner coins are each shared by 2 sides. They were counted once too many — we need to subtract 3.',
        '3 koin sudut yang disorot masing-masing digunakan oleh 2 sisi. Mereka dihitung satu kali lebih banyak — kita perlu kurangi 3.',
      ),
    },

    // Beat 4 — subtract and get 15
    {
      phase: 'fix',
      cornerHighlight: false,
      cornerColor: GREEN,
      edgeColor: GOLD,
      equation: t('18 − 3 = 15', '18 − 3 = 15'),
      hold: 2400,
      result: false,
      caption: t(
        'Subtract the 3 overcounted corners: 18 − 3 = 15. That is the real total!',
        'Kurangi 3 koin sudut yang dihitung ganda: 18 − 3 = 15. Itulah total yang sebenarnya!',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      cornerHighlight: false,
      cornerColor: GREEN,
      edgeColor: GREEN,
      equation: t('15 coins → Answer A', '15 koin → Jawaban A'),
      hold: 0,
      result: true,
      caption: t(
        'Wattaria uses 15 coins in total. Answer A.',
        'Wattaria menggunakan 15 koin. Jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
