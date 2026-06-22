// IKMC-23-EC-Q5 — post-answer animation for the theatre-lights timeline.
//
// Reuses the static timeline primitive (TimelineGrid, SEGMENTS, minToX, etc.)
// from Lights5ECIllustration so the animation reads as the same scene coming alive.
//
// Animation strategy: scan the 0–12 timeline left-to-right, beat by beat.
//   • "Skip" intervals are dimmed with a grey translucent overlay.
//   • "Exactly 2" intervals are highlighted with a green translucent overlay and
//     an upward count badge.
//   • The running total counter ticks up beat by beat.
//   • The result beat paints all "exactly 2" intervals bright green and shows the
//     full equation.
//
// Beat sequence (from lights5ECSteps.ts):
//   0. intro
//   1. scan-0-2   (skip: only Blue)
//   2. scan-2-3   (skip: 3 lights)
//   3. hi-3-5     (G+O  → +2 min, total 2)
//   4. hi-6-7     (O+B  → +1 min, total 3)
//   5. hi-7-8     (G+B  → +1 min, total 4)
//   6. hi-8-10    (G+O  → +2 min, total 6)
//   7. hi-10-12   (O+B  → +2 min, total 8)
//   8. result     (8 min → C)

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  TimelineGrid,
  minToX,
  ROW_Y,
  BAR_H,
  AXIS_Y,
  SVG_W,
  SVG_H,
  COLOR,
} from './Lights5ECIllustration'
import { buildLights5ECSteps } from './lights5ECSteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN_HI  = '#16A34A'
const BLUE_UI   = '#30598A'
const ORANGE_UI = '#f0853a'

// ── Overlay helpers ───────────────────────────────────────────────────────────

/** The vertical span covered by all three light rows (for overlays). */
const OVERLAY_TOP    = ROW_Y.green  - BAR_H - 2
const OVERLAY_BOTTOM = ROW_Y.blue   + BAR_H + 2
const OVERLAY_HEIGHT = OVERLAY_BOTTOM - OVERLAY_TOP

/** A translucent rectangle overlay spanning all three rows for a [start, end) minute range. */
function MinuteOverlay({
  start,
  end,
  fill,
  opacity = 0.38,
}: {
  start: number
  end: number
  fill: string
  opacity?: number
}) {
  const x = minToX(start)
  const w = minToX(end) - x

  return (
    <rect
      x={x}
      y={OVERLAY_TOP}
      width={w}
      height={OVERLAY_HEIGHT}
      fill={fill}
      opacity={opacity}
      rx={3}
    />
  )
}

/** Small "+N min" badge above a highlighted interval. */
function GainBadge({
  start,
  end,
  label,
}: {
  start: number
  end: number
  label: string
}) {
  const cx = (minToX(start) + minToX(end)) / 2
  const cy = OVERLAY_TOP - 8

  return (
    <g>
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={8}
        fontWeight={800}
        fill={GREEN_HI}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Running-total counter ─────────────────────────────────────────────────────

function TotalCounter({ total, isResult }: { total: number; isResult: boolean }) {
  const color = isResult ? GREEN_HI : BLUE_UI

  return (
    <g>
      <text
        x={SVG_W - 4}
        y={AXIS_Y - 2}
        textAnchor="end"
        dominantBaseline="auto"
        fontSize={10}
        fontWeight={800}
        fill={color}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {total > 0 ? `${total} min` : ''}
      </text>
    </g>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function Lights5ECExplainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildLights5ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN_HI,  color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE_UI,   color: BLUE_UI   }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: pindai garis waktu menit per menit — tepat 2 lampu menyala di menit 3–5, 6–7, 7–8, 8–10, dan 10–12, total 2+1+1+2+2 = 8 menit — jawaban C.'
      : 'Explainer: scan the timeline minute by minute — exactly 2 lights are on during min 3–5, 6–7, 7–8, 8–10, and 10–12, totalling 2+1+1+2+2 = 8 minutes — answer C.'

  // Gain labels for each highlight interval (shown incrementally per beat)
  const GAIN_LABELS: Record<string, string> = {
    '3-5':   '+2',
    '6-7':   '+1',
    '7-8':   '+1',
    '8-10':  '+2',
    '10-12': '+2',
  }

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* timeline figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(380, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

          {/* static timeline (slightly dimmed when not intro) */}
          <TimelineGrid dimmed={false} />

          {/* skip (dim) overlays */}
          <AnimatePresence>
            {beat.dimMinutes.map(([s, e]) => (
              <motion.g
                key={`dim-${s}-${e}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <MinuteOverlay start={s} end={e} fill="#9CA3AF" opacity={0.30} />
              </motion.g>
            ))}
          </AnimatePresence>

          {/* highlight (green) overlays for "exactly 2" intervals */}
          <AnimatePresence>
            {beat.highlightMinutes.map(([s, e]) => {
              const key = `${s}-${e}`
              return (
                <motion.g
                  key={`hi-${key}`}
                  initial={{ opacity: 0, scaleY: 0.5 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                  style={{ transformOrigin: `${(minToX(s) + minToX(e)) / 2}px ${(OVERLAY_TOP + OVERLAY_BOTTOM) / 2}px` }}
                >
                  <MinuteOverlay
                    start={s}
                    end={e}
                    fill={isResult ? '#22C55E' : '#86EFAC'}
                    opacity={isResult ? 0.48 : 0.42}
                  />
                  {!isResult && (
                    <GainBadge
                      start={s}
                      end={e}
                      label={GAIN_LABELS[key] ?? ''}
                    />
                  )}
                </motion.g>
              )
            })}
          </AnimatePresence>

          {/* running total counter */}
          {beat.runningTotal > 0 && (
            <TotalCounter total={beat.runningTotal} isResult={isResult} />
          )}
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
                style={{ background: isResult ? GREEN_HI : ORANGE_UI }}
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
