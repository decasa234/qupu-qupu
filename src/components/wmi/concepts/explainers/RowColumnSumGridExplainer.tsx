import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildRowColumnSumGridSteps, type SquareState } from './rowColumnSumGridSteps'
import { useBeatControl } from './useBeatControl'
import { GridBoard, gridBoardViewBox } from '../../PastPapers/WMI/primitives/GridBoard'

// The same grid, in the same place, every single beat. Squares never move and
// never change size — they only change colour and swap a cover glyph for the
// number that has just been proved. The amber band picks out the one line the
// beat is reasoning about, including its printed total out in the margin, so the
// child sees WHICH evidence is being spent before the arithmetic appears.
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

const CELL = 50

/** GridBoard speaks in highlight modes; the storyboard speaks in square states. */
const HIGHLIGHT: Record<SquareState, 'none' | 'ring' | 'amber' | 'green' | 'red'> = {
  visible: 'none',
  covered: 'ring',
  active: 'amber',
  solved: 'green',
  asked: 'amber',
}

export default function RowColumnSumGridExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const still = !!reduce
  const story = useMemo(() => buildRowColumnSumGridSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const { rows, cols, rowSums, colSums } = story
  const hasRowSums = rowSums.some((s) => s !== '')
  const hasColSums = colSums.some((s) => s !== '')
  const gutter = Math.round(CELL * 0.6)
  const viewBox = gridBoardViewBox(
    rows,
    cols,
    CELL,
    hasRowSums ? rowSums : undefined,
    hasColSums ? colSums : undefined,
  )

  // The spotlight behind the active line's printed total, so the number the
  // beat is spending is lit up along with the squares it constrains.
  const sumSpot =
    beat.active === null
      ? null
      : beat.active.kind === 'row'
        ? hasRowSums
          ? { x: cols * CELL + gutter - 17, y: beat.active.index * CELL + CELL / 2 - 13 }
          : null
        : hasColSums
          ? { x: beat.active.index * CELL + CELL / 2 - 17, y: rows * CELL + gutter - 13 }
          : null

  const captionStyle =
    beat.phase === 'trap'
      ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
      : beat.phase === 'result'
        ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
        : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Strategy: work one line at a time. Take the line whose total is printed and that has only one covered square left, subtract the numbers you can see from that total, and the cover gives its number up — which leaves ${story.answer}.`,
    `Strategi: kerjakan satu garis dulu. Ambil garis yang jumlahnya tercetak dan tinggal punya satu kotak tertutup, kurangi jumlah itu dengan bilangan yang terlihat, dan kotak tertutup itu menyerahkan bilangannya — sehingga hasilnya ${story.answer}.`,
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
              background: beat.active ? AMBER_SOFT : GREEN_SOFT,
              borderColor: beat.active ? AMBER : GREEN,
              color: beat.active ? '#8A6100' : GREEN_INK,
            }}
          >
            {beat.active
              ? beat.active.kind === 'row'
                ? T(`Row ${beat.active.index + 1}`, `Baris ke-${beat.active.index + 1}`)
                : T(`Column ${beat.active.index + 1}`, `Kolom ke-${beat.active.index + 1}`)
              : T('Whole grid', 'Seluruh kisi')}
          </span>
        </div>

        <svg viewBox={viewBox} width="100%" style={{ maxWidth: '15rem' }}>
          {sumSpot && (
            <rect
              x={sumSpot.x}
              y={sumSpot.y}
              width={34}
              height={26}
              rx={8}
              fill={AMBER_SOFT}
              stroke={AMBER}
              strokeWidth={2}
            />
          )}
          <GridBoard
            rows={rows}
            cols={cols}
            cellSize={CELL}
            label={(r, c) => beat.labels[r * cols + c]}
            highlight={(r, c) => HIGHLIGHT[beat.cells[r * cols + c] ?? 'visible']}
            rowSums={hasRowSums ? rowSums : undefined}
            colSums={hasColSums ? colSums : undefined}
          />
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
