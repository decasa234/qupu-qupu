/**
 * IKMC-23-EC-Q4 — post-answer explainer (answer C = pieces 1 and 4).
 *
 * Animation strategy (try-and-fit):
 *   Beat 0  — Introduce the goal; all four pieces shown, none highlighted.
 *   Beat 1  — Dim 3+4; highlight 1+2 in red — wrong.
 *   Beat 2  — Dim 2+4; highlight 1+3 in red — wrong.
 *   Beat 3  — Dim 1+4; highlight 2+3 in red — wrong.
 *   Beat 4  — Highlight 1+4 in blue — slide them into assembly position.
 *   Beat 5  — Show assembled square (P1 + P4) with green border → answer C.
 *
 * Reuses PiecePoly from Pieces4ECIllustration.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CELL,
  PIECE_PTS,
  PIECE_FILL,
  PIECE_STROKE,
  PiecePoly,
  type GridPt,
} from './Pieces4ECIllustration'
import { buildPieces4ECStory } from './pieces4ECSteps'

// ─── colour tokens ────────────────────────────────────────────────────────────

const REJECT_FILL    = '#FCA5A5'  // red-300 — wrong pair
const REJECT_STROKE  = '#C0392B'
const ACTIVE_FILL    = '#93C5FD'  // blue-300 — pair being tried
const ACTIVE_STROKE  = '#2563EB'
const WIN_FILL_1     = '#FBCF9C'  // peach — piece 1 in assembled view
const WIN_FILL_4     = '#A7D3F0'  // sky — piece 4 in assembled view
const GREEN          = '#10B981'
const DIM_OPACITY    = 0.2

// ─── assembly polygon coords in the assembled-square view ─────────────────────

// The assembled 6×6 square (pixel side = CELL * 6 = 120 px), pieces placed:
//   P1 in the square: (0,0)→(6,0)→(6,2)→(2,2)→(2,4)→(0,4)  (local top-left = square origin)
//   P4 in the square: (0,4)→(2,4)→(2,2)→(6,2)→(6,6)→(0,6)  (sits below P1)
//
// In SVG coords the square origin is at (ASSEMBLE_X, ASSEMBLE_Y).

const P1_IN_SQUARE: GridPt[] = [[0,0],[6,0],[6,2],[2,2],[2,4],[0,4]]
const P4_IN_SQUARE: GridPt[] = [[0,4],[2,4],[2,2],[6,2],[6,6],[0,6]]

// ─── layout constants ─────────────────────────────────────────────────────────

const PIECE_W    = CELL * 6   // 120 px
const PIECE_H    = CELL * 4   //  80 px
const PAD        = 10
const LABEL_H    = 22
const COL_GAP    = 10

const SLOT_W     = PIECE_W + PAD * 2   // 140 px
const SLOT_H     = PIECE_H + PAD * 2   // 100 px

// Four pieces in a row at the top
const VIEW_W     = 4 * SLOT_W + 3 * COL_GAP   // 596 px
// Caption area below, then assembled square centered
const ASSEMBLE_Y = SLOT_H + LABEL_H + 16
const SQUARE_SIDE = CELL * 6   // 120 px
const ASSEMBLE_X = (VIEW_W - SQUARE_SIDE) / 2
const VIEW_H     = ASSEMBLE_Y + SQUARE_SIDE + 16

function slotOriginX(index: number): number {
  return index * (SLOT_W + COL_GAP)
}

// ─── main component ───────────────────────────────────────────────────────────

export default function Pieces4ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildPieces4ECStory(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Which piece indices (0-based) are in the active pair?
  const activePair = beat.pair ? beat.pair.map((n) => n - 1) : null
  const isWin      = beat.result
  const isReject   = beat.reject

  return (
    <div
      className="mx-auto w-full max-w-[640px]"
      role="img"
      aria-label={t(
        'Trying each pair of puzzle pieces: only pieces 1 and 4 join to form a square (answer C).',
        'Mencoba setiap pasangan potongan puzzle: hanya potongan 1 dan 4 yang membentuk persegi (jawaban C).',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: Math.min(VIEW_W, 640), display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* ── Four pieces in a row ── */}
          {PIECE_PTS.map((pts, i) => {
            const ox = slotOriginX(i) + PAD
            const oy = PAD
            const labelX = slotOriginX(i) + SLOT_W / 2
            const labelY = SLOT_H + LABEL_H / 2

            const inActivePair = activePair != null && activePair.includes(i)
            const dimmed       = activePair != null && !inActivePair && !isWin

            let fill   = PIECE_FILL
            let stroke = PIECE_STROKE
            let sw     = 2

            if (inActivePair && isReject) {
              fill   = REJECT_FILL
              stroke = REJECT_STROKE
              sw     = 3
            } else if (inActivePair && !isWin) {
              fill   = ACTIVE_FILL
              stroke = ACTIVE_STROKE
              sw     = 3
            } else if (inActivePair && isWin) {
              fill   = i === 0 ? WIN_FILL_1 : WIN_FILL_4
              stroke = ACTIVE_STROKE
              sw     = 3
            }

            return (
              <g key={i} opacity={dimmed ? DIM_OPACITY : 1}>
                <PiecePoly pts={pts} ox={ox} oy={oy} fill={fill} stroke={stroke} strokeWidth={sw} />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={15}
                  fontWeight={900}
                  fill={inActivePair ? stroke : PIECE_STROKE}
                  className="font-display"
                >
                  {i + 1}
                </text>
              </g>
            )
          })}

          {/* ── Assembled square (visible from beat 4 onward) ── */}
          {activePair != null && activePair[0] === 0 && activePair[1] === 3 && (
            <>
              {/* Target square outline */}
              <rect
                x={ASSEMBLE_X}
                y={ASSEMBLE_Y}
                width={SQUARE_SIDE}
                height={SQUARE_SIDE}
                fill="#E1EFFB"
                stroke={isWin ? GREEN : '#C9BDA6'}
                strokeWidth={isWin ? 3 : 2}
                strokeLinejoin="round"
              />

              {/* Slide in piece 1 */}
              <motion.g
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <PiecePoly
                  pts={P1_IN_SQUARE}
                  ox={ASSEMBLE_X}
                  oy={ASSEMBLE_Y}
                  fill={isWin ? WIN_FILL_1 : ACTIVE_FILL}
                  stroke={isWin ? '#065F46' : ACTIVE_STROKE}
                  strokeWidth={2}
                />
              </motion.g>

              {/* Slide in piece 4 */}
              <motion.g
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
              >
                <PiecePoly
                  pts={P4_IN_SQUARE}
                  ox={ASSEMBLE_X}
                  oy={ASSEMBLE_Y}
                  fill={isWin ? WIN_FILL_4 : ACTIVE_FILL}
                  stroke={isWin ? '#065F46' : ACTIVE_STROKE}
                  strokeWidth={2}
                />
              </motion.g>

              {/* Dividing cut line (shows the two pieces as distinct parts) */}
              {!isWin && (
                <polyline
                  points={[
                    [ASSEMBLE_X + 0 * CELL, ASSEMBLE_Y + 4 * CELL],
                    [ASSEMBLE_X + 2 * CELL, ASSEMBLE_Y + 4 * CELL],
                    [ASSEMBLE_X + 2 * CELL, ASSEMBLE_Y + 2 * CELL],
                    [ASSEMBLE_X + 6 * CELL, ASSEMBLE_Y + 2 * CELL],
                  ]
                    .map(([x, y]) => `${x},${y}`)
                    .join(' ')}
                  fill="none"
                  stroke={ACTIVE_STROKE}
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
              )}

              {/* Win check-mark label */}
              {isWin && (
                <text
                  x={ASSEMBLE_X + SQUARE_SIDE / 2}
                  y={ASSEMBLE_Y - 8}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={18}
                  fontWeight={900}
                  fill={GREEN}
                  className="font-display"
                >
                  {t('Perfect square!', 'Persegi sempurna!')}
                </text>
              )}
            </>
          )}
        </svg>

        {/* Caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isWin
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : isReject
                ? { background: '#FDE2E1', borderColor: REJECT_STROKE, color: '#9B2C20' }
                : { background: '#E1EFFB', borderColor: ACTIVE_STROKE, color: ACTIVE_STROKE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
