// Cogs24PEExplainer.tsx
// IKMC-21-PE-Q24 — post-answer animation for the cog-rotation question.
//
// Reuses CogsPair from Cogs24PEIllustration so the animation reads as the
// static scene coming alive. Drives tooth positions beat-by-beat.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CogsPair, SMALL_COG, LARGE_COG, VIEW_W, VIEW_H } from './Cogs24PEIllustration'
import { buildCogs24PESteps } from './cogs24PESteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const BLUE   = '#1D4ED8'
const ORANGE = '#F59E0B'
const INK    = '#1F2937'

// ── layout ───────────────────────────────────────────────────────────────────
const FIG_W = Math.min(280, VIEW_W * 2)

// ── sub-components ────────────────────────────────────────────────────────────

/** Tooth count label next to each cog (beat: count). */
function ToothCountLabels() {
  return (
    <g fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={11} fontWeight={800} fill={INK}>
      {/* Small cog label — upper-left */}
      <text
        x={SMALL_COG.cx - SMALL_COG.pitchR - SMALL_COG.toothH - 4}
        y={SMALL_COG.cy - 8}
        textAnchor="end"
        dominantBaseline="central"
      >
        8
      </text>
      <text
        x={SMALL_COG.cx - SMALL_COG.pitchR - SMALL_COG.toothH - 4}
        y={SMALL_COG.cy + 8}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={9}
        fill="#6B7280"
      >
        teeth
      </text>
      {/* Large cog label — lower-right */}
      <text
        x={LARGE_COG.cx + LARGE_COG.pitchR + LARGE_COG.toothH + 4}
        y={LARGE_COG.cy - 8}
        textAnchor="start"
        dominantBaseline="central"
      >
        16
      </text>
      <text
        x={LARGE_COG.cx + LARGE_COG.pitchR + LARGE_COG.toothH + 4}
        y={LARGE_COG.cy + 8}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={9}
        fill="#6B7280"
      >
        teeth
      </text>
    </g>
  )
}

/** Ratio badge between the two cogs. */
function RatioBadge() {
  // Position midpoint between the two cog centres
  const mx = (SMALL_COG.cx + LARGE_COG.cx) / 2
  const my = (SMALL_COG.cy + LARGE_COG.cy) / 2 - 10

  return (
    <g>
      <rect
        x={mx - 18}
        y={my - 10}
        width={36}
        height={20}
        rx={5}
        fill={ORANGE}
        opacity={0.92}
      />
      <text
        x={mx}
        y={my + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={800}
        fill="#FFFFFF"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        1 : 2
      </text>
    </g>
  )
}

/** Highlights a "full turn" ring pulse around the small cog. */
function SmallTurnRing() {
  const r = SMALL_COG.pitchR + SMALL_COG.toothH + 5
  return (
    <circle
      cx={SMALL_COG.cx}
      cy={SMALL_COG.cy}
      r={r}
      fill="none"
      stroke={GREEN}
      strokeWidth={3}
      strokeDasharray="6 4"
      opacity={0.85}
    />
  )
}

/** Highlights a "half turn" arc on the large cog. */
function LargeTurnRing() {
  const r = LARGE_COG.pitchR + LARGE_COG.toothH + 5
  return (
    <circle
      cx={LARGE_COG.cx}
      cy={LARGE_COG.cy}
      r={r}
      fill="none"
      stroke={ORANGE}
      strokeWidth={3}
      strokeDasharray="6 4"
      opacity={0.85}
    />
  )
}

/** A simple clockwise arc-arrow around the small cog. */
function CWArrow() {
  const rr = SMALL_COG.pitchR + SMALL_COG.toothH + 9
  const cx = SMALL_COG.cx
  const cy = SMALL_COG.cy

  // Arc from 200° to 340° (clockwise in SVG = sweep=1)
  const toXY = (deg: number): [number, number] => {
    const rad = (deg * Math.PI) / 180
    return [cx + rr * Math.cos(rad), cy + rr * Math.sin(rad)]
  }
  const [sx, sy] = toXY(200)
  const [ex, ey] = toXY(340)
  const [hx, hy] = toXY(328)

  return (
    <g stroke={BLUE} strokeWidth={2} fill="none" strokeLinecap="round">
      <path d={`M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${rr} ${rr} 0 1 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`} />
      <polygon
        points={`${ex.toFixed(2)},${ey.toFixed(2)} ${hx.toFixed(2)},${hy.toFixed(2)} ${(ex + (ex - hx) * 0.6).toFixed(2)},${(ey + (ey - hy) * 0.6).toFixed(2)}`}
        fill={BLUE}
        stroke="none"
      />
    </g>
  )
}

/** A counter-clockwise arc-arrow around the large cog. */
function CCWArrow() {
  const rr = LARGE_COG.pitchR + LARGE_COG.toothH + 9
  const cx = LARGE_COG.cx
  const cy = LARGE_COG.cy

  const toXY = (deg: number): [number, number] => {
    const rad = (deg * Math.PI) / 180
    return [cx + rr * Math.cos(rad), cy + rr * Math.sin(rad)]
  }
  const [sx, sy] = toXY(340)
  const [ex, ey] = toXY(200)
  const [hx, hy] = toXY(212)

  return (
    <g stroke={ORANGE} strokeWidth={2} fill="none" strokeLinecap="round">
      <path d={`M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${rr} ${rr} 0 1 0 ${ex.toFixed(2)} ${ey.toFixed(2)}`} />
      <polygon
        points={`${ex.toFixed(2)},${ey.toFixed(2)} ${hx.toFixed(2)},${hy.toFixed(2)} ${(ex + (ex - hx) * 0.6).toFixed(2)},${(ey + (ey - hy) * 0.6).toFixed(2)}`}
        fill={ORANGE}
        stroke="none"
      />
    </g>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function Cogs24PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildCogs24PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: roda kecil (8 gigi) dan roda besar (16 gigi) berkaitan; rasio 1:2; setelah roda kecil 1 putaran penuh, roda besar berputar setengah (180°) berlawanan jarum jam; jawaban C.'
      : 'Explainer: small cog (8 teeth) and large cog (16 teeth) mesh in a 1:2 ratio; after 1 full turn of the small cog, the large cog rotates half a turn (180°) counter-clockwise; answer C.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="white" />

          {/* Both cogs with animated tooth positions */}
          <CogsPair
            smallToothDeg={beat.smallToothDeg}
            largeToothDeg={beat.largeToothDeg}
          />

          {/* Beat-driven overlays */}

          {/* Tooth count labels (beat: count, ratio) */}
          <AnimatePresence>
            {beat.showCounts && (
              <motion.g
                key="counts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <ToothCountLabels />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Ratio badge (beat: ratio) */}
          <AnimatePresence>
            {beat.showRatio && (
              <motion.g
                key="ratio"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20 }}
              >
                <RatioBadge />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Direction arrows (beat: direction, small-turn) */}
          <AnimatePresence>
            {beat.showArrows && (
              <motion.g
                key="arrows"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <CWArrow />
                <CCWArrow />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Small cog full-turn ring (beat: small-turn) */}
          <AnimatePresence>
            {beat.showSmallTurn && (
              <motion.g
                key="small-turn"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 20 }}
              >
                <SmallTurnRing />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Large cog half-turn ring (beat: large-turn) */}
          <AnimatePresence>
            {beat.showLargeTurn && (
              <motion.g
                key="large-turn"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 20 }}
              >
                <LargeTurnRing />
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
