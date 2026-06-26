import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  U, OX, OY, SHAPE_W, SHAPE_H, NOTCH_W, NOTCH_H,
  V, SVG_W, SVG_H, COLOR,
  LShape, DimLabels,
} from './NotchedRectOSN25PQ4Illustration'
import { buildNotchedRectOSN25PQ4Steps } from './notchedRectOSN25PQ4Steps'

// OSN-25-SD-PROV-Q4 — animated explainer: rectangular notch preserves perimeter.
//
// Animation beats:
//   0. intro     — static L-shape.
//   1. bounding  — dashed bounding rectangle; equation 2×(8+6)=28.
//   2. cancel    — highlight notch sides (amber) + equivalent ghost sides (green dashes).
//   3. result    — green fill + "28 satuan".

const GREEN = COLOR.GREEN
const BLUE  = '#30598A'
const AMBER = COLOR.AMBER

// Derived pixel dimensions (mirror of Illustration constants)
const W  = SHAPE_W * U   // 160
const H  = SHAPE_H * U   // 120
const NH = NOTCH_H * U   //  60

// Bottom-right corner of the bounding rectangle (completes the notch)
const BR: [number, number] = [OX + W, OY + H]

// ── Animated overlay components ───────────────────────────────────────────────

/** Dashed bounding rectangle (always 8×6). */
function BoundingRect() {
  const { A } = V
  return (
    <rect
      x={A[0]}
      y={A[1]}
      width={W}
      height={H}
      fill="none"
      stroke={BLUE}
      strokeWidth={2}
      strokeDasharray="7 4"
      strokeLinejoin="round"
    />
  )
}

/** Amber solid lines for the two notch sides (C→D and D→E). */
function NotchSidesHighlight() {
  const { C, D, E } = V
  return (
    <path
      d={`M ${C[0]} ${C[1]} L ${D[0]} ${D[1]} L ${E[0]} ${E[1]}`}
      fill="none"
      stroke={AMBER}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

/**
 * Green dashed lines for the two rectangle sides the notch "replaced":
 *   C → BR (vertical, length NH = 3 units)
 *   BR → E  (horizontal, length NW = 4 units)
 */
function EquivSidesHighlight() {
  const { C, E } = V
  return (
    <path
      d={`M ${C[0]} ${C[1]} L ${BR[0]} ${BR[1]} L ${E[0]} ${E[1]}`}
      fill="none"
      stroke={GREEN}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="6 3"
    />
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function NotchedRectOSN25PQ4Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildNotchedRectOSN25PQ4Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: lekukan persegi tidak mengubah keliling — keliling = 2×(8+6) = 28 satuan.'
      : 'Explainer: a rectangular notch never changes the perimeter — perimeter = 2×(8+6) = 28 units.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(280, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* L-shape (green tint when result) */}
          <LShape fill={isResult ? '#D1FAE5' : COLOR.FILL} />

          {/* always show dimension labels */}
          <DimLabels />

          {/* bounding rectangle dashed overlay — beats 1 and 2 */}
          <AnimatePresence>
            {beat.showBoundingRect && (
              <motion.g
                key="bounding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <BoundingRect />
              </motion.g>
            )}
          </AnimatePresence>

          {/* notch + equivalent side highlights — beat 2 */}
          <AnimatePresence>
            {beat.highlightNotch && (
              <motion.g
                key="notch-hl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <EquivSidesHighlight />
                <NotchSidesHighlight />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation pill */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
