// NestedTriOSN24NT1Q2Explainer — OSN-24-SD-NAS-TEORI1-Q2
//
// Post-answer animated explainer. Reuses NestedTriFigure from the illustration.
//
// Beats:
//   0. intro  — show the nested triangles, state the facts.
//   1. inner  — highlight inner triangle; ½ × 3 × 4 = 6.
//   2. ratio  — highlight outer; 5 × 6 = 30.
//   3. solve  — ½ × 12 × a = 30 → a = 5.
//   4. result — green answer label.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  NestedTriFigure,
  VW,
  VH,
  COLOR,
} from './NestedTriOSN24NT1Q2Illustration'
import { buildNestedTriOSN24NT1Q2Steps } from './nestedTriOSN24NT1Q2Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────

const GREEN = '#10b981'
const FONT  = 'ui-sans-serif, system-ui, sans-serif'

// ── Main Explainer ────────────────────────────────────────────────────────────

export default function NestedTriOSN24NT1Q2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'

  const story = useMemo(() => buildNestedTriOSN24NT1Q2Steps(lang), [lang])

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const labelA   = isResult ? '5' : 'a'

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: '#3b82f6', color: '#1e3a8a' }

  return (
    <div
      className="mx-auto w-full max-w-[280px]"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Penjelasan: hitung luas segitiga dalam 6, kali 5 jadi luas luar 30, selesaikan ½×12×a=30, a=5.'
          : 'Explainer: inner area 6, times 5 gives outer area 30, solve ½×12×a=30, a=5.'
      }
    >
      <div className="flex flex-col items-center gap-2">
        {/* Figure */}
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          width={Math.min(210, VW)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <NestedTriFigure
            highlightInner={beat.highlightInner}
            highlightOuter={beat.highlightOuter}
            labelA={labelA}
            showLabelA={true}
          />

          {/* Result: green "a = 5" near the bottom label position */}
          {isResult && (
            <text
              x={(28 + 168) / 2}
              y={205}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={14}
              fontWeight="800"
              fill={GREEN}
              fontFamily={FONT}
            >
              a = 5
            </text>
          )}
        </svg>

        {/* Equation badge */}
        <AnimatePresence mode="wait">
          {beat.equation !== '' && (
            <motion.div
              key={beat.equation}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className={[
                'rounded-lg px-4 py-1 text-center text-sm font-bold',
                isResult
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-50 text-blue-900',
              ].join(' ')}
            >
              {beat.equation}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={beat.caption}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-md border px-3 py-2 text-center text-xs leading-snug"
            style={captionStyle}
          >
            {beat.caption}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
