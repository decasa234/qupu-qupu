import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  BCOLS,
  MiniBoard,
  ROWS,
  ValueGrid,
} from './NumberBoard19P1Illustration'
import { buildNumberBoard19P1Steps, PROBLEM_BOARDS } from './numberBoard19P1Steps'

const GREEN = '#10B981'
const INK = '#1F2937'
const ACCENT = '#FF8A3D'

const CELL = 26
const BOARD_W = BCOLS * CELL // 104
const BOARD_H = ROWS * CELL // 52

/**
 * Post-answer explainer for WMI-19P1A-Q9. Reads each black cell's value off the
 * value board one beat at a time (ringing the matching cell in the reference
 * grid), then does 4 + 6 - 2 = 8.
 */
export default function NumberBoard19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildNumberBoard19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: baca nilai tiap sel hitam — ${story.v1} + ${story.v2} − ${story.v3} = ${story.answer}.`
      : `Explainer: read each black cell's value — ${story.v1} + ${story.v2} − ${story.v3} = ${story.answer}.`

  const op = ['+', '−'] as const

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox="0 0 460 170"
          width="100%"
          style={{ display: 'block', margin: '0 auto', maxWidth: 440 }}
          aria-hidden="true"
        >
          {/* value reference grid (rings the cell being read) */}
          <g transform="translate(8, 22)">
            <ValueGrid lit={beat.litCell} />
          </g>

          {/* the three problem boards with their values appearing as read */}
          <g transform="translate(8, 100)">
            {PROBLEM_BOARDS.map((cell, i) => {
              const x = i * (BOARD_W + 34)
              return (
                <g key={i} transform={`translate(${x}, 0)`}>
                  <MiniBoard
                    black={cell}
                    label={beat.labels[i]}
                    highlight={beat.readBoard === i + 1}
                  />
                  {i < 2 && (
                    <text
                      x={BOARD_W + 17}
                      y={BOARD_H / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={24}
                      fontWeight={800}
                      fill={INK}
                    >
                      {op[i]}
                    </text>
                  )}
                </g>
              )
            })}
            <text
              x={3 * (BOARD_W + 34) - 2}
              y={BOARD_H / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={26}
              fontWeight={900}
              fill={beat.result ? GREEN : ACCENT}
            >
              {beat.result ? `= ${story.answer}` : '= ?'}
            </text>
          </g>
        </svg>

        {/* running expression */}
        {beat.running && (
          <div
            className="rounded-full border-2 px-4 py-1 text-center font-display text-sm font-extrabold"
            style={
              beat.result
                ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                : { background: '#FEF3C7', borderColor: '#F59E0B', color: '#92400E' }
            }
          >
            {beat.running}
          </div>
        )}

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
