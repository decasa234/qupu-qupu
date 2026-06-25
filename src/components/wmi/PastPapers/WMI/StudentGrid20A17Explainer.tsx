import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { StudentGrid } from './StudentGrid20A17Illustration'
import { buildStudentGrid20A17Steps } from './studentGrid20A17Steps'

// Brand tokens matching house style
const ORANGE = '#D97706'   // amber-600 — emphasis colour
const GREEN  = '#10B981'   // emerald-500 — final answer

/** Row/column count chips that animate in when revealed. */
function CountChip({ label, color }: { label: string; color: string }) {
  return (
    <motion.span
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      className="inline-flex items-center justify-center rounded-lg px-3 py-1 font-display text-sm font-black"
      style={{ background: '#FEF3C7', border: `2px solid ${color}`, color: '#92400E' }}
    >
      {label}
    </motion.span>
  )
}

export default function StudentGrid20A17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildStudentGrid20A17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: formasi kotak-kotak 5 baris (3 depan + James + 1 belakang) kali 9 kolom (5 kiri + James + 3 kanan). Total = 5 × 9 = ${story.answer} siswa.`
      : `Explainer: rectangular grid with 5 rows (3 in front + James + 1 behind) and 9 columns (5 left + James + 3 right). Total = 5 × 9 = ${story.answer} students.`

  // Show highlight on James cell in all phases
  const showRows = beat.phase === 'rows' || beat.phase === 'cols' || beat.phase === 'multiply' || beat.phase === 'done'
  const showCols = beat.phase === 'cols' || beat.phase === 'multiply' || beat.phase === 'done'
  const showResult = beat.phase === 'done'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* The grid — always visible with James highlighted */}
        <StudentGrid highlightJames={true} />

        {/* Running chips: rows → cols → product */}
        {showRows && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <CountChip
              key="rows"
              label={lang === 'id' ? '5 baris' : '5 rows'}
              color={ORANGE}
            />
            {showCols && (
              <>
                <span className="font-display text-lg font-black" style={{ color: ORANGE }}>×</span>
                <CountChip
                  key="cols"
                  label={lang === 'id' ? '9 kolom' : '9 columns'}
                  color={ORANGE}
                />
              </>
            )}
            {showResult && (
              <motion.span
                key="product"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                className="font-display text-xl font-black"
                style={{ color: GREEN }}
              >
                = {story.answer}
              </motion.span>
            )}
          </div>
        )}

        {/* Caption card */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#FEF3C7', borderColor: ORANGE, color: '#92400E' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
