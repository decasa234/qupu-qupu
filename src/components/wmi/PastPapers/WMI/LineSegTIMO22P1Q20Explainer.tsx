// Animated explainer for TIMO-22-P1H-Q20.
// Beats through 3 edge-group highlights then lands on the total = 12.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { LineSegTIMO22P1Q20 } from './LineSegTIMO22P1Q20Illustration'
import {
  LINE_SEG_22_P1_STEPS,
  LINE_SEG_22_P1_FINAL_INDEX,
  LINE_SEG_22_P1_ANSWER,
} from './lineSegTIMO22P1Q20Steps'

// ── palette ──────────────────────────────────────────────────────────────────

const CLR_H   = '#3B82F6' // blue  — horizontal group
const CLR_D   = '#10B981' // green — diagonal group
const CLR_B   = '#8B5CF6' // purple— branch group
const CLR_ALL = '#F59E0B' // amber — final reveal
const CLR_DARK = '#1c1917'

function groupColors(
  highlight: 'horizontal' | 'diagonal' | 'branch' | 'all' | undefined,
) {
  if (!highlight) return {}
  if (highlight === 'all') {
    return { horizontal: CLR_ALL, diagonal: CLR_ALL, branch: CLR_ALL }
  }
  const map = { horizontal: CLR_H, diagonal: CLR_D, branch: CLR_B }
  return { [highlight]: map[highlight] }
}

// ── component ─────────────────────────────────────────────────────────────────

export default function LineSegTIMO22P1Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => LINE_SEG_22_P1_STEPS, [])

  const index = useBeatControl(LINE_SEG_22_P1_FINAL_INDEX, {
    ...props,
    holds: story.map((s) => s.hold),
  })

  const beat = story[index] ?? story[LINE_SEG_22_P1_FINAL_INDEX]
  const colors = groupColors(beat.highlight)

  const ariaLabel = t(
    `Step-by-step line segment count for the TIMO 2022 Primary 1 figure. ` +
      `Groups: horizontal (6 segments), diagonal (3 segments), branches (3 segments). ` +
      `Total = ${LINE_SEG_22_P1_ANSWER}.`,
    `Langkah-langkah menghitung ruas garis pada gambar TIMO 2022 Kelas 1. ` +
      `Kelompok: horizontal (6 ruas garis), diagonal (3 ruas garis), cabang (3 ruas garis). ` +
      `Total = ${LINE_SEG_22_P1_ANSWER}.`,
  )

  // Chip colours follow the active group.
  const chipStyle =
    beat.highlight === 'horizontal'
      ? { bg: '#EFF6FF', text: CLR_H, border: '#BFDBFE' }
      : beat.highlight === 'diagonal'
        ? { bg: '#ECFDF5', text: CLR_D, border: '#A7F3D0' }
        : beat.highlight === 'branch'
          ? { bg: '#F5F3FF', text: CLR_B, border: '#DDD6FE' }
          : { bg: '#FFFBEB', text: CLR_ALL, border: '#FDE68A' }

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Strategy banner */}
        <div className="rounded-lg bg-slate-50 px-3 py-1 text-center font-display text-xs font-bold text-slate-600">
          {t('Group by direction → count sub-segments → sum', 'Kelompok per arah → hitung sub-ruas → jumlahkan')}
        </div>

        {/* Graph */}
        <LineSegTIMO22P1Q20 groupColors={colors} />

        {/* Beat label */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-h-[36px] px-3 text-center text-sm text-slate-700"
        >
          {lang === 'id' ? beat.label_id : beat.label_en}
        </motion.div>

        {/* Running count chip */}
        {beat.countSoFar > 0 && (
          <motion.div
            key={`count-${beat.countSoFar}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            className="rounded-full px-5 py-1 font-display text-sm font-bold"
            style={{
              backgroundColor: chipStyle.bg,
              color: chipStyle.text,
              border: `2px solid ${chipStyle.border}`,
            }}
          >
            {beat.countSoFar === LINE_SEG_22_P1_ANSWER && beat.highlight === 'all'
              ? `${t('Total', 'Total')} = ${beat.countSoFar} ✓`
              : `${t('Count so far', 'Jumlah sejauh ini')}: ${beat.countSoFar}`}
          </motion.div>
        )}

        {/* Legend chips — visible once a group is active */}
        {beat.highlight && (
          <motion.div
            key={`legend-${beat.highlight}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap justify-center gap-2 text-xs font-semibold"
          >
            {(['horizontal', 'diagonal', 'branch'] as const).map((g) => {
              const active =
                beat.highlight === 'all' || beat.highlight === g
              const cls = {
                horizontal: { dot: CLR_H, label_en: '6 horizontal', label_id: '6 horizontal' },
                diagonal:   { dot: CLR_D, label_en: '3 diagonal',   label_id: '3 diagonal'   },
                branch:     { dot: CLR_B, label_en: '3 branches',   label_id: '3 cabang'     },
              }[g]
              return (
                <span
                  key={g}
                  className="flex items-center gap-1 rounded-full px-2 py-0.5"
                  style={{
                    backgroundColor: active ? `${cls.dot}18` : '#F1F5F9',
                    color: active ? cls.dot : '#94A3B8',
                    border: `1px solid ${active ? cls.dot : '#E2E8F0'}`,
                  }}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: active ? cls.dot : '#CBD5E1' }}
                  />
                  {lang === 'id' ? cls.label_id : cls.label_en}
                </span>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
