// IKMC-23-PE-Q19 — post-answer explainer: five-village loop map.
//
// Teaches the method: on a single closed-loop road, two villages are the same
// distance apart (via both directions) ONLY when each one-way arc equals exactly
// half the loop total (24 / 2 = 12 km). We try each candidate pair and reject
// until B & E is confirmed equal in both directions.
//
// Beat sequence (see villages19PESteps.ts):
//   0. Intro       — plain map; explain the single-loop puzzle.
//   1. Try B & D   — routes 8 km vs 16 km → reject ✗ (amber + red)
//   2. Try C & E   — routes 10 km vs 14 km → reject ✗
//   3. B & E #1    — short route B→A→E = 7+5 = 12 km (amber)
//   4. B & E #2    — long route B→C→D→E = 2+6+4 = 12 km (amber) → equal! ✓
//   5. Result      — all B–E paths lit; B and E in green; confirm answer A.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Villages19PE } from './Villages19PEIllustration'
import { buildVillages19PESteps } from './villages19PESteps'

// ── Colour constants ──────────────────────────────────────────────────────────
const GREEN     = '#059669'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const AMBER     = '#D97706'
const AMBER_BG  = '#FEF3C7'
const AMBER_INK = '#92400E'
const RED       = '#DC2626'
const RED_BG    = '#FEE2E2'
const RED_INK   = '#991B1B'
const BLUE      = '#1D4ED8'
const BLUE_BG   = '#EFF6FF'

export default function Villages19PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(
    () => buildVillages19PESteps(lang),
    [lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // ── Caption and badge style driven by phase ────────────────────────────────
  const capStyle: React.CSSProperties = beat.result
    ? { background: GREEN_BG,  borderColor: GREEN,  color: GREEN_INK }
    : beat.reject
      ? { background: RED_BG,   borderColor: RED,    color: RED_INK }
      : beat.badge !== null
        ? { background: AMBER_BG,  borderColor: AMBER,  color: AMBER_INK }
        : { background: BLUE_BG,   borderColor: BLUE,   color: BLUE }

  const badgeStyle: React.CSSProperties = beat.result
    ? { background: GREEN_BG,  borderColor: GREEN,  color: GREEN_INK }
    : beat.reject
      ? { background: RED_BG,   borderColor: RED,    color: RED_INK }
      : { background: AMBER_BG,  borderColor: AMBER,  color: AMBER_INK }

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    'Explainer: five villages on a loop of 24 km. B and E are both 12 km apart in either direction (B→A→E = 7+5 = 12, B→C→D→E = 2+6+4 = 12). Answer: A (B and E).',
    'Penjelasan: lima desa dalam lingkaran 24 km. B dan E keduanya berjarak 12 km dari dua arah (B→A→E = 7+5 = 12, B→C→D→E = 2+6+4 = 12). Jawaban: A (B dan E).',
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* ── Village loop map (shared primitive) ────────────────────────── */}
        <div className="w-full max-w-[280px]">
          <Villages19PE
            highlightEdges={beat.highlightEdges}
            rejectEdges={beat.rejectEdges}
            highlightNodes={beat.highlightNodes}
            answerNodes={beat.answerNodes}
          />
        </div>

        {/* ── Distance badge ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {beat.badge !== null && (
            <motion.div
              key={`badge-${index}`}
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 480, damping: 24 }}
              className="rounded-full border-2 px-4 py-1 font-display text-xs font-extrabold tabular-nums"
              style={badgeStyle}
            >
              {beat.badge}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Caption ─────────────────────────────────────────────────────── */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={capStyle}
        >
          {beat.caption}
        </motion.div>

      </div>
    </div>
  )
}
