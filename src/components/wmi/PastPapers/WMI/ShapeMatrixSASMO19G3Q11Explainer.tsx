// SASMO-19-G3-Q11 — animated explainer.
//
// Reuses shape atoms from ShapeMatrixSASMO19G3Q11Illustration so the
// explainer grid is pixel-identical to the stem figure. Five beats:
//   1. Full grid — introduce the matrix.
//   2. Highlight row 0 — demonstrate the column-3 rule for row 0.
//   3. Highlight row 1 — confirm the rule for row 1.
//   4. Highlight row 2 (no answer) — set up the question.
//   5. Reveal the answer in row 2 col 2 — answer B.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  Star3,
  Star3Sm,
  Star6,
  Rings,
  Triquetra,
} from './ShapeMatrixSASMO19G3Q11Illustration'
import { buildSmQ11Steps } from './shapeMatrixSASMO19G3Q11Steps'

const INK = '#1F2937'
const GRID_STROKE = '#9CA3AF'
const HIGHLIGHT_ROW = 'rgba(251,191,36,0.20)'  // amber tint
const ANSWER_CELL   = 'rgba(16,185,129,0.16)'  // green tint for revealed cell

const CELL = 90
const W = CELL * 3

export default function ShapeMatrixSASMO19G3Q11Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSmQ11Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Cell centres
  const R0 = CELL / 2
  const R1 = CELL + CELL / 2
  const R2 = 2 * CELL + CELL / 2
  const C0 = CELL / 2
  const C1 = CELL + CELL / 2
  const C2 = 2 * CELL + CELL / 2

  const aria =
    lang === 'id'
      ? 'Penjelasan: aturan matriks — kolom 3 = bentuk di dalam lingkaran; jawaban B: bintang 6 lengan di dalam tiga lingkaran konsentris.'
      : 'Explainer: matrix rule — column 3 = shape inside circles; answer B: 6-arm star inside triple concentric rings.'

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${W} ${W}`}
          width="100%"
          style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Row highlight tints (drawn before grid lines so lines show on top) */}
          {beat.highlightRow === 0 && (
            <rect x={0} y={0} width={W} height={CELL} fill={HIGHLIGHT_ROW} />
          )}
          {beat.highlightRow === 1 && (
            <rect x={0} y={CELL} width={W} height={CELL} fill={HIGHLIGHT_ROW} />
          )}
          {beat.highlightRow === 2 && (
            <>
              {/* Tint cols 0 and 1 of row 2 */}
              <rect x={0} y={CELL * 2} width={CELL * 2} height={CELL} fill={HIGHLIGHT_ROW} />
              {/* Green tint on the answer cell once revealed */}
              {beat.showAnswer && (
                <rect x={CELL * 2} y={CELL * 2} width={CELL} height={CELL} fill={ANSWER_CELL} />
              )}
            </>
          )}

          {/* Grid border and dividers */}
          <rect x={0} y={0} width={W} height={W} fill="none" stroke={GRID_STROKE} strokeWidth={1.5} />
          <path
            d={`M 0 ${CELL} H ${W} M 0 ${CELL * 2} H ${W}`}
            stroke={GRID_STROKE}
            strokeWidth={1.5}
            fill="none"
          />
          <path
            d={`M ${CELL} 0 V ${W} M ${CELL * 2} 0 V ${W}`}
            stroke={GRID_STROKE}
            strokeWidth={1.5}
            fill="none"
          />

          {/* Row 0: 3-arm star | annulus | star in circle */}
          <Star3 cx={C0} cy={R0} r={30} />
          <Rings cx={C1} cy={R0} rings={[28, 9]} />
          <circle cx={C2} cy={R0} r={34} fill="none" stroke={INK} strokeWidth={1.5} />
          <Star3 cx={C2} cy={R0} r={27} />

          {/* Row 1: small 3-arm star | double rings | triquetra */}
          <Star3Sm cx={C0} cy={R1} r={20} />
          <Rings cx={C1} cy={R1} rings={[22, 12]} />
          <Triquetra cx={C2} cy={R1} r={28} />

          {/* Row 2: 6-arm star | triple rings | ? or answer */}
          <Star6 cx={C0} cy={R2} r={32} />
          <Rings cx={C1} cy={R2} rings={[30, 20, 11]} />

          {beat.showAnswer ? (
            /* Revealed: 6-arm star inside triple concentric rings */
            <>
              <Rings cx={C2} cy={R2} rings={[34, 23, 13]} />
              <Star6 cx={C2} cy={R2} r={30} />
            </>
          ) : (
            <text
              x={C2}
              y={R2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={40}
              fontWeight={900}
              fill={INK}
            >
              ?
            </text>
          )}
        </svg>

        {/* Beat caption */}
        <p
          className="text-center text-sm font-medium leading-snug"
          style={{ color: '#374151', maxWidth: 280 }}
        >
          {beat.caption}
        </p>
      </div>
    </div>
  )
}
