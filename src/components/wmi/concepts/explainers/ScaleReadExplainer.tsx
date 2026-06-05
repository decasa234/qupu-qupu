import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildScaleReadSteps } from './scaleReadSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

// SVG layout constants
const VIEW_W = 420
const VIEW_H = 90
const BASELINE_Y = 55
const X_START = 20
const X_END = 400
const INNER_W = X_END - X_START // 380

function px(v: number, max: number): number {
  return X_START + (v / max) * INNER_W
}

export default function ScaleReadExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { max: number; value: number }

  const story = useMemo(
    () => buildScaleReadSteps(p.max, p.value, lang),
    [p.max, p.value, lang],
  )

  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { max, value, lo, hi } = story
  const phase = beat.phase

  const ariaLabel =
    lang === 'id'
      ? `Cara membaca skala: panah menunjuk ke ${value} pada skala 0 sampai ${max}.`
      : `Reading a scale: the arrow points to ${value} on a scale from 0 to ${max}.`

  // Build tick marks
  const ticks: { v: number; isMajor: boolean }[] = []
  for (let v = 0; v <= max; v++) {
    ticks.push({ v, isMajor: v % 10 === 0 })
  }

  function tickColor(v: number): string {
    if (phase === 'between' && (v === lo || v === hi)) return BLUE
    if (phase === 'count' && v > lo && v <= value) return ORANGE
    if (phase === 'result' && v === value) return GREEN
    return MUTED
  }

  function tickHeight(isMajor: boolean): number {
    return isMajor ? 14 : 7
  }

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-4">
        {/* Scale SVG */}
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          {/* Baseline */}
          <line
            x1={X_START}
            y1={BASELINE_Y}
            x2={X_END}
            y2={BASELINE_Y}
            stroke={MUTED}
            strokeWidth={2}
          />

          {/* Tick marks */}
          {ticks.map(({ v, isMajor }) => {
            const x = px(v, max)
            const h = tickHeight(isMajor)
            const color = tickColor(v)
            const strokeW = isMajor ? 2 : 1

            // For phase 'between', animate the bounding marks; for 'count', animate counted ticks
            const shouldAnimate =
              (phase === 'between' && (v === lo || v === hi)) ||
              (phase === 'count' && v > lo && v <= value) ||
              (phase === 'result' && v === value)

            return (
              <g key={v}>
                <motion.line
                  x1={x}
                  y1={BASELINE_Y}
                  x2={x}
                  y2={BASELINE_Y - h}
                  stroke={color}
                  strokeWidth={strokeW}
                  animate={{ stroke: color, strokeWidth: shouldAnimate ? strokeW + 1.5 : strokeW }}
                  transition={{ duration: 0.3 }}
                />
                {isMajor && (
                  <motion.text
                    x={x}
                    y={BASELINE_Y + 16}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={shouldAnimate || (phase === 'between' && (v === lo || v === hi)) ? 700 : 400}
                    animate={{
                      fill:
                        phase === 'between' && (v === lo || v === hi)
                          ? BLUE
                          : phase === 'count' && v === lo
                            ? ORANGE
                            : phase === 'result' && v === lo
                              ? GREEN
                              : PURPLE,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {v}
                  </motion.text>
                )}
              </g>
            )
          })}

          {/* Orange arrow pointing down at value */}
          {(() => {
            const ax = px(value, max)
            const arrowY = BASELINE_Y - 30
            // Triangle pointing down
            const arrowColor = phase === 'result' ? GREEN : ORANGE
            return (
              <motion.g
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                {/* Tip triangle */}
                <motion.polygon
                  points={`${ax - 7},${arrowY} ${ax + 7},${arrowY} ${ax},${BASELINE_Y - 5}`}
                  animate={{ fill: arrowColor }}
                  transition={{ duration: 0.3 }}
                />
                {/* Value label above arrow */}
                {(phase === 'count' || phase === 'result') && (
                  <motion.text
                    x={ax}
                    y={arrowY - 5}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={700}
                    animate={{ fill: arrowColor }}
                    transition={{ duration: 0.3 }}
                  >
                    {value}
                  </motion.text>
                )}
              </motion.g>
            )
          })()}

          {/* 'between' phase: highlight bracket between lo and hi */}
          <AnimatePresence>
            {phase === 'between' && (
              <motion.line
                key="bracket"
                x1={px(lo, max)}
                y1={BASELINE_Y - 20}
                x2={px(hi, max)}
                y2={BASELINE_Y - 20}
                stroke={BLUE}
                strokeWidth={3}
                strokeDasharray="4 3"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                style={{ transformOrigin: `${px(lo, max)}px ${BASELINE_Y - 20}px` }}
                transition={{ duration: 0.35 }}
              />
            )}
          </AnimatePresence>
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
