// IKMC-23-PE-Q20 explainer — animated beat-by-beat walkthrough of Sam's path
// through the two-storey maze. Adapated from AnimalMaze24G1Explainer.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Maze20PE } from './Maze20PEIllustration'
import { buildMaze20PESteps } from './maze20PESteps'

// Palette
const ORANGE = '#F59E0B'   // QUPU accent (maze trail, sticker slots)
const BLUE = '#30598A'     // intro beat
const GREEN = '#10B981'    // result beat

// The three stickers in encounter order (answer B)
const STICKER_ORDER = ['🦈', '🐗', '🐸'] as const

// Names for aria-label
const STICKER_NAMES_EN: Record<string, string> = {
  '🦈': 'shark',
  '🐗': 'boar',
  '🐸': 'frog',
}
const STICKER_NAMES_ID: Record<string, string> = {
  '🦈': 'hiu',
  '🐗': 'babi hutan',
  '🐸': 'katak',
}

export default function Maze20PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(
    () => buildMaze20PESteps(props.correctAnswer, lang),
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
    `Explainer: Sam walks through a two-storey maze. She goes to Floor 2 first and finds the shark, then the boar, then returns to Floor 1 for the frog. Sticker order: ${stickerNames}. Answer B.`,
    `Penjelasan: Sam berjalan melalui labirin dua lantai. Ia naik ke Lantai 2 dan menemukan hiu, lalu babi hutan, lalu kembali ke Lantai 1 untuk katak. Urutan stiker: ${stickerNames}. Jawaban B.`,
  )

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The maze coming alive: trace the current path segment. */}
        <Maze20PE litPath={beat.litPath} />

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

        {/* Running "found so far" count during progress beats. */}
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
            {t('Answer B', 'Jawaban B')}
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
