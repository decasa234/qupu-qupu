// IKMC-20-PE-Q10 — post-answer explainer: village map road-count puzzle.
//
// Teaches the method: each road (straight OR circular) must have exactly 3
// houses. We find WHICH straight road and WHICH circular road each have only 2
// (the right spoke and the outer ring), then show that the missing house must
// sit at their intersection — position C.
//
// Beat sequence (see villageMap10PESteps.ts):
//   0. Intro  — plain map, state the "3 per road" rule.
//   1. Right  — amber-highlight the right spoke; badge shows "2/3".
//   2. Ring4  — amber-highlight outer ring; badge shows "2/3".
//   3. Both   — both highlighted simultaneously; caption names position C.
//   4. Result — C shown in green; caption confirms the answer.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { VillageMap10PE } from './VillageMap10PEIllustration'
import { buildVillageMap10PESteps } from './villageMap10PESteps'

// ── Colour constants ──────────────────────────────────────────────────────────
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const AMBER     = '#F59E0B'
const AMBER_BG  = '#FEF3C7'
const AMBER_INK = '#92400E'
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'

export default function VillageMap10PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(
    () => buildVillageMap10PESteps(props.correctAnswer, lang),
    [props.correctAnswer, lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // ── Caption box style driven by phase ──────────────────────────────────────
  const capStyle: React.CSSProperties = beat.result
    ? { background: GREEN_BG,  borderColor: GREEN,  color: GREEN_INK }
    : beat.phase === 'intro'
      ? { background: BLUE_BG,   borderColor: BLUE,   color: BLUE }
      : { background: AMBER_BG,  borderColor: AMBER,  color: AMBER_INK }

  // ── Badge style ────────────────────────────────────────────────────────────
  const badgeStyle: React.CSSProperties = beat.result
    ? { background: GREEN_BG,  borderColor: GREEN,  color: GREEN_INK }
    : { background: AMBER_BG,  borderColor: AMBER,  color: AMBER_INK }

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    `Explainer: each road must have exactly 3 houses. The right straight road has 2, and the outer circular road has 2. Their intersection is position C — placing a house there completes both roads. Answer C.`,
    `Penjelasan: setiap jalan harus punya tepat 3 rumah. Jalan lurus kanan punya 2, dan jalan melingkar terluar punya 2. Persimpangannya adalah posisi C — meletakkan rumah di sana melengkapi kedua jalan. Jawaban C.`,
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* ── Village map (shared primitive) ─────────────────────────────── */}
        <div className="w-full max-w-[260px]">
          <VillageMap10PE
            highlightRoad={beat.highlightRoad}
            highlightAnswer={beat.highlightAnswer}
          />
        </div>

        {/* ── Road-count badge (beats 1–3 only) ──────────────────────────── */}
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

        {/* ── Caption ────────────────────────────────────────────────────── */}
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
