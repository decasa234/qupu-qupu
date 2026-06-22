// IKMC-20-PE-Q23 — Explainer
// Post-answer walkthrough: test x=6, show S=11, reveal remaining pairs.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  IsoCube23,
  HL_TOP,
  ANS_RIGHT,
} from './CubeFaces23PEIllustration'
import {
  buildCubeFaces23PESteps,
  FACE_GIVEN, FACE_OPP, PAIR_SUM,
  PAIR_B, PAIR_C,
  VISIBLE_LEFT, VISIBLE_RIGHT,
} from './cubeFaces23PESteps'

const GREEN  = '#10B981'
const AMBER  = '#F59E0B'
const BLUE   = '#3B82F6'
const WHITE_FILL = '#F8F4EE'
const WHITE_L    = '#E2D9CE'
const WHITE_R    = '#C8BAA8'

// ---------------------------------------------------------------------------
// Small pair badge — renders "a + b = S ✓"
// ---------------------------------------------------------------------------

function PairBadge({ a, b, sum, ok }: { a: number; b: number; sum: number; ok: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 font-display text-sm font-bold"
      style={
        ok
          ? { background: '#D1FAE5', border: '2px solid #10B981', color: '#065F46' }
          : { background: '#FEF3C7', border: '2px solid #F59E0B', color: '#92400E' }
      }
    >
      ({a}, {b}) = {sum} {ok ? '✓' : '?'}
    </span>
  )
}

// ---------------------------------------------------------------------------
// The explainer
// ---------------------------------------------------------------------------

/**
 * CubeFaces23PEExplainer — post-answer explainer for IKMC-20-PE-Q23.
 *
 * Beats:
 *   1 (intro)   — labelled cube, state the equal-opposite-pairs rule.
 *   2 (test-c)  — try x=6; show S=5+6=11, highlight top+bottom in amber.
 *   3 (pairs)   — reveal (2,9) and (3,8) also hit 11; highlight in green.
 *   4 (result)  — confirm answer C = 6.
 */
export default function CubeFaces23PEExplainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildCubeFaces23PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Compute per-face fill colours
  const topFill   = beat.highlightAnswerPair ? HL_TOP   : WHITE_FILL
  const leftFill  = WHITE_L
  const rightFill = WHITE_R

  // Caption background
  const captionStyle = beat.result
    ? { background: '#D1FAE5', borderColor: GREEN,  color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,   color: '#1E3A5F' }

  // Sum badge background
  const sumStyle = beat.highlightAnswerPair
    ? { background: '#FEF9E7', borderColor: AMBER, color: '#92400E' }
    : { background: '#F3F4F6', borderColor: '#9CA3AF', color: '#374151' }

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: sisi berhadapan 5 adalah 6, karena S=11 dan pasang (2,9) serta (3,8) juga berjumlah 11.`
      : `Explainer: the face opposite 5 is 6, because S=11 and pairs (2,9) and (3,8) also sum to 11.`

  // SVG viewBox (matches CubeFaces23PEIllustration constants)
  const SIZE_PX = 50
  const CX_PX   = SIZE_PX * 0.866
  const CY_PX   = SIZE_PX * 0.5
  const PAD_PX  = 14
  const vbX = 0 - PAD_PX
  const vbY = -CY_PX - PAD_PX
  const vbW = 2 * CX_PX + PAD_PX * 2
  const vbH = CY_PX + SIZE_PX + CY_PX + PAD_PX * 2

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Cube illustration — top face highlighted when testing the pair */}
        <svg
          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
          width={170}
          style={{ display: 'block', overflow: 'visible' }}
          aria-hidden="true"
        >
          <IsoCube23
            ox={0} oy={0}
            topLabel={String(FACE_GIVEN)}
            leftLabel={String(VISIBLE_LEFT)}
            rightLabel={String(VISIBLE_RIGHT)}
            topFill={topFill}
            leftFill={leftFill}
            rightFill={rightFill}
          />

          {/* When we've identified the opposite pair, show a "?" → answer label below */}
          {beat.highlightAnswerPair && (
            <text
              x={CX_PX}
              y={CY_PX + SIZE_PX * 1.35}
              textAnchor="middle"
              fontSize={14}
              fontWeight="bold"
              fontFamily="Georgia, serif"
              fill={ANS_RIGHT}
            >
              ↕ {FACE_OPP}
            </text>
          )}
        </svg>

        {/* S = sum badge */}
        {beat.showSum && (
          <div
            className="rounded-full border-2 px-4 py-1 text-center font-display text-sm font-extrabold"
            style={sumStyle}
          >
            {`S = ${FACE_GIVEN} + ${FACE_OPP} = ${PAIR_SUM}`}
          </div>
        )}

        {/* Remaining pair badges */}
        {beat.highlightRemainingPairs && (
          <div className="flex flex-wrap justify-center gap-2">
            <PairBadge a={PAIR_B[0]} b={PAIR_B[1]} sum={PAIR_SUM} ok />
            <PairBadge a={PAIR_C[0]} b={PAIR_C[1]} sum={PAIR_SUM} ok />
          </div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
