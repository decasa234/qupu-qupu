import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RouteTree, QUALIFYING_ROUTES } from './RouteTree23G1Illustration'
import { buildRouteTreeSteps } from './routeTree23G1Steps'

// Verdict colours echo the qupu brand tokens used in the static figure: brand
// orange for the "good" routes (matching the markGood rings), a muted red for
// the rejected ones, and the cream/ink info palette for the intro beat.
const GOOD = '#E8861E' // fill-qupu-brand-orange
const BAD = '#D14343'
const INFO = '#30598A'

export default function RouteTree23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRouteTreeSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // On the final beat every qualifying route stays lit (so the four good traces
  // read together with their rings); otherwise just the route being traced.
  const litRoutes = beat.result ? QUALIFYING_ROUTES : beat.route != null ? [beat.route] : []

  const accent = beat.result || beat.good ? GOOD : beat.phase === 'trace' ? BAD : INFO

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: telusuri 8 rute monyet, tandai yang sampai pisang tanpa apel. ` +
        `Rute ${QUALIFYING_ROUTES.join(', ')} memenuhi — jawabannya ${story.answer}.`
      : `Explainer: trace all 8 monkey routes, keeping the ones that reach a banana with no apple. ` +
        `Routes ${QUALIFYING_ROUTES.join(', ')} qualify — the answer is ${story.answer}.`

  // Bilingual running-count label.
  const countLabel = lang === 'id' ? 'rute bagus' : 'good routes'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <RouteTree litRoutes={litRoutes} markGood={beat.markGood} />

        {/* Running count of qualifying routes (hidden before the first ✓). */}
        {beat.running > 0 && (
          <motion.div
            key={`count-${beat.running}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="flex items-baseline gap-2 font-display"
          >
            <span className="text-2xl font-black tabular-nums" style={{ color: beat.result ? GOOD : accent }}>
              {beat.running}
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: accent }}>
              {countLabel}
            </span>
          </motion.div>
        )}

        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result || beat.good
              ? { background: '#FBEBD7', borderColor: GOOD, color: '#8A4F0E' }
              : beat.phase === 'trace'
                ? { background: '#FBE2E2', borderColor: BAD, color: '#8A2A2A' }
                : { background: '#E1EFFB', borderColor: INFO, color: INFO }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
