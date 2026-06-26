// SASMO-20-G3-Q15 — animated explainer.
//
// Shows the 3-D pyramid (left) beside the net for option B (right), then uses
// motion overlays to highlight:
//   beat 0 → static scene
//   beat 1 → right pyramid face (Face 1: hat dot) circled
//   beat 2 → left pyramid face (Face 2: bow tie) circled
//   beat 3 → bottom-corner triangle of net B circled (Face 2 match)
//   beat 4 → answer B confirmed (green label)
//
// Imports geometry + ClownFace from the Illustration so both files share the
// same coordinate system and visual tokens.

import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  ClownFace, NetOption, pstr,
  INK, PYR_LF, PYR_RF,
  A, LL, RL, BC, CLF, CRF, PYR_R,
  ML, MR, BOT, C_B, FACE_R,
  CTR_BG,
} from './PyramidNetSASMO20G3Q15Illustration'
import { buildPyramidNetSASMO20G3Q15Steps } from './pyramidNetSASMO20G3Q15Steps'

// ── Layout ────────────────────────────────────────────────────────────────────
const VW = 360
const VH = 200

// Pyramid rendered in left half (translate 10,15, scale to ~160×155)
const PYR_TX = 8
const PYR_TY = 18
const PYR_SC = 0.83   // scale the 200×170 pyramid SVG to ~166×141

// Net B rendered in right half (translate 185,15, scale)
const NET_TX = 192
const NET_TY = 22
const NET_SC = 0.76   // scale the 200×175 net to ~152×133

// Highlight colour
const HL_RING  = '#F59E0B'  // amber ring stroke
const HL_RING2 = '#16A34A'  // green ring for Face 1 on pyramid
const ANS_C    = '#16A34A'  // answer label green

// ── Subcomponents ─────────────────────────────────────────────────────────────

/** Ellipse ring drawn over the right pyramid face (Face 1: hat dot). */
function F1Ring() {
  return (
    <ellipse
      cx={CRF.x} cy={CRF.y - 8}
      rx={38} ry={44}
      fill="none"
      stroke={HL_RING2}
      strokeWidth={2.5}
      strokeDasharray="6,3"
    />
  )
}

/** Ellipse ring drawn over the left pyramid face (Face 2: bow tie). */
function F2Ring() {
  return (
    <ellipse
      cx={CLF.x} cy={CLF.y - 4}
      rx={36} ry={42}
      fill="none"
      stroke={HL_RING}
      strokeWidth={2.5}
      strokeDasharray="6,3"
    />
  )
}

/** Ring polygon over the bottom corner of net B (T_bot = Face 2). */
function NetBotRing() {
  // Draw a slightly inset triangle outline for the bottom sub-triangle
  const pad = 4
  const bx = (ML.x + MR.x + BOT.x) / 3
  const by = (ML.y + MR.y + BOT.y) / 3
  // Shrink vertices toward centroid by pad
  function shrink(p: { x: number; y: number }) {
    const dx = bx - p.x; const dy = by - p.y
    const len = Math.hypot(dx, dy)
    return { x: p.x + (dx / len) * pad, y: p.y + (dy / len) * pad }
  }
  const sML = shrink(ML); const sMR = shrink(MR); const sBOT = shrink(BOT)
  return (
    <polygon
      points={pstr([sML, sMR, sBOT])}
      fill="none"
      stroke={HL_RING}
      strokeWidth={2.5}
      strokeDasharray="6,3"
    />
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────
export default function PyramidNetSASMO20G3Q15Explainer({
  lang = 'id', step, playing, onStepCount, onStepChange, onPlayEnd,
}: ExplainerProps) {
  const sb = buildPyramidNetSASMO20G3Q15Steps(lang)
  const holds = sb.steps.map(s => s.hold)
  const beat = useBeatControl(sb.finalIndex, {
    step, playing, onStepCount, onStepChange, onPlayEnd, holds,
  })
  const cur = sb.steps[beat]

  const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 380 }}>
      {/* Figure */}
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block' }}>
        <defs>
          <clipPath id="exp-lf"><polygon points={pstr([A, LL, BC])} /></clipPath>
          <clipPath id="exp-rf"><polygon points={pstr([A, BC, RL])} /></clipPath>
        </defs>

        {/* ── 3-D Pyramid (left half) ── */}
        <g transform={`translate(${PYR_TX},${PYR_TY}) scale(${PYR_SC})`}>
          {/* Left face — Face 2 (bow tie) */}
          <polygon points={pstr([A, LL, BC])} fill={PYR_LF} stroke={INK} strokeWidth={1.4} />
          <g clipPath="url(#exp-lf)">
            <ClownFace cx={CLF.x} cy={CLF.y} r={PYR_R} hatDot={false} bowTie={true} />
          </g>
          {/* Right face — Face 1 (hat dot) */}
          <polygon points={pstr([A, BC, RL])} fill={PYR_RF} stroke={INK} strokeWidth={1.4} />
          <g clipPath="url(#exp-rf)">
            <ClownFace cx={CRF.x} cy={CRF.y} r={PYR_R} hatDot={true} bowTie={false} />
          </g>
          {/* Base edges */}
          <line x1={LL.x} y1={LL.y} x2={RL.x} y2={RL.y} stroke={INK} strokeWidth={1.2} />
          <line x1={LL.x} y1={LL.y} x2={BC.x} y2={BC.y}
            stroke={INK} strokeWidth={0.8} strokeDasharray="5,3" />
          <line x1={RL.x} y1={RL.y} x2={BC.x} y2={BC.y}
            stroke={INK} strokeWidth={0.8} strokeDasharray="5,3" />
          <circle cx={A.x} cy={A.y} r={2.5} fill={INK} />

          {/* Animated highlights on pyramid */}
          <AnimatePresence>
            {cur.highlightF1 && (
              <motion.g key="f1ring" {...fade}>
                <F1Ring />
              </motion.g>
            )}
            {cur.highlightF2 && (
              <motion.g key="f2ring" {...fade}>
                <F2Ring />
              </motion.g>
            )}
          </AnimatePresence>
        </g>

        {/* ── Net B (right half) ── */}
        <g transform={`translate(${NET_TX},${NET_TY}) scale(${NET_SC})`}>
          <NetOption label="B" uid="exp-b" />

          {/* Animated highlight on bottom corner (Face 2 position) */}
          <AnimatePresence>
            {cur.highlightNetBot && (
              <motion.g key="netbot" {...fade}>
                <NetBotRing />
              </motion.g>
            )}
          </AnimatePresence>

          {/* "B" label */}
          <text x={100} y={178} textAnchor="middle"
            fontSize={13} fontWeight="bold" fill={INK}>
            B
          </text>
        </g>

        {/* Label line below figure */}
        {cur.label && (
          <text x={VW / 2} y={VH - 6} textAnchor="middle"
            fontSize={11} fontWeight={600} fill={cur.result ? ANS_C : '#1F2937'}>
            {cur.label}
          </text>
        )}

        {/* Divider */}
        <line x1={VW / 2} y1={10} x2={VW / 2} y2={VH - 20}
          stroke="#D1D5DB" strokeWidth={1} strokeDasharray="4,4" />
      </svg>

      {/* Caption */}
      <div style={{
        marginTop: 8, padding: '8px 12px',
        background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB',
        fontSize: 13, lineHeight: 1.5, color: '#374151',
        minHeight: 48,
      }}>
        {cur.caption}
      </div>

      {/* Clown face legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 6, padding: '4px 12px' }}>
        <svg width={60} height={36} viewBox="0 0 60 36">
          <ClownFace cx={16} cy={18} r={12} hatDot={true} bowTie={false} />
          <text x={30} y={13} fontSize={8} fill="#374151">Wajah 1</text>
          <text x={30} y={23} fontSize={7} fill="#6B7280">titik merah</text>
        </svg>
        <svg width={60} height={36} viewBox="0 0 60 36">
          <ClownFace cx={16} cy={16} r={12} hatDot={false} bowTie={true} />
          <text x={30} y={13} fontSize={8} fill="#374151">Wajah 2</text>
          <text x={30} y={23} fontSize={7} fill="#6B7280">dasi kupu</text>
        </svg>
      </div>
    </div>
  )
}
