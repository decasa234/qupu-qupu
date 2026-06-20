// IKMC-19-PE-Q15 — storyboard for the tile floor animation.
//
// The question: identical rectangular tiles cover a floor. Short side = 1 m.
// Find the length of the "?" side. Answer E = 12 m.
//
// Strategy (three moves):
//   1. Find the tile's LONG side using the cross-tiling pattern:
//      3 horizontal tiles stacked = 1 vertical tile's height → long side = 3 m.
//   2. Count tiles along the "?" side: 4 vertical tiles × 3 m each.
//   3. Multiply: 4 × 3 = 12 m → answer E.
//
// Teaching walk, one idea per beat:
//   0. intro    — show the static floor; state the known short side = 1 m.
//   1. pattern  — highlight the cross-section: 3 short sides = 1 long side.
//   2. long     — conclude: long side of tile = 3 m.
//   3. count    — highlight the 4 vertical tiles on the "?" side and count them.
//   4. result   — 4 × 3 m = 12 m → answer E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type TilePhase = 'intro' | 'pattern' | 'long' | 'count' | 'result'

export interface TileBeat {
  phase: TilePhase
  /** Highlight the cross-section comparing 3 short tiles to 1 long tile. */
  showCrossSection: boolean
  /** Show the "3 m" label on the long side of the first vertical tile. */
  showLongLabel: boolean
  /** Highlight the 4 vertical tiles along the "?" side. */
  highlightSide: boolean
  /** Show the running × equation (e.g. "4 × 3 m"). */
  showCount: boolean
  /** Equation string shown in the pill ('' to hide). */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface TileStoryboard {
  steps: TileBeat[]
  finalIndex: number
}

export function buildTileFloor15Steps(lang: Lang): TileStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TileBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showCrossSection: false,
      showLongLabel: false,
      highlightSide: false,
      showCount: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Identical rectangular tiles cover the floor. The short side of each tile is 1 m. What is the length of the "?" side?',
        'Ubin persegi panjang identik menutupi lantai. Sisi pendek setiap ubin = 1 m. Berapa panjang sisi "?"?',
      ),
    },

    // Beat 1 — cross-section: show 3 horizontal = 1 vertical
    {
      phase: 'pattern',
      showCrossSection: true,
      showLongLabel: false,
      highlightSide: false,
      showCount: false,
      equation: '3 × 1 m',
      hold: 2400,
      result: false,
      caption: t(
        'Look at the cross-pattern: 3 horizontal tiles (each 1 m tall) fill the same height as 1 vertical tile.',
        'Perhatikan pola silang: 3 ubin horizontal (masing-masing 1 m tinggi) mengisi tinggi yang sama dengan 1 ubin vertikal.',
      ),
    },

    // Beat 2 — long side = 3 m
    {
      phase: 'long',
      showCrossSection: true,
      showLongLabel: true,
      highlightSide: false,
      showCount: false,
      equation: '3 × 1 m = 3 m',
      hold: 2200,
      result: false,
      caption: t(
        'So the long side of each tile = 3 × 1 m = 3 m.',
        'Jadi sisi panjang setiap ubin = 3 × 1 m = 3 m.',
      ),
    },

    // Beat 3 — count 4 tiles along the "?" side
    {
      phase: 'count',
      showCrossSection: false,
      showLongLabel: true,
      highlightSide: true,
      showCount: true,
      equation: '4 × 3 m',
      hold: 2200,
      result: false,
      caption: t(
        'Count the vertical tiles along the "?" side: there are 4 tiles, each 3 m long.',
        'Hitung ubin vertikal di sisi "?": ada 4 ubin, masing-masing sepanjang 3 m.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      showCrossSection: false,
      showLongLabel: true,
      highlightSide: true,
      showCount: true,
      equation: '4 × 3 m = 12 m',
      hold: 0,
      result: true,
      caption: t(
        '4 × 3 m = 12 m — answer E.',
        '4 × 3 m = 12 m — jawaban E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
