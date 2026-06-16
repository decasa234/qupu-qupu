/**
 * WMI-22F1A-Q23 — Soldier Road explainer (Grade 1).
 *
 * Teaches the one-deep-hole strategy beat-by-beat:
 *   four soldiers march left toward ONE deep hole that needs TWO soldiers.
 *   1 drops in (bottom), 2 drops in (top) → hole full; 3 & 4 march over the
 *   top and move ahead; then the TOP soldier (2) climbs out to the back before
 *   the bottom one (1). New order front→back: 3, 4, 2, 1 = 3421.
 *
 * SSR-safe, deterministic — no Math.random, no Date. Pure render of the beat.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SoldierRoad, VIEW_W, VIEW_H } from './SoldierRoad22G1Illustration'
import {
  buildSoldierRoad22G1Steps,
  SOLDIER_ROAD_G1_ANSWER,
} from './soldierRoad22G1Steps'

// Echoes the qupu tokens used in the static figure.
const GREEN = '#10B981' // fill-qupu-green
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A' // fill-qupu-blue
const BLUE_BG = '#E1EFFB'

export default function SoldierRoad22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSoldierRoad22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan urutan tentara: satu lubang dalam butuh dua tentara bertumpuk. Tentara 1 lalu 2 turun, 3 dan 4 lewat di atas, lalu yang di ATAS (2) naik lebih dulu ke belakang sebelum 1. Urutan baru depan-ke-belakang 3, 4, 2, 1 = ${story.answer}.`
      : `Explainer: one deep hole needs two stacked soldiers. Soldier 1 then 2 drop in, 3 and 4 march over the top, then the TOP soldier (2) climbs out to the back before 1. New front-to-back order 3, 4, 2, 1 = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[500px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The road comes alive: soldiers drop in, stack, cross, and climb out. */}
        <motion.div
          key={beat.phase}
          className="w-full"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            width="100%"
            style={{ display: 'block', maxWidth: VIEW_W }}
            aria-hidden="true"
          >
            <SoldierRoad
              onRoad={beat.onRoad}
              inHole={beat.inHole}
              label={beat.label}
              showArrow={beat.showArrow}
            />
          </svg>
        </motion.div>

        {/* Final order strip — only on the winning beat. */}
        {isResult ? (
          <motion.div
            key="order"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            {story.steps[story.finalIndex].onRoad.map((label, i) => (
              <motion.span
                key={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg font-display text-base font-extrabold text-white"
                style={{ background: GREEN }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.12 * i, type: 'spring', stiffness: 300, damping: 18 }}
              >
                {label}
              </motion.span>
            ))}
          </motion.div>
        ) : null}

        {/* Caption box. */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}

// Re-exported so the static answer is visible to readers of this module.
export { SOLDIER_ROAD_G1_ANSWER }
