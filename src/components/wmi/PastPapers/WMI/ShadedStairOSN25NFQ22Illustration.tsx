// OSN-25-SD-NAS-FINAL-Q22 — rectangle ABCD (6×9 units) with a shaded staircase
// region; E on BC is chosen so AE bisects the shaded area; find CE.
//
// Reconstructed from docs/reference/ocr-res/osn/nasional/sd/2025-final.imgs/009.jpg:
// 9 columns × 6 rows. White (top-left) skyline by row-from-top has leftmost gray
// column [7,7,4,3,1,1] → gray fills the bottom + a top-right tower. Pure SVG,
// SSR-safe, no hooks. Stem figure only (no E / no AE drawn).
//
// NOTE (answer-key queue): the seed's official CE = 4 does NOT bisect the figure
// as drawn — the shaded area is 37 units, and AE bisects it (18.5 each) at
// CE = 17/9 ≈ 1.89, not 4. Shipped illustration-only; the disputed answer is left
// to the answer-key review (seed flags this question "verify-answer").

const INK = '#1F2937'
const GRAY = '#B8B8B8'
const LBL = '#1F2937'

const COLS = 9
const ROWS = 6
const CELL = 30
const OX = 22 // grid left
const OY = 20 // grid top

// leftmost gray column (1-based) per row, top → bottom
const LEFT = [7, 7, 4, 3, 1, 1]

export default function ShadedStairOSN25NFQ22Illustration() {
  const W = OX * 2 + COLS * CELL
  const H = OY * 2 + ROWS * CELL
  const cells: React.ReactNode[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const gray = c + 1 >= LEFT[r]
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={OX + c * CELL}
          y={OY + r * CELL}
          width={CELL}
          height={CELL}
          fill={gray ? GRAY : '#FFFFFF'}
          stroke={INK}
          strokeWidth={1}
        />,
      )
    }
  }
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Persegi panjang ABCD berukuran 6 kali 9 satuan, dibagi kotak-kotak satuan; sebagian daerah berbentuk tangga diarsir abu-abu (menutupi dua baris bawah penuh dan menara di kanan atas)."
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {cells}
        {/* outer border on top */}
        <rect x={OX} y={OY} width={COLS * CELL} height={ROWS * CELL} fill="none" stroke={INK} strokeWidth={2} />
        {/* corner labels */}
        <text x={OX - 8} y={OY - 6} fontSize={15} fontStyle="italic" fill={LBL} textAnchor="middle">D</text>
        <text x={OX + COLS * CELL + 8} y={OY - 6} fontSize={15} fontStyle="italic" fill={LBL} textAnchor="middle">C</text>
        <text x={OX - 8} y={OY + ROWS * CELL + 16} fontSize={15} fontStyle="italic" fill={LBL} textAnchor="middle">A</text>
        <text x={OX + COLS * CELL + 8} y={OY + ROWS * CELL + 16} fontSize={15} fontStyle="italic" fill={LBL} textAnchor="middle">B</text>
      </svg>
    </div>
  )
}
