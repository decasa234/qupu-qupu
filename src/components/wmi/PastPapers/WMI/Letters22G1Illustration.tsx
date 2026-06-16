// WMI-22F1A-Q2 (Grade 1) question figure.
//
// The letters W, M, I are each drawn with thick RED strokes on a light-blue
// square grid (4×4 cells per panel). The question asks which letter is drawn
// with the LONGEST total line. W and M are each four long slanted strokes
// (equal total length); I is three shorter strokes (top bar + stem + bottom
// bar). This draws ONLY the setup — three letters on three grids — and never
// reveals which letter (or pair) wins.
//
// Pure render, SSR-safe & deterministic: no random, no dates, no state. Three
// light-blue grid panels side by side, each carrying one red letter. A
// co-exported `LetterPanels` primitive lets the animator focus one panel.

// No qupu token exists for red; the codebase uses raw hex for un-tokened
// colours (e.g. #10B981, #F59E0B). Use a warm crimson for the letter strokes.
const LETTER_RED = '#E11D48'

// One letter occupies a 4×4 cell grid. Coordinates are in "cell" units; the
// renderer multiplies by CELL and offsets by the panel origin + padding.
const COLS = 4
const ROWS = 4

type Pt = [number, number]

// Letter strokes as polyline point-lists, in grid-cell coordinates (x right,
// y down). W and M span the full 4-cell height; I uses shorter bars + stem.
const LETTER_STROKES: Record<'W' | 'M' | 'I', Pt[][]> = {
  // W: four slanted strokes — down, up-to-mid, down, up.
  W: [
    [
      [0, 0],
      [1, 4],
      [2, 1.4],
      [3, 4],
      [4, 0],
    ],
  ],
  // M: four strokes — up, down-to-mid, up, down (mirror of W vertically).
  M: [
    [
      [0, 4],
      [0, 0],
      [2, 2.6],
      [4, 0],
      [4, 4],
    ],
  ],
  // I: a serif capital — top bar, vertical stem, bottom bar (three shorter
  // strokes, clearly less total ink than W or M).
  I: [
    [
      [0.6, 0],
      [3.4, 0],
    ],
    [
      [2, 0],
      [2, 4],
    ],
    [
      [0.6, 4],
      [3.4, 4],
    ],
  ],
}

const LETTER_ORDER: Array<'W' | 'M' | 'I'> = ['W', 'M', 'I']

const ARIA =
  'Tiga huruf W, M, dan I, masing-masing digambar dengan garis merah tebal pada kotak-kotak biru muda. ' +
  'Tentukan huruf yang digambar dengan garis total paling panjang.'

/**
 * The three letter panels. `litLetter` highlights one panel with an amber
 * frame so the animator can focus on it; by default no panel is highlighted.
 */
export function LetterPanels({ litLetter }: { litLetter?: 'W' | 'M' | 'I' }) {
  // --- layout (in SVG user units) ---------------------------------------
  const CELL = 24 // grid cell size
  const gridW = COLS * CELL
  const gridH = ROWS * CELL
  const innerPad = 8 // breathing room inside a panel around the grid
  const panelW = gridW + innerPad * 2
  const panelH = gridH + innerPad * 2
  const gap = 22 // gap between panels
  const margin = 6 // outer headroom so the amber frame never clips

  const width = margin * 2 + COLS * 0 + LETTER_ORDER.length * panelW + (LETTER_ORDER.length - 1) * gap
  const height = margin * 2 + panelH

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(360, width)} aria-hidden="true">
      {LETTER_ORDER.map((letter, idx) => {
        const px = margin + idx * (panelW + gap)
        const py = margin
        const gx = px + innerPad
        const gy = py + innerPad
        const lit = litLetter === letter
        return (
          <g key={letter}>
            {/* panel background */}
            <rect
              x={px}
              y={py}
              width={panelW}
              height={panelH}
              rx={6}
              className="fill-qupu-shell"
            />
            {/* light-blue grid: vertical + horizontal lines */}
            {Array.from({ length: COLS + 1 }, (_, c) => (
              <line
                key={`v${c}`}
                x1={gx + c * CELL}
                y1={gy}
                x2={gx + c * CELL}
                y2={gy + gridH}
                className="stroke-qupu-blue-light"
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: ROWS + 1 }, (_, r) => (
              <line
                key={`h${r}`}
                x1={gx}
                y1={gy + r * CELL}
                x2={gx + gridW}
                y2={gy + r * CELL}
                className="stroke-qupu-blue-light"
                strokeWidth={1}
              />
            ))}
            {/* the red letter strokes */}
            {LETTER_STROKES[letter].map((stroke, si) => (
              <polyline
                key={si}
                points={stroke.map(([cx, cy]) => `${gx + cx * CELL},${gy + cy * CELL}`).join(' ')}
                fill="none"
                stroke={LETTER_RED}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {/* focus frame when this panel is lit */}
            {lit && (
              <rect
                x={px - 2}
                y={py - 2}
                width={panelW + 4}
                height={panelH + 4}
                rx={8}
                fill="none"
                className="stroke-qupu-brand-orange"
                strokeWidth={3}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function Letters22G1Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <LetterPanels />
    </div>
  )
}
