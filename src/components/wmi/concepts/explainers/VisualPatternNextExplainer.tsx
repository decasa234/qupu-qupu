import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

  let path: React.ReactNode

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
  /** Tint index 0..N-1 for the alternating cycle highlight (beat 2). */
  repeatGroup?: number
  highlighted: boolean
  isAnswer: boolean
  isQuestion: boolean
  layoutId?: string
}

function ShapeChip({ shape, highlighted, repeatGroup, isAnswer, isQuestion, layoutId }: ShapeChipProps) {
  const color = shapeColor(shape)

  // Highlight tint for cycle-bracketing — alternate two tints
  const tints = ['rgba(48,89,138,0.12)', 'rgba(124,58,237,0.12)']
  const tintBg = highlighted && repeatGroup !== undefined ? tints[repeatGroup % 2] : 'white'

  const borderColor = isAnswer ? GREEN : highlighted ? color : '#CBD5E1'
  const bg = isAnswer ? '#D1FAE5' : tintBg

  return (
    <motion.div
      layout
      layoutId={layoutId}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="flex items-center justify-center rounded-xl border-[2.5px]"
      style={{
        width: 48,
        height: 48,
        borderColor,
        background: bg,
      }}
    >
      {isQuestion ? (
        <span
          style={{ fontSize: 24, fontWeight: 900, color: '#94A3B8', lineHeight: 1 }}
        >
          ?
        </span>
      ) : (
        <ShapeIcon
          shape={shape}
          size={30}
          fill={isAnswer ? '#10B981' : color + '33'}
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

  const ariaLabel =
    lang === 'id'
      ? `Pola gambar berulang: ${story.cycle.join(', ')}. Setelah ${story.shown} bentuk, berikutnya ${story.next}.`
      : `Visual pattern with repeating unit: ${story.cycle.join(', ')}. After ${story.shown} shapes, the next is ${story.next}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Sequence row + "?" chip */}
        <div className="flex flex-wrap items-center justify-center gap-2 px-2">
          {story.sequence.map((shape, i) => {
            const repeatGroup = Math.floor(i / story.cycle.length)
            return (
              <ShapeChip
                key={i}
                shape={shape}
                highlighted={showCycleHighlight}
                repeatGroup={repeatGroup}
                isAnswer={false}
                isQuestion={false}
                layoutId={`seq-${i}`}
              />
            )
          })}

          {/* The "?" box — or the revealed answer */}
          <AnimatePresence mode="wait">
            {showAnswer ? (
              <ShapeChip
                key="answer-chip"
                shape={story.next}
                highlighted={false}
                isAnswer={true}
                isQuestion={false}
                layoutId="question-box"
              />
            ) : (
              <ShapeChip
                key="question-chip"
                shape={story.next}
                highlighted={false}
                isAnswer={false}
                isQuestion={true}
                layoutId="question-box"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Cycle bracket row — appears on beat 2 */}
        <AnimatePresence>
          {showCycleHighlight && (
            <motion.div
              key="cycle-row"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-1"
            >
              <span
                className="rounded-full px-3 py-1 text-xs font-extrabold"
                style={{ background: '#E1EFFB', color: BLUE, border: `1.5px solid ${BLUE}` }}
              >
                {lang === 'id' ? 'pola berulang' : 'repeating unit'}:
              </span>
              {story.cycle.map((shape, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center rounded-lg border-2"
                  style={{
                    width: 36,
                    height: 36,
                    borderColor: i % 2 === 0 ? BLUE : VIOLET,
                    background: i % 2 === 0 ? 'rgba(48,89,138,0.10)' : 'rgba(124,58,237,0.10)',
                  }}
                >
                  <ShapeIcon
                    shape={shape}
                    size={22}
                    fill={shapeColor(shape) + '33'}
                    stroke={shapeColor(shape)}
                    strokeWidth={2}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

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
