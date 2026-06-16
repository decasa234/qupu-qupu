import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Seating24G2 } from './Seating24G2Illustration'
import { buildSeatingSteps } from './seating24G2Steps'

// Post-answer explainer for WMI-24F2A-Q12 (2024 Grade-2 final) — Samuel's seat.
//
// Reuses the static figure's `Seating24G2` primitive and drives it beat by beat
// (`upto` / `highlight` / `markSamuel` / `reveal`) so the same scene comes alive:
// fix the snake direction from the two known seats (11, 37), walk the
// boustrophedon numbering from seat 1 up to Samuel's circle, land on seat 20,
// then reject the left-to-right trap. The answer (20) is derived from the
// figure's own `seatNumberAt(SAMUEL_CELL)` helper — never hardcoded here.

// Palette echoes the static seating figure (qupu tokens as hex).
const SHELL = '#FFF9F4' // qupu-shell (panel)
const PEACH = '#FFD3B1' // qupu-peach (panel border)
const BRAND_BLUE = '#30598A' // qupu-brand-blue (pointer + info caption)
const GREEN = '#10B981'
const GREEN_INK = '#065F46'

export default function Seating24G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildSeatingSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = T(
    `Strategy: the seats are numbered in a back-and-forth snake from the bottom-left, and the two known seats fix the direction. Following the snake to Samuel's circle lands on seat ${story.answer}.`,
    `Strategi: kursi dinomori dengan pola ular bolak-balik mulai dari pojok kiri bawah, dan dua kursi yang diketahui menetapkan arahnya. Mengikuti pola ular ke lingkaran Samuel mendarat di kursi ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[320px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* the seating block, driven beat by beat */}
        <div className="w-full">
          <Seating24G2
            upto={beat.upto}
            highlight={beat.highlight}
            markSamuel={beat.markSamuel}
            reveal={beat.reveal}
          />
        </div>

        {/* found-seat chip — appears once we land on Samuel's seat */}
        <div className="flex min-h-[1.75rem] items-center justify-center">
          {!beat.markSamuel && beat.upto >= story.answer && !beat.reveal && (
            <motion.div
              key="seat-chip"
              initial={{ opacity: 0, scale: 0.6, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              className="rounded-full px-3 py-1 font-display text-sm font-black tabular-nums"
              style={{ background: '#D1FAE5', color: GREEN_INK, border: `2px solid ${GREEN}` }}
            >
              {T(`Samuel = seat ${story.answer}`, `Samuel = kursi ${story.answer}`)}
            </motion.div>
          )}
        </div>

        {/* caption box */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
