import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  FlowerGlyph,
  FLOWERS,
  RECT,
  COLOR,
  SVG_W,
  SVG_H,
  triPath,
} from './MayaBeeFlowers12Illustration'
import { buildMayaBeeFlowers12Steps } from './mayaBeeFlowers12Steps'

// IKMC-19-PE-Q12 — post-answer animation.
// Reuses FlowerGlyph and the shared primitives from the illustration so the
// animation reads as the static scene coming alive.
//
// Animation beats:
//   0. intro          — static scene, name the two conditions.
//   1. highlight-tri  — fill the triangle in translucent blue (excluded zone).
//   2–10. count       — reveal qualifying flowers one per beat with a ring;
//                       running counter below the figure.
//   11. result        — counter 9 → answer A (green).

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const BLUE = '#2563EB'
const RING_COLOR = '#F97316'  // orange — matches the orange flowers
const TRI_FILL_COLOR = '#DBEAFE'  // blue-100, translucent excluded zone

// ── layout ────────────────────────────────────────────────────────────────────
const FIG_W = Math.min(360, SVG_W)

// Qualifying flower indices (A-region = first 9 in FLOWERS array)
const QUALIFYING_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8]

// ── sub-components ────────────────────────────────────────────────────────────

/** Translucent fill for the triangle to mark the excluded zone. */
function TriExcluded() {
  return (
    <path
      d={triPath()}
      fill={TRI_FILL_COLOR}
      fillOpacity={0.55}
      stroke="none"
    />
  )
}

/** Highlight ring around a qualifying flower. */
function FlowerRing({ cx, cy }: { cx: number; cy: number }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={15}
      fill="none"
      stroke={RING_COLOR}
      strokeWidth={2.5}
      strokeDasharray="4 3"
    />
  )
}

/** Running counter badge. */
function CountBadge({ count, isResult }: { count: number; isResult: boolean }) {
  return (
    <motion.span
      key={count}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.6, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 480, damping: 20 }}
      className="rounded-full px-5 py-1 font-display text-lg font-black tabular-nums text-white"
      style={{ background: isResult ? GREEN : RING_COLOR }}
    >
      {count}
    </motion.span>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function MayaBeeFlowers12Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildMayaBeeFlowers12Steps(lang), [lang])
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
      ? 'Penjelasan: segitiga adalah zona yang dikecualikan; hitung bunga di dalam persegi panjang yang berada di luar segitiga — ada 9 bunga, jawaban A.'
      : 'Explainer: the triangle is the excluded zone; count flowers inside the rectangle but outside the triangle — there are 9 flowers, answer A.'

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
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

          {/* all flowers (static, behind overlays) */}
          {FLOWERS.map((f, i) => (
            <FlowerGlyph key={i} cx={f.cx} cy={f.cy} r={10} />
          ))}

          {/* triangle stroke (always visible) */}
          <path
            d={triPath()}
            fill="none"
            stroke={COLOR.TRI_STROKE}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />

          {/* triangle fill overlay — excluded zone */}
          <AnimatePresence>
            {beat.showTriFill && (
              <motion.g
                key="tri-fill"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <TriExcluded />
              </motion.g>
            )}
          </AnimatePresence>

          {/* rectangle border (always on top) */}
          <rect
            x={RECT.x}
            y={RECT.y}
            width={RECT.w}
            height={RECT.h}
            fill="none"
            stroke={COLOR.RECT_STROKE}
            strokeWidth={2.5}
          />

          {/* qualifying flower rings — revealed one per beat */}
          {QUALIFYING_INDICES.slice(0, beat.revealedCount).map((idx) => {
            const f = FLOWERS[idx]
            return (
              <AnimatePresence key={idx}>
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                >
                  <FlowerRing cx={f.cx} cy={f.cy} />
                </motion.g>
              </AnimatePresence>
            )
          })}
        </svg>

        {/* running counter */}
        <div className="flex min-h-[2.5rem] items-center justify-center gap-2">
          <AnimatePresence mode="wait">
            {beat.counter > 0 && (
              <CountBadge count={beat.counter} isResult={isResult} />
            )}
          </AnimatePresence>
          {beat.counter > 0 && (
            <span
              className="font-display text-sm font-bold"
              style={{ color: isResult ? '#065F46' : BLUE }}
            >
              {lang === 'id' ? 'bunga' : 'flowers'}
            </span>
          )}
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
