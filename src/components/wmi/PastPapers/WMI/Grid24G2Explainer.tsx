import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { GoGrid24G2 } from './Grid24G2Illustration'
import { buildGrid24G2Steps } from './grid24G2Steps'

// Qupu colour tokens (hex echoes of fill-qupu-* used in the static figure).
const GREEN = '#10B981'
const BLACK_FILL = '#1a1714'
const WHITE_FILL = '#ffffff'
const WHITE_STROKE = '#374151'
const LINE = '#1F2937'
const ORANGE = '#D97706'

/**
 * Post-answer explainer for WMI-24F2A-Q23.
 *
 * Mirrors the static GoGrid figure coming alive: it states the goal, tries the
 * greedy all-black board and busts, then reveals the verified OPTIMAL_GRID white
 * placement region by region, checks both halves of the adjacency rule, and
 * counts the blacks off the board — landing on 10 (derived, never hardcoded).
 */
export default function Grid24G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildGrid24G2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pada kisi 4 kali 4, tiap batu Go harus bersebelahan dengan batu hitam dan batu putih. Tidak bisa semua 16 hitam karena batu di tengah tak punya tetangga putih. Dengan menaruh ${story.steps[story.finalIndex].placement.filter((c) => c === 'W').length} batu putih dengan cerdik — di sudut atas, tepi kanan, dan sudut bawah — setiap batu menaati aturan. Sisanya batu hitam, paling banyak ${story.answer}.`
      : `Explainer: on a 4 by 4 grid, every Go stone must touch a black neighbour and a white neighbour. We cannot make all 16 black, because the inside stones have no white neighbour. Placing ${story.steps[story.finalIndex].placement.filter((c) => c === 'W').length} white stones cleverly — in the top corners, the right edge and the bottom corners — lets every stone obey the rule. The rest are black, at most ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* running black-count chip + tiny legend */}
        <div className="flex w-full items-center justify-between px-1">
          <Legend lang={lang} />
          <AnimatePresence mode="popLayout">
            {beat.blackCount != null && (
              <motion.div
                key={beat.blackCount}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-xs font-extrabold"
                style={{ background: BLACK_FILL, color: '#fff' }}
              >
                <svg width={12} height={12} aria-hidden="true">
                  <circle cx={6} cy={6} r={5} fill={BLACK_FILL} stroke="#fff" strokeWidth={1} />
                </svg>
                {story.blackWord} {beat.blackCount}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* the board — same primitive as the static figure */}
        <motion.div
          key={beat.phase + '-' + index}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <GoGrid24G2 placement={beat.placement} litCells={new Set(beat.lit)} />
        </motion.div>

        {/* caption / verdict box */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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

/** Tiny inline legend (black / white stone) echoing the static figure. */
function Legend({ lang }: { lang: 'en' | 'id' }) {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return (
    <div className="flex items-center gap-2 font-display text-[11px] font-bold" style={{ color: LINE }}>
      <span className="inline-flex items-center gap-1">
        <svg width={12} height={12} aria-hidden="true">
          <circle cx={6} cy={6} r={5} fill={BLACK_FILL} stroke={LINE} strokeWidth={1} />
        </svg>
        {t('black', 'hitam')}
      </span>
      <span className="inline-flex items-center gap-1">
        <svg width={12} height={12} aria-hidden="true">
          <circle cx={6} cy={6} r={5} fill={WHITE_FILL} stroke={WHITE_STROKE} strokeWidth={1.4} />
        </svg>
        {t('white', 'putih')}
      </span>
      <span className="inline-flex items-center gap-1" style={{ color: ORANGE }}>
        {t('= focus', '= fokus')}
      </span>
    </div>
  )
}
