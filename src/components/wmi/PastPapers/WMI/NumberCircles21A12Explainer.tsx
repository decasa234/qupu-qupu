// SEAMO-21-A-Q12 Explainer
//
// Animates the solution beat by beat:
//   1. Show all 9 circles (neutral)
//   2. Amber all — reveal the total 429
//   3. Show the gap: 429 − 400 = 29
//   4. Green the 8 used, cross out 29 → Answer E

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NUMBERS, SVG_W, SVG_H, NODE_R } from './NumberCircles21A12Illustration'
import {
  buildNumberCircles21A12Steps,
  ANSWER_CHOICE,
  LEFT_OUT,
} from './numberCircles21A12Steps'
import type { NodeHighlight } from './numberCircles21A12Steps'

// ── Colour tokens ─────────────────────────────────────────────────────────────

const BLUE   = '#30598A'
const AMBER  = '#D97706'
const GREEN  = '#059669'
const CROSS  = '#DC2626' // red for the left-out number
const WHITE  = '#FFFFFF'
const INK    = '#1F2937'
const STROKE = '#30598A'

// ── Helpers ───────────────────────────────────────────────────────────────────

function nodeColors(state: NodeHighlight): { fill: string; stroke: string; text: string } {
  switch (state) {
    case 'amber':   return { fill: '#FEF3C7', stroke: AMBER,  text: '#92400E' }
    case 'green':   return { fill: '#D1FAE5', stroke: GREEN,  text: '#065F46' }
    case 'crossed': return { fill: '#FEE2E2', stroke: CROSS,  text: CROSS    }
    default:        return { fill: WHITE,     stroke: STROKE, text: INK      }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NumberCircles21A12Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildNumberCircles21A12Steps(lang), [lang])

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: sum all 9 numbers to get 429; subtract Susan's 400 to find the left-out number ${LEFT_OUT}. Answer ${ANSWER_CHOICE}.`,
    `Penjelasan: jumlahkan 9 bilangan untuk mendapat 429; kurangi 400 milik Susan untuk menemukan bilangan yang dihilangkan ${LEFT_OUT}. Jawaban ${ANSWER_CHOICE}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Strategy banner */}
        <div
          className="rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t("Sum all 9, then subtract Susan’s total", 'Jumlahkan semua 9, lalu kurangi jumlah Susan')}
        </div>

        {/* Number circles — coloured per beat state */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(SVG_W, 300)}
          aria-hidden="true"
          style={{ display: 'block' }}
        >
          {NUMBERS.map((n) => {
            const state: NodeHighlight = beat.nodeStates[n.id] ?? 'default'
            const col = nodeColors(state)
            const isCrossed = state === 'crossed'
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={NODE_R}
                  fill={col.fill}
                  stroke={col.stroke}
                  strokeWidth={2.4}
                />
                <text
                  x={n.x}
                  y={n.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={NODE_R * 0.78}
                  fontWeight={700}
                  fill={col.text}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {n.value}
                </text>
                {/* Strikethrough line for the left-out number */}
                {isCrossed && (
                  <line
                    x1={n.x - NODE_R + 4}
                    y1={n.y}
                    x2={n.x + NODE_R - 4}
                    y2={n.y}
                    stroke={CROSS}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                )}
              </g>
            )
          })}
        </svg>

        {/* Running sum badge */}
        <AnimatePresence mode="popLayout" initial={false}>
          {beat.runningSum && (
            <motion.div
              key={beat.runningSum}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 20 }}
              className="rounded-lg px-3 py-1 font-display text-xs font-bold"
              style={{
                background: beat.result ? '#D1FAE5' : '#FEF3C7',
                color: beat.result ? '#065F46' : '#92400E',
              }}
            >
              {beat.runningSum}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={`cap-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="text-center font-display text-sm leading-snug"
            style={{ color: beat.result ? GREEN : BLUE }}
          >
            {beat.caption}
          </motion.p>
        </AnimatePresence>

        {/* Final answer chip */}
        {beat.result && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 16, delay: 0.15 }}
            className="rounded-xl px-4 py-1.5 font-display text-base font-extrabold"
            style={{ background: GREEN, color: '#fff' }}
          >
            {t(`Left out: ${LEFT_OUT} — Answer ${ANSWER_CHOICE}`, `Dihilangkan: ${LEFT_OUT} — Jawaban ${ANSWER_CHOICE}`)}
          </motion.div>
        )}
      </div>
    </div>
  )
}
