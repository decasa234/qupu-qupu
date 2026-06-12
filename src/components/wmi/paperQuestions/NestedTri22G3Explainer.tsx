/**
 * WMI-22F3A-Q3 — Nested Triangle explainer.
 *
 * Animates the "read innermost first, work outward, concatenate" method
 * beat by beat, reusing the LabeledTriangle primitive from the illustration.
 *
 * SSR-safe, deterministic. No Math.random / Date.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { LabeledTriangle } from './NestedTri22G3Illustration'
import { buildNestedTri22G3Steps } from './nestedTri22G3Steps'
import type { NestedTriStep } from './nestedTri22G3Steps'

// ─── colour tokens (echo fill-qupu-* palette) ─────────────────────────────────
const GREEN_LIGHT = '#D1FAE5'   // qupu-green-100
const GREEN_DARK = '#065F46'    // qupu-green-900
const GREEN_BORDER = '#10B981'  // qupu-green-500
const BLUE_LIGHT = '#E1EFFB'    // qupu-blue-100
const BLUE_BORDER = '#30598A'   // qupu-blue-700
const BLUE_TEXT = '#30598A'
const HIGHLIGHT_RING = '#F59E0B' // amber — layer pointer
const DIM_OPACITY = 0.25

// ─── geometry constants (matching illustration) ───────────────────────────────
// We render each mini-panel in a 120×90 viewBox.
const CX = 52
const CY = 44
const BIG_HW = 42

// Panel 2 inner triangle
const P2_INN_HW = 18
const P2_INN_CX = CX - 10
const P2_INN_CY = CY + 6

// Panel 3 triangles
const P3_MID_HW = 19
const P3_MID_CX = CX - 10
const P3_MID_CY = CY + 7

const P3_INN_HW = 12
const P3_INN_CX = CX + 2
const P3_INN_CY = CY - 6

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Equilateral triangle height from halfW. */
function triHeight(halfW: number) {
  return halfW * Math.sqrt(3)
}

/**
 * Returns an amber glow rect (slightly larger than the triangle bounding box)
 * to highlight the active layer.
 */
function HighlightRing({ cx, cy, halfW }: { cx: number; cy: number; halfW: number }) {
  const h = triHeight(halfW)
  const pad = 5
  return (
    <ellipse
      cx={cx}
      cy={cy + h * 0.05}
      rx={halfW + pad}
      ry={h * 0.55 + pad}
      fill="none"
      stroke={HIGHLIGHT_RING}
      strokeWidth={2.5}
      strokeDasharray="5 3"
      opacity={0.9}
    />
  )
}

// ─── per-panel SVG scenes ──────────────────────────────────────────────────────

function Panel1({ highlighted }: { highlighted: boolean }) {
  return (
    <svg viewBox="0 0 104 90" width={104} height={90} aria-hidden>
      <LabeledTriangle cx={CX} cy={CY} halfW={BIG_HW} label="4" strokeWidth={2} />
      {highlighted && <HighlightRing cx={CX} cy={CY} halfW={BIG_HW} />}
    </svg>
  )
}

function Panel2({ highlightLayer }: { highlightLayer?: 'inner' | 'mid' | 'outer' }) {
  return (
    <svg viewBox="0 0 104 90" width={104} height={90} aria-hidden>
      <LabeledTriangle cx={CX} cy={CY} halfW={BIG_HW} label="2" strokeWidth={2} />
      <LabeledTriangle cx={P2_INN_CX} cy={P2_INN_CY} halfW={P2_INN_HW} label="1" strokeWidth={1.6} />
      {highlightLayer === 'outer' && <HighlightRing cx={CX} cy={CY} halfW={BIG_HW} />}
      {highlightLayer === 'inner' && <HighlightRing cx={P2_INN_CX} cy={P2_INN_CY} halfW={P2_INN_HW} />}
    </svg>
  )
}

function Panel3({ highlightLayer }: { highlightLayer?: 'inner' | 'mid' | 'outer' }) {
  return (
    <svg viewBox="0 0 104 90" width={104} height={90} aria-hidden>
      <LabeledTriangle cx={CX} cy={CY} halfW={BIG_HW} label="6" strokeWidth={2} />
      <LabeledTriangle cx={P3_MID_CX} cy={P3_MID_CY} halfW={P3_MID_HW} label="5" strokeWidth={1.6} />
      <LabeledTriangle cx={P3_INN_CX} cy={P3_INN_CY} halfW={P3_INN_HW} label="2" outlines={2} strokeWidth={1.4} />
      {highlightLayer === 'outer' && <HighlightRing cx={CX} cy={CY} halfW={BIG_HW} />}
      {highlightLayer === 'mid' && <HighlightRing cx={P3_MID_CX} cy={P3_MID_CY} halfW={P3_MID_HW} />}
      {highlightLayer === 'inner' && <HighlightRing cx={P3_INN_CX} cy={P3_INN_CY} halfW={P3_INN_HW} />}
    </svg>
  )
}

// ─── running-number badge ──────────────────────────────────────────────────────

function RunningBadge({ value, final }: { value: string; final: boolean }) {
  if (!value) return null
  return (
    <motion.div
      key={value}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="rounded-xl border-2 px-3 py-1 font-display text-lg font-black tabular-nums"
      style={
        final
          ? { background: GREEN_LIGHT, borderColor: GREEN_BORDER, color: GREEN_DARK }
          : { background: '#FEF3C7', borderColor: HIGHLIGHT_RING, color: '#92400E' }
      }
    >
      {value}
    </motion.div>
  )
}

// ─── main scene layout ─────────────────────────────────────────────────────────

function ExplainerScene({ beat }: { beat: NestedTriStep }) {
  const { focusPanel, highlightLayer, runningP3, showAnswer } = beat

  // Determine which panels are visible and their opacity
  const p1Opacity = focusPanel === 0 ? DIM_OPACITY : focusPanel === 1 ? 1 : DIM_OPACITY
  const p2Opacity = focusPanel === 0 ? DIM_OPACITY : focusPanel === 2 ? 1 : DIM_OPACITY
  const p3Opacity = focusPanel === 0 ? DIM_OPACITY : focusPanel === 3 ? 1 : DIM_OPACITY

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Three panels in a row */}
      <div className="flex items-center justify-center gap-4">
        {/* Panel 1 */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            animate={{ opacity: p1Opacity }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <Panel1 highlighted={focusPanel === 1 && highlightLayer === 'outer'} />
            {focusPanel === 1 && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-sm font-black"
                style={{ color: GREEN_DARK }}
              >
                = 4
              </motion.span>
            )}
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-16 w-px bg-gray-200" />

        {/* Panel 2 */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            animate={{ opacity: p2Opacity }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <Panel2
              highlightLayer={focusPanel === 2 ? highlightLayer : undefined}
            />
            {(beat.phase === 'intro-p2-outer' || (focusPanel !== 2 && beat.phase !== 'intro-p2-inner' && beat.phase !== 'rule')) && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: p2Opacity, y: 0 }}
                className="font-display text-sm font-black"
                style={{ color: GREEN_DARK }}
              >
                = 12
              </motion.span>
            )}
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-16 w-px bg-gray-200" />

        {/* Panel 3 */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            animate={{ opacity: p3Opacity }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <Panel3
              highlightLayer={focusPanel === 3 ? highlightLayer : undefined}
            />
          </motion.div>
          {/* Running concatenation badge for panel 3 */}
          <AnimatePresence mode="wait">
            {runningP3 && (
              <RunningBadge
                key={runningP3}
                value={runningP3}
                final={showAnswer}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Answer badge */}
      <AnimatePresence>
        {showAnswer && (
          <motion.div
            key="answer"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="rounded-2xl border-2 px-5 py-2 font-display text-xl font-black"
            style={{ background: GREEN_LIGHT, borderColor: GREEN_BORDER, color: GREEN_DARK }}
          >
            256 → D
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── exported component ────────────────────────────────────────────────────────

export default function NestedTri22G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildNestedTri22G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: baca digit dari segitiga paling dalam ke luar lalu gabungkan. Panel 3 punya tiga lapis: paling dalam (garis ganda) = 2, tengah = 5, luar = 6. Baca dari dalam ke luar: 2, 5, 6 → digabung menjadi 256. Jawaban D.`
      : `Explainer: read each triangle's label starting from the innermost layer outward, then concatenate. Panel 3 has three layers: innermost (double-outline) = 2, middle = 5, outer = 6. Reading inward-out: 2, 5, 6 → joined = 256. Answer D.`

  return (
    <div
      className="mx-auto w-full max-w-[420px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        <ExplainerScene beat={beat} />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_LIGHT, borderColor: GREEN_BORDER, color: GREEN_DARK }
              : { background: BLUE_LIGHT, borderColor: BLUE_BORDER, color: BLUE_TEXT }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
