/**
 * IKMC-22-PE-Q6 — "A monkey has torn a piece from Captain Jack's map.
 * Which is the missing piece?" (answer B).
 *
 * Stem (013.jpg): a treasure-map fragment on aged parchment with:
 *   - A jagged torn-out hole in the upper-right area.
 *   - Map markings: skull (top-left), palm tree & tent/mountain icons (centre),
 *     red dashed treasure-route, crocodile/sea-creature (bottom-right),
 *     ship wreck icon (bottom-left), grass/bush tufts scattered throughout.
 *
 * Options A–E (014–018.jpg) show five candidate pieces:
 *   A: tall narrow fragment — right-coast detail, map marks at top, sea creature
 *      bottom — wrong shape for the top-right hole.
 *   B: roughly triangular/trapezoidal corner piece — upper-right with an "X" mark
 *      and wavy sea border at bottom — matches the torn hole EXACTLY. (ANSWER)
 *   C: tall fragment with sea creature at lower-right — wrong shape.
 *   D: wide mid-section with more tent/mountain icons — wrong edges.
 *   E: small left-coast strip with skull and sea creature — wrong shape.
 *
 * This file exports:
 *   - TornMap6PE          shared primitive (map + optional filled piece)
 *   - TornMap6PEOption    per-choice picture renderer (CHOICE_RENDERERS)
 *   - default             TornMap6PEIllustration (stem — hole visible, no answer)
 *
 * Pure SVG — no raster images, no Math.random, no Date, no window. SSR-safe.
 * Adapted from HouseMap15PEIllustration (shape + pattern matching question type).
 */

import type { JSX } from 'react'
import type { WmiChoice } from '../../../../types/wmi'

// ── colour tokens ─────────────────────────────────────────────────────────────
const C_PARCHMENT   = '#F5DEB3'  // map background (wheat)
const C_PARCHMENT_D = '#D2B48C'  // darker aged parchment edge
const C_INK         = '#2D1A0E'  // dark brown ink for outlines
const C_INK_MID     = '#5C3D1E'  // mid brown for details
const C_HOLE_BG     = '#F0E6D0'  // interior of torn hole (lighter than map)
const C_ROUTE       = '#DC2626'  // red dashed treasure route
const C_SEA         = '#93C5FD'  // pale blue sea background

// ── SVG canvas ────────────────────────────────────────────────────────────────
const MAP_W = 320
const MAP_H = 220

// ── Torn-edge helpers ─────────────────────────────────────────────────────────

/**
 * A ragged/torn polygon path string from an array of [x,y] points.
 * Straight lines between points simulate a torn-paper edge.
 */
function tornPath(points: [number, number][]): string {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ') + ' Z'
}

// The overall map shape (torn on all sides to simulate a fragment).
// Approximates the irregular parchment shape in 013.jpg.
const MAP_SHAPE: [number, number][] = [
  [0, 30], [8, 12], [20, 18], [35, 6], [50, 14], [70, 4], [90, 10],
  [115, 0], [140, 8], [165, 2], [190, 5],
  // Hole begins upper-right (torn edge of the missing piece):
  [210, 8], [220, 20], [215, 40], [225, 55], [218, 70],
  // Hole boundary (irregular V/notch shape):
  [230, 72], [245, 62], [255, 75], [250, 90], [240, 100],
  // Rest of right edge, lower-right, bottom, lower-left:
  [260, 110], [265, 130], [270, 148], [260, 162], [250, 155],
  [235, 165], [220, 175], [200, 180], [180, 185], [160, 178],
  [140, 182], [120, 188], [100, 180], [80, 190], [60, 182],
  [40, 188], [20, 178], [5, 165], [0, 150],
  [4, 130], [0, 110], [2, 85], [0, 60], [0, 30],
]

// The torn-hole region (upper-right notch removed by the monkey).
// Must align with the gap in MAP_SHAPE above.
const HOLE_POLY: [number, number][] = [
  [210, 8], [255, 4], [285, 0], [310, 6], [320, 15],
  [320, 50], [310, 65], [295, 78], [275, 92], [258, 98],
  [245, 88], [255, 75], [245, 62], [230, 72], [218, 70],
  [225, 55], [215, 40], [220, 20],
]

// ── Map icon primitives ───────────────────────────────────────────────────────

/** Simple skull icon (circle + crossbones hint) centred at (cx, cy). */
function Skull({ cx, cy, size = 14 }: { cx: number; cy: number; size?: number }) {
  const r = size * 0.45
  const jw = size * 0.22
  const jh = size * 0.28
  return (
    <g>
      <circle cx={cx} cy={cy - size * 0.08} r={r} fill={C_PARCHMENT} stroke={C_INK} strokeWidth={1.2} />
      {/* eye sockets */}
      <circle cx={cx - size * 0.14} cy={cy - size * 0.12} r={size * 0.1} fill={C_INK} />
      <circle cx={cx + size * 0.14} cy={cy - size * 0.12} r={size * 0.1} fill={C_INK} />
      {/* jaw */}
      <rect x={cx - jw} y={cy + size * 0.18} width={jw * 2} height={jh} rx={2}
        fill={C_PARCHMENT} stroke={C_INK} strokeWidth={1} />
      <line x1={cx - jw * 0.4} y1={cy + size * 0.18} x2={cx - jw * 0.4} y2={cy + size * 0.18 + jh}
        stroke={C_INK} strokeWidth={0.8} />
      <line x1={cx + jw * 0.4} y1={cy + size * 0.18} x2={cx + jw * 0.4} y2={cy + size * 0.18 + jh}
        stroke={C_INK} strokeWidth={0.8} />
    </g>
  )
}

/** Palm tree silhouette centred at (cx, cy). */
function PalmTree({ cx, cy, size = 16 }: { cx: number; cy: number; size?: number }) {
  const trunkH = size * 1.1
  return (
    <g>
      {/* trunk */}
      <line x1={cx} y1={cy + trunkH / 2} x2={cx - size * 0.08} y2={cy - trunkH / 2}
        stroke={C_INK_MID} strokeWidth={2} strokeLinecap="round" />
      {/* fronds */}
      {[-45, -15, 15, 45, 75].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const ex = cx + Math.cos(rad) * size * 0.7
        const ey = cy - trunkH / 2 + Math.sin(rad) * size * 0.4
        return (
          <line key={i}
            x1={cx - size * 0.04} y1={cy - trunkH / 2 + 2}
            x2={ex} y2={ey}
            stroke={C_INK} strokeWidth={1.2} strokeLinecap="round" />
        )
      })}
    </g>
  )
}

/** Mountain/tent icon (triangle) centred at (cx, cy). */
function Mountain({ cx, cy, size = 14 }: { cx: number; cy: number; size?: number }) {
  const h = size * 0.85
  const hw = size * 0.6
  return (
    <polygon
      points={`${cx},${cy - h / 2} ${cx - hw},${cy + h / 2} ${cx + hw},${cy + h / 2}`}
      fill="none" stroke={C_INK} strokeWidth={1.3} strokeLinejoin="round"
    />
  )
}

/** Wavy sea-creature outline centred at (cx, cy). */
function SeaCreature({ cx, cy, size = 16 }: { cx: number; cy: number; size?: number }) {
  const s = size * 0.5
  return (
    <g>
      {/* body */}
      <ellipse cx={cx} cy={cy} rx={s * 1.0} ry={s * 0.55} fill="none" stroke={C_INK} strokeWidth={1.2} />
      {/* tentacles (short wavy lines below) */}
      {[-s * 0.6, -s * 0.2, s * 0.2, s * 0.6].map((dx, i) => (
        <path key={i}
          d={`M ${cx + dx} ${cy + s * 0.5} Q ${cx + dx + s * 0.15} ${cy + s * 0.9} ${cx + dx} ${cy + s * 1.2}`}
          fill="none" stroke={C_INK} strokeWidth={1} />
      ))}
      {/* eye */}
      <circle cx={cx - s * 0.4} cy={cy - s * 0.1} r={s * 0.18} fill={C_INK} />
    </g>
  )
}

/** Ship wreck (simple hull + mast). */
function ShipWreck({ cx, cy, size = 14 }: { cx: number; cy: number; size?: number }) {
  const hw = size * 0.65
  return (
    <g>
      {/* hull */}
      <path d={`M ${cx - hw} ${cy} Q ${cx} ${cy + size * 0.5} ${cx + hw} ${cy}`}
        fill="none" stroke={C_INK} strokeWidth={1.3} />
      {/* mast (tilted) */}
      <line x1={cx - size * 0.1} y1={cy} x2={cx + size * 0.1} y2={cy - size * 0.8}
        stroke={C_INK} strokeWidth={1.1} />
      {/* sail (small triangle) */}
      <polygon points={`${cx + size * 0.1},${cy - size * 0.8} ${cx + size * 0.5},${cy - size * 0.3} ${cx + size * 0.1},${cy - size * 0.25}`}
        fill={C_PARCHMENT} stroke={C_INK} strokeWidth={0.9} />
    </g>
  )
}

/** Small grass tuft at (cx, cy). */
function Tuft({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <line x1={cx} y1={cy} x2={cx - 3} y2={cy - 5} stroke={C_INK_MID} strokeWidth={1} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx} y2={cy - 6} stroke={C_INK_MID} strokeWidth={1} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + 3} y2={cy - 5} stroke={C_INK_MID} strokeWidth={1} strokeLinecap="round" />
    </g>
  )
}

/** "X marks the spot" cross. */
function TreasureX({ cx, cy, size = 10 }: { cx: number; cy: number; size?: number }) {
  const h = size / 2
  return (
    <g>
      <line x1={cx - h} y1={cy - h} x2={cx + h} y2={cy + h} stroke={C_ROUTE} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx + h} y1={cy - h} x2={cx - h} y2={cy + h} stroke={C_ROUTE} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

// ── Shared map primitive ──────────────────────────────────────────────────────

export interface TornMap6PEProps {
  /** When true, draw the correct piece (B) filling the hole in green. */
  showAnswer?: boolean
  /** Highlight colour override for the answer piece. */
  answerFill?: string
  /** If set, highlight the named option piece outline in the hole area. */
  highlightOption?: string | null
  className?: string
}

/**
 * TornMap6PE — the shared Captain Jack's map figure.
 *
 * The stem illustration: a parchment map fragment with a torn-out notch in the
 * upper-right. Map icons: skull (top-left), palm tree (centre-left),
 * mountains (centre), red dashed treasure route, sea creature (bottom-right),
 * shipwreck (bottom-left). The hole is visible as the lighter background.
 *
 * When showAnswer=true, the correct piece (B) is drawn inside the hole
 * in an accent colour — used by the explainer to reveal the answer.
 */
export function TornMap6PE({
  showAnswer = false,
  answerFill = '#10B981',
  className,
}: TornMap6PEProps): JSX.Element {
  const mapId = 'tornMap6PE-clip'

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className={className}
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        {/* Clip to the map outer shape */}
        <clipPath id={mapId}>
          <path d={tornPath(MAP_SHAPE)} />
        </clipPath>
      </defs>

      {/* Sea background (behind everything) */}
      <rect x={0} y={0} width={MAP_W} height={MAP_H} fill={C_SEA} />

      {/* Map parchment body */}
      <path d={tornPath(MAP_SHAPE)} fill={C_PARCHMENT} stroke={C_INK} strokeWidth={1.8} strokeLinejoin="round" />

      {/* Inner map content (clipped to map shape) */}
      <g clipPath={`url(#${mapId})`}>

        {/* Aged texture: diagonal hatch lines (very faint) */}
        {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260].map((offset, i) => (
          <line key={i}
            x1={offset} y1={0} x2={0} y2={offset}
            stroke={C_PARCHMENT_D} strokeWidth={0.4} opacity={0.35} />
        ))}

        {/* Map icons — faithfully placed as in 013.jpg */}

        {/* Skull — top-left */}
        <Skull cx={38} cy={48} size={22} />

        {/* Palm tree — left-centre */}
        <PalmTree cx={60} cy={110} size={18} />

        {/* Mountains / tent icons — centre spread */}
        <Mountain cx={105} cy={72} size={16} />
        <Mountain cx={122} cy={80} size={13} />
        <Mountain cx={138} cy={75} size={15} />
        <Mountain cx={155} cy={82} size={13} />

        {/* Sea creature / crocodile — lower-right */}
        <SeaCreature cx={228} cy={148} size={22} />

        {/* Shipwreck — bottom-left */}
        <ShipWreck cx={55} cy={158} size={18} />

        {/* Grass tufts scattered */}
        <Tuft cx={80} cy={96} />
        <Tuft cx={165} cy={60} />
        <Tuft cx={90} cy={130} />
        <Tuft cx={140} cy={130} />
        <Tuft cx={180} cy={110} />
        <Tuft cx={200} cy={95} />
        <Tuft cx={75} cy={64} />
        <Tuft cx={110} cy={100} />

        {/* Red dashed treasure route (diagonal from centre-left to lower-centre) */}
        <path
          d="M 85 115 Q 130 100 170 130"
          fill="none"
          stroke={C_ROUTE}
          strokeWidth={1.8}
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
        {/* Arrowhead at end */}
        <polygon
          points="170,130 162,122 168,136"
          fill={C_ROUTE}
        />

        {/* Torn hole region — show lighter parchment interior */}
        <path d={tornPath(HOLE_POLY)} fill={C_HOLE_BG} stroke={C_INK} strokeWidth={1.5} strokeDasharray="3 3" strokeLinejoin="round" />

        {/* Answer reveal: draw piece B icon in hole */}
        {showAnswer && (
          <g>
            <path d={tornPath(HOLE_POLY)} fill={answerFill} fillOpacity={0.3} stroke={answerFill} strokeWidth={2.5} strokeLinejoin="round" />
            {/* X mark from piece B inside the hole */}
            <TreasureX cx={268} cy={48} size={14} />
            {/* wavy sea border hint */}
            <path
              d="M 248 82 Q 258 90 268 84 Q 278 78 288 85 Q 298 92 310 87"
              fill="none" stroke={C_SEA} strokeWidth={2.5} strokeLinecap="round"
            />
          </g>
        )}
      </g>

      {/* Outer torn edge re-stroke (on top for crispness) */}
      <path d={tornPath(MAP_SHAPE)} fill="none" stroke={C_INK} strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  )
}

// ── Stem illustration default export ─────────────────────────────────────────

/**
 * TornMap6PEIllustration — the static in-card stem figure for IKMC-22-PE-Q6.
 * Shows the map with the hole clearly visible. The answer (piece B) is never
 * shown here — only in the explainer.
 */
export default function TornMap6PEIllustration(): JSX.Element {
  return (
    <div
      className="mx-auto my-4 w-full max-w-[360px]"
      role="img"
      aria-label="Peta harta karun Kapten Jack dengan bagian yang robek di sudut kanan atas. Terdapat tengkorak di kiri atas, pohon palem dan gunung di tengah, jalur harta merah putus-putus, makhluk laut di kanan bawah, dan kapal karam di kiri bawah."
    >
      <TornMap6PE />
    </div>
  )
}

// ── Option renderer ───────────────────────────────────────────────────────────

const OPT_W = 90
const OPT_H = 90

/**
 * Descriptions for each option A–E, derived from 014–018.jpg.
 *
 *  A (014): tall narrow right-coast fragment — map markings at top, sea creature
 *           at lower-right, jagged torn edges on left and bottom.
 *  B (015): roughly trapezoidal upper-right corner — an "X" mark, wavy sea line
 *           at bottom, torn edges on left and bottom. CORRECT ANSWER.
 *  C (016): tall fragment with sea creature detail lower-right, jagged edges.
 *  D (017): wide mid-section fragment, mountain/tent icons, red map route,
 *           jagged torn edges all around.
 *  E (018): small left-coast strip — skull and sea creature visible, jagged edges.
 */
type OptionDesc = {
  ariaEn: string
  ariaId: string
  /** Shape polygon points for the option piece (in OPT_W × OPT_H box). */
  shape: [number, number][]
  /** Icon to draw inside the piece. */
  icon: 'seaCreature' | 'xMark' | 'mountains' | 'skull' | 'mountains+skull'
  /** Fill colour for the parchment body. */
  fill: string
}

const OPTION_DESCS: Record<string, OptionDesc> = {
  A: {
    ariaEn: 'Option A: tall narrow map fragment with sea creature at bottom and map markings at top.',
    ariaId: 'Pilihan A: potongan peta sempit tinggi dengan makhluk laut di bawah dan tanda peta di atas.',
    // Tall narrow piece, jagged left & bottom edges
    shape: [
      [12, 4], [30, 0], [55, 3], [70, 8], [78, 6],
      [82, 14], [80, 35], [85, 55], [82, 78], [80, 88],
      [68, 86], [50, 90], [35, 86], [18, 88],
      [8, 78], [4, 60], [6, 40], [2, 20],
    ],
    icon: 'seaCreature',
    fill: C_PARCHMENT,
  },
  B: {
    ariaEn: 'Option B: roughly triangular corner piece with an X mark and wavy sea border. This is the correct missing piece.',
    ariaId: 'Pilihan B: potongan sudut segitiga dengan tanda X dan batas laut bergelombang. Ini potongan yang hilang.',
    // Corner piece — wider at top, pointed at lower-left
    shape: [
      [4, 4], [28, 0], [55, 2], [75, 5], [86, 8],
      [88, 25], [86, 45], [80, 60], [70, 75], [55, 82],
      [38, 86], [20, 82], [6, 72], [2, 50], [4, 30],
    ],
    icon: 'xMark',
    fill: C_PARCHMENT,
  },
  C: {
    ariaEn: 'Option C: tall fragment with sea creature detail and jagged torn edges.',
    ariaId: 'Pilihan C: potongan tinggi dengan detail makhluk laut dan tepi robek tidak beraturan.',
    // Tall with sea creature
    shape: [
      [8, 6], [30, 2], [58, 4], [78, 10], [84, 8],
      [88, 26], [85, 48], [88, 68], [82, 86],
      [65, 88], [45, 84], [25, 88], [10, 84],
      [4, 65], [6, 44], [2, 22],
    ],
    icon: 'seaCreature',
    fill: C_PARCHMENT,
  },
  D: {
    ariaEn: 'Option D: wide map fragment with mountain icons and red dotted route.',
    ariaId: 'Pilihan D: potongan peta lebar dengan ikon gunung dan jalur titik-titik merah.',
    // Wide mid-section
    shape: [
      [6, 8], [22, 4], [48, 0], [68, 5], [84, 4],
      [88, 15], [86, 32], [88, 48], [84, 62],
      [86, 78], [82, 86], [62, 88], [42, 84],
      [22, 88], [6, 82], [2, 65], [4, 45], [2, 25],
    ],
    icon: 'mountains',
    fill: C_PARCHMENT,
  },
  E: {
    ariaEn: 'Option E: small left-coast strip with skull and sea creature.',
    ariaId: 'Pilihan E: potongan jalur kiri kecil dengan tengkorak dan makhluk laut.',
    // Small narrow piece
    shape: [
      [10, 8], [30, 4], [55, 6], [70, 4],
      [78, 16], [80, 34], [76, 55], [78, 74], [72, 84],
      [52, 88], [32, 84], [14, 88], [4, 76], [2, 55], [6, 35], [4, 16],
    ],
    icon: 'skull',
    fill: C_PARCHMENT,
  },
}

/** Draws the icon inside the option piece. */
function OptionIcon({ icon, cx, cy }: { icon: OptionDesc['icon']; cx: number; cy: number }) {
  if (icon === 'xMark') return <TreasureX cx={cx} cy={cy} size={18} />
  if (icon === 'seaCreature') return <SeaCreature cx={cx} cy={cy + 12} size={22} />
  if (icon === 'skull') return <Skull cx={cx} cy={cy - 8} size={18} />
  if (icon === 'mountains') {
    return (
      <g>
        <Mountain cx={cx - 12} cy={cy} size={16} />
        <Mountain cx={cx + 8}  cy={cy} size={13} />
      </g>
    )
  }
  return null
}

/**
 * TornMap6PEOption — renders one A–E answer option as a small torn-map-piece SVG.
 * Used as CHOICE_RENDERERS for IKMC-22-PE-Q6.
 */
export function TornMap6PEOption({ choice }: { choice: WmiChoice }): JSX.Element {
  const label = (choice.label ?? '').trim().toUpperCase()
  const desc = OPTION_DESCS[label]
  if (!desc) return <span>{choice.text}</span>

  const { shape, icon, fill, ariaEn } = desc

  return (
    <svg
      viewBox={`0 0 ${OPT_W} ${OPT_H}`}
      width={OPT_W}
      height={OPT_H}
      style={{ display: 'block' }}
      role="img"
      aria-label={ariaEn}
    >
      {/* sea background */}
      <rect x={0} y={0} width={OPT_W} height={OPT_H} fill={C_SEA} />
      {/* parchment piece body */}
      <path d={tornPath(shape)} fill={fill} stroke={C_INK} strokeWidth={1.4} strokeLinejoin="round" />
      {/* icon inside piece */}
      <OptionIcon icon={icon} cx={OPT_W / 2} cy={OPT_H / 2} />
      {/* label badge */}
      <circle cx={14} cy={14} r={10} fill={C_INK} opacity={0.75} />
      <text
        x={14} y={14}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight="900"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill="#FFFFFF"
      >
        {label}
      </text>
    </svg>
  )
}
