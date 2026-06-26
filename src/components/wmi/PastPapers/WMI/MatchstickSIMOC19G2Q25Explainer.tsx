// SIMOC-19-G2-Q25 — Animated explainer: matchstick 869 → 9651.
// Reuses DigitSegs from the illustration for layout consistency.
// Beat-driven: 5 steps from intro → result.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  DIGIT_W,
  DIGIT_H,
  DIGIT_GAP,
  MATCH_COLOR,
  MATCH_ADDED_COLOR,
  MATCH_SW,
  DOT_R,
  DigitSegs,
} from './MatchstickSIMOC19G2Q25Illustration'
import { buildMatchstickSIMOC19G2Q25Steps } from './matchstickSIMOC19G2Q25Steps'

// ── Layout ────────────────────────────────────────────────────────────────────

const SVG_W = 280
const DY = 10   // digit top-padding inside SVG

// Centre N digits horizontally in SVG_W
function centreX(n: number): number {
  return (SVG_W - (n * DIGIT_W + (n - 1) * DIGIT_GAP)) / 2
}

// Height: digit + top pad + room for verify label row
const SVG_H = DY + DIGIT_H + 28

// Segments 2 (top-right) and 4 (bottom-left) are removed from 8 to get 5
const REMOVED_FROM_8: readonly number[] = [2, 4]

// Matchstick counts for 9, 6, 5, 1
const RESULT_COUNTS = [6, 6, 5, 2] as const

// ── Colours ───────────────────────────────────────────────────────────────────

const GREEN = '#10B981'
const BLUE = '#30598A'

// ── Component ─────────────────────────────────────────────────────────────────

export default function MatchstickSIMOC19G2Q25Explainer({
  lang = 'en',
  step = 0,
  playing = false,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = useMemo(
    () => buildMatchstickSIMOC19G2Q25Steps(lang as 'en' | 'id'),
    [lang],
  )
  const beat = useBeatControl(story.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: story.steps.map(s => s.hold),
  })
  const s = story.steps[beat] ?? story.steps[story.finalIndex]

  const viewKey = s.showResult ? 'result' : s.showIntermediate ? 'inter' : 'orig'
  const isResult = s.result
  const eqBg = isResult ? GREEN : BLUE
  const capStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  return (
    <div
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Penjelasan: ubah 8→5, buat digit 1, susun menjadi 9651'
          : 'Explainer: transform 8→5, create digit 1, arrange to 9651'
      }
    >
      <div className="flex flex-col items-center gap-3">

        {/* Seven-segment digit display */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          <AnimatePresence mode="wait">

            {/* Beat 0–1: original "869" */}
            {viewKey === 'orig' && (
              <motion.g
                key="orig"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {([8, 6, 9] as const).map((d, i) => (
                  <DigitSegs
                    key={i}
                    digit={d}
                    dx={centreX(3) + i * (DIGIT_W + DIGIT_GAP)}
                    dy={DY}
                    dimSegIds={i === 0 && s.dimExtraSegs ? REMOVED_FROM_8 : undefined}
                  />
                ))}
              </motion.g>
            )}

            {/* Beat 2: intermediate "5  6  9  1" */}
            {viewKey === 'inter' && (
              <motion.g
                key="inter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {([5, 6, 9, 1] as const).map((d, i) => (
                  <DigitSegs
                    key={i}
                    digit={d}
                    dx={centreX(4) + i * (DIGIT_W + DIGIT_GAP)}
                    dy={DY}
                    color={d === 1 ? MATCH_ADDED_COLOR : MATCH_COLOR}
                    sw={MATCH_SW}
                    dotR={DOT_R}
                  />
                ))}
              </motion.g>
            )}

            {/* Beats 3–4: result "9651" */}
            {viewKey === 'result' && (
              <motion.g
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {([9, 6, 5, 1] as const).map((d, i) => (
                  <g key={i}>
                    <DigitSegs
                      digit={d}
                      dx={centreX(4) + i * (DIGIT_W + DIGIT_GAP)}
                      dy={DY}
                    />
                    {s.showVerify && (
                      <text
                        x={centreX(4) + i * (DIGIT_W + DIGIT_GAP) + DIGIT_W / 2}
                        y={DY + DIGIT_H + 16}
                        textAnchor="middle"
                        fontSize={11}
                        fill="#6B7280"
                        fontFamily="ui-monospace, monospace"
                      >
                        {RESULT_COUNTS[i]}
                      </text>
                    )}
                  </g>
                ))}
              </motion.g>
            )}

          </AnimatePresence>
        </svg>

        {/* Equation pill */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={s.equation}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
              style={{ background: eqBg }}
            >
              {s.equation}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={capStyle}
        >
          {s.caption}
        </div>

      </div>
    </div>
  )
}
