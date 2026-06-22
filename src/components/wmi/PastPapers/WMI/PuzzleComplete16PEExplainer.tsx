import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  PuzzleComplete16PEBoard,
  PuzzlePiece,
  PIECE_CELLS,
  OPTION_PIECES,
  cellSpan,
} from './PuzzleComplete16PEIllustration'
import {
  buildPuzzleComplete16PESteps,
  type OptionView,
} from './puzzleComplete16PESteps'

// IKMC-23-PE-Q16 — "Which pieces does Max use to complete the puzzle?" (answer A).
// Walk: count the gap (9 cells) → reject B/C/D by wrong total → reject E by wrong
// shape → A fills the gap exactly. Mirrors the static board from the Illustration
// by reusing PuzzleComplete16PEBoard and PuzzlePiece primitives.

// ── colour tokens ──────────────────────────────────────────────────────────────
const BLUE_FILL   = '#3FA9E1'
const BLUE_STROKE = '#1A6FA0'
const ORANGE_FILL = '#f0853a'
const GREEN = '#10B981'
const RED   = '#DC2626'

// ── small piece card ───────────────────────────────────────────────────────────
function OptionCard({ opt, lang }: { opt: OptionView; lang: 'en' | 'id' }) {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const isCorrect = opt.verdict === 'correct'
  const accent     = isCorrect ? GREEN : RED
  const bg         = isCorrect ? '#D1FAE5' : '#FEE2E2'
  const pieceIds   = OPTION_PIECES[opt.label] ?? []

  const CELL = 14
  const PAD  = 3
  const GAP  = 4

  // Layout the pieces side-by-side in a mini row
  const pieceDims = pieceIds.map((id) => {
    const cells = PIECE_CELLS[id]
    const { rows, cols } = cellSpan(cells)
    return { id, cells, w: cols * CELL + PAD * 2, h: rows * CELL + PAD * 2 }
  })
  const maxH   = Math.max(...pieceDims.map((p) => p.h))
  const totalW = pieceDims.reduce((s, p, i) => s + p.w + (i > 0 ? GAP : 0), 0)

  return (
    <div
      className="flex flex-col items-center gap-1 rounded-lg border-2 px-2 py-1.5"
      style={{ background: bg, borderColor: accent }}
    >
      <div className="font-display text-xs font-black" style={{ color: accent }}>
        {opt.label}
      </div>
      <svg
        viewBox={`0 0 ${totalW} ${maxH}`}
        width={totalW}
        height={maxH}
        style={{ display: 'block' }}
        role="presentation"
      >
        {pieceDims.reduce<{ els: React.ReactNode[]; x: number }>(
          (acc, p, i) => {
            const x   = i === 0 ? 0 : acc.x + GAP
            const yOff = Math.floor((maxH - p.h) / 2)
            acc.els.push(
              <PuzzlePiece
                key={p.id}
                cells={p.cells}
                x={x + PAD}
                y={yOff + PAD}
                cell={CELL}
                fill={isCorrect ? ORANGE_FILL : BLUE_FILL}
                stroke={BLUE_STROKE}
                strokeWidth={1.5}
              />,
            )
            acc.x = x + p.w
            return acc
          },
          { els: [], x: 0 },
        ).els}
      </svg>
      <div
        className="font-display text-[0.65rem] font-bold tabular-nums"
        style={{ color: accent }}
      >
        {isCorrect
          ? t(`${opt.total} cells ✓`, `${opt.total} kotak ✓`)
          : opt.verdict === 'shape-wrong'
            ? t(`${opt.total} cells, wrong shape ✗`, `${opt.total} kotak, bentuk salah ✗`)
            : t(`${opt.total} cells ✗`, `${opt.total} kotak ✗`)}
      </div>
    </div>
  )
}

// ── explainer ──────────────────────────────────────────────────────────────────
export default function PuzzleComplete16PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t    = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildPuzzleComplete16PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: the gap has ${story.gapSize} cells. B, C, D have the wrong total. E has ${story.gapSize} cells but the wrong shape. A has ${story.gapSize} cells and fits — the answer is A.`,
    `Penjelasan: celahnya ${story.gapSize} kotak. B, C, D jumlahnya salah. E berjumlah ${story.gapSize} tapi bentuknya tidak cocok. A berjumlah ${story.gapSize} dan pas — jawabannya A.`,
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* goal banner */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          <span
            aria-hidden
            className="inline-block h-3 w-3 rounded-sm"
            style={{ background: '#FFFFFF', border: `1.5px solid ${BLUE_STROKE}` }}
          />
          {t(`Find 3 pieces that total ${story.gapSize} cells and fit the gap`, `Cari 3 potongan yang berjumlah ${story.gapSize} kotak dan pas di celah`)}
        </div>

        {/* puzzle board */}
        <div className="relative flex items-center justify-center">
          <PuzzleComplete16PEBoard showPiece={beat.showPiece} />
          {beat.countGap && (
            <motion.div
              key="gap-count"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              className="pointer-events-none absolute -top-2 right-0 rounded-full px-2 py-0.5 font-display text-sm font-black text-white shadow"
              style={{ background: BLUE_STROKE }}
            >
              {t(`gap = ${story.gapSize}`, `celah = ${story.gapSize}`)}
            </motion.div>
          )}
        </div>

        {/* option cards */}
        <div className="flex min-h-[5.5rem] items-center justify-center gap-2 flex-wrap">
          <AnimatePresence mode="popLayout" initial={false}>
            {beat.options.map((opt) => (
              <motion.div
                key={opt.label}
                layout
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              >
                <OptionCard opt={opt} lang={lang} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.reject
                ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                : { background: '#E1EFFB', borderColor: BLUE_STROKE, color: BLUE_STROKE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
