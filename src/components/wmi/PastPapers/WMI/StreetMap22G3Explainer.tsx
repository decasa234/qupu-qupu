/**
 * WMI-22F3A-Q4 — Longest non-repeating trail explainer.
 *
 * Walks the verified 9-edge trail T→2→0→1→2→4→1→3→4→M one street per beat,
 * highlighting edges on the StreetGraph as the path grows.  The final beat
 * lands on 9 × 130 = 1170 m (answer C).
 *
 * SSR-safe — pure render of imported data, no Math.random / no Date.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { StreetGraph } from './StreetMap22G3Illustration'
import { buildStreetMap22G3Steps } from './streetMap22G3Steps'

// ── Colour tokens (mirror StreetMap22G3Illustration) ──────────────────────
const BRAND_BLUE   = '#30598A'
const GREEN        = '#10B981'
const GREEN_INK    = '#065F46'
const ORANGE       = '#ff6b2b'   // highlight colour passed to StreetGraph
const SHELL        = '#F0F7FF'   // panel background

// ── SVG viewport (must match the illustration) ────────────────────────────
const VIEW_W = 520
const VIEW_H = 420

// ── Sub-components ────────────────────────────────────────────────────────

function Caption({ result, children }: { result: boolean; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
      style={
        result
          ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
          : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
      }
    >
      {children}
    </div>
  )
}

function StreetCounter({
  count,
  distanceM,
  result,
}: {
  count: number
  distanceM: number
  result: boolean
}) {
  if (count === 0) return null
  return (
    <motion.div
      key={count}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 24 }}
      className="flex items-baseline gap-2 font-display tabular-nums"
    >
      <span
        className="text-2xl font-black"
        style={{ color: result ? GREEN_INK : BRAND_BLUE }}
      >
        {count}
      </span>
      <span className="text-sm font-extrabold" style={{ color: result ? GREEN : BRAND_BLUE }}>
        {`× 130 = ${distanceM} m`}
      </span>
    </motion.div>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────

export default function StreetMap22G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildStreetMap22G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Strategi: bangun rute terpanjang dari Tom ke Mary tanpa mengulang jalan. Jawabannya ${story.answerM} m (9 jalan).`
      : `Strategy: build the longest trail from Tom to Mary without repeating a street. The answer is ${story.answerM} m (9 streets).`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: '#C7DCF5' }}
      >
        {/* Street graph — edges grow via highlightedEdges */}
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width={Math.min(360, VIEW_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <StreetGraph
            highlightedEdges={beat.highlightedEdges}
            highlightColor={ORANGE}
          />
        </svg>

        {/* Running street count + distance */}
        <StreetCounter
          count={beat.streetCount}
          distanceM={beat.distanceM}
          result={beat.result}
        />

        {/* Caption */}
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}
