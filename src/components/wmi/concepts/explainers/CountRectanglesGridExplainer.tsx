import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildCountRectanglesSteps } from './countRectanglesSteps'
import { useBeatControl } from './useBeatControl'

interface CountRectanglesParams {
  cols: number
  rows: number
}

const CELL = 40
const PAD = 18
const BLUE = '#30598A'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const GRID = '#CBD5E1'
const COLORS = ['#FDBA74', '#93C5FD', '#86EFAC', '#C4B5FD']

export default function CountRectanglesGridExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as CountRectanglesParams
  const story = useMemo(() => buildCountRectanglesSteps(p.cols, p.rows, lang), [p.cols, p.rows, lang])
  const holds = useMemo(() => story.steps.map((s) => s.hold), [story])
  const index = useBeatControl(story.finalIndex, { ...props, holds })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const activeGroup = beat.activeSize === null ? null : story.groups.find((group) => group.size === beat.activeSize)

  const svgW = story.cols * CELL + PAD * 2
  const svgH = story.rows * CELL + PAD * 2
  const ariaLabel =
    lang === 'id'
      ? `Kisi ${story.cols} kolom dan ${story.rows} baris berisi ${story.total} persegi dari semua ukuran.`
      : `${story.cols} by ${story.rows} grid contains ${story.total} squares of all sizes.`

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} width={Math.min(380, svgW * 1.6)} aria-hidden="true">
          {Array.from({ length: story.rows }, (_, row) =>
            Array.from({ length: story.cols }, (_, col) => (
              <rect
                key={`cell-${row}-${col}`}
                x={PAD + col * CELL}
                y={PAD + row * CELL}
                width={CELL}
                height={CELL}
                fill="#fff"
                stroke={GRID}
                strokeWidth={2}
              />
            )),
          )}

          {activeGroup?.squares.map((square, i) => {
            const color = COLORS[(square.size - 1) % COLORS.length]
            return (
              <motion.rect
                key={`${square.size}-${square.row}-${square.col}`}
                x={PAD + square.col * CELL + square.size * 2}
                y={PAD + square.row * CELL + square.size * 2}
                width={square.size * CELL - square.size * 4}
                height={square.size * CELL - square.size * 4}
                rx={6}
                fill={color}
                stroke={square.size === 1 ? ORANGE : BLUE}
                strokeWidth={3}
                initial={{ opacity: 0, scale: 0.86 }}
                animate={{ opacity: 0.42, scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20, delay: i * 0.04 }}
              />
            )
          })}
        </svg>

        <div className="flex flex-wrap justify-center gap-2 font-display text-sm font-black tabular-nums">
          {story.groups.map((group) => (
            <div
              key={group.size}
              className="rounded-xl px-3 py-2"
              style={{
                background: beat.activeSize === group.size ? '#FFF7ED' : '#F8FAFC',
                color: beat.activeSize === group.size ? ORANGE : BLUE,
              }}
            >
              {group.size}x{group.size}: {group.count}
            </div>
          ))}
          <div className="rounded-xl bg-emerald-50 px-3 py-2" style={{ color: GREEN }}>
            total: {story.total}
          </div>
        </div>

        <motion.div
          key={index}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
