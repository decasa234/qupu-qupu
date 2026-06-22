import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Mushrooms8PEScene } from './Mushrooms8PEIllustration'
import {
  buildMushrooms8PESteps,
  MUSHROOMS_8_PE_ANSWER,
  MUSHROOMS_8_PE_CHOICE,
} from './mushrooms8PESteps'

// IKMC-21-PE-Q8 — post-answer animation for the two-mushroom height difference.
//
// Reuses the Mushrooms8PEScene primitive (ruler + two mushrooms) so the
// animation reads as the static figure coming alive.
//
// Animation beats:
//   0. intro    — static scene; prompt to read the ruler.
//   1. tall     — bracket the tall mushroom; label height = 11.
//   2. short    — bracket the short mushroom; label height = 6.
//   3. subtract — show the difference bracket; equation 11 − 6 = 5.
//   4. result   — 5 → B (green).

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function Mushrooms8PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildMushrooms8PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: jamur kiri setinggi ${story.tallHeight}, jamur kanan setinggi ${story.shortHeight}. Selisih = ${story.tallHeight} − ${story.shortHeight} = ${story.answer}. Jawaban ${MUSHROOMS_8_PE_CHOICE}.`
      : `Explainer: left mushroom height ${story.tallHeight}, right mushroom height ${story.shortHeight}. Difference = ${story.tallHeight} − ${story.shortHeight} = ${story.answer}. Answer ${MUSHROOMS_8_PE_CHOICE}.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* phase label */}
        <div
          className="font-display text-xs font-extrabold uppercase tracking-wide"
          style={{ color: beat.result ? GREEN : BLUE }}
        >
          {beat.result
            ? T('Difference found!', 'Selisih ditemukan!')
            : beat.phase === 'intro'
              ? T('Read the ruler', 'Baca penggaris')
              : beat.phase === 'tall'
                ? T('Tall mushroom height', 'Tinggi jamur tinggi')
                : beat.phase === 'short'
                  ? T('Short mushroom height', 'Tinggi jamur pendek')
                  : T('Calculate the difference', 'Hitung selisihnya')}
        </div>

        {/* animated scene */}
        <motion.div
          key={beat.phase}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <Mushrooms8PEScene
            showTallBracket={beat.showTallBracket}
            showShortBracket={beat.showShortBracket}
            showDiffBracket={beat.showDiffBracket}
          />
        </motion.div>

        {/* equation strip */}
        {beat.equation ? (
          <motion.div
            key={`eq-${beat.phase}`}
            className="flex items-center justify-center rounded-lg px-4 py-1 font-display text-base font-extrabold"
            style={
              beat.result
                ? { background: GREEN, color: '#fff' }
                : { background: BLUE, color: '#fff' }
            }
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            {beat.equation}
          </motion.div>
        ) : null}

        {/* caption */}
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

export { MUSHROOMS_8_PE_ANSWER }
