import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildSymmetry25G3Steps } from './symmetry25G3Steps'
import type { SymAxis } from './Symmetry25G3Illustration'

// Post-answer explainer for WMI-25F3A-Q17 (2025 Grade-3 Final).
//
// Mirrors the static Symmetry25G3Illustration (dashed grid paper + pink labelled
// squares) and brings the SOLUTION to life: it reveals the six DISTINCT
// line-symmetric figures one per beat, drawing each result's six squares, the
// square that was relocated from the start shape, and the figure's mirror axis —
// while a tally counts up to SYMMETRY_COUNT_25G3 (= 6). The count and every figure
// are DERIVED from the co-exported data, never hardcoded.

// Palette echoes the static figure (qupu tokens as hex).
const PEACH = '#FFD3B1' // fill-qupu-peach (square fill)
const BRAND_ORANGE = '#f0853a' // stroke-qupu-brand-orange (square outline)
const CREAM = '#FFF2DF' // qupu-cream
const SHELL = '#FFF9F4' // qupu-shell (panel)
const BRAND_BLUE = '#30598A' // qupu-brand-blue (mirror line + captions)
const INK = '#1F2937' // square labels in the static figure
const GRID = '#9CA3AF' // dashed grid lines
const GREEN = '#10B981' // "symmetric!" accent
const GREEN_INK = '#065F46'
const MOVED_FILL = '#FFE6B0' // relocated square — a brighter peach
const MUTED = '#cbd5e1'

const SIZE = 40 // px per grid square (compact for the explainer)
const PAD = 16 // outer padding so the dashed grid breathes

// Axis line endpoints (in px) across a figure's bounding box. Returns the two
// points to draw for the given mirror axis kind, using the occupied-cell extent
// so the line passes through the figure's centre of symmetry.
function axisLine(
  axis: SymAxis,
  cells: Array<[number, number]>,
  x0: number,
  y0: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const rows = cells.map((c) => c[0])
  const cols = cells.map((c) => c[1])
  const rMin = Math.min(...rows)
  const rMax = Math.max(...rows) + 1 // +1 → bottom edge of the lowest row
  const cMin = Math.min(...cols)
  const cMax = Math.max(...cols) + 1 // +1 → right edge of the rightmost col
  const px = (col: number) => x0 + col * SIZE
  const py = (row: number) => y0 + row * SIZE
  const midC = (cMin + cMax) / 2
  const midR = (rMin + rMax) / 2
  const ext = 0.35 // overshoot past the figure so the line reads as a fold line
  switch (axis) {
    case 'vertical':
      return { x1: px(midC), y1: py(rMin - ext), x2: px(midC), y2: py(rMax + ext) }
    case 'horizontal':
      return { x1: px(cMin - ext), y1: py(midR), x2: px(cMax + ext), y2: py(midR) }
    case 'diagonal': // top-left ↘ bottom-right
      return { x1: px(cMin - ext), y1: py(rMin - ext), x2: px(cMax + ext), y2: py(rMax + ext) }
    case 'antidiagonal': // top-right ↙ bottom-left
      return { x1: px(cMax + ext), y1: py(rMin - ext), x2: px(cMin - ext), y2: py(rMax + ext) }
  }
}

export default function Symmetry25G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildSymmetry25G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cols = story.bounds.cols
  const rows = story.bounds.rows
  const gridCols = cols + 1 // one spare column so the dashed paper frames the shape
  const gridRows = rows + 1
  const W = PAD * 2 + gridCols * SIZE
  const H = PAD * 2 + gridRows * SIZE

  const movedSet = new Set(beat.moved.map((p) => `${p[0]},${p[1]}`))

  const ariaLabel = T(
    `Strategy: move exactly one square so the six squares gain a mirror line, then count every different line-symmetric figure. There are ${story.total} of them, so the answer is ${story.answer}.`,
    `Strategi: pindahkan tepat satu persegi agar enam persegi punya garis cermin, lalu hitung tiap gambar simetris garis yang berbeda. Ada ${story.total}, jadi jawabannya ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[300px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* running tally of symmetric figures found, derived count up to total */}
        <div className="flex w-full max-w-[300px] items-center justify-between">
          <span className="font-display text-sm font-extrabold" style={{ color: BRAND_BLUE }}>
            {T('symmetric figures', 'gambar simetris')}
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: story.total }, (_, i) => {
              const on = i < beat.count
              return (
                <motion.span
                  key={i}
                  initial={false}
                  animate={{ scale: on ? 1 : 0.7, opacity: on ? 1 : 0.4 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full font-display text-xs font-black"
                  style={{
                    background: on ? GREEN : CREAM,
                    color: on ? '#FFFFFF' : MUTED,
                    border: `2px solid ${on ? GREEN : PEACH}`,
                  }}
                >
                  {i + 1}
                </motion.span>
              )
            })}
          </div>
        </div>

        {/* the grid paper with the current figure + its mirror line */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* dashed grid paper background */}
          {Array.from({ length: gridCols + 1 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={PAD + i * SIZE}
              y1={PAD}
              x2={PAD + i * SIZE}
              y2={PAD + gridRows * SIZE}
              stroke={GRID}
              strokeWidth={1.2}
              strokeDasharray="4 5"
            />
          ))}
          {Array.from({ length: gridRows + 1 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={PAD}
              y1={PAD + i * SIZE}
              x2={PAD + gridCols * SIZE}
              y2={PAD + i * SIZE}
              stroke={GRID}
              strokeWidth={1.2}
              strokeDasharray="4 5"
            />
          ))}

          {/* the figure's six squares (relocated one highlighted brighter) */}
          {beat.cells.map(([r, c]) => {
            const moved = movedSet.has(`${r},${c}`)
            const x = PAD + c * SIZE
            const y = PAD + r * SIZE
            return (
              <motion.rect
                key={`${r}-${c}`}
                initial={false}
                animate={{ opacity: 1 }}
                x={x}
                y={y}
                width={SIZE}
                height={SIZE}
                fill={moved ? MOVED_FILL : PEACH}
                stroke={moved ? BRAND_ORANGE : BRAND_ORANGE}
                strokeWidth={moved ? 3 : 2.4}
              />
            )
          })}

          {/* a little star marks the relocated square */}
          {beat.moved.map(([r, c]) => (
            <text
              key={`star-${r}-${c}`}
              x={PAD + c * SIZE + SIZE / 2}
              y={PAD + r * SIZE + SIZE / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={SIZE * 0.5}
              fill={INK}
            >
              ★
            </text>
          ))}

          {/* mirror axis line(s) for this figure */}
          {beat.axes.map((axis, i) => {
            const { x1, y1, x2, y2 } = axisLine(axis, beat.cells, PAD, PAD)
            return (
              <motion.line
                key={`axis-${axis}-${i}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={BRAND_BLUE}
                strokeWidth={3}
                strokeDasharray="7 5"
                strokeLinecap="round"
              />
            )
          })}
        </svg>

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result_beat
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : beat.result
                ? { background: '#ECFDF5', borderColor: GREEN, color: GREEN_INK }
                : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
