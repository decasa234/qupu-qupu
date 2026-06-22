/**
 * IKMC-20-EC-Q7 — post-answer explainer: which sticker is opposite the duck?
 *
 * Strategy: any sticker visible alongside the duck in either view cannot be
 * on the opposite face. Four stickers are ruled out; only the fly remains.
 * Answer: E (fly).
 *
 * Beat sequence:
 *   0. intro   — 6 faces → 3 opposite pairs.
 *   1. rule    — same view ≠ opposite.
 *   2. view1   — position 1: duck with mouse + ladybug.
 *   3. view2   — position 2: duck with elephant + dog.
 *   4. deduced — 4 ruled out; fly never shown with duck.
 *   5. result  — duck ↔ fly → answer E.
 *
 * Reuses IsoCubeWithStickers from StickerCube7ECIllustration.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  IsoCubeWithStickers,
  POS1_FACES,
  POS2_FACES,
  C1_OX, C1_OY,
  C2_OX, C2_OY,
  CUBE_H,
  SVG_W,
  SVG_H,
} from './StickerCube7ECIllustration'
import type { AnimalId } from './StickerCube7ECIllustration'
import { buildStickerCube7ECSteps } from './stickerCube7ECSteps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const BLUE       = '#30598A'
const BLUE_BG    = '#E1EFFB'
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const RED        = '#DC2626'
const RED_BG     = '#FEE2E2'
const ORANGE     = '#F59E0B'

// ---------------------------------------------------------------------------
// Animal label pill (for the ruled-out / highlighted row)
// ---------------------------------------------------------------------------

interface AnimalPillProps {
  label: string
  state: 'neutral' | 'highlighted' | 'ruledOut' | 'answer'
}

function AnimalPill({ label, state }: AnimalPillProps) {
  const styles: Record<AnimalPillProps['state'], { bg: string; color: string; border: string; textDecoration: string }> = {
    neutral:     { bg: '#F3F4F6', color: '#6B7280', border: '#D1D5DB', textDecoration: 'none' },
    highlighted: { bg: '#FEF9C3', color: '#92400E', border: ORANGE, textDecoration: 'none' },
    ruledOut:    { bg: RED_BG,    color: RED,        border: RED,    textDecoration: 'line-through' },
    answer:      { bg: GREEN_BG,  color: GREEN_TEXT,  border: GREEN,  textDecoration: 'none' },
  }
  const s = styles[state]

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'inline-block',
        background: s.bg,
        color: s.color,
        border: `1.5px solid ${s.border}`,
        borderRadius: 20,
        padding: '2px 10px',
        fontSize: 12,
        fontWeight: 700,
        fontFamily: 'sans-serif',
        textDecoration: s.textDecoration,
        margin: '2px 3px',
        transition: 'background 0.25s, color 0.25s',
      }}
    >
      {label}
    </motion.span>
  )
}

// ---------------------------------------------------------------------------
// Animal labels (en/id)
// ---------------------------------------------------------------------------

const ANIMAL_LABELS: Record<AnimalId, { en: string; id: string }> = {
  duck:     { en: 'duck',     id: 'bebek'   },
  elephant: { en: 'elephant', id: 'gajah'   },
  mouse:    { en: 'mouse',    id: 'tikus'   },
  ladybug:  { en: 'ladybug',  id: 'kumbang' },
  dog:      { en: 'dog',      id: 'anjing'  },
  fly:      { en: 'fly',      id: 'lalat'   },
}

const ALL_OTHERS: AnimalId[] = ['elephant', 'mouse', 'ladybug', 'dog', 'fly']

// ---------------------------------------------------------------------------
// Main Explainer
// ---------------------------------------------------------------------------

export default function StickerCube7ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildStickerCube7ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.isResult
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG,  borderColor: BLUE,  color: BLUE }

  const ariaLabel = lang === 'id'
    ? 'Penjelasan: Stiker yang tidak pernah muncul bersama bebek dalam tampilan apapun pasti ada di sisi yang berhadapan. Gajah, tikus, kumbang, dan anjing semuanya terlihat bersama bebek. Lalat tidak pernah terlihat bersama bebek, jadi lalat berhadapan dengan bebek. Jawaban E.'
    : 'Explainer: The sticker never seen alongside the duck in any view must be on the opposite face. Elephant, mouse, ladybug, and dog all appear with the duck. The fly never appears with the duck, so the fly is opposite the duck. Answer E.'

  // Determine which faces to highlight in each cube view
  const pos1Highlighted = beat.phase === 'view1'
    ? { top: true, left: true, right: true } // all 3 faces lit up
    : {}
  const pos2Highlighted = beat.phase === 'view2'
    ? { top: true, left: true, right: true }
    : {}

  // Show cube views: only view1, only view2, or both
  const showView1 = beat.view === 1 || beat.view === 0
  const showView2 = beat.view === 2 || beat.view === 0
  const dimView1  = beat.view === 2
  const dimView2  = beat.view === 1

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Cube figure */}
        <div style={{ position: 'relative' }}>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width={SVG_W * 1.4}
            height={SVG_H * 1.4}
            aria-hidden="true"
            style={{ display: 'block', maxWidth: '100%' }}
          >
            {/* Position 1 */}
            <g opacity={dimView1 ? 0.3 : 1} style={{ transition: 'opacity 0.35s' }}>
              {showView1 && (
                <IsoCubeWithStickers
                  ox={C1_OX}
                  oy={C1_OY}
                  faces={POS1_FACES}
                  highlighted={pos1Highlighted}
                />
              )}
              <text
                x={C1_OX + 83 / 2}
                y={C1_OY + CUBE_H + 16}
                textAnchor="middle"
                fontSize={11}
                fontFamily="sans-serif"
                fontWeight="600"
                fill="#4B5563"
              >
                {lang === 'id' ? 'Posisi 1' : 'Position 1'}
              </text>
            </g>

            {/* Position 2 */}
            <g opacity={dimView2 ? 0.3 : 1} style={{ transition: 'opacity 0.35s' }}>
              {showView2 && (
                <IsoCubeWithStickers
                  ox={C2_OX}
                  oy={C2_OY}
                  faces={POS2_FACES}
                  highlighted={pos2Highlighted}
                />
              )}
              <text
                x={C2_OX + 83 / 2}
                y={C2_OY + CUBE_H + 16}
                textAnchor="middle"
                fontSize={11}
                fontFamily="sans-serif"
                fontWeight="600"
                fill="#4B5563"
              >
                {lang === 'id' ? 'Posisi 2' : 'Position 2'}
              </text>
            </g>
          </svg>
        </div>

        {/* "Not opposite duck" animal pill row */}
        <div className="flex flex-wrap justify-center gap-1 px-2">
          {ALL_OTHERS.map((animal) => {
            const label = ANIMAL_LABELS[animal][lang]
            const isHighlighted = beat.highlighted.includes(animal)
            const isRuledOut    = beat.ruledOut.includes(animal)
            const isAnswerAnimal = animal === 'fly' && isResult

            const state: AnimalPillProps['state'] =
              isAnswerAnimal ? 'answer'
              : isRuledOut ? 'ruledOut'
              : isHighlighted ? 'highlighted'
              : 'neutral'

            return <AnimalPill key={animal} label={label} state={state} />
          })}
        </div>

        {/* Chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.chip !== '' && (
              <motion.span
                key={beat.chip}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.chip}
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
