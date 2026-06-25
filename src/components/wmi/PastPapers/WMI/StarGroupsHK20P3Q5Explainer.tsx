// HKIMO-20-P3H-Q5 — post-answer animated explainer.
//
// Reuses GridBoard grid layout + isStar predicate from the Illustration
// so the animation reads as the static figure coming alive.
//
// Beats (5 total):
//   0. intro   — static view of all 4 groups.
//   1. count   — highlight all groups; show G1=1 G2=2 G3=5 G4=8.
//   2. pattern — highlight G2–G4; show +1/+3/+3 gap labels.
//   3. extend  — highlight G4; show "G13 = 8 + 9×3".
//   4. result  — "8 + 27 = 35" (green).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  isStar,
  GX,
  CELL,
  PAD,
  MAX_H,
  SVG_W,
  SVG_H,
  STAR_FILL,
  EMPTY_FILL,
  LABEL_Y,
  COUNT_Y,
  LABEL_COLOR,
  COUNT_COLOR,
} from './StarGroupsHK20P3Q5Illustration'
import { GridBoard } from './primitives/GridBoard'
import { buildStarGroupsHK20P3Q5Steps } from './starGroupsHK20P3Q5Steps'

// ── colour tokens ──────────────────────────────────────────────────────────────
const GREEN   = '#10B981'
const BLUE    = '#2563EB'
const AMBER   = '#D97706'
const HL_FILL = '#FDE68A'  // amber-200 — highlighted star cells

// ── gap label positions (mid-x between adjacent group centres) ─────────────────
// Group centres: GX[i] + n*CELL/2 where n = i+1
function groupCx(i: number): number {
  return GX[i] + ((i + 1) * CELL) / 2
}

const GAP_LABELS = [
  { label: '+1', x: (groupCx(0) + groupCx(1)) / 2 },
  { label: '+3', x: (groupCx(1) + groupCx(2)) / 2 },
  { label: '+3', x: (groupCx(2) + groupCx(3)) / 2 },
]

const GAP_Y = PAD + MAX_H / 2 - 4  // vertically centred in the figure

const COUNTS = [1, 2, 5, 8]

// ── component ─────────────────────────────────────────────────────────────────

export default function StarGroupsHK20P3Q5Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'

  const story = useMemo(() => buildStarGroupsHK20P3Q5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE }

  return (
    <div
      className="mx-auto w-full max-w-[380px]"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Penjelasan: pola bintang dengan selisih +3 dari kelompok 3; kelompok 13 memiliki 35 bintang.'
          : 'Explainer: star groups with +3 gap from group 3; group 13 has 35 stars.'
      }
    >
      {/* ── figure ── */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {/* 4 group grids */}
        {[1, 2, 3, 4].map((n, i) => {
          const gx = GX[i]
          const gy = PAD + MAX_H - n * CELL
          const hl = beat.highlightGroups.includes(n)
          const cx = gx + (n * CELL) / 2

          return (
            <g key={n}>
              <g transform={`translate(${gx},${gy})`}>
                <GridBoard
                  rows={n}
                  cols={n}
                  cellSize={CELL}
                  fill={(r, c) => (isStar(n, r, c) ? (hl ? HL_FILL : STAR_FILL) : EMPTY_FILL)}
                  label={(r, c) => (isStar(n, r, c) ? '*' : '')}
                  gridStroke={hl ? '#B45309' : '#9CA3AF'}
                />
              </g>

              {/* group label */}
              <text
                x={cx}
                y={LABEL_Y}
                textAnchor="middle"
                fontSize={9}
                fontWeight="700"
                fill={LABEL_COLOR}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {`G${n}`}
              </text>

              {/* star count */}
              <text
                x={cx}
                y={COUNT_Y}
                textAnchor="middle"
                fontSize={9}
                fill={COUNT_COLOR}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {`${COUNTS[i]}*`}
              </text>
            </g>
          )
        })}

        {/* ── gap labels (+1 / +3 / +3) — visible on 'pattern' beat ── */}
        <AnimatePresence>
          {beat.showGaps &&
            GAP_LABELS.map(({ label, x }, i) => (
              <motion.text
                key={`gap-${i}`}
                x={x}
                y={GAP_Y}
                textAnchor="middle"
                fontSize={11}
                fontWeight="800"
                fill={i === 0 ? '#6B7280' : AMBER}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {label}
              </motion.text>
            ))}
        </AnimatePresence>
      </svg>

      {/* ── equation line ── */}
      <AnimatePresence mode="wait">
        {beat.equation ? (
          <motion.p
            key={beat.equation}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              textAlign: 'center',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: isResult ? GREEN : AMBER,
              margin: '6px 0 4px',
            }}
          >
            {beat.equation}
          </motion.p>
        ) : (
          <div style={{ height: '1.4rem', margin: '6px 0 4px' }} />
        )}
      </AnimatePresence>

      {/* ── caption box ── */}
      <div
        style={{
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: '0.78rem',
          lineHeight: 1.5,
          border: `1.5px solid ${captionStyle.borderColor}`,
          background: captionStyle.background,
          color: captionStyle.color,
          margin: '0 4px',
        }}
      >
        {beat.caption}
      </div>
    </div>
  )
}
