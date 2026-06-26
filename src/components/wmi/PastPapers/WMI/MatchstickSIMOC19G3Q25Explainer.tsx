// SIMOC-19-G3-Q25 — animated explainer.
//
// Walks through moving 3 sticks from 869 to form 9951.
// Reuses MatchstickDigit from ./Matchstick20Illustration.
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MatchstickDigit, DIGIT_W, DIGIT_H } from './Matchstick20Illustration'
import { buildMatchstickSIMOC19G3Q25Steps } from './matchstickSIMOC19G3Q25Steps'

const SCALE = 1.4
const DW = DIGIT_W * SCALE
const DH = DIGIT_H * SCALE
const GAP = 14
const PAD = 16

// Segment labels that get highlighted per beat
const HIGHLIGHT_COLOR = '#EF4444' // red → "this stick moves"
const DIM_OPACITY = 0.35

// Segment positions map (highlight which segment is being moved)
// We encode highlight targets as "SEG_digitIndex" e.g. "E_0" = E-seg of digit 0
type HighlightMap = Record<string, boolean>

function parseHighlights(keys: string[] | undefined): HighlightMap {
  const m: HighlightMap = {}
  for (const k of keys ?? []) m[k] = true
  return m
}

// One row of matchstick digits
function DigitRow({
  digits,
  highlights,
  label,
}: {
  digits: string[]
  highlights: HighlightMap
  label?: string
}) {
  const rowW = PAD * 2 + digits.length * DW + (digits.length - 1) * GAP
  const rowH = PAD * 2 + DH + (label ? 20 : 0)

  return (
    <svg
      viewBox={`0 0 ${rowW} ${rowH}`}
      width={Math.min(rowW, 300)}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {digits.map((d, i) => {
        const x = PAD + i * (DW + GAP)
        const y = PAD
        const isHighlighted = !!highlights[`E_${i}`] || !!highlights[`B_${i}`]
        return (
          <g key={`${d}-${i}`} opacity={isHighlighted ? 1 : 1}>
            <MatchstickDigit digit={d} x={x} y={y} scale={SCALE} />
            {/* Red "X" overlay on the segment being removed */}
            {isHighlighted && (
              <rect
                x={x - 2}
                y={y - 2}
                width={DW + 4}
                height={DH + 4}
                rx={6}
                fill="none"
                stroke={HIGHLIGHT_COLOR}
                strokeWidth={2.5}
                strokeDasharray="5 3"
              />
            )}
          </g>
        )
      })}
      {label && (
        <text
          x={rowW / 2}
          y={rowH - 4}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill="#6B7280"
        >
          {label}
        </text>
      )}
    </svg>
  )
}

export default function MatchstickSIMOC19G3Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildMatchstickSIMOC19G3Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const highlights = parseHighlights(beat.highlight)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: Pindahkan 3 batang dari 869 untuk membentuk 9951 — bilangan 4 digit terbesar yang mungkin.`
      : `Explainer: Move 3 sticks from 869 to form 9951 — the greatest possible 4-digit number.`

  const isFinal = beat.result

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-4">
        {/* Before panel */}
        {beat.before && (
          <div className="flex flex-col items-center">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {lang === 'id' ? 'Sebelum' : 'Before'}
            </span>
            <DigitRow
              digits={beat.before}
              highlights={highlights}
              label={`${beat.before.join('')}`}
            />
          </div>
        )}

        {/* Arrow */}
        {beat.after && beat.before && (
          <div className="text-2xl font-black text-slate-400">↓</div>
        )}

        {/* After panel */}
        {beat.after && (
          <div className="flex flex-col items-center">
            <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-500">
              {lang === 'id' ? 'Sesudah' : 'After'}
            </span>
            <DigitRow digits={beat.after} highlights={{}} label={`${beat.after.join('')}`} />
          </div>
        )}

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isFinal
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
