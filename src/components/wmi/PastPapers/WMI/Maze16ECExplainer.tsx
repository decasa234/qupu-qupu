// IKMC-23-EC-Q16 explainer — animated beat-by-beat walkthrough of Sam's path
// through the two-storey maze. Adapted from Maze20PEExplainer.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Maze16EC } from './Maze16ECIllustration'
import { buildMaze16ECSteps } from './maze16ECSteps'

// Palette
const ORANGE = '#F59E0B'
const BLUE = '#30598A'
const GREEN = '#10B981'

// Sticker encounter order for answer A
const STICKER_ORDER = ['🐸', '🐗', '🦈'] as const

const STICKER_NAMES_EN: Record<string, string> = {
  '🐸': 'frog',
  '🐗': 'boar',
  '🦈': 'shark',
}
const STICKER_NAMES_ID: Record<string, string> = {
  '🐸': 'katak',
  '🐗': 'babi hutan',
  '🦈': 'hiu',
}

export default function Maze16ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(
    () => buildMaze16ECSteps(props.correctAnswer, lang),
    [props.correctAnswer, lang],
  )
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const accent = beat.result ? GREEN : beat.phase === 'intro' ? BLUE : ORANGE

  const stickerNames =
    lang === 'id'
      ? STICKER_ORDER.map((g) => STICKER_NAMES_ID[g]).join(', ')
      : STICKER_ORDER.map((g) => STICKER_NAMES_EN[g]).join(', ')

  const ariaLabel = t(
    `Explainer: Sam walks through a two-storey maze. She climbs the right stair to find the frog, descends to find the boar on the ground floor, then climbs the left stair to find the shark. Sticker order: ${stickerNames}. Answer A.`,
    `Penjelasan: Sam berjalan melalui labirin dua lantai. Ia naik tangga kanan menemukan katak, turun menemukan babi hutan di lantai dasar, lalu naik tangga kiri menemukan hiu. Urutan stiker: ${stickerNames}. Jawaban A.`,
  )

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The maze with the current path segment lit. */}
        <Maze16EC litPath={beat.litPath} />

        {/* Sticker-found rail: 3 slots that fill in as Sam finds each sticker. */}
        <div className="flex w-full items-stretch justify-center gap-2">
          {STICKER_ORDER.map((glyph, i) => {
            const isFound = beat.found.includes(glyph)
            const isCurrent = beat.found[beat.found.length - 1] === glyph && !beat.result
            const color = !isFound ? '#D1D5DB' : beat.result ? GREEN : ORANGE
            return (
              <StickerSlot
                key={glyph}
                glyph={glyph}
                index={i + 1}
                found={isFound}
                active={isCurrent}
                color={color}
                result={beat.result}
              />
            )
          })}
        </div>

        {/* Running "found so far" sequence during progress beats. */}
        {beat.phase !== 'intro' && (
          <motion.div
            key={`found-${beat.found.length}-${beat.result ? 'r' : 'p'}-${index}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 480, damping: 22 }}
            className="flex items-center gap-1.5 font-display text-xl font-black"
            style={{ color: accent }}
          >
            {beat.found.map((g, i) => (
              <span key={i}>
                {g}
                {i < beat.found.length - 1 && (
                  <span className="mx-0.5 text-base">→</span>
                )}
              </span>
            ))}
          </motion.div>
        )}

        {/* Caption box */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.phase === 'intro'
                ? { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
                : { background: '#FFF1E6', borderColor: ORANGE, color: '#9a4a12' }
          }
        >
          {beat.caption}
        </motion.div>

        {/* Result label */}
        {beat.result && (
          <motion.div
            key="result-label"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
            className="font-display text-lg font-black"
            style={{ color: GREEN }}
          >
            {t('Answer A', 'Jawaban A')}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// -------------------------------------------------------- StickerSlot -------

function StickerSlot({
  glyph,
  index,
  found,
  active,
  color,
  result,
}: {
  glyph: string
  index: number
  found: boolean
  active: boolean
  color: string
  result: boolean
}) {
  return (
    <motion.div
      animate={{ scale: active ? 1.08 : 1, opacity: found ? 1 : 0.45 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="flex flex-1 flex-col items-center gap-0.5 rounded-xl border-2 px-1 py-1.5"
      style={{
        borderColor: color,
        background: result && found ? '#ECFDF5' : '#FFFFFF',
      }}
    >
      <span className="text-xl leading-none" aria-hidden>
        {found ? glyph : '?'}
      </span>
      <span
        className="font-display text-[10px] font-black uppercase tracking-wide"
        style={{ color }}
      >
        {index}
      </span>
    </motion.div>
  )
}
