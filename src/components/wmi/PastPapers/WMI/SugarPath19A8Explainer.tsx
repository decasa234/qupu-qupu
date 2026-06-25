// SEAMO-19-A-Q8 — "How many ways are there to spell the word 'SUGAR'?"
//
// Animates path tracing through the diamond letter graph S→U→G→A→R,
// revealing each of the 6 valid paths one at a time (amber for active path,
// green for completed paths) then landing on the answer.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SugarGraph } from './SugarPath19A8Illustration'
import { buildSugarPath19A8Steps, SUGAR_ANSWER, SUGAR_CHOICE } from './sugarPath19A8Steps'

const BLUE  = '#30598A'
const AMBER = '#D97706'
const GREEN = '#059669'

export default function SugarPath19A8Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildSugarPath19A8Steps(lang), [lang])

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Path-tracing explainer for SUGAR diamond graph. There are ${SUGAR_ANSWER} ways to spell SUGAR by following connected letters left to right. Answer ${SUGAR_CHOICE}.`,
    `Penjelasan penelusuran jalur pada kisi berlian SUGAR. Ada ${SUGAR_ANSWER} cara mengeja SUGAR dengan mengikuti huruf-huruf yang terhubung dari kiri ke kanan. Jawaban ${SUGAR_CHOICE}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Strategy banner */}
        <div
          className="rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t('Trace every S→U→G→A→R path', 'Telusuri setiap jalur S→U→G→A→R')}
        </div>

        {/* Graph primitive */}
        <SugarGraph
          nodeStates={beat.nodeStates}
          activeEdges={beat.activeEdges}
          doneEdges={beat.doneEdges}
        />

        {/* Path counter badge */}
        <AnimatePresence mode="popLayout" initial={false}>
          {beat.count > 0 && (
            <motion.div
              key={`count-${beat.count}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="rounded-full px-3 py-0.5 font-display text-sm font-bold"
              style={{
                background: beat.result ? GREEN : AMBER,
                color: '#fff',
              }}
            >
              {t(`${beat.count} path${beat.count === 1 ? '' : 's'} found`, `${beat.count} jalur ditemukan`)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={`cap-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="text-center font-display text-sm leading-snug"
            style={{ color: beat.result ? GREEN : beat.count > 0 ? AMBER : BLUE }}
          >
            {beat.caption}
          </motion.p>
        </AnimatePresence>

        {/* Final answer chip */}
        {beat.result && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 16, delay: 0.15 }}
            className="rounded-xl px-4 py-1.5 font-display text-base font-extrabold"
            style={{ background: GREEN, color: '#fff' }}
          >
            {t(`${SUGAR_ANSWER} ways — Answer ${SUGAR_CHOICE}`, `${SUGAR_ANSWER} cara — Jawaban ${SUGAR_CHOICE}`)}
          </motion.div>
        )}
      </div>
    </div>
  )
}
