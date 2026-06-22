// IKMC-21-PE-Q15 — "The picture shows the five houses of five friends and their
// school. The school is the largest building in the picture. To go to school,
// Doris and Ali walk past Leo's house. Eva walks past Chole's house.
// Which is Eva's house?" Answer: B
//
// Map layout (reconstructed from 027.jpg):
//   School: large building at center-right.
//   Leo's house: center of the map; Doris & Ali both pass it en-route to school.
//   Chole's house: between Eva and the school (junction node).
//   Eva's house (B): top-left, must pass Chole → school.
//   Doris's house (A): bottom-left, passes Leo → school.
//   Ali's house (D): bottom-center, passes Leo → school.
//   And options C, E fill the remaining positions.
//
// Path topology:
//   B(Eva) ──→ Chole ──────────┐
//   C ──────────────────────→ [Leo] ──→ School
//   A(Doris) ──→ [Leo] ─────────┘
//   D(Ali) ──→ [Leo]  (from below)
//   E ──────────────────────────→ School (direct, alternate branch)
//
// The STEM map labels houses A–E (not by name, students must deduce).
// The OPTIONS A–E show individual house STYLES.
//
// Co-exports:
//   HouseMap15PE    — shared primitive (map with optional highlights)
//   HouseMap15PEOption — renders one A–E option (house style picture)
//
// Pure SVG, SSR-safe, deterministic: no Math.random, no Date, no window.

import type { JSX } from 'react'
import type { WmiChoice } from '../../../../types/wmi'

// ── Colours ───────────────────────────────────────────────────────────────────
const C_PATH           = '#D97706'  // amber/orange path fill
const C_PATH_DIM       = '#FDE68A'
const C_PATH_HL        = '#F59E0B'  // bright amber highlight
const C_SCHOOL_FILL    = '#BFDBFE'  // light blue for school
const C_SCHOOL_STROKE  = '#1E3A8A'
const C_HOUSE_ROOF     = '#92400E'  // brown roof
const C_HOUSE_WALL     = '#FEF3C7'  // cream walls
const C_HOUSE_STROKE   = '#1F2937'
const C_LABEL_FILL     = '#FFFFFF'
const C_LABEL_STROKE   = '#374151'
const C_ANSWER         = '#10B981'
const C_HIGHLIGHT_NODE = '#F59E0B'

// ── Layout ───────────────────────────────────────────────────────────────────
const VIEW = '0 0 400 260'

// House positions on the map (approximate faithful to original image)
// Note: positions are named by letter label shown on the map, NOT by person name.
// A = Doris (bottom-left), B = Eva (top-left, ANSWER), C = top-center-left,
// D = Ali (bottom-center), E = wide house (bottom-right branch)
export const HOUSE_POS: Record<string, [number, number]> = {
  A: [52,  188],   // Doris — bottom left
  B: [52,   36],   // Eva (ANSWER) — top left
  C: [140,  70],   // Chole — top center-left (junction)
  D: [130, 188],   // Ali — bottom center
  E: [240, 188],   // E — bottom right branch
}

// Leo's house is a junction node (not a lettered option in the original question,
// but is the shared waypoint for Doris & Ali)
export const LEO_POS: [number, number] = [220, 115]

// School position
export const SCHOOL_POS: [number, number] = [305, 105]

// ── Path segments (curvy, using quadratic bezier control points) ──────────────
// Each segment: from, control, to — used for both path and highlight drawing
export interface PathSeg {
  id: string
  from: [number, number]
  cp:   [number, number]
  to:   [number, number]
}

export const PATH_SEGS: PathSeg[] = [
  // B(Eva) → C(Chole's house)
  { id: 'B-C',    from: [52, 52],   cp: [90, 44],   to: [140, 74]  },
  // C(Chole) → Leo
  { id: 'C-Leo',  from: [140, 80],  cp: [168, 80],  to: [212, 115] },
  // Leo → School
  { id: 'Leo-Sch',from: [228, 115], cp: [260, 110], to: [296, 108] },
  // A(Doris) → Leo
  { id: 'A-Leo',  from: [60, 185],  cp: [120, 185], to: [214, 125] },
  // D(Ali) → Leo
  { id: 'D-Leo',  from: [138, 185], cp: [175, 185], to: [218, 128] },
  // E → School (direct branch, bypasses Leo)
  { id: 'E-Sch',  from: [248, 188], cp: [278, 155], to: [300, 120] },
  // C junction also connects directly toward Leo (secondary merge)
]

// ── Sub-components ────────────────────────────────────────────────────────────

/** Simple house icon with triangular roof, centred at (cx, cy). */
function HouseIcon({
  cx,
  cy,
  size = 18,
  roofColor = C_HOUSE_ROOF,
  wallColor = C_HOUSE_WALL,
  strokeColor = C_HOUSE_STROKE,
  strokeWidth = 1.4,
}: {
  cx: number
  cy: number
  size?: number
  roofColor?: string
  wallColor?: string
  strokeColor?: string
  strokeWidth?: number
}) {
  const hw = size / 2
  const bodyH = size * 0.54
  const roofH = size * 0.5
  const bx = cx - hw
  const bodyTop = cy - bodyH / 2 + roofH * 0.35
  const roofPeak = cy - hw - roofH * 0.65
  return (
    <g>
      {/* wall */}
      <rect
        x={bx}
        y={bodyTop}
        width={size}
        height={bodyH}
        fill={wallColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* roof */}
      <polygon
        points={`${cx},${roofPeak} ${cx - hw},${bodyTop} ${cx + hw},${bodyTop}`}
        fill={roofColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </g>
  )
}

/** School building — large rectangle with flat roof + "SCHOOL" label. */
function SchoolBuilding({
  cx,
  cy,
  highlighted = false,
}: {
  cx: number
  cy: number
  highlighted?: boolean
}) {
  const w = 68
  const h = 44
  const stroke = highlighted ? C_HIGHLIGHT_NODE : C_SCHOOL_STROKE
  return (
    <g>
      <rect
        x={cx - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        fill={C_SCHOOL_FILL}
        stroke={stroke}
        strokeWidth={highlighted ? 2.5 : 2}
        rx={2}
      />
      {/* flat roof overhang */}
      <rect
        x={cx - w / 2 - 4}
        y={cy - h / 2 - 5}
        width={w + 8}
        height={8}
        fill={C_SCHOOL_FILL}
        stroke={stroke}
        strokeWidth={highlighted ? 2.5 : 2}
      />
      {/* columns hint */}
      <line x1={cx - 14} y1={cy - h / 2 + 2} x2={cx - 14} y2={cy + h / 2} stroke={stroke} strokeWidth={1} />
      <line x1={cx}      y1={cy - h / 2 + 2} x2={cx}      y2={cy + h / 2} stroke={stroke} strokeWidth={1} />
      <line x1={cx + 14} y1={cy - h / 2 + 2} x2={cx + 14} y2={cy + h / 2} stroke={stroke} strokeWidth={1} />
      {/* label */}
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={8}
        fontWeight="900"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={C_SCHOOL_STROKE}
      >
        SCHOOL
      </text>
    </g>
  )
}

/** Candidate label circle for house A–E on the map. */
function HouseLabel({
  cx,
  cy,
  label,
  highlighted,
  answer,
}: {
  cx: number
  cy: number
  label: string
  highlighted?: boolean
  answer?: boolean
}) {
  const fill   = answer     ? C_ANSWER       : highlighted ? C_HIGHLIGHT_NODE : C_LABEL_FILL
  const stroke = answer     ? C_ANSWER       : highlighted ? C_HIGHLIGHT_NODE : C_LABEL_STROKE
  const text   = answer || highlighted ? '#FFFFFF' : '#111827'
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} fill={fill} stroke={stroke} strokeWidth={1.8} />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={8.5}
        fontWeight="900"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={text}
      >
        {label}
      </text>
    </g>
  )
}

/** Leo's house label (small junction dot with "Leo" text). */
function LeoNode({
  cx,
  cy,
  highlighted = false,
}: {
  cx: number
  cy: number
  highlighted?: boolean
}) {
  const stroke = highlighted ? C_HIGHLIGHT_NODE : '#374151'
  const ink = highlighted ? '#FFFFFF' : '#374151'
  return (
    <g>
      <HouseIcon cx={cx} cy={cy} size={20} roofColor={highlighted ? '#F59E0B' : C_HOUSE_ROOF} strokeColor={stroke} />
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={7.5}
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={ink}
      >
        Leo
      </text>
      {highlighted && (
        <circle cx={cx} cy={cy} r={14} fill="none" stroke={C_HIGHLIGHT_NODE} strokeWidth={2} strokeDasharray="3 2" />
      )}
    </g>
  )
}

// ── Types & props ─────────────────────────────────────────────────────────────

export type MapHighlight =
  | null
  | 'leo'           // highlight Leo's house + paths from Doris & Ali
  | 'chole'         // highlight Chole's house + path from Eva
  | 'eva-path'      // trace Eva → Chole → Leo/school
  | 'answer'        // house B green

export interface HouseMap15PEProps {
  highlight?: MapHighlight
  highlightAnswer?: boolean
  className?: string
}

// ── Shared primitive ──────────────────────────────────────────────────────────

/**
 * Shared map figure for IKMC-21-PE-Q15.
 * Used by both HouseMap15PEIllustration and HouseMap15PEExplainer.
 */
export function HouseMap15PE({
  highlight = null,
  highlightAnswer = false,
  className,
}: HouseMap15PEProps): JSX.Element {
  const hlLeo     = highlight === 'leo'
  const hlChole   = highlight === 'chole'
  const hlEva     = highlight === 'eva-path'
  const hlAns     = highlight === 'answer' || highlightAnswer

  // Path stroke styles
  const pathColor = (id: string): string => {
    if (highlight === null) return C_PATH
    if (hlLeo && (id === 'A-Leo' || id === 'D-Leo' || id === 'Leo-Sch')) return C_PATH_HL
    if (hlChole && (id === 'B-C' || id === 'C-Leo')) return C_PATH_HL
    if (hlEva && (id === 'B-C' || id === 'C-Leo' || id === 'Leo-Sch')) return C_PATH_HL
    if (hlAns && (id === 'B-C' || id === 'C-Leo' || id === 'Leo-Sch')) return C_ANSWER
    return C_PATH_DIM
  }

  const pathWidth = (id: string): number => {
    if (highlight === null) return 5
    const hl = pathColor(id)
    return (hl === C_PATH_DIM) ? 4 : 6
  }

  const pathOpacity = (id: string): number => {
    if (highlight === null) return 1
    return pathColor(id) === C_PATH_DIM ? 0.4 : 1
  }

  // Chole node position
  const [choleX, choleY] = HOUSE_POS.C
  const [leoX, leoY]     = LEO_POS
  const [schX, schY]     = SCHOOL_POS

  return (
    <svg
      viewBox={VIEW}
      className={className}
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Background */}
      <rect x={0} y={0} width={400} height={260} fill="#F9FAFB" />

      {/* ── Paths (drawn before houses so houses sit on top) ───── */}
      {PATH_SEGS.map((seg) => (
        <path
          key={seg.id}
          d={`M ${seg.from[0]} ${seg.from[1]} Q ${seg.cp[0]} ${seg.cp[1]} ${seg.to[0]} ${seg.to[1]}`}
          fill="none"
          stroke={pathColor(seg.id)}
          strokeWidth={pathWidth(seg.id)}
          strokeLinecap="round"
          opacity={pathOpacity(seg.id)}
        />
      ))}

      {/* ── School ─────────────────────────────────────────────── */}
      <SchoolBuilding cx={schX} cy={schY} highlighted={hlEva || hlAns} />

      {/* ── Leo's house (junction, unnamed on map) ─────────────── */}
      <LeoNode cx={leoX} cy={leoY} highlighted={hlLeo || hlEva || hlAns} />

      {/* ── Chole's house (junction for Eva's path) ────────────── */}
      <g>
        <HouseIcon
          cx={choleX}
          cy={choleY - 2}
          size={18}
          roofColor={(hlChole || hlEva || hlAns) ? C_PATH_HL : '#059669'}
          strokeColor={(hlChole || hlEva || hlAns) ? C_HIGHLIGHT_NODE : C_HOUSE_STROKE}
        />
        <text
          x={choleX}
          y={choleY + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={7}
          fontWeight="700"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fill={(hlChole || hlEva || hlAns) ? C_HIGHLIGHT_NODE : '#374151'}
        >
          Chole
        </text>
        {(hlChole || hlEva) && (
          <circle cx={choleX} cy={choleY - 2} r={13} fill="none" stroke={C_HIGHLIGHT_NODE} strokeWidth={2} strokeDasharray="3 2" />
        )}
      </g>

      {/* ── 5 labelled house positions (A–E) ──────────────────── */}
      {Object.entries(HOUSE_POS).map(([lbl, [hx, hy]]) => {
        const isB   = lbl === 'B'
        const isAns = isB && (hlAns)
        const isHl  = (hlEva && isB) || (hlLeo && (lbl === 'A' || lbl === 'D'))
        return (
          <g key={lbl}>
            <HouseIcon
              cx={hx}
              cy={hy - 4}
              size={20}
              roofColor={isAns ? C_ANSWER : isHl ? C_PATH_HL : C_HOUSE_ROOF}
              strokeColor={isAns ? C_ANSWER : isHl ? C_HIGHLIGHT_NODE : C_HOUSE_STROKE}
              strokeWidth={isAns || isHl ? 2 : 1.4}
            />
            <HouseLabel
              cx={hx}
              cy={hy + 16}
              label={lbl}
              highlighted={isHl && !isAns}
              answer={isAns}
            />
          </g>
        )
      })}
    </svg>
  )
}

// ── Default export: plain static illustration ─────────────────────────────────

/**
 * Static problem figure for IKMC-21-PE-Q15 (no highlights, no animation).
 * Used as the `illustration` entry in the VISUALS registry.
 */
export default function HouseMap15PEIllustration(): JSX.Element {
  return (
    <div className="mx-auto w-full max-w-[400px]">
      <HouseMap15PE />
    </div>
  )
}

// ── Option renderer (A–E house styles) ────────────────────────────────────────

const OPT_W = 80
const OPT_H = 70

/**
 * Per-option house style descriptors.
 * Each option shows a distinct house silhouette drawn in SVG.
 * Based on OCR images 028–031.jpg:
 *   A: simple house, triangular orange roof, plain brown walls
 *   B: house with dark brown slanted/asymmetric roof, cream/blue walls (ANSWER — Eva's)
 *   C: house with green roof, cream walls
 *   D: similar simple house to A, slightly wider, orange-red roof
 *   E: wider house with flat-ish light grey roof
 */
type OptionStyle = {
  roofColor: string
  wallColor: string
  roofShape: 'triangle' | 'asymmetric' | 'flat'
  wide: boolean
  ariaEn: string
  ariaId: string
}

const OPTION_STYLES: Record<string, OptionStyle> = {
  A: {
    roofColor: '#F59E0B',
    wallColor: '#92400E',
    roofShape: 'triangle',
    wide: false,
    ariaEn: 'Option A: simple house with triangular orange roof and brown walls.',
    ariaId: 'Pilihan A: rumah sederhana dengan atap segitiga oranye dan dinding cokelat.',
  },
  B: {
    roofColor: '#451A03',
    wallColor: '#BFDBFE',
    roofShape: 'asymmetric',
    wide: false,
    ariaEn: "Option B: house with dark brown slanted roof and cream-blue walls. Eva's house — correct answer.",
    ariaId: 'Pilihan B: rumah dengan atap cokelat tua miring dan dinding krem-biru. Rumah Eva — jawaban benar.',
  },
  C: {
    roofColor: '#166534',
    wallColor: '#FEF9C3',
    roofShape: 'triangle',
    wide: false,
    ariaEn: 'Option C: house with green roof and light cream walls.',
    ariaId: 'Pilihan C: rumah dengan atap hijau dan dinding krem muda.',
  },
  D: {
    roofColor: '#DC2626',
    wallColor: '#FDE68A',
    roofShape: 'triangle',
    wide: true,
    ariaEn: 'Option D: wider house with red-orange roof and pale yellow walls.',
    ariaId: 'Pilihan D: rumah lebih lebar dengan atap merah-oranye dan dinding kuning pucat.',
  },
  E: {
    roofColor: '#D1D5DB',
    wallColor: '#F3F4F6',
    roofShape: 'flat',
    wide: true,
    ariaEn: 'Option E: wide house with flat light grey roof and very light walls.',
    ariaId: 'Pilihan E: rumah lebar dengan atap datar abu-abu muda dan dinding sangat terang.',
  },
}

/** Single option house SVG drawing. */
function OptionHouse({ lbl }: { lbl: string }) {
  const style = OPTION_STYLES[lbl]
  if (!style) return null

  const { roofColor, wallColor, roofShape, wide } = style
  const bodyW = wide ? 46 : 34
  const bodyH = 26
  const cx = OPT_W / 2
  const baseY = OPT_H - 12
  const bodyX = cx - bodyW / 2
  const bodyTop = baseY - bodyH

  let roofEl: JSX.Element
  if (roofShape === 'triangle') {
    const roofH = 18
    roofEl = (
      <polygon
        points={`${cx},${bodyTop - roofH} ${bodyX - 3},${bodyTop} ${bodyX + bodyW + 3},${bodyTop}`}
        fill={roofColor}
        stroke={C_HOUSE_STROKE}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    )
  } else if (roofShape === 'asymmetric') {
    // Dark slanted roof — asymmetric peak
    const peakX = cx - 4
    const roofH = 20
    roofEl = (
      <polygon
        points={`${peakX},${bodyTop - roofH} ${bodyX - 4},${bodyTop + 4} ${bodyX + bodyW + 4},${bodyTop}`}
        fill={roofColor}
        stroke={C_HOUSE_STROKE}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    )
  } else {
    // flat-ish roof with slight overhang
    roofEl = (
      <rect
        x={bodyX - 5}
        y={bodyTop - 8}
        width={bodyW + 10}
        height={10}
        fill={roofColor}
        stroke={C_HOUSE_STROKE}
        strokeWidth={1.4}
        rx={1}
      />
    )
  }

  return (
    <>
      {/* wall */}
      <rect
        x={bodyX}
        y={bodyTop}
        width={bodyW}
        height={bodyH}
        fill={wallColor}
        stroke={C_HOUSE_STROKE}
        strokeWidth={1.4}
      />
      {/* door */}
      <rect
        x={cx - 5}
        y={baseY - 12}
        width={10}
        height={12}
        fill="#92400E"
        stroke={C_HOUSE_STROKE}
        strokeWidth={1}
        rx={1}
      />
      {/* roof */}
      {roofEl}
    </>
  )
}

/**
 * HouseMap15PEOption — renders one A–E choice as a small house picture.
 * Used as CHOICE_RENDERERS in the VISUALS registry.
 */
export function HouseMap15PEOption({ choice }: { choice: WmiChoice }): JSX.Element {
  const style = OPTION_STYLES[choice.label]
  const ariaLabel = style?.ariaEn ?? choice.text

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <svg
        viewBox={`0 0 ${OPT_W} ${OPT_H}`}
        width={OPT_W}
        height={OPT_H}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={OPT_W} height={OPT_H} fill="#FFFFFF" />
        <OptionHouse lbl={choice.label} />
      </svg>
    </span>
  )
}
