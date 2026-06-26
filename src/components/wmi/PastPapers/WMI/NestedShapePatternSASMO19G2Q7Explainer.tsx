// NestedShapePatternSASMO19G2Q7Explainer.tsx
// Animated explainer for SASMO-19-G2-Q7.
//
// Animation strategy: step through each figure→figure transition, lighting up
// the source figure with an amber halo and drawing a right-pointing arrow to
// show that the inner shape "slides over" to become the outer of the next figure.
// On beat 4 the answer slot (pentagon + kite) is revealed; beat 5 shows the
// result in a green card.
//
// Reuses ShapeOutline and PATTERN_STEPS from the Illustration — no geometry
// is re-derived here.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  ShapeOutline,
  PATTERN_STEPS,
  ANSWER_STEP,
  itemCx,
  OUTER_R,
  INNER_R,
  RING,
} from './NestedShapePatternSASMO19G2Q7Illustration'
import { buildNestedShapeSteps } from './nestedShapePatternSASMO19G2Q7Steps'

// ── palette ──────────────────────────────────────────────────────────────────
const INK   = '#1F2937'
const WHITE = '#FFFFFF'
const GREEN = '#10B981'
const ARROW = '#F97316'
const QMARK = '#374151'

// ── layout (mirrors the Illustration exactly) ─────────────────────────────────
const CELL   = 88
const PAD    = 10
const STEM_W = CELL * 5 + PAD * 2
const CY     = PAD + CELL / 2
const STEM_H = CELL + PAD * 2

// Arrow geometry: drawn from the right edge of item i to the left edge of i+1.
function arrowD(fromIndex: number): string {
  const x0 = itemCx(fromIndex) + OUTER_R + 4
  const x1 = itemCx(fromIndex + 1) - OUTER_R - 4
  const xm = (x0 + x1) / 2
  return `M ${x0} ${CY} Q ${xm} ${CY - 14} ${x1} ${CY}`
}

export default function NestedShapePatternSASMO19G2Q7Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildNestedShapeSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: bentuk dalam tiap gambar menjadi bentuk luar gambar berikutnya; jawaban D adalah segi lima berisi layang-layang.'
      : 'Explainer: the inner shape of each figure becomes the outer shape of the next; answer D is a pentagon containing a kite.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Pattern strip */}
        <svg
          viewBox={`0 0 ${STEM_W} ${STEM_H}`}
          width="100%"
          style={{ maxWidth: STEM_W, display: 'block' }}
          aria-hidden="true"
        >
          {/* Items 1–4 */}
          {PATTERN_STEPS.map((step, i) => {
            const cx    = itemCx(i)
            const isHit = beat.highlight === i
            return (
              <g key={i}>
                {/* Amber halo on highlighted item */}
                {isHit && (
                  <circle cx={cx} cy={CY} r={OUTER_R + 6} fill={`${RING}33`} stroke={RING} strokeWidth={2.2} />
                )}
                <ShapeOutline name={step.outer} cx={cx} cy={CY} r={OUTER_R} strokeWidth={2.2} />
                <ShapeOutline name={step.inner} cx={cx} cy={CY} r={INNER_R} strokeWidth={2}   />
              </g>
            )
          })}

          {/* Item 5 — either "?" or the revealed answer */}
          {beat.showAnswer ? (
            <g>
              <ShapeOutline name={ANSWER_STEP.outer} cx={itemCx(4)} cy={CY} r={OUTER_R} strokeWidth={2.2} stroke={GREEN} />
              <ShapeOutline name={ANSWER_STEP.inner} cx={itemCx(4)} cy={CY} r={INNER_R} strokeWidth={2}   stroke={GREEN} />
            </g>
          ) : (
            <text
              x={itemCx(4)}
              y={CY + 9}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={38}
              fontWeight="bold"
              fill={QMARK}
            >
              ?
            </text>
          )}

          {/* Arrow from item i to i+1 */}
          {beat.arrowFrom !== null && (
            <>
              <path
                d={arrowD(beat.arrowFrom)}
                fill="none"
                stroke={ARROW}
                strokeWidth={2.2}
                strokeLinecap="round"
              />
              {/* Arrowhead */}
              <polygon
                points={(() => {
                  const x1 = itemCx(beat.arrowFrom + 1) - OUTER_R - 4
                  return `${x1},${CY - 5} ${x1 + 8},${CY} ${x1},${CY + 5}`
                })()}
                fill={ARROW}
              />
            </>
          )}
        </svg>

        {/* Caption card */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
