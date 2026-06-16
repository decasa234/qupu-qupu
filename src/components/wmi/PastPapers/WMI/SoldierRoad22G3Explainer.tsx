/**
 * WMI-22F3A-Q23 — Soldier Road explainer.
 *
 * Teaches the deep-hole strategy beat-by-beat:
 *   1 → 2 drop into right hole, 3 → 4 drop into left hole,
 *   5 crosses freely; climb-out top-first gives 52143.
 *
 * SSR-safe, deterministic — no Math.random, no Date.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SoldierRoad,
  VIEW_W,
  VIEW_H,
} from './SoldierRoad22G3Illustration'
import { buildSoldierRoad22G3Steps } from './soldierRoad22G3Steps'

const BLUE_BG = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = '#10B981'
const GREEN_TEXT = '#065F46'

export default function SoldierRoad22G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSoldierRoad22G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan urutan tentara: dua lubang dalam masing-masing butuh dua tentara bertumpuk; naik keluar dari atas dulu memberikan urutan depan-ke-belakang 5, 2, 1, 4, 3 = ${story.answer}.`
      : `Explainer: two deep holes each need two stacked soldiers; climbing out top-first gives front-to-back order 5, 2, 1, 4, 3 = ${story.answer}.`

  const isResult = beat.result

  return (
    <div className="mx-auto w-full max-w-[500px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* ── Road scene ── */}
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ display: 'block', maxWidth: VIEW_W }}
          aria-hidden="true"
        >
          <SoldierRoad
            soldiers={beat.soldiers}
            holeFill={beat.holeFill}
            showArrow={beat.showArrow}
          />

          {/* Final-beat order label above the road */}
          <AnimatePresence>
            {isResult && (
              <motion.text
                key="result-label"
                x={VIEW_W / 2}
                y={54}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
                fontWeight={900}
                fill={GREEN_BORDER}
                initial={{ opacity: 0, y: 44 }}
                animate={{ opacity: 1, y: 54 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              >
                52143
              </motion.text>
            )}
          </AnimatePresence>
        </svg>

        {/* ── Caption box ── */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN_TEXT }
              : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }
          }
        >
          {beat.caption}
        </motion.div>

      </div>
    </div>
  )
}
