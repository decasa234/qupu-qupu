// OSN-20-SD-KAB-Q14 — Diagram lingkaran ukuran baju 30 siswa Kelas V SDN Cipali.
// Tiga sektor berlabel x% (XS=10%), y% (XL=13.3%), z% (M=26.7%).
// Tiga sektor tidak berlabel menampilkan nilai: S=20%, L=23.3%, XXL=6.7%.
// x + y + z = 10 + 13.3 + 26.7 = 50.
// Fresh SVG — tidak ada primitif pie-chart yang cocok.

const CX = 115, CY = 145, R = 90

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

function sectorD(cx: number, cy: number, r: number, s: number, e: number): string {
  const [sx, sy] = polar(cx, cy, r, s)
  const [ex, ey] = polar(cx, cy, r, e)
  const lg = e - s > 180 ? 1 : 0
  return `M${cx},${cy}L${sx.toFixed(2)},${sy.toFixed(2)}A${r},${r},0,${lg},1,${ex.toFixed(2)},${ey.toFixed(2)}Z`
}

export interface PieState {
  highlightIds?: string[]   // sector IDs to highlight (yellow)
  dimOthers?: boolean       // dim non-highlighted
  showSum?: boolean         // show "20+23.3+6.7=50%" annotation
  showAnswer?: boolean      // show "x+y+z=50" banner
}

interface SectorDef {
  id: string
  start: number
  end: number
  fill: string
  textFill: string
  label: string
  isVar: boolean  // true → shows "x%"/"y%"/"z%", false → shows actual %
}

// Clockwise from 12 o'clock: XXL, XS(x%), S, M(z%), L, XL(y%)
const SECTORS: SectorDef[] = [
  { id: 'XXL', start:   0, end:  24, fill: '#e0f2fe', textFill: '#0c4a6e', label: '6.7%',  isVar: false },
  { id: 'XS',  start:  24, end:  60, fill: '#7dd3fc', textFill: '#1e3a8a', label: 'x%',    isVar: true  },
  { id: 'S',   start:  60, end: 132, fill: '#1d4ed8', textFill: '#ffffff', label: '20%',   isVar: false },
  { id: 'M',   start: 132, end: 228, fill: '#60a5fa', textFill: '#1e3a8a', label: 'z%',    isVar: true  },
  { id: 'L',   start: 228, end: 312, fill: '#1e40af', textFill: '#ffffff', label: '23.3%', isVar: false },
  { id: 'XL',  start: 312, end: 360, fill: '#bfdbfe', textFill: '#1e3a8a', label: 'y%',    isVar: true  },
]

const LEGEND_X = 218
const LEGEND_ITEMS: { id: string; fill: string }[] = [
  { id: 'XS',  fill: '#7dd3fc' },
  { id: 'S',   fill: '#1d4ed8' },
  { id: 'M',   fill: '#60a5fa' },
  { id: 'L',   fill: '#1e40af' },
  { id: 'XL',  fill: '#bfdbfe' },
  { id: 'XXL', fill: '#e0f2fe' },
]

export function PieChartDiagram({ highlightIds, dimOthers, showSum, showAnswer }: PieState) {
  return (
    <svg viewBox="0 0 262 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Title */}
      <text x={CX} y={14} textAnchor="middle" fontFamily="sans-serif" fontSize="9.5"
        fontWeight="bold" fill="#1e3a8a">Ukuran Baju Siswa Kelas V SDN Cipali</text>

      {/* Sectors */}
      {SECTORS.map(s => {
        const span = s.end - s.start
        const mid = (s.start + s.end) / 2
        const highlighted = highlightIds?.includes(s.id)
        const opacity = dimOthers && highlightIds && !highlighted ? 0.35 : 1
        const fillColor = highlighted ? '#fde68a' : s.fill

        // label position at 65% radius (or external for tiny XXL sector)
        const [lx, ly] = polar(CX, CY, R * 0.65, mid)
        // external label for XXL (span=24°, too narrow for text)
        const [ex_, ey_] = polar(CX, CY, R * 1.2, mid)
        const [ix_, iy_] = polar(CX, CY, R * 1.0, mid)
        const tooSmall = span < 28

        return (
          <g key={s.id} opacity={opacity}>
            <path d={sectorD(CX, CY, R, s.start, s.end)} fill={fillColor} stroke="white" strokeWidth="2" />
            {tooSmall ? (
              <>
                <line
                  x1={ix_.toFixed(2)} y1={iy_.toFixed(2)}
                  x2={ex_.toFixed(2)} y2={ey_.toFixed(2)}
                  stroke="#475569" strokeWidth="1"
                />
                <text
                  x={ex_.toFixed(2)} y={(+ey_ - 5).toFixed(2)}
                  textAnchor="middle" dominantBaseline="auto"
                  fontFamily="sans-serif" fontSize="8.5" fill="#0c4a6e">
                  {s.label}
                </text>
              </>
            ) : (
              <text
                x={lx.toFixed(2)} y={ly.toFixed(2)}
                textAnchor="middle" dominantBaseline="middle"
                fontFamily="sans-serif"
                fontSize={span >= 72 ? '12' : span >= 48 ? '11' : '10'}
                fontWeight={s.isVar ? 'bold' : 'normal'}
                fill={s.textFill}>
                {s.label}
              </text>
            )}
          </g>
        )
      })}

      {/* Sum annotation (inside pie center) */}
      {showSum && (
        <text x={CX} y={CY - 6} textAnchor="middle" dominantBaseline="middle"
          fontFamily="sans-serif" fontSize="8.5" fill="#0f172a" fontWeight="bold">
          20+23.3+6.7
        </text>
      )}
      {showSum && (
        <text x={CX} y={CY + 8} textAnchor="middle" dominantBaseline="middle"
          fontFamily="sans-serif" fontSize="8.5" fill="#0f172a" fontWeight="bold">
          = 50%
        </text>
      )}

      {/* Answer banner */}
      {showAnswer && (
        <g>
          <rect x="25" y="228" width="170" height="18" rx="5" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5" />
          <text x="110" y="237" textAnchor="middle" dominantBaseline="middle"
            fontFamily="sans-serif" fontSize="11" fontWeight="bold" fill="#065f46">
            x + y + z = 50
          </text>
        </g>
      )}

      {/* Legend */}
      {LEGEND_ITEMS.map((item, i) => (
        <g key={`leg-${item.id}`}>
          <rect x={LEGEND_X} y={60 + i * 22} width="11" height="11"
            fill={item.fill} stroke="#94a3b8" strokeWidth="0.5" />
          <text x={LEGEND_X + 15} y={71 + i * 22}
            fontFamily="sans-serif" fontSize="9.5" fill="#334155"
            dominantBaseline="middle">{item.id}</text>
        </g>
      ))}
    </svg>
  )
}

export default function PieChartOSN20KQ14Illustration() {
  return <PieChartDiagram />
}
