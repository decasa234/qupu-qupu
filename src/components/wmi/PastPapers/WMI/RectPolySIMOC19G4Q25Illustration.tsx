/**
 * RectPolySIMOC19G4Q25Illustration — SIMOC-19-G4-Q25
 *
 * "Semua sisi pada gambar berikut saling bertemu membentuk sudut siku-siku.
 *  Gunakan bilangan 1–8 untuk mewakili sisi a–h. Tentukan luas terbesar."
 * Answer: 50.
 *
 * Source: docs/reference/ocr-res/simoc/contest/g4/2019.imgs/014.jpg
 *
 * Figure: a rectilinear 8-sided staircase polygon with sides labeled a–h.
 * No matching primitive; fresh SVG.
 *
 * Vertices (CW from bottom-right):
 *   P1(200,200) —a→ P2(200,20) —h→ P3(120,20) —g→ P4(120,90)
 *   —f→ P5(80,90) —e→ P6(80,55) —d→ P7(20,55) —c→ P8(20,200) —b→ P1
 *
 * Constraints: b=d+f+h=180, c=a+e-g=(a+e-g)
 */

// ---------------------------------------------------------------------------
// Geometry — exported so the Explainer can reuse
// ---------------------------------------------------------------------------

/** Polygon vertices clockwise from bottom-right (SVG coords, y-down). */
export const POLY_PTS: [number, number][] = [
  [200, 200], // P1 bottom-right
  [200, 20],  // P2 top-right       (a ends / h starts)
  [120, 20],  // P3 inner top        (h ends / g starts)
  [120, 90],  // P4 inner-right low  (g ends / f starts)
  [80, 90],   // P5 inner-left low   (f ends / e starts)
  [80, 55],   // P6 ear inner top    (e ends / d starts)
  [20, 55],   // P7 ear outer top    (d ends / c starts)
  [20, 200],  // P8 bottom-left      (c ends / b starts)
]

/** Edges: [P_from_index, P_to_index, label] */
export const EDGES: [number, number, string][] = [
  [0, 1, 'a'], // right side
  [1, 2, 'h'], // top-right
  [2, 3, 'g'], // inner-right wall
  [3, 4, 'f'], // inner connector
  [4, 5, 'e'], // ear inner right
  [5, 6, 'd'], // ear top
  [6, 7, 'c'], // left outer
  [7, 0, 'b'], // bottom
]

/** Side label positions [x, y, anchor] */
export const SIDE_LABELS: { id: string; x: number; y: number; anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'a', x: 213, y: 113, anchor: 'start' },
  { id: 'b', x: 110, y: 217, anchor: 'middle' },
  { id: 'c', x: 7,   y: 130, anchor: 'end' },
  { id: 'd', x: 50,  y: 43,  anchor: 'middle' },
  { id: 'e', x: 94,  y: 74,  anchor: 'start' },
  { id: 'f', x: 100, y: 107, anchor: 'middle' },
  { id: 'g', x: 107, y: 57,  anchor: 'end' },
  { id: 'h', x: 160, y: 9,   anchor: 'middle' },
]

const VBW = 230
const VBH = 230

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RectPolySIMOC19G4Q25Illustration() {
  const pts = POLY_PTS.map(([x, y]) => `${x},${y}`).join(' ')

  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Poligon persegi panjang bersisi delapan dengan sudut siku-siku, sisi berlabel a–h. Tetapkan bilangan 1–8 ke setiap sisi untuk memaksimalkan luas."
    >
      <svg
        viewBox={`0 0 ${VBW} ${VBH}`}
        width="100%"
        style={{ maxWidth: 280, display: 'block' }}
        aria-hidden="true"
      >
        {/* Polygon */}
        <polygon
          points={pts}
          fill="#EEF3FB"
          stroke="#1E3A5F"
          strokeWidth={2.5}
          strokeLinejoin="miter"
        />

        {/* Vertex dots */}
        {POLY_PTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.5} fill="#1E3A5F" />
        ))}

        {/* Side labels */}
        {SIDE_LABELS.map(({ id, x, y, anchor }) => (
          <text
            key={id}
            x={x}
            y={y}
            textAnchor={anchor}
            fontSize={15}
            fontStyle="italic"
            fontFamily="Georgia, 'Times New Roman', serif"
            fill="#1E3A5F"
            fontWeight={700}
          >
            {id}
          </text>
        ))}
      </svg>
    </div>
  )
}
