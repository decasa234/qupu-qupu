// SEAMOX-22-A-Q19 — "Find the missing number."
//
// Three circles each divided into 3 sectors by a Y-shaped divider:
//   Circle 1: left=3,  right=1, bottom=8   → 3²  − 1²  =  9 −  1 =   8 ✓
//   Circle 2: left=5,  right=4, bottom=9   → 5²  − 4²  = 25 − 16 =   9 ✓
//   Circle 3: left=13, right=6, bottom=133 → 13² − 6²  = 169 − 36 = 133
//
// Pattern: bottom = left² − right²  (difference of squares)
// Answer: 133.
//
// METHOD (one idea per beat):
//   0. Overview — observe the three circles, look for a rule.
//   1. Circle 1 — try the difference-of-squares hypothesis.
//   2. Circle 1 — confirm: 3² − 1² = 8 ✓  (highlight bottom sector).
//   3. Circle 2 — verify: 5² − 4² = 9 ✓  pattern locked.
//   4. Circle 3 — apply: 13² − 6² = 169 − 36 = ? (reveal pending).
//   5. Circle 3 — reveal answer 133 ✓.

export type Lang = 'en' | 'id'

/** Static circle data — left, right, and bottom sector values. */
export const CIRCLES_DATA = [
  { left: 3,  right: 1, bottom: 8   },
  { left: 5,  right: 4, bottom: 9   },
  { left: 13, right: 6, bottom: 133 },
] as const

export interface CircleSectorsStep {
  /** 0-based index into CIRCLES_DATA for the focused circle. */
  circleIndex: 0 | 1 | 2
  /** Fill the bottom 120° sector with a highlight colour. */
  highlightBottom: boolean
  /** Whether to render the formula annotation badge. */
  showFormula: boolean
  /** If true, show the actual bottom number (133) instead of "?". */
  revealAnswer: boolean
  /** Formula string shown in the badge (empty = no badge). */
  formulaAnnotation: string
  caption: string
  /** true only on the final winning beat. */
  result: boolean
  /** Auto-advance hold in ms; 0 = stays on this beat until next play. */
  hold: number
}

export function buildCircleSectorsX22A19Steps(lang: Lang): CircleSectorsStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  return [
    // Beat 0 — overview
    {
      circleIndex: 0,
      highlightBottom: false,
      showFormula: false,
      revealAnswer: false,
      formulaAnnotation: '',
      caption: t(
        'Each circle has a left, a right, and a bottom number. What rule links them?',
        'Setiap lingkaran punya angka kiri, kanan, dan bawah. Aturan apa yang menghubungkannya?',
      ),
      result: false,
      hold: 2400,
    },

    // Beat 1 — test hypothesis on circle 1
    {
      circleIndex: 0,
      highlightBottom: false,
      showFormula: true,
      revealAnswer: false,
      formulaAnnotation: t('3² − 1² = ?', '3² − 1² = ?'),
      caption: t(
        'Circle 1: try squaring each side number and subtracting — 3² − 1² = ?',
        'Lingkaran 1: coba kuadratkan tiap angka sisi lalu kurangi — 3² − 1² = ?',
      ),
      result: false,
      hold: 2200,
    },

    // Beat 2 — confirm circle 1
    {
      circleIndex: 0,
      highlightBottom: true,
      showFormula: true,
      revealAnswer: false,
      formulaAnnotation: t('3² − 1² = 9 − 1 = 8 ✓', '3² − 1² = 9 − 1 = 8 ✓'),
      caption: t(
        '3² − 1² = 9 − 1 = 8 ✓  It matches the bottom sector!',
        '3² − 1² = 9 − 1 = 8 ✓  Cocok dengan sektor bawah!',
      ),
      result: false,
      hold: 2600,
    },

    // Beat 3 — verify circle 2
    {
      circleIndex: 1,
      highlightBottom: true,
      showFormula: true,
      revealAnswer: false,
      formulaAnnotation: t('5² − 4² = 25 − 16 = 9 ✓', '5² − 4² = 25 − 16 = 9 ✓'),
      caption: t(
        'Circle 2: 5² − 4² = 25 − 16 = 9 ✓  Pattern confirmed!',
        'Lingkaran 2: 5² − 4² = 25 − 16 = 9 ✓  Pola dikonfirmasi!',
      ),
      result: false,
      hold: 2600,
    },

    // Beat 4 — apply to circle 3 (answer still hidden)
    {
      circleIndex: 2,
      highlightBottom: false,
      showFormula: true,
      revealAnswer: false,
      formulaAnnotation: t('13² − 6² = 169 − 36 = ?', '13² − 6² = 169 − 36 = ?'),
      caption: t(
        'Circle 3: apply the rule — 13² − 6² = 169 − 36 = ?',
        'Lingkaran 3: terapkan aturannya — 13² − 6² = 169 − 36 = ?',
      ),
      result: false,
      hold: 2400,
    },

    // Beat 5 — reveal 133
    {
      circleIndex: 2,
      highlightBottom: true,
      showFormula: true,
      revealAnswer: true,
      formulaAnnotation: t('13² − 6² = 169 − 36 = 133 ✓', '13² − 6² = 169 − 36 = 133 ✓'),
      caption: t(
        'The missing number is 133!',
        'Bilangan yang hilang adalah 133!',
      ),
      result: true,
      hold: 0,
    },
  ]
}
