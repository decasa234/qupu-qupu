import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { GridFill23G1 } from './GridFill23G1Illustration'
import { buildGridFill23G1Steps } from './gridFill23G1Steps'

// WMI-23F1A-Q21 — fill 5,6,7,8 into the 3x3 grid so rows go up → and columns
// go up ↓; how many ways? (answer 6). The animation mirrors the static figure
// (same grid via the GridFill23G1 primitive): it outlines the two constrained
// pairs, makes the key observation that 5..8 all beat 4 and lose to 9, then
// walks the C(4,2)=6 choices of column pair as a running tally — each backed by
// the real forced filling — and lands on "6 ways".

const BLUE = '#30598A' // matches the primitive's FILLED ink (fill-qupu-blue)
const ORANGE = '#f0853a' // matches the primitive's highlight stroke (fill-qupu-orange)
const GREEN = '#10B981'

export default function GridFill23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildGridFill23G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const tallying = beat.running > 0
  const accent = beat.result ? GREEN : tallying ? BLUE : ORANGE

  const ariaLabel = t(
    `Explainer: only the right column and bottom row are free, and every value 5..8 fits — so the answer is choosing 2 of 4 = ${story.answer} ways.`,
    `Penjelasan: hanya kolom kanan dan baris bawah yang bebas, dan setiap nilai 5..8 cocok — jadi jawabannya memilih 2 dari 4 = ${story.answer} cara.`,
  )

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line legend: the rule both directions must obey, always visible */}
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t('Rows up →   ·   Columns up ↓', 'Baris naik →   ·   Kolom naik ↓')}
        </div>

        <GridFill23G1 fill={beat.fill} highlightCells={beat.highlight} />

        {/* running tally: counts the choices found so far */}
        {tallying && (
          <motion.div
            key={beat.running}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className="flex items-center gap-2 font-display"
          >
            {beat.columnPair && (
              <span
                className="rounded-md px-2 py-0.5 text-sm font-extrabold tabular-nums"
                style={{ background: '#E1EFFB', color: BLUE }}
              >
                {beat.columnPair[0]},{beat.columnPair[1]}
              </span>
            )}
            <span className="text-2xl font-black tabular-nums" style={{ color: accent }}>
              {beat.running}
            </span>
            <span className="text-sm font-bold" style={{ color: accent }}>
              {beat.result ? t('ways', 'cara') : t(`of ${story.answer}`, `dari ${story.answer}`)}
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
