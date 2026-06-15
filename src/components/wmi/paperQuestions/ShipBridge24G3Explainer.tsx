// Post-answer explainer for WMI-24F3A-Q2 (ship width via bridge segment proportion).
// Strategy: 156 m ÷ 16 segments = 9.75 m each → ship spans 4 → 4 × 9.75 = 39 m (answer B).

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { BRIDGE_SEGMENTS, SHIP_SEGMENTS, BRIDGE_LENGTH_M } from './ShipBridge24G3Illustration'

// ── colour tokens ──────────────────────────────────────────────────────────────
const INK = '#1F2937'
const DECK_EVEN = '#FFFFFF'
const DECK_ODD = '#B0B8C1'
const RAIL_COLOR = '#9CA3AF'
const HIGHLIGHT_SEG = '#FDE68A'   // amber — active segment group
const SHIP_FILL = '#E5E7EB'
const SHIP_CABIN = '#F3F4F6'
const BLUE = '#2563EB'
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = '#10B981'
const GREEN_TEXT = '#065F46'
const INFO_BG = '#E1EFFB'
const INFO_BORDER = '#30598A'
const INFO_TEXT = '#30598A'

// ── derived constants (deterministic) ─────────────────────────────────────────
const ONE_SEG_M = BRIDGE_LENGTH_M / BRIDGE_SEGMENTS          // 9.75
const SHIP_WIDTH_M = SHIP_SEGMENTS * ONE_SEG_M               // 39

// ── bilingual helper ──────────────────────────────────────────────────────────
function t(lang: string, en: string, id: string) {
  return lang === 'id' ? id : en
}

// ── beat definitions ──────────────────────────────────────────────────────────
type Phase = 'intro' | 'divide' | 'highlight' | 'multiply' | 'answer'

interface Beat {
  phase: Phase
  hold: number
  caption: string
}

function buildBeats(lang: string): Beat[] {
  return [
    {
      phase: 'intro',
      hold: 2600,
      caption: t(
        lang,
        `The bridge (${BRIDGE_LENGTH_M} m) is split into ${BRIDGE_SEGMENTS} equal parts. Find one part, then count how many the ship covers.`,
        `Jembatan (${BRIDGE_LENGTH_M} m) dibagi menjadi ${BRIDGE_SEGMENTS} ruas sama. Cari satu ruas, lalu hitung berapa ruas yang ditutupi kapal.`,
      ),
    },
    {
      phase: 'divide',
      hold: 2400,
      caption: t(
        lang,
        `${BRIDGE_LENGTH_M} ÷ ${BRIDGE_SEGMENTS} = ${ONE_SEG_M} m per segment`,
        `${BRIDGE_LENGTH_M} ÷ ${BRIDGE_SEGMENTS} = ${ONE_SEG_M} m per ruas`,
      ),
    },
    {
      phase: 'highlight',
      hold: 2200,
      caption: t(
        lang,
        `The ship sits between the dotted lines — it covers ${SHIP_SEGMENTS} segments.`,
        `Kapal berada di antara garis putus-putus — menutupi ${SHIP_SEGMENTS} ruas.`,
      ),
    },
    {
      phase: 'multiply',
      hold: 2200,
      caption: t(
        lang,
        `${SHIP_SEGMENTS} × ${ONE_SEG_M} m = ${SHIP_WIDTH_M} m`,
        `${SHIP_SEGMENTS} × ${ONE_SEG_M} m = ${SHIP_WIDTH_M} m`,
      ),
    },
    {
      phase: 'answer',
      hold: 0,
      caption: t(
        lang,
        `Ship width = ${SHIP_WIDTH_M} m → answer B`,
        `Lebar kapal = ${SHIP_WIDTH_M} m → jawaban B`,
      ),
    },
  ]
}

// ── SVG sub-components ────────────────────────────────────────────────────────

const VW = 400
const VH = 220
const ABUT_W = 48
const DECK_Y = 72
const DECK_H = 16
const DECK_X = ABUT_W
const DECK_W = VW - 2 * ABUT_W
const RAIL_H = 22
const RAIL_Y = DECK_Y - RAIL_H
const BAND_H = 10
const BAND_Y = DECK_Y + DECK_H
const SEG_W = DECK_W / BRIDGE_SEGMENTS

// Ship spans segments 6-9 (0-indexed), same as the illustration
const SHIP_START_SEG = 6
const SHIP_LEFT = DECK_X + SHIP_START_SEG * SEG_W
const SHIP_RIGHT = DECK_X + (SHIP_START_SEG + SHIP_SEGMENTS) * SEG_W
const SHIP_CX = (SHIP_LEFT + SHIP_RIGHT) / 2
const SHIP_W = SHIP_RIGHT - SHIP_LEFT
const SHIP_H = 70
const SHIP_TOP_Y = BAND_Y + 8
const SHIP_CY = SHIP_TOP_Y + SHIP_H * 0.5
const MARKER_TOP = BAND_Y + 2
const MARKER_BOTTOM = SHIP_TOP_Y + SHIP_H + 6

function BridgeDeck({ highlightSegs }: { highlightSegs: boolean }) {
  return (
    <g>
      {Array.from({ length: BRIDGE_SEGMENTS }, (_, i) => {
        const inShip = i >= SHIP_START_SEG && i < SHIP_START_SEG + SHIP_SEGMENTS
        const fill = highlightSegs && inShip
          ? HIGHLIGHT_SEG
          : i % 2 === 0 ? DECK_EVEN : DECK_ODD
        return (
          <rect
            key={i}
            x={DECK_X + i * SEG_W}
            y={DECK_Y}
            width={SEG_W}
            height={DECK_H}
            fill={fill}
            stroke={INK}
            strokeWidth={0.6}
          />
        )
      })}
      <rect x={DECK_X} y={DECK_Y} width={DECK_W} height={DECK_H} fill="none" stroke={INK} strokeWidth={1.5} />
    </g>
  )
}

function BridgeRailing() {
  const postCount = 10
  const postSpacing = DECK_W / (postCount - 1)
  return (
    <g>
      <line x1={DECK_X} y1={RAIL_Y} x2={DECK_X + DECK_W} y2={RAIL_Y} stroke={INK} strokeWidth={2} />
      <line x1={DECK_X} y1={RAIL_Y + RAIL_H} x2={DECK_X + DECK_W} y2={RAIL_Y + RAIL_H} stroke={INK} strokeWidth={2} />
      {Array.from({ length: postCount }, (_, i) => (
        <line
          key={i}
          x1={DECK_X + i * postSpacing}
          y1={RAIL_Y}
          x2={DECK_X + i * postSpacing}
          y2={RAIL_Y + RAIL_H}
          stroke={INK}
          strokeWidth={1.5}
        />
      ))}
    </g>
  )
}

function Abutment({ x, w, flip }: { x: number; w: number; flip?: boolean }) {
  const h = DECK_Y + DECK_H + BAND_H - (DECK_Y - RAIL_H)
  const y = DECK_Y - RAIL_H
  const pts = flip
    ? `${x},${y + h} ${x},${y} ${x + w * 0.6},${y} ${x + w},${y + h}`
    : `${x},${y + h} ${x},${y} ${x + w},${y} ${x + w * 0.4},${y + h}`
  return <polygon points={pts} fill={RAIL_COLOR} stroke={INK} strokeWidth={1} />
}

function ShipBody() {
  const hullH = SHIP_H * 0.42
  const cabinW = SHIP_W * 0.5
  const tier1H = SHIP_H * 0.24
  const tier2H = SHIP_H * 0.16
  const tier3H = SHIP_H * 0.1
  const tier2W = cabinW * 0.72
  const tier3W = cabinW * 0.45
  const hullTop = SHIP_CY - SHIP_H * 0.5 + (SHIP_H - hullH)
  const hullBottom = SHIP_CY + SHIP_H * 0.5
  const hl = SHIP_CX - SHIP_W / 2
  const hr = SHIP_CX + SHIP_W / 2
  const hullPath = `M ${hl} ${hullTop} L ${hr} ${hullTop} L ${hr - 8} ${hullBottom} Q ${SHIP_CX} ${hullBottom + 6} ${hl + 8} ${hullBottom} Z`
  const tier1Y = hullTop - tier1H
  const tier2Y = tier1Y - tier2H
  const tier3Y = tier2Y - tier3H
  const mastH = SHIP_H * 0.08
  return (
    <g>
      <path d={hullPath} fill={SHIP_FILL} stroke={INK} strokeWidth={1.5} />
      <text x={SHIP_CX} y={hullTop + hullH * 0.55} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800} fill={INK}>038</text>
      <rect x={SHIP_CX - cabinW / 2} y={tier1Y} width={cabinW} height={tier1H} fill={SHIP_CABIN} stroke={INK} strokeWidth={1.2} />
      <rect x={SHIP_CX - tier2W / 2} y={tier2Y} width={tier2W} height={tier2H} fill={SHIP_CABIN} stroke={INK} strokeWidth={1.2} />
      <rect x={SHIP_CX - tier3W / 2} y={tier3Y} width={tier3W} height={tier3H} fill={SHIP_CABIN} stroke={INK} strokeWidth={1.2} />
      <rect x={SHIP_CX - 1.5} y={tier3Y - mastH} width={3} height={mastH} fill={INK} />
    </g>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function ShipBridge24G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const steps = useMemo(() => buildBeats(lang), [lang])

  const finalIndex = steps.length - 1
  const index = useBeatControl(finalIndex, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[finalIndex]

  const isAnswer = beat.phase === 'answer'
  const showHighlight = beat.phase === 'highlight' || beat.phase === 'multiply' || isAnswer
  const showDivisionLabel = beat.phase === 'divide' || showHighlight
  const showMultiplyLabel = beat.phase === 'multiply' || isAnswer
  const showQuestionMark = beat.phase === 'intro' || beat.phase === 'divide'
  const showAnswerBadge = isAnswer

  const ariaLabel = t(
    lang,
    `Bridge-proportion strategy: 156 m ÷ 16 segments = 9.75 m each; ship covers 4 segments; 4 × 9.75 = 39 m — answer B.`,
    `Strategi proporsi jembatan: 156 m ÷ 16 ruas = 9,75 m tiap ruas; kapal menutupi 4 ruas; 4 × 9,75 = 39 m — jawaban B.`,
  )

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          width="100%"
          style={{ maxWidth: 440, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* abutments */}
          <Abutment x={0} w={ABUT_W + 4} />
          <Abutment x={VW - ABUT_W - 4} w={ABUT_W + 4} flip />

          {/* bridge band */}
          <rect x={DECK_X} y={BAND_Y} width={DECK_W} height={BAND_H} fill={RAIL_COLOR} stroke={INK} strokeWidth={1} />

          {/* checkerboard deck (highlighted if needed) */}
          <BridgeDeck highlightSegs={showHighlight} />

          {/* railing */}
          <BridgeRailing />

          {/* dotted markers */}
          <line x1={SHIP_LEFT} y1={MARKER_TOP} x2={SHIP_LEFT} y2={MARKER_BOTTOM} stroke={INK} strokeWidth={1.2} strokeDasharray="4 3" />
          <line x1={SHIP_RIGHT} y1={MARKER_TOP} x2={SHIP_RIGHT} y2={MARKER_BOTTOM} stroke={INK} strokeWidth={1.2} strokeDasharray="4 3" />

          {/* ship */}
          <ShipBody />

          {/* bridge length label above railing */}
          <text x={VW / 2} y={RAIL_Y - 6} textAnchor="middle" dominantBaseline="auto" fontSize={11} fontWeight={700} fill={INK}>{BRIDGE_LENGTH_M} m</text>
          <line x1={DECK_X + 4} y1={RAIL_Y - 4} x2={VW / 2 - 20} y2={RAIL_Y - 4} stroke={INK} strokeWidth={1} />
          <line x1={VW / 2 + 20} y1={RAIL_Y - 4} x2={VW - DECK_X - 4} y2={RAIL_Y - 4} stroke={INK} strokeWidth={1} />
          <polygon points={`${DECK_X + 2},${RAIL_Y - 7} ${DECK_X + 8},${RAIL_Y - 4} ${DECK_X + 2},${RAIL_Y - 1}`} fill={INK} />
          <polygon points={`${VW - DECK_X - 2},${RAIL_Y - 7} ${VW - DECK_X - 8},${RAIL_Y - 4} ${VW - DECK_X - 2},${RAIL_Y - 1}`} fill={INK} />

          {/* per-segment length label (appears from divide beat) */}
          {showDivisionLabel && (
            <text
              x={DECK_X + SEG_W / 2}
              y={DECK_Y + DECK_H + BAND_H + 14}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={9}
              fontWeight={700}
              fill="#D97706"
            >
              {ONE_SEG_M} m
            </text>
          )}

          {/* segment-count brace over highlighted segments */}
          {showHighlight && (
            <>
              <line
                x1={SHIP_LEFT}
                y1={DECK_Y - 2}
                x2={SHIP_RIGHT}
                y2={DECK_Y - 2}
                stroke="#D97706"
                strokeWidth={2}
              />
              <text
                x={SHIP_CX}
                y={DECK_Y - 10}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight={700}
                fill="#D97706"
              >
                {SHIP_SEGMENTS} {t(lang, 'segs', 'ruas')}
              </text>
            </>
          )}

          {/* width label below ship */}
          {showQuestionMark && (
            <text
              x={SHIP_CX}
              y={MARKER_BOTTOM + 10}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={700}
              fill={BLUE}
            >
              ? m
            </text>
          )}

          {showMultiplyLabel && !isAnswer && (
            <text
              x={SHIP_CX}
              y={MARKER_BOTTOM + 10}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={700}
              fill="#D97706"
            >
              {SHIP_SEGMENTS} × {ONE_SEG_M}
            </text>
          )}

          {/* answer badge on final beat */}
          {showAnswerBadge && (
            <>
              <rect
                x={SHIP_CX - 28}
                y={MARKER_BOTTOM + 2}
                width={56}
                height={20}
                rx={6}
                fill={GREEN_BG}
                stroke={GREEN_BORDER}
                strokeWidth={1.5}
              />
              <text
                x={SHIP_CX}
                y={MARKER_BOTTOM + 12}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={800}
                fill={GREEN_TEXT}
              >
                {SHIP_WIDTH_M} m
              </text>
            </>
          )}
        </svg>

        {/* animated equation row */}
        <motion.div
          key={beat.phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="font-display text-xs font-bold"
          style={{ color: isAnswer ? GREEN_TEXT : INFO_TEXT }}
        >
          {beat.phase === 'divide' && `${BRIDGE_LENGTH_M} ÷ ${BRIDGE_SEGMENTS} = ${ONE_SEG_M} m`}
          {beat.phase === 'multiply' && `${SHIP_SEGMENTS} × ${ONE_SEG_M} m = ${SHIP_WIDTH_M} m`}
          {isAnswer && `${SHIP_WIDTH_M} m → B`}
        </motion.div>

        {/* caption box */}
        <motion.div
          key={`cap-${beat.phase}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isAnswer
              ? { background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN_TEXT }
              : { background: INFO_BG, borderColor: INFO_BORDER, color: INFO_TEXT }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
