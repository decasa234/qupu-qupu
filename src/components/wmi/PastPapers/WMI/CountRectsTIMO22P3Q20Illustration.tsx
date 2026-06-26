// TIMO-22-P3H-Q20 — "How many rectangle(s) is / are there in the figure below?"
//
// Figure (image 092.jpg — 2022 Heat P3, ĐỀ SỐ 5):
//   Row 0: [■][ ][ ][ ]   col 0 only
//   Row 1: [■][■][■][■]   cols 0–3
//   Row 2: [ ][■][■][■]   cols 1–3
//
// Rectangle tally (choose valid H-line pair × valid V-line pair):
//   rows (0,1)   → cols 0–0   → C(2,2) = 1
//   rows (0,2)   → cols 0–0   → C(2,2) = 1
//   rows (0,3)   → no col shared       = 0
//   rows (1,2)   → cols 0–3   → C(5,2) = 10
//   rows (1,3)   → cols 1–3   → C(4,2) = 6
//   rows (2,3)   → cols 1–3   → C(4,2) = 6
//   Total = 1+1+10+6+6 = 24 ✓
//
// Pure SVG — no hooks, no framer-motion. SSR-safe.

export const CELL   = 44
export const PAD    = 10
export const SW     = PAD + 4 * CELL + PAD   // 196
export const SH     = PAD + 3 * CELL + PAD   // 152
export const STROKE = '#374151'
export const FILL   = '#FFFFFF'

/** [col, row] pairs for every cell in the figure. */
export const CELLS: [number, number][] = [
  [0, 0],
  [0, 1], [1, 1], [2, 1], [3, 1],
  [1, 2], [2, 2], [3, 2],
]

export default function CountRectsTIMO22P3Q20Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Gambar berpetak tidak beraturan: 1 sel di pojok kiri atas, 4 sel di baris tengah, 3 sel di baris bawah (kanan). Hitung semua persegi panjang dari setiap ukuran."
    >
      <svg
        viewBox={`0 0 ${SW} ${SH}`}
        width={Math.min(240, SW)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SW} height={SH} fill={FILL} />
        {CELLS.map(([col, row]) => (
          <rect
            key={`${col}-${row}`}
            x={PAD + col * CELL}
            y={PAD + row * CELL}
            width={CELL}
            height={CELL}
            fill={FILL}
            stroke={STROKE}
            strokeWidth={1.5}
          />
        ))}
      </svg>
    </div>
  )
}
