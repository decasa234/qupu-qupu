// Storyboard builder for WMI-22F3A-Q21 — four rectangles pinwheeled around a
// shaded starred centre region.  Answer = 30.
//
// Method: side-lengths + the 4 / 4 / 3 offsets (matches the scan's labels).
//   1. TOP 56 = 7 × 8 → 8 tall.  LEFT 45 = 9 × 5 → 5 wide.  RIGHT 48 = 8 × 6.
//   2. Shaded height: LEFT's top is 4 below TOP's top → 8 − 4 = 4 of LEFT's 9
//      lies above the star → height = 9 − 4 = 5.
//   3. BOTTOM: starts at the star's bottom, ends 3 below RIGHT's bottom →
//      height = 8 + 3 − 5 = 6 → width = 42 ÷ 6 = 7.
//   4. Shaded width: BOTTOM's left edge is 4 right of LEFT's left edge, i.e.
//      5 − 4 = 1 left of the star → width = 7 − 1 = 6.
//   5. Shaded area = 5 × 6 = 30.

export type Lang = 'en' | 'id'

// Which piece is being highlighted in a given beat.
export type HighlightPhase =
  | 'none'
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'all_four'
  | 'enclosing'
  | 'star'

export interface RectFrameStep {
  /** Piece(s) to highlight in the RectFrame primitive. */
  highlight: string[]
  /** Arithmetic expression shown in the annotation chip. */
  equation: string
  /** True on the final winner beat. */
  result: boolean
  /** Caption text. */
  caption: string
  /** Hold in ms; 0 = final beat (no auto-advance). */
  hold: number
}

export interface RectFrameStoryboard {
  steps: RectFrameStep[]
  finalIndex: number
  answer: number
}

// Piece dimensions (verified: see illustration header).
//   TOP 7 × 8 = 56   LEFT 5 × 9 = 45   RIGHT 6 × 8 = 48   BOTTOM 7 × 6 = 42
// Shaded region: height = 9 − (8 − 4) = 5, width = 7 − (5 − 4) = 6.
const STAR_H = 9 - (8 - 4)   // 5
const STAR_W = 7 - (5 - 4)   // 6
const ANSWER = STAR_H * STAR_W  // 30

export function buildRectFrameSteps(lang: Lang): RectFrameStoryboard {
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)

  const steps: RectFrameStep[] = []

  // Beat 0 — intro: show the puzzle, nothing highlighted yet.
  steps.push({
    highlight: [],
    equation: '',
    result: false,
    hold: 1700,
    caption: t(
      'Four rectangles surround a shaded region ★. We need its area!',
      'Empat persegi panjang mengelilingi daerah berbintang ★. Cari luasnya!',
    ),
  })

  // Beat 1 — TOP rectangle: 56 = 7 × 8, so missing side = 8.
  steps.push({
    highlight: ['top'],
    equation: '56 = 7 × 8',
    result: false,
    hold: 2000,
    caption: t(
      'TOP: area 56, side 7 → other side = 56 ÷ 7 = 8.',
      'ATAS: luas 56, sisi 7 → sisi lain = 56 ÷ 7 = 8.',
    ),
  })

  // Beat 2 — LEFT rectangle: 45 = 9 × 5, so missing side = 5.
  steps.push({
    highlight: ['left'],
    equation: '45 = 9 × 5',
    result: false,
    hold: 2000,
    caption: t(
      'LEFT: area 45, side 9 → other side = 45 ÷ 9 = 5.',
      'KIRI: luas 45, sisi 9 → sisi lain = 45 ÷ 9 = 5.',
    ),
  })

  // Beat 3 — shaded height from the top-left "4" offset.
  steps.push({
    highlight: ['left', 'star'],
    equation: '9 − (8 − 4) = 5',
    result: false,
    hold: 2600,
    caption: t(
      "LEFT's top is 4 below TOP's top, so 8 − 4 = 4 of its 9 lies above ★ → ★ height = 9 − 4 = 5.",
      'Puncak KIRI berada 4 di bawah puncak ATAS, jadi 8 − 4 = 4 dari 9-nya ada di atas ★ → tinggi ★ = 9 − 4 = 5.',
    ),
  })

  // Beat 4 — RIGHT rectangle: 48 = 8 × 6, so missing side = 6.
  steps.push({
    highlight: ['right'],
    equation: '48 = 8 × 6',
    result: false,
    hold: 2000,
    caption: t(
      'RIGHT: area 48, side 8 → other side = 48 ÷ 8 = 6.',
      'KANAN: luas 48, sisi 8 → sisi lain = 48 ÷ 8 = 6.',
    ),
  })

  // Beat 5 — BOTTOM rectangle via the "3" offset: height 8 + 3 − 5 = 6, width 7.
  steps.push({
    highlight: ['right', 'bottom'],
    equation: '42 ÷ (8 + 3 − 5) = 7',
    result: false,
    hold: 2600,
    caption: t(
      "BOTTOM starts at ★'s bottom and ends 3 below RIGHT → height = 8 + 3 − 5 = 6, so width = 42 ÷ 6 = 7.",
      'BAWAH mulai dari dasar ★ dan berakhir 3 di bawah KANAN → tinggi = 8 + 3 − 5 = 6, jadi lebar = 42 ÷ 6 = 7.',
    ),
  })

  // Beat 6 — shaded width from the bottom-left "4" offset.
  steps.push({
    highlight: ['bottom', 'star'],
    equation: '7 − (5 − 4) = 6',
    result: false,
    hold: 2600,
    caption: t(
      "BOTTOM's left edge is 4 right of LEFT's edge — that is 5 − 4 = 1 left of ★ → ★ width = 7 − 1 = 6.",
      'Tepi kiri BAWAH berada 4 di kanan tepi KIRI — yaitu 5 − 4 = 1 di kiri ★ → lebar ★ = 7 − 1 = 6.',
    ),
  })

  // Beat 7 (final) — shaded area = 5 × 6 = 30.
  steps.push({
    highlight: ['star'],
    equation: `${STAR_H} × ${STAR_W} = ${ANSWER}`,
    result: true,
    hold: 0,
    caption: t(
      `★ area = ${STAR_H} × ${STAR_W} = ${ANSWER}.`,
      `Luas ★ = ${STAR_H} × ${STAR_W} = ${ANSWER}.`,
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: ANSWER }
}
