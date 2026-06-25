// HKIMO-20-P2H-Q5 — animated explainer for the staircase star groups.
//
// Animation flow (4 beats):
//   0. intro  — static scene; prompt to count.
//   1. count  — all groups highlighted; sequence 0·1·5·11 shown.
//   2. extend — dim groups; cumulative gap equation shown in amber.
//   3. result — final answer 71 in green.
//
// Reuses StarGroupHK20P2Q5Illustration via its activeGroup prop so the
// beat-by-beat highlight is driven without duplicating any SVG geometry.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import StarGroupHK20P2Q5Illustration from './StarGroupHK20P2Q5Illustration'
import { buildStarGroupHK20P2Q5Steps } from './starGroupHK20P2Q5Steps'

const GREEN = '#10B981'
const AMBER = '#D97706'

export default function StarGroupHK20P2Q5Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildStarGroupHK20P2Q5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.beats.map((b) => b.hold),
  })
  const beat = story.beats[index] ?? story.beats[story.finalIndex]

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Figure panel */}
      <div
        className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
        role="img"
        aria-label={
          lang === 'id'
            ? 'Penjelasan pola kelompok bintang tangga'
            : 'Staircase star group pattern explainer'
        }
      >
        <StarGroupHK20P2Q5Illustration
          lang={lang}
          activeGroup={beat.activeGroup}
        />
      </div>

      {/* Equation strip */}
      {beat.equation && (
        <div
          className="rounded bg-amber-50 px-4 py-1.5 text-center font-mono text-sm font-semibold"
          style={{ color: beat.result ? GREEN : AMBER }}
        >
          {beat.equation}
        </div>
      )}

      {/* Caption */}
      <p className="text-center text-sm font-medium text-gray-700 px-2">
        {beat.caption}
      </p>
    </div>
  )
}
