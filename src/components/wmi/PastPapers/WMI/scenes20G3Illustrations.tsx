// Scene illustrations for WMI-20F3A, reconstructed from the paper scans.
// The puzzle data lives here so the explainers and choice renderers bind to
// the same source of truth.

const INK = '#1F2937'
const BLUE = '#30598A'
const PINK = '#E75480'

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={aria}>
      {children}
    </div>
  )
}

/** Q2 — the four 5×3 letter grids. W count: A 5, B 6, C 4, D 4 → A has 15/3. */
export const W_GRIDS: Record<string, string[][]> = {
  A: [['W', 'I', 'M'], ['W', 'I', 'W'], ['I', 'M', 'W'], ['M', 'W', 'M'], ['M', 'I', 'I']],
  B: [['W', 'W', 'W'], ['M', 'W', 'M'], ['I', 'M', 'I'], ['M', 'W', 'M'], ['I', 'W', 'I']],
  C: [['M', 'W', 'M'], ['M', 'I', 'M'], ['W', 'W', 'W'], ['I', 'M', 'I'], ['M', 'I', 'I']],
  D: [['I', 'I', 'W'], ['M', 'I', 'M'], ['W', 'M', 'W'], ['M', 'I', 'M'], ['W', 'I', 'I']],
}
export const W_COUNTS: Record<string, number> = { A: 5, B: 6, C: 4, D: 4 }

export function WGrid({ rows, size = 22, litRows }: { rows: string[][]; size?: number; litRows?: number }) {
  const lit = litRows ?? rows.length
  return (
    <svg viewBox={`0 0 ${3 * size + 4} ${5 * size + 4}`} width={3 * size + 4} aria-hidden="true">
      {rows.map((row, r) =>
        row.map((ch, c) => {
          const isW = ch === 'W'
          const on = r < lit
          return (
            <g key={`${r}-${c}`} opacity={on ? 1 : 0.3}>
              <rect x={2 + c * size} y={2 + r * size} width={size} height={size} fill={isW && on ? '#2E9CCA' : 'white'} stroke={INK} strokeWidth={1.4} />
              <text x={2 + c * size + size / 2} y={2 + r * size + size / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.58} fontWeight={800} fill={isW && on ? 'white' : INK} className="font-display">
                {ch}
              </text>
            </g>
          )
        }),
      )}
    </svg>
  )
}

export function WGridsG3Illustration() {
  return (
    <Frame aria="Four grids of fifteen letter squares labelled A to D; the W squares are highlighted.">
      <div className="flex flex-wrap items-end justify-center gap-4 py-1">
        {(['A', 'B', 'C', 'D'] as const).map((k) => (
          <div key={k} className="flex flex-col items-center gap-1">
            <WGrid rows={W_GRIDS[k]} />
            <span className="font-display text-sm font-extrabold text-gray-600">({k})</span>
          </div>
        ))}
      </div>
    </Frame>
  )
}

/** Q5 — 10 lamps along 90 m. */
export const LAMPS = 10
export function LampRow({ litGaps = 0, showLengths = false }: { litGaps?: number; showLengths?: boolean }) {
  const x0 = 20
  const step = 40
  return (
    <svg viewBox="0 0 400 110" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
      <line x1={x0} y1={80} x2={x0 + step * (LAMPS - 1)} y2={80} stroke="#9CA3AF" strokeWidth={5} />
      {Array.from({ length: LAMPS }, (_, i) => {
        const x = x0 + i * step
        return (
          <g key={i}>
            <line x1={x} y1={80} x2={x} y2={40} stroke={INK} strokeWidth={3} />
            <circle cx={x} cy={36} r={6} fill="#FFD23F" stroke={INK} strokeWidth={1.8} />
          </g>
        )
      })}
      {Array.from({ length: LAMPS - 1 }, (_, i) => {
        const on = i < litGaps
        const xm = x0 + i * step + step / 2
        return (
          <g key={i} opacity={on ? 1 : 0.18}>
            <path d={`M ${x0 + i * step + 4} 92 H ${x0 + (i + 1) * step - 4}`} stroke={PINK} strokeWidth={2.6} />
            <text x={xm} y={106} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={PINK} className="font-display">
              {showLengths ? '10' : i + 1}
            </text>
          </g>
        )
      })}
      <text x={x0 + (step * (LAMPS - 1)) / 2} y={18} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK} className="font-display">90 m</text>
    </svg>
  )
}
export function LampRowG3Illustration() {
  return (
    <Frame aria="Ten streetlamps standing on a ninety-metre road, with equal gaps between them.">
      <LampRow litGaps={0} />
    </Frame>
  )
}

/** Q7 — the boat on a 6×6 grid of 5 cm squares.
 * Sail: triangle (3,1)-(1,3)-(3,4) — half of the 2×3 box (1,1)-(3,4).
 * Hull: trapezoid (1,4)-(5,4)-(4,5)-(2,5) — the 4×1 box minus two half-square corners.
 * Area: 3 + 3 = 6 squares × 25 = 150 cm². */
export const BOAT_CELL = 46
export function BoatGrid({ highlight }: { highlight?: 'sailBox' | 'sail' | 'hullBox' | 'hull' | null }) {
  const s = BOAT_CELL
  const g = (n: number) => 8 + n * s
  return (
    <svg viewBox={`0 0 ${16 + 6 * s} ${16 + 6 * s}`} width="100%" style={{ maxWidth: 300, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* shaded boat */}
      <polygon points={`${g(3)},${g(1)} ${g(1)},${g(3)} ${g(3)},${g(4)}`} fill="#F4B400" stroke="#B8860B" strokeWidth={1.6} />
      <polygon points={`${g(1)},${g(4)} ${g(5)},${g(4)} ${g(4)},${g(5)} ${g(2)},${g(5)}`} fill="#F4B400" stroke="#B8860B" strokeWidth={1.6} />
      {/* grid */}
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          <line x1={g(i)} y1={g(0)} x2={g(i)} y2={g(6)} stroke={INK} strokeWidth={1.4} />
          <line x1={g(0)} y1={g(i)} x2={g(6)} y2={g(i)} stroke={INK} strokeWidth={1.4} />
        </g>
      ))}
      {highlight === 'sailBox' || highlight === 'sail' ? (
        <rect x={g(1)} y={g(1)} width={2 * s} height={3 * s} fill={highlight === 'sailBox' ? '#19A7CE33' : 'none'} stroke="#19A7CE" strokeWidth={3} strokeDasharray="7 5" />
      ) : null}
      {highlight === 'hullBox' || highlight === 'hull' ? (
        <rect x={g(1)} y={g(4)} width={4 * s} height={s} fill={highlight === 'hullBox' ? '#19A7CE33' : 'none'} stroke="#19A7CE" strokeWidth={3} strokeDasharray="7 5" />
      ) : null}
      <text x={g(5) + 6} y={g(0) - 2} textAnchor="middle" fontSize={12} fontWeight={800} fill={INK}>5 cm</text>
    </svg>
  )
}
export function BoatGridG3Illustration() {
  return (
    <Frame aria="A boat shape shaded on a grid of five-centimetre squares: a triangular sail and a trapezoid hull.">
      <BoatGrid highlight={null} />
    </Frame>
  )
}

/** Q8 — temperature table + the four candidate line charts. */
export const TEMP_MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
export const TEMP_TABLE = [60, 70, 70, 80, 90, 80, 70]
export const TEMP_CHARTS: Record<string, number[]> = {
  A: [60, 70, 70, 80, 90, 80, 70],
  B: [60, 80, 70, 80, 90, 80, 70],
  C: [60, 70, 70, 80, 90, 90, 80],
  D: [60, 70, 70, 90, 80, 80, 70],
}
/** First month where each wrong chart disagrees with the table (index). */
export const TEMP_FAIL: Record<string, number | null> = { A: null, B: 1, C: 5, D: 3 }

export function MiniTempChart({ values, badIndex, size = 150 }: { values: number[]; badIndex?: number | null; size?: number }) {
  const w = size
  const h = size * 0.62
  const x = (i: number) => 16 + (i * (w - 28)) / 6
  const y = (v: number) => h - 8 - ((v - 50) / 45) * (h - 22)
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h + 12}`} width={w} aria-hidden="true">
      <rect x={1} y={1} width={w - 2} height={h + 10} rx={7} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1.4} />
      <polyline points={pts} fill="none" stroke={BLUE} strokeWidth={2} />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={badIndex === i ? 4.4 : 2.6} fill={badIndex === i ? '#DC2626' : BLUE} />
      ))}
      {badIndex != null && badIndex >= 0 && (
        <text x={x(badIndex)} y={y(values[badIndex]) - 7} textAnchor="middle" fontSize={11} fontWeight={900} fill="#DC2626" className="font-display">✗</text>
      )}
    </svg>
  )
}

export function TempTableG3Illustration() {
  return (
    <Frame aria="A table of London temperatures: February sixty, March seventy, April seventy, May eighty, June ninety, July eighty, August seventy degrees Fahrenheit.">
      <svg viewBox="0 0 400 76" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {TEMP_MONTHS.map((m, i) => (
          <g key={m}>
            <rect x={10 + i * 55} y={8} width={51} height={28} fill="#E1EFFB" stroke={BLUE} strokeWidth={1.4} />
            <text x={35 + i * 55} y={22} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={BLUE} className="font-display">{m}</text>
            <rect x={10 + i * 55} y={36} width={51} height={28} fill="white" stroke={BLUE} strokeWidth={1.4} />
            <text x={35 + i * 55} y={50} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={INK} className="font-display">{TEMP_TABLE[i]}°F</text>
          </g>
        ))}
      </svg>
    </Frame>
  )
}

/** Q13 — the shape column addition 6■3 + 1●8★ = ▲020. */
export const SHAPE_COLORS = { sq: '#8E7CC3', circ: '#E2B33C', star: '#E75480', tri: '#F472B6' } as const
export function ShapeAdditionBoard({ revealed }: { revealed: { star?: boolean; sq?: boolean; circ?: boolean; tri?: boolean } }) {
  const X = [120, 170, 220, 270]
  const glyph = (kind: 'sq' | 'circ' | 'star' | 'tri', cx: number, cy: number, value: number | null) =>
    value != null ? (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={900} fill={SHAPE_COLORS[kind]} className="font-display">{value}</text>
    ) : kind === 'sq' ? (
      <rect x={cx - 11} y={cy - 11} width={22} height={22} fill={SHAPE_COLORS.sq} />
    ) : kind === 'circ' ? (
      <circle cx={cx} cy={cy} r={12} fill={SHAPE_COLORS.circ} />
    ) : kind === 'star' ? (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={26} fill={SHAPE_COLORS.star}>★</text>
    ) : (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={26} fill={SHAPE_COLORS.tri}>▲</text>
    )
  return (
    <svg viewBox="0 0 340 168" width="100%" style={{ maxWidth: 340, display: 'block', margin: '0 auto' }} aria-hidden="true">
      <g className="font-display" fontWeight={900} fontSize={26} fill={INK}>
        <text x={X[1]} y={28} textAnchor="middle" dominantBaseline="central">6</text>
        <text x={X[3]} y={28} textAnchor="middle" dominantBaseline="central">3</text>
        <text x={56} y={70} textAnchor="middle" dominantBaseline="central">+</text>
        <text x={X[0]} y={70} textAnchor="middle" dominantBaseline="central">1</text>
        <text x={X[2]} y={70} textAnchor="middle" dominantBaseline="central">8</text>
        <text x={X[1]} y={138} textAnchor="middle" dominantBaseline="central">0</text>
        <text x={X[2]} y={138} textAnchor="middle" dominantBaseline="central">2</text>
        <text x={X[3]} y={138} textAnchor="middle" dominantBaseline="central">0</text>
      </g>
      {glyph('sq', X[2], 28, revealed.sq ? 3 : null)}
      {glyph('circ', X[1], 70, revealed.circ ? 3 : null)}
      {glyph('star', X[3], 70, revealed.star ? 7 : null)}
      {glyph('tri', X[0], 138, revealed.tri ? 2 : null)}
      <line x1={40} y1={100} x2={300} y2={100} stroke={INK} strokeWidth={3} />
    </svg>
  )
}
export function ShapeAdditionG3Illustration() {
  return (
    <Frame aria="Column addition: six square three plus one circle eight star equals triangle zero two zero.">
      <ShapeAdditionBoard revealed={{}} />
    </Frame>
  )
}

/** Q14 — the growing circle/triangle pattern, positions 1–16.
 * Groups: 1 circle + ▲, 2 circles + ▲, … Position 13 ●, 14 ▲, 15 ●. */
export const PATTERN_SHAPES: Array<'c' | 't'> = (() => {
  const out: Array<'c' | 't'> = []
  for (let n = 1; out.length < 21; n++) {
    for (let i = 0; i < n; i++) out.push('c')
    out.push('t')
  }
  return out
})()
export function PatternShape({ kind, x, y, size = 13, ghost = false }: { kind: 'c' | 't'; x: number; y: number; size?: number; ghost?: boolean }) {
  return kind === 'c' ? (
    <circle cx={x} cy={y} r={size} fill={ghost ? '#BBE6F7' : '#5BB8D7'} stroke={ghost ? '#7CC4DE' : '#23647E'} strokeWidth={1.6} />
  ) : (
    <polygon
      points={`${x},${y - size} ${x - size * 1.05},${y + size * 0.85} ${x + size * 1.05},${y + size * 0.85}`}
      fill={ghost ? '#FBD2C0' : '#F0936B'}
      stroke={ghost ? '#EFB39B' : '#9A4E2C'}
      strokeWidth={1.6}
    />
  )
}
export function CirclePatternG3Illustration() {
  return (
    <Frame aria="A row of shapes: circle, triangle, two circles, triangle, three circles, triangle, then empty boxes with question marks at the thirteenth to fifteenth places.">
      <svg viewBox="0 0 420 64" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => {
          const x = 16 + i * 26
          if (i < 9) return <PatternShape key={i} kind={PATTERN_SHAPES[i]} x={x} y={28} size={11} />
          const q = i >= 12 && i <= 14
          return (
            <g key={i}>
              <rect x={x - 12} y={16} width={24} height={24} rx={4} fill="white" stroke={q ? PINK : '#94A3B8'} strokeWidth={q ? 2.4 : 1.6} />
              {q && <text x={x} y={29} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill={PINK} className="font-display">?</text>}
            </g>
          )
        })}
        <text x={210} y={58} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#6B7280" className="font-display">1 ● then ▲, 2 ● then ▲, 3 ● then ▲, …</text>
      </svg>
    </Frame>
  )
}
