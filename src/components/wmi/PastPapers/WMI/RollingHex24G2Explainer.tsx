// RollingHex24G2Explainer.tsx
// WMI-24F2A-Q15: equilateral triangle rolls around a regular hexagon.
// Teaches the method: watch the smiley face orientation at each position.
// After 5 rolls (+ return to start) only 2 distinct orientations appear → A.
// Deterministic + SSR-safe. No Math.random, no Date.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  HexBody,
  HEX_TRI_SCENE,
} from './RollingHex24G2Illustration'

// ── colour tokens (mirror the illustration palette) ────────────────────────
const TRI_FILL = '#F9D8C8'        // peach / pink
const TRI_STROKE = '#C87B50'
const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const GREEN_BG = '#D1FAE5'
const BLUE_BG = '#E1EFFB'
const MUTED = '#9aa3b2'

// Family A orientations (apex up-ish: -90°, 30°, 150°)
const FAMILY_A_COLOR = '#2563EB'   // blue highlight
const FAMILY_B_COLOR = '#D97706'   // amber highlight

// ── scene geometry (cloned from illustration constants) ────────────────────
const { hexCx: HEX_CX, hexCy: HEX_CY, hexR: HEX_R, triR: TRI_R, triCentOffset: TRI_CENT_OFFSET, edgeSeq: EDGE_SEQ } = HEX_TRI_SCENE

// Pre-compute hex vertices (flat-top, first vertex at 0°)
function computeHexVerts(): Array<[number, number]> {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 * Math.PI) / 180
    return [HEX_CX + HEX_R * Math.cos(a), HEX_CY + HEX_R * Math.sin(a)] as [number, number]
  })
}

interface EdgeInfo {
  midX: number; midY: number
  nx: number; ny: number
  triCx: number; triCy: number
  apexDeg: number
}

function computeEdgeInfoAll(verts: Array<[number, number]>): EdgeInfo[] {
  return verts.map((v, i) => {
    const next = verts[(i + 1) % 6]
    const midX = (v[0] + next[0]) / 2
    const midY = (v[1] + next[1]) / 2
    const dx = midX - HEX_CX
    const dy = midY - HEX_CY
    const len = Math.sqrt(dx * dx + dy * dy)
    const nx = dx / len
    const ny = dy / len
    const triCx = midX + nx * TRI_CENT_OFFSET
    const triCy = midY + ny * TRI_CENT_OFFSET
    const apexDeg = Math.atan2(ny, nx) * (180 / Math.PI)
    return { midX, midY, nx, ny, triCx, triCy, apexDeg }
  })
}

// Triangle apex angles per position (start + pos1..5)
// start=-90, pos1=-30, pos2=30, pos3=90, pos4=150, pos5=-150
// Family A (apex at -90°, 30°, 150°) — same look as starting
// Family B (apex at -30°, 90°, -150°) — flipped look
function orientationFamily(apexDeg: number): 'A' | 'B' {
  // Normalise to 0..360
  const a = ((apexDeg % 360) + 360) % 360
  // Family A members: 270 (-90), 30, 150
  const familyA = [270, 30, 150]
  return familyA.some((f) => Math.abs(a - f) < 1) ? 'A' : 'B'
}

// ── smiley face (matches illustration) ────────────────────────────────────
interface SmileyProps { cx: number; cy: number; r: number; apexDeg: number; color?: string }
function SmileyFace({ cx, cy, r, apexDeg, color = '#5A3820' }: SmileyProps) {
  const apexRad = (apexDeg * Math.PI) / 180
  const ax = Math.cos(apexRad)
  const ay = Math.sin(apexRad)
  const px = -Math.sin(apexRad)
  const py = Math.cos(apexRad)
  const eyeR = r * 0.09
  const eyeDist = r * 0.22
  const eyeUp = r * 0.12
  const fCx = cx + ax * (r * 0.08)
  const fCy = cy + ay * (r * 0.08)
  const lEx = fCx - px * eyeDist + ax * eyeUp
  const lEy = fCy - py * eyeDist + ay * eyeUp
  const rEx = fCx + px * eyeDist + ax * eyeUp
  const rEy = fCy + py * eyeDist + ay * eyeUp
  const smileW = r * 0.22
  const smileDown = r * 0.15
  const smCx = fCx - ax * smileDown
  const smCy = fCy - ay * smileDown
  const smX1 = smCx - px * smileW
  const smY1 = smCy - py * smileW
  const smX2 = smCx + px * smileW
  const smY2 = smCy + py * smileW
  const cpX = smCx - ax * (r * 0.15)
  const cpY = smCy - ay * (r * 0.15)
  return (
    <g>
      <circle cx={lEx} cy={lEy} r={eyeR} fill={color} />
      <circle cx={rEx} cy={rEy} r={eyeR} fill={color} />
      <path
        d={`M ${smX1.toFixed(2)},${smY1.toFixed(2)} Q ${cpX.toFixed(2)},${cpY.toFixed(2)} ${smX2.toFixed(2)},${smY2.toFixed(2)}`}
        fill="none" stroke={color} strokeWidth={r * 0.07} strokeLinecap="round"
      />
    </g>
  )
}

// ── triangle polygon helper ────────────────────────────────────────────────
function polyPts(cx: number, cy: number, r: number, n: number, angle0Deg: number): string {
  return Array.from({ length: n }, (_, i) => {
    const a = ((angle0Deg + (i * 360) / n) * Math.PI) / 180
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}
function triPoints(cx: number, cy: number, r: number, apexDeg: number): string {
  return polyPts(cx, cy, r, 3, apexDeg)
}

// ── beat storyboard ────────────────────────────────────────────────────────

interface Beat {
  // Which position is "active" (0 = start, 1..5 = positions, 6 = back to start)
  activePos: number
  // How many positions have been visited so far (for trail rendering)
  visitedUpTo: number
  hold: number
  caption: string
  isFinal: boolean
}

function buildSteps(lang: 'en' | 'id'): Beat[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Position labels: 0='start', 1..5
  const posName = (p: number) => p === 0 ? t('start', 'awal') : String(p)

  // Apex angles at each position (0=start, 1=pos1, ..., 5=pos5)
  // start=-90, pos1=-30, pos2=30, pos3=90, pos4=150, pos5=-150
  const apexAngles = [-90, -30, 30, 90, 150, -150]
  const familyOf = (i: number) => orientationFamily(apexAngles[i])

  const steps: Beat[] = []

  // Beat 0: intro — triangle at start, explain the plan
  steps.push({
    activePos: 0,
    visitedUpTo: 0,
    hold: 2800,
    isFinal: false,
    caption: t(
      'Watch the smiley face as the triangle rolls around the hexagon. Does it keep changing?',
      'Perhatikan wajah senyum saat segitiga menggelinding mengelilingi segi enam. Apakah terus berubah?',
    ),
  })

  // Beats 1..5: roll to positions 1 through 5
  for (let pos = 1; pos <= 5; pos++) {
    const fam = familyOf(pos)
    const prev = familyOf(pos - 1)
    const sameAsPrev = fam === prev
    const sameAsStart = fam === familyOf(0)
    const lookDesc = sameAsStart
      ? t('same look as start!', 'tampilan sama seperti awal!')
      : t('different look', 'tampilan berbeda')
    steps.push({
      activePos: pos,
      visitedUpTo: pos,
      hold: 2000,
      isFinal: false,
      caption: t(
        `Position ${posName(pos)}: face points ${fam === 'A' ? 'up' : 'down'} — ${sameAsPrev ? 'flipped from last' : 'same as last'} → ${lookDesc}`,
        `Posisi ${posName(pos)}: wajah mengarah ${fam === 'A' ? 'ke atas' : 'ke bawah'} — ${sameAsPrev ? 'terbalik dari sebelumnya' : 'sama dengan sebelumnya'} → ${lookDesc}`,
      ),
    })
  }

  // Beat 6: back to start
  steps.push({
    activePos: 0,
    visitedUpTo: 6,
    hold: 2400,
    isFinal: false,
    caption: t(
      'Back at start. Let\'s count how many different looks we saw.',
      'Kembali ke awal. Mari hitung berapa tampilan berbeda yang kita temui.',
    ),
  })

  // Beat 7: comparison — highlight family A positions
  steps.push({
    activePos: -1,   // show all, highlight by family
    visitedUpTo: 6,
    hold: 2600,
    isFinal: false,
    caption: t(
      'Blue (A): start, pos 2, pos 4 — all look the same. Amber (B): pos 1, 3, 5 — all look the same.',
      'Biru (A): awal, pos 2, pos 4 — semua sama. Amber (B): pos 1, 3, 5 — semua sama.',
    ),
  })

  // Beat 8: final answer
  steps.push({
    activePos: -2,   // answer reveal
    visitedUpTo: 6,
    hold: 0,
    isFinal: true,
    caption: t(
      'Only 2 different orientations in total → Answer A.',
      'Hanya 2 orientasi berbeda seluruhnya → Jawaban A.',
    ),
  })

  return steps
}

// ── main component ─────────────────────────────────────────────────────────

export default function RollingHex24G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo(() => buildSteps(lang), [lang])
  const finalIndex = steps.length - 1
  const index = useBeatControl(finalIndex, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[finalIndex]

  // Pre-compute geometry (pure, no hooks)
  const hexVerts = useMemo(() => computeHexVerts(), [])
  const edgeInfoAll = useMemo(() => computeEdgeInfoAll(hexVerts), [hexVerts])

  // Apex angles per seq position (index 0=start, 1..5=pos1..5)
  const apexAngles = [-90, -30, 30, 90, 150, -150]

  const ariaLabel = t(
    'The triangle rolls around the hexagon showing only 2 distinct orientations in total. Answer A.',
    'Segitiga menggelinding mengelilingi segi enam, hanya menunjukkan 2 orientasi berbeda. Jawaban A.',
  )

  // Positions to render as trail (ghost + family colour)
  const showAll = beat.activePos === -1 || beat.activePos === -2

  // For each sequential position (0..5), determine rendering state
  interface PosState {
    seqIdx: number      // 0=start, 1..5=positions
    edgeIdx: number     // which hexagon edge
    visible: boolean
    isActive: boolean
    familyHighlight: 'A' | 'B' | null
    showFace: boolean
  }

  const posStates: PosState[] = EDGE_SEQ.map((edgeIdx, seqIdx) => {
    const visited = seqIdx <= beat.visitedUpTo || showAll
    const isActive = beat.activePos === seqIdx
    let familyHighlight: 'A' | 'B' | null = null
    if (showAll) {
      familyHighlight = orientationFamily(apexAngles[seqIdx])
    }
    return {
      seqIdx,
      edgeIdx,
      visible: visited,
      isActive,
      familyHighlight,
      showFace: isActive || showAll,
    }
  })

  // SVG dimensions matching illustration
  const W = 300, H = 308

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-3 py-4"
        style={{ background: '#FFF9F4', borderColor: '#FFD3B1' }}
      >
        {/* Scene SVG */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ maxWidth: W, display: 'block' }}
          aria-hidden="true"
        >
          {/* Hexagon */}
          <HexBody verts={hexVerts} />

          {/* Ghost triangles for visited positions (non-active) */}
          {posStates.map(({ seqIdx, edgeIdx, visible, isActive, familyHighlight }) => {
            if (!visible || isActive) return null
            const info = edgeInfoAll[edgeIdx]
            const { triCx, triCy, apexDeg } = info
            const pts = triPoints(triCx, triCy, TRI_R, apexDeg)
            const famColor = familyHighlight === 'A' ? FAMILY_A_COLOR : familyHighlight === 'B' ? FAMILY_B_COLOR : MUTED
            const strokeColor = familyHighlight ? famColor : MUTED
            return (
              <g key={`ghost-${seqIdx}`}>
                <polygon
                  points={pts}
                  fill={familyHighlight === 'A' ? '#DBEAFE' : familyHighlight === 'B' ? '#FEF3C7' : 'none'}
                  stroke={strokeColor}
                  strokeWidth={familyHighlight ? 2 : 1.5}
                  strokeDasharray={familyHighlight ? undefined : '5 3'}
                  strokeLinejoin="round"
                  opacity={familyHighlight ? 0.85 : 0.7}
                />
                {familyHighlight && (
                  <SmileyFace cx={triCx} cy={triCy} r={TRI_R} apexDeg={apexDeg} color={famColor} />
                )}
              </g>
            )
          })}

          {/* Active (solid) triangle with smiley */}
          {posStates.map(({ seqIdx, edgeIdx, isActive }) => {
            if (!isActive) return null
            const info = edgeInfoAll[edgeIdx]
            const { triCx, triCy, apexDeg } = info
            const pts = triPoints(triCx, triCy, TRI_R, apexDeg)
            return (
              <g key={`active-${seqIdx}`}>
                <polygon
                  points={pts}
                  fill={TRI_FILL}
                  stroke={TRI_STROKE}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                />
                <SmileyFace cx={triCx} cy={triCy} r={TRI_R} apexDeg={apexDeg} />
              </g>
            )
          })}

          {/* Position labels */}
          {posStates.map(({ seqIdx, edgeIdx, visible }) => {
            if (seqIdx === 0 || !visible) return null
            const info = edgeInfoAll[edgeIdx]
            const { triCx, triCy, apexDeg } = info
            const apexRad = (apexDeg * Math.PI) / 180
            const lx = triCx + Math.cos(apexRad) * (TRI_R + 13)
            const ly = triCy + Math.sin(apexRad) * (TRI_R + 13)
            const famColor = beat.activePos === -1 || beat.activePos === -2
              ? (orientationFamily(apexAngles[seqIdx]) === 'A' ? FAMILY_A_COLOR : FAMILY_B_COLOR)
              : BRAND_BLUE
            return (
              <text
                key={`lbl-${seqIdx}`}
                x={lx.toFixed(1)}
                y={ly.toFixed(1)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={15}
                fontWeight={700}
                fill={famColor}
              >
                {seqIdx}
              </text>
            )
          })}

          {/* "S" label at start position */}
          {(() => {
            const startEdgeIdx = EDGE_SEQ[0]
            const info = edgeInfoAll[startEdgeIdx]
            const { triCx, triCy, apexDeg } = info
            const apexRad = (apexDeg * Math.PI) / 180
            const lx = triCx + Math.cos(apexRad) * (TRI_R + 13)
            const ly = triCy + Math.sin(apexRad) * (TRI_R + 13)
            const famColor = (beat.activePos === -1 || beat.activePos === -2) ? FAMILY_A_COLOR : BRAND_BLUE
            return (
              <text
                x={lx.toFixed(1)}
                y={ly.toFixed(1)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={700}
                fill={famColor}
              >
                {t('S', 'A')}
              </text>
            )
          })()}
        </svg>

        {/* Orientation badge row (beat 7 and 8) */}
        {(beat.activePos === -1 || beat.activePos === -2) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="flex items-center gap-4 font-display text-sm font-extrabold"
          >
            <span style={{ color: FAMILY_A_COLOR }}>
              {t('Look A (×3)', 'Tampilan A (×3)')}
            </span>
            <span style={{ color: MUTED }}>+</span>
            <span style={{ color: FAMILY_B_COLOR }}>
              {t('Look B (×3)', 'Tampilan B (×3)')}
            </span>
            <span style={{ color: BRAND_BLUE }}>=</span>
            <span style={{ color: beat.isFinal ? GREEN_INK : BRAND_BLUE, fontSize: beat.isFinal ? '1.2em' : undefined }}>
              {t('2 total', '2 total')}
            </span>
          </motion.div>
        )}

        {/* Final answer badge */}
        {beat.isFinal && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="rounded-full px-5 py-1 font-display text-lg font-black"
            style={{ background: GREEN_BG, color: GREEN_INK, border: `2px solid ${GREEN}` }}
          >
            {t('Answer A = 2', 'Jawaban A = 2')}
          </motion.div>
        )}

        {/* Caption box */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.isFinal
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
