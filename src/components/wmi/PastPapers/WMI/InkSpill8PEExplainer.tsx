// IKMC-22-PE-Q8 — post-answer animated explainer.
//
// Imports the shared InkBlob + GridLines primitives so the explainer reads as the
// same scene coming alive. Row-by-row highlighting walks the student through the
// systematic count that yields 20 (answer E).

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  InkBlob,
  GridLines,
  SVG_W,
  SVG_H,
  ROWS,
  gx,
  gy,
  COLS,
  GRID_BG,
} from './InkSpill8PEIllustration'
import { buildInkSpill8PESteps } from './inkSpill8PESteps'

// Highlight colour for the row being counted
const ROW_HL_FILL = 'rgba(255, 230, 50, 0.45)'
const ROW_HL_STROKE = '#D97706'

const GREEN = '#10B981'
const ACCENT = '#2563EB'

export default function InkSpill8PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildInkSpill8PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const accent = isResult ? GREEN : ACCENT

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: menghitung kotak yang terkena tinta baris per baris — totalnya ${story.total}.`
      : `Explainer: counting inked squares row by row — total is ${story.total}.`

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          style={{ maxWidth: '100%', display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={GRID_BG} />

          {/* ink blob (slightly faded during row-count phase so highlights read clearly) */}
          <InkBlob opacity={beat.phase === 'row' ? 0.55 : 1} />

          {/* row highlight: solid rectangle over current row */}
          {beat.phase === 'row' && beat.row != null && (
            <rect
              x={gx(0)}
              y={gy(beat.row)}
              width={gx(COLS) - gx(0)}
              height={gy(beat.row + 1) - gy(beat.row)}
              fill={ROW_HL_FILL}
              stroke={ROW_HL_STROKE}
              strokeWidth={2.5}
              rx={2}
            />
          )}

          {/* result: gentle green tint over entire grid */}
          {isResult && (
            <rect
              x={gx(0)}
              y={gy(0)}
              width={gx(COLS) - gx(0)}
              height={gy(ROWS) - gy(0)}
              fill="rgba(16,185,129,0.18)"
              stroke={GREEN}
              strokeWidth={2}
              rx={2}
            />
          )}

          {/* squared-paper grid lines — always on top */}
          <GridLines />

          {/* row count badge: small pill in the highlighted row */}
          {beat.phase === 'row' && beat.row != null && (
            <text
              x={gx(COLS) - 8}
              y={gy(beat.row) + (gy(beat.row + 1) - gy(beat.row)) / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={800}
              fill={ROW_HL_STROKE}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              ×{5}
            </text>
          )}
        </svg>

        {/* Running total */}
        {beat.running > 0 && (
          <div
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: isResult ? GREEN : accent }}
          >
            {beat.running}
          </div>
        )}

        {/* Equation line */}
        {beat.equation && (
          <div
            className="font-mono text-xs font-bold tabular-nums"
            style={{ color: isResult ? GREEN : '#6B7280' }}
          >
            {beat.equation}
          </div>
        )}

        {/* Caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.phase === 'row'
                ? { background: '#FEF3C7', borderColor: ROW_HL_STROKE, color: '#92400E' }
                : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
