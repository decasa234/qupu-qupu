// IKMC-19-EC-Q22 — "Mary has 9 small triangles: 3 red, 3 yellow, 3 blue…"
//
// PROBLEM ONLY: static figure the student sees in the paper — a big equilateral
// triangle subdivided into 9 small equilateral triangles (1 / 3 / 5 per row).
//
// Pre-placed by Mary (shown coloured in the figure):
//   top   (row 1, upward,          no label) = RED
//   r2l   (row 2, left-upward,  label "4")   = YELLOW   [pos4]
//   r3fl  (row 3, far-left-up,     no label) = BLUE
//   r3dl  (row 3, left-down,    label "5")   = RED       [pos5]
//   r3fr  (row 3, far-right-up,    no label) = BLUE
//
// Empty (white, not yet placed):
//   r2d  (row 2, center-down, no label)
//   r2r  (row 2, right-up,    label "3")  [pos3]
//   r3c  (row 3, center-up,   label "1")  [pos1]
//   r3dr (row 3, right-down,  label "2")  [pos2]
//
// Does NOT reveal the forced colours or the answer.
//
// Co-exports `buildTriangles`, `SmallTriangle`, `TriangleGrid` for the explainer.
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── SVG viewport ─────────────────────────────────────────────────────────────
export const SVG_W = 280
export const SVG_H = 260

// ── Colour tokens ─────────────────────────────────────────────────────────────
export const COLOR = {
  RED:    '#DC2626',
  YELLOW: '#F59E0B',
  BLUE:   '#2563EB',
  EMPTY:  '#FFFFFF',
  STROKE: '#374151',
  LABEL:  '#1F2937',
  // explainer accents (re-exported for the explainer)
  GREEN:  '#10B981',
  ACCENT: '#30598A',
  ORANGE: '#F97316',
} as const

// ── Barycentric grid geometry ─────────────────────────────────────────────────
//
// Big triangle: A = apex (140,20), B = base-left (20,240), C = base-right (260,240).
// Divide each edge into 3 equal parts. Grid point P(i,j):
//   s = (3-i-j)/3,  bi = i/3,  cj = j/3
//   P = s·A + bi·B + cj·C       (barycentric, i = B-direction, j = C-direction)

const A: [number,number] = [140, 20]
const B: [number,number] = [20,  240]
const C: [number,number] = [260, 240]

function P(i: number, j: number): [number, number] {
  const s = (3-i-j)/3, bi = i/3, cj = j/3
  return [A[0]*s + B[0]*bi + C[0]*cj,  A[1]*s + B[1]*bi + C[1]*cj]
}

// ── Triangle definitions ──────────────────────────────────────────────────────

export interface TriDef {
  id: string
  pts: [number,number][]
  fill: string
  label?: string
}

/**
 * Build all 9 small triangles with the given fill overrides.
 * Missing keys default to COLOR.EMPTY (white).
 */
export function buildTriangles(fills: Partial<Record<string, string>>): TriDef[] {
  const f = (id: string) => fills[id] ?? COLOR.EMPTY
  return [
    // Row 1 — 1 upward
    { id: 'top',  pts: [P(0,0), P(1,0), P(0,1)],         fill: f('top')  },
    // Row 2 — left-up, center-down, right-up
    { id: 'r2l',  pts: [P(1,0), P(2,0), P(1,1)],         fill: f('r2l'),  label: '4' },
    { id: 'r2d',  pts: [P(1,0), P(0,1), P(1,1)],         fill: f('r2d')  },
    { id: 'r2r',  pts: [P(0,1), P(1,1), P(0,2)],         fill: f('r2r'),  label: '3' },
    // Row 3 — far-left-up, left-down, center-up, right-down, far-right-up
    { id: 'r3fl', pts: [P(2,0), P(3,0), P(2,1)],         fill: f('r3fl') },
    { id: 'r3dl', pts: [P(2,0), P(1,1), P(2,1)],         fill: f('r3dl'), label: '5' },
    { id: 'r3c',  pts: [P(1,1), P(2,1), P(1,2)],         fill: f('r3c'),  label: '1' },
    { id: 'r3dr', pts: [P(1,1), P(0,2), P(1,2)],         fill: f('r3dr'), label: '2' },
    { id: 'r3fr', pts: [P(0,2), P(1,2), P(0,3)],         fill: f('r3fr') },
  ]
}

// ── Primitives ────────────────────────────────────────────────────────────────

function pts2str(pts: [number,number][]): string {
  return pts.map(([x,y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

function centroid(pts: [number,number][]): [number,number] {
  const cx = pts.reduce((s,p) => s+p[0], 0) / pts.length
  const cy = pts.reduce((s,p) => s+p[1], 0) / pts.length
  return [cx, cy]
}

/** A single coloured triangle with an optional number label. */
export function SmallTriangle({ tri }: { tri: TriDef }) {
  const [cx, cy] = centroid(tri.pts)
  // Darken label text on light fills
  const isDark = tri.fill === COLOR.RED || tri.fill === COLOR.BLUE
  const labelFill = isDark ? '#FFFFFF' : COLOR.LABEL
  return (
    <g>
      <polygon
        points={pts2str(tri.pts)}
        fill={tri.fill}
        stroke={COLOR.STROKE}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {tri.label && (
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={800}
          fill={labelFill}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {tri.label}
        </text>
      )}
    </g>
  )
}

/** Renders all 9 triangles from a fills map. */
export function TriangleGrid({ fills }: { fills?: Partial<Record<string, string>> }) {
  const tris = buildTriangles(fills ?? {})
  return (
    <g>
      {tris.map((t) => (
        <SmallTriangle key={t.id} tri={t} />
      ))}
    </g>
  )
}

// ── Static problem figure ─────────────────────────────────────────────────────

const STATIC_FILLS: Record<string, string> = {
  top:  COLOR.RED,
  r2l:  COLOR.YELLOW,
  r3fl: COLOR.BLUE,
  r3dl: COLOR.RED,
  r3fr: COLOR.BLUE,
}

/**
 * TriPositions22ECIllustration
 *
 * Static, problem-only figure for IKMC-19-EC-Q22.
 * Shows the partially filled 9-triangle arrangement.
 * Does NOT reveal the forced colours or the answer.
 */
export default function TriPositions22ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Segitiga besar terdiri dari 9 segitiga kecil. Segitiga atas merah, ' +
        'posisi 4 kuning, dua sudut bawah biru, posisi 5 merah. ' +
        'Posisi 1 (tengah bawah), 2 (kanan-tengah), 3 (kanan tengah atas), ' +
        'dan segitiga ▽ dalam masih kosong.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
        <TriangleGrid fills={STATIC_FILLS} />
      </svg>
    </div>
  )
}
