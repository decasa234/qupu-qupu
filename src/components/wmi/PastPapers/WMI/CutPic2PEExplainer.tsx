/**
 * IKMC-22-PE-Q2 — post-answer explainer.
 *
 * Shows the original mushroom with a dashed cut line, cycles through options
 * A–D (eliminated) one by one, then highlights option E as correct.
 *
 * Reuses CutPic2PEIllustration (stem SVG) and CutPic2PEOption (choice panels)
 * from CutPic2PEIllustration.tsx.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import CutPic2PEIllustration, { CutPic2PEOption } from './CutPic2PEIllustration'
import { buildCutPic2PESteps } from './cutPic2PESteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_TXT = '#065F46'
const RED       = '#EF4444'
const RED_BG    = '#FEE2E2'

// ── option badge ──────────────────────────────────────────────────────────────

function OptionBadge({
  label,
  result,
  eliminated,
}: {
  label: string
  result: boolean
  eliminated: boolean
}) {
  if (!label) return null

  const borderColor = result ? GREEN : eliminated ? RED : '#F59E0B'
  const bg          = result ? GREEN_BG : eliminated ? RED_BG : '#FFF7ED'
  const textColor   = result ? GREEN_TXT : eliminated ? '#991B1B' : '#92400E'

  const syntheticChoice = { label, text: label }

  return (
    <motion.div
      key={`opt-${label}-${result}-${eliminated}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="flex items-center gap-2 rounded-xl border-2 px-3 py-1.5"
      style={{ borderColor, background: bg }}
    >
      <span className="font-display text-sm font-extrabold" style={{ color: textColor }}>
        {label}
      </span>
      <CutPic2PEOption choice={syntheticChoice} />
      {result && (
        <span className="font-display text-sm font-extrabold" style={{ color: GREEN_TXT }}>
          ✓
        </span>
      )}
      {eliminated && (
        <span className="font-display text-sm font-extrabold" style={{ color: '#991B1B' }}>
          ✗
        </span>
      )}
    </motion.div>
  )
}

// ── main explainer ────────────────────────────────────────────────────────────

export default function CutPic2PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildCutPic2PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: gambar jamur dipotong secara vertikal. Pilihan A, B, C, D salah karena potongannya tidak membentuk gambar asli. Hanya pilihan E yang menunjukkan setengah kiri dan setengah kanan yang menyatu dengan benar. Jawaban E.'
      : 'Explainer: the mushroom picture is cut vertically. Options A, B, C, D are wrong because the pieces do not rejoin into the original. Only option E shows a correct left half and right half that fit together. Answer E.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Stem illustration (with or without the cut line highlighted) */}
        <div className={beat.showCut ? 'opacity-100' : 'opacity-80'} style={{ width: '100%' }}>
          <CutPic2PEIllustration />
        </div>

        {/* Option badge for the current choice being checked */}
        <AnimatePresence mode="wait">
          {beat.option && (
            <OptionBadge
              key={`${beat.option}-${beat.result}-${beat.eliminated}`}
              label={beat.option}
              result={beat.result}
              eliminated={beat.eliminated}
            />
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
