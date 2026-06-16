import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { HouseFigure22 } from './P22G1Q11Illustration'
import { buildP22G1Q11Steps } from './p22G1Q11Steps'

// qupu colour tokens.
const ORANGE = '#f0853a'
const BLUE = '#30598a'
const GREEN = '#10B981'

// Tone -> swatch for the chip.
const TONE_SWATCH: Record<string, string> = {
  dark: '#4b4b4b',
  grey: '#c4c4c4',
  white: '#ffffff',
}
const TONE_WORD = (tone: string, lang: 'en' | 'id') => {
  if (lang === 'id') return tone === 'dark' ? 'GELAP' : tone === 'grey' ? 'ABU-ABU' : 'PUTIH'
  return tone === 'dark' ? 'DARK' : tone === 'grey' ? 'GREY' : 'WHITE'
}

export default function P22G1Q11Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answerLetter = (props.correctAnswer || 'C').trim().toUpperCase()
  const story = useMemo(() => buildP22G1Q11Steps(lang, answerLetter), [lang, answerLetter])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const revealed = useMemo(() => new Set(beat.revealed), [beat.revealed])

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: warnai tiap bagian sesuai nilainya dibanding 8; hasil pewarnaan adalah pilihan ${answerLetter}.`
      : `Explainer: colour each region by comparing its value to 8; the resulting colouring is option ${answerLetter}.`

  return (
    <div className="mx-auto w-full max-w-[470px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <HouseFigure22 coloured revealed={revealed} active={null} showExpr />

        {/* tone chip while colouring, or the answer letter on the result beat */}
        <AnimatePresence mode="wait">
          {beat.result ? (
            <motion.div
              key="answer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="font-display text-2xl font-black"
              style={{ color: GREEN }}
            >
              {lang === 'id' ? 'Pilihan' : 'Option'} {answerLetter}
            </motion.div>
          ) : beat.tone != null ? (
            <motion.div
              key={`tone-${index}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              className="flex items-center gap-2 font-display text-lg font-black"
              style={{ color: ORANGE }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  background: TONE_SWATCH[beat.tone],
                  border: '2px solid #2B2622',
                }}
              />
              {TONE_WORD(beat.tone, lang)}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.tone != null
                ? { background: '#FFFFFF', borderColor: ORANGE, color: ORANGE }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
