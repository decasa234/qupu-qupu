// Cut-and-count pattern figure for WMI-24F3A-Q23, reconstructed from the scan.
// Picture 1 is a single square; each cut splits ONE square into 4 smaller ones,
// so the counts run 1, 4, 7, ... (net +3 per cut). Data is exported so the
// step-explainer / animator can bind to the same stages.

const INK = '#1F2937'

// One stage of the pattern: how the unit square is subdivided.
// `cells` are unit-cell rectangles (in a [0,1]x[0,1] square) drawn for that
// picture. Picture 1 = the whole square; Picture 2 = 4 quarters; Picture 3 =
// one of those quarters further split into 4 (so 3 quarters + 4 sixteenths = 7).
export type CutStage = {
  picture: number
  count: number
  // rectangles as [x, y, w, h] in unit coordinates (0..1)
  cells: Array<[number, number, number, number]>
}

export const CUT_STAGES: CutStage[] = [
  // Picture 1: the original square (1 square).
  {
    picture: 1,
    count: 1,
    cells: [[0, 0, 1, 1]],
  },
  // Picture 2: cut into 4 equal squares (4 squares).
  {
    picture: 2,
    count: 4,
    cells: [
      [0, 0, 0.5, 0.5],
      [0.5, 0, 0.5, 0.5],
      [0, 0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5, 0.5],
    ],
  },
  // Picture 3: cut the top-left quarter into 4 (3 quarters + 4 sixteenths = 7).
  {
    picture: 3,
    count: 7,
    cells: [
      // the four sixteenths from cutting the top-left quarter
      [0, 0, 0.25, 0.25],
      [0.25, 0, 0.25, 0.25],
      [0, 0.25, 0.25, 0.25],
      [0.25, 0.25, 0.25, 0.25],
      // the three untouched quarters
      [0.5, 0, 0.5, 0.5],
      [0, 0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5, 0.5],
    ],
  },
]

export const CUT_GAIN_PER_STEP = 3 // 4 cut from 1 → net +3 squares

// One pictured stage rendered inside a `size`-by-`size` box at (ox, oy).
export function CutStageGlyph({
  stage,
  ox,
  oy,
  size,
}: {
  stage: CutStage
  ox: number
  oy: number
  size: number
}) {
  return (
    <g>
      {stage.cells.map(([x, y, w, h], i) => (
        <rect
          key={i}
          x={ox + x * size}
          y={oy + y * size}
          width={w * size}
          height={h * size}
          className="fill-qupu-brand-blue/20 stroke-qupu-brand-blue"
          strokeWidth={1.6}
        />
      ))}
      {/* outer border for crispness */}
      <rect x={ox} y={oy} width={size} height={size} fill="none" stroke={INK} strokeWidth={2.2} />
    </g>
  )
}

export function CutCountFigure() {
  const SIZE = 70 // drawn size of each square
  const GAP = 46 // horizontal gap between stages (room for the arrow)
  const TOP = 14 // top padding for the square
  const LABEL_Y = TOP + SIZE + 22 // baseline for the "Gambar n" + count label

  const W = CUT_STAGES.length * SIZE + (CUT_STAGES.length - 1) * GAP + 24
  const H = LABEL_Y + 20
  const X0 = 12

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <defs>
        <marker
          id="cutArrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L6,3 L0,6 Z" className="fill-qupu-brand-orange" />
        </marker>
      </defs>

      {CUT_STAGES.map((stage, i) => {
        const ox = X0 + i * (SIZE + GAP)
        const cx = ox + SIZE / 2
        return (
          <g key={stage.picture}>
            <CutStageGlyph stage={stage} ox={ox} oy={TOP} size={SIZE} />
            {/* "Gambar n" label */}
            <text
              x={cx}
              y={LABEL_Y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={800}
              fill={INK}
              className="font-display"
            >
              {`Gambar ${stage.picture}`}
            </text>
            {/* square count */}
            <text
              x={cx}
              y={LABEL_Y + 15}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={700}
              className="fill-qupu-brand-orange font-display"
            >
              {`${stage.count} persegi`}
            </text>
            {/* arrow to the next stage */}
            {i < CUT_STAGES.length - 1 && (
              <line
                x1={ox + SIZE + 8}
                y1={TOP + SIZE / 2}
                x2={ox + SIZE + GAP - 8}
                y2={TOP + SIZE / 2}
                className="stroke-qupu-brand-orange"
                strokeWidth={2.2}
                markerEnd="url(#cutArrow)"
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function CutCount24G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Pola potong-dan-hitung: Gambar 1 sebuah persegi (1 persegi), dipotong menjadi Gambar 2 (4 persegi), lalu satu persegi dipotong lagi menjadi Gambar 3 (7 persegi). Tiap potong membagi satu persegi menjadi 4 persegi kecil."
    >
      <CutCountFigure />
    </div>
  )
}

export default CutCount24G3Illustration
