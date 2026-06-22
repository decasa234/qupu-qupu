// IKMC-21-PE-Q7 — post-answer explainer.
//
// Reuses ChildFigure + constants from ChildrenLine7PEIllustration.
//
// Animation beats:
//   0. intro       — static scene; state the challenge.
//   1. rule        — explain right-hand per direction.
//   2. fwd-check   — highlight forward-facing children (1,3,5,7).
//   3. bwd-check   — highlight backward-facing children (2,4,6).
//   4. count       — highlight all 6 right-hand users, show count = 6.
//   5. result      — answer E confirmed.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  ChildFigure,
  SVG_W,
  SVG_H,
  CHILD_CX,
  DIRECTIONS,
  GROUND_Y,
  HAND_Y,
  COLOR,
  leftHandX,
  rightHandX,
} from './ChildrenLine7PEIllustration'
import { buildChildrenLine7PESteps } from './childrenLine7PESteps'

const GREEN  = '#10B981'
const BLUE   = '#3B82F6'

const FIG_W = Math.min(480, SVG_W)

// ── Glow ring around a highlighted child ─────────────────────────────────────

function ChildGlow({ cx, color }: { cx: number; color: string }) {
  return (
    <ellipse
      cx={cx}
      cy={GROUND_Y - 50}
      rx={28}
      ry={56}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeDasharray="6 3"
      opacity={0.85}
    />
  )
}

// ── Right-hand connection highlight ──────────────────────────────────────────

function RightHandLink({ i }: { i: number }) {
  // Connection between child i and i+1
  const cx1 = CHILD_CX[i]
  const cx2 = CHILD_CX[i + 1]
  return (
    <rect
      x={rightHandX(cx1) - 2}
      y={HAND_Y - 5}
      width={leftHandX(cx2) - rightHandX(cx1) + 4}
      height={10}
      rx={5}
      fill={GREEN}
      opacity={0.55}
    />
  )
}

// ── Count badge ───────────────────────────────────────────────────────────────

function CountBadge({ count, lang }: { count: number; lang: 'en' | 'id' }) {
  const label = lang === 'id' ? `${count} anak` : `${count} children`
  return (
    <g>
      <rect
        x={SVG_W / 2 - 38}
        y={6}
        width={76}
        height={24}
        rx={12}
        fill={GREEN}
      />
      <text
        x={SVG_W / 2}
        y={18}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={900}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Direction arrow label ─────────────────────────────────────────────────────

function DirectionArrow({ cx, dir }: { cx: number; dir: 'fwd' | 'bwd' }) {
  const arrow = dir === 'fwd' ? '→' : '←'
  return (
    <text
      x={cx}
      y={GROUND_Y + 14}
      textAnchor="middle"
      fontSize={11}
      fontWeight={800}
      fill={dir === 'fwd' ? BLUE : '#E05252'}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {arrow}
    </text>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function ChildrenLine7PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildChildrenLine7PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: '#1E40AF' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 7 anak berjajar dengan arah hadap bergantian (→←→←→←→). Anak 1–6 memakai tangan kanan saat berpegangan; anak 7 memakai tangan kiri. Jawaban: 6 (E).'
      : 'Explainer: 7 children in a line with alternating directions (→←→←→←→). Children 1–6 use their right hand for one connection; child 7 uses their left. Answer: 6 (E).'

  // Show direction arrows on rule beat and beyond
  const showArrows = beat.phase !== 'intro'

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
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

          {/* ground */}
          <rect x={0} y={GROUND_Y} width={SVG_W} height={SVG_H - GROUND_Y} fill={COLOR.GROUND} />
          <line x1={0} y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke={COLOR.GROUND_LINE} strokeWidth={2} />

          {/* right-hand link highlights */}
          <AnimatePresence>
            {beat.rightHandLinks.map((i) => (
              <motion.g
                key={`rhl-${i}`}
                initial={{ opacity: 0, scaleX: 0.4 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                <RightHandLink i={i} />
              </motion.g>
            ))}
          </AnimatePresence>

          {/* plain hand-holding lines */}
          {CHILD_CX.slice(0, 6).map((cx, i) => {
            const nextCx = CHILD_CX[i + 1]
            return (
              <line
                key={`link-${i}`}
                x1={rightHandX(cx)}
                y1={HAND_Y}
                x2={leftHandX(nextCx)}
                y2={HAND_Y}
                stroke={COLOR.HAND_LINE}
                strokeWidth={3}
                strokeLinecap="round"
              />
            )
          })}

          {/* children */}
          {CHILD_CX.map((cx, i) => (
            <ChildFigure
              key={i}
              cx={cx}
              groundY={GROUND_Y}
              dir={DIRECTIONS[i]}
              index={i}
            />
          ))}

          {/* glow rings for highlighted children */}
          <AnimatePresence>
            {beat.highlight.map((i) => (
              <motion.g
                key={`glow-${i}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <ChildGlow
                  cx={CHILD_CX[i]}
                  color={
                    beat.phase === 'fwd-check'
                      ? BLUE
                      : beat.phase === 'bwd-check'
                      ? '#E05252'
                      : GREEN
                  }
                />
              </motion.g>
            ))}
          </AnimatePresence>

          {/* direction arrows (below ground line) */}
          <AnimatePresence>
            {showArrows &&
              CHILD_CX.map((cx, i) => (
                <motion.g
                  key={`arrow-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <DirectionArrow cx={cx} dir={DIRECTIONS[i]} />
                </motion.g>
              ))}
          </AnimatePresence>

          {/* count badge */}
          <AnimatePresence>
            {beat.count >= 0 && (
              <motion.g
                key="count-badge"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 18 }}
              >
                <CountBadge count={beat.count} lang={lang} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* answer chip on result beat */}
          {isResult && (
            <text
              x={SVG_W - 14}
              y={14}
              textAnchor="end"
              dominantBaseline="hanging"
              fontSize={14}
              fontWeight={900}
              fill={GREEN}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              E ✓
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
