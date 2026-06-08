import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { PictureCell, CELL_W, CELL_H, TRIANGLE_COUNTS } from './TrianglePatternG2Illustration'
import { buildTrianglePatternG2Steps } from './trianglePatternG2Steps'

const GREEN = '#10B981'
const PURPLE = '#341857'

/** The five "+k" gaps between consecutive counts: +3, +4, +5, +6, +7. */
const DIFFS = TRIANGLE_COUNTS.slice(1).map((c, i) => c - TRIANGLE_COUNTS[i])

export default function TrianglePatternG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTrianglePatternG2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: jumlah segitiga 3, 6, 10, 15, 21, 28 dengan selisih +3,+4,+5,+6,+7; gambar (6) = 28, jawaban C.'
      : 'Explainer: triangle counts 3, 6, 10, 15, 21, 28 with gaps +3,+4,+5,+6,+7; picture (6) = 28, answer C.'

  // The four picture cells we draw (1..4); 5 and 6 are summarised in the number row.
  const drawnPictures = [1, 2, 3, 4]
  const VIEW_W = CELL_W * 4

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Drawn stacks 1–4 with running counts revealed. */}
        <svg viewBox={`0 0 ${VIEW_W} ${CELL_H}`} width="100%" style={{ maxWidth: VIEW_W }} aria-hidden="true">
          {drawnPictures.map((p, i) => (
            <g key={p} transform={`translate(${i * CELL_W}, 0)`}>
              <PictureCell picture={p} showCount={beat.revealed >= p} active={beat.focus === p} />
            </g>
          ))}
        </svg>

        {/* Number line of all six counts with +k gaps, revealed step by step. */}
        <svg viewBox="0 0 540 96" width="100%" style={{ maxWidth: 540 }} aria-hidden="true">
          {TRIANGLE_COUNTS.map((c, i) => {
            const picture = i + 1
            const cx = 44 + i * 88
            const shown = beat.revealed >= picture
            const isFocus = beat.focus === picture
            const isAnswer = picture === 6
            const fill = isAnswer ? '#065F46' : PURPLE
            return (
              <g key={picture} opacity={shown ? 1 : 0.2}>
                {isFocus && shown && <circle cx={cx} cy={56} r={24} fill="none" stroke={isAnswer ? GREEN : '#F97316'} strokeWidth={3} />}
                <circle cx={cx} cy={56} r={20} fill={isAnswer && shown ? '#D1FAE5' : '#EFF6FF'} stroke={fill} strokeWidth={2} />
                <text x={cx} y={56} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill={fill}>
                  {c}
                </text>
                <text x={cx} y={88} textAnchor="middle" fontSize={10} fontWeight={700} fill="#64748B">
                  {picture}
                </text>
                {/* "+k" gap label to the previous count */}
                {i > 0 && (
                  <text
                    x={cx - 44}
                    y={22}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight={800}
                    fill={shown ? '#C2410C' : '#CBD5E1'}
                  >
                    {`+${DIFFS[i - 1]}`}
                  </text>
                )}
                {/* connector arc between counts */}
                {i > 0 && (
                  <path
                    d={`M ${cx - 88 + 22} 40 Q ${cx - 44} 26 ${cx - 22} 40`}
                    fill="none"
                    stroke={shown ? '#F97316' : '#E2E8F0'}
                    strokeWidth={1.6}
                  />
                )}
              </g>
            )
          })}
        </svg>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
