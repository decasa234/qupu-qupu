// HKIMO-25-P1H-Q5 — animated explainer for the L-shaped star groups.
//
// Beat flow:
//   0. Intro   — all groups visible, no highlight.
//   1–4. Count — dim non-active groups; show star count badge above active group.
//   5. Pattern — all groups lit; add "+2" annotations between groups.
//   6. Formula — annotate "2n−1" with n=7 example.
//   7. Result  — green "13 ✓" banner.
//
// Re-uses geometry constants and lCells() from Illustration.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CELL, MAX_N, BOTTOM_Y, GROUP_X, SVG_W, SVG_H,
  C_FILL, C_STROKE,
  lCells,
} from './LStarsHK25P1Q5Illustration'
import { buildLStarsHK25P1Q5Steps } from './lStarsHK25P1Q5Steps'

// ─── Extra colours ───────────────────────────────────────────────────────────

const C_DIM_FILL   = '#E5E7EB'
const C_DIM_STROKE = '#D1D5DB'
const C_DIM_TEXT   = '#9CA3AF'
const C_BADGE_TXT  = '#92400E'
const C_PLUS2      = '#6D28D9'   // violet
const C_GREEN      = '#059669'

const LABELS = ['1st', '2nd', '3rd', '4th']

// ─── Component ───────────────────────────────────────────────────────────────

export default function LStarsHK25P1Q5Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildLStarsHK25P1Q5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const showPlus2   = beat.phase === 'pattern'
  const showFormula = beat.phase === 'formula'
  const showResult  = beat.result

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H + (showResult ? 20 : 0)}`}
        style={{ width: '100%', maxWidth: SVG_W }}
      >
        {Array.from({ length: MAX_N }, (_, i) => {
          const n      = i + 1
          const gx     = GROUP_X[i]
          const gy     = BOTTOM_Y - n * CELL
          const cx     = gx + (n * CELL) / 2
          const active = beat.activeGroup === null || beat.activeGroup === n

          const fill   = active ? C_FILL       : C_DIM_FILL
          const stroke = active ? C_STROKE      : C_DIM_STROKE
          const starTx = active ? C_STROKE      : C_DIM_TEXT
          const labelC = active ? '#4B5563'     : C_DIM_TEXT

          const cells = lCells(n)

          return (
            <g key={n}>
              {/* Cells */}
              {cells.map(([r, c]) => (
                <rect
                  key={`${r}-${c}`}
                  x={gx + c * CELL}
                  y={gy + r * CELL}
                  width={CELL}
                  height={CELL}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1.5}
                />
              ))}
              {/* Star symbols */}
              {cells.map(([r, c]) => (
                <text
                  key={`s-${r}-${c}`}
                  x={gx + c * CELL + CELL / 2}
                  y={gy + r * CELL + CELL / 2 + 5}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight="bold"
                  fill={starTx}
                >
                  *
                </text>
              ))}
              {/* Count badge above active group */}
              {beat.activeGroup === n && (
                <text
                  x={cx}
                  y={gy - 5}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight="bold"
                  fill={C_BADGE_TXT}
                >
                  {2 * n - 1}
                </text>
              )}
              {/* Group label */}
              <text
                x={cx}
                y={BOTTOM_Y + 15}
                textAnchor="middle"
                fontSize={11}
                fill={labelC}
              >
                {LABELS[i]}
              </text>
              {/* +2 label between groups (pattern phase) */}
              {showPlus2 && i < MAX_N - 1 && (
                <text
                  x={(gx + n * CELL + GROUP_X[i + 1]) / 2}
                  y={BOTTOM_Y - 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight="bold"
                  fill={C_PLUS2}
                >
                  +2
                </text>
              )}
            </g>
          )
        })}

        {/* Formula annotation (formula phase) */}
        {showFormula && (
          <text
            x={SVG_W / 2}
            y={SVG_H - 4}
            textAnchor="middle"
            fontSize={12}
            fontWeight="bold"
            fill={C_PLUS2}
          >
            {lang === 'id' ? 'Kelompok ke-n = 2n − 1' : 'Group n = 2n − 1'}
          </text>
        )}

        {/* Result banner */}
        {showResult && (
          <text
            x={SVG_W / 2}
            y={SVG_H + 14}
            textAnchor="middle"
            fontSize={14}
            fontWeight="bold"
            fill={C_GREEN}
          >
            {lang === 'id' ? 'Kelompok ke-7 = 13 ✓' : 'Group 7 = 13 ✓'}
          </text>
        )}
      </svg>

      {/* Caption */}
      <p
        style={{
          fontFamily: 'sans-serif',
          fontSize: 13,
          color: '#374151',
          textAlign: 'center',
          maxWidth: 340,
          margin: 0,
        }}
      >
        {beat.caption}
      </p>
    </div>
  )
}
