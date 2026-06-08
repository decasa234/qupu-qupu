export type Lang = 'en' | 'id'

export interface MakeGroupsLeftoverStep {
  /** How many full groups have been formed so far. */
  groupsFormed: number
  /** Whether the leftover dots are highlighted (final phase). */
  highlightLeftover: boolean
  caption: string
  /** Hold duration in ms; 0 = final beat (stays). */
  hold: number
  result: boolean
}

export interface MakeGroupsLeftoverStoryboard {
  total: number
  groupSize: number
  /** Number of full groups = Math.floor(total / groupSize). */
  groups: number
  /** Leftover = total % groupSize (this is also the answer). */
  leftover: number
  steps: MakeGroupsLeftoverStep[]
  finalIndex: number
}

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo
  return Math.max(lo, Math.min(hi, Math.round(n)))
}

/**
 * Builds a beat-by-beat storyboard for the "make groups + leftover" strategy:
 *
 *  Beat 0     : show all total dots (no groups formed yet)
 *  Beats 1..g : reveal each full group one at a time (running group count)
 *  Beat g+1   : highlight the leftover dots; show the division identity caption
 *
 * The answer is always `total % groupSize` (the leftover).
 *
 * Defensive: total capped at 24 (for visual clarity), groupSize 2–9.
 */
export function buildMakeGroupsLeftoverSteps(
  totalRaw: number,
  groupSizeRaw: number,
  lang: Lang = 'en',
): MakeGroupsLeftoverStoryboard {
  const groupSize = clamp(groupSizeRaw, 2, 9)
  // Cap total at 24 for a tidy grid. Also ensure total >= groupSize so at least
  // one group exists.
  const totalClamped = clamp(totalRaw, groupSize + 1, 24)
  const groups = Math.floor(totalClamped / groupSize)
  const leftover = totalClamped % groupSize

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MakeGroupsLeftoverStep[] = []

  // Beat 0: show all dots, no groups yet.
  steps.push({
    groupsFormed: 0,
    highlightLeftover: false,
    caption: t(
      `${totalClamped} counters. Make groups of ${groupSize}.`,
      `${totalClamped} benda. Buat kelompok berisi ${groupSize}.`,
    ),
    hold: 1400,
    result: false,
  })

  // Beats 1..groups: form one group at a time.
  for (let g = 1; g <= groups; g++) {
    const last = g === groups
    steps.push({
      groupsFormed: g,
      highlightLeftover: false,
      caption: t(
        `Group ${g}: ${g} × ${groupSize} = ${g * groupSize} grouped.`,
        `Kelompok ${g}: ${g} × ${groupSize} = ${g * groupSize} sudah dikelompokkan.`,
      ),
      hold: last && leftover === 0 ? 0 : 1400,
      result: last && leftover === 0,
    })
  }

  // Final beat: highlight leftover (or if leftover === 0 it's already the final above).
  if (leftover > 0) {
    steps.push({
      groupsFormed: groups,
      highlightLeftover: true,
      caption: t(
        `${totalClamped} = ${groups} × ${groupSize} + ${leftover}. Leftover: ${leftover}.`,
        `${totalClamped} = ${groups} × ${groupSize} + ${leftover}. Sisa: ${leftover}.`,
      ),
      hold: 0,
      result: true,
    })
  }

  return {
    total: totalClamped,
    groupSize,
    groups,
    leftover,
    steps,
    finalIndex: steps.length - 1,
  }
}
