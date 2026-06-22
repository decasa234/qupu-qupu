import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TrayPrimitive, PlatePrimitive, COLOR, SVG_W, SVG_H } from './CookieTray22PEIllustration'
import { buildCookieTray22PESteps } from './cookieTray22PESteps'

// IKMC-21-PE-Q22 — post-answer animation.
// Reuses TrayPrimitive and PlatePrimitive from the illustration so the
// animation reads as the static scene coming alive.
//
// Animation beats:
//   0. intro   — static scene with caption.
//   1. tray    — highlight all tray cookies (full tray pattern).
//   2. count   — plate cookie count caption.
//   3. group1  — light tray-1 cookies on the plate (red group).
//   4. group2  — light tray-2 cookies on the plate (blue group).
//   5. group3  — light tray-3 cookies on the plate (green group).
//   6. result  — 3 trays → C (green banner).

const GREEN  = '#10B981'
const RED    = '#DC2626'
const BLUE   = '#2563EB'
const ORANGE = '#f0853a'
const INK    = COLOR.INK

const CAPTION_STYLE_DEFAULT = { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
const CAPTION_STYLE_RESULT  = { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
const CAPTION_STYLE_GROUP: Array<{ background: string; borderColor: string; color: string }> = [
  { background: '#FEE2E2', borderColor: RED,  color: '#991B1B' },
  { background: '#DBEAFE', borderColor: BLUE, color: '#1E3A8A' },
  { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' },
]

export default function CookieTray22PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCookieTray22PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Caption style varies by phase
  const captionStyle = beat.result
    ? CAPTION_STYLE_RESULT
    : beat.phase === 'group1' ? CAPTION_STYLE_GROUP[0]
    : beat.phase === 'group2' ? CAPTION_STYLE_GROUP[1]
    : beat.phase === 'group3' ? CAPTION_STYLE_GROUP[2]
    : CAPTION_STYLE_DEFAULT

  // Equation pill colour
  const equationColor = beat.result
    ? GREEN
    : beat.phase === 'group1' ? RED
    : beat.phase === 'group2' ? BLUE
    : beat.phase === 'group3' ? GREEN
    : INK

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: piring berisi 12 kue; kita cocokkan pola nampan dan temukan 3 kelompok nampan berbeda yang diperlukan. Jawaban: C (3 nampan).'
      : 'Explainer: the plate has 12 cookies; we match tray groups and find 3 separate tray-loads are needed. Answer: C (3 trays).'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* SVG figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* Tray — highlight all cookies on beat 'tray', else nothing */}
          <TrayPrimitive
            litGroup={beat.litTrayIndices}
          />

          {/* Plate — highlight a tray-group */}
          <PlatePrimitive
            litByTray={beat.litPlateGroup}
          />

          {/* Tray label */}
          <text
            x={12 + (SVG_W * 0.4) / 2}
            y={14}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            fill={INK}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {lang === 'id' ? 'Nampan' : 'Tray'}
          </text>

          {/* Plate label */}
          <text
            x={SVG_W * 0.62}
            y={14}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            fill={INK}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {lang === 'id' ? 'Piring' : 'Plate'}
          </text>

          {/* On result beat: show "3 nampan" label over the tray area */}
          <AnimatePresence>
            {beat.result && (
              <motion.text
                key="result-label"
                x={SVG_W * 0.2}
                y={SVG_H - 8}
                textAnchor="middle"
                fontSize={12}
                fontWeight={900}
                fill={GREEN}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                initial={{ opacity: 0, y: SVG_H }}
                animate={{ opacity: 1, y: SVG_H - 8 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                {lang === 'id' ? '× 3 nampan' : '× 3 trays'}
              </motion.text>
            )}
          </AnimatePresence>
        </svg>

        {/* Equation pill */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: equationColor }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

        {/* Result banner */}
        {beat.result && (
          <motion.div
            key="answer-banner"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black"
            style={{ color: ORANGE }}
          >
            {lang === 'id' ? 'Jawaban: C (3)' : 'Answer: C (3)'}
          </motion.div>
        )}

      </div>
    </div>
  )
}
