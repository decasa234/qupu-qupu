import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DotGrid23 } from './P23G2Q18Illustration'
import { buildP23G2Q18Steps } from './p23G2Q18Steps'

// WMI-23P2A-Q18 — least number of ● to add so every row & column has ≥3 ●
// (answer B = 4). The animation mirrors the static figure (same grid via the
// DotGrid23 primitive): it highlights the short rows (needing 4 more) and short
// columns (needing 4 more), notes that both floors are 4 so 3 can never work,
// then drops the 4 dots one by one at the row/column crossings and lands on 4.

const BLUE = '#30598A' // matches the primitive's ADDED ink
const ORANGE = '#f0853a'
const GREEN = '#10B981'

export default function P23G2Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildP23G2Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const tallying = beat.running > 0
  const accent = beat.result ? GREEN : tallying ? BLUE : ORANGE

  const ariaLabel = t(
    `Explainer: the short rows need 4 more dots and the short columns need 4 more dots, so the least is ${story.answer} — answer B.`,
    `Penjelasan: baris kurang butuh 4 titik dan kolom kurang butuh 4 titik, jadi paling sedikit ${story.answer} — jawaban B.`,
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line legend: the rule both directions must obey, always visible */}
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t('Every row ≥ 3 ●   ·   Every column ≥ 3 ●', 'Tiap baris ≥ 3 ●   ·   Tiap kolom ≥ 3 ●')}
        </div>

        <DotGrid23 addedCells={beat.added} markRows={beat.markRows} markCols={beat.markCols} />

        {/* running tally: dots added so far */}
        {tallying && (
          <motion.div
            key={beat.running}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className="flex items-center gap-2 font-display"
          >
            <span className="text-2xl font-black tabular-nums" style={{ color: accent }}>
              {beat.running}
            </span>
            <span className="text-sm font-bold" style={{ color: accent }}>
              {beat.result ? t('dots added', 'titik ditambah') : t(`of ${story.answer}`, `dari ${story.answer}`)}
            </span>
          </motion.div>
        )}

        <div
          className="min-h-[2.75rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : tallying
                ? { background: '#FFFFFF', borderColor: BLUE, color: BLUE }
                : { background: '#FFF3E8', borderColor: ORANGE, color: '#B45309' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
