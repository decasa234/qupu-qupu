import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildVisitAllCellsPathSteps } from './visitAllCellsPathSteps'
import { useBeatControl } from './useBeatControl'
import { MazeGrid } from '../../PastPapers/WMI/primitives/MazeGrid'

// The same board, in the same place, every single beat. Squares never move —
// the amber trail simply grows one forced stretch at a time, the visit number
// appears on a square only once the reasoning has proved it, and a hop that was
// ruled out is crossed out in rose where the child can see WHY the route had no
// choice. Nothing is announced before it has been earned.
//
// Geometry belongs to MazeGrid; this file supplies data, the beat colours, and
// the labels that sit on top.

const BLUE = '#30598A'
const BLUE_SOFT = '#E1EFFB'
const GREEN = '#58A700'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const ROSE = '#D9534F'
const ROSE_SOFT = '#FBE9E8'
const AMBER = '#E0A000'
const AMBER_SOFT = '#FFF3D4'
const AMBER_INK = '#8A6100'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const MUTED = '#9AA2AE'
const RABBIT_FUR = '#FFFFFF'
const RABBIT_LINE = '#5C6470'
const RABBIT_EAR = '#FFD3B1'

const CELL = 44
const PAD = 24

/** MazeGrid's own cell geometry, mirrored so labels can sit on cell centres. */
const centreX = (col: number) => PAD + col * CELL + CELL / 2
const centreY = (row: number) => PAD + row * CELL + CELL / 2

function Rabbit() {
  return (
    <g>
      <ellipse cx={-4.5} cy={-10} rx={3} ry={7} fill={RABBIT_FUR} stroke={RABBIT_LINE} strokeWidth={1.5} />
      <ellipse cx={4.5} cy={-10} rx={3} ry={7} fill={RABBIT_FUR} stroke={RABBIT_LINE} strokeWidth={1.5} />
      <ellipse cx={-4.5} cy={-10} rx={1.2} ry={4.4} fill={RABBIT_EAR} />
      <ellipse cx={4.5} cy={-10} rx={1.2} ry={4.4} fill={RABBIT_EAR} />
      <circle cx={0} cy={3} r={9} fill={RABBIT_FUR} stroke={RABBIT_LINE} strokeWidth={1.7} />
      <circle cx={-3.2} cy={1} r={1.4} fill={RABBIT_LINE} />
      <circle cx={3.2} cy={1} r={1.4} fill={RABBIT_LINE} />
    </g>
  )
}

export default function VisitAllCellsPathExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const still = !!reduce
  const story = useMemo(() => buildVisitAllCellsPathSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const { rows, cols } = story
  const width = cols * CELL + PAD * 2
  const height = rows * CELL + PAD * 2

  const numbered = new Set(beat.numbers.map((n) => `${n.r},${n.c}`))
  const crossed = new Set(beat.crossed.map((cell) => `${cell.r},${cell.c}`))

  const captionStyle =
    beat.phase === 'trap'
      ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
      : beat.phase === 'result'
        ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
        : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Strategy: never guess a turn. Take the hop that is the only one left, and refuse any turn that would strand a square behind the rabbit — which leaves ${story.answer}.`,
    `Strategi: jangan menebak belokan. Ambil lompatan yang memang tinggal satu-satunya, dan tolak belokan yang meninggalkan petak di belakang kelinci — sehingga hasilnya ${story.answer}.`,
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
            {T('Board', 'Papan')}
          </span>
          <span
            className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold"
            style={{
              background: beat.phase === 'result' ? GREEN_SOFT : AMBER_SOFT,
              borderColor: beat.phase === 'result' ? GREEN : AMBER,
              color: beat.phase === 'result' ? GREEN_INK : AMBER_INK,
            }}
          >
            {beat.numbers.length > 0
              ? T(`${beat.numbers.length} squares placed`, `${beat.numbers.length} petak terisi`)
              : T('Start here', 'Mulai di sini')}
          </span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: '15rem' }}>
          {/* The square this beat is reasoning from. */}
          {beat.focus && (
            <rect
              x={PAD + beat.focus.c * CELL + 2}
              y={PAD + beat.focus.r * CELL + 2}
              width={CELL - 4}
              height={CELL - 4}
              rx={7}
              fill="none"
              stroke={AMBER}
              strokeWidth={2.6}
            />
          )}

          <MazeGrid
            rows={rows}
            cols={cols}
            cellSize={CELL}
            padding={PAD}
            blocked={story.blocked}
            path={beat.path}
            trailColor={AMBER}
            cellFill={(col, row) => {
              if (crossed.has(`${row},${col}`)) return ROSE_SOFT
              if (numbered.has(`${row},${col}`)) return GREEN_SOFT
              if (col === story.start[0] && row === story.start[1]) return GREEN_SOFT
              return undefined
            }}
            start={
              beat.phase === 'setup'
                ? { cell: story.start, glyph: <Rabbit /> }
                : undefined
            }
          />

          {/* Row and column numbers — the names the captions point squares by. */}
          {Array.from({ length: cols }, (_, c) => (
            <text key={`col-${c}`} x={centreX(c)} y={PAD - 7} textAnchor="middle" fontSize={11} fontWeight={700} fill={MUTED}>
              {c + 1}
            </text>
          ))}
          {Array.from({ length: rows }, (_, r) => (
            <text key={`row-${r}`} x={PAD - 8} y={centreY(r) + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={MUTED}>
              {r + 1}
            </text>
          ))}

          {/* Mark letters live in the corner: they are names, not values. */}
          {story.marks.map((mark, i) => (
            <text
              key={`mark-${i}`}
              x={PAD + mark.cell.c * CELL + 8}
              y={PAD + mark.cell.r * CELL + 14}
              textAnchor="middle"
              fontSize={11}
              fontWeight={800}
              fill={AMBER_INK}
            >
              {mark.label}
            </text>
          ))}

          {/* The visit number, printed only once the beat has proved it. */}
          {beat.numbers.map((n) => (
            <text
              key={`n-${n.r}-${n.c}`}
              x={centreX(n.c)}
              y={centreY(n.r) + 6}
              textAnchor="middle"
              fontSize={17}
              fontWeight={800}
              fill={GREEN_INK}
            >
              {n.n}
            </text>
          ))}

          {/* Hops that were ruled out this beat. */}
          {beat.crossed.map((cell, i) => (
            <path
              key={`x-${i}`}
              d={`M ${centreX(cell.c) - 11} ${centreY(cell.r) - 11} L ${centreX(cell.c) + 11} ${centreY(cell.r) + 11} M ${centreX(cell.c) + 11} ${centreY(cell.r) - 11} L ${centreX(cell.c) - 11} ${centreY(cell.r) + 11}`}
              fill="none"
              stroke={ROSE}
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}
        </svg>

        <div className="flex min-h-[1.75rem] w-full items-center justify-center gap-2">
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
