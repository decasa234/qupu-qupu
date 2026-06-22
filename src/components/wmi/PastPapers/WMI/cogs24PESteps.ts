// cogs24PESteps.ts
// Steps storyboard for IKMC-21-PE-Q24 cog-rotation explainer.
// One idea per beat, building up to answer C.
//
// Teaching walk:
//   0. intro       — show the starting state; identify both black teeth
//   1. count       — count the teeth: small = 8, large = 16
//   2. ratio       — tooth ratio: 8:16 = 1:2, so large cog turns half as much
//   3. direction   — gears mesh → spin in opposite directions (small CW → large CCW)
//   4. small-turn  — small cog makes 1 full turn → black tooth returns to start!
//   5. large-turn  — large cog turns 1/2 turn (180°) CCW → black tooth moves to 5 o'clock
//   6. result      — match answer C
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type CogsPhaseId =
  | 'intro'
  | 'count'
  | 'ratio'
  | 'direction'
  | 'small-turn'
  | 'large-turn'
  | 'result'

export interface CogsBeat {
  /** Which animation phase this beat belongs to. */
  phase: CogsPhaseId
  /**
   * Angle of the small cog's black tooth in degrees (0=top, CW).
   * Used to drive the CogsPair render in the explainer.
   */
  smallToothDeg: number
  /**
   * Angle of the large cog's black tooth in degrees.
   */
  largeToothDeg: number
  /** Show tooth-count labels on the cogs. */
  showCounts: boolean
  /** Show the 1:2 ratio callout. */
  showRatio: boolean
  /** Show the direction arrows on both cogs. */
  showArrows: boolean
  /** Highlight the small cog with a "1 full turn" animation cue. */
  showSmallTurn: boolean
  /** Highlight the large cog with a "½ turn" animation cue. */
  showLargeTurn: boolean
  /** Equation / maths line displayed below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CogsStoryboard {
  steps: CogsBeat[]
  finalIndex: number
}

// Starting positions (initial state before rotation)
const SMALL_START = 150  // ~5 o'clock on small cog (mesh contact)
const LARGE_START = 330  // ~11 o'clock on large cog (mesh contact)
// Final positions after 1 full CW turn of the small cog:
const SMALL_END = 150    // small cog returns to start (1 full turn)
const LARGE_END = 150    // large cog 330° − 180° = 150° (half turn CCW)

export function buildCogs24PESteps(lang: Lang): CogsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CogsBeat[] = [
    // Beat 0 — intro: show the static scene, identify the two black teeth
    {
      phase: 'intro',
      smallToothDeg: SMALL_START,
      largeToothDeg: LARGE_START,
      showCounts: false,
      showRatio: false,
      showArrows: false,
      showSmallTurn: false,
      showLargeTurn: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Two meshing cogs — each with a black tooth. The small (pink) cog is on the left, the large (blue) cog is on the right. The black teeth start at the mesh point.',
        'Dua roda gigi yang saling berkaitan — masing-masing punya satu gigi hitam. Roda kecil (merah muda) di kiri, roda besar (biru) di kanan. Gigi hitam mulai di titik pertemuan.',
      ),
    },

    // Beat 1 — count the teeth
    {
      phase: 'count',
      smallToothDeg: SMALL_START,
      largeToothDeg: LARGE_START,
      showCounts: true,
      showRatio: false,
      showArrows: false,
      showSmallTurn: false,
      showLargeTurn: false,
      equation: '8 : 16',
      hold: 2400,
      result: false,
      caption: t(
        'Count the teeth: the small cog has 8 teeth, the large cog has 16 teeth.',
        'Hitung giginya: roda kecil punya 8 gigi, roda besar punya 16 gigi.',
      ),
    },

    // Beat 2 — gear ratio
    {
      phase: 'ratio',
      smallToothDeg: SMALL_START,
      largeToothDeg: LARGE_START,
      showCounts: true,
      showRatio: true,
      showArrows: false,
      showSmallTurn: false,
      showLargeTurn: false,
      equation: '8 ÷ 16 = ½',
      hold: 2400,
      result: false,
      caption: t(
        'The large cog has twice as many teeth. So for every 1 full turn of the small cog, the large cog turns only ½ turn (180°).',
        'Roda besar punya dua kali lebih banyak gigi. Jadi setiap 1 putaran penuh roda kecil, roda besar hanya berputar ½ putaran (180°).',
      ),
    },

    // Beat 3 — direction of rotation
    {
      phase: 'direction',
      smallToothDeg: SMALL_START,
      largeToothDeg: LARGE_START,
      showCounts: false,
      showRatio: false,
      showArrows: true,
      showSmallTurn: false,
      showLargeTurn: false,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'Meshing gears always spin in opposite directions. Small cog turns clockwise (CW) → large cog turns counter-clockwise (CCW).',
        'Roda gigi yang berkaitan selalu berputar ke arah berlawanan. Roda kecil berputar searah jarum jam (CW) → roda besar berlawanan jarum jam (CCW).',
      ),
    },

    // Beat 4 — small cog completes 1 full turn
    {
      phase: 'small-turn',
      smallToothDeg: SMALL_END,
      largeToothDeg: LARGE_START,
      showCounts: false,
      showRatio: false,
      showArrows: true,
      showSmallTurn: true,
      showLargeTurn: false,
      equation: '1 full turn → back to start',
      hold: 2400,
      result: false,
      caption: t(
        'After 1 full clockwise turn, the small cog\'s black tooth returns to the same position — it\'s back where it started!',
        'Setelah 1 putaran penuh searah jarum jam, gigi hitam roda kecil kembali ke posisi awal — tepat seperti semula!',
      ),
    },

    // Beat 5 — large cog rotates 180° CCW
    {
      phase: 'large-turn',
      smallToothDeg: SMALL_END,
      largeToothDeg: LARGE_END,
      showCounts: false,
      showRatio: false,
      showArrows: false,
      showSmallTurn: false,
      showLargeTurn: true,
      equation: '330° − 180° = 150°',
      hold: 2400,
      result: false,
      caption: t(
        'The large cog rotated ½ turn (180°) counter-clockwise. Its black tooth moved from 11 o\'clock to 5 o\'clock.',
        'Roda besar berputar ½ putaran (180°) berlawanan jarum jam. Gigi hitamnya berpindah dari posisi jam 11 ke posisi jam 5.',
      ),
    },

    // Beat 6 — result: answer C
    {
      phase: 'result',
      smallToothDeg: SMALL_END,
      largeToothDeg: LARGE_END,
      showCounts: false,
      showRatio: false,
      showArrows: false,
      showSmallTurn: false,
      showLargeTurn: false,
      equation: '→ Answer C',
      hold: 0,
      result: true,
      caption: t(
        'Small cog\'s black tooth is back at the start (5 o\'clock). Large cog\'s black tooth moved to 5 o\'clock. This matches answer C!',
        'Gigi hitam roda kecil kembali ke awal (jam 5). Gigi hitam roda besar berpindah ke posisi jam 5. Ini sesuai dengan jawaban C!',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
