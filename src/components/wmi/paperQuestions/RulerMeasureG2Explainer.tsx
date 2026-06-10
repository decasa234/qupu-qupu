import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { buildRulerMeasureG2Steps, RULER_SEGMENTS, TOTAL_METRES } from './rulerMeasureG2Steps'

const GREEN = '#10B981'
const BLUE = '#2563EB'
const AMBER = '#D97706'
const INK = '#1F2937'

const VIEW_W = 360
const VIEW_H = 150
const BAR_X0 = 24
const BAR_W = 312
const BAR_Y = 56
const BAR_H = 38
const UNIT = BAR_W / TOTAL_METRES

function segGeom() {
  const out: { x: number; w: number; half: boolean }[] = []
  let x = BAR_X0
  for (const m of RULER_SEGMENTS) {
    out.push({ x, w: m * UNIT, half: m < 1 })
    x += m * UNIT
  }
  return out
}

export default function RulerMeasureG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRulerMeasureG2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const segs = segGeom()

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 1 m × 3 = 3 m, ditambah sisa 50 cm, jadi papan tulis 3 m 50 cm.'
      : 'Explainer: 1 m × 3 = 3 m, plus 50 cm left over, so the blackboard is 3 m 50 cm.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* running total */}
          {beat.total && (
            <text
              x={VIEW_W / 2}
              y={26}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={20}
              fontWeight={900}
              fill={beat.result ? GREEN : BLUE}
              className="font-display"
            >
              {beat.total}
            </text>
          )}

          {/* blackboard outline */}
          <rect x={BAR_X0} y={BAR_Y} width={BAR_W} height={BAR_H} rx={4} fill="#FFFFFF" stroke={INK} strokeWidth={2} />

          {/* ruler segments laid down so far */}
          {segs.map((s, i) =>
            i < beat.filled ? (
              <g key={i}>
                <rect
                  x={s.x}
                  y={BAR_Y}
                  width={s.w}
                  height={BAR_H}
                  rx={4}
                  fill={s.half ? '#FEF3C7' : '#DBEAFE'}
                  stroke={s.half ? AMBER : BLUE}
                  strokeWidth={2}
                />
                <text
                  x={s.x + s.w / 2}
                  y={BAR_Y + BAR_H / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight={800}
                  fill={s.half ? '#92400E' : '#1E3A8A'}
                  className="font-display"
                >
                  {s.half ? '50 cm' : '1 m'}
                </text>
              </g>
            ) : null,
          )}

          {/* metre ticks 0..3 */}
          {[0, 1, 2, 3].map((m) => {
            const x = BAR_X0 + m * UNIT
            return (
              <g key={m}>
                <line x1={x} y1={BAR_Y + BAR_H} x2={x} y2={BAR_Y + BAR_H + 7} stroke="#94A3B8" strokeWidth={1.5} />
                <text x={x} y={BAR_Y + BAR_H + 18} textAnchor="middle" fontSize={11} fill="#64748B">
                  {m === 0 ? '0' : `${m} m`}
                </text>
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
