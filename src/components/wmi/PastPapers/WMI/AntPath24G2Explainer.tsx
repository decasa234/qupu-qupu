import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  ANT_PATH,
  CELL_W,
  CELL_H,
  GRID_COLS,
  GRID_ROWS,
  PAD_LEFT,
  PAD_TOP,
  nodeXY,
} from './AntPath24G2Illustration'

// WMI-24F2A-Q3 — an ant crawls a dotted path on a 4×3 grid (cells 2 cm wide,
// 1 cm tall). The path has six segments; each beat reveals one segment and
// adds its length to a running total, landing on 11 cm (answer B).
//
// Segments (scan-faithful):
//   1. DOWN  1 cell   → 1 × 1 cm = 1 cm   (vertical)
//   2. RIGHT 2 cells  → 2 × 2 cm = 4 cm   (horizontal)
//   3. DOWN  1 cell   → 1 × 1 cm = 1 cm   (vertical)
//   4. LEFT  1 cell   → 1 × 2 cm = 2 cm   (horizontal)
//   5. DOWN  1 cell   → 1 × 1 cm = 1 cm   (vertical)
//   6. LEFT  1 cell   → 1 × 2 cm = 2 cm   (horizontal)
//
// horizontal total: 4 + 2 + 2 = 8 cm
// vertical  total: 1 + 1 + 1 = 3 cm
// grand  total: 8 + 3 = 11 cm → choice B

// ---------------------------------------------------------------------------
// Colour tokens (echoing fill-qupu-*)
// ---------------------------------------------------------------------------
const BLUE = '#30598A'    // fill-qupu-brand-blue — horizontal segment accent
const ORANGE = '#f0853a'  // fill-qupu-brand-orange — vertical segment accent
const GREEN = '#10B981'   // answer / winner accent
const INK = '#1F2937'     // label ink
const MUTED = '#CBD5E1'   // dimmed segments not yet revealed
const RED = '#DC2626'     // ant glyph colour (matches illustration)

// ---------------------------------------------------------------------------
// SVG geometry — reuse the illustration's coordinate system
// ---------------------------------------------------------------------------
// The illustration applies translate(0, labelTop - PAD_TOP) = translate(0,12),
// so we do the same transform offset here.
const LABEL_TOP = 26
const TRANSLATE_Y = LABEL_TOP - PAD_TOP  // = 12

const LABEL_RIGHT = 30
const SVG_W = PAD_LEFT + GRID_COLS * CELL_W + LABEL_RIGHT
const SVG_H = LABEL_TOP + PAD_TOP + GRID_ROWS * CELL_H + 10

// Grid nodes to SVG x/y (within the translated group)
function gxy(col: number, row: number): [number, number] {
  return nodeXY(col, row)
}

// The six segments of ANT_PATH (index pairs)
const SEGMENTS: Array<{
  from: [number, number]
  to: [number, number]
  axis: 'h' | 'v'
  cells: number
  cmEach: number
}> = [
  { from: ANT_PATH[0], to: ANT_PATH[1], axis: 'v', cells: 1, cmEach: 1 }, // down 1
  { from: ANT_PATH[1], to: ANT_PATH[2], axis: 'h', cells: 2, cmEach: 2 }, // right 2
  { from: ANT_PATH[2], to: ANT_PATH[3], axis: 'v', cells: 1, cmEach: 1 }, // down 1
  { from: ANT_PATH[3], to: ANT_PATH[4], axis: 'h', cells: 1, cmEach: 2 }, // left 1
  { from: ANT_PATH[4], to: ANT_PATH[5], axis: 'v', cells: 1, cmEach: 1 }, // down 1
  { from: ANT_PATH[5], to: ANT_PATH[6], axis: 'h', cells: 1, cmEach: 2 }, // left 1
]
const SEG_COUNT = SEGMENTS.length

// ---------------------------------------------------------------------------
// Beat storyboard (pure, deterministic)
// ---------------------------------------------------------------------------
interface AntBeat {
  /** How many segments to show (0 = none, 4 = all) */
  shown: number
  /** Running total in cm so far */
  total: number
  /** True only on the final answer beat */
  result: boolean
  /** Hold duration in ms */
  hold: number
  caption: string
}

function buildSteps(lang: 'en' | 'id'): AntBeat[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const cumCm = [0, 1, 5, 6, 8, 9, 11] // cumulative cm after each segment

  const dirLabel = (seg: (typeof SEGMENTS)[number]) => {
    if (seg.axis === 'h') {
      // determine direction
      const [fc] = seg.from
      const [tc] = seg.to
      if (tc > fc) return t('right', 'kanan')
      return t('left', 'kiri')
    } else {
      const [, fr] = seg.from
      const [, tr] = seg.to
      if (tr > fr) return t('down', 'bawah')
      return t('up', 'atas')
    }
  }

  const steps: AntBeat[] = []

  // Beat 0 — introduce the plan
  steps.push({
    shown: 0,
    total: 0,
    result: false,
    hold: 2400,
    caption: t(
      'Horizontal cells are 2 cm wide. Vertical cells are 1 cm tall. Count each step!',
      'Petak mendatar lebarnya 2 cm. Petak tegak tingginya 1 cm. Hitung tiap langkah!',
    ),
  })

  // Beats 1–6 — reveal one segment each time
  for (let i = 0; i < SEG_COUNT; i++) {
    const seg = SEGMENTS[i]
    const cm = seg.cells * seg.cmEach
    const dir = dirLabel(seg)
    const axis = seg.axis === 'h' ? t('horizontal', 'mendatar') : t('vertical', 'tegak')
    const total = cumCm[i + 1]
    steps.push({
      shown: i + 1,
      total,
      result: false,
      hold: 1900,
      caption: t(
        `${dir} ${seg.cells} cell${seg.cells > 1 ? 's' : ''} × ${seg.cmEach} cm (${axis}) = ${cm} cm — total ${total} cm`,
        `${dir} ${seg.cells} petak × ${seg.cmEach} cm (${axis}) = ${cm} cm — total ${total} cm`,
      ),
    })
  }

  // Beat 7 — summary before answer
  steps.push({
    shown: SEG_COUNT,
    total: 11,
    result: false,
    hold: 2100,
    caption: t(
      'Horizontal: 4 + 2 + 2 = 8 cm  |  Vertical: 1 + 1 + 1 = 3 cm',
      'Mendatar: 4 + 2 + 2 = 8 cm  |  Tegak: 1 + 1 + 1 = 3 cm',
    ),
  })

  // Beat 8 — answer
  steps.push({
    shown: SEG_COUNT,
    total: 11,
    result: true,
    hold: 0,
    caption: t('8 + 3 = 11 cm → B', '8 + 3 = 11 cm → B'),
  })

  return steps
}

// ---------------------------------------------------------------------------
// Small drawn ant glyph (red, matches illustration)
// ---------------------------------------------------------------------------
function AntGlyph({ cx, cy, size = 1 }: { cx: number; cy: number; size?: number }) {
  return (
    <g transform={`translate(${cx},${cy - 18 * size}) scale(${size})`}>
      <ellipse cx={0} cy={8} rx={5} ry={7} fill={RED} />
      <ellipse cx={0} cy={0} rx={4} ry={4} fill={RED} />
      <ellipse cx={0} cy={-7} rx={4} ry={4} fill={RED} />
      <circle cx={-1.5} cy={-8} r={1} fill={INK} />
      <circle cx={1.5} cy={-8} r={1} fill={INK} />
      <line x1={-2} y1={-10} x2={-6} y2={-15} stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
      <line x1={2} y1={-10} x2={6} y2={-15} stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
      <circle cx={-6} cy={-15} r={1.2} fill={INK} />
      <circle cx={6} cy={-15} r={1.2} fill={INK} />
      {([-4, 0, 4] as const).map((dy, i) => (
        <g key={i}>
          <line x1={-4} y1={dy} x2={-9} y2={dy + 3} stroke={INK} strokeWidth={1} strokeLinecap="round" />
          <line x1={4} y1={dy} x2={9} y2={dy + 3} stroke={INK} strokeWidth={1} strokeLinecap="round" />
        </g>
      ))}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function AntPath24G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo(() => buildSteps(lang), [lang])
  const finalIndex = steps.length - 1
  const index = useBeatControl(finalIndex, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[finalIndex]

  const ariaLabel = t(
    'Ant-path explainer: split the path into horizontal (2 cm per cell) and vertical (1 cm per cell) segments. Horizontal total 8 cm plus vertical total 3 cm equals 11 cm, answer B.',
    'Penjelasan lintasan semut: pisahkan ruas mendatar (2 cm per petak) dan tegak (1 cm per petak). Mendatar 8 cm ditambah tegak 3 cm sama dengan 11 cm, jawaban B.',
  )

  // Compute moving ant position — placed at the end of the last revealed segment
  const antNode = beat.shown === 0 ? ANT_PATH[0] : ANT_PATH[beat.shown]
  const [antX, antY] = gxy(...antNode)

  // Running-total badge colours
  const totalColor = beat.result ? GREEN : BLUE

  return (
    <div
      className="mx-auto w-full max-w-[340px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* strategy legend */}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-1 text-center font-display text-xs font-bold"
          style={{ background: '#E1EFFB', color: BLUE }}
        >
          {t('Horizontal × 2 cm, vertical × 1 cm — add it all up', 'Mendatar × 2 cm, tegak × 1 cm — jumlahkan semua')}
        </div>

        {/* the grid scene */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(300, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          <g transform={`translate(0,${TRANSLATE_Y})`}>
            {/* grid background */}
            {Array.from({ length: GRID_ROWS }, (_, r) =>
              Array.from({ length: GRID_COLS }, (_, c) => (
                <rect
                  key={`cell-${r}-${c}`}
                  x={PAD_LEFT + c * CELL_W}
                  y={PAD_TOP + r * CELL_H}
                  width={CELL_W}
                  height={CELL_H}
                  fill="white"
                  stroke="#9CA3AF"
                  strokeWidth={1}
                />
              )),
            )}
            {/* grid lines (over cell fills) */}
            {Array.from({ length: GRID_COLS + 1 }, (_, c) => (
              <line
                key={`v${c}`}
                x1={PAD_LEFT + c * CELL_W}
                y1={PAD_TOP}
                x2={PAD_LEFT + c * CELL_W}
                y2={PAD_TOP + GRID_ROWS * CELL_H}
                stroke="#9CA3AF"
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: GRID_ROWS + 1 }, (_, r) => (
              <line
                key={`h${r}`}
                x1={PAD_LEFT}
                y1={PAD_TOP + r * CELL_H}
                x2={PAD_LEFT + GRID_COLS * CELL_W}
                y2={PAD_TOP + r * CELL_H}
                stroke="#9CA3AF"
                strokeWidth={1}
              />
            ))}

            {/* dimension labels */}
            {/* "2 cm" bracket at top of last column */}
            {(() => {
              const bracketY = PAD_TOP - 6
              const bx0 = PAD_LEFT + (GRID_COLS - 1) * CELL_W
              const bx1 = PAD_LEFT + GRID_COLS * CELL_W
              const labelX = (bx0 + bx1) / 2
              return (
                <g fontSize={9} fontWeight={700} fill={INK}>
                  <line x1={bx0} y1={bracketY - 4} x2={bx0} y2={bracketY} stroke={INK} strokeWidth={1.5} />
                  <line x1={bx0} y1={bracketY} x2={bx1} y2={bracketY} stroke={INK} strokeWidth={1.5} />
                  <line x1={bx1} y1={bracketY - 4} x2={bx1} y2={bracketY} stroke={INK} strokeWidth={1.5} />
                  <text x={labelX} y={bracketY - 6} textAnchor="middle" dominantBaseline="auto">
                    2 cm
                  </text>
                </g>
              )
            })()}
            {/* "1 cm" bracket on right of first row */}
            {(() => {
              const rx = PAD_LEFT + GRID_COLS * CELL_W + 6
              const ry0 = PAD_TOP
              const ry1 = PAD_TOP + CELL_H
              const labelY = (ry0 + ry1) / 2
              return (
                <g fontSize={9} fontWeight={700} fill={INK}>
                  <line x1={rx} y1={ry0} x2={rx + 4} y2={ry0} stroke={INK} strokeWidth={1.5} />
                  <line x1={rx} y1={ry0} x2={rx} y2={ry1} stroke={INK} strokeWidth={1.5} />
                  <line x1={rx} y1={ry1} x2={rx + 4} y2={ry1} stroke={INK} strokeWidth={1.5} />
                  <text x={rx + 7} y={labelY} textAnchor="start" dominantBaseline="central" fontSize={9} fontWeight={700} fill={INK}>
                    1 cm
                  </text>
                </g>
              )
            })()}

            {/* revealed path segments */}
            {SEGMENTS.map((seg, i) => {
              if (i >= beat.shown) return null
              const [x1, y1] = gxy(...seg.from)
              const [x2, y2] = gxy(...seg.to)
              const col = seg.axis === 'h' ? BLUE : ORANGE
              const isLatest = i === beat.shown - 1
              return (
                <motion.line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={col}
                  strokeWidth={isLatest ? 4 : 3}
                  strokeLinecap="round"
                  strokeDasharray={isLatest ? '6,4' : '6,4'}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 22, duration: 0.5 }}
                />
              )
            })}

            {/* remaining (not yet shown) path — very faint dashed */}
            {SEGMENTS.map((seg, i) => {
              if (i < beat.shown) return null
              const [x1, y1] = gxy(...seg.from)
              const [x2, y2] = gxy(...seg.to)
              return (
                <line
                  key={`dim-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={MUTED}
                  strokeWidth={2}
                  strokeDasharray="5,4"
                  strokeLinecap="round"
                />
              )
            })}

            {/* start dot */}
            {(() => {
              const [sx, sy] = gxy(...ANT_PATH[0])
              return <circle cx={sx} cy={sy} r={5} fill={INK} />
            })()}

            {/* end dot (visible only on final beats when path fully shown) */}
            {beat.shown >= SEG_COUNT && (() => {
              const [ex, ey] = gxy(...ANT_PATH[ANT_PATH.length - 1])
              return (
                <motion.circle
                  cx={ex}
                  cy={ey}
                  r={5}
                  fill={beat.result ? GREEN : INK}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 16 }}
                />
              )
            })()}

            {/* the moving ant */}
            <motion.g
              animate={{ x: antX - gxy(...ANT_PATH[0])[0], y: antY - gxy(...ANT_PATH[0])[1] }}
              transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            >
              <AntGlyph cx={gxy(...ANT_PATH[0])[0]} cy={gxy(...ANT_PATH[0])[1]} />
            </motion.g>
          </g>
        </svg>

        {/* running total badge row */}
        <div className="flex min-h-[2rem] items-center justify-center gap-2">
          <AnimatePresence initial={false}>
            {beat.total > 0 && (
              <motion.span
                key={`total-${beat.total}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: totalColor }}
              >
                {beat.total} cm
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption box */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
