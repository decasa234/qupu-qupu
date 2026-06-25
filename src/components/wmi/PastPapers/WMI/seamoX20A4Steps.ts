/**
 * SEAMOX-20-A-Q4 — Beat-by-beat storyboard for the rectangle-counting explainer.
 *
 * Groups the 12 rectangles into 5 categories, cycling through each with a
 * running total so learners see the systematic approach.
 *
 * Phase legend:
 *  'show'   — initial display, no count yet
 *  'count'  — highlighting a group, running total updates
 *  'result' — final answer revealed
 */

// ── types ─────────────────────────────────────────────────────────────────────

export type SeamoX20A4Phase = 'show' | 'count' | 'result'

export interface SeamoX20A4Step {
  phase: SeamoX20A4Phase
  /** Index into ALL_RECTS for the current highlighted rectangle (null = none). */
  rectIndex: number | null
  /** Running total so far. */
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface SeamoX20A4Storyboard {
  total: number
  steps: SeamoX20A4Step[]
  finalIndex: number
}

// ── builder ───────────────────────────────────────────────────────────────────

export const TOTAL_RECTS = 12

/**
 * Groups of rectangles: each entry names a category and lists the ALL_RECTS
 * indices (0-based) belonging to that group.
 */
const GROUPS: Array<{ labelEn: string; labelId: string; indices: number[] }> = [
  {
    labelEn: '6 unit cells (single)',
    labelId: '6 sel tunggal',
    indices: [0, 1, 2, 3, 4, 5],
  },
  {
    labelEn: '3 left-column spans (L1+L2, L2+L3, L1+L2+L3)',
    labelId: '3 rentang kolom kiri (L1+L2, L2+L3, L1+L2+L3)',
    indices: [6, 7, 8],
  },
  {
    labelEn: '2 right-column spans (bottom pair + full right)',
    labelId: '2 rentang kolom kanan (pasangan bawah + seluruh kanan)',
    indices: [9, 10],
  },
  {
    labelEn: '1 whole-figure rectangle',
    labelId: '1 persegi panjang seluruh gambar',
    indices: [11],
  },
]

export function buildSeamoX20A4Steps(lang: 'en' | 'id'): SeamoX20A4Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SeamoX20A4Step[] = [
    {
      phase: 'show',
      rectIndex: null,
      running: 0,
      hold: 1500,
      result: false,
      caption: t(
        'Count ALL rectangles — unit cells, multi-row spans, and the whole figure!',
        'Hitung SEMUA persegi panjang — sel tunggal, rentang multi-baris, dan seluruh gambar!',
      ),
    },
  ]

  let running = 0

  for (const group of GROUPS) {
    // Emit one beat per rectangle in this group
    for (const idx of group.indices) {
      running++
      steps.push({
        phase: 'count',
        rectIndex: idx,
        running,
        hold: 900,
        result: false,
        caption: t(
          `Rectangle #${running} highlighted. Running total: ${running}.`,
          `Persegi panjang ke-${running} disorot. Total sejauh ini: ${running}.`,
        ),
      })
    }

    // After the group, show a summary beat
    steps.push({
      phase: 'count',
      rectIndex: null,
      running,
      hold: 1400,
      result: false,
      caption: t(
        `${group.labelEn}: ${group.indices.length}. Running total: ${running}.`,
        `${group.labelId}: ${group.indices.length}. Total sejauh ini: ${running}.`,
      ),
    })
  }

  steps.push({
    phase: 'result',
    rectIndex: null,
    running: TOTAL_RECTS,
    hold: 0,
    result: true,
    caption: t(
      `6 + 3 + 2 + 1 = ${TOTAL_RECTS} rectangles in all.`,
      `6 + 3 + 2 + 1 = ${TOTAL_RECTS} persegi panjang seluruhnya.`,
    ),
  })

  return { total: TOTAL_RECTS, steps, finalIndex: steps.length - 1 }
}
