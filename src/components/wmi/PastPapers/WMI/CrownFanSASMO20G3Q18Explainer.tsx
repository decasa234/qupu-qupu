import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CrownFanSASMO20G3Q18Figure } from './CrownFanSASMO20G3Q18Illustration'
import { buildCrownFanSASMO20G3Q18Steps } from './crownFanSASMO20G3Q18Steps'

const GREEN = '#10B981'

const GROUP_LABEL: Record<string, { en: string; id: string; border: string; bg: string; color: string }> = {
  small:  { en: 'Smallest (1-part)',  id: 'Terkecil (1 bagian)',  border: '#10B981', bg: '#D1FAE5', color: '#065F46' },
  medium: { en: '2-part',             id: '2 bagian',             border: '#F59E0B', bg: '#FEF3C7', color: '#92400E' },
  large:  { en: '3 & 4-part',         id: '3 & 4 bagian',         border: '#6366F1', bg: '#EEF2FF', color: '#3730A3' },
  xlarge: { en: 'Largest (6-part)',   id: 'Terbesar (6 bagian)',  border: '#EC4899', bg: '#FCE7F3', color: '#9D174D' },
}

export default function CrownFanSASMO20G3Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildCrownFanSASMO20G3Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Explainer: count all triangles in the crown figure by size — total is 30.',
    'Penjelasan: hitung semua segitiga dalam gambar mahkota berdasarkan ukuran — totalnya 30.',
  )

  const groupInfo = beat.highlightGroup ? GROUP_LABEL[beat.highlightGroup] : null

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Figure */}
        <motion.div
          key={beat.highlightGroup ?? 'none'}
          initial={{ opacity: 0.7, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="w-full"
        >
          <CrownFanSASMO20G3Q18Figure highlightGroup={beat.highlightGroup} />
        </motion.div>

        {/* Group badge */}
        {groupInfo && (
          <motion.div
            key={`badge-${beat.highlightGroup}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-lg border-2 px-4 py-1 text-sm font-extrabold font-display"
            style={{
              borderColor: groupInfo.border,
              background: groupInfo.bg,
              color: groupInfo.color,
            }}
          >
            {lang === 'id' ? groupInfo.id : groupInfo.en}
          </motion.div>
        )}

        {/* Running total */}
        {beat.running > 0 && (
          <div
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : '#2f6df0' }}
          >
            {beat.running}
          </div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
