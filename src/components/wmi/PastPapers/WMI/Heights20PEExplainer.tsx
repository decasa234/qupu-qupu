import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Heights20PEArrowDiagram, type PersonName } from './Heights20PEIllustration'
import {
  buildHeights20PESteps,
  HEIGHTS_20_PE_ANSWER,
  HEIGHTS_20_PE_CHOICE,
} from './heights20PESteps'

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function Heights20PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildHeights20PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: telusuri diagram panah untuk menemukan orang tanpa panah keluar. B lebih tinggi dari A dan C; A lebih tinggi dari E dan D; E lebih tinggi dari D; F lebih tinggi dari D dan C. C tidak memiliki panah keluar — C paling pendek. Jawaban ${HEIGHTS_20_PE_CHOICE}.`
      : `Explainer: trace the arrow diagram to find who has no outgoing arrows. B is taller than A and C; A is taller than E and D; E is taller than D; F is taller than D and C. C has no outgoing arrows — C is shortest. Answer ${HEIGHTS_20_PE_CHOICE}.`

  const highlightSet = new Set<PersonName>(beat.highlight)

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Phase label */}
        <div
          className="font-display text-xs font-extrabold uppercase tracking-wide"
          style={{ color: BLUE }}
        >
          {beat.result
            ? T('Shortest found!', 'Terpendek ditemukan!')
            : beat.phase === 'intro'
              ? T('Arrow rule', 'Aturan panah')
              : beat.phase === 'example'
                ? T('Example arrow: B → A', 'Contoh panah: B → A')
                : T(`Clue: ${beat.highlight.join(' → ')}`, `Petunjuk: ${beat.highlight.join(' → ')}`)}
        </div>

        {/* Arrow diagram — animated per beat */}
        <motion.div
          key={beat.phase}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <Heights20PEArrowDiagram
            highlight={highlightSet}
            shortestRevealed={beat.shortestRevealed}
          />
        </motion.div>

        {/* Highlight chips */}
        {beat.highlight.length > 0 && !beat.result ? (
          <motion.div
            key={`chips-${beat.phase}`}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            {beat.highlight.map((name, i) => (
              <motion.div
                key={name}
                className="flex h-8 items-center justify-center rounded-lg px-3 font-display text-sm font-extrabold text-white"
                style={{ background: '#F59E0B' }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * i, type: 'spring', stiffness: 300, damping: 18 }}
              >
                {name}
              </motion.div>
            ))}
          </motion.div>
        ) : null}

        {/* Result strip */}
        {beat.result ? (
          <motion.div
            key="result-strip"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            <span
              className="flex h-9 items-center justify-center rounded-lg px-4 font-display text-base font-extrabold"
              style={{ background: GREEN, color: '#fff' }}
            >
              {T('Person C = SHORTEST', 'Orang C = TERPENDEK')}
            </span>
          </motion.div>
        ) : null}

        {/* Caption */}
        <div
          className="min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}

export { HEIGHTS_20_PE_ANSWER }
