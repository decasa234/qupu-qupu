import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildDirectionTurnSteps } from './directionTurnSteps'
import type { DirectionTurnParams } from './directionTurnSteps'
import { useBeatControl } from './useBeatControl'

const GREEN = '#10B981'
const BLUE = '#30598A'
const LABEL_COLOR = '#1E3A5F'

/** SVG layout constants */
const CX = 110  // compass centre x
const CY = 110  // compass centre y
const R_OUTER = 90 // outer circle radius
const R_INNER = 72  // inner tick circle
const ARROW_LEN = 56 // arrow body length from centre
const ARROW_HEAD = 14 // arrowhead length

/**
 * Compass rose with four cardinal labels (N top, E right, S bottom, W left).
 * A framer-motion arrow rotates to `headingDeg` (0=N=up, 90=E=right, …).
 */
export default function DirectionOrientationExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as DirectionTurnParams

  const story = useMemo(
    () => buildDirectionTurnSteps(p, lang),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p.start, p.turns, lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const isResult = beat.result

  const ariaLabel =
    lang === 'id'
      ? `Penjelas arah setelah berputar: mulai dari ${['Utara', 'Timur', 'Selatan', 'Barat'][story.start]}, ${story.turns} putaran searah jarum jam.`
      : `Direction after turning explainer: starting ${['North', 'East', 'South', 'West'][story.start]}, ${story.turns} clockwise quarter-turns.`

  const accentColor = isResult ? GREEN : BLUE

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Compass SVG — square viewport, compass centred */}
        <svg
          viewBox="0 0 220 220"
          width={220}
          height={220}
          className="w-full max-w-[17.5rem]"
          aria-hidden="true"
        >
          {/* Outer circle */}
          <circle
            cx={CX}
            cy={CY}
            r={R_OUTER}
            fill="white"
            stroke={accentColor}
            strokeWidth={2.5}
          />

          {/* Tick marks at 8 cardinal/intercardinal positions */}
          {Array.from({ length: 8 }, (_, i) => {
            const angleDeg = i * 45
            const angleRad = (angleDeg * Math.PI) / 180
            const isCardinal = i % 2 === 0
            const inner = isCardinal ? R_INNER + 4 : R_INNER + 8
            const outer = R_OUTER - 2
            return (
              <line
                key={i}
                x1={CX + inner * Math.sin(angleRad)}
                y1={CY - inner * Math.cos(angleRad)}
                x2={CX + outer * Math.sin(angleRad)}
                y2={CY - outer * Math.cos(angleRad)}
                stroke={accentColor}
                strokeWidth={isCardinal ? 2 : 1.5}
                strokeLinecap="round"
                opacity={isCardinal ? 0.5 : 0.25}
              />
            )
          })}

          {/* Cardinal direction labels: N, E, S, W */}
          {(
            [
              { label: lang === 'id' ? 'U' : 'N', x: CX,          y: CY - R_OUTER + 13 },
              { label: lang === 'id' ? 'T' : 'E', x: CX + R_OUTER - 13, y: CY         },
              { label: lang === 'id' ? 'S' : 'S', x: CX,          y: CY + R_OUTER - 13 },
              { label: lang === 'id' ? 'B' : 'W', x: CX - R_OUTER + 13, y: CY         },
            ] as const
          ).map(({ label, x, y }) => (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={15}
              fontWeight="800"
              fontFamily="Nunito, sans-serif"
              fill={LABEL_COLOR}
            >
              {label}
            </text>
          ))}

          {/* Rotating arrow group — pivots on the compass centre. transform-box:
              view-box makes transform-origin use viewBox user units, so the
              arrow always rotates around (CX, CY) regardless of browser. */}
          <motion.g
            style={{ transformBox: 'view-box', transformOrigin: `${CX}px ${CY}px` }}
            initial={{ rotate: story.steps[0].headingDeg }}
            animate={{ rotate: beat.headingDeg }}
            transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          >
            {/* Arrow body */}
            <line
              x1={CX}
              y1={CY + ARROW_HEAD}
              x2={CX}
              y2={CY - ARROW_LEN}
              stroke={accentColor}
              strokeWidth={5}
              strokeLinecap="round"
            />
            {/* Arrowhead — filled triangle pointing up */}
            <polygon
              points={`${CX},${CY - ARROW_LEN - ARROW_HEAD} ${CX - 8},${CY - ARROW_LEN + 4} ${CX + 8},${CY - ARROW_LEN + 4}`}
              fill={accentColor}
            />
            {/* Small tail nub */}
            <circle
              cx={CX}
              cy={CY + ARROW_HEAD}
              r={4}
              fill={accentColor}
              opacity={0.5}
            />
          </motion.g>

          {/* Centre dot */}
          <circle cx={CX} cy={CY} r={5} fill={accentColor} />
        </svg>

        {/* Caption strip */}
        <motion.div
          key={index}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
