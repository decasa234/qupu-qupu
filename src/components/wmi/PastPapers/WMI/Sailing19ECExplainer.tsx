import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  BoatGlyph,
  BuoyGlyph,
  SVG_W,
  SVG_H,
  BUOY,
  BUOY_R,
  BOAT_X,
  BOAT_Y,
} from './Sailing19ECIllustration'
import { buildSailing19ECSteps } from './sailing19ECSteps'

// IKMC-22-EC-Q19 — post-answer animation.
//
// Reuses the boat/buoy layout from Sailing19ECIllustration.
// Each beat highlights one buoy at a time and labels it CW or CCW.
// On the result beat, buoys 2 and 3 glow green (CCW = correct answer).

const GREEN = '#10B981'
const BLUE = '#2563EB'

// ── Direction label badge rendered near a buoy ─────────────────────────────

function DirBadge({
  buoyNum,
  dir,
  color,
}: {
  buoyNum: number
  dir: 'cw' | 'ccw' | null
  color: string
}) {
  if (!dir) return null

  const [bx, by] = BUOY[buoyNum]
  const label = dir === 'ccw' ? '↺' : '↻'

  // Position the badge above the buoy
  const tx = bx
  const ty = by - BUOY_R - 12

  return (
    <g aria-hidden="true">
      <circle cx={tx} cy={ty} r={10} fill={color} />
      <text
        x={tx}
        y={ty}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={900}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Simplified path outline (static dashed lines between buoys) ───────────

function PathOutline() {
  const [b1x, b1y] = BUOY[1]
  const [b2x, b2y] = BUOY[2]
  const [b3x, b3y] = BUOY[3]
  const [b4x, b4y] = BUOY[4]
  const bx = BOAT_X + 18
  const by = BOAT_Y - 4

  // Simple curved lines connecting the stops
  const segments = [
    `M ${bx},${by} C ${bx + 30},${by - 10} ${b3x - 28},${b3y + 28} ${b3x},${b3y + BUOY_R}`,
    `M ${b3x},${b3y - BUOY_R} C ${b3x + 16},${b3y - 32} ${b1x - 20},${b1y - 24} ${b1x - BUOY_R},${b1y}`,
    `M ${b1x + BUOY_R},${b1y} C ${b1x + 34},${b1y - 6} ${b4x - 26},${b4y - 10} ${b4x - BUOY_R},${b4y}`,
    `M ${b4x},${b4y + BUOY_R} C ${b4x - 10},${b4y + 36} ${b2x + 28},${b2y - 20} ${b2x + BUOY_R},${b2y}`,
    `M ${b2x - BUOY_R},${b2y} C ${b2x - 36},${b2y - 10} ${bx + 20},${by + 14} ${bx},${by + 8}`,
  ]

  return (
    <g>
      {segments.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#D1D5DB"
          strokeWidth={1.5}
          strokeDasharray="4,3"
          strokeLinecap="round"
        />
      ))}
    </g>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────

export default function Sailing19ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildSailing19ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Karin melingkari pelampung 3 berlawanan jarum jam, pelampung 1 searah jarum jam, pelampung 4 searah jarum jam, pelampung 2 berlawanan jarum jam — jawaban B: pelampung 2 dan 3.'
      : 'Explainer: Karin circles buoy 3 counterclockwise, buoy 1 clockwise, buoy 4 clockwise, buoy 2 counterclockwise — answer B: buoys 2 and 3.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(320, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* path outline */}
          <PathOutline />

          {/* boat */}
          <BoatGlyph cx={BOAT_X} cy={BOAT_Y} />

          {/* buoys with highlight rings + direction badges */}
          {beat.annotations.map(({ buoy, dir, color }) => {
            const [bx, by] = BUOY[buoy]
            const isActive = dir !== null
            const isHighlighted = isResult && dir === 'ccw'
            const ringColor = isHighlighted ? GREEN : isActive ? color : 'transparent'

            return (
              <AnimatePresence key={buoy} mode="wait">
                <motion.g
                  key={`buoy-${buoy}-${dir ?? 'none'}`}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* highlight ring */}
                  {isActive && (
                    <circle
                      cx={bx}
                      cy={by}
                      r={BUOY_R + 5}
                      fill="none"
                      stroke={ringColor}
                      strokeWidth={isHighlighted ? 3 : 2}
                      opacity={0.7}
                    />
                  )}
                  {/* buoy */}
                  <BuoyGlyph num={buoy} x={bx} y={by} />
                  {/* direction badge */}
                  <DirBadge buoyNum={buoy} dir={dir} color={color} />
                </motion.g>
              </AnimatePresence>
            )
          })}
        </svg>

        {/* equation row */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
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
