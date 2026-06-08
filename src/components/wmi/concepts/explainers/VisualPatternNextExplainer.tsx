import { useMemo, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildVisualPatternSteps, type ShapeName } from './visualPatternSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#30598A'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const VIOLET = '#7c3aed'

const SHAPE_COLORS: ShapeName[] = ['circle', 'triangle', 'square', 'star']
const PALETTE = [BLUE, ORANGE, GREEN, VIOLET]

/** Returns a deterministic color per shape name. */
function shapeColor(shape: ShapeName): string {
  const idx = SHAPE_COLORS.indexOf(shape)
  return PALETTE[idx >= 0 ? idx : 0]
}

interface ShapeIconProps {
  shape: ShapeName
  size?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}

/** Pure SVG shape renderer — circle/triangle/square/star. */
function ShapeIcon({ shape, size = 36, fill = 'none', stroke, strokeWidth = 2.5 }: ShapeIconProps) {
  const s = size
  const c = s / 2
  const r = s * 0.4

  let path: ReactNode

  if (shape === 'circle') {
    path = <circle cx={c} cy={c} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
  } else if (shape === 'triangle') {
    const top = { x: c, y: s * 0.1 }
    const bl = { x: s * 0.08, y: s * 0.88 }
    const br = { x: s * 0.92, y: s * 0.88 }
    path = (
      <polygon
        points={`${top.x},${top.y} ${bl.x},${bl.y} ${br.x},${br.y}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    )
  } else if (shape === 'square') {
    const margin = s * 0.1
    path = (
      <rect
        x={margin}
        y={margin}
        width={s - 2 * margin}
        height={s - 2 * margin}
        rx={s * 0.1}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    )
  } else {
    // star — 5-pointed using inner/outer radii
    const outerR = s * 0.42
    const innerR = s * 0.18
    const points: string[] = []
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 5) * i - Math.PI / 2
      const rad = i % 2 === 0 ? outerR : innerR
      points.push(`${c + rad * Math.cos(angle)},${c + rad * Math.sin(angle)}`)
    }
    path = (
      <polygon
        points={points.join(' ')}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    )
  }

  return (
    <svg
      viewBox={`0 0 ${s} ${s}`}
      width={s}
      height={s}
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {path}
    </svg>
  )
}

interface ShapeChipProps {
  shape: ShapeName
  /** When true, paint the column tint so each column reads as one repeating shape. */
  highlighted: boolean
  /** Color of this chip's grid column (the cycle position's shape color). */
  columnColor?: string
  isAnswer: boolean
  isQuestion: boolean
  size?: number
  layoutId?: string
}

function ShapeChip({ shape, highlighted, columnColor, isAnswer, isQuestion, size = 46, layoutId }: ShapeChipProps) {
  const color = shapeColor(shape)
  const col = columnColor ?? color
  const borderColor = isAnswer ? GREEN : highlighted ? col : '#CBD5E1'
  // 8-digit hex alpha: '1f' ≈ 12% column tint.
  const bg = isAnswer ? '#D1FAE5' : highlighted ? `${col}1f` : 'white'

  return (
    <motion.div
      layout
      layoutId={layoutId}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="flex items-center justify-center rounded-xl border-[2.5px]"
      style={{ width: size, height: size, borderColor, background: bg }}
    >
      {isQuestion ? (
        <span style={{ fontSize: size * 0.5, fontWeight: 900, color: '#94A3B8', lineHeight: 1 }}>?</span>
      ) : (
        <ShapeIcon
          shape={shape}
          size={size * 0.62}
          fill={isAnswer ? '#10B981' : `${color}33`}
          stroke={isAnswer ? GREEN : color}
          strokeWidth={2.5}
        />
      )}
    </motion.div>
  )
}

export default function VisualPatternNextExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as { cycle?: unknown; shown?: unknown }

  const story = useMemo(
    () => buildVisualPatternSteps(p.cycle, p.shown, lang),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(p.cycle), p.shown, lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const phase = beat.phase
  const showCycleHighlight = phase === 'cycle' || phase === 'answer'
  const showAnswer = phase === 'answer'

  // One column per cycle position, so every row is exactly one repeat and each
  // column is always the same shape — the repetition reads vertically.
  const cols = Math.max(2, story.cycle.length)
  const CELL = 46
  const cellCount = story.shown + 1 // sequence cells + the "?" cell
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
    gap: 8,
    justifyContent: 'center',
  } as const

  const ariaLabel =
    lang === 'id'
      ? `Pola gambar berulang: ${story.cycle.join(', ')}. Disusun dalam grid, tiap kolom bentuk yang sama. Setelah ${story.shown} bentuk, berikutnya ${story.next}.`
      : `Visual pattern with repeating unit ${story.cycle.join(', ')}, laid out in a grid so each column is the same shape. After ${story.shown} shapes, the next is ${story.next}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Repeating-unit header — its columns line up with the grid below */}
        {showCycleHighlight && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-1"
          >
            <span
              className="rounded-full px-3 py-0.5 text-xs font-extrabold"
              style={{ background: '#E1EFFB', color: BLUE, border: `1.5px solid ${BLUE}` }}
            >
              {lang === 'id' ? 'pola berulang ↓' : 'repeating unit ↓'}
            </span>
            <div style={gridStyle}>
              {story.cycle.map((shape, cIdx) => (
                <ShapeChip
                  key={cIdx}
                  shape={shape}
                  highlighted
                  columnColor={shapeColor(shape)}
                  isAnswer={false}
                  isQuestion={false}
                  size={38}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* The sequence laid out in a grid: each row is one repeat of the unit */}
        <div style={gridStyle}>
          {Array.from({ length: cellCount }, (_, i) => {
            const colIdx = i % cols
            const columnColor = shapeColor(story.cycle[colIdx])
            const isLast = i === story.shown
            return (
              <ShapeChip
                key={i}
                shape={isLast ? story.next : story.sequence[i]}
                highlighted={isLast ? showAnswer : showCycleHighlight}
                columnColor={columnColor}
                isAnswer={isLast && showAnswer}
                isQuestion={isLast && !showAnswer}
                layoutId={isLast ? 'question-box' : `seq-${i}`}
                size={CELL}
              />
            )
          })}
        </div>

        {/* Caption strip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
