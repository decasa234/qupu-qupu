import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildAngleTypeSteps } from './angleTypeSteps'
import { useBeatControl } from './useBeatControl'

const GREEN = '#10B981'

// SVG dimensions and vertex position
const SVG_W = 280
const SVG_H = 200
const VX = 100
const VY = 160
const RAY_LEN = 140

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export default function AngleTypeExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as { degrees: number }
  const story = useMemo(() => buildAngleTypeSteps(p.degrees, lang), [p.degrees, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { degrees } = story
  const rad = toRad(degrees)

  // Ray 1: horizontal to the right
  const ray1x = VX + RAY_LEN
  const ray1y = VY

  // Ray 2: rotated counter-clockwise by `degrees` (upward in SVG coords)
  const ray2x = VX + RAY_LEN * Math.cos(rad)
  const ray2y = VY - RAY_LEN * Math.sin(rad)

  // Arc to show the angle
  const arcR = 34
  const arcAx = VX + arcR
  const arcAy = VY
  const arcBx = VX + arcR * Math.cos(rad)
  const arcBy = VY - arcR * Math.sin(rad)
  // Large-arc flag: 1 if degrees > 180 else 0
  const arcLarge = degrees > 180 ? 1 : 0

  // Right-angle square marker (at the vertex, oriented along ray1)
  // Only shown on beat.showSquare
  const SQ = 18
  // Square corner: three points forming the corner at 90° between the two reference rays
  // The square sits between the horizontal ray and the vertical (90°) reference ray
  const sqX1 = VX + SQ
  const sqY1 = VY
  const sqX2 = VX + SQ
  const sqY2 = VY - SQ
  const sqX3 = VX
  const sqY3 = VY - SQ

  // 90° reference ray (straight up from vertex) shown when showSquare
  const ref90x = VX
  const ref90y = VY - RAY_LEN

  const isResult = beat.result

  const ariaLabel =
    lang === 'id'
      ? `Penjelas jenis sudut: sudut ${degrees} derajat adalah ${story.category === 'acute' ? 'lancip' : story.category === 'right' ? 'siku-siku' : 'tumpul'}.`
      : `Angle type explainer: a ${degrees}-degree angle is ${story.category}.`

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          height={SVG_H}
          className="w-full max-w-[21.25rem]"
          aria-hidden="true"
        >
          {/* 90° faint reference ray — shown when showSquare */}
          {beat.showSquare && (
            <motion.line
              key="ref-ray"
              x1={VX}
              y1={VY}
              x2={ref90x}
              y2={ref90y}
              stroke="#94A3B8"
              strokeWidth={2}
              strokeDasharray="6 4"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            />
          )}

          {/* Right-angle square marker — shown when showSquare */}
          {beat.showSquare && (
            <motion.polyline
              key="sq-marker"
              points={`${sqX1},${sqY1} ${sqX2},${sqY2} ${sqX3},${sqY3}`}
              fill="none"
              stroke="#64748B"
              strokeWidth={2}
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Arc showing the angle */}
          <path
            d={`M ${arcAx} ${arcAy} A ${arcR} ${arcR} 0 ${arcLarge} 0 ${arcBx} ${arcBy}`}
            fill="none"
            stroke={isResult ? GREEN : '#F97316'}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Ray 1 — horizontal */}
          <line
            x1={VX}
            y1={VY}
            x2={ray1x}
            y2={ray1y}
            stroke={isResult ? GREEN : '#30598A'}
            strokeWidth={3.5}
            strokeLinecap="round"
          />

          {/* Ray 2 — animated sweep in on mount */}
          <motion.line
            key={`ray2-${degrees}`}
            x1={VX}
            y1={VY}
            x2={ray2x}
            y2={ray2y}
            stroke={isResult ? GREEN : '#30598A'}
            strokeWidth={3.5}
            strokeLinecap="round"
            initial={{ x2: ray1x, y2: ray1y }}
            animate={{ x2: ray2x, y2: ray2y }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />

          {/* Vertex dot */}
          <circle
            cx={VX}
            cy={VY}
            r={4}
            fill={isResult ? GREEN : '#30598A'}
          />

          {/* Degree label near the arc */}
          <text
            x={VX + (arcR + 14) * Math.cos(rad / 2)}
            y={VY - (arcR + 14) * Math.sin(rad / 2)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={13}
            fontWeight="800"
            fontFamily="Nunito, sans-serif"
            fill={isResult ? GREEN : '#30598A'}
          >
            {degrees}°
          </text>

          {/* "90°" label near the reference ray — shown when showSquare */}
          {beat.showSquare && (
            <motion.text
              key="ref-label"
              x={VX + 22}
              y={VY - RAY_LEN + 14}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize={11}
              fontWeight="700"
              fontFamily="Nunito, sans-serif"
              fill="#64748B"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              90°
            </motion.text>
          )}
        </svg>

        {/* Caption strip */}
        <motion.div
          key={index}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
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
