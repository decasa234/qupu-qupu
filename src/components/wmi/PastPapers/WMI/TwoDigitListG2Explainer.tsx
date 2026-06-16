import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { buildTwoDigitListG2Steps, SORTED, FIFTH_INDEX, ELEVENTH_INDEX, FIFTH, ELEVENTH, DIFF } from './twoDigitListG2Steps'

const GREEN = '#10B981'
const BLUE = '#2563EB'
const INK = '#1F2937'
const VIEW_W = 360
const VIEW_H = 150
const COLS = 6
const BOX_W = 48
const BOX_H = 32
const GAP = 6

export default function TwoDigitListG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTwoDigitListG2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const rowW = COLS * BOX_W + (COLS - 1) * GAP
  const x0 = (VIEW_W - rowW) / 2
  const rowY = [34, 92]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: dari daftar terurut, bilangan ke-5 adalah 23 dan ke-11 adalah 42; 42 − 23 = 19.'
      : 'Explainer: in the sorted list the 5th number is 23 and the 11th is 42; 42 − 23 = 19.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {SORTED.map((value, i) => {
            const r = i < COLS ? 0 : 1
            const c = i % COLS
            const x = x0 + c * (BOX_W + GAP)
            const y = rowY[r]
            const isFifth = i === FIFTH_INDEX && beat.markFifth
            const isEleventh = i === ELEVENTH_INDEX && beat.markEleventh
            const hl = isFifth || isEleventh
            const col = isFifth ? GREEN : isEleventh ? BLUE : '#CBD5E1'
            return (
              <g key={i}>
                <text x={x + BOX_W / 2} y={y - 6} textAnchor="middle" fontSize={9} fontWeight={700} fill={hl ? col : '#94A3B8'}>
                  {i + 1}
                </text>
                <rect x={x} y={y} width={BOX_W} height={BOX_H} rx={5} fill={hl ? (isFifth ? '#D1FAE5' : '#DBEAFE') : '#FFFFFF'} stroke={col} strokeWidth={hl ? 3 : 1.5} />
                <text x={x + BOX_W / 2} y={y + BOX_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill={INK} className="font-display">
                  {value}
                </text>
              </g>
            )
          })}

          {beat.showDiff && (
            <text x={VIEW_W / 2} y={138} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fill={GREEN} className="font-display">
              {`${ELEVENTH} − ${FIFTH} = ${DIFF}`}
            </text>
          )}
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
