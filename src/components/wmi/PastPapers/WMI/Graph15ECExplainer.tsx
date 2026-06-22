// IKMC-23-EC-Q15 — "What is the smallest number of colours to paint the circles
// so any two connected by a line have different colours?" (answer B = 3).
//
// The animation greedy-colours the graph node by node, shows the triangle
// L–C–LL to explain why 2 colours are insufficient, then lands on the complete
// 3-colouring as the answer.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Graph15EC, COLOUR_FILL, type NodeId } from './Graph15ECIllustration'
import {
  buildGraph15ECSteps,
  GRAPH_15_EC_ANSWER,
  GRAPH_15_EC_CHOICE,
} from './graph15ECSteps'

const BLUE   = '#30598A'
const GREEN  = '#10B981'
const AMBER  = '#F59E0B'

// Colour names for the legend chips.
const COLOUR_NAMES_EN = ['Red', 'Green', 'Blue'] as const
const COLOUR_NAMES_ID = ['Merah', 'Hijau', 'Biru'] as const

export default function Graph15ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildGraph15ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const colourNames = lang === 'id' ? COLOUR_NAMES_ID : COLOUR_NAMES_EN

  // Pass the beat's colour assignments to the primitive directly.
  // Highlighted nodes get an amber overlay drawn on top (separate svg layer).
  const coloursForPrimitive = { ...beat.colours }

  const ariaLabel = t(
    `Graph coloring explainer: 9 circles connected by lines. The triangle L–C–LL shows 2 colours are not enough. Greedy coloring assigns 3 colours — red, green, blue — so every connected pair differs. Minimum = ${GRAPH_15_EC_ANSWER}, answer ${GRAPH_15_EC_CHOICE}.`,
    `Penjelasan pewarnaan graf: 9 lingkaran dihubungkan garis. Segitiga L–C–LL menunjukkan 2 warna tidak cukup. Pewarnaan serakah menetapkan 3 warna — merah, hijau, biru — sehingga setiap pasangan yang terhubung berbeda. Minimum = ${GRAPH_15_EC_ANSWER}, jawaban ${GRAPH_15_EC_CHOICE}.`,
  )

  // Count how many distinct colours have been assigned so far.
  const usedColours = new Set(Object.values(beat.colours).filter((v) => v != null))

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Strategy banner */}
        <div
          className="rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t('Greedy colouring — lowest free colour each step', 'Warnai serakah — warna bebas terendah setiap langkah')}
        </div>

        {/* Graph primitive */}
        <div className="relative">
          <Graph15EC colours={coloursForPrimitive} />

          {/* Amber highlight overlay for conflict nodes */}
          {beat.highlight.length > 0 && (
            <svg
              viewBox="0 0 220 222"
              width={220}
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              {beat.highlight.map((id) => {
                // We need to import NODES here — use inline approach
                // Node positions mirrored from Graph15ECIllustration
                const POS: Record<NodeId, { x: number; y: number }> = {
                  T:  { x: 110, y:  18 },
                  UL: { x:  52, y:  62 },
                  UR: { x: 168, y:  62 },
                  L:  { x:  24, y: 128 },
                  C:  { x: 110, y: 106 },
                  R:  { x: 196, y: 128 },
                  LL: { x:  52, y: 162 },
                  LR: { x: 168, y: 162 },
                  B:  { x: 110, y: 204 },
                }
                const n = POS[id]
                return (
                  <circle
                    key={id}
                    cx={n.x}
                    cy={n.y}
                    r={18}
                    fill={AMBER}
                    fillOpacity={0.35}
                    stroke={AMBER}
                    strokeWidth={3}
                    strokeOpacity={0.9}
                  />
                )
              })}
            </svg>
          )}
        </div>

        {/* Colours-used badge */}
        <AnimatePresence mode="popLayout" initial={false}>
          {usedColours.size > 0 && (
            <motion.div
              key={`colours-${usedColours.size}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="flex items-center gap-2"
            >
              {[0, 1, 2].map((ci) => {
                const used = usedColours.has(ci as 0 | 1 | 2)
                return (
                  <div
                    key={ci}
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold transition-opacity"
                    style={{
                      background: used ? COLOUR_FILL[ci] : '#E5E7EB',
                      color: used ? '#1E293B' : '#9CA3AF',
                      opacity: used ? 1 : 0.4,
                    }}
                  >
                    {colourNames[ci]}
                  </div>
                )
              })}
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
            style={{ color: beat.result ? GREEN : beat.highlight.length > 0 ? AMBER : BLUE }}
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
            {t(`Minimum = ${GRAPH_15_EC_ANSWER} colours — Answer ${GRAPH_15_EC_CHOICE}`, `Minimum = ${GRAPH_15_EC_ANSWER} warna — Jawaban ${GRAPH_15_EC_CHOICE}`)}
          </motion.div>
        )}
      </div>
    </div>
  )
}
