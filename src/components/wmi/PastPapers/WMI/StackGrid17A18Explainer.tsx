// SEAMO-18-A-Q17 — post-answer explainer: stacking grids to find the union.
//
// Teaches the "union = any cell in ANY figure" strategy beat-by-beat.
// Each beat reveals the cells contributed by one source figure, building up
// to the 6-cell union that matches answer B.
//
// Pure SVG via GridBoard primitive. No random, no Date, SSR-safe.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import { buildStackGrid17A18Steps, type RC } from './stackGrid17A18Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────

const YELLOW    = '#FCD34D'
const GREEN     = '#059669'
const GREEN_BG  = '#D1FAE5'
const GREEN_TXT = '#065F46'
const BLUE      = '#1A6FA0'
const BLUE_BG   = '#E1EFFB'

// ── grid constants ─────────────────────────────────────────────────────────────

const ROWS = 4
const COLS = 4
const EXP_CELL = 38   // px per cell in the explainer result grid

// ── AnimatedGrid — shows the progressive stacking ─────────────────────────────

interface AnimatedGridProps {
  activeCells: RC[]
  isResult: boolean
}

function AnimatedGrid({ activeCells, isResult }: AnimatedGridProps) {
  const cellSet = new Set(activeCells.map(([r, c]) => `${r},${c}`))
  const vb = gridBoardViewBox(ROWS, COLS, EXP_CELL)
  const size = ROWS * EXP_CELL

  return (
    <svg
      viewBox={vb}
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <GridBoard
        rows={ROWS}
        cols={COLS}
        cellSize={EXP_CELL}
        fill={(r, c) => {
          if (!cellSet.has(`${r},${c}`)) return '#FFFFFF'
          return isResult ? '#BBF7D0' : YELLOW
        }}
        gridStroke={isResult ? GREEN : '#6B7280'}
      />
    </svg>
  )
}

// ── FigLabel — small badge showing which figure is being added ────────────────

function FigLabel({ fig, lang }: { fig: 0 | 1 | 2 | 3; lang: 'en' | 'id' }) {
  if (fig === 0) return null
  const label =
    lang === 'id' ? `Gambar ${fig}` : `Figure ${fig}`
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        color: BLUE,
        background: BLUE_BG,
        padding: '2px 8px',
        borderRadius: 6,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      }}
    >
      {label}
    </div>
  )
}

// ── StackGrid17A18Explainer ───────────────────────────────────────────────────

/**
 * StackGrid17A18Explainer — post-answer walkthrough for SEAMO-18-A-Q17.
 *
 * Beats:
 *   0 (stem)  — introduce the stacking task.
 *   1 (fig1)  — show cells from Figure 1.
 *   2 (fig2)  — accumulate cells from Figure 2.
 *   3 (fig3)  — accumulate cells from Figure 3.
 *   4 (union) — display 6-cell union.
 *   5 (result)— confirm answer B.
 */
export default function StackGrid17A18Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'

  const story = useMemo(() => buildStackGrid17A18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tumpuk tiga grid — gabungan sel kuning membentuk pola B. Jawaban B.'
      : 'Explainer: stack three grids — the union of yellow cells forms pattern B. Answer B.'

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Figure badge */}
        <FigLabel fig={beat.activeFig} lang={lang} />

        {/* Animated result grid */}
        <AnimatedGrid activeCells={beat.activeCells} isResult={beat.result} />

        {/* Equation */}
        {beat.equation && (
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: BLUE,
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {beat.equation}
          </div>
        )}

        {/* Caption */}
        <div
          className="min-h-[3rem] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
