/**
 * IKMC-22-PE-Q19 — post-answer explainer: sticker stacking order.
 *
 * Ann has 4 stickers (circle, square, star, triangle).
 * Required sticking order: square → star → triangle (circle anywhere).
 * Later sticker appears ON TOP of earlier ones where they overlap.
 * Answer: E — triangle covers star, star covers square.
 *
 * Animation beats:
 *   0. intro    — all 4 stickers; state the task.
 *   1. rule1    — "star after square" → star on top at overlaps.
 *   2. rule2    — "star before triangle" → triangle on top at overlaps.
 *   3. combined — full order: square → star → triangle.
 *   4. check    — verify option E matches.
 *   5. result   — answer is E.
 *
 * Reuses CircleSticker / SquareSticker / StarSticker / TriangleSticker
 * from Stickers19PEIllustration so the animation reads as the same scene.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CircleSticker,
  SquareSticker,
  StarSticker,
  TriangleSticker,
  C_RED,
  C_GREEN,
  C_YELLOW,
  C_BLUE,
} from './Stickers19PEIllustration'
import { buildStickers19PESteps } from './stickers19PESteps'

// ── Colour tokens ─────────────────────────────────────────────────────────────

const GREEN       = '#10B981'
const GREEN_BG    = '#D1FAE5'
const GREEN_TEXT  = '#065F46'
const BLUE_BG     = '#E1EFFB'
const BLUE_DARK   = '#30598A'
const INK         = '#1F2937'
const RING_COLOR  = '#F97316' // qupu brand orange ring for highlights

// ── Single sticker preview panel ──────────────────────────────────────────────

type StickerType = 'circle' | 'square' | 'star' | 'triangle'

const STICKER_LABELS_EN: Record<StickerType, string> = {
  circle:   'Circle',
  square:   'Square',
  star:     'Star',
  triangle: 'Triangle',
}

const STICKER_LABELS_ID: Record<StickerType, string> = {
  circle:   'Lingkaran',
  square:   'Persegi',
  star:     'Bintang',
  triangle: 'Segitiga',
}

const STICKER_COLOR: Record<StickerType, string> = {
  circle:   C_RED,
  square:   C_GREEN,
  star:     C_YELLOW,
  triangle: C_BLUE,
}

interface StickerPanelProps {
  type: StickerType
  active: boolean
  lang: 'en' | 'id'
}

function StickerPanel({ type, active, lang }: StickerPanelProps) {
  const label = lang === 'id' ? STICKER_LABELS_ID[type] : STICKER_LABELS_EN[type]
  const color = STICKER_COLOR[type]

  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${active ? RING_COLOR : '#D1D5DB'}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: '#fff',
        minWidth: 60,
      }}
    >
      <svg
        viewBox="0 0 60 60"
        width={52}
        height={52}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {type === 'circle'   && <CircleSticker   cx={30} cy={30} r={22} />}
        {type === 'square'   && <SquareSticker   cx={30} cy={30} half={22} />}
        {type === 'star'     && <StarSticker     cx={30} cy={30} r={24} />}
        {type === 'triangle' && <TriangleSticker cx={30} cy={30} r={24} />}
      </svg>
      <span
        className="font-display text-[11px] font-bold"
        style={{ color: active ? color : INK }}
      >
        {label}
      </span>
    </motion.div>
  )
}

// ── "Option E" mini-preview — the correct answer arrangement ──────────────────
//
// Shows square (bottom) → star (middle) → triangle (top), circle peeking.
// Drawn in a 100×100 viewBox matching OPTION_LAYERS['E'].

function OptionEPreview() {
  return (
    <svg
      viewBox="0 0 100 100"
      width={90}
      height={90}
      aria-label="Option E: correct sticker arrangement"
      style={{ display: 'block', background: '#F9FAFB', borderRadius: 8, border: `2px solid ${GREEN}` }}
    >
      {/* Layer 1 (bottom): circle — peeking at top-left */}
      <CircleSticker cx={24} cy={38} r={20} />
      {/* Layer 2: square */}
      <SquareSticker cx={38} cy={65} half={24} />
      {/* Layer 3: star on top of square */}
      <StarSticker cx={48} cy={52} r={26} />
      {/* Layer 4 (top): triangle on top of star */}
      <TriangleSticker cx={56} cy={40} r={32} />
    </svg>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

const STICKER_ORDER: StickerType[] = ['circle', 'square', 'star', 'triangle']

export default function Stickers19PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildStickers19PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE_DARK, color: BLUE_DARK }

  const activeSet = new Set(beat.highlight)
  const showOptionE = beat.phase === 'check' || beat.phase === 'result'

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: urutan menempel harus persegi → bintang → segitiga. Stiker yang ditempel terakhir berada di atas. Hanya gambar E yang cocok. Jawaban E.'
      : 'Explainer: sticking order must be square → star → triangle. Later sticker is on top. Only picture E matches. Answer E.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Four sticker panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {STICKER_ORDER.map((type) => (
            <StickerPanel
              key={type}
              type={type}
              active={activeSet.has(type)}
              lang={lang}
            />
          ))}
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
                style={{ background: isResult ? GREEN : BLUE_DARK }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Option E preview (shown on check + result beats) */}
        <AnimatePresence>
          {showOptionE && (
            <motion.div
              key="option-e"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="flex flex-col items-center gap-1"
            >
              <OptionEPreview />
              <span
                className="font-display text-xs font-bold"
                style={{ color: GREEN }}
              >
                {lang === 'id' ? 'Gambar E' : 'Picture E'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

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
