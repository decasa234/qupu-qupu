import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TrianglesRectFigure } from './TrianglesRectOSN08KQ6Illustration'
import { buildTrianglesRectOSN08KQ6Steps } from './trianglesRectOSN08KQ6Steps'

// TrianglesRectOSN08KQ6Explainer — OSN-08-SD-KAB-Q6
//
// Beat-by-beat comparison of the three triangle perimeters:
//   1. Neutral figure — all triangles share base DC.
//   2. Highlight ACD (blue)   — AD + AC: full height + full diagonal.
//   3. Highlight DEC (orange) — DE + EC: interior shortcuts → shorter.
//   4. Highlight DFC (green)  — DF + FC: same argument → shorter.
//   5. Conclude ACD wins (blue again, result).

const HIGHLIGHT_LABELS: Record<string, { label: string; bg: string; border: string; color: string }> = {
  ACD: { label: 'ACD', bg: '#EFF6FF', border: '#2563EB', color: '#1D4ED8' },
  DEC: { label: 'DEC', bg: '#FFF7ED', border: '#EA580C', color: '#C2410C' },
  DFC: { label: 'DFC', bg: '#F0FDF4', border: '#16A34A', color: '#15803D' },
}

export default function TrianglesRectOSN08KQ6Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildTrianglesRectOSN08KQ6Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Explainer: all three triangles share base DC. Triangle ACD has sides AD (full height) and AC (full diagonal) — the longest possible pair — giving it the greatest perimeter.',
    'Penjelasan: ketiga segitiga berbagi alas DC. Segitiga ACD memiliki sisi AD (tinggi penuh) dan AC (diagonal penuh) — pasangan terpanjang — sehingga kelilingnya terbesar.',
  )

  const info = beat.highlight ? HIGHLIGHT_LABELS[beat.highlight] : null

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Geometry figure */}
        <motion.div
          key={beat.highlight ?? 'none'}
          initial={{ opacity: 0.6, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="w-full"
        >
          <TrianglesRectFigure highlight={beat.highlight} />
        </motion.div>

        {/* Active triangle badge */}
        {info && (
          <motion.div
            key={`badge-${beat.highlight}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
            className="rounded-xl border-2 px-4 py-1.5 font-display text-sm font-black"
            style={{ background: info.bg, borderColor: info.border, color: info.color }}
          >
            {t(`▲ ${info.label}`, `▲ ${info.label}`)}
            {beat.result && ' ✓'}
          </motion.div>
        )}

        {/* Caption */}
        <motion.p
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center text-sm leading-snug text-gray-700"
        >
          {beat.caption}
        </motion.p>
      </div>
    </div>
  )
}
