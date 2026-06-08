import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildSymmetryLinesSteps } from './symmetryLinesSteps'
import { useBeatControl } from './useBeatControl'

// ─── constants ──────────────────────────────────────────────────────────────

const SVG_SIZE = 200
const CX = SVG_SIZE / 2  // 100
const CY = SVG_SIZE / 2  // 100
const R = 72             // shape radius (slightly smaller than half so lines have room)

const ORANGE = '#F97316'
const BLUE_BG = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = '#10B981'
const GREEN_TEXT = '#065F46'

// ─── geometry helpers ────────────────────────────────────────────────────────

/** Convert degrees to radians. */
function deg(d: number): number {
  return (d * Math.PI) / 180
}

/** Point on a circle of radius r at angle θ (degrees), centred at (CX, CY). */
function pt(angleDeg: number, r: number): [number, number] {
  return [
    CX + r * Math.cos(deg(angleDeg)),
    CY + r * Math.sin(deg(angleDeg)),
  ]
}

/** Regular polygon points string (for <polygon>), top vertex up. */
function regPoly(n: number, r: number, startDeg = -90): string {
  return Array.from({ length: n }, (_, k) => {
    const [x, y] = pt(startDeg + (k * 360) / n, r)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')
}

// ─── shape definitions ───────────────────────────────────────────────────────

type ShapeDef =
  | { type: 'polygon'; points: string }
  | { type: 'rect'; x: number; y: number; width: number; height: number }

function getShape(kind: string): ShapeDef {
  if (kind === 'rectangle') {
    const w = R * 1.6
    const h = R * 0.9
    return { type: 'rect', x: CX - w / 2, y: CY - h / 2, width: w, height: h }
  }
  if (kind === 'isosceles-triangle') {
    // apex top, wide base not equilateral
    const ax = CX, ay = CY - R
    const bx = CX - R * 0.7, by = CY + R * 0.7
    const cx2 = CX + R * 0.7, cy2 = CY + R * 0.7
    return { type: 'polygon', points: `${ax},${ay} ${bx},${by} ${cx2},${cy2}` }
  }
  const sides: Record<string, number> = {
    'equilateral-triangle': 3,
    square: 4,
    'regular-pentagon': 5,
    'regular-hexagon': 6,
  }
  const n = sides[kind] ?? 4
  return { type: 'polygon', points: regPoly(n, R) }
}

// ─── symmetry-line definitions ───────────────────────────────────────────────
//
// Each entry is [x1, y1, x2, y2] — endpoints of a symmetry line.
// Lines extend slightly beyond R so they visually cross the shape.
//

const LINE_LEN = R + 14   // extend slightly beyond shape edge

type Line = [number, number, number, number]

/** Symmetry line through centre at angle `angleDeg` (half-line direction). */
function symLine(angleDeg: number): Line {
  const [x1, y1] = pt(angleDeg, LINE_LEN)
  const [x2, y2] = pt(angleDeg + 180, LINE_LEN)
  return [x1, y1, x2, y2]
}

function getSymLines(kind: string): Line[] {
  switch (kind) {
    case 'equilateral-triangle':
      // Each line goes from a vertex (at -90°, 30°, 150°) through centre to opposite midpoint.
      // Vertex at angle θ, opposite midpoint at θ+180.
      return [symLine(-90), symLine(30), symLine(150)]

    case 'isosceles-triangle':
      // Single vertical line: apex top to base midpoint
      return [symLine(-90)]

    case 'rectangle': {
      // Horizontal through mid, vertical through mid
      return [symLine(0), symLine(-90)]
    }

    case 'square':
      // Horizontal, vertical, two diagonals
      return [symLine(-90), symLine(0), symLine(-45), symLine(45)]

    case 'regular-pentagon':
      // 5 lines: vertex-to-midpoint, top vertex first, then 72° apart
      return Array.from({ length: 5 }, (_, i) => symLine(-90 + i * 72))

    case 'regular-hexagon':
      // 6 lines: 3 vertex-to-vertex (0°, 60°, 120°) + 3 midpoint-to-midpoint (30°, 90°, 150°)
      return [
        symLine(-90),   // top vertex to bottom vertex
        symLine(-30),   // upper-right to lower-left
        symLine(30),    // upper-left to lower-right
        symLine(0),     // right mid to left mid
        symLine(60),    // lower-right mid to upper-left mid
        symLine(-60),   // lower-left mid to upper-right mid
      ]

    default:
      return []
  }
}

// ─── component ───────────────────────────────────────────────────────────────

export default function SymmetryCountExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as { kind: string }

  const story = useMemo(
    () => buildSymmetryLinesSteps(p.kind, lang),
    [p.kind, lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const shape = useMemo(() => getShape(p.kind), [p.kind])
  const allLines = useMemo(() => getSymLines(p.kind), [p.kind])

  const shapeLabel =
    lang === 'id'
      ? `Bangun datar dengan ${beat.linesShown} garis simetri ditampilkan`
      : `Shape with ${beat.linesShown} symmetry line${beat.linesShown !== 1 ? 's' : ''} shown`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={shapeLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* SVG canvas */}
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          width={SVG_SIZE}
          height={SVG_SIZE}
          className="overflow-visible"
        >
          {/* Shape */}
          {shape.type === 'polygon' ? (
            <polygon
              points={shape.points}
              fill="#F6F1E7"
              stroke="#30598A"
              strokeWidth={3.5}
              strokeLinejoin="round"
            />
          ) : (
            <rect
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              fill="#F6F1E7"
              stroke="#30598A"
              strokeWidth={3.5}
              rx={3}
            />
          )}

          {/* Symmetry lines — reveal one at a time */}
          {allLines.slice(0, beat.linesShown).map((line, i) => {
            const [x1, y1, x2, y2] = line
            const pathD = `M${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)}`
            return (
              <motion.path
                key={`line-${i}`}
                d={pathD}
                stroke={ORANGE}
                strokeWidth={2.5}
                strokeDasharray="6 4"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            )
          })}

          {/* Running count badge — top-right of SVG */}
          {beat.linesShown > 0 && (
            <motion.g
              key={`count-${beat.linesShown}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              style={{ transformOrigin: `${SVG_SIZE - 22}px 22px` }}
            >
              <circle cx={SVG_SIZE - 22} cy={22} r={18} fill={beat.result ? GREEN_BORDER : ORANGE} />
              <text
                x={SVG_SIZE - 22}
                y={22}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={beat.linesShown > 9 ? 11 : 13}
                fontWeight="800"
                fontFamily="Nunito, sans-serif"
              >
                {beat.linesShown}
              </text>
            </motion.g>
          )}
        </svg>

        {/* Caption strip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN_TEXT }
              : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
