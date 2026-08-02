import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildTileFillCountSteps, type TileFillCell, type TileFillView } from './tileFillCountSteps'
import { useBeatControl } from './useBeatControl'

// Post-answer animation for `tile-fill-count`. It does the one thing the child
// has to be able to do afterwards: count the squares ROW BY ROW with the total
// visible, then turn squares into tiles.
//
// Every square drawn here comes from the same cell list the in-card figure and
// the backend answer come from (`readTileFillParams`), so the animation can
// never count a different shape from the one on the question card. The final
// number is the end of the running count, not a value pasted in.

const INK = '#30598A'
const INK_SOFT = '#E1EFFB'
const PEACH = '#FFD3B1'
const MUTED = '#B9C0CC'
const CREAM = '#FFF9F4'
const GREEN = '#10B981'
const GREEN_SOFT = '#D1FAE5'
const GREEN_INK = '#065F46'

const CELL = 34
const PAD = 6

const cellKey = (cell: TileFillCell): string => `${cell[0]},${cell[1]}`

function TileGlyph({ tile }: { tile: TileFillView['tile'] }) {
  const size = 26
  const pad = 4
  const box = size + pad * 2
  if (tile === 'unit-square') {
    return (
      <svg viewBox={`0 0 ${box} ${box}`} width={box} height={box} aria-hidden="true">
        <rect x={pad} y={pad} width={size} height={size} fill={INK_SOFT} stroke={INK} strokeWidth={2.5} />
      </svg>
    )
  }
  return (
    <svg viewBox={`0 0 ${box} ${box}`} width={box} height={box} aria-hidden="true">
      <rect
        x={pad}
        y={pad}
        width={size}
        height={size}
        fill="none"
        stroke={MUTED}
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <polygon
        points={`${pad},${pad} ${pad + size},${pad + size} ${pad},${pad + size}`}
        fill={INK_SOFT}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function TileFillCountExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props

  const story = useMemo(() => buildTileFillCountSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const view = story.view

  // One fixed frame for every beat, taken from the widest layer, so squares
  // never shift as the count walks down the shape.
  const frame = view.base.length > 0 ? view.base : view.cells
  const rows = Math.max(...frame.map(([r]) => r)) + 1
  const cols = Math.max(...frame.map(([, c]) => c)) + 1
  const svgW = cols * CELL + PAD * 2
  const svgH = rows * CELL + PAD * 2
  const x = (c: number) => PAD + c * CELL
  const y = (r: number) => PAD + r * CELL

  const overlaySet = useMemo(() => new Set(view.overlay.map(cellKey)), [view.overlay])

  // The counting order: the flattened row groups, so square number n is the
  // n-th square a finger would touch reading left to right, top to bottom.
  const counted = useMemo(() => {
    const out: { cell: TileFillCell; n: number; rowIndex: number }[] = []
    view.targetRows.forEach((row, rowIndex) => {
      for (const cell of row.cells) out.push({ cell, n: out.length + 1, rowIndex })
    })
    return out
  }, [view.targetRows])

  const baseFill =
    view.ask === 'how-many-more' ? '#FFFFFF' : view.ask === 'fewest-to-complete' ? CREAM : INK_SOFT
  const baseStroke = view.ask === 'fewest-to-complete' ? MUTED : INK

  const ariaLabel =
    lang === 'id'
      ? `Animasi menghitung kotak baris demi baris pada bentuk di kertas kotak-kotak.`
      : `Animation counting the squares of the shape row by row.`

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <TileGlyph tile={view.tile} />
          <div aria-hidden="true" className="h-14 w-px shrink-0" style={{ background: MUTED }} />

          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            width={Math.min(300, svgW * 1.4)}
            aria-hidden="true"
          >
            {/* every square of the frame — the shape, or the big square it grows into */}
            {frame.map(([r, c], i) => (
              <rect
                key={`b${i}`}
                x={x(c)}
                y={y(r)}
                width={CELL}
                height={CELL}
                fill={baseFill}
                stroke={baseStroke}
                strokeWidth={2}
              />
            ))}

            {/* already covered squares (how-many-more) / the shape inside its box */}
            {view.overlay.map(([r, c], i) => (
              <rect
                key={`o${i}`}
                x={x(c)}
                y={y(r)}
                width={CELL}
                height={CELL}
                fill={view.ask === 'how-many-more' ? PEACH : INK_SOFT}
                stroke={INK}
                strokeWidth={2}
              />
            ))}

            {/* the count itself: each counted square lights up and wears its number */}
            {counted.map(({ cell, n, rowIndex }) => {
              if (rowIndex >= beat.rowsCounted) return null
              const [r, c] = cell
              return (
                <motion.g
                  key={`c${n}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 24, delay: c * 0.05 }}
                  style={{ transformOrigin: `${x(c) + CELL / 2}px ${y(r) + CELL / 2}px` }}
                >
                  <rect
                    x={x(c)}
                    y={y(r)}
                    width={CELL}
                    height={CELL}
                    fill={GREEN_SOFT}
                    stroke={GREEN}
                    strokeWidth={2.5}
                  />
                  {beat.doubling && (
                    <line
                      x1={x(c)}
                      y1={y(r)}
                      x2={x(c) + CELL}
                      y2={y(r) + CELL}
                      stroke={GREEN}
                      strokeWidth={2}
                    />
                  )}
                  {!beat.doubling && (
                    <text
                      x={x(c) + CELL / 2}
                      y={y(r) + CELL / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={15}
                      fontWeight={800}
                      fill={GREEN_INK}
                    >
                      {n}
                    </text>
                  )}
                </motion.g>
              )
            })}
          </svg>
        </div>

        {/* Caption strip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
              : { background: INK_SOFT, borderColor: INK, color: INK }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
