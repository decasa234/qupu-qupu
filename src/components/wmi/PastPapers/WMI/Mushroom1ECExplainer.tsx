/**
 * IKMC-20-EC-Q1 — post-answer explainer: which photo was taken on Tuesday?
 *
 * Strategy: sort the five mushroom photos by size (smallest to largest) to
 * recover the Mon–Fri order, then read off day 2 (Tuesday) → option E.
 *
 * Animation beats (buildMushroom1ECSteps):
 *   0. intro   — mushroom grows every day; 5 photos.
 *   1. order   — rank B < E < C < D < A (day 1–5 mapped).
 *   2. tuesday — Day 2 = second-smallest → E is spotlit.
 *   3. result  — E highlighted green as the answer.
 *
 * Reuses MushroomSVG and SHAPES from Mushroom1ECIllustration so the panels
 * match the option renderer exactly.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MushroomSVG, SHAPES } from './Mushroom1ECIllustration'
import { buildMushroom1ECSteps } from './mushroom1ECSteps'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const ORANGE = '#F59E0B'
const ORANGE_BG = '#FFF7ED'
const INK = '#1F2937'
const GREY_BORDER = '#D1D5DB'

// ── Size-rank order (smallest → largest) ─────────────────────────────────────
// Used for the "order" beat label row and for determining which panels to show.
const SIZE_ORDER: ReadonlyArray<'A' | 'B' | 'C' | 'D' | 'E'> = ['B', 'E', 'C', 'D', 'A']
const DAY_LABELS: Record<string, { en: string; id: string }> = {
  B: { en: 'Mon', id: 'Sen' },
  E: { en: 'Tue ✓', id: 'Sel ✓' },
  C: { en: 'Wed', id: 'Rab' },
  D: { en: 'Thu', id: 'Kam' },
  A: { en: 'Fri', id: 'Jum' },
}

// ── MushroomPanel ─────────────────────────────────────────────────────────────

interface PanelProps {
  label: 'A' | 'B' | 'C' | 'D' | 'E'
  showRank: boolean
  rank: number  // 1-based
  isSpotlit: boolean
  isAnswer: boolean
  lang: 'en' | 'id'
}

function MushroomPanel({ label, showRank, rank, isSpotlit, isAnswer, lang }: PanelProps) {
  const shape = SHAPES[label]
  if (!shape) return null

  let borderColor = GREY_BORDER
  if (isSpotlit && isAnswer) borderColor = GREEN
  else if (isSpotlit) borderColor = ORANGE

  const dayLabel = DAY_LABELS[label]?.[lang] ?? ''

  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: '#fff',
        minWidth: 60,
      }}
    >
      <MushroomSVG shape={shape} size={52} />
      {/* Option letter */}
      <span
        className="font-display text-xs font-bold"
        style={{ color: isSpotlit && isAnswer ? GREEN : isSpotlit ? ORANGE : INK }}
      >
        {label}
      </span>
      {/* Rank / day badge */}
      <AnimatePresence>
        {showRank && (
          <motion.div
            key={`rank-${label}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded px-1 py-0.5 text-center font-display text-[10px] font-bold"
            style={{
              background: isAnswer && isSpotlit ? GREEN_BG : isSpotlit ? ORANGE_BG : '#F3F4F6',
              color: isAnswer && isSpotlit ? GREEN_TEXT : isSpotlit ? '#92400E' : '#374151',
              border: `1.5px solid ${isAnswer && isSpotlit ? GREEN : isSpotlit ? ORANGE : GREY_BORDER}`,
            }}
          >
            {lang === 'id' ? `Hari ${rank}` : `Day ${rank}`}
            {showRank && isSpotlit && (
              <span style={{ marginLeft: 3 }}>
                {isSpotlit ? ` · ${dayLabel}` : ''}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function Mushroom1ECExplainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'

  const story = useMemo(() => buildMushroom1ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Urutkan foto dari terkecil ke terbesar: B→E→C→D→A = Sen→Sel→Rab→Kam→Jum. Selasa = hari ke-2 = foto E. Jawaban E.'
      : 'Explainer: Sort photos smallest to largest: B→E→C→D→A = Mon→Tue→Wed→Thu→Fri. Tuesday = day 2 = photo E. Answer E.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five mushroom panels in size order */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {SIZE_ORDER.map((label, i) => {
            const rank = i + 1  // 1=Mon … 5=Fri
            const isSpotlit = beat.spotlit === label
            const isAnswer = label === 'E' && beat.showAnswer
            return (
              <MushroomPanel
                key={label}
                label={label}
                showRank={beat.showRanks}
                rank={rank}
                isSpotlit={isSpotlit}
                isAnswer={isAnswer}
                lang={lang}
              />
            )
          })}
        </div>

        {/* Equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
