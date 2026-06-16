import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { TheaterSeats25G1 } from './TheaterSeats25G1Illustration'
import { buildTheaterSeats25G1Steps, SEAT_COUNT } from './theaterSeats25G1Steps'

// Palette echoes the static theater illustration (qupu tokens).
const BRAND_BLUE = '#30598A' // qupu-brand-blue
const ORANGE = '#f0853a' // qupu-brand-orange
const SHELL = '#FFF9F4' // qupu-shell (panel)
const PEACH = '#FFD3B1' // qupu-peach (panel border)
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const GREEN_SOFT = '#E5F0E4' // covered-seat shade (matches primitive COVER_FILL)
const COVER_STROKE = '#5B8C5A'

// A small coverage meter: how many of the 12 seats are "safe" so far (occupied
// + their covered empty neighbours). Fills green; turns full + bright on the win.
function CoverMeter({ covered, total, win }: { covered: number; total: number; win: boolean }) {
  const ratio = Math.min(1, covered / total)
  return (
    <div className="w-full max-w-[300px]">
      <div
        className="mb-1 flex items-center justify-between font-display text-[11px] font-extrabold"
        style={{ color: BRAND_BLUE }}
      >
        <span>{covered === 0 ? '0' : `${covered}`}</span>
        <span>{`${total} seats`}</span>
      </div>
      <div className="relative h-5 w-full">
        <div
          className="absolute inset-0 overflow-hidden rounded-full"
          style={{ background: SHELL, border: `2px solid ${PEACH}` }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: win ? GREEN : COVER_STROKE }}
          initial={false}
          animate={{ width: `${ratio * 100}%`, background: win ? GREEN : COVER_STROKE }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  )
}

export default function TheaterSeats25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTheaterSeats25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: every empty seat needs an occupied neighbour. Seating people every 3rd seat (seats 2, 5, 8, 11) covers all 12 — the fewest is ${story.answer} people.`,
    `Strategi: setiap kursi kosong butuh tetangga terisi. Mendudukkan orang tiap kursi ke-3 (kursi 2, 5, 8, 11) menutup semua 12 — paling sedikit ${story.answer} orang.`,
  )

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[260px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* people-seated badge — grows as we place each person */}
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-extrabold" style={{ color: BRAND_BLUE }}>
            {T('People seated:', 'Orang duduk:')}
          </span>
          <motion.span
            key={beat.count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN_INK : ORANGE }}
          >
            {beat.count}
          </motion.span>
        </div>

        {/* the theater row — bind the built primitive, do NOT redraw */}
        <TheaterSeats25G1 occupied={beat.occupied} covered={beat.covered} />

        {/* coverage meter: safe seats so far vs 12 */}
        <CoverMeter covered={beat.coveredCount} total={SEAT_COUNT} win={beat.result} />

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : beat.phase === 'gap'
                ? { background: '#FFF1F2', borderColor: '#e11d48', color: '#9f1239' }
                : beat.phase === 'place'
                  ? { background: GREEN_SOFT, borderColor: COVER_STROKE, color: GREEN_INK }
                  : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
