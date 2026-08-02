import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildLatinSquareCageSteps, type SquareState } from './latinSquareCageSteps'
import { useBeatControl } from './useBeatControl'
import { GridBoard } from '../../PastPapers/WMI/primitives/GridBoard'

// The same grid, in the same place, every single beat. Squares never move and
// never change size — they only change colour and swap a blank (or a letter)
// for the number that has just been proved. The amber wash picks out the one
// frame or line the beat is reasoning about, so the child sees WHICH clue is
// being spent before the arithmetic appears.
//
// Geometry belongs to GridBoard, bold cage outlines included; this file
// supplies data and the beat colours.

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
const SPOT = '#FFF8E7'

/** GridBoard speaks in highlight modes; the storyboard speaks in square states. */
const HIGHLIGHT: Record<SquareState, 'none' | 'ring' | 'amber' | 'green' | 'red'> = {
  blank: 'none',
  given: 'none',
  target: 'ring',
  solved: 'green',
  focus: 'amber',
}

export default function LatinSquareCageExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const still = !!reduce
  const story = useMemo(() => buildLatinSquareCageSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const { n } = story
  const cell = n === 5 ? 42 : 50
  const pad = 4
  const side = n * cell
  const viewBox = `0 0 ${side + pad * 2} ${side + pad * 2}`

  const captionStyle =
    beat.phase === 'trap'
      ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
      : beat.phase === 'result'
        ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
        : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Strategy: never guess. Find the one square where the line rule and a printed clue together leave a single number, fill it in, and it hands the next square away — which leaves ${story.answer}.`,
    `Strategi: jangan menebak. Cari satu kotak yang aturan garis dan petunjuk tercetaknya hanya menyisakan satu bilangan, isi kotak itu, dan kotak berikutnya akan terbuka sendiri — sehingga hasilnya ${story.answer}.`,
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
            {T(`${n} x ${n} grid`, `Kisi ${n} x ${n}`)}
          </span>
          <span
            className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold"
            style={{
              background: beat.clue ? AMBER_SOFT : GREEN_SOFT,
              borderColor: beat.clue ? AMBER : GREEN,
              color: beat.clue ? '#8A6100' : GREEN_INK,
            }}
          >
            {beat.clue ?? T('Line rule', 'Aturan garis')}
          </span>
        </div>

        <svg viewBox={viewBox} width="100%" style={{ maxWidth: '15rem' }}>
          <g transform={`translate(${pad}, ${pad})`}>
            <GridBoard
              rows={n}
              cols={n}
              cellSize={cell}
              fill={(r, c) => (beat.spotlight[r * n + c] ? SPOT : undefined)}
              label={(r, c) => beat.labels[r * n + c]}
              highlight={(r, c) => HIGHLIGHT[beat.cells[r * n + c] ?? 'blank']}
              cageBorders={story.cageGroups}
              cageStroke={BLUE}
              cageStrokeWidth={3}
            />
          </g>
        </svg>

        {/* The rose chip naming the reversed number, or the answer. */}
        <div className="flex min-h-[1.75rem] w-full items-center justify-center gap-2">
          {beat.trapNumber !== null && (
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
              {beat.trapNumber}
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
