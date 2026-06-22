import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  FencePrimitive,
  DimArrow,
  SVG_W,
  SVG_H,
  SECTIONS,
  FENCE_H,
  SECTION_W,
  POLE_W,
  TOP_RAIL_Y,
  FENCE_LEFT,
} from './Fence12ECIllustration'
import { buildFence12ECSteps } from './fence12ECSteps'

// IKMC-20-EC-Q12 — post-answer animation.
// Reuses FencePrimitive and DimArrow from the illustration so the animation
// reads as the static scene coming alive.
//
// Animation beats:
//   0. intro     — show the 4 m fence
//   1. per-sect  — highlight one section's 4 poles
//   2. count4    — show full 18-pole count annotation
//   3. pattern   — show formula n×4+2
//   4. scale10   — show 10 m result
//   5. result    — 42 → E (green)

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const BLUE = '#30598A'
const ORANGE = '#f0853a'
const HIGHLIGHT = '#EF4444'  // red highlight for the highlighted section poles

// ── layout reuse from illustration ────────────────────────────────────────────
const FIG_W = Math.min(360, SVG_W)

// ── sub-components for the animated overlays ──────────────────────────────────

/** Pole-count badge floating above the fence centre. */
function PoleCountBadge({ count, color }: { count: number; color: string }) {
  const cx = FENCE_LEFT + (SECTIONS * SECTION_W + POLE_W) / 2
  const cy = TOP_RAIL_Y - 14

  return (
    <g>
      <rect x={cx - 28} y={cy - 11} width={56} height={22} rx={8} fill={color} />
      <text
        x={cx}
        y={cy}
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={12}
        fontWeight={800}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {count} poles
      </text>
    </g>
  )
}

/** Small formula label below the fence. */
function FormulaLabel({ color }: { color: string }) {
  const cx = FENCE_LEFT + (SECTIONS * SECTION_W + POLE_W) / 2
  const cy = TOP_RAIL_Y + FENCE_H + 50

  return (
    <text
      x={cx}
      y={cy}
      dominantBaseline="central"
      textAnchor="middle"
      fontSize={13}
      fontWeight={800}
      fill={color}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      poles = n × 4 + 2
    </text>
  )
}

/** 10 m result row displayed below the formula. */
function Result10Row({ color }: { color: string }) {
  const cx = FENCE_LEFT + (SECTIONS * SECTION_W + POLE_W) / 2
  const cy = TOP_RAIL_Y + FENCE_H + 50

  return (
    <g>
      <rect x={cx - 60} y={cy - 12} width={120} height={24} rx={8} fill={color} />
      <text
        x={cx}
        y={cy}
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={13}
        fontWeight={800}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        10 × 4 + 2 = 42
      </text>
    </g>
  )
}

// ── Main explainer component ────────────────────────────────────────────────

export default function Fence12ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildFence12ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  // Build per-pole highlight function for the fence primitive.
  // Highlights the left post, both rails, and right post of the target section.
  const sectionHighlight = useMemo(() => {
    if (beat.highlightSection < 0) return undefined
    const hs = beat.highlightSection
    return (
      _row: 'top' | 'bot',
      col: number,
      _kind: 'post' | 'rail',
    ): string | undefined => {
      if (col === hs || col === hs + 1) return HIGHLIGHT
      return undefined
    }
  }, [beat.highlightSection])

  const dimY = TOP_RAIL_Y + FENCE_H + 22
  const fenceRight = FENCE_LEFT + SECTIONS * SECTION_W + POLE_W

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Setiap bagian 1 m menggunakan 4 tiang; pagar 4 m = 4×4+2 = 18 tiang. Rumus: n×4+2. Untuk 10 m: 10×4+2 = 42 tiang — jawaban E.'
      : 'Explainer: Each 1 m section uses 4 poles; 4 m fence = 4×4+2 = 18 poles. Formula: n×4+2. For 10 m: 10×4+2 = 42 poles — answer E.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
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

          {/* 4-section fence with optional section highlight */}
          <FencePrimitive
            sections={SECTIONS}
            originX={FENCE_LEFT}
            highlight={beat.highlightSection >= 0 ? sectionHighlight : undefined}
          />

          {/* dimension arrow — shown on intro and count4 */}
          {(beat.phase === 'intro' || beat.phase === 'count4') && (
            <DimArrow x1={FENCE_LEFT} x2={fenceRight} y={dimY} label="4 metres" />
          )}

          {/* pole count badge — beats count4 */}
          <AnimatePresence>
            {beat.poleCount > 0 && (
              <motion.g
                key="pole-count"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              >
                <PoleCountBadge count={beat.poleCount} color={beat.showTotal4 ? ORANGE : BLUE} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* formula label — beats pattern */}
          <AnimatePresence>
            {beat.showFormula && !beat.showResult10 && (
              <motion.g
                key="formula"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <FormulaLabel color={BLUE} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* 10 m result row — beats scale10 + result */}
          <AnimatePresence>
            {beat.showResult10 && (
              <motion.g
                key="result10"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <Result10Row color={isResult ? GREEN : ORANGE} />
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
