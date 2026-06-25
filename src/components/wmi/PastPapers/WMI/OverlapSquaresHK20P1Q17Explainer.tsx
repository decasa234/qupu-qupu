// HKIMO-20-P1H-Q17 — animated explainer for "How many squares in the figure?"
//
// Reuses the illustration constants so the animated view occupies the same
// coordinate space as the static problem figure.
//
// Beat sequence (see overlapSquaresHK20P1Q17Steps.ts):
//   0  intro  — static staircase, invite counting
//   1  big    — orange outlines on the 4 large (original) squares
//   2  med    — blue outlines on the 3 medium (pairwise-overlap) squares
//   3  sm     — purple outlines on the 2 small (triple-overlap) squares
//   4  tiny   — green outline on the 1 tiny (quadruple-overlap) square
//   5  result — full green, final equation

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  S,
  STEP,
  VB_SIZE,
  STROKE,
  SW,
  SQUARES,
} from './OverlapSquaresHK20P1Q17Illustration'
import { buildOverlapSquaresHK20P1Q17Steps } from './overlapSquaresHK20P1Q17Steps'

// ── colours ──────────────────────────────────────────────────────────────────
const C_LARGE  = '#f0853a'  // orange — level 1 (original 4)
const C_MED    = '#3b82f6'  // blue   — level 2 (pairwise overlaps)
const C_SM     = '#a855f7'  // purple — level 3 (triple overlaps)
const C_TINY   = '#10B981'  // green  — level 4 (quad overlap)
const C_RESULT = '#10B981'

// ── highlight rect sets ───────────────────────────────────────────────────────

/** The 4 large squares (level 1). */
const LARGE_RECTS = SQUARES.map(sq => ({ x: sq.x, y: sq.y, s: S }))

/** The 3 pairwise-overlap squares (level 2): side = 3*STEP = 3S/4. */
const MED_RECTS = [0, 1, 2].map(i => ({
  x: SQUARES[i + 1].x,
  y: SQUARES[i + 1].y,
  s: S - STEP,   // 90 when STEP=30, S=120
}))

/** The 2 triple-overlap squares (level 3): side = 2*STEP = S/2. */
const SM_RECTS = [0, 1].map(i => ({
  x: SQUARES[i + 2].x,
  y: SQUARES[i + 2].y,
  s: S - 2 * STEP,   // 60
}))

/** The 1 quadruple-overlap square (level 4): side = STEP = S/4. */
const TINY_RECTS = [{
  x: SQUARES[3].x,
  y: SQUARES[3].y,
  s: S - 3 * STEP,   // 30
}]

interface HRect { x: number; y: number; s: number }

function HighlightRect({ r, color, key: _k }: { r: HRect; color: string; key?: string }) {
  return (
    <motion.rect
      x={r.x}
      y={r.y}
      width={r.s}
      height={r.s}
      fill={color + '22'}
      stroke={color}
      strokeWidth={3}
      rx={2}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    />
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function OverlapSquaresHK20P1Q17Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const beats = useMemo(() => buildOverlapSquaresHK20P1Q17Steps(lang), [lang])
  const beatIndex = useBeatControl(beats.length - 1, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: beats.map(b => b.hold),
  })
  const beat = beats[beatIndex]

  const isResult = beat.phase === 'result'
  const strokeAll = isResult ? C_RESULT : STROKE

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* figure */}
      <svg
        viewBox={`0 0 ${VB_SIZE} ${VB_SIZE}`}
        width={VB_SIZE}
        height={VB_SIZE}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* base squares */}
        {SQUARES.map((sq, i) => (
          <rect
            key={i}
            x={sq.x + SW / 2}
            y={sq.y + SW / 2}
            width={S - SW}
            height={S - SW}
            fill="none"
            stroke={strokeAll}
            strokeWidth={SW}
          />
        ))}

        {/* highlight overlays */}
        <AnimatePresence>
          {beat.highlightLevels >= 1 && LARGE_RECTS.map((r, i) => (
            <HighlightRect key={`L${i}`} r={r} color={C_LARGE} />
          ))}
          {beat.highlightLevels >= 2 && MED_RECTS.map((r, i) => (
            <HighlightRect key={`M${i}`} r={r} color={C_MED} />
          ))}
          {beat.highlightLevels >= 3 && SM_RECTS.map((r, i) => (
            <HighlightRect key={`S${i}`} r={r} color={C_SM} />
          ))}
          {beat.highlightLevels >= 4 && TINY_RECTS.map((r, i) => (
            <HighlightRect key={`T${i}`} r={r} color={C_TINY} />
          ))}
        </AnimatePresence>

        {/* running count badge */}
        <AnimatePresence>
          {beat.count !== null && (
            <motion.g
              key={`count-${beat.count}`}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ transformOrigin: '14px 14px' }}
            >
              <circle cx={VB_SIZE - 22} cy={14} r={14} fill={isResult ? C_RESULT : '#1e293b'} />
              <text
                x={VB_SIZE - 22}
                y={19}
                textAnchor="middle"
                fontSize={13}
                fontWeight="bold"
                fill="white"
                fontFamily="sans-serif"
              >
                {beat.count}
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* equation */}
      <AnimatePresence mode="wait">
        {beat.equation ? (
          <motion.div
            key={beat.equation}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              fontFamily: 'monospace',
              fontSize: 15,
              fontWeight: 700,
              color: isResult ? C_RESULT : '#334155',
            }}
          >
            {beat.equation}
          </motion.div>
        ) : <span key="eq-empty" />}
      </AnimatePresence>

      {/* caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={beat.caption}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            maxWidth: 260,
            textAlign: 'center',
            fontSize: 13,
            color: '#475569',
            lineHeight: 1.4,
          }}
        >
          {beat.caption}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
