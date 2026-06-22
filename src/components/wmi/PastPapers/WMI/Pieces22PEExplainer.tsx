// IKMC-23-PE-Q22 — Explainer
// Post-answer walkthrough: show the grid, place piece E at optimal position,
// reveal the sum (6+7+9+5+2 = 29). Answer: E (official IKMC 2023 answer key).

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  GridBoard,
  PieceShape,
} from './Pieces22PEIllustration'
import {
  buildPieces22PESteps,
  PIECE_E,
  ANSWER_CELLS,
  ANSWER_SUM,
  GRID,
} from './pieces22PESteps'

// ── Colours ───────────────────────────────────────────────────────────────────

const GREEN    = '#059669'
const GREEN_BG = '#D1FAE5'
const BLUE     = '#1A6FA0'
const BLUE_BG  = '#E1EFFB'
const PIECE_FILL   = '#B8B0D4'
const PIECE_STROKE = '#6B62A8'

// ── Arithmetic breakdown ───────────────────────────────────────────────────────

function SumBadge({ lang }: { lang: 'en' | 'id' }) {
  const nums  = ANSWER_CELLS.map(([r, c]) => GRID[r][c])
  const parts = nums.join(' + ')
  const label = lang === 'id' ? 'Jumlah' : 'Sum'

  return (
    <div
      className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
      style={{ background: GREEN_BG, borderColor: GREEN, color: '#065F46' }}
    >
      {label} = {parts} = {ANSWER_SUM}
    </div>
  )
}

// ── Explainer ─────────────────────────────────────────────────────────────────

/**
 * Pieces22PEExplainer — post-answer walkthrough for IKMC-23-PE-Q22.
 *
 * Beats:
 *   1 (intro)     — show the 3×3 grid, state the task.
 *   2 (identify)  — note the cluster of large numbers.
 *   3 (place-e)   — overlay piece E on grid at optimal position.
 *   4 (sum)       — show arithmetic 6+7+9+5+2 = 29.
 *   5 (result)    — green answer banner.
 */
export default function Pieces22PEExplainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'

  const story = useMemo(() => buildPieces22PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: potongan E ditempatkan di baris atas-kanan menutupi jumlah ${ANSWER_SUM}. Jawaban E.`
      : `Explainer: piece E placed at top-right covers sum ${ANSWER_SUM}. Answer E.`

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Piece E preview (static label) */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="font-display text-xs font-black" style={{ color: PIECE_STROKE }}>
              {lang === 'id' ? 'Potongan E' : 'Piece E'}
            </div>
            <PieceShape
              cells={PIECE_E}
              cell={18}
              fill={beat.showPlacement ? '#BBF7D0' : PIECE_FILL}
              stroke={beat.showPlacement ? GREEN : PIECE_STROKE}
              strokeWidth={1.5}
            />
          </div>

          <div className="font-display text-lg font-black" style={{ color: '#CBD5E1' }}>
            →
          </div>

          {/* Grid with optional piece overlay */}
          <GridBoard
            covered={beat.showPlacement ? ANSWER_CELLS : []}
            answerColor={beat.result}
            sumLabel={beat.showSum ? String(ANSWER_SUM) : undefined}
          />
        </div>

        {/* Sum arithmetic */}
        {beat.showSum && <SumBadge lang={lang} />}

        {/* Caption */}
        <div
          className="min-h-[3rem] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: '#065F46' }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
