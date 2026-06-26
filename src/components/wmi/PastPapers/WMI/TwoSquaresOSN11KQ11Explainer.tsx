// OSN-11-SD-KAB-Q11 — animated explainer.
//
// Reuses the L-shape geometry exported from TwoSquaresOSN11KQ11Illustration
// and animates the 4-beat solution storyboard from twoSquaresOSN11KQ11Steps.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  LARGE,
  SMALL,
  LX,
  LY,
  SX,
  SY,
  OUTLINE,
  COLOR,
} from './TwoSquaresOSN11KQ11Illustration'
import { buildTwoSquaresOSN11KQ11Steps } from './twoSquaresOSN11KQ11Steps'

// Colour tokens for annotations
const GREEN  = '#10B981'
const ORANGE = '#F59E0B'
const BLUE   = '#2563EB'
const RED    = '#EF4444'
const INK    = COLOR.LABEL

// The shared interior edge — the seam between the two squares
// Left: (SX, LY) → (LX+LARGE, LY) but only the shared portion: (SX, LY) to (LX+LARGE, LY)
// Actually the shared edge is the full bottom of the small square:
//   from (SX, LY) to (LX+LARGE, LY)   length = SMALL (= 72 px = 6 cm) ✓
const SEAM_X1 = SX
const SEAM_X2 = LX + LARGE
const SEAM_Y  = LY

// Side-length label helper
function SideLabel({ x, y, label, color = INK }: { x: number; y: number; label: string; color?: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
      fontSize={12} fontWeight="bold" fill={color} fontFamily="sans-serif">
      {label}
    </text>
  )
}

export default function TwoSquaresOSN11KQ11Explainer({
  lang = 'id',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const storyboard = useMemo(() => buildTwoSquaresOSN11KQ11Steps(lang === 'id' ? 'id' : 'en'), [lang])
  const { steps, finalIndex } = storyboard

  const holds = useMemo(() => steps.map(s => s.hold), [steps])
  const beat  = useBeatControl(finalIndex, { step, playing, onStepCount, onStepChange, onPlayEnd, holds })
  const cur   = steps[beat]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: 'sans-serif' }}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={SVG_W} height={SVG_H}>

        {/* ── L-shaped compound figure ── */}
        <path d={OUTLINE} fill={COLOR.FILL} stroke={BLUE} strokeWidth={2} strokeLinejoin="round" />

        {/* ── shared interior edge highlight (beat 2) ── */}
        <AnimatePresence>
          {cur.showSharedEdge && (
            <motion.line
              key="seam"
              x1={SEAM_X1} y1={SEAM_Y} x2={SEAM_X2} y2={SEAM_Y}
              stroke={RED} strokeWidth={3} strokeDasharray="6 3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* ── side-length labels (beats 1–3) ── */}
        <AnimatePresence>
          {cur.showLabels && (
            <motion.g key="labels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* top of small square: "6 cm" */}
              <SideLabel x={(SX + LX + LARGE) / 2} y={SY - 12} label="6 cm" color={ORANGE} />
              {/* left of small square */}
              <SideLabel x={SX - 16} y={(SY + LY) / 2} label="6 cm" color={ORANGE} />
              {/* bottom of large square: "8 cm" */}
              <SideLabel x={(LX + LX + LARGE) / 2} y={LY + LARGE + 16} label="8 cm" color={GREEN} />
              {/* right of large square (entire right = 6+8=14 cm) — show 8 beside large only */}
              <SideLabel x={LX + LARGE + 18} y={LY + LARGE / 2} label="8 cm" color={GREEN} />
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── result ring around the outline ── */}
        <AnimatePresence>
          {cur.result && (
            <motion.path
              key="result-ring"
              d={OUTLINE}
              fill="none"
              stroke={GREEN}
              strokeWidth={4}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>

        {/* ── area label in large square (always) ── */}
        <text x={LX + LARGE / 2} y={LY + LARGE / 2} textAnchor="middle"
          dominantBaseline="middle" fontSize={11} fill={INK} fontFamily="sans-serif">
          Luas = 100 cm²
        </text>
      </svg>

      {/* equation line */}
      <AnimatePresence mode="wait">
        {cur.equation ? (
          <motion.div key={cur.equation}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            style={{
              background: cur.result ? '#D1FAE5' : '#EFF6FF',
              border: `1px solid ${cur.result ? GREEN : BLUE}`,
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 14,
              fontWeight: 600,
              color: cur.result ? '#065F46' : '#1E40AF',
              fontFamily: 'monospace',
            }}
          >
            {cur.equation}
          </motion.div>
        ) : <span key="empty" />}
      </AnimatePresence>

      {/* caption */}
      <AnimatePresence mode="wait">
        <motion.p key={beat}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ fontSize: 13, color: '#374151', textAlign: 'center', maxWidth: 300, margin: 0 }}
        >
          {cur.caption}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
