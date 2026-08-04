import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { GridBoard } from '../../PastPapers/WMI/primitives/GridBoard'
import {
  TriLattice,
  triLatticeViewBox,
  triPolygonPoints,
} from '../../PastPapers/WMI/primitives/TriLattice'
import type { ExplainerProps } from './registry'
import {
  buildGridShadedAreaCountSteps,
  type GridFigureView,
  type GridShadedStep,
  type GridShadedView,
} from './gridShadedAreaCountSteps'
import { useBeatControl } from './useBeatControl'

// Post-answer animation for `grid-shaded-area-count`. It does the one thing the
// child has to be able to do afterwards: light up the WHOLE cells row by row
// with the running total on screen, then pair the half cells off two at a time,
// and only then turn cells into cm².
//
// Every cell drawn here is produced by clipping the params vertex list against
// the lattice (`gridShadedAreaCountSteps`), the same module the in-card figure
// reads — so the animation can never count a different shape from the one on
// the question card, and the final number is the end of the count rather than a
// value pasted in.

const INK = '#30598A'
const PEACH = '#FFD3B1'
const MUTED = '#B9C0CC'
const CREAM = '#FFF9F4'
const LINE = '#D7DEE8'
const GREEN = '#10B981'
const GREEN_SOFT = '#D1FAE5'
const GREEN_INK = '#065F46'

const PAD = 4

interface FigureFrame {
  viewBox: string
  width: number
  /** Lattice point → SVG pixel. */
  px: (p: [number, number]) => [number, number]
}

function frameFor(view: GridShadedView, figure: GridFigureView, cell: number): FigureFrame {
  if (view.lattice === 'triangle') {
    return {
      viewBox: triLatticeViewBox(figure.triCells, cell, PAD),
      width: figure.cols * cell + PAD * 2,
      px: ([a, b]) => [(a + b / 2) * cell, b * (Math.sqrt(3) / 2) * cell],
    }
  }
  const x0 = figure.originA * cell
  const y0 = figure.originB * cell
  return {
    viewBox: `${x0 - PAD} ${y0 - PAD} ${figure.cols * cell + PAD * 2} ${figure.rows * cell + PAD * 2}`,
    width: figure.cols * cell + PAD * 2,
    px: ([x, y]) => [x * cell, y * cell],
  }
}

const pointsOf = (frame: FigureFrame, poly: [number, number][]): string =>
  poly
    .map((p) => {
      const [x, y] = frame.px(p)
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

function centroid(frame: FigureFrame, poly: [number, number][]): [number, number] {
  const pixels = poly.map(frame.px)
  const n = pixels.length
  return [
    pixels.reduce((s, p) => s + p[0], 0) / n,
    pixels.reduce((s, p) => s + p[1], 0) / n,
  ]
}

function FigurePanel({
  view,
  figure,
  index,
  beat,
  cell,
  showNumbers,
}: {
  view: GridShadedView
  figure: GridFigureView
  index: number
  beat: GridShadedStep
  cell: number
  showNumbers: boolean
}) {
  const frame = frameFor(view, figure, cell)
  const counted = beat.tallied.includes(index)
  const rowsLit = index === beat.focus ? beat.rowsLit : counted ? figure.wholeRows.length : 0
  const halvesLit = index === beat.focus ? beat.halvesLit : counted
  const isWinner = beat.winner === index

  // Whole cells in counting order, so cell number n is the n-th a finger touches.
  const numbered = useMemo(() => {
    const out: { cell: (typeof figure.whole)[number]; n: number; rowIndex: number }[] = []
    figure.wholeRows.forEach((row, rowIndex) => {
      for (const c of row.cells) out.push({ cell: c, n: out.length + 1, rowIndex })
    })
    return out
  }, [figure.wholeRows])

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox={frame.viewBox}
        width={frame.width}
        aria-hidden="true"
        style={{ display: 'block', maxWidth: '100%' }}
      >
        {view.lattice === 'triangle' ? (
          <TriLattice cells={figure.triCells} size={cell} gridStroke={LINE} fill={() => CREAM} />
        ) : (
          <g transform={`translate(${figure.originA * cell} ${figure.originB * cell})`}>
            <GridBoard
              rows={figure.rows}
              cols={figure.cols}
              cellSize={cell}
              gridStroke={LINE}
              fill={() => CREAM}
            />
          </g>
        )}

        {/* the shaded region itself */}
        <polygon
          points={pointsOf(frame, figure.verts)}
          fill={PEACH}
          stroke={INK}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* whole cells, lit row by row */}
        {numbered.map(({ cell: c, n, rowIndex }) => {
          if (rowIndex >= rowsLit) return null
          const [cx, cy] = centroid(frame, c.frame)
          return (
            <motion.g
              key={`w${n}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 340, damping: 24, delay: (n % 6) * 0.05 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              <polygon
                points={pointsOf(frame, c.frame)}
                fill={GREEN_SOFT}
                stroke={GREEN}
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {showNumbers && (
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={Math.round(cell * 0.42)}
                  fontWeight={800}
                  fill={GREEN_INK}
                >
                  {n}
                </text>
              )}
            </motion.g>
          )
        })}

        {/* half cells, paired off two at a time */}
        {halvesLit &&
          figure.halves.map((c, i) => {
            const [cx, cy] = centroid(frame, c.piece)
            return (
              <motion.g
                key={`h${i}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22, delay: i * 0.09 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              >
                <polygon
                  points={pointsOf(frame, c.piece)}
                  fill={i % 2 === 0 ? GREEN_SOFT : '#A7F3D0'}
                  stroke={GREEN}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                {showNumbers && (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={Math.round(cell * 0.34)}
                    fontWeight={800}
                    fill={GREEN_INK}
                  >
                    ½
                  </text>
                )}
              </motion.g>
            )
          })}
      </svg>

      {view.ask !== 'area' && (
        <span
          className="font-display text-xs font-extrabold"
          style={{ color: isWinner ? GREEN_INK : figure.isExample ? MUTED : INK }}
        >
          {figure.isExample ? 'Contoh' : figure.label}
          {counted ? ` = ${figure.units}` : ''}
        </span>
      )}
    </div>
  )
}

export default function GridShadedAreaCountExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props

  const story = useMemo(() => buildGridShadedAreaCountSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const view = story.view

  const cell = view.ask === 'area' ? 32 : view.figures.length > 3 ? 19 : 23
  const ariaLabel =
    lang === 'id'
      ? 'Animasi mencacah petak utuh lalu memasangkan potongan setengah pada daerah berwarna.'
      : 'Animation counting the whole grid cells, then pairing up the half ones, over the shaded region.'

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-end justify-center gap-2 sm:gap-4">
          {view.figures.map((figure, i) => (
            <FigurePanel
              key={i}
              view={view}
              figure={figure}
              index={i}
              beat={beat}
              cell={cell}
              showNumbers={view.ask === 'area'}
            />
          ))}
        </div>

        {/* Caption strip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: INK, color: INK }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
