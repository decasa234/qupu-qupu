import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildPolygonSidesSteps } from './polygonSidesSteps'
import { useBeatControl } from './useBeatControl'

const ORANGE = '#F97316'
const BLUE = '#2f6df0'
const SHELL = '#f6f1e7'
const PURPLE = '#341857'
const GREEN = '#10B981'
const MUTED = '#9aa3b2'

/** Compute regular-polygon vertices centered on (cx, cy) with radius r.
 *  First vertex is at the top (angle = -π/2). */
function computeVertices(sides: number, cx: number, cy: number, r: number): { x: number; y: number }[] {
  return Array.from({ length: sides }, (_, k) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * k) / sides
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })
}

export default function CountPolygonSidesExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as { sides: number }

  const story = useMemo(() => buildPolygonSidesSteps(p.sides, lang), [p.sides, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { sides } = story
  const viewSize = 220
  const cx = viewSize / 2
  const cy = viewSize / 2
  const r = viewSize / 2 - 28
  const vertices = useMemo(() => computeVertices(sides, cx, cy, r), [sides, cx, cy, r])

  const ariaLabel =
    lang === 'id'
      ? `Animasi menghitung sisi: bangun ${sides} sisi disorot satu per satu.`
      : `Counting sides animation: a ${sides}-sided polygon, each side highlighted in turn.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Polygon SVG */}
        <svg
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          width={viewSize}
          height={viewSize}
          className="overflow-visible"
        >
          {/* Base outline (ghost) */}
          <polygon
            points={vertices.map((v) => `${v.x},${v.y}`).join(' ')}
            fill={SHELL}
            stroke={MUTED}
            strokeWidth={3}
            strokeLinejoin="round"
          />

          {/* Highlighted edges, one path per edge */}
          {Array.from({ length: sides }, (_, k) => {
            const a = vertices[k]
            const b = vertices[(k + 1) % sides]
            const highlighted = k < beat.sidesHighlighted
            const isActive = k === beat.sidesHighlighted - 1

            // Midpoint for number label
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2

            // Push the label outward from center
            const dx = mx - cx
            const dy = my - cy
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const labelX = mx + (dx / dist) * 14
            const labelY = my + (dy / dist) * 14

            return (
              <g key={k}>
                {highlighted && (
                  <motion.line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={ORANGE}
                    strokeWidth={5}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                )}
                {/* Edge number label */}
                {highlighted && (
                  <motion.text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="Nunito, sans-serif"
                    fontWeight="800"
                    fontSize={isActive ? 14 : 12}
                    fill={isActive ? ORANGE : BLUE}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.1 }}
                  >
                    {k + 1}
                  </motion.text>
                )}
              </g>
            )
          })}

          {/* Vertex dots */}
          {vertices.map((v, k) => (
            <circle key={k} cx={v.x} cy={v.y} r={4} fill={PURPLE} opacity={0.5} />
          ))}
        </svg>

        {/* Running count */}
        <motion.div
          key={`count-${beat.sidesHighlighted}`}
          className="font-display text-5xl font-extrabold"
          style={{ color: beat.result ? GREEN : PURPLE }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 26 }}
        >
          {beat.sidesHighlighted > 0 ? beat.sidesHighlighted : '?'}
        </motion.div>

        {/* Caption strip */}
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
