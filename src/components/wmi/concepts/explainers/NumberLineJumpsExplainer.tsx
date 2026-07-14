import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildJumpsSteps } from './jumpsSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

// SVG layout constants
const SVG_W = 420
const SVG_H = 110
const AXIS_Y = 70
const AXIS_X0 = 24
const AXIS_X1 = 400

/** Map a value on the number line to an SVG x coordinate. */
function px(v: number, hi: number): number {
  if (hi === 0) return AXIS_X0
  return AXIS_X0 + (v / hi) * (AXIS_X1 - AXIS_X0)
}

/** Build a quadratic arc SVG path from (x1, y) to (x2, y) with a peak above. */
function arcPath(x1: number, x2: number, y: number, peakOffset: number): string {
  const mx = (x1 + x2) / 2
  const my = y - peakOffset
  return `M ${x1} ${y} Q ${mx} ${my} ${x2} ${y}`
}

export default function NumberLineJumpsExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { start: number; step: number; jumps: number }

  const story = useMemo(
    () => buildJumpsSteps(p.start, p.step, p.jumps, lang),
    [p.start, p.step, p.jumps, lang],
  )

  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { start, step, jumps, landing } = story
  const hi = landing

  // How many jump arcs to draw: the number of completed jumps at this beat
  const completedJumps = beat.landedJumps

  // Frog's current x position
  const frogX = px(beat.pos, hi)

  // On result beat, highlight the landing dot green
  const isResult = beat.result

  const ariaLabel =
    lang === 'id'
      ? `Garis bilangan: katak mulai di ${start}, melompat ${jumps} kali sebesar ${step}, berhenti di ${landing}.`
      : `Number line: frog starts at ${start}, makes ${jumps} jumps of ${step}, lands on ${landing}.`

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[12.5rem] flex-col items-center justify-center gap-4">
        {/* Number line SVG */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          {/* Axis line */}
          <line
            x1={AXIS_X0}
            y1={AXIS_Y}
            x2={AXIS_X1}
            y2={AXIS_Y}
            stroke={MUTED}
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* Arrow head at right */}
          <polygon
            points={`${AXIS_X1},${AXIS_Y} ${AXIS_X1 - 8},${AXIS_Y - 4} ${AXIS_X1 - 8},${AXIS_Y + 4}`}
            fill={MUTED}
          />

          {/* Integer ticks + labels for every integer 0..hi */}
          {Array.from({ length: hi + 1 }, (_, v) => {
            const x = px(v, hi)
            const isLanding = v === landing && isResult
            const isStart = v === start
            return (
              <g key={v}>
                <line
                  x1={x}
                  y1={AXIS_Y - 5}
                  x2={x}
                  y2={AXIS_Y + 5}
                  stroke={isLanding ? GREEN : isStart ? BLUE : MUTED}
                  strokeWidth={isLanding || isStart ? 2 : 1.5}
                />
                <text
                  x={x}
                  y={AXIS_Y + 18}
                  textAnchor="middle"
                  fontSize={hi > 18 ? 8 : hi > 12 ? 9 : 11}
                  fontWeight={isLanding || isStart ? 700 : 400}
                  fill={isLanding ? GREEN : isStart ? BLUE : PURPLE}
                  fontFamily="Nunito, sans-serif"
                >
                  {v}
                </text>
              </g>
            )
          })}

          {/* Jump arcs (orange, completed) */}
          {Array.from({ length: completedJumps }, (_, i) => {
            const fromV = start + step * i
            const toV = start + step * (i + 1)
            const x1 = px(fromV, hi)
            const x2 = px(toV, hi)
            const peakOffset = Math.min(34, Math.max(18, (x2 - x1) * 0.55))
            const path = arcPath(x1, x2, AXIS_Y, peakOffset)
            const midX = (x1 + x2) / 2
            const labelY = AXIS_Y - peakOffset - 3
            return (
              <g key={i}>
                <path
                  d={path}
                  fill="none"
                  stroke={ORANGE}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                {/* Arc label: +step */}
                <text
                  x={midX}
                  y={labelY}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={700}
                  fill={ORANGE}
                  fontFamily="Nunito, sans-serif"
                >
                  +{step}
                </text>
              </g>
            )
          })}

          {/* Landing position dot (green on result beat) */}
          {isResult && (
            <circle
              cx={px(landing, hi)}
              cy={AXIS_Y}
              r={7}
              fill={GREEN}
              opacity={0.25}
            />
          )}

          {/* Frog dot (animated blue circle) */}
          <motion.circle
            key={beat.pos}
            cx={frogX}
            cy={AXIS_Y}
            r={7}
            fill={isResult ? GREEN : BLUE}
            initial={{ cy: AXIS_Y - 18, opacity: 0 }}
            animate={{ cy: AXIS_Y, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          />

          {/* Frog label above the dot */}
          <motion.text
            key={`label-${beat.pos}`}
            x={frogX}
            y={AXIS_Y - 12}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fill={isResult ? GREEN : BLUE}
            fontFamily="Nunito, sans-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {beat.pos}
          </motion.text>

          {/* "jumps" label showing how many jumps done (non-start, non-result) */}
          {beat.kind === 'jump' && (
            <text
              x={SVG_W / 2}
              y={12}
              textAnchor="middle"
              fontSize={10}
              fill={MUTED}
              fontFamily="Nunito, sans-serif"
            >
              {lang === 'id'
                ? `${completedJumps} dari ${jumps} lompatan`
                : `${completedJumps} of ${jumps} jumps`}
            </text>
          )}
        </svg>

        {/* Caption box */}
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
