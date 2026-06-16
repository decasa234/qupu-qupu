import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  buildSymbolGrid24G2Steps,
  SYMBOL_GLYPH,
  SYMBOL_NAME,
} from './symbolGrid24G2Steps'
import {
  CELL,
  CIRCLE_R,
  COL_SUMS,
  COLS,
  FILLED,
  GIVEN,
  GRID,
  GRID_H,
  INK,
  MARK,
  MarkerGlyph,
  type Marker,
  PAD_TOP,
  ROWS,
  SOLVED,
  SUM_FILL,
  SUM_TEXT,
  VIEW_H,
  VIEW_W,
  circleCx,
  circleCy,
  gx,
  gy,
} from './SymbolGrid24G2Illustration'

// WMI-24F2A-Q25 post-answer explainer. Mirrors the static symbol sum-grid and
// brings it alive: it deduces ●, ◆, ★ one column at a time from the printed
// circle sums, then computes ● + ◆ − ★ = 7 + 8 − 5 = 10. Every number is
// derived from the shared illustration constants (MARKER_VALUES / SOLVED /
// COL_SUMS), so the animation can never drift from the figure or the answer.

const HIGHLIGHT = '#FEF3C7' // soft yellow column wash on the active column
const HIGHLIGHT_STROKE = '#D97706' // amber ring round the active column
const TINT = '#f0853a' // orange tint on a revealed marker cell (matches MARK)
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const BRAND_BLUE = '#30598A'

/** Map each marker to its column index, derived from the source grid. */
function markerColumns(): Record<Marker, number> {
  const out: Partial<Record<Marker, number>> = {}
  for (let r = 0; r < GRID.length; r++) {
    for (let c = 0; c < GRID[r].length; c++) {
      const m = GRID[r][c].mark
      if (m) out[m] = c
    }
  }
  return out as Record<Marker, number>
}

export default function SymbolGrid24G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildSymbolGrid24G2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cols = useMemo(() => markerColumns(), [])
  const revealedCols = useMemo(
    () => new Set(beat.revealed.map((m) => cols[m])),
    [beat.revealed, cols],
  )

  const ariaLabel = T(
    `Strategy: each grey circle is its column's total, so the circle sums force the dot = ${story.values.bullet}, the diamond = ${story.values.diamond}, and the star = ${story.values.star}. Then dot + diamond − star = ${story.values.bullet} + ${story.values.diamond} − ${story.values.star} = ${story.answer}.`,
    `Strategi: tiap lingkaran abu-abu adalah total kolomnya, jadi jumlah lingkaran memaksa titik = ${story.values.bullet}, wajik = ${story.values.diamond}, dan bintang = ${story.values.star}. Lalu titik + wajik − bintang = ${story.values.bullet} + ${story.values.diamond} − ${story.values.star} = ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* active-column wash, drawn under the grid so numbers stay crisp */}
          {beat.col != null && (
            <motion.rect
              key={`hl-${beat.col}`}
              x={gx(beat.col)}
              y={PAD_TOP}
              width={CELL}
              height={GRID_H}
              fill={HIGHLIGHT}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            />
          )}

          {/* outer board */}
          <rect x={gx(0)} y={PAD_TOP} width={COLS * CELL} height={GRID_H} fill="none" stroke={INK} strokeWidth={2.5} />

          {/* interior vertical grid lines */}
          {Array.from({ length: COLS - 1 }, (_, i) => i + 1).map((i) => (
            <line key={`v-${i}`} x1={gx(i)} y1={gy(0)} x2={gx(i)} y2={gy(ROWS)} stroke={INK} strokeWidth={1.5} />
          ))}
          {/* interior horizontal grid lines */}
          {Array.from({ length: ROWS - 1 }, (_, i) => i + 1).map((i) => (
            <line key={`h-${i}`} x1={gx(0)} y1={gy(i)} x2={gx(COLS)} y2={gy(i)} stroke={INK} strokeWidth={1.5} />
          ))}

          {/* cell contents */}
          {GRID.map((row, r) =>
            row.map((cell, c) => {
              const cx = gx(c) + CELL / 2
              const cy = gy(r) + CELL / 2
              const isGiven = typeof cell.given === 'number'
              const columnRevealed = revealedCols.has(c)

              // Givens are always shown (ink). Markers in a revealed column flip
              // to their forced value (orange tint + blue number); unrevealed
              // markers keep their glyph. Other blanks stay empty.
              if (isGiven) {
                return (
                  <text
                    key={`g-${r}-${c}`}
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={17}
                    fontWeight={800}
                    fill={GIVEN}
                  >
                    {cell.given}
                  </text>
                )
              }

              if (cell.mark) {
                if (columnRevealed) {
                  return (
                    <motion.g key={`mr-${r}-${c}`} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 22 }}>
                      <rect x={gx(c) + 1.5} y={gy(r) + 1.5} width={CELL - 3} height={CELL - 3} fill={TINT} fillOpacity={0.18} />
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={800} fill={FILLED}>
                        {SOLVED[r][c]}
                      </text>
                    </motion.g>
                  )
                }
                return <MarkerGlyph key={`m-${r}-${c}`} mark={cell.mark} cx={cx} cy={cy} />
              }

              // A plain blank in a revealed column: fill in its forced number so
              // the column's totals visibly add up; otherwise leave it empty.
              if (columnRevealed) {
                return (
                  <motion.text
                    key={`f-${r}-${c}`}
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={17}
                    fontWeight={800}
                    fill={FILLED}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {SOLVED[r][c]}
                  </motion.text>
                )
              }
              return null
            }),
          )}

          {/* grey column-sum circles, lit amber on the active column */}
          {Array.from({ length: COLS }, (_, c) => {
            const cx = circleCx(c)
            const active = beat.col === c
            return (
              <g key={`c-${c}`}>
                <line x1={cx} y1={PAD_TOP + GRID_H} x2={cx} y2={circleCy - CIRCLE_R} stroke={SUM_FILL} strokeWidth={1.2} />
                <circle
                  cx={cx}
                  cy={circleCy}
                  r={CIRCLE_R}
                  fill={SUM_FILL}
                  stroke={active ? HIGHLIGHT_STROKE : INK}
                  strokeWidth={active ? 2.4 : 1.4}
                />
                <text x={cx} y={circleCy} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={SUM_TEXT}>
                  {COL_SUMS[c]}
                </text>
              </g>
            )
          })}
        </svg>

        {/* running tally of the three forced markers */}
        <div className="flex items-center gap-3 font-display text-sm font-extrabold">
          {(['bullet', 'diamond', 'star'] as Marker[]).map((m) => {
            const done = beat.revealed.includes(m)
            return (
              <motion.span
                key={m}
                className="inline-flex items-center gap-1 rounded-lg border-2 px-2 py-1"
                animate={{
                  borderColor: done ? GREEN : '#E5E7EB',
                  background: done ? '#ECFDF5' : '#FFFFFF',
                  color: done ? GREEN_INK : '#9CA3AF',
                }}
                transition={{ duration: 0.25 }}
              >
                <span style={{ color: done ? GREEN_INK : MARK }}>{SYMBOL_GLYPH[m]}</span>
                <span>{done ? `= ${story.values[m]}` : '= ?'}</span>
              </motion.span>
            )
          })}
        </div>

        {/* active-marker label */}
        {beat.marker != null && (
          <div className="font-display text-xs font-bold" style={{ color: BRAND_BLUE }}>
            {T(`solving the ${SYMBOL_NAME[beat.marker][0]}`, `mencari ${SYMBOL_NAME[beat.marker][1]}`)}
          </div>
        )}

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
