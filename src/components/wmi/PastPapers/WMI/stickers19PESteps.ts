// IKMC-22-PE-Q19 — storyboard for sticker-ordering animation.
//
// Problem: Ann has 4 stickers (circle, square, star, triangle).
//   - Star is placed AFTER square  (square < star)
//   - Star is placed BEFORE triangle (star < triangle)
//   - Circle can go anywhere.
//   → Required order: square → star → triangle (circle unconstrained)
//
// Key insight: a sticker placed LATER appears ON TOP of earlier ones where they
// overlap. So in the final picture:
//   - Star must be on top of square (where they overlap)
//   - Triangle must be on top of star (where they overlap)
//   - Circle can be above or below any of the others.
//
// Teaching walk, one idea per beat:
//   0. intro      — show all 4 stickers; state the task.
//   1. rule1      — "star after square" → star on top of square at overlaps.
//   2. rule2      — "star before triangle" → triangle on top of star at overlaps.
//   3. combined   — full order: square → star → triangle; circle free.
//   4. check      — verify option E: tri covers star, star covers sq. ✓
//   5. result     — answer is E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId =
  | 'intro'
  | 'rule1'
  | 'rule2'
  | 'combined'
  | 'check'
  | 'result'

export interface AnimBeat {
  phase: PhaseId
  /** Which stickers to highlight (pulse ring). */
  highlight: ReadonlyArray<'circle' | 'square' | 'star' | 'triangle'>
  /** Equation / maths line to display; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Stickers19PEStoryboard {
  steps: AnimBeat[]
  finalIndex: number
}

export function buildStickers19PESteps(lang: Lang): Stickers19PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AnimBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlight: [],
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Ann has 4 stickers. The order she sticks them determines which one ends up on top when they overlap.',
        'Ann punya 4 stiker. Urutan penempelan menentukan mana yang berada di atas saat bertumpang tindih.',
      ),
    },

    // Beat 1 — rule 1: star after square
    {
      phase: 'rule1',
      highlight: ['square', 'star'],
      equation: t('square → star', 'persegi → bintang'),
      hold: 2400,
      result: false,
      caption: t(
        '"Star after square" → wherever they overlap, star sits ON TOP of the square.',
        '"Bintang setelah persegi" → di mana pun bertumpang tindih, bintang berada DI ATAS persegi.',
      ),
    },

    // Beat 2 — rule 2: star before triangle
    {
      phase: 'rule2',
      highlight: ['star', 'triangle'],
      equation: t('star → triangle', 'bintang → segitiga'),
      hold: 2400,
      result: false,
      caption: t(
        '"Star before triangle" → wherever they overlap, triangle sits ON TOP of the star.',
        '"Bintang sebelum segitiga" → di mana pun bertumpang tindih, segitiga berada DI ATAS bintang.',
      ),
    },

    // Beat 3 — combined order
    {
      phase: 'combined',
      highlight: ['square', 'star', 'triangle'],
      equation: t('square → star → triangle', 'persegi → bintang → segitiga'),
      hold: 2600,
      result: false,
      caption: t(
        'So the full sticking order must be: square first, then star, then triangle. Circle can go anywhere.',
        'Jadi urutan penempelan harus: persegi pertama, lalu bintang, lalu segitiga. Lingkaran bisa kapan saja.',
      ),
    },

    // Beat 4 — check option E
    {
      phase: 'check',
      highlight: ['circle', 'square', 'star', 'triangle'],
      equation: t('E: sq < star < tri ✓', 'E: persegi < bintang < segitiga ✓'),
      hold: 2400,
      result: false,
      caption: t(
        'In picture E: triangle covers star, star covers square — all overlaps match the required order!',
        'Pada gambar E: segitiga menutupi bintang, bintang menutupi persegi — semua tumpang tindih sesuai urutan!',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      highlight: ['circle', 'square', 'star', 'triangle'],
      equation: t('Answer: E', 'Jawaban: E'),
      hold: 0,
      result: true,
      caption: t(
        'Only picture E shows square → star → triangle stacking order. Answer E.',
        'Hanya gambar E yang menunjukkan urutan tumpukan persegi → bintang → segitiga. Jawaban E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
