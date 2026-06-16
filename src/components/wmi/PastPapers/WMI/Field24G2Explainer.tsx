import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'

// WMI-24F2A-Q8 — football field rectangle counter.
//
// The field has 4 equal vertical strips (each 30 m × 60 m) plus goal-area
// structures on both sides (penalty box + inner goal box) and small goal-net
// protrusions outside the field boundary.
//
// Rectangle count:
//   Width-1 (30 m wide):   4 strips — 30 ≠ 60, not squares          → +4  (total  4)
//   Width-2 (60 m wide):   3 spans  — 60 = 60, these ARE squares     → +0  (total  4)
//   Width-3 (90 m wide):   2 spans  — 90 ≠ 60, rectangles            → +2  (total  6)
//   Width-4 (120 m wide):  1 span   — 120 ≠ 60, rectangle            → +1  (total  7)
//   Left penalty box:      1                                           → +1  (total  8)
//   Right penalty box:     1                                           → +1  (total  9)
//   Left inner goal area:  1                                           → +1  (total 10)
//   Right inner goal area: 1                                           → +1  (total 11)
//   Left goal net:         1 (small protrusion left of field)          → +1  (total 12)
//   Right goal net:        1 (small protrusion right of field)         → +1  (total 13)
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// ---- Palette (echoes Field24G2Illustration / qupu tokens) --------------------
const FIELD_GREEN = '#a8c850'
const INK = '#1a1a1a'
const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const ROSE = '#e11d48'
const HIGHLIGHT_FILL = 'rgba(255,221,85,0.38)' // qupu-brand-yellow tint
const HIGHLIGHT_STROKE = '#f0853a'              // qupu-brand-orange
const SQUARE_FILL = 'rgba(225,29,72,0.18)'
const SQUARE_STROKE = ROSE

// ---- Field SVG constants (pixel space, matching Illustration) ----------------
const SCALE = 2.5
const FW = 120 * SCALE        // 300 px — field width
const FH = 60 * SCALE         // 150 px — field height
const SW = 30 * SCALE         // 75 px  — single strip width

const PENALTY_D = 18 * SCALE * 0.28  // depth ~12.6 px (inward from field edge)
const PENALTY_H = 20 * SCALE * 0.5   // half-height 25 px (so full height 50 px)
const GOAL_D = PENALTY_D * 0.45      // ~5.7 px
const GOAL_H = PENALTY_H * 0.45      // ~11.25 px
const GOAL_NET_D = 7                 // px — protrusion outside field boundary
const CC_R = 18
const ARC_R = FH / 2

// Compact layout: small padding, no right-side arc annotation
const PAD_LEFT = GOAL_NET_D + 2   // room for left goal net
const PAD_TOP = 22                // room for "30m" labels
const PAD_RIGHT = GOAL_NET_D + 2  // room for right goal net + arc peeks
const PAD_BOTTOM = 8
const VIEW_W = PAD_LEFT + FW + PAD_RIGHT
const VIEW_H = PAD_TOP + FH + PAD_BOTTOM

const FX = PAD_LEFT
const FY = PAD_TOP

// ---- Highlight rects by beat -------------------------------------------------
//
// Coordinates are in SVG pixel space (absolute, not relative to FX/FY).

type HRect = { x: number; y: number; w: number; h: number }

function stripRect(leftStrip: number, rightStrip: number): HRect {
  return {
    x: FX + leftStrip * SW,
    y: FY,
    w: (rightStrip - leftStrip) * SW,
    h: FH,
  }
}

// Goal-area rects in absolute SVG coordinates
const LEFT_PENALTY: HRect = {
  x: FX,
  y: FY + FH / 2 - PENALTY_H,
  w: PENALTY_D,
  h: PENALTY_H * 2,
}
const LEFT_GOAL: HRect = {
  x: FX,
  y: FY + FH / 2 - GOAL_H,
  w: GOAL_D,
  h: GOAL_H * 2,
}
const RIGHT_PENALTY: HRect = {
  x: FX + FW - PENALTY_D,
  y: FY + FH / 2 - PENALTY_H,
  w: PENALTY_D,
  h: PENALTY_H * 2,
}
const RIGHT_GOAL: HRect = {
  x: FX + FW - GOAL_D,
  y: FY + FH / 2 - GOAL_H,
  w: GOAL_D,
  h: GOAL_H * 2,
}

// Goal net protrusions (outside field boundary)
const LEFT_NET: HRect = {
  x: FX - GOAL_NET_D,
  y: FY + FH / 2 - GOAL_H * 0.55,
  w: GOAL_NET_D,
  h: GOAL_H * 1.1,
}
const RIGHT_NET: HRect = {
  x: FX + FW,
  y: FY + FH / 2 - GOAL_H * 0.55,
  w: GOAL_NET_D,
  h: GOAL_H * 1.1,
}

// Pre-built strip groups
const W1_RECTS: HRect[] = [
  stripRect(0, 1), stripRect(1, 2), stripRect(2, 3), stripRect(3, 4),
]
const W2_RECTS: HRect[] = [
  stripRect(0, 2), stripRect(1, 3), stripRect(2, 4),
]
const W3_RECTS: HRect[] = [
  stripRect(0, 3), stripRect(1, 4),
]
const W4_RECTS: HRect[] = [
  stripRect(0, 4),
]

// ---- Beat definition ---------------------------------------------------------

type Beat = {
  highlights: HRect[]
  squareRects: HRect[]   // shown in rose (rejected squares)
  running: number
  caption: { en: string; id: string }
  result?: boolean
  hold: number
}

const BEATS: Beat[] = [
  {
    highlights: [],
    squareRects: [],
    running: 0,
    hold: 2600,
    caption: {
      en: 'Find ALL rectangles — group by width, then check goal areas too!',
      id: 'Cari SEMUA persegi panjang — kelompokkan per lebar, lalu cek area gawang!',
    },
  },
  {
    highlights: W1_RECTS,
    squareRects: [],
    running: 4,
    hold: 2200,
    caption: {
      en: '1-strip wide (30 × 60 m): 4 rectangles — 30 ≠ 60, not squares. +4 → total 4',
      id: 'Lebar 1 jalur (30 × 60 m): 4 persegi panjang — 30 ≠ 60, bukan persegi. +4 → total 4',
    },
  },
  {
    highlights: [],
    squareRects: W2_RECTS,
    running: 4,
    hold: 2600,
    caption: {
      en: '2-strip wide (60 × 60 m): 3 shapes, but 60 = 60 — SQUARES! Drop them. Total stays 4',
      id: 'Lebar 2 jalur (60 × 60 m): 3 bangun, tapi 60 = 60 — PERSEGI! Buang. Total tetap 4',
    },
  },
  {
    highlights: W3_RECTS,
    squareRects: [],
    running: 6,
    hold: 2000,
    caption: {
      en: '3-strip wide (90 × 60 m): 2 rectangles. +2 → total 6',
      id: 'Lebar 3 jalur (90 × 60 m): 2 persegi panjang. +2 → total 6',
    },
  },
  {
    highlights: W4_RECTS,
    squareRects: [],
    running: 7,
    hold: 2000,
    caption: {
      en: 'Full field (120 × 60 m): 1 rectangle. +1 → total 7',
      id: 'Seluruh lapangan (120 × 60 m): 1 persegi panjang. +1 → total 7',
    },
  },
  {
    highlights: [LEFT_PENALTY, RIGHT_PENALTY],
    squareRects: [],
    running: 9,
    hold: 2200,
    caption: {
      en: 'Left + right penalty boxes: 2 rectangles. +2 → total 9',
      id: 'Kotak penalti kiri + kanan: 2 persegi panjang. +2 → total 9',
    },
  },
  {
    highlights: [LEFT_GOAL, RIGHT_GOAL],
    squareRects: [],
    running: 11,
    hold: 2200,
    caption: {
      en: 'Left + right inner goal areas: 2 rectangles. +2 → total 11',
      id: 'Kotak gawang kecil kiri + kanan: 2 persegi panjang. +2 → total 11',
    },
  },
  {
    highlights: [LEFT_NET, RIGHT_NET],
    squareRects: [],
    running: 13,
    hold: 2400,
    caption: {
      en: 'Left + right goal nets (outside the field): 2 more rectangles. +2 → total 13',
      id: 'Jaring gawang kiri + kanan (di luar lapangan): 2 persegi panjang lagi. +2 → total 13',
    },
  },
  {
    highlights: [],
    squareRects: [],
    running: 13,
    hold: 0,
    result: true,
    caption: {
      en: '13 rectangles in all (squares excluded) — answer D!',
      id: '13 persegi panjang semuanya (persegi tidak dihitung) — jawaban D!',
    },
  },
]

// ---- Mini field SVG ----------------------------------------------------------

function FieldSvg({
  highlights,
  squareRects,
}: {
  highlights: HRect[]
  squareRects: HRect[]
}) {
  const arcCx = FX + FW
  const arcCy = FY + FH / 2

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', maxWidth: 380 }}
      aria-hidden="true"
    >
      {/* Field background */}
      <rect x={FX} y={FY} width={FW} height={FH} fill={FIELD_GREEN} />

      {/* Square (rejected) highlights in rose */}
      {squareRects.map((r, i) => (
        <motion.rect
          key={`sq-${i}`}
          x={r.x}
          y={r.y}
          width={r.w}
          height={r.h}
          fill={SQUARE_FILL}
          stroke={SQUARE_STROKE}
          strokeWidth={2.5}
          rx={1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22, delay: i * 0.07 }}
        />
      ))}

      {/* Active highlight rectangles */}
      {highlights.map((r, i) => (
        <motion.rect
          key={`hl-${i}`}
          x={r.x}
          y={r.y}
          width={r.w}
          height={r.h}
          fill={HIGHLIGHT_FILL}
          stroke={HIGHLIGHT_STROKE}
          strokeWidth={2.5}
          rx={1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22, delay: i * 0.07 }}
        />
      ))}

      {/* Three interior vertical dividing lines */}
      {[1, 2, 3].map((i) => (
        <line
          key={`vl-${i}`}
          x1={FX + i * SW}
          y1={FY}
          x2={FX + i * SW}
          y2={FY + FH}
          stroke={INK}
          strokeWidth={1.2}
        />
      ))}

      {/* Centre circle */}
      <circle cx={FX + FW / 2} cy={FY + FH / 2} r={CC_R} fill="none" stroke={INK} strokeWidth={1.2} />
      <circle cx={FX + FW / 2} cy={FY + FH / 2} r={1.5} fill={INK} />

      {/* Right-side large arc (decorative) */}
      <path
        d={`M ${arcCx} ${arcCy - ARC_R} A ${ARC_R} ${ARC_R} 0 0 1 ${arcCx} ${arcCy + ARC_R}`}
        fill="none"
        stroke={INK}
        strokeWidth={1.2}
      />

      {/* Left penalty box */}
      <rect
        x={FX}
        y={FY + FH / 2 - PENALTY_H}
        width={PENALTY_D}
        height={PENALTY_H * 2}
        fill="none"
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* Left inner goal area */}
      <rect
        x={FX}
        y={FY + FH / 2 - GOAL_H}
        width={GOAL_D}
        height={GOAL_H * 2}
        fill="none"
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* Left goal net protrusion */}
      <rect
        x={FX - GOAL_NET_D}
        y={FY + FH / 2 - GOAL_H * 0.55}
        width={GOAL_NET_D}
        height={GOAL_H * 1.1}
        fill="none"
        stroke={INK}
        strokeWidth={1}
      />

      {/* Right penalty box */}
      <rect
        x={FX + FW - PENALTY_D}
        y={FY + FH / 2 - PENALTY_H}
        width={PENALTY_D}
        height={PENALTY_H * 2}
        fill="none"
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* Right inner goal area */}
      <rect
        x={FX + FW - GOAL_D}
        y={FY + FH / 2 - GOAL_H}
        width={GOAL_D}
        height={GOAL_H * 2}
        fill="none"
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* Right goal net protrusion */}
      <rect
        x={FX + FW}
        y={FY + FH / 2 - GOAL_H * 0.55}
        width={GOAL_NET_D}
        height={GOAL_H * 1.1}
        fill="none"
        stroke={INK}
        strokeWidth={1}
      />

      {/* Field outer border */}
      <rect x={FX} y={FY} width={FW} height={FH} fill="none" stroke={INK} strokeWidth={2} />

      {/* "30m" labels above each strip */}
      {[0, 1, 2, 3].map((i) => (
        <text
          key={`lbl-${i}`}
          x={FX + i * SW + SW / 2}
          y={FY - 8}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          fontWeight="600"
          fill={INK}
        >
          30m
        </text>
      ))}
    </svg>
  )
}

// ---- Running total badge -----------------------------------------------------

function TotalBadge({ n, result }: { n: number; result?: boolean }) {
  const bg = result ? '#D1FAE5' : '#E1EFFB'
  const border = result ? GREEN : BRAND_BLUE
  const color = result ? GREEN_INK : BRAND_BLUE

  return (
    <motion.div
      key={n}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: 14,
        padding: '6px 18px',
        minWidth: 72,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color, lineHeight: 1.1 }}>
        Total
      </span>
      <span style={{ fontSize: 30, fontWeight: 900, color, lineHeight: 1.1 }}>
        {n}
      </span>
    </motion.div>
  )
}

// ---- Main component ----------------------------------------------------------

export default function Field24G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const beats = useMemo(() => BEATS, [])
  const finalIndex = beats.length - 1

  const index = useBeatControl(finalIndex, {
    ...props,
    holds: beats.map((b) => b.hold),
  })
  const beat = beats[index] ?? beats[finalIndex]

  const ariaLabel = t(
    'Strategy: count rectangles by width group, drop the 60×60 squares, add goal-area and net boxes — total 13, answer D.',
    'Strategi: hitung persegi panjang per kelompok lebar, buang persegi 60×60, tambah kotak gawang dan jaring — total 13, jawaban D.',
  )

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Field figure with highlights */}
        <div className="w-full">
          <FieldSvg highlights={beat.highlights} squareRects={beat.squareRects} />
        </div>

        {/* Running total + caption row */}
        <div className="flex w-full items-center justify-center gap-3">
          <TotalBadge n={beat.running} result={beat.result} />

          <div
            className="flex-1 rounded-xl border-2 px-3 py-2 text-center font-display text-sm font-extrabold leading-snug"
            style={
              beat.result
                ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
                : beat.squareRects.length > 0
                  ? { background: '#FFF1F2', borderColor: ROSE, color: ROSE }
                  : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
            }
          >
            {lang === 'id' ? beat.caption.id : beat.caption.en}
          </div>
        </div>
      </div>
    </div>
  )
}
