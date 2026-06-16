// "Colour the parts whose value is greater than 8" figure for WMI-22P2A-Q20
// (2022 Grade 2 Semifinal).
//
// Redrawn from db/seed/wmi/figures/2022-semifinal-g2-a-q20.jpg: a cat-/house-like
// figure built from labelled parts, each holding a calculation:
//   two triangle "ears":      2×3,  28÷7
//   big rectangle "face":     two oval "eyes" 64÷8 and 35÷5, plus 12÷2 below
//   bottom-left tall rect:    40÷5
//   small rect (chin):        6×7
//   tilted rect (paw):        72÷8        small circle: 8
//
// Rule: colour a part DARK if its value is greater than 8, else leave it light.
//   2×3=6, 28÷7=4, 64÷8=8, 35÷5=7, 12÷2=6, 40÷5=8, 6×7=42, 72÷8=9.
//   Greater-than-8 (dark): ONLY 6×7=42 and 72÷8=9.
//   Trap: 64÷8 and 40÷5 EQUAL 8 — not greater than 8 — so they stay light.
// Only option C colours exactly those two parts dark → answer C.
// The static figure shows the problem ONLY (every part light, no shading).

const STROKE = '#3F3F46'
const INK = '#27272A'
const LIGHT = '#FFFFFF'
const DARK = '#3F3F46'
const DARK_INK = '#FFFFFF'

// Each part keyed so the explainer can shade them one at a time.
export type PartKey = 'ear1' | 'ear2' | 'eye1' | 'eye2' | 'mouth' | 'leftRect' | 'chin' | 'paw' | 'circle'

export const PART_EXPR: Record<PartKey, string> = {
  ear1: '2×3',
  ear2: '28÷7',
  eye1: '64÷8',
  eye2: '35÷5',
  mouth: '12÷2',
  leftRect: '40÷5',
  chin: '6×7',
  paw: '72÷8',
  circle: '8',
}
export const PART_VALUE: Record<PartKey, number> = {
  ear1: 6,
  ear2: 4,
  eye1: 8,
  eye2: 7,
  mouth: 6,
  leftRect: 8,
  chin: 42,
  paw: 9,
  circle: 8,
}
// Parts whose value is strictly greater than 8 → the dark answer set.
export const DARK_PARTS: PartKey[] = (Object.keys(PART_VALUE) as PartKey[]).filter((k) => PART_VALUE[k] > 8)

export interface FaceFigureProps {
  /** Parts to shade dark (their value treated as > 8). Empty = problem figure. */
  shaded?: PartKey[]
  /** Show each part's evaluated value beneath its expression. */
  showValues?: boolean
}

function exprText(key: PartKey, cx: number, cy: number, shaded: boolean, showValues: boolean, size = 20) {
  const fill = shaded ? DARK_INK : INK
  return (
    <g>
      <text x={cx} y={showValues ? cy - 9 : cy} textAnchor="middle" dominantBaseline="central" fontSize={size} fill={fill}>
        {PART_EXPR[key]}
      </text>
      {showValues && key !== 'circle' && (
        <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill={shaded ? '#FCD34D' : '#2563EB'}>
          {`= ${PART_VALUE[key]}`}
        </text>
      )}
    </g>
  )
}

export function FaceFigure({ shaded = [], showValues = false }: FaceFigureProps) {
  const isDark = (k: PartKey) => shaded.includes(k)
  const fillOf = (k: PartKey) => (isDark(k) ? DARK : LIGHT)
  return (
    <svg viewBox="0 0 480 470" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* ear 1 (left triangle) */}
      <polygon points="70,150 150,150 110,40" fill={fillOf('ear1')} stroke={STROKE} strokeWidth={2} strokeLinejoin="round" />
      {exprText('ear1', 110, 122, isDark('ear1'), showValues, 17)}

      {/* ear 2 (right triangle) */}
      <polygon points="230,150 330,150 280,40" fill={fillOf('ear2')} stroke={STROKE} strokeWidth={2} strokeLinejoin="round" />
      {exprText('ear2', 280, 122, isDark('ear2'), showValues, 17)}

      {/* face (big rectangle) */}
      <rect x="40" y="150" width="320" height="180" fill={fillOf('mouth')} stroke={STROKE} strokeWidth={2} />

      {/* eyes (ovals) sit on the face */}
      <ellipse cx="120" cy="205" rx="58" ry="26" fill={fillOf('eye1')} stroke={STROKE} strokeWidth={2} />
      {exprText('eye1', 120, 205, isDark('eye1'), showValues, 18)}
      <ellipse cx="280" cy="205" rx="58" ry="26" fill={fillOf('eye2')} stroke={STROKE} strokeWidth={2} />
      {exprText('eye2', 280, 205, isDark('eye2'), showValues, 18)}

      {/* mouth label (the face rectangle's own expression, lower-centre) */}
      {exprText('mouth', 200, 280, isDark('mouth'), showValues, 20)}

      {/* bottom-left tall rectangle */}
      <rect x="100" y="330" width="120" height="130" fill={fillOf('leftRect')} stroke={STROKE} strokeWidth={2} />
      {exprText('leftRect', 160, 392, isDark('leftRect'), showValues, 18)}

      {/* chin (small rectangle) */}
      <rect x="220" y="400" width="120" height="60" fill={fillOf('chin')} stroke={STROKE} strokeWidth={2} />
      {exprText('chin', 280, 430, isDark('chin'), showValues, 18)}

      {/* paw (tilted rectangle) */}
      <g transform="rotate(-22 405 380)">
        <rect x="345" y="356" width="120" height="48" fill={fillOf('paw')} stroke={STROKE} strokeWidth={2} />
        {exprText('paw', 405, 380, isDark('paw'), showValues, 18)}
      </g>

      {/* small circle "8" */}
      <circle cx="420" cy="300" r="30" fill={fillOf('circle')} stroke={STROKE} strokeWidth={2} />
      {exprText('circle', 420, 300, isDark('circle'), showValues, 20)}
    </svg>
  )
}

export default function P22G2Q20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A figure made of labelled parts, each holding a calculation: triangles 2×3 and 28÷7; oval eyes 64÷8 and 35÷5; body 12÷2; left rectangle 40÷5; small rectangle 6×7; tilted rectangle 72÷8; circle 8. Colour each part dark if its value is greater than 8."
    >
      <FaceFigure />
    </div>
  )
}
