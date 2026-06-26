// PlatesPearsSIMOC21G1Q13Explainer.tsx
// SIMOC-21-G1-Q13 animated explainer — Fibonacci plates+pears.
//
// Animation flow (7 beats):
//   0. Intro — show all 5 plates.
//   1. Highlight plates 1 & 2 (1, 1 pears).
//   2. Highlight plates 1-2-3 → 1+1=2.
//   3. Highlight plates 2-3-4 → 1+2=3.
//   4. Highlight plates 3-4-5 → 2+3=5.
//   5. Highlight plates 4-5 + reveal plate 6 (3+5=8).
//   6. Result — plate 6 = 8 confirmed.
//
// Re-uses Pear / pearOffsets / layout constants from Illustration.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  Pear,
  pearOffsets,
  PLATE_CX,
  PLATE_Y,
  PLATE_RX,
  PLATE_RY,
  PEAR_BASE_CY,
  PEAR_R,
  PLATE_COUNTS,
  SVG_W,
  SVG_H,
} from './PlatesPearsSIMOC21G1Q13Illustration'
import { buildPlatesPearsSIMOC21G1Q13Steps } from './platesPearsSIMOC21G1Q13Steps'

// ── Constants ─────────────────────────────────────────────────────────────────

const HIGHLIGHT = '#F59E0B'
const RESULT_COLOR = '#10B981'

/** Plate 6 centre X (after plate 5 at 332, gap 70 → 402). */
const PLATE6_CX = 402

/** Pear count on plate 6 = 8 (answer). */
const PLATE6_COUNT = 8

/** Layout for 8 pears: rows [4, 3, 1] (bottom-heavy pyramid). */
const SEP6 = 28
const ROW6 = 24
function pearOffsets6(): Array<[number, number]> {
  return [
    // bottom row of 4
    [-SEP6 * 1.5, 0], [-SEP6 * 0.5, 0], [SEP6 * 0.5, 0], [SEP6 * 1.5, 0],
    // second row of 3
    [-SEP6, -ROW6], [0, -ROW6], [SEP6, -ROW6],
    // top row of 1
    [0, -ROW6 * 2],
  ]
}

// ── Plate shape ───────────────────────────────────────────────────────────────

function Plate({ cx, cy, highlight = false }: { cx: number; cy: number; highlight?: boolean }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy + 4} rx={PLATE_RX + 2} ry={PLATE_RY * 0.55} fill="#90BDD0" opacity={0.35} />
      <ellipse
        cx={cx}
        cy={cy}
        rx={PLATE_RX}
        ry={PLATE_RY}
        fill="#D6EEF7"
        stroke={highlight ? HIGHLIGHT : '#85BDD4'}
        strokeWidth={highlight ? 2.2 : 1.2}
      />
      <ellipse cx={cx} cy={cy - PLATE_RY * 0.3} rx={PLATE_RX * 0.72} ry={PLATE_RY * 0.3} fill="#FFFFFF" opacity={0.45} />
    </g>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PlatesPearsSIMOC21G1Q13Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPlatesPearsSIMOC21G1Q13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const hlSet = new Set(beat.highlighted)

  // Extended SVG width when plate 6 is shown
  const showP6 = beat.showPlate6
  const svgW = showP6 ? SVG_W + 80 : SVG_W

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
        role="img"
        aria-label={
          lang === 'id'
            ? 'Penjelasan pola Fibonacci pada piring-piring'
            : 'Fibonacci plates-and-pears pattern explainer'
        }
      >
        <svg
          viewBox={`0 0 ${svgW} ${SVG_H}`}
          width="100%"
          style={{ maxWidth: svgW, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Plates 1–5 */}
          {PLATE_CX.map((cx, i) => {
            const count = PLATE_COUNTS[i]
            const offsets = pearOffsets(count)
            const isHL = hlSet.has(i)
            const dimmed = beat.phase !== 'intro' && !isHL

            return (
              <g key={i} opacity={dimmed ? 0.35 : 1}>
                <Plate cx={cx} cy={PLATE_Y} highlight={isHL} />
                {offsets.map(([dx, dy], pi) => (
                  <Pear key={pi} cx={cx + dx} cy={PEAR_BASE_CY + dy} r={PEAR_R} />
                ))}
                {/* Amber ring around highlighted plate */}
                {isHL && (
                  <ellipse
                    cx={cx}
                    cy={PLATE_Y}
                    rx={PLATE_RX + 6}
                    ry={PLATE_RY + 5}
                    fill="none"
                    stroke={HIGHLIGHT}
                    strokeWidth={2.2}
                    opacity={0.85}
                  />
                )}
                {/* Count badge */}
                {isHL && (
                  <text
                    x={cx + PLATE_RX + 8}
                    y={PEAR_BASE_CY - 12}
                    textAnchor="start"
                    fontSize={12}
                    fontWeight={700}
                    fill={HIGHLIGHT}
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                  >
                    {count}
                  </text>
                )}
                {/* Plate number */}
                <text
                  x={cx}
                  y={SVG_H - 3}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="#374151"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {i + 1}
                </text>
              </g>
            )
          })}

          {/* Ellipsis (hidden when plate 6 visible) */}
          {!showP6 && (
            <text x={390} y={PLATE_Y - 4} textAnchor="middle" fontSize={20} fill="#6B7280" letterSpacing={3}>
              ...
            </text>
          )}

          {/* Plate 6 (shown from beat 5 onward) */}
          {showP6 && (
            <g>
              <Plate cx={PLATE6_CX} cy={PLATE_Y} highlight />
              {pearOffsets6().map(([dx, dy], pi) => (
                <Pear
                  key={pi}
                  cx={PLATE6_CX + dx}
                  cy={PEAR_BASE_CY + dy}
                  r={PEAR_R * 0.8}
                  color={beat.result ? '#6DB33F' : '#A3D97F'}
                />
              ))}
              {/* Result ring */}
              <ellipse
                cx={PLATE6_CX}
                cy={PLATE_Y}
                rx={PLATE_RX + 8}
                ry={PLATE_RY + 6}
                fill="none"
                stroke={beat.result ? RESULT_COLOR : HIGHLIGHT}
                strokeWidth={2.5}
                opacity={0.9}
              />
              {/* Count badge */}
              <text
                x={PLATE6_CX}
                y={PEAR_BASE_CY - 28}
                textAnchor="middle"
                fontSize={15}
                fontWeight={800}
                fill={beat.result ? RESULT_COLOR : HIGHLIGHT}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {PLATE6_COUNT}
              </text>
              {/* "3+5=8" annotation */}
              <text
                x={PLATE6_CX}
                y={SVG_H - 3}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                fill={beat.result ? RESULT_COLOR : '#6B7280'}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                6
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Caption */}
      <p className="text-center text-sm font-medium text-gray-700 px-2">
        {beat.caption}
      </p>
    </div>
  )
}
