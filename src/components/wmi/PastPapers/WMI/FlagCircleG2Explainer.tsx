import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { buildFlagCircleG2Steps, RED, YELLOW, TOTAL } from './flagCircleG2Steps'

const GREEN = '#10B981'
const REDC = '#DC2626'
const AMBER = '#F59E0B'
const VIEW = 240
const CX = 120
const CY = 124
const R = 84
const N = RED + YELLOW // 40 positions around the ring

// Deterministic positions: even index = red flag, odd index = yellow flag.
const DOTS = Array.from({ length: N }, (_, i) => {
  const a = (-90 + i * (360 / N)) * (Math.PI / 180)
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a), red: i % 2 === 0 }
})

export default function FlagCircleG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildFlagCircleG2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const center = beat.showTotal ? String(TOTAL) : beat.showYellow ? `${RED} + ${YELLOW}` : beat.showRed ? String(RED) : ''
  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 20 bendera merah dan 20 bendera kuning mengelilingi taman, jadi 40 bendera.'
      : 'Explainer: 20 red flags and 20 yellow flags around the bed, so 40 flags.'

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width="100%" style={{ maxWidth: 280, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {/* flower bed */}
          <circle cx={CX} cy={CY} r={R} fill="#ECFDF5" stroke={GREEN} strokeWidth={2} />
          <text x={CX} y={28} textAnchor="middle" fontSize={12} fontWeight={700} fill="#64748B">100 m</text>

          {/* flags around the ring */}
          {DOTS.map((d, i) => {
            const shown = d.red ? beat.showRed : beat.showYellow
            return (
              <circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={5.5}
                fill={d.red ? REDC : AMBER}
                stroke="#FFFFFF"
                strokeWidth={1.2}
                opacity={shown ? 1 : 0}
              />
            )
          })}

          {/* running count in the middle */}
          {center && (
            <text
              x={CX}
              y={CY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={beat.showYellow && !beat.showTotal ? 22 : 30}
              fontWeight={900}
              fill={beat.showTotal ? GREEN : beat.showYellow ? '#1F2937' : REDC}
              className="font-display"
            >
              {center}
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
