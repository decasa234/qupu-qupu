// IKMC-23-EC-Q17 — post-answer explainer.
//
// Reuses AnimalGlyph + constants from AnimalLine17ECIllustration.
//
// Animation beats (see animalLine17ECSteps.ts):
//   0. intro   — static scene; state the challenge.
//   1. rule    — explain the "every 3" spacing constraint.
//   2. try36   — reveal kangaroos at positions 3 & 6 in purple.
//   3–8. check1–6 — sweep each window (1–3)…(6–8), flash green when it passes.
//   9. result  — all 6 windows confirmed; position 3 = answer C.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  AnimalGlyph,
  SVG_W,
  SVG_H,
  ANIMAL_CX,
  GROUND_Y,
  R,
  COLOR,
} from './AnimalLine17ECIllustration'
import { buildAnimalLine17ECSteps } from './animalLine17ECSteps'

const GREEN  = '#10B981'
const VIOLET = '#7C3AED'
const AMBER  = '#F59E0B'

const FIG_W = Math.min(520, SVG_W)

// ── Window highlight bracket ──────────────────────────────────────────────────

function WindowBracket({
  start,
  end,
  ok,
}: {
  start: number
  end: number
  ok: boolean
}) {
  const cx1 = ANIMAL_CX[start]
  const cx2 = ANIMAL_CX[end]
  const cy = GROUND_Y - R - 4
  const pad = R + 6
  const x1 = cx1 - pad
  const x2 = cx2 + pad
  const bracketY = cy - R - 10
  const h = 8
  const color = ok ? GREEN : AMBER

  return (
    <g>
      {/* horizontal top bar */}
      <line
        x1={x1}
        y1={bracketY}
        x2={x2}
        y2={bracketY}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* left tick */}
      <line
        x1={x1}
        y1={bracketY}
        x2={x1}
        y2={bracketY + h}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* right tick */}
      <line
        x1={x2}
        y1={bracketY}
        x2={x2}
        y2={bracketY + h}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* check / ? label */}
      <text
        x={(x1 + x2) / 2}
        y={bracketY - 4}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={12}
        fontWeight={900}
        fill={color}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {ok ? '✓' : '?'}
      </text>
    </g>
  )
}

// ── Pass-count tally badge ────────────────────────────────────────────────────

function TallyBadge({ count, lang }: { count: number; lang: 'en' | 'id' }) {
  const label =
    lang === 'id'
      ? `${count}/6 jendela ✓`
      : `${count}/6 windows ✓`
  const w = lang === 'id' ? 100 : 96
  return (
    <g>
      <rect
        x={SVG_W / 2 - w / 2}
        y={4}
        width={w}
        height={20}
        rx={10}
        fill={GREEN}
      />
      <text
        x={SVG_W / 2}
        y={14}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={900}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function AnimalLine17ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildAnimalLine17ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#EDE9FE', borderColor: VIOLET, color: '#4C1D95' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 8 hewan dalam barisan; kanguru di posisi 3 dan 6 memenuhi setiap jendela 3 hewan berurutan. Jawaban C (posisi 3).'
      : 'Explainer: 8 animals in a line; kangaroos at positions 3 and 6 satisfy every window of 3 consecutive animals. Answer C (position 3).'

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block', maxWidth: '100%' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

          {/* window bracket */}
          <AnimatePresence>
            {beat.window !== null && (
              <motion.g
                key={`win-${beat.window[0]}-${beat.window[1]}`}
                initial={{ opacity: 0, scaleX: 0.6 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              >
                <WindowBracket
                  start={beat.window[0]}
                  end={beat.window[1]}
                  ok={beat.windowOk}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* animals */}
          {ANIMAL_CX.map((_, i) => {
            const isKangaroo = beat.kangarooHighlight.includes(i)
            const stroke = isKangaroo ? VIOLET : undefined
            return (
              <AnimatePresence key={i}>
                <motion.g
                  key={`animal-${i}-${isKangaroo}`}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <AnimalGlyph
                    index={i}
                    isKangaroo={isKangaroo}
                    strokeOverride={stroke}
                  />
                </motion.g>
              </AnimatePresence>
            )
          })}

          {/* tally badge */}
          <AnimatePresence>
            {beat.passCount > 0 && (
              <motion.g
                key={`tally-${beat.passCount}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 18 }}
              >
                <TallyBadge count={beat.passCount} lang={lang} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* answer chip on result beat */}
          {isResult && (
            <text
              x={SVG_W - 12}
              y={12}
              textAnchor="end"
              dominantBaseline="hanging"
              fontSize={14}
              fontWeight={900}
              fill={GREEN}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              C ✓
            </text>
          )}
        </svg>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
