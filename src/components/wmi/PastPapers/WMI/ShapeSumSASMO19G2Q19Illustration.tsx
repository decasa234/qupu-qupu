// SASMO-19-G2-Q19 — shape-equation puzzle
// Given: sq+tri+circ+circ=32; sq=tri+20; circ=0 (from figure). Find: sq+circ+circ.
// Three equation rows with shape glyphs; never reveals the answer (sq=26).
// No primitive covers a multi-row shape-equation display → fresh SVG.
// Pattern adapted from AgeAlice19B7Illustration (row-equation + highlight props).

const SQ_FILL = '#F97316'    // orange — square
const TRI_FILL = '#0D9488'   // teal — triangle
const CIRC_FILL = '#7C3AED'  // violet — circle
const INK = '#1F2937'
const ACCENT = '#1E40AF'

const W = 440
const H = 212

// ── shape glyphs ──────────────────────────────────────────────────────────────

function Sq({ cx, cy }: { cx: number; cy: number }) {
  return (
    <rect
      x={cx - 16} y={cy - 16} width={32} height={32} rx={5}
      fill={SQ_FILL} stroke="#B45309" strokeWidth={2}
    />
  )
}

function Tri({ cx, cy }: { cx: number; cy: number }) {
  const h = 27.7  // 32 * 0.866
  return (
    <polygon
      points={`${cx},${cy - h * 0.67} ${cx - 16},${cy + h * 0.33} ${cx + 16},${cy + h * 0.33}`}
      fill={TRI_FILL} stroke="#065F46" strokeWidth={2}
    />
  )
}

function Circ({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={14} fill={CIRC_FILL} stroke="#4C1D95" strokeWidth={2} />
}

function Op({ x, y, v }: { x: number; y: number; v: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
      fontSize={20} fontWeight={900} fill={INK}>{v}</text>
  )
}

function Num({ x, y, v, color }: { x: number; y: number; v: string; color?: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
      fontSize={22} fontWeight={900} fill={color ?? ACCENT}>{v}</text>
  )
}

// ── diagram ───────────────────────────────────────────────────────────────────

export interface ShapeSumDiagramProps {
  highlightEq1?: boolean
  highlightEq2?: boolean
  highlightEq3?: boolean
  showAnswer?: boolean
}

function rowStyle(active: boolean) {
  return active
    ? { fill: '#EFF6FF', stroke: '#2563EB', strokeWidth: 2.5 }
    : { fill: '#F9FAFB', stroke: '#D1D5DB', strokeWidth: 1.5 }
}

export function ShapeSumDiagram({
  highlightEq1 = false,
  highlightEq2 = false,
  highlightEq3 = false,
  showAnswer = false,
}: ShapeSumDiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Row 1: sq + tri + circ + circ = 32 (y_center=30) ── */}
      <rect x={8} y={6} width={W - 16} height={48} rx={10} {...rowStyle(highlightEq1)} />
      <Sq  cx={96}  cy={30} />
      <Op  x={130}  y={30} v="+" />
      <Tri cx={164} cy={30} />
      <Op  x={198}  y={30} v="+" />
      <Circ cx={230} cy={30} />
      <Op  x={262}  y={30} v="+" />
      <Circ cx={294} cy={30} />
      <Op  x={326}  y={30} v="=" />
      <Num x={358}  y={30} v="32" />

      {/* ── Row 2: sq = tri + 20 (y_center=88) ── */}
      <rect x={8} y={64} width={W - 16} height={48} rx={10} {...rowStyle(highlightEq2)} />
      <Sq  cx={156} cy={88} />
      <Op  x={190}  y={88} v="=" />
      <Tri cx={224} cy={88} />
      <Op  x={258}  y={88} v="+" />
      <Num x={288}  y={88} v="20" />

      {/* ── Row 3: circ = 0 (given by figure, y_center=146) ── */}
      <rect x={8} y={122} width={W - 16} height={48} rx={10} {...rowStyle(highlightEq3)} />
      <Circ cx={194} cy={146} />
      <Op   x={226}  y={146} v="=" />
      <Num  x={258}  y={146} v="0" />

      {/* ── Question banner ── */}
      <rect
        x={8} y={180} width={W - 16} height={26} rx={10}
        fill={showAnswer ? '#D1FAE5' : '#FEF9C3'}
        stroke={showAnswer ? '#10B981' : '#CA8A04'}
        strokeWidth={1.8}
      />
      <text
        x={W / 2} y={193}
        textAnchor="middle" dominantBaseline="central"
        fontSize={12} fontWeight={700}
        fill={showAnswer ? '#065F46' : '#713F12'}
      >
        {showAnswer
          ? 'persegi + lingkaran + lingkaran = 26 + 0 + 0 = 26'
          : 'Cari: persegi + lingkaran + lingkaran = ?'}
      </text>
    </svg>
  )
}

/** SASMO-19-G2-Q19 stem illustration — shows given equations only, no answer. */
export default function ShapeSumSASMO19G2Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-xl border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Tiga persamaan: ' +
        '(1) persegi+segitiga+lingkaran+lingkaran=32, ' +
        '(2) persegi=segitiga+20, ' +
        '(3) lingkaran=0. ' +
        'Cari: persegi+lingkaran+lingkaran.'
      }
    >
      <ShapeSumDiagram />
    </div>
  )
}
