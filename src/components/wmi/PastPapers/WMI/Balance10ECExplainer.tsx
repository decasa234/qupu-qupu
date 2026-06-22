import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Balance10EC } from './Balance10ECIllustration'
import { buildBalance10ECSteps } from './balance10ECSteps'

// Palette — EC house style
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'

export default function Balance10ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBalance10ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: Total 6 beban = 21 kg. Agar seimbang, (21 − disisihkan) harus genap, jadi disisihkan harus ganjil (1, 3, atau 5). Beban 5 sudah di timbangan. Disisihkan 3 tidak mungkin. Disisihkan 1: sisa 20, setiap sisi 10 — kiri 5+2+3=10, kanan 6+4=10. Jawaban A.`
      : `Explainer: All 6 weights sum to 21 kg. For balance (21 − aside) must be even, so aside must be odd: 1, 3, or 5. The 5 is on the scale. Aside=3 fails. Aside=1 works: each side 10 (left 5+2+3, right 6+4). Answer A.`

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* equation badge */}
        {beat.equation ? (
          <motion.div
            key={`eq-${index}`}
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="rounded-full px-5 py-1 text-sm font-extrabold tabular-nums"
            style={
              beat.result
                ? { background: GREEN, color: '#FFFFFF' }
                : { background: '#FFFFFF', border: `2px solid ${BLUE}`, color: BLUE }
            }
          >
            {beat.equation}
          </motion.div>
        ) : (
          <div className="h-8" />
        )}

        {/* scale illustration with animated highlight state */}
        <motion.div
          key={`scale-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26 }}
          className="w-full"
        >
          <Balance10EC
            highlightLeft={beat.highlightLeft}
            highlightRight={beat.highlightRight}
            highlightAside={beat.highlightAside}
          />
        </motion.div>

        {/* caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="min-h-[44px] w-full max-w-[480px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
