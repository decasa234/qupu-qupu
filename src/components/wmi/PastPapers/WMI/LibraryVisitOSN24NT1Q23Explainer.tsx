// OSN-24-SD-NAS-TEORI1-Q23 — "Library visit diagram. Besides Ardi, which
// students visited together with every other student?" (answer: Wati)
//
// Animation: beat-by-beat adjacency check — show Ardi (all 6), then Wati
// (all 6), then Dikta (misses Gina), then Gina (only 2), then reveal Wati.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  LibraryVisitGraph,
  type LibraryVisitGraphProps,
} from './LibraryVisitOSN24NT1Q23Illustration'
import {
  buildLibraryVisitSteps,
  OSN24NT1Q23_ANSWER,
} from './libraryVisitOSN24NT1Q23Steps'

const BLUE  = '#30598A'
const GREEN = '#10B981'
const AMBER = '#F59E0B'

export default function LibraryVisitOSN24NT1Q23Explainer(props: ExplainerProps) {
  const lang   = props.lang ?? 'id'
  const t      = (en: string, id: string) => (lang === 'id' ? id : en)
  const story  = useMemo(() => buildLibraryVisitSteps(lang), [lang])
  const index  = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map(s => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const graphProps: LibraryVisitGraphProps = {
    highlightNodes: beat.highlightNodes,
    focusId:        beat.focusId,
  }

  const ariaLabel = t(
    `Library visit explainer: Ardi and Wati both visited with all 6 other students. Only Wati qualifies besides Ardi. Answer: ${OSN24NT1Q23_ANSWER}.`,
    `Penjelasan kunjungan perpustakaan: Ardi dan Wati keduanya bertemu semua 6 siswa. Hanya Wati yang memenuhi syarat selain Ardi. Jawaban: ${OSN24NT1Q23_ANSWER}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Strategy banner */}
        <div
          className="rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t(
            'Check: who has a same-color line to every other student?',
            'Cek: siapa yang punya garis sewarna ke setiap siswa lain?',
          )}
        </div>

        {/* Graph */}
        <LibraryVisitGraph {...graphProps} />

        {/* Caption */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={`cap-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="text-center font-display text-sm leading-snug"
            style={{ color: beat.result ? GREEN : beat.focusId ? AMBER : BLUE }}
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
            className="rounded-xl px-5 py-1.5 font-display text-base font-extrabold"
            style={{ background: GREEN, color: '#fff' }}
          >
            {t(
              `Answer: ${OSN24NT1Q23_ANSWER}`,
              `Jawaban: ${OSN24NT1Q23_ANSWER}`,
            )}
          </motion.div>
        )}

      </div>
    </div>
  )
}
