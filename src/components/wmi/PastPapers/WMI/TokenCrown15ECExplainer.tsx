import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CrownRing,
  SVG_W,
  SVG_H,
  CX,
  CY,
  CROWN_R,
  TOKEN_R,
} from './TokenCrown15ECIllustration'
import { buildTokenCrown15ECSteps } from './tokenCrown15ECSteps'

// IKMC-20-EC-Q15 — post-answer crown/token animation.
// Reuses CrownRing and TokenShape from the illustration so the animation
// reads as the static scene coming alive.
//
// Beat plan (5 beats):
//   0. intro      — static crown, explain matching rule
//   1. edge-rule  — highlight shared edge between X-token and placed neighbour
//   2. constraint — show constraint label "4" on placed token's shared sector
//   3. identify-x — X must equal 4 (edge highlight + constraint)
//   4. result     — reveal X = 4, green

const GREEN = '#10B981'
const BLUE = '#30598A'
const AMBER = '#F59E0B'

// X-token position and its placed neighbour
const X_TOKEN_POS = 2
const PLACED_NEIGHBOUR_POS = 3  // clockwise neighbour of X-token

/** Compute the centre of token i from the exported layout constants. */
function tokenCenterLocal(i: number): [number, number] {
  const a = ((-90 + i * 36) * Math.PI) / 180
  return [CX + CROWN_R * Math.cos(a), CY + CROWN_R * Math.sin(a)]
}

// ── Shared edge highlight ─────────────────────────────────────────────────────

/**
 * EdgeHighlight — draws a bright line between the two tokens that share a side,
 * specifically the edge between token X_TOKEN_POS and PLACED_NEIGHBOUR_POS.
 *
 * The shared edge is the side of each pentagon that faces the other token.
 * For adjacent tokens in the ring, the shared edge is between the two vertices
 * closest to their midpoint.
 */
function SharedEdgeHighlight({ color }: { color: string }) {
  // The midpoint direction between the two tokens
  const [x2, y2] = tokenCenterLocal(X_TOKEN_POS)
  const [x3, y3] = tokenCenterLocal(PLACED_NEIGHBOUR_POS)

  // Midpoint between the two token centres
  const mx = (x2 + x3) / 2
  const my = (y2 + y3) / 2

  // The shared edge is perpendicular to the line joining the two centres.
  // We draw a segment of length ≈ TOKEN_R centred at (mx, my),
  // perpendicular to the direction (x3-x2, y3-y2).
  const dx = x3 - x2
  const dy = y3 - y2
  const len = Math.sqrt(dx * dx + dy * dy)
  // Perpendicular unit vector
  const px = -dy / len
  const py = dx / len

  // Edge half-length: slightly less than TOKEN_R so it stays within the tokens
  const halfLen = TOKEN_R * 0.72

  const ex1 = mx + px * halfLen
  const ey1 = my + py * halfLen
  const ex2 = mx - px * halfLen
  const ey2 = my - py * halfLen

  return (
    <g>
      {/* glow under the edge */}
      <line
        x1={ex1.toFixed(2)}
        y1={ey1.toFixed(2)}
        x2={ex2.toFixed(2)}
        y2={ey2.toFixed(2)}
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.35}
      />
      {/* sharp edge line */}
      <line
        x1={ex1.toFixed(2)}
        y1={ey1.toFixed(2)}
        x2={ex2.toFixed(2)}
        y2={ey2.toFixed(2)}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </g>
  )
}

// ── Constraint label ──────────────────────────────────────────────────────────

/**
 * ConstraintLabel — draws a badge "= 4" near the shared sector of the placed
 * neighbour token, pointing toward the X-token.
 */
function ConstraintLabel({ color }: { color: string }) {
  const [x2, y2] = tokenCenterLocal(X_TOKEN_POS)
  const [x3, y3] = tokenCenterLocal(PLACED_NEIGHBOUR_POS)

  // The label sits on the placed-token side, offset slightly toward X-token
  const lx = x3 + (x2 - x3) * 0.45
  const ly = y3 + (y2 - y3) * 0.45

  return (
    <g>
      {/* pill background */}
      <rect
        x={(lx - 13).toFixed(2)}
        y={(ly - 8).toFixed(2)}
        width={26}
        height={16}
        rx={4}
        fill={color}
      />
      <text
        x={lx.toFixed(2)}
        y={ly.toFixed(2)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={900}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        = 4
      </text>
    </g>
  )
}

// ── Token ring wrappers for beat-driven fills ─────────────────────────────────

function CrownRingBeats({
  highlightXToken,
  highlightNeighbour,
  showAnswer,
}: {
  highlightXToken: boolean
  highlightNeighbour: boolean
  showAnswer: boolean
}) {
  const tokenFills: Partial<Record<number, string>> = {}
  const tokenStrokes: Partial<Record<number, string>> = {}

  if (highlightXToken) {
    tokenFills[X_TOKEN_POS] = '#FEF3C7'   // amber-100
    tokenStrokes[X_TOKEN_POS] = AMBER
  }
  if (highlightNeighbour) {
    tokenFills[PLACED_NEIGHBOUR_POS] = '#DBEAFE'  // blue-100
    tokenStrokes[PLACED_NEIGHBOUR_POS] = BLUE
  }
  if (showAnswer) {
    tokenFills[X_TOKEN_POS] = '#D1FAE5'   // green-100
    tokenStrokes[X_TOKEN_POS] = GREEN
  }

  return (
    <CrownRing
      tokenFills={tokenFills}
      tokenStrokes={tokenStrokes}
      hideX={showAnswer}
      showAnswer={showAnswer}
    />
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function TokenCrown15ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildTokenCrown15ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const highlightXToken = beat.showEdgeHighlight || beat.showConstraintLabel || beat.showAnswer
  const highlightNeighbour = beat.showEdgeHighlight || beat.showConstraintLabel

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: keping X berbagi sisi dengan keping yang dipasang di sebelahnya; sisi itu bernilai 4; oleh aturan pencocokan X = 4 — jawaban D.'
      : 'Explainer: the X-token shares a side with the placed token next to it; that side is labelled 4; by the matching rule X = 4 — answer D.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(300, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* beat-driven crown ring */}
          <CrownRingBeats
            highlightXToken={highlightXToken}
            highlightNeighbour={highlightNeighbour}
            showAnswer={beat.showAnswer}
          />

          {/* shared edge highlight */}
          <AnimatePresence>
            {beat.showEdgeHighlight && (
              <motion.g
                key="edge-highlight"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                <SharedEdgeHighlight color={AMBER} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* constraint label */}
          <AnimatePresence>
            {beat.showConstraintLabel && (
              <motion.g
                key="constraint-label"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 20 }}
              >
                <ConstraintLabel color={isResult ? GREEN : BLUE} />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation badge */}
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
