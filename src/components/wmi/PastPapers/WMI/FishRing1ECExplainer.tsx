// IKMC-21-EC-Q1 — post-answer explainer.
//
// Reuses FishGlyph, RingShape, and constants from FishRing1ECIllustration.
//
// Animation beats (see fishRing1ECSteps.ts for full storyboard):
//   0. intro      — static scene; name the challenge.
//   1. ring-end   — pulse the ring to label the reference end.
//   2. seg-a      — highlight fish 0,1 (away from ring, no flip) — red rings.
//   3. bend-1     — caption explains the first U-turn / flip logic.
//   4. seg-b      — highlight fish 2,3,4 (toward ring ✓) — green rings.
//   5. seg-c      — highlight fish 5 (away ✗) — red ring.
//   6. seg-d      — highlight fish 6,7,8 (toward ring ✓) — green rings.
//   7. seg-e      — highlight fish 9 (away ✗) — red ring.
//   8. count      — show all 6 "toward" fish highlighted + count badge.
//   9. result     — answer C confirmed.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  FishGlyph,
  RingShape,
  SVG_W,
  SVG_H,
  RING_CX,
  RING_CY,
  LINE_PATH,
  FISH_DATA,
  COLOR,
} from './FishRing1ECIllustration'
import { buildFishRing1ECSteps } from './fishRing1ECSteps'

// ── colour constants ──────────────────────────────────────────────────────────

const GREEN  = '#10B981'
const RED    = '#EF4444'
const ORANGE = '#F59E0B'

const FIG_W = Math.min(520, SVG_W)

// ── Count badge ───────────────────────────────────────────────────────────────

function CountBadge({ count, lang }: { count: number; lang: 'en' | 'id' }) {
  const label = lang === 'id' ? `${count} ikan` : `${count} fish`
  return (
    <g>
      <rect
        x={SVG_W / 2 - 34}
        y={6}
        width={68}
        height={22}
        rx={11}
        fill={GREEN}
      />
      <text
        x={SVG_W / 2}
        y={17}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={900}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Ring pulse highlight ──────────────────────────────────────────────────────

function RingPulse() {
  return (
    <circle
      cx={RING_CX}
      cy={RING_CY}
      r={16}
      fill="none"
      stroke={ORANGE}
      strokeWidth={3}
      strokeDasharray="5 3"
      opacity={0.85}
    />
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function FishRing1ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildFishRing1ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#EFF6FF', borderColor: '#3B82F6', color: '#1E40AF' }

  // Build a map of fish index → highlight colour
  const highlightMap: Record<number, string> = {}
  for (const h of beat.highlight) {
    highlightMap[h.index] = h.towardRing ? GREEN : RED
  }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tali dengan 10 ikan dan cincin. Setelah tali diluruskan, 6 ikan menghadap ke cincin (ikan 3,4,5 dari loop 1 dan ikan 7,8,9 dari loop 3). Jawaban: C (6).'
      : 'Explainer: line with 10 fish and a ring. When straightened, 6 fish face the ring (fish 3,4,5 from loop 1 and fish 7,8,9 from loop 3). Answer: C (6).'

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block', maxWidth: '100%' }}
          aria-hidden="true"
        >
          {/* background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

          {/* tangled line */}
          <path
            d={LINE_PATH}
            fill="none"
            stroke={COLOR.LINE_SHADOW}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.30}
          />
          <path
            d={LINE_PATH}
            fill="none"
            stroke={COLOR.LINE}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* fish */}
          {FISH_DATA.map((f, i) => (
            <FishGlyph
              key={i}
              cx={f.cx}
              cy={f.cy}
              facingRight={f.facingRight}
              color={f.color}
              highlight={highlightMap[i]}
            />
          ))}

          {/* ring */}
          <RingShape cx={RING_CX} cy={RING_CY} />

          {/* ring pulse highlight */}
          <AnimatePresence>
            {beat.ringHighlight && (
              <motion.g
                key="ring-pulse"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              >
                <RingPulse />
              </motion.g>
            )}
          </AnimatePresence>

          {/* count badge */}
          <AnimatePresence>
            {beat.count >= 0 && (
              <motion.g
                key={`count-${beat.count}`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 18 }}
              >
                <CountBadge count={beat.count} lang={lang} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* answer chip on result beat */}
          {isResult && (
            <text
              x={SVG_W - 12}
              y={14}
              textAnchor="end"
              dominantBaseline="hanging"
              fontSize={14}
              fontWeight={900}
              fill={GREEN}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              C ✓
            </text>
          )}
        </svg>

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
