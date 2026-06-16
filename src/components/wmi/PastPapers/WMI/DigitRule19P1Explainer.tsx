import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DigitRuleDiagram } from './DigitRule19P1Illustration'
import { buildDigitRule19P1Steps } from './digitRule19P1Steps'

const GREEN = '#10B981'
const INK = '#1F2937'
const VALID_BG = '#DCFCE7'
const VALID_BORDER = '#16A34A'
const BAD_BG = '#FEE2E2'
const BAD_BORDER = '#DC2626'

const ARR_VIEW_W = 360
const ARR_VIEW_H = 96
const COLS = 3

export default function DigitRule19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildDigitRule19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: dari 5, 2, 0 ada 6 susunan, dua diawali nol, jadi ${story.validCount} bilangan sah. Jawaban A.`
      : `Explainer: from 5, 2, 0 there are 6 arrangements, two start with zero, leaving ${story.validCount} valid numbers. Answer A.`

  const cellW = 96
  const cellH = 38
  const gapX = 18
  const gapY = 14
  const gridW = COLS * cellW + (COLS - 1) * gapX
  const startX = (ARR_VIEW_W - gridW) / 2
  const startY = 6

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <DigitRuleDiagram showMarks={beat.showMarks} showDigits />

        <svg
          viewBox={`0 0 ${ARR_VIEW_W} ${ARR_VIEW_H}`}
          width="100%"
          style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {story.arrangements.map((a, i) => {
            if (i >= beat.revealed) return null
            const col = i % COLS
            const row = Math.floor(i / COLS)
            const x = startX + col * (cellW + gapX)
            const y = startY + row * (cellH + gapY)
            const struck = beat.crossOut && !a.valid
            const cx = x + cellW / 2
            const cy = y + cellH / 2
            return (
              <g key={a.text}>
                <rect
                  x={x}
                  y={y}
                  width={cellW}
                  height={cellH}
                  rx={7}
                  fill={struck ? BAD_BG : VALID_BG}
                  stroke={struck ? BAD_BORDER : VALID_BORDER}
                  strokeWidth={2}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={20}
                  fontWeight={800}
                  fill={struck ? BAD_BORDER : INK}
                  fontFamily="monospace"
                >
                  {a.text}
                </text>
                {struck && (
                  <line
                    x1={cx - 30}
                    y1={cy}
                    x2={cx + 30}
                    y2={cy}
                    stroke={BAD_BORDER}
                    strokeWidth={3}
                    strokeLinecap="round"
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
