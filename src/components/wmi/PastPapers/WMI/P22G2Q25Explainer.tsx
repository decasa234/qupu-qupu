// Beat-by-beat explainer for WMI-22P2A-Q25 (pack the most 16-sum trios → 13, D).
//
// Reuses the ShapeLegend primitive from P22G2Q25Illustration so the animation
// reads as the same scene. The scan provides only the six allowed shapes (no
// number grid), so this teaches the PACKING METHOD: valid group = three touching
// squares summing to 16; groups can't overlap; greedily pack the most, which
// reaches 13 (answer D). A running "placed" chip counts the groups.

import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ShapeLegend, VIEW_W, VIEW_H } from './P22G2Q25Illustration'
import { buildP22G2Q25Steps, TARGET_SUM, ANSWER } from './p22G2Q25Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function P22G2Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G2Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: kelompok sah = tiga kotak bersentuhan berjumlah ${TARGET_SUM}, tak tumpang tindih; paling banyak ${ANSWER} kelompok — jawaban D.`
      : `Explainer: a valid group is three touching squares summing to ${TARGET_SUM}, no overlaps; at most ${ANSWER} groups — answer D.`

  // chip geometry (a small header band above the legend)
  const HEAD_H = 40
  const fullH = VIEW_H + HEAD_H

  const placedLabel = lang === 'id' ? 'kelompok' : 'groups'

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${fullH}`} width="100%" style={{ maxWidth: VIEW_W, display: 'block' }}>
          {/* running count chip + target reminder */}
          <g>
            <rect x={4} y={6} width={132} height={28} rx={14} fill="#E1EFFB" stroke={BLUE} strokeWidth={1.5} />
            <text x={70} y={20} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill={BLUE}>
              {`each group = ${TARGET_SUM}`}
            </text>

            <rect
              x={VIEW_W - 150}
              y={6}
              width={146}
              height={28}
              rx={14}
              fill={beat.result ? '#D1FAE5' : '#FEF3C7'}
              stroke={beat.result ? GREEN : '#F59E0B'}
              strokeWidth={1.5}
            />
            <text
              x={VIEW_W - 77}
              y={20}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={900}
              fill={beat.result ? '#065F46' : '#92400E'}
            >
              {`${beat.placed} ${placedLabel}`}
            </text>
          </g>

          <g transform={`translate(0, ${HEAD_H})`}>
            <ShapeLegend highlight={beat.highlight >= 0 ? beat.highlight : undefined} />
          </g>
        </svg>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
