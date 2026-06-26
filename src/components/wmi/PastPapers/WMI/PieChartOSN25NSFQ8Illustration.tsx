// OSN-25-SD-NAS-SEMIFINAL-Q8 — Survey pie-chart illustration (stem)
//
// Problem: 300 students surveyed on Sunday activities.
//   Given:  Membaca Buku = 60 (20%), Belajar Kelompok = 90 (30%)
//   Find:   angles a° (Bermain Game) and b° (Olahraga); answer = a° − b°
//
// This illustration shows the pie chart the student sees in the paper:
//   - Two sectors with known percentages (Membaca Buku 20%, Belajar Kelompok 30%)
//   - Two sectors marked a° and b° (the unknowns to compute)
//
// No hooks, no randomness — SSR-safe and deterministic.

export const SVG_W = 300
export const SVG_H = 300
export const CX = 150
export const CY = 148
export const R = 108

export interface SectorDef {
  key: string
  lines: string[]
  sublabel: string | null
  varLabel: string | null
  angle: number
  color: string
  strokeColor: string
}

// Clockwise from top (12 o'clock)
export const SECTORS: SectorDef[] = [
  {
    key: 'buku',
    lines: ['Membaca', 'Buku'],
    sublabel: '20%',
    varLabel: null,
    angle: 72,
    color: '#bfdbfe',
    strokeColor: '#2563eb',
  },
  {
    key: 'belajar',
    lines: ['Belajar', 'Kelompok'],
    sublabel: '30%',
    varLabel: null,
    angle: 108,
    color: '#bbf7d0',
    strokeColor: '#16a34a',
  },
  {
    key: 'olahraga',
    lines: ['Olahraga'],
    sublabel: null,
    varLabel: 'b°',
    angle: 72,
    color: '#fef08a',
    strokeColor: '#ca8a04',
  },
  {
    key: 'game',
    lines: ['Bermain', 'Game'],
    sublabel: null,
    varLabel: 'a°',
    angle: 108,
    color: '#fbcfe8',
    strokeColor: '#db2777',
  },
]

/** Convert clockwise-from-top degrees to SVG coordinates. */
export function polarToCart(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): readonly [number, number] {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

/** SVG arc path for one pie sector (pie slice from centre). */
export function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const [x1, y1] = polarToCart(cx, cy, r, startDeg)
  const [x2, y2] = polarToCart(cx, cy, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return (
    `M${cx},${cy} ` +
    `L${x1.toFixed(2)},${y1.toFixed(2)} ` +
    `A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`
  )
}

/** Precompute per-sector geometry (path + label position). */
export function buildSectorGeo() {
  let start = 0
  return SECTORS.map((s) => {
    const path = arcPath(CX, CY, R, start, start + s.angle)
    const midDeg = start + s.angle / 2
    const [lx, ly] = polarToCart(CX, CY, R * 0.64, midDeg)
    start += s.angle
    return { ...s, path, lx, ly }
  })
}

// ── Sub-component shared with the Explainer ─────────────────────────────────

interface LabelProps {
  lx: number
  ly: number
  lines: string[]
  sublabel: string | null
  varLabel: string | null
  /** When true, show the revealed angle value instead of the variable name. */
  revealedLabel?: string | null
}

export function SectorLabel({ lx, ly, lines, sublabel, varLabel, revealedLabel }: LabelProps) {
  const LH = 14
  const extraLine = revealedLabel ?? varLabel ?? sublabel
  const totalLines = lines.length + (extraLine ? 1 : 0)
  const startY = ly - (totalLines * LH) / 2 + LH / 2

  const isVar = varLabel !== null
  const showRevealed = revealedLabel !== null && revealedLabel !== undefined

  return (
    <text
      textAnchor="middle"
      fontFamily="ui-sans-serif, system-ui, sans-serif"
      fontSize={11}
      fontWeight={600}
      fill="#1e293b"
    >
      {lines.map((ln, i) => (
        <tspan key={i} x={lx} y={startY + i * LH}>
          {ln}
        </tspan>
      ))}
      {extraLine && (
        <tspan
          x={lx}
          y={startY + lines.length * LH}
          fontSize={isVar ? 13 : 10}
          fontStyle={isVar && !showRevealed ? 'italic' : 'normal'}
          fontWeight={isVar ? 700 : 400}
          fill={showRevealed ? '#15803d' : isVar ? '#dc2626' : '#64748b'}
        >
          {extraLine}
        </tspan>
      )}
    </text>
  )
}

// ── Default export: the stem illustration ───────────────────────────────────

export default function PieChartOSN25NSFQ8Illustration() {
  const geo = buildSectorGeo()

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Sectors */}
      {geo.map((s) => (
        <path
          key={s.key}
          d={s.path}
          fill={s.color}
          stroke={s.strokeColor}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ))}

      {/* Labels */}
      {geo.map((s) => (
        <SectorLabel
          key={s.key + '-lbl'}
          lx={s.lx}
          ly={s.ly}
          lines={s.lines}
          sublabel={s.sublabel}
          varLabel={s.varLabel}
          revealedLabel={null}
        />
      ))}

      {/* Centre dot */}
      <circle cx={CX} cy={CY} r={3} fill="#334155" />
    </svg>
  )
}
