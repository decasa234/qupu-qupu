// OSN-11-SD-KAB-Q12 — animated explainer for the parallelogram diagonal.
// Reuses the illustration layout (A, B, C, D, COLOR constants) so animations
// read as the static scene coming alive.
//
// Beats:
//   0. intro    — static figure; state given measurements.
//   1. triangle — highlight right triangle ABD; show DB = 4.
//   2. coords   — overlay coordinate labels.
//   3. diagonal — highlight AC; show AC² computation.
//   4. result   — AC = 2√13 cm (green).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  A, B, C, D,
  SVG_W, SVG_H,
  COLOR,
  RightAngleMark,
} from './ParallelogramOSN11KQ12Illustration'
import { buildParallelogramOSN11KQ12Steps } from './parallelogramOSN11KQ12Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const AMBER = '#D97706'
const INK = COLOR.label

const FF = 'ui-sans-serif,system-ui,sans-serif'

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

// ── sub-components ────────────────────────────────────────────────────────────

function TriangleHighlight() {
  const pts = `${A.x},${A.y} ${B.x},${B.y} ${D.x},${D.y}`
  return (
    <polygon
      points={pts}
      fill={COLOR.triangle}
      stroke={COLOR.triangleStroke}
      strokeWidth={2}
      opacity={0.7}
    />
  )
}

function AltitudeLine() {
  return (
    <g>
      <line
        x1={D.x} y1={D.y} x2={B.x} y2={B.y}
        stroke={COLOR.altitude} strokeWidth={1.5} strokeDasharray="5,3"
      />
      <RightAngleMark cx={B.x} cy={B.y} />
    </g>
  )
}

function DBLabel() {
  // Label for DB = 4 cm, placed to the right of the altitude
  const midY = (D.y + B.y) / 2
  return (
    <text x={D.x + 10} y={midY} fontSize={12} fontWeight={700} fill={AMBER}
      dominantBaseline="central" fontFamily={FF}>
      4 cm
    </text>
  )
}

function CoordLabels() {
  const offset = 14
  return (
    <g fontSize={11} fill={AMBER} fontWeight={700} fontFamily={FF}>
      <text x={A.x - offset} y={A.y - 4} textAnchor="end">(0,0)</text>
      <text x={B.x + 4} y={B.y + offset} textAnchor="start">(3,0)</text>
      <text x={D.x + 4} y={D.y - 4} textAnchor="start">(3,4)</text>
      <text x={C.x + 4} y={C.y - 4} textAnchor="start">(6,4)</text>
    </g>
  )
}

function DiagonalHighlight({ color }: { color: string }) {
  return (
    <line
      x1={A.x} y1={A.y} x2={C.x} y2={C.y}
      stroke={color} strokeWidth={3} strokeLinecap="round"
    />
  )
}

// ── main explainer ────────────────────────────────────────────────────────────

export default function ParallelogramOSN11KQ12Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildParallelogramOSN11KQ12Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#EFF6FF', borderColor: '#2563EB', color: '#1E40AF' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: segitiga ABD siku-siku di B membentuk segitiga 3-4-5; koordinat C = (6,4); AC² = 52; AC = 2√13 cm.'
      : 'Explainer: triangle ABD is right-angled at B giving a 3-4-5 triangle; coordinate C = (6,4); AC² = 52; AC = 2√13 cm.'

  const pts = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          style={{ display: 'block', width: '100%', maxWidth: SVG_W }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* beat 1: triangle highlight (below parallelogram) */}
          <AnimatePresence>
            {beat.highlightTriangle && (
              <motion.g key="tri" {...fade} transition={{ duration: 0.35 }}>
                <TriangleHighlight />
              </motion.g>
            )}
          </AnimatePresence>

          {/* parallelogram */}
          <polygon points={pts} fill={COLOR.fill} stroke={COLOR.stroke} strokeWidth={2.5} />

          {/* diagonal highlight (beats 3–4) */}
          <AnimatePresence>
            {beat.showDiagonal && (
              <motion.g key="diag" {...fade} transition={{ duration: 0.35 }}>
                <DiagonalHighlight color={isResult ? GREEN : COLOR.diagonal} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* altitude (beats 0–2) */}
          <AnimatePresence>
            {beat.showAltitude && (
              <motion.g key="alt" {...fade} transition={{ duration: 0.25 }}>
                <AltitudeLine />
              </motion.g>
            )}
          </AnimatePresence>

          {/* DB = 4 label (beat 1) */}
          <AnimatePresence>
            {beat.highlightTriangle && (
              <motion.g key="dblbl" {...fade} transition={{ duration: 0.35 }}>
                <DBLabel />
              </motion.g>
            )}
          </AnimatePresence>

          {/* coord labels (beats 2–3) */}
          <AnimatePresence>
            {beat.showCoords && (
              <motion.g key="coords" {...fade} transition={{ duration: 0.35 }}>
                <CoordLabels />
              </motion.g>
            )}
          </AnimatePresence>

          {/* vertex labels (always) */}
          <text x={A.x - 20} y={A.y + 6} fontSize={16} fontWeight="bold" fill={INK} fontFamily={FF}>A</text>
          <text x={B.x + 6} y={B.y + 20} fontSize={16} fontWeight="bold" fill={INK} fontFamily={FF}>B</text>
          <text x={C.x + 6} y={C.y + 6} fontSize={16} fontWeight="bold" fill={INK} fontFamily={FF}>C</text>
          <text x={D.x - 22} y={D.y - 8} fontSize={16} fontWeight="bold" fill={INK} fontFamily={FF}>D</text>

          {/* side labels */}
          <text x={(A.x + B.x) / 2} y={A.y + 24} fontSize={13} fill={INK}
            textAnchor="middle" fontFamily={FF}>3 cm</text>
          <text x={(A.x + D.x) / 2 - 28} y={(A.y + D.y) / 2 + 4} fontSize={13} fill={INK}
            textAnchor="middle" fontFamily={FF}>5 cm</text>

          {/* AC = ? or answer (beat-dependent) */}
          <AnimatePresence>
            {beat.showDiagonal && (
              <motion.text
                key="aclabel"
                x={(A.x + C.x) / 2 + 8}
                y={(A.y + C.y) / 2 - 14}
                fontSize={13}
                fontWeight="600"
                fill={isResult ? GREEN : COLOR.diagonal}
                textAnchor="middle"
                fontFamily={FF}
                {...fade}
                transition={{ duration: 0.3 }}
              >
                {isResult ? 'AC = 2√13' : 'AC = ?'}
              </motion.text>
            )}
          </AnimatePresence>
        </svg>

        {/* equation strip */}
        <AnimatePresence mode="wait">
          {beat.equation ? (
            <motion.div
              key={beat.equation}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                fontFamily: 'ui-monospace,monospace',
                fontSize: 14,
                fontWeight: 700,
                color: isResult ? GREEN : '#1E40AF',
                background: isResult ? '#ECFDF5' : '#EFF6FF',
                borderRadius: 8,
                padding: '4px 14px',
                letterSpacing: '0.02em',
              }}
            >
              {beat.equation}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={beat.caption}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              ...captionStyle,
              borderRadius: 10,
              border: '1.5px solid',
              padding: '8px 14px',
              fontSize: 13,
              lineHeight: 1.5,
              textAlign: 'center',
              width: '100%',
            }}
          >
            {beat.caption}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
