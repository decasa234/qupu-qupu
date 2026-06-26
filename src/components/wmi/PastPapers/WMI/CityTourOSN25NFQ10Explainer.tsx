import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CityTourOSN25NFQ10Graph } from './CityTourOSN25NFQ10Illustration'
import { buildCityTourSteps, WINNER_TOUR, ANSWER } from './cityTourOSN25NFQ10Steps'

// OSN-25-SD-NAS-FINAL-Q10 — visit all cities A–H and return to A, minimum km.
//
// Animation: builds the optimal Hamiltonian circuit A→B→C→D→F→E→G→H→A hop
// by hop, showing the running total each beat, and explains why D→F is chosen
// over the costly D→E (8 km) detour.

const BLUE   = '#30598A'
const ORANGE = '#f0853a'
const GREEN  = '#10B981'

export default function CityTourOSN25NFQ10Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildCityTourSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const badgeColor = beat.result ? GREEN : ORANGE
  const pathLabel = beat.highlightPath
    ? beat.highlightPath.join(' → ')
    : null

  const ariaLabel = t(
    `Explainer: find the shortest Hamiltonian circuit through 8 cities. ` +
    `A connects only to B and H. Optimal route: A→B→C→D→F→E→G→H→A = ${ANSWER} km.`,
    `Penjelasan: cari sirkuit Hamiltonian terpendek melalui 8 kota. ` +
    `A hanya terhubung ke B dan H. Rute optimal: A→B→C→D→F→E→G→H→A = ${ANSWER} km.`,
  )

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* strategy banner */}
        <div
          className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t(
            'Visit each city once, return to A — minimize total distance',
            'Kunjungi tiap kota sekali, kembali ke A — minimumkan jarak total',
          )}
        </div>

        {/* the city road network, with highlighted route this beat */}
        <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <CityTourOSN25NFQ10Graph highlightPath={beat.highlightPath} />
        </div>

        {/* running km badge */}
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
                {beat.result ? ' km ✓' : ' km'}
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
                className="font-display text-[11px] font-extrabold tabular-nums"
                style={{ color: badgeColor }}
              >
                {pathLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.highlightPath != null
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

export { WINNER_TOUR, ANSWER }
