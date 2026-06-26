/**
 * SIMOC-21-G1-Q15 — animated explainer: Euler path / one-stroke tracing.
 *
 * Strategy: count odd-degree vertices per figure.
 *   0 or 2 → traceable; more than 2 → impossible.
 *   Figure D has 4 odd-degree vertices → answer D.
 *
 * Beats:
 *   0. intro  — explain the odd-degree rule.
 *   1–5.      — check each figure A–E, count odd-degree vertices.
 *   6. result — only D fails → answer D.
 *
 * Reuses the per-figure SVGs from EulerFiguresSIMOC21G1Q15Option.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { EulerFiguresSIMOC21G1Q15Option } from './EulerFiguresSIMOC21G1Q15Option'
import { buildEulerFiguresSIMOC21G1Q15Steps } from './eulerFiguresSIMOC21G1Q15Steps'

// ─── colour tokens ───────────────────────────────────────────────────────────
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const RED       = '#DC2626'
const RED_BG    = '#FEE2E2'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_TXT = '#065F46'
const RED_TXT   = '#7F1D1D'
const INK       = '#1F2937'

// ─── fake WmiChoice helper ────────────────────────────────────────────────────
function choice(label: 'A' | 'B' | 'C' | 'D' | 'E') {
  return { label, text: `(gambar ${label})` }
}

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

// ─── component ───────────────────────────────────────────────────────────────

export default function EulerFiguresSIMOC21G1Q15Explainer({
  lang = 'id',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = useMemo(
    () => buildEulerFiguresSIMOC21G1Q15Steps(lang as 'en' | 'id'),
    [lang],
  )

  const beat = useBeatControl(story.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: story.steps.map((s) => s.hold),
  })

  const current = story.steps[beat]

  return (
    <div
      className="flex flex-col items-center gap-4 select-none"
      style={{ fontFamily: 'inherit' }}
    >
      {/* figure grid — all 5 options visible; active one highlighted */}
      <div className="flex flex-wrap justify-center gap-3">
        {LABELS.map((label) => {
          const isActive  = current.active === label
          const isAnswer  = label === 'D'
          const showBadge = isActive && current.oddCount !== null

          const borderColor = isActive
            ? isAnswer
              ? RED
              : GREEN
            : '#CBD5E1'

          const bg = isActive
            ? isAnswer
              ? RED_BG
              : GREEN_BG
            : '#F8FAFC'

          return (
            <div
              key={label}
              style={{
                border: `2.5px solid ${borderColor}`,
                borderRadius: 12,
                background: bg,
                padding: '6px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'border-color 0.3s, background 0.3s',
                minWidth: 88,
              }}
            >
              <EulerFiguresSIMOC21G1Q15Option choice={choice(label)} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isActive
                    ? isAnswer ? RED_TXT : GREEN_TXT
                    : '#64748B',
                }}
              >
                {label}
              </span>
              <AnimatePresence>
                {showBadge && (
                  <motion.span
                    key={`badge-${label}-${beat}`}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isAnswer ? RED_TXT : GREEN_TXT,
                      background: isAnswer ? '#FECACA' : '#A7F3D0',
                      borderRadius: 6,
                      padding: '2px 6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {current.oddCount === 0
                      ? lang === 'id' ? '0 ganjil ✓' : '0 odd ✓'
                      : current.oddCount === 2
                      ? lang === 'id' ? '2 ganjil ✓' : '2 odd ✓'
                      : lang === 'id' ? '4 ganjil ✗' : '4 odd ✗'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* equation / answer chip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`eq-${beat}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.22 }}
          style={{
            background: current.result ? RED_BG : BLUE_BG,
            color: current.result ? RED : BLUE,
            borderRadius: 10,
            padding: '6px 18px',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 0.3,
          }}
        >
          {current.equation}
        </motion.div>
      </AnimatePresence>

      {/* caption */}
      <AnimatePresence mode="wait">
        <motion.p
          key={`cap-${beat}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          style={{
            color: INK,
            fontSize: 13,
            lineHeight: 1.55,
            textAlign: 'center',
            maxWidth: 420,
            margin: 0,
            padding: '0 8px',
          }}
        >
          {current.caption}
        </motion.p>
      </AnimatePresence>

      {/* final answer badge */}
      <AnimatePresence>
        {current.result && (
          <motion.div
            key="answer-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: RED,
              color: '#fff',
              borderRadius: 12,
              padding: '8px 28px',
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            {lang === 'id' ? 'Jawaban: D' : 'Answer: D'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
