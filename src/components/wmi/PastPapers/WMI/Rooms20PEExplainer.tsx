// IKMC-22-PE-Q20 — animated explainer for the "Dino moves through rooms" problem.
//
// Reuses the Rooms20PE grid primitive from Rooms20PEIllustration.
// One room per beat: Dino's trail grows, the running total updates, landing on 34.
//
// Beat flow:
//   0  intro   — show grid, no trail; state the goal
//   1  room 1  — trail to room 1; total = 1
//   2  room 5  — trail extends; total = 6
//   3  room 6  — trail extends; total = 12
//   4  room 7  — trail extends; total = 19
//   5  room 3  — trail extends (jumps up); total = 22
//   6  room 4  — trail extends; total = 26
//   7  room 8  — trail completes; total = 34 → answer D

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Rooms20PE, COLOR } from './Rooms20PEIllustration'
import { buildRooms20PESteps } from './rooms20PESteps'

// ── Colour tokens (echo illustration palette) ─────────────────────────────

const AMBER      = COLOR.TRAIL        // '#F59E0B'
const AMBER_BG   = '#FEF3C7'
const AMBER_INK  = '#92400E'
const GREEN      = COLOR.HIGHLIGHT    // '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_INK  = '#065F46'
const BLUE       = '#30598A'
const BLUE_BG    = '#E1EFFB'
const BLUE_INK   = '#1E3A8A'

// ── Component ─────────────────────────────────────────────────────────────

export default function Rooms20PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildRooms20PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    'Explainer: Dino walks rooms 1→5→6→7→3→4→8, adding each room number. Running total: 1, 6, 12, 19, 22, 26, 34. Highest total = 34 — answer D.',
    'Penjelasan: Dino melewati ruangan 1→5→6→7→3→4→8, menjumlahkan setiap angka ruangan. Total berjalan: 1, 6, 12, 19, 22, 26, 34. Total tertinggi = 34 — jawaban D.',
  )

  // Caption box colour depends on phase
  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : beat.phase === 'walk'
      ? { background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }
      : { background: BLUE_BG, borderColor: BLUE, color: BLUE_INK }

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Running total badge */}
        {beat.equation ? (
          <motion.div
            key={`eq-${index}`}
            className="flex items-center gap-2 rounded-xl border-2 px-4 py-1 font-display text-lg font-extrabold"
            style={
              beat.result
                ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
                : { background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }
            }
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          >
            {beat.result
              ? t(`Total: ${beat.total} → Answer D`, `Total: ${beat.total} → Jawaban D`)
              : t(`Total: ${beat.total}`, `Total: ${beat.total}`)}
          </motion.div>
        ) : (
          <div className="h-9" />
        )}

        {/* The rooms grid with growing trail */}
        <motion.div
          key={`grid-${index}`}
          initial={{ opacity: 0.75, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        >
          <Rooms20PE
            litPath={beat.litPath || null}
            showAnswer={beat.showAnswer}
          />
        </motion.div>

        {/* Active room highlight — shows which room Dino just entered */}
        {beat.activeRoom !== null && !beat.result && (
          <motion.div
            key={`room-badge-${beat.activeRoom}`}
            className="flex items-center gap-1.5 rounded-lg border-2 px-3 py-0.5 font-display text-sm font-extrabold"
            style={{ background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {t(`+ Room ${beat.activeRoom}`, `+ Ruangan ${beat.activeRoom}`)}
          </motion.div>
        )}

        {/* Answer badge (result beat only) */}
        {beat.result && (
          <motion.div
            key="answer-badge"
            className="flex items-center gap-2 rounded-xl border-2 px-4 py-1.5 font-display text-base font-extrabold"
            style={{ background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }}
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.15 }}
          >
            {t(
              '1 + 5 + 6 + 7 + 3 + 4 + 8 = 34',
              '1 + 5 + 6 + 7 + 3 + 4 + 8 = 34',
            )}
          </motion.div>
        )}

        {/* Caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.22 }}
          className="min-h-[48px] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>

      </div>
    </div>
  )
}
