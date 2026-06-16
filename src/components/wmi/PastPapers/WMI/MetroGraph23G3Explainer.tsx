import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MetroGraph23G3 } from './MetroGraph23G3Illustration'
import {
  buildMetroGraphSteps,
  WINNER_PATH,
  ANSWER,
  ANSWER_CHOICE,
} from './metroGraph23G3Steps'

// WMI-23F3A-Q8 — weighted metro graph, cheapest ticket A → B (answer C = 150).
//
// The animation DEDUCES the cheap route hop by hop, then at the central hub R
// it tries the two ways on to B and eliminates the dearer one, then tries the
// other tempting start (via P) and eliminates that too, before landing on the
// winner:
//   A → Q = 50 → +Q→R 20 = 70 at R
//   R → B  (90)        → 160  ✗ dearer
//   R → S → B (10+70)  → 150  ✓ cheaper
//   A → P → R → S → B  → 160  ✗ dearer
//   cheapest = A → Q → R → S → B = 50 + 20 + 10 + 70 = 150 → C
//
// Each beat lights a route on the figure by passing its node-id path to the
// illustrator's MetroGraph23G3 `highlightPath` prop, so the post-answer figure
// reads as the static metro map coming alive. A running-sum badge shows the
// concrete arithmetic; rejected routes flash a ✗ and linger; the winner lands
// last with hold 0.

// qupu colour tokens, echoed as hex constants (matching fill-qupu-*).
const BLUE = '#30598A' // fill-qupu-brand-blue — frame / strategy accent
const ORANGE = '#f0853a' // fill-qupu-brand-orange — a route in progress
const GREEN = '#10B981' // the winning / cheaper accent
const RED = '#DC2626' // the dearer / rejected accent

export default function MetroGraph23G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildMetroGraphSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: add the metro fares hop by hop from A to B. A→Q is 50, Q→R is 20 (70 at the hub). Straight R→B costs 90 → 160, too dear; R→S→B costs 10 + 70 → 150, cheaper; A→P→R→S→B is also 160. The cheapest ticket is A→Q→R→S→B = ${ANSWER}, choice ${ANSWER_CHOICE}.`,
    `Penjelasan: jumlahkan ongkos metro tiap ruas dari A ke B. A→Q 50, Q→R 20 (70 di simpang). Langsung R→B 90 → 160, terlalu mahal; R→S→B 10 + 70 → 150, lebih murah; A→P→R→S→B juga 160. Tiket termurah A→Q→R→S→B = ${ANSWER}, jawaban ${ANSWER_CHOICE}.`,
  )

  // Badge colour follows the verdict for the current beat.
  const badgeColor = beat.result ? GREEN : beat.reject ? RED : ORANGE
  // Pretty path string for the badge sub-label (e.g. "A → Q → R → S → B").
  const pathLabel = beat.highlightPath ? beat.highlightPath.join(' → ') : null

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line strategy legend, always visible */}
        <div
          className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t('Add the fares — keep the cheapest A → B', 'Jumlahkan ongkos — simpan A → B termurah')}
        </div>

        {/* the metro map, with this beat's route lit up by the shared primitive */}
        <div className="relative">
          <MetroGraph23G3 highlightPath={beat.highlightPath} />
        </div>

        {/* running-sum badge — the one concrete sum for this beat */}
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
                {beat.reject ? ' ✗' : beat.result ? ' ✓' : ''}
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

        {/* caption box */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.reject
                ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
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

// Re-export the winning path so callers/tests can assert the route without
// re-deriving it (matches the house pattern of exporting bound constants).
export { WINNER_PATH }
