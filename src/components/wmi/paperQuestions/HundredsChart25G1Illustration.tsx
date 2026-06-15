/**
 * STEM illustration for WMI-25F1A-Q8 (2025 Grade 1 Final).
 *
 * The question shows five small fragments cut from a 1–100 hundreds chart
 * (10 numbers per row) and asks: in which fragment is 35 NOT the number that
 * belongs in the blank? This reference figure teaches ONLY the rule that makes
 * the puzzle solvable — in a hundreds chart, moving RIGHT adds 1 and moving
 * DOWN adds 10. It deliberately draws a neutral example (around 22) so it never
 * reveals which option (E) is the answer.
 *
 * Pure render — no params, no random, no dates. SSR-safe and deterministic.
 */

// A neutral 2x3 window so the +1 / +10 rule is obvious without touching 35.
const SAMPLE_GRID = [
  [21, 22, 23],
  [31, 32, 33],
]

export default function HundredsChart25G1Illustration() {
  const cell = 46
  const gap = 0
  const cols = 3
  const rows = 2
  const padX = 30
  const padTop = 26
  const arrowPad = 30 // room for the +1 / +10 arrow labels

  const gridW = cols * cell + (cols - 1) * gap
  const gridH = rows * cell + (rows - 1) * gap
  const width = padX * 2 + gridW + arrowPad
  const height = padTop + gridH + arrowPad + 10

  const gx = padX
  const gy = padTop

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Aturan papan seratus: setiap baris berisi 10 angka. Bergerak ke kanan menambah 1, bergerak ke bawah menambah 10."
    >
      <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(280, width)}>
        <defs>
          <marker
            id="hc25-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" className="fill-qupu-brand-orange" />
          </marker>
        </defs>

        {/* the 2x3 reference window */}
        {SAMPLE_GRID.map((rowVals, r) =>
          rowVals.map((value, c) => {
            const x = gx + c * (cell + gap)
            const y = gy + r * (cell + gap)
            return (
              <g key={`${r}-${c}`}>
                <rect
                  x={x}
                  y={y}
                  width={cell}
                  height={cell}
                  className="fill-qupu-cream stroke-qupu-brand-blue"
                  strokeWidth={2}
                />
                <text
                  x={x + cell / 2}
                  y={y + cell / 2 + 7}
                  textAnchor="middle"
                  fontSize="20"
                  fontWeight="bold"
                  className="fill-qupu-brand-blue"
                >
                  {value}
                </text>
              </g>
            )
          }),
        )}

        {/* +1 arrow along the top row (right = +1) */}
        <line
          x1={gx + cell * 0.5}
          y1={gy - 12}
          x2={gx + cell * 1.5}
          y2={gy - 12}
          className="stroke-qupu-brand-orange"
          strokeWidth={2.5}
          markerEnd="url(#hc25-arrow)"
        />
        <text
          x={gx + cell}
          y={gy - 17}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          className="fill-qupu-brand-orange"
        >
          +1
        </text>

        {/* +10 arrow down the left column (down = +10) */}
        <line
          x1={gx - 12}
          y1={gy + cell * 0.5}
          x2={gx - 12}
          y2={gy + cell * 1.5}
          className="stroke-qupu-brand-orange"
          strokeWidth={2.5}
          markerEnd="url(#hc25-arrow)"
        />
        <text
          x={gx - 16}
          y={gy + cell + 4}
          textAnchor="end"
          fontSize="14"
          fontWeight="bold"
          className="fill-qupu-brand-orange"
        >
          +10
        </text>
      </svg>
    </div>
  )
}
