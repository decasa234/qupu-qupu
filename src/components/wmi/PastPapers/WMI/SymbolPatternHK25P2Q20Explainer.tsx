// HKIMO-25-P2H-Q20 — animated explainer for the symbol-pattern sequence.
// Four beats (intro → dots → tris → answer).
// Reuses layout constants and slot-rendering from SymbolPatternHK25P2Q20Illustration.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  GROUPS,
  X0,
  Y0,
  ROW_STEP,
  VIEW_W,
  VIEW_H,
  BLUE,
  INK,
  DOT_FILL,
  TRI_FILL,
  TRI_HL,
  getGroupSlots,
  renderSlot,
} from './SymbolPatternHK25P2Q20Illustration'
import { buildHK25P2Q20Steps } from './symbolPatternHK25P2Q20Steps'

const DOT_HL = '#EF4444'

/** Dot counts per group (group index → count). */
const DOT_COUNTS = [3, 2, 1, 0]
/** Triangle counts per group (total, including the blank for group 4). */
const TRI_COUNTS = [1, 2, 3, 4]

export default function SymbolPatternHK25P2Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildHK25P2Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria =
    lang === 'id'
      ? 'Penjelasan: titik berkurang dan segitiga bertambah setiap kelompok; bagian kosong kelompok 4 = ▲▲.'
      : 'Explainer: dots decrease and triangles increase per group; group 4 blank = two triangles (▲▲).'

  const isDots = beat.phase === 'dots'
  const isTris = beat.phase === 'tris'
  const isAnswer = beat.phase === 'answer'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <text
            x={VIEW_W / 2}
            y={18}
            textAnchor="middle"
            fontSize={11}
            fontWeight={800}
            fill={BLUE}
            className="font-display"
          >
            Pattern / Pola
          </text>

          {GROUPS.map((group, gi) => {
            const cy = Y0 + gi * ROW_STEP
            const slots = getGroupSlots(group, cy)
            const isG4 = gi === 3

            const dotFill = isDots ? DOT_HL : DOT_FILL
            const triFill = isTris || (isAnswer && isG4) ? TRI_HL : TRI_FILL
            const blankFilled = isAnswer && isG4

            return (
              <g key={gi}>
                {/* Green row background for group 4 in answer phase */}
                {isAnswer && isG4 && (
                  <rect
                    x={X0 - 14}
                    y={cy - 18}
                    width={VIEW_W - X0 + 4}
                    height={36}
                    rx={6}
                    fill="rgba(16,185,129,0.10)"
                  />
                )}

                {/* Group number label */}
                <text
                  x={22}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={11}
                  fontWeight={700}
                  fill={INK}
                  className="font-display"
                >
                  {gi + 1}:
                </text>

                {/* Symbols */}
                {slots.map((slot, si) =>
                  renderSlot(slot, `g${gi}-s${si}`, { dotFill, triFill, blankFilled }),
                )}

                {/* Dot count label on the right (dots phase) */}
                {isDots && (
                  <text
                    x={VIEW_W - 8}
                    y={cy}
                    textAnchor="end"
                    dominantBaseline="central"
                    fontSize={10}
                    fontWeight={800}
                    fill={DOT_HL}
                    className="font-display"
                  >
                    {`•×${DOT_COUNTS[gi]}`}
                  </text>
                )}

                {/* Triangle count label on the right (tris phase) */}
                {isTris && (
                  <text
                    x={VIEW_W - 8}
                    y={cy}
                    textAnchor="end"
                    dominantBaseline="central"
                    fontSize={10}
                    fontWeight={800}
                    fill={TRI_HL}
                    className="font-display"
                  >
                    {`▲×${TRI_COUNTS[gi]}`}
                  </text>
                )}

                {/* Answer tick for group 4 */}
                {isAnswer && isG4 && (
                  <text
                    x={VIEW_W - 8}
                    y={cy}
                    textAnchor="end"
                    dominantBaseline="central"
                    fontSize={10}
                    fontWeight={800}
                    fill={TRI_HL}
                    className="font-display"
                  >
                    {'▲▲ ✓'}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        <p className="px-4 text-center text-sm font-medium text-slate-700">{beat.caption}</p>
      </div>
    </div>
  )
}
