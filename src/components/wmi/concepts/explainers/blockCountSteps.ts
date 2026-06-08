export type Lang = 'en' | 'id'

export interface BlockCountGroup {
  depth: number
  width: number
  heights: number[]
}

export interface BlockCountStep {
  /** Index of the group highlighted in this beat, or -1 for the intro/result beat. */
  groupIndex: number
  /** Running total of cubes counted so far. */
  runningTotal: number
  caption: string
  /** How long to hold this beat on screen, in ms (0 = final/result beat, holds indefinitely). */
  hold: number
  result: boolean
}

export interface BlockCountStoryboard {
  groups: BlockCountGroup[]
  /** Per-group cube counts. */
  groupTotals: number[]
  total: number
  steps: BlockCountStep[]
  /** Index of the last step (always steps.length − 1; the result beat). */
  finalIndex: number
}

function clampGroups(raw: unknown): BlockCountGroup[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((g): BlockCountGroup[] => {
    if (typeof g !== 'object' || g === null) return []
    const depth = Number((g as Record<string, unknown>).depth)
    const width = Number((g as Record<string, unknown>).width)
    const heights = (g as Record<string, unknown>).heights
    if (!Number.isFinite(depth) || !Number.isFinite(width)) return []
    if (!Array.isArray(heights)) return []
    const hs = heights.map(Number).filter(Number.isFinite)
    return [{ depth: Math.max(1, Math.round(depth)), width: Math.max(1, Math.round(width)), heights: hs }]
  })
}

function groupCubeCount(g: BlockCountGroup): number {
  if (!Array.isArray(g.heights)) return 0
  return g.heights.reduce((s, h) => s + (Number.isFinite(h) ? Math.max(0, h) : 0), 0)
}

export function buildBlockCountSteps(groupsRaw: unknown, lang: Lang): BlockCountStoryboard {
  const groups = clampGroups(groupsRaw)
  const groupTotals = groups.map(groupCubeCount)
  const total = groupTotals.reduce((s, t) => s + t, 0)
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BlockCountStep[] = []

  // Beat 0 — intro: show all groups, nothing highlighted yet.
  steps.push({
    groupIndex: -1,
    runningTotal: 0,
    caption: t(
      `The figure has ${groups.length} separate group${groups.length !== 1 ? 's' : ''} of blocks. Count each group one at a time.`,
      `Gambar memiliki ${groups.length} kelompok balok yang terpisah. Hitung setiap kelompok satu per satu.`,
    ),
    hold: 2000,
    result: false,
  })

  // One beat per group: highlight it, show its count and running total.
  let running = 0
  for (let i = 0; i < groups.length; i++) {
    running += groupTotals[i]
    const isLast = i === groups.length - 1
    steps.push({
      groupIndex: i,
      runningTotal: running,
      caption: t(
        `Group ${i + 1}: ${groupTotals[i]} cube${groupTotals[i] !== 1 ? 's' : ''} (each column solid top to bottom). Running total: ${running}.`,
        `Kelompok ${i + 1}: ${groupTotals[i]} balok (tiap kolom padat dari atas ke bawah). Total sementara: ${running}.`,
      ),
      hold: isLast ? 0 : 2200,
      result: false,
    })
  }

  // Final result beat — equation.
  const equation = groupTotals.join(' + ')
  steps.push({
    groupIndex: -1,
    runningTotal: total,
    caption: t(
      `${equation} = ${total} cubes in total.`,
      `${equation} = ${total} balok seluruhnya.`,
    ),
    hold: 0,
    result: true,
  })

  return {
    groups,
    groupTotals,
    total,
    steps,
    finalIndex: steps.length - 1,
  }
}
