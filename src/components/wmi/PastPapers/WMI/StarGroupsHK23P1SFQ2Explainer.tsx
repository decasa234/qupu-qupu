// HKIMO-23-P1SF-Q2 — animated explainer for the cross-shaped star groups.
//
// Beat flow:
//   0. intro  — static scene; prompt to count.
//   1. count  — all groups highlighted; sequence 1·5·9·13 shown.
//   2. extend — equation "13+4=17 → 17+4=21" in amber.
//   3. result — formula "4×6−3=21" in green.
//
// Reuses StarGroupsHK23P1SFQ2Illustration via its activeGroup prop so no
// SVG geometry is duplicated here.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import StarGroupsHK23P1SFQ2Illustration from './StarGroupsHK23P1SFQ2Illustration'
import { buildStarGroupsHK23P1SFQ2Steps } from './starGroupsHK23P1SFQ2Steps'

const GREEN = '#10B981'
const AMBER = '#D97706'

export default function StarGroupsHK23P1SFQ2Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildStarGroupsHK23P1SFQ2Steps(lang), [lang])
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
            ? 'Penjelasan pola kelompok bintang silang'
            : 'Cross star group pattern explainer'
        }
      >
        <StarGroupsHK23P1SFQ2Illustration
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
