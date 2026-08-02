import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildPathSumOptimizeSteps } from './pathSumOptimizeSteps'
import { useBeatControl } from './useBeatControl'
import { GridBoard } from '../../PastPapers/WMI/primitives/GridBoard'

// The same grid, in the same place, every single beat. The printed numbers never
// move and never change — what grows is the little green badge in each square's
// corner, holding the best total still reachable from there. The amber band
// picks out the row being filled, so the child sees WHICH squares are being
// worked out before the arithmetic appears in the caption.
//
// Only the last two beats draw a route: the rose one is the greedy mistake, the
// green one is the answer. Everything before them is the table being built.
//
// Geometry belongs to GridBoard; this file supplies data and the beat colours.

const BLUE = '#30598A'
const BLUE_SOFT = '#E1EFFB'
const GREEN = '#58A700'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const ROSE = '#D9534F'
const ROSE_SOFT = '#FBE9E8'
const AMBER = '#E0A000'
const AMBER_SOFT = '#FFF3D4'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const MUTED = '#9AA2AE'

const CELL = 56
const PAD = 10

export default function PathSumOptimizeExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const still = !!reduce
  const story = useMemo(() => buildPathSumOptimizeSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const { rows, cols, finish } = story
  const width = cols * CELL + PAD * 2
  const height = rows * CELL + PAD * 2

  const centre = (cell: { r: number; c: number }) => ({
    x: cell.c * CELL + CELL / 2,
    y: cell.r * CELL + CELL / 2,
  })
  const routePoints = (beat.route ?? [])
    .map((cell) => {
      const { x, y } = centre(cell)
      return `${x},${y}`
    })
    .join(' ')
  const routeInk = beat.routeTone === 'bad' ? ROSE : GREEN

  const captionStyle =
    beat.phase === 'trap'
      ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
      : beat.phase === 'result'
        ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
        : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Strategy: instead of trying routes, write on every square the best total reachable from it, starting at the bottom row where the robot has no choice, and work upwards until the start square shows ${story.answer}.`,
    `Strategi: alih-alih mencoba jalur, tulis di setiap kotak jumlah terbaik yang bisa dicapai dari kotak itu, mulai dari baris paling bawah tempat robot tidak punya pilihan, lalu naik sampai kotak awal menunjukkan ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <span
            className="font-display text-[0.625rem] font-extrabold uppercase tracking-wide"
            style={{ color: MUTED }}
          >
            {T('Grid', 'Kisi')}
          </span>
          <span
            className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold"
            style={{
              background: beat.activeRow === null ? GREEN_SOFT : AMBER_SOFT,
              borderColor: beat.activeRow === null ? GREEN : AMBER,
              color: beat.activeRow === null ? GREEN_INK : '#8A6100',
            }}
          >
            {beat.activeRow === null
              ? T('Whole grid', 'Seluruh kisi')
              : T(`Row ${beat.activeRow + 1}`, `Baris ke-${beat.activeRow + 1}`)}
          </span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: '17rem' }}>
          <g transform={`translate(${PAD},${PAD})`}>
            <GridBoard
              rows={rows}
              cols={cols}
              cellSize={CELL}
              label={(r, c) => String(story.values[r * cols + c])}
              highlight={(r, c) => {
                if (beat.activeRow === r) return 'amber'
                if (r === 0 && c === 0) return 'green'
                if (r === finish.r && c === finish.c) return 'ring'
                return 'none'
              }}
            />

            {/* The backward table, one small badge per settled square. */}
            {beat.badges.map((value, i) => {
              if (value === null) return null
              const r = Math.floor(i / cols)
              const c = i % cols
              return (
                <g key={`badge-${i}`}>
                  <rect
                    x={c * CELL + CELL - 27}
                    y={r * CELL + 2}
                    width={25}
                    height={15}
                    rx={5}
                    fill={GREEN_SOFT}
                    stroke={GREEN}
                    strokeWidth={1.5}
                  />
                  <text
                    x={c * CELL + CELL - 14.5}
                    y={r * CELL + 10}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={10}
                    fontWeight={800}
                    fill={GREEN_INK}
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                  >
                    {value}
                  </text>
                </g>
              )
            })}

            {/* Only the trap beat and the answer beat draw a route. */}
            {beat.route !== null && (
              <polyline
                points={routePoints}
                fill="none"
                stroke={routeInk}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.85}
              />
            )}

            {/* Start dot and finish flag, so the two corners never go missing. */}
            <circle cx={10} cy={10} r={5} fill={GREEN} />
            <g transform={`translate(${finish.c * CELL + CELL - 16},${finish.r * CELL + CELL - 18})`}>
              <line x1={0} y1={0} x2={0} y2={13} stroke={BLUE} strokeWidth={2} strokeLinecap="round" />
              <polygon points="0,0 11,4 0,8" fill={AMBER} />
            </g>
          </g>
        </svg>

        {/* The rose chip naming the greedy total, or the answer. */}
        <div className="flex min-h-[1.75rem] w-full items-center justify-center gap-2">
          {beat.trapTotal !== null && (
            <span
              className="flex items-center gap-1 rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={{ background: ROSE_SOFT, borderColor: ROSE, color: ROSE }}
            >
              <svg viewBox="0 0 16 16" width={10} height={10} role="presentation">
                <path
                  d="M3 3 L13 13 M13 3 L3 13"
                  fill="none"
                  stroke={ROSE}
                  strokeWidth={2.6}
                  strokeLinecap="round"
                />
              </svg>
              {beat.trapTotal}
            </span>
          )}
          {beat.reveal !== null && (
            <motion.span
              initial={still ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={{ background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }}
            >
              {T('Answer', 'Jawaban')} {beat.reveal}
            </motion.span>
          )}
        </div>

        <div
          className="w-full rounded-xl border-2 px-3 py-2 text-center font-display text-[0.8125rem] font-extrabold leading-snug"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
