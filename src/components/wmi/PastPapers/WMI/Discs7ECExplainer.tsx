import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  DiscPuck,
  SVG_W,
  SVG_H,
  R,
  DISC_CX,
  DISC_CY,
  DISC_LABELS,
} from './Discs7ECIllustration'
import { buildDiscs7ECSteps } from './discs7ECSteps'

// IKMC-23-EC-Q7 — post-answer animation.
// Reuses DiscPuck from Discs7ECIllustration so the animation reads as the
// static scene coming alive.
//
// Animation beats:
//   0. intro     — scattered discs; state the task.
//   1. rule      — show a demo tower; explain order is forced.
//   2. combo-123 — tower {1,2,3}, count badge = 1.
//   3. combo-124 — tower {1,2,4}, count badge = 2.
//   4. combo-134 — tower {1,3,4}, count badge = 3.
//   5. combo-234 — tower {2,3,4}, count badge = 4.
//   6. result    — 4 towers, answer C (green).

// ── colour tokens ──────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const BLUE = '#30598A'
const ORANGE = '#f0853a'

const FIG_W = Math.min(300, SVG_W)

// Tower panel: position for the stacked tower drawn on the right side of the SVG
const TOWER_CX = 210      // centre x of the tower column
const TOWER_BASE_Y = 185  // y of the base of the bottom disc's top face

// Vertical gap between discs in the tower (disc centre-to-centre spacing)
// We stack each disc so the bottom of disc N aligns just on top of disc N+1
const LAYER_GAP = 22  // px between top-face centres of adjacent tower discs

// ── Tower component ────────────────────────────────────────────────────────────

/**
 * Renders a stacked 3-disc tower from bottom to top.
 * bottomIdx, midIdx, topIdx are 0-based disc indices (disc label = idx+1).
 */
function DiscTower({
  bottomIdx,
  midIdx,
  topIdx,
}: {
  bottomIdx: number
  midIdx: number
  topIdx: number
}) {
  const layers = [
    { idx: bottomIdx, cy: TOWER_BASE_Y },
    { idx: midIdx,    cy: TOWER_BASE_Y - LAYER_GAP },
    { idx: topIdx,    cy: TOWER_BASE_Y - LAYER_GAP * 2 },
  ]

  return (
    <g>
      {/* draw bottom layer first, then upward */}
      {layers.map(({ idx, cy }) => (
        <DiscPuck
          key={idx}
          cx={TOWER_CX}
          cy={cy}
          rx={R[idx]}
          colorIdx={idx}
          label={DISC_LABELS[idx]}
        />
      ))}
    </g>
  )
}

// ── Highlight ring ─────────────────────────────────────────────────────────────

/** Glow ring drawn around a scattered disc to indicate it is selected. */
function HighlightRing({ cx, cy, rx }: { cx: number; cy: number; rx: number }) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx + 6}
      ry={8}
      fill="none"
      stroke={ORANGE}
      strokeWidth={2.5}
      strokeDasharray="5 3"
      opacity={0.9}
    />
  )
}

// ── Count badge ────────────────────────────────────────────────────────────────

/** Badge showing how many valid towers have been found so far. */
function CountBadge({ count, color }: { count: number; color: string }) {
  const label = String(count)
  return (
    <g>
      <circle cx={TOWER_CX} cy={22} r={18} fill={color} />
      <text
        x={TOWER_CX}
        y={22}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={16}
        fontWeight={900}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Divider line ───────────────────────────────────────────────────────────────

/** Vertical divider separating the scattered discs (left) from the tower (right). */
function Divider() {
  return (
    <line
      x1={150}
      y1={10}
      x2={150}
      y2={SVG_H - 10}
      stroke="#E5E7EB"
      strokeWidth={1.5}
      strokeDasharray="4 4"
    />
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function Discs7ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildDiscs7ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: pilih 3 dari 4 cakram (aturan ukuran memaksa urutannya) — ada tepat 4 kombinasi: {1,2,3}, {1,2,4}, {1,3,4}, {2,3,4} — jawaban C.'
      : 'Explainer: choose 3 from 4 discs (the size rule forces the order) — exactly 4 combinations: {1,2,3}, {1,2,4}, {1,3,4}, {2,3,4} — answer C.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* divider */}
          <Divider />

          {/* left panel: scattered discs (draw largest first, smallest last) */}
          <DiscPuck cx={DISC_CX[3]} cy={DISC_CY[3]} rx={R[3]} colorIdx={3} label={DISC_LABELS[3]} />
          <DiscPuck cx={DISC_CX[2]} cy={DISC_CY[2]} rx={R[2]} colorIdx={2} label={DISC_LABELS[2]} />
          <DiscPuck cx={DISC_CX[1]} cy={DISC_CY[1]} rx={R[1]} colorIdx={1} label={DISC_LABELS[1]} />
          <DiscPuck cx={DISC_CX[0]} cy={DISC_CY[0]} rx={R[0]} colorIdx={0} label={DISC_LABELS[0]} />

          {/* highlight rings on selected discs */}
          <AnimatePresence>
            {beat.highlightDiscs.map((idx) => (
              <motion.g
                key={`ring-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <HighlightRing cx={DISC_CX[idx]} cy={DISC_CY[idx]} rx={R[idx]} />
              </motion.g>
            ))}
          </AnimatePresence>

          {/* right panel: stacked tower */}
          <AnimatePresence>
            {beat.tower !== null && (
              <motion.g
                key={`tower-${beat.phase}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <DiscTower
                  bottomIdx={beat.tower[0]}
                  midIdx={beat.tower[1]}
                  topIdx={beat.tower[2]}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* count badge (above tower) */}
          <AnimatePresence>
            {beat.towerCount > 0 && (
              <motion.g
                key={`count-${beat.towerCount}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 18 }}
              >
                <CountBadge count={beat.towerCount} color={isResult ? GREEN : BLUE} />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation row */}
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
