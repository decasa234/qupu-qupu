import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildCountShapesSteps } from './logicSteps'
import { LogicFrame } from './LogicVisuals'
import { useLogicBeat } from './useLogicBeat'

const BLUE = '#30598A'
const ORANGE = '#F97316'
const GREEN = '#10B981'

interface Params { segments: number }

// SVG layout constants
const SVG_W = 420
const SVG_H = 260
const APEX_X = SVG_W / 2
const APEX_Y = 36
const BASE_Y = SVG_H - 36
const BASE_LEFT = 48
const BASE_RIGHT = SVG_W - 48

function getBasePoints(segments: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    points.push({ x: BASE_LEFT + t * (BASE_RIGHT - BASE_LEFT), y: BASE_Y })
  }
  return points
}

function polyPoints(pts: { x: number; y: number }[]): string {
  return pts.map((p) => `${p.x},${p.y}`).join(' ')
}

interface FanSVGProps {
  segments: number
  beat: { phase: string; result?: boolean }
  groups: { width: number; count: number }[]
}

function FanSVG({ segments, beat, groups }: FanSVGProps) {
  const apex = { x: APEX_X, y: APEX_Y }
  const base = getBasePoints(segments)

  // Determine which triangles to highlight based on current phase
  const highlightWidth = (() => {
    if (beat.phase === 'figure' || beat.phase === 'result') return null
    const w = parseInt(beat.phase, 10)
    return Number.isFinite(w) ? w : null
  })()

  const isResult = beat.phase === 'result'

  // Build highlighted triangle polygons for the current width
  const highlightedTriangles: { key: string; points: string }[] = []
  if (highlightWidth !== null) {
    for (let i = 0; i <= segments - highlightWidth; i++) {
      highlightedTriangles.push({
        key: `h-${highlightWidth}-${i}`,
        points: polyPoints([apex, base[i], base[i + highlightWidth]]),
      })
    }
  }

  // Running tally: sum counts for widths already shown
  const currentWidthIdx = groups.findIndex((g) => String(g.width) === beat.phase)
  const tallyCount = currentWidthIdx >= 0
    ? groups.slice(0, currentWidthIdx + 1).reduce((s, g) => s + g.count, 0)
    : null

  const fanColor = isResult ? GREEN : BLUE
  const strokeWidth = 2

  return (
    <svg
      width={SVG_W}
      height={SVG_H}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* ---- base highlighted fill (result = green pulse) ---- */}
      <AnimatePresence>
        {isResult && (
          <motion.polygon
            key="result-fill"
            points={polyPoints([apex, base[0], base[segments]])}
            fill={GREEN}
            fillOpacity={0.15}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.15] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      {/* ---- highlighted triangles (current width phase) ---- */}
      <AnimatePresence>
        {highlightedTriangles.map((tri) => (
          <motion.polygon
            key={tri.key}
            points={tri.points}
            fill={ORANGE}
            fillOpacity={0.18}
            stroke={ORANGE}
            strokeWidth={2.5}
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 22 }}
            style={{ transformOrigin: `${APEX_X}px ${(APEX_Y + BASE_Y) / 2}px` }}
          />
        ))}
      </AnimatePresence>

      {/* ---- outer base line ---- */}
      <line
        x1={BASE_LEFT}
        y1={BASE_Y}
        x2={BASE_RIGHT}
        y2={BASE_Y}
        stroke={isResult ? GREEN : BLUE}
        strokeWidth={strokeWidth + 0.5}
        strokeLinecap="round"
      />

      {/* ---- cevian lines (apex to each base division) ---- */}
      {base.map((pt, i) => (
        <line
          key={`ray-${i}`}
          x1={apex.x}
          y1={apex.y}
          x2={pt.x}
          y2={pt.y}
          stroke={fanColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={isResult ? 0.7 : 1}
        />
      ))}

      {/* ---- apex dot ---- */}
      <circle cx={apex.x} cy={apex.y} r={4} fill={isResult ? GREEN : BLUE} />

      {/* ---- base division dots ---- */}
      {base.map((pt, i) => (
        <circle key={`dot-${i}`} cx={pt.x} cy={pt.y} r={3} fill={isResult ? GREEN : BLUE} />
      ))}

      {/* ---- tally badge ---- */}
      <AnimatePresence>
        {tallyCount !== null && (
          <motion.g
            key={`tally-${beat.phase}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <rect
              x={SVG_W / 2 - 30}
              y={BASE_Y - 52}
              width={60}
              height={28}
              rx={8}
              fill={ORANGE}
            />
            <text
              x={SVG_W / 2}
              y={BASE_Y - 32}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize={14}
              fontWeight={800}
              fontFamily="sans-serif"
            >
              {tallyCount}
            </text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* ---- result total badge ---- */}
      <AnimatePresence>
        {isResult && (
          <motion.g
            key="total-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            style={{ transformOrigin: `${SVG_W / 2}px ${BASE_Y - 38}px` }}
          >
            <rect
              x={SVG_W / 2 - 38}
              y={BASE_Y - 58}
              width={76}
              height={32}
              rx={10}
              fill={GREEN}
            />
            <text
              x={SVG_W / 2}
              y={BASE_Y - 42}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize={15}
              fontWeight={800}
              fontFamily="sans-serif"
            >
              = {groups.reduce((s, g) => s + g.count, 0)}
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  )
}

export default function CountShapesInFigureExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const story = useMemo(() => buildCountShapesSteps((params ?? {}) as Params, lang), [params, lang])
  const { beat } = useLogicBeat(story, props)
  return (
    <LogicFrame beat={beat} label="Fan triangle count by width">
      <FanSVG segments={story.segments} beat={beat} groups={story.groups} />
    </LogicFrame>
  )
}
