// HKIMO-18-P1H-Q5 — post-answer animated explainer.
//
// Reuses CellGroup, layout constants, and COLOR from TriStepsHK18P1Q5Illustration
// so the animation reads as the same figure coming alive.
//
// Animation beats (7 total):
//   0. intro   — static view of all 4 groups.
//   1. group1  — highlight group 1, equation "1".
//   2. group2  — highlight group 2, equation "1+2=3".
//   3. group3  — highlight group 3, equation "1+2+3=6".
//   4. group4  — highlight group 4, equation "1+2+3+4=10".
//   5. formula — all groups highlighted, show n(n+1)/2 rule.
//   6. result  — "10×11÷2 = 55" (answer, green).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CellGroup,
  CELL,
  GAP,
  PAD_X,
  PAD_TOP,
  PAD_BOT,
  N_GROUPS,
  SVG_W,
  SVG_H,
  BASELINE_Y,
  COLOR,
  groupStartX,
  groupCenterX,
} from './TriStepsHK18P1Q5Illustration'
import { buildTriStepsHK18P1Q5Steps } from './triStepsHK18P1Q5Steps'

const GREEN  = '#10B981'
const BLUE   = '#30598A'
const ORANGE = '#F0853A'

const ORDINALS = ['1st Group', '2nd Group', '3rd Group', '4th Group'] as const

export default function TriStepsHK18P1Q5Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'

  const story = useMemo(() => buildTriStepsHK18P1Q5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Penjelasan: kelompok n memiliki n(n+1)/2 simbol ⊕; kelompok ke-10 memiliki 55 simbol.'
          : 'Explainer: group n has n(n+1)/2 ⊕ symbols; the 10th group has 55 symbols.'
      }
    >
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ maxWidth: SVG_W, display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* base groups (always shown, dimmed when a specific group is highlighted) */}
          {Array.from({ length: N_GROUPS }, (_, g) => {
            const n   = g + 1
            const ox  = groupStartX(g)
            const oy  = BASELINE_Y - n * CELL
            const isHL = beat.highlightGroups.includes(n)

            return (
              <g key={g} transform={`translate(${ox}, ${oy})`}>
                <CellGroup
                  n={n}
                  fill={isHL ? COLOR.HIGHLIGHT_FILL : COLOR.CELL_FILL}
                  stroke={isHL ? COLOR.HIGHLIGHT_STROKE : COLOR.CELL_STROKE}
                />
              </g>
            )
          })}

          {/* ordinal labels */}
          {Array.from({ length: N_GROUPS }, (_, g) => (
            <text
              key={g}
              x={groupCenterX(g)}
              y={BASELINE_Y + 22}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={600}
              fill={beat.highlightGroups.includes(g + 1) ? BLUE : COLOR.LABEL}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {ORDINALS[g]}
            </text>
          ))}

          {/* count badge for single-group highlight beats */}
          <AnimatePresence>
            {beat.highlightGroups.length === 1 && beat.equation !== '' && (
              <motion.g
                key={`badge-${beat.phase}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                {(() => {
                  const g  = beat.highlightGroups[0] - 1
                  const cx = groupCenterX(g)
                  const n  = g + 1
                  const ty = BASELINE_Y - n * CELL - 10
                  const bw = Math.max(32, beat.equation.length * 7 + 12)
                  return (
                    <g>
                      <rect
                        x={cx - bw / 2}
                        y={ty - 10}
                        width={bw}
                        height={20}
                        rx={10}
                        fill={BLUE}
                      />
                      <text
                        x={cx}
                        y={ty}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={11}
                        fontWeight={800}
                        fill="white"
                        fontFamily="ui-sans-serif, system-ui, sans-serif"
                      >
                        {beat.equation}
                      </text>
                    </g>
                  )
                })()}
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation line */}
        <AnimatePresence mode="wait">
          {beat.equation !== '' && (
            <motion.div
              key={beat.phase + '-eq'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 15,
                fontWeight: 700,
                color: isResult ? GREEN : ORANGE,
              }}
            >
              {beat.equation}
            </motion.div>
          )}
        </AnimatePresence>

        {/* caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={beat.phase + '-cap'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: 8,
              border: `1.5px solid ${captionStyle.borderColor}`,
              background: captionStyle.background,
              color: captionStyle.color,
              fontSize: 13,
              lineHeight: 1.5,
              textAlign: 'center',
            }}
          >
            {beat.caption}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
