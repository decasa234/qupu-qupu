// PentRoll24G3Explainer.tsx
// WMI-24F3A-Q15: regular pentagon card rolls around a regular hexagon.
// Teaches the method: track the smiley face orientation edge by edge.
// After 3 rolls (start → pos1 → pos2 → pos3) the face points at ~66°.
// Answer B. Deterministic + SSR-safe. No Math.random, no Date.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  HexBody,
  HEX_PENT_SCENE,
  type PentEdgeInfo,
} from './PentRoll24G3Illustration'

// ── colour tokens (mirror illustration palette) ───────────────────────────
const PENT_FILL = '#F9D0C8'
const PENT_STROKE = '#C87B50'
const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const GREEN_BG = '#D1FAE5'
const BLUE_BG = '#E1EFFB'
const MUTED = '#9CA3AF'
const ACTIVE_RING = '#F59E0B'  // amber highlight for current position

// ── scene constants (pulled from illustration) ────────────────────────────
const {
  hexCx: HEX_CX,
  hexCy: HEX_CY,
  hexR: HEX_R,
  pentR: PENT_R,
  pentApothem: PENT_APOTHEM,
} = HEX_PENT_SCENE

// ── geometry helpers ──────────────────────────────────────────────────────

function polyVerts(
  cx: number, cy: number, r: number, n: number, angle0Deg: number,
): Array<[number, number]> {
  return Array.from({ length: n }, (_, i) => {
    const a = ((angle0Deg + (i * 360) / n) * Math.PI) / 180
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number]
  })
}

function vertsToPoints(verts: Array<[number, number]>): string {
  return verts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

// Flat-top hexagon vertices (first vertex at 0°)
function computeHexVerts(): Array<[number, number]> {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 * Math.PI) / 180
    return [HEX_CX + HEX_R * Math.cos(a), HEX_CY + HEX_R * Math.sin(a)] as [number, number]
  })
}

// Pentagon info for each sequential position (seqPos 0..4 = start + pos1..4)
function computePentInfos(hexVerts: Array<[number, number]>): PentEdgeInfo[] {
  const EDGE_SEQ = [0, 1, 2, 3, 4]
  return EDGE_SEQ.map((eIdx, seqPos) => {
    const v0 = hexVerts[eIdx]
    const v1 = hexVerts[(eIdx + 1) % 6]
    const midX = (v0[0] + v1[0]) / 2
    const midY = (v0[1] + v1[1]) / 2
    const dx = midX - HEX_CX
    const dy = midY - HEX_CY
    const len = Math.sqrt(dx * dx + dy * dy)
    const nx = dx / len
    const ny = dy / len
    const pentCx = midX + nx * PENT_APOTHEM
    const pentCy = midY + ny * PENT_APOTHEM
    const normalDeg = Math.atan2(ny, nx) * (180 / Math.PI)
    const rollDeg = seqPos * 72
    const pent0Deg = normalDeg + rollDeg
    return { edgeIdx: eIdx, midX, midY, nx, ny, pentCx, pentCy, pent0Deg, rollDeg }
  })
}

// ── smiley face (matches illustration) ───────────────────────────────────

interface SmileyProps {
  cx: number; cy: number; r: number; apexDeg: number; color?: string
}
function SmileyFace({ cx, cy, r, apexDeg, color = '#5A3820' }: SmileyProps) {
  const apexRad = (apexDeg * Math.PI) / 180
  const ax = Math.cos(apexRad)
  const ay = Math.sin(apexRad)
  const px = -ay
  const py = ax
  const eyeR = r * 0.085
  const eyeDist = r * 0.20
  const eyeUp = r * 0.10
  const fCx = cx + ax * (r * 0.06)
  const fCy = cy + ay * (r * 0.06)
  const lEx = fCx - px * eyeDist + ax * eyeUp
  const lEy = fCy - py * eyeDist + ay * eyeUp
  const rEx = fCx + px * eyeDist + ax * eyeUp
  const rEy = fCy + py * eyeDist + ay * eyeUp
  const smileW = r * 0.20
  const smileDown = r * 0.12
  const smCx = fCx - ax * smileDown
  const smCy = fCy - ay * smileDown
  const smX1 = smCx - px * smileW
  const smY1 = smCy - py * smileW
  const smX2 = smCx + px * smileW
  const smY2 = smCy + py * smileW
  const cpX = smCx - ax * (r * 0.14)
  const cpY = smCy - ay * (r * 0.14)
  return (
    <g>
      <circle cx={lEx} cy={lEy} r={eyeR} fill={color} />
      <circle cx={rEx} cy={rEy} r={eyeR} fill={color} />
      <path
        d={`M ${smX1.toFixed(2)},${smY1.toFixed(2)} Q ${cpX.toFixed(2)},${cpY.toFixed(2)} ${smX2.toFixed(2)},${smY2.toFixed(2)}`}
        fill="none"
        stroke={color}
        strokeWidth={r * 0.07}
        strokeLinecap="round"
      />
    </g>
  )
}

// ── ghost pentagon outline (for visited positions) ────────────────────────

interface GhostPentProps {
  info: PentEdgeInfo
  isActive?: boolean
  showFace?: boolean
  highlight?: boolean
}
function GhostPent({ info, isActive = false, showFace = false, highlight = false }: GhostPentProps) {
  const { pentCx, pentCy, pent0Deg } = info
  const verts = polyVerts(pentCx, pentCy, PENT_R, 5, pent0Deg)
  const pts = vertsToPoints(verts)
  const fill = isActive ? PENT_FILL : highlight ? '#FEF3C7' : 'none'
  const stroke = isActive ? PENT_STROKE : highlight ? ACTIVE_RING : MUTED
  const strokeW = isActive ? 2.5 : highlight ? 2.5 : 1.5
  return (
    <g>
      <polygon
        points={pts}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeW}
        strokeDasharray={isActive || highlight ? undefined : '5 3'}
        strokeLinejoin="round"
        opacity={isActive ? 1 : 0.75}
      />
      {(isActive || showFace) && (
        <SmileyFace
          cx={pentCx}
          cy={pentCy}
          r={PENT_R}
          apexDeg={pent0Deg}
          color={isActive ? '#5A3820' : ACTIVE_RING}
        />
      )}
    </g>
  )
}

// ── beat storyboard ───────────────────────────────────────────────────────

interface Beat {
  /** Which seqPos (0..4) is active; -1 = answer reveal (all shown) */
  activePos: number
  /** Show ghost outlines up through this seqPos */
  visibleUpTo: number
  hold: number
  caption: string
  isFinal: boolean
}

function buildBeats(lang: 'en' | 'id'): Beat[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const beats: Beat[] = []

  // Beat 0: intro — pentagon at start, set the goal
  beats.push({
    activePos: 0,
    visibleUpTo: 0,
    hold: 2800,
    isFinal: false,
    caption: t(
      'The face starts here. Each roll turns it 1 fifth of a full turn (72°). Let\'s roll!',
      'Wajah mulai di sini. Tiap gulir memutar 1 per 5 putaran penuh (72°). Ayo gulingkan!',
    ),
  })

  // Beat 1: roll to position 1
  beats.push({
    activePos: 1,
    visibleUpTo: 1,
    hold: 2200,
    isFinal: false,
    caption: t(
      'Roll 1 → position 1. The face turned 72° clockwise.',
      'Gulir 1 → posisi 1. Wajah berputar 72° searah jarum jam.',
    ),
  })

  // Beat 2: roll to position 2
  beats.push({
    activePos: 2,
    visibleUpTo: 2,
    hold: 2200,
    isFinal: false,
    caption: t(
      'Roll 2 → position 2. Total turn: 144°.',
      'Gulir 2 → posisi 2. Total putaran: 144°.',
    ),
  })

  // Beat 3: roll to position 3 — the answer
  beats.push({
    activePos: 3,
    visibleUpTo: 3,
    hold: 2600,
    isFinal: false,
    caption: t(
      'Roll 3 → position 3. Total turn: 216°. This is the face we need!',
      'Gulir 3 → posisi 3. Total putaran: 216°. Inilah wajah yang kita cari!',
    ),
  })

  // Beat 4: final answer
  beats.push({
    activePos: 3,
    visibleUpTo: 3,
    hold: 0,
    isFinal: true,
    caption: t(
      '3 rolls × 72° = 216° — the card at position 3 matches option B.',
      '3 gulir × 72° = 216° — kartu di posisi 3 sesuai pilihan B.',
    ),
  })

  return beats
}

// ── main component ────────────────────────────────────────────────────────

export default function PentRoll24G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const beats = useMemo(() => buildBeats(lang), [lang])
  const finalIndex = beats.length - 1
  const index = useBeatControl(finalIndex, { ...props, holds: beats.map((b) => b.hold) })
  const beat = beats[index] ?? beats[finalIndex]

  // Geometry (pure, deterministic)
  const hexVerts = useMemo(() => computeHexVerts(), [])
  const pentInfos = useMemo(() => computePentInfos(hexVerts), [hexVerts])

  const ariaLabel = t(
    'Pentagon rolls around hexagon: 3 rolls of 72° each give 216° total rotation. The face at position 3 matches answer B.',
    'Segi lima menggelinding mengelilingi segi enam: 3 gulir masing-masing 72° memberi 216° total putaran. Wajah di posisi 3 sesuai jawaban B.',
  )

  // Position labels
  const posLabel = (seqPos: number) =>
    seqPos === 0 ? t('S', 'A') : String(seqPos)

  const W = 300
  const H = 300

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

          {/* Ghost pentagons for already-visited positions (not active) */}
          {pentInfos.map((info, seqPos) => {
            if (seqPos > beat.visibleUpTo) return null
            if (seqPos === beat.activePos) return null
            const isTarget = seqPos === 3 && beat.isFinal
            return (
              <GhostPent
                key={`ghost-${seqPos}`}
                info={info}
                isActive={false}
                showFace={isTarget}
                highlight={isTarget}
              />
            )
          })}

          {/* Active (solid) pentagon with smiley */}
          {pentInfos.map((info, seqPos) => {
            if (seqPos !== beat.activePos) return null
            return (
              <GhostPent
                key={`active-${seqPos}`}
                info={info}
                isActive
                showFace
              />
            )
          })}

          {/* Position labels */}
          {pentInfos.map((info, seqPos) => {
            if (seqPos > beat.visibleUpTo) return null
            const { pentCx, pentCy, pent0Deg } = info
            const apexRad = (pent0Deg * Math.PI) / 180
            const lx = pentCx + Math.cos(apexRad) * (PENT_R + 14)
            const ly = pentCy + Math.sin(apexRad) * (PENT_R + 14)
            const isActive = seqPos === beat.activePos
            const isTarget = seqPos === 3 && beat.isFinal
            const fillColor = isActive || isTarget ? ACTIVE_RING : BRAND_BLUE
            return (
              <text
                key={`lbl-${seqPos}`}
                x={lx.toFixed(1)}
                y={ly.toFixed(1)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={15}
                fontWeight={700}
                fill={fillColor}
              >
                {posLabel(seqPos)}
              </text>
            )
          })}

          {/* Roll-count badge in centre of hexagon */}
          {beat.activePos > 0 && (
            <g>
              <text
                x={HEX_CX}
                y={HEX_CY - 8}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={700}
                fill={BRAND_BLUE}
              >
                {beat.activePos} {t('roll(s)', 'gulir')}
              </text>
              <text
                x={HEX_CX}
                y={HEX_CY + 10}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
                fill={BRAND_BLUE}
              >
                {beat.activePos * 72}°
              </text>
            </g>
          )}
        </svg>

        {/* Final answer badge */}
        {beat.isFinal && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="rounded-full px-5 py-1 font-display text-lg font-black"
            style={{ background: GREEN_BG, color: GREEN_INK, border: `2px solid ${GREEN}` }}
          >
            {t('Answer B', 'Jawaban B')}
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
