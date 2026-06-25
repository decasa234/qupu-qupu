// SEAMO-20-A-Q17 — Students in a 5×9 rectangular grid; James is marked.
//
// James observes:
//   3 in front (rows 0–2), James at row 3, 1 behind (row 4) → 5 rows
//   5 to his left (cols 0–4), James at col 5, 3 to his right (cols 6–8) → 9 cols
//   Total = 5 × 9 = 45 students.
//
// The stem illustration shows the PROBLEM only: the 5×9 grid with James
// highlighted in amber and a small "J" label, surrounded by plain person-dot
// cells. No answer is shown.

import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'

// Grid dimensions (from breakdown.quantities)
const ROWS = 5
const COLS = 9
const JAMES_ROW = 3   // 0-indexed: rows 0-2 are in front, row 3 = James, row 4 = behind
const JAMES_COL = 5   // 0-indexed: cols 0-4 are to his left, col 5 = James, cols 6-8 = right

const CELL = 38

// Simple person silhouette: small circle head + stubby body, centred on cx/cy.
function PersonDot({
  cx,
  cy,
  size = 11,
  headColor = '#6B7280',
  bodyColor = '#9CA3AF',
}: {
  cx: number
  cy: number
  size?: number
  headColor?: string
  bodyColor?: string
}) {
  const hr = size * 0.38          // head radius
  const bodyH = size * 0.55       // body height below head
  const bodyW = size * 0.55       // body width
  return (
    <g>
      {/* head */}
      <circle cx={cx} cy={cy - bodyH * 0.4} r={hr} fill={headColor} />
      {/* body */}
      <ellipse
        cx={cx}
        cy={cy + bodyH * 0.55}
        rx={bodyW / 2}
        ry={bodyH / 2}
        fill={bodyColor}
      />
    </g>
  )
}

/** Exported primitive — the grid with optional James-cell highlight. Used by the explainer. */
export function StudentGrid({
  highlightJames = true,
  showRowLabel = false,
  showColLabel = false,
}: {
  highlightJames?: boolean
  showRowLabel?: boolean
  showColLabel?: boolean
}) {
  const vb = gridBoardViewBox(ROWS, COLS, CELL)

  return (
    <svg
      viewBox={vb}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 380 }}
      aria-hidden="true"
    >
      {/* Grid background */}
      <GridBoard
        rows={ROWS}
        cols={COLS}
        cellSize={CELL}
        fill={(r, c) => {
          if (r === JAMES_ROW && c === JAMES_COL) return '#FEF3C7' // amber tint for James
          return '#F9FAFB' // very light grey for everyone else
        }}
        highlight={(r, c) =>
          r === JAMES_ROW && c === JAMES_COL && highlightJames ? 'amber' : 'none'
        }
      />

      {/* Person dots in every cell */}
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => {
          const cx = c * CELL + CELL / 2
          const cy = r * CELL + CELL / 2
          const isJames = r === JAMES_ROW && c === JAMES_COL
          return isJames ? (
            // James: amber head + body + "J" label
            <g key={`p-${r}-${c}`}>
              <PersonDot cx={cx} cy={cy - 3} size={14} headColor="#D97706" bodyColor="#F59E0B" />
              <text
                x={cx}
                y={cy + 11}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={9}
                fontWeight={900}
                fill="#92400E"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                J
              </text>
            </g>
          ) : (
            <PersonDot key={`p-${r}-${c}`} cx={cx} cy={cy} size={10} />
          )
        }),
      )}

      {/* Optional row count arrow (left side) */}
      {showRowLabel && (
        <g>
          <line
            x1={-6}
            y1={0}
            x2={-6}
            y2={ROWS * CELL}
            stroke="#6366F1"
            strokeWidth={2}
            markerEnd="url(#arrowEnd)"
          />
          <text
            x={-14}
            y={(ROWS * CELL) / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={800}
            fill="#6366F1"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            transform={`rotate(-90, -14, ${(ROWS * CELL) / 2})`}
          >
            5 rows
          </text>
        </g>
      )}

      {/* Optional column count arrow (top) */}
      {showColLabel && (
        <g>
          <text
            x={(COLS * CELL) / 2}
            y={-10}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={800}
            fill="#6366F1"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            9 columns
          </text>
        </g>
      )}
    </svg>
  )
}

export default function StudentGrid20A17Illustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-3"
      role="img"
      aria-label={
        'Formasi kotak-kotak persegi panjang 5 baris kali 9 kolom. James ditandai warna kuning amber di baris ke-4 kolom ke-6. ' +
        'Ada 3 siswa di depan James, 1 di belakang, 5 di kirinya, dan 3 di kanannya.'
      }
    >
      <StudentGrid />

      {/* Direction legend below the grid */}
      <svg
        viewBox="0 0 340 56"
        width="100%"
        style={{ display: 'block', margin: '0 auto', maxWidth: 340 }}
        aria-hidden="true"
      >
        {/* Front label (top of grid → in front of James) */}
        <text
          x={170}
          y={12}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill="#374151"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ↑ Front (3 students)
        </text>

        {/* Left/Right labels */}
        <text
          x={22}
          y={34}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill="#374151"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ← 5 left
        </text>
        <text
          x={318}
          y={34}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill="#374151"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          3 right →
        </text>

        {/* Behind label */}
        <text
          x={170}
          y={50}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fill="#374151"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ↓ Behind (1 student)
        </text>
      </svg>
    </div>
  )
}
