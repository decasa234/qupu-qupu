// FloorPlanOSN24NT2Q7Explainer.tsx
// OSN 2024 SD Nasional Teori2 Q7 — animated cost explainer.
// Beats through the three material zones; each beat highlights a zone and
// shows area × rate. Imports FloorPlanBase so overlays stay in register.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  FloorPlanBase,
  PX as p,
  PY as q,
  SVG_W,
  SVG_H,
  C,
} from './FloorPlanOSN24NT2Q7Illustration'
import { buildFloorPlanOSN24NT2Q7Steps } from './floorPlanOSN24NT2Q7Steps'

// ── Highlight overlays (pure SVG <g> elements) ────────────────────────────────

function GlowA() {
  return (
    <rect x={p.L} y={q.MID} width={p.AJR-p.L} height={q.BOT-q.MID}
      fill="rgba(251,191,36,0.4)" stroke="#F59E0B" strokeWidth={2.5} />
  )
}

function GlowB() {
  return (
    <>
      <rect x={p.L} y={q.T} width={p.KT1R-p.L} height={q.MID-q.T}
        fill="rgba(59,130,246,0.3)" stroke="#3B82F6" strokeWidth={2.5} />
      <polygon
        points={`${p.KM2R},${q.T} ${p.RY0},${q.T} ${p.RY_MID},${q.MID} ${p.KM2R},${q.MID}`}
        fill="rgba(59,130,246,0.3)" stroke="#3B82F6" strokeWidth={2.5} />
      <rect x={p.AJR} y={q.MID} width={p.KM2R-p.AJR} height={q.BOT-q.MID}
        fill="rgba(59,130,246,0.3)" stroke="#3B82F6" strokeWidth={2.5} />
    </>
  )
}

function GlowR() {
  return (
    <>
      <rect x={p.KT1R} y={q.T} width={p.AJR-p.KT1R} height={q.MID-q.T}
        fill="rgba(16,185,129,0.3)" stroke="#10B981" strokeWidth={2.5} />
      <polygon
        points={`${p.KM2R},${q.MID} ${p.RY_MID},${q.MID} ${p.RY_BOT},${q.BOT} ${p.KM2R},${q.BOT}`}
        fill="rgba(16,185,129,0.3)" stroke="#10B981" strokeWidth={2.5} />
      <rect x={p.L} y={q.DB} width={p.TamanR-p.L} height={q.TOTAL-q.DB}
        fill="rgba(16,185,129,0.3)" stroke="#10B981" strokeWidth={2.5} />
    </>
  )
}

// ── Pure-SVG info panel (no foreignObject) ────────────────────────────────────
const INFO_Y = SVG_H + 6
const INFO_H = 80
const EXPLAINER_H = SVG_H + INFO_H + 8

function InfoPanel({ equation, caption, result }: {
  equation: string; caption: string; result: boolean
}) {
  const bgFill = result ? '#ECFDF5' : '#F9FAFB'
  const stroke = result ? '#6EE7B7' : '#D1D5DB'
  // wrap caption to two lines at ~70 chars
  const words = caption.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > 72) { lines.push(cur.trim()); cur = w }
    else { cur = (cur + ' ' + w).trim() }
  }
  if (cur) lines.push(cur)

  return (
    <g>
      <rect x={4} y={INFO_Y} width={SVG_W - 8} height={INFO_H - 4}
        rx={5} fill={bgFill} stroke={stroke} strokeWidth={1.5} />
      {equation && (
        <text x={12} y={INFO_Y + 14} fontSize={10} fontWeight="700" fill="#1F2937">
          {equation}
        </text>
      )}
      {lines.map((line, i) => (
        <text key={i} x={12} y={INFO_Y + (equation ? 30 : 16) + i * 13}
          fontSize={9.5} fill="#374151">{line}</text>
      ))}
    </g>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────
export default function FloorPlanOSN24NT2Q7Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const storyboard = useMemo(() => buildFloorPlanOSN24NT2Q7Steps(lang), [lang])
  const beat = useBeatControl(storyboard.finalIndex, {
    ...props,
    holds: storyboard.beats.map((b) => b.hold),
  })
  const cur = storyboard.beats[beat]

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${SVG_W} ${EXPLAINER_H}`}
        width="100%"
        aria-label="Penjelasan soal denah rumah OSN 2024 SD Teori2 Q7"
      >
        {/* static floor plan */}
        <FloorPlanBase />

        {/* animated highlights */}
        <AnimatePresence>
          {cur.highlightA && (
            <motion.g key="a"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}>
              <GlowA />
            </motion.g>
          )}
          {cur.highlightB && (
            <motion.g key="b"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}>
              <GlowB />
            </motion.g>
          )}
          {cur.highlightR && (
            <motion.g key="r"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}>
              <GlowR />
            </motion.g>
          )}
        </AnimatePresence>

        {/* beat counter */}
        <text x={SVG_W - 8} y={16} textAnchor="end" fontSize={9}
          fontWeight="600" fill={C.DIM}>
          {beat + 1}/{storyboard.beats.length}
        </text>

        {/* info panel */}
        <AnimatePresence mode="wait">
          <motion.g key={cur.phase}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <InfoPanel
              equation={cur.equation}
              caption={cur.caption}
              result={cur.result}
            />
          </motion.g>
        </AnimatePresence>
      </svg>
    </div>
  )
}
