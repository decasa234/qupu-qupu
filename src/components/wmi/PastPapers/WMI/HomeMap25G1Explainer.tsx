import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { HomeMap25G1, LONGEST_TRAIL, ANSWER } from './HomeMap25G1Illustration'
import { buildHomeMap25G1Steps, WINNER_TRAIL } from './homeMap25G1Steps'

// WMI-25F1A-Q23 — students' homes map, FARTHEST Alex→Emma walk (answer 29 cm).
//
// The animation DEDUCES the longest trail one home at a time, lighting the
// road on the figure and banking a running total. We want the LONGEST walk, so
// we take the scenic route — and along the way we TRY the two tempting wrong
// turns and reject them:
//   Alex → Sam            = 8
//   + Sam → Donald        = 14 at Donald
//   try Donald → Emma 4   = 18 ✗ (stops short, wastes Leo → Emma)
//   Olivia spur 7 + 5     = 12 ✗ (dead-end branch off the start)
//   + Donald → Leo        = 20 at Leo
//   + Leo → Emma 9        = 29 ✓ farthest
//
// Each beat lights a trail on the figure by passing its home-id path to the
// illustrator's HomeMap25G1 `litPath` prop, so the post-answer figure reads as
// the static map coming alive. A running-distance badge shows the concrete
// arithmetic; wrong turns flash ✗ and linger; the winner lands last (hold 0).

// qupu colour tokens, echoed as hex constants (matching fill-qupu-*).
const BLUE = '#30598A' // fill-qupu-brand-blue-shadow — frame / strategy accent
const ORANGE = '#f0853a' // fill-qupu-brand-orange — a trail in progress / banked
const GREEN = '#10B981' // the winning / farthest accent
const RED = '#DC2626' // a rejected wrong turn

export default function HomeMap25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildHomeMap25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: Alex wants the FARTHEST walk to Emma, each road used at most once, so we take the scenic route and add the cm. Alex→Sam is 8, +Sam→Donald is 14. The short Donald→Emma road (4) gives only 18 and stops too soon ✗; the Olivia spur is a dead-end ✗. Instead +Donald→Leo is 20, then +Leo→Emma banks the long 9 → 29. Farthest walk = 8 + 6 + 6 + 9 = ${ANSWER} cm.`,
    `Penjelasan: Alex ingin jalan TERJAUH ke rumah Emma, tiap jalan paling banyak sekali, jadi ambil rute panjang dan jumlahkan cm-nya. Alex→Sam 8, +Sam→Donald 14. Jalan pendek Donald→Emma (4) cuma 18 dan berhenti terlalu cepat ✗; cabang Olivia buntu ✗. Sebaliknya +Donald→Leo 20, lalu +Leo→Emma menambah 9 yang panjang → 29. Jalan terjauh = 8 + 6 + 6 + 9 = ${ANSWER} cm.`,
  )

  // Badge colour follows the verdict for the current beat.
  const badgeColor = beat.result ? GREEN : beat.reject ? RED : ORANGE
  // Pretty path string for the badge sub-label (e.g. "Alex → Sam → Donald").
  const pathLabel = beat.litPath ? beat.litPath.join(' → ') : null

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line strategy legend, always visible */}
        <div
          className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t('Want the FARTHEST walk — take the scenic route', 'Mau jalan TERJAUH — ambil rute panjang')}
        </div>

        {/* the homes map, with this beat's trail lit up by the shared primitive */}
        <div className="relative">
          <HomeMap25G1 litPath={beat.litPath} />
        </div>

        {/* running-distance badge — the one concrete sum for this beat */}
        <div className="flex min-h-[2.5rem] flex-col items-center justify-center gap-1">
          <AnimatePresence mode="popLayout" initial={false}>
            {beat.sumText && (
              <motion.span
                key={`${index}-sum`}
                layout
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-3 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: badgeColor }}
              >
                {beat.sumText}
                {beat.reject ? ' ✗' : beat.result ? ' ✓' : ' cm'}
              </motion.span>
            )}
            {pathLabel && (
              <motion.span
                key={`${index}-path`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="font-display text-[11px] font-extrabold"
                style={{ color: badgeColor }}
              >
                {pathLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption box */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.reject
                ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                : beat.litPath != null
                  ? { background: '#FFF7ED', borderColor: ORANGE, color: '#9A3412' }
                  : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}

// Re-export the winning trail so callers/tests can assert the route without
// re-deriving it (matches the house pattern of exporting bound constants).
export { WINNER_TRAIL, LONGEST_TRAIL }
