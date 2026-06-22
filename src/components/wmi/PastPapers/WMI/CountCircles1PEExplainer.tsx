// Post-answer explainer for IKMC-23-PE-Q1 (2023 IKMC Pre-Ecolier, Q1).
//
// Reuses CircleFacePrimitive from CountCircles1PEIllustration so the
// animation reads as the exact same figure coming alive — circles are
// highlighted one by one in id order (1..8), with a running count badge,
// landing on "8 circles — answer D."

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CircleFacePrimitive, SVG_W, SVG_H, COLOR, TOTAL_CIRCLES } from './CountCircles1PEIllustration'
import { buildCountCircles1PESteps } from './countCircles1PESteps'

const GREEN = '#10B981'
const GREEN_DEEP = '#065F46'
const GREEN_BG = '#D1FAE5'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function CountCircles1PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildCountCircles1PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const ariaLabel = t(
    `Explainer: count each circle one by one. There are ${TOTAL_CIRCLES} circles in total — answer D.`,
    `Penjelasan: hitung setiap lingkaran satu per satu. Ada ${TOTAL_CIRCLES} lingkaran seluruhnya — jawaban D.`,
  )

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_DEEP }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  // Running count label shown alongside the figure during counting beats.
  const showCount = beat.highlighted > 0
  const countText = isResult
    ? t(`${TOTAL_CIRCLES} circles`, `${TOTAL_CIRCLES} lingkaran`)
    : beat.highlighted > 0
      ? t(`${beat.highlighted} so far`, `${beat.highlighted} sejauh ini`)
      : ''

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Figure with circle-by-circle highlight */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(280, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />
          <CircleFacePrimitive
            highlighted={beat.highlighted}
            mode={beat.highlighted > 0 ? 'count' : 'static'}
          />
        </svg>

        {/* Running count chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          {showCount && (
            <span
              className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums"
              style={{ background: isResult ? GREEN : BLUE, color: '#FFFFFF' }}
            >
              {countText}
            </span>
          )}
        </div>

        {/* Caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
