import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { HexTableRow, TABLE_SPACING, chairCount } from './HexTableOSN20KQ2Illustration'
import { buildHexTableOSN20KQ2Steps, N_TABLES, ANSWER, BASE_CHAIRS, ADD_PER_TABLE } from './hexTableOSN20KQ2Steps'

const GREEN = '#10B981'
const BLUE = '#2563EB'
const ORANGE = '#F97316'

/**
 * OSN-20-SD-KAB-Q2 explainer.
 * Beats 0–2: grow from 1→2→3 tables, highlighting new chairs.
 * Beat 3: show pattern formula.
 * Beat 4: apply formula for 10 tables, reveal answer = 42.
 */
export default function HexTableOSN20KQ2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildHexTableOSN20KQ2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // In beat 1: newly added chairs are on the right-most table sides (0,2,3,5)
  // (side 1 is shared with the new table, side 4 of the new table is shared with prev)
  // Highlight new chairs in orange when newSides = true
  const sideColor = beat.newSides
    ? (ti: number, si: number) => {
        // Only the rightmost table (ti = beat.nTables - 1) has new sides 0,2,3,5
        if (ti < beat.nTables - 1) return null
        if (si === 0 || si === 2 || si === 3 || si === 5) return ORANGE
        return null
      }
    : undefined

  const CX = 120
  const CY = 72

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: 1 meja = 6 kursi; setiap meja tambahan menambah 4 kursi; 10 meja = ${ANSWER} kursi.`
      : `Explainer: 1 table = 6 chairs; each extra table adds 4; 10 tables = ${ANSWER} chairs.`

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Animated table-row */}
        <svg
          viewBox="0 0 240 145"
          width="100%"
          style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <HexTableRow n={beat.nTables} cx={CX} cy={CY} sideColor={sideColor} />

          {/* Chair count badge */}
          <text x={CX} y={CY + 48} textAnchor="middle" fontSize={12} fontWeight="700" fill={BLUE}>
            {chairCount(beat.nTables)} kursi
          </text>

          {/* Pattern formula (beat 3+) */}
          {beat.showPattern && (
            <text x={CX} y={CY + 65} textAnchor="middle" fontSize={11} fill="#374151">
              {`n meja → ${BASE_CHAIRS} + ${ADD_PER_TABLE}(n−1)`}
            </text>
          )}

          {/* Answer (beat 4) */}
          {beat.showAnswer && (
            <>
              <rect
                x={CX - 82}
                y={CY + 72}
                width={164}
                height={22}
                rx={5}
                fill="#D1FAE5"
                stroke={GREEN}
                strokeWidth={1.5}
              />
              <text x={CX} y={CY + 87} textAnchor="middle" fontSize={12} fontWeight="700" fill="#065F46">
                {`${N_TABLES} meja → ${ANSWER} kursi ✓`}
              </text>

              {/* Show extended row indicator */}
              <text x={CX} y={CY + 110} textAnchor="middle" fontSize={10} fill="#6B7280">
                {`${BASE_CHAIRS} + ${ADD_PER_TABLE}×${N_TABLES - 1} = ${ANSWER}`}
              </text>
            </>
          )}

          {/* Spacing guide: show how far tables span */}
          {beat.nTables > 1 && (
            <line
              x1={CX - (beat.nTables - 1) / 2 * TABLE_SPACING - 24}
              y1={CY + 36}
              x2={CX + (beat.nTables - 1) / 2 * TABLE_SPACING + 24}
              y2={CY + 36}
              stroke="#CBD5E1"
              strokeWidth={1}
              strokeDasharray="3 2"
            />
          )}
        </svg>

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.newSides
                ? { background: '#FFF7ED', borderColor: ORANGE, color: '#9A3412' }
                : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
