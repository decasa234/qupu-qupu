// IKMC-21-PE-Q15 — post-answer explainer: house-map path-tracing puzzle.
//
// Teaches the method:
//   1. Doris & Ali both pass Leo → Leo is on a shared trunk path.
//   2. Eva passes Chole → Chole sits between Eva and school.
//   3. Only house B feeds through Chole toward school → B is Eva's house.
//
// Beat sequence (see houseMap15PESteps.ts):
//   0. Intro     — plain map, set up the puzzle.
//   1. Leo       — highlight Leo's house + Doris/Ali paths.
//   2. Chole     — highlight Chole's house + Eva's clue.
//   3. Eva path  — trace the B→Chole→School route.
//   4. Result    — B shown in green; confirm answer.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { HouseMap15PE } from './HouseMap15PEIllustration'
import { buildHouseMap15PESteps } from './houseMap15PESteps'

// ── Colour constants ──────────────────────────────────────────────────────────
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const AMBER     = '#F59E0B'
const AMBER_BG  = '#FEF3C7'
const AMBER_INK = '#92400E'
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'

export default function HouseMap15PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(
    () => buildHouseMap15PESteps(props.correctAnswer, lang),
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
    'Explainer: Doris and Ali both walk past Leo\'s house. Eva walks past Chole\'s house. Tracing the map, only house B passes through Chole\'s house on the way to school. Answer B.',
    'Penjelasan: Doris dan Ali keduanya melewati rumah Leo. Eva melewati rumah Chole. Menelusuri peta, hanya rumah B yang melewati rumah Chole menuju sekolah. Jawaban B.',
  )

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* ── House map (shared primitive) ────────────────────────────── */}
        <div className="w-full max-w-[380px]">
          <HouseMap15PE
            highlight={beat.highlight}
            highlightAnswer={beat.highlightAnswer}
          />
        </div>

        {/* ── Path badge (beats 1–3 only) ─────────────────────────────── */}
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

        {/* ── Caption ─────────────────────────────────────────────────── */}
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
