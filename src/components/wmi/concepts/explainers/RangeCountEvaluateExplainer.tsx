import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildRangeCountSteps } from './logicSteps'
import { LogicFrame } from './LogicVisuals'
import { useLogicBeat } from './useLogicBeat'

interface Expr { op: '+' | '-'; x: number; y: number }
interface Params { lo: number; hi: number; exprs: Expr[] }

const BLUE = '#30598A'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const SLATE = '#CBD5E1'

const SVG_W = 420
const SVG_H = 160
const AXIS_Y = 110
const AXIS_LEFT = 30
const AXIS_RIGHT = SVG_W - 30

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

interface NumberLineSVGProps {
  lo: number
  hi: number
  rows: { index: number; value: number; inRange: boolean }[]
  phase: string
  result: boolean
}

function NumberLineSVG({ lo, hi, rows, phase, result }: NumberLineSVGProps) {
  // Compute domain: cover all values and the [lo, hi] band with margin
  const safeRows = Array.isArray(rows) ? rows : []
  const vals = safeRows
    .map((r) => r.value)
    .concat([lo, hi])
    .filter(Number.isFinite)

  if (vals.length === 0) return null

  const domMin = Math.min(...vals)
  const domMax = Math.max(...vals)
  const margin = Math.max(5, Math.round((domMax - domMin) * 0.12))
  const dMin = domMin - margin
  const dMax = domMax + margin

  const domainSpan = dMax - dMin || 1

  function toX(v: number): number {
    return AXIS_LEFT + ((v - dMin) / domainSpan) * (AXIS_RIGHT - AXIS_LEFT)
  }

  const bandLeft = toX(lo)
  const bandRight = toX(hi)
  const bandWidth = clamp(bandRight - bandLeft, 0, AXIS_RIGHT - AXIS_LEFT)

  // Which rows are currently visible (have been revealed)
  const currentIdx = Number(phase)
  const visibleRows = safeRows.filter((r) => {
    if (phase === 'result') return true
    if (phase === 'range') return false
    return r.index <= currentIdx
  })

  // Tick values: lo, hi, and a few domain boundary labels
  const tickSet = new Set<number>([lo, hi])
  const ticks = Array.from(tickSet).sort((a, b) => a - b)

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Band [lo, hi] — drawn first so axis sits on top */}
      <rect
        x={bandLeft}
        y={AXIS_Y - 20}
        width={bandWidth}
        height={20}
        rx={4}
        fill="#D1FAE5"
        opacity={0.85}
      />

      {/* Axis line */}
      <line
        x1={AXIS_LEFT}
        y1={AXIS_Y}
        x2={AXIS_RIGHT}
        y2={AXIS_Y}
        stroke={SLATE}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Arrowhead right */}
      <polygon
        points={`${AXIS_RIGHT},${AXIS_Y} ${AXIS_RIGHT - 7},${AXIS_Y - 4} ${AXIS_RIGHT - 7},${AXIS_Y + 4}`}
        fill={SLATE}
      />

      {/* Tick marks for lo and hi */}
      {ticks.map((v) => {
        const x = toX(v)
        const isLo = v === lo
        const label = isLo ? `lo=${v}` : `hi=${v}`
        return (
          <g key={label}>
            <line
              x1={x}
              y1={AXIS_Y - 6}
              x2={x}
              y2={AXIS_Y + 6}
              stroke={GREEN}
              strokeWidth={1.5}
            />
            <text
              x={x}
              y={AXIS_Y + 20}
              textAnchor="middle"
              fontSize={11}
              fill={GREEN}
              fontWeight="700"
            >
              {v}
            </text>
          </g>
        )
      })}

      {/* Band bracket labels */}
      <text
        x={(bandLeft + bandRight) / 2}
        y={AXIS_Y - 6}
        textAnchor="middle"
        fontSize={10}
        fill={GREEN}
        fontWeight="600"
      >
        [{lo}, {hi}]
      </text>

      {/* Markers for revealed rows */}
      {visibleRows.map((row) => {
        const mx = toX(row.value)
        const markerColor = row.inRange ? GREEN : ORANGE
        const isActive =
          phase === String(row.index) ||
          (result && row.inRange)

        return (
          <motion.g
            key={row.index}
            initial={{ opacity: 0, y: -24 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: isActive ? 1.15 : 1,
            }}
            transition={{
              opacity: { duration: 0.22 },
              y: { type: 'spring', stiffness: 220, damping: 22 },
              scale: { type: 'spring', stiffness: 200, damping: 16 },
            }}
            style={{ originX: `${mx}px`, originY: `${AXIS_Y - 28}px` }}
          >
            {/* Drop line */}
            <line
              x1={mx}
              y1={AXIS_Y - 28}
              x2={mx}
              y2={AXIS_Y - 4}
              stroke={markerColor}
              strokeWidth={1.5}
              strokeDasharray="3 2"
              opacity={0.6}
            />
            {/* Circle */}
            <circle
              cx={mx}
              cy={AXIS_Y - 28}
              r={13}
              fill={row.inRange ? '#D1FAE5' : '#FFF7ED'}
              stroke={markerColor}
              strokeWidth={2}
            />
            {/* Index label inside circle */}
            <text
              x={mx}
              y={AXIS_Y - 24}
              textAnchor="middle"
              fontSize={10}
              fill={markerColor}
              fontWeight="800"
            >
              {row.index}
            </text>
            {/* Value label below axis */}
            <text
              x={mx}
              y={AXIS_Y + 34}
              textAnchor="middle"
              fontSize={10}
              fill={markerColor}
              fontWeight="700"
            >
              {row.value}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}

interface ExprListProps {
  rows: { index: number; expr: Expr; value: number; inRange: boolean }[]
  phase: string
  result: boolean
}

function ExprList({ rows, phase, result }: ExprListProps) {
  const safeRows = Array.isArray(rows) ? rows : []
  const currentIdx = Number(phase)

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        justifyContent: 'center',
        width: '100%',
        maxWidth: SVG_W,
      }}
    >
      {safeRows.map((row) => {
        const isActive = phase === String(row.index)
        const isRevealed =
          result ||
          (!isNaN(currentIdx) && row.index <= currentIdx)

        const revealed = isRevealed && !isActive

        let bg = '#fff'
        let border = SLATE
        let color = BLUE

        if (isActive) {
          bg = '#FFF7ED'
          border = ORANGE
          color = ORANGE
        } else if (revealed && row.inRange) {
          bg = '#D1FAE5'
          border = GREEN
          color = '#065F46'
        } else if (revealed && !row.inRange) {
          bg = '#F8FAFC'
          border = SLATE
          color = '#94A3B8'
        }

        const label = `${row.index}. ${row.expr.x} ${row.expr.op} ${row.expr.y}${isRevealed ? ` = ${row.value}` : ''}`

        return (
          <motion.div
            key={row.index}
            animate={{
              scale: isActive ? 1.07 : 1,
              borderColor: border,
            }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            style={{
              borderRadius: 10,
              border: `2px solid ${border}`,
              background: bg,
              color,
              padding: '4px 10px',
              fontSize: 13,
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {label}
          </motion.div>
        )
      })}
    </div>
  )
}

export default function RangeCountEvaluateExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const story = useMemo(
    () => buildRangeCountSteps((params ?? {}) as Params, lang),
    [params, lang],
  )
  const { beat } = useLogicBeat(story, props)

  const { rows = [], count = 0 } = story as {
    rows: { index: number; expr: Expr; value: number; inRange: boolean }[]
    count: number
  }

  return (
    <LogicFrame beat={beat} label="Range count evaluation">
      <NumberLineSVG
        lo={(params as Params)?.lo ?? 0}
        hi={(params as Params)?.hi ?? 0}
        rows={rows}
        phase={beat.phase}
        result={!!beat.result}
      />
      <ExprList rows={rows} phase={beat.phase} result={!!beat.result} />
      {beat.result && (
        <motion.div
          key="count-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          style={{
            background: '#D1FAE5',
            border: `2px solid ${GREEN}`,
            borderRadius: 12,
            padding: '6px 18px',
            color: '#065F46',
            fontWeight: 900,
            fontSize: 15,
          }}
        >
          {lang === 'id' ? `${count} hasil masuk rentang` : `${count} result${count === 1 ? '' : 's'} in range`}
        </motion.div>
      )}
    </LogicFrame>
  )
}
