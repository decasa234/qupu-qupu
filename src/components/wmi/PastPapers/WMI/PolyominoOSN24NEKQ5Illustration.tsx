/**
 * PolyominoOSN24NEKQ5Illustration — OSN-24-SD-NAS-EKSPERIMEN-Q5
 *
 * "Dalam petak 4×5, hubungkan 10 petak satuan menjadi satu daerah poliomino
 * yang terhubung. Berapa perimeter maksimum yang mungkin dari daerah ini?"
 * Answer: 22  (10 cells, spanning-tree min 9 shared edges → 40 − 18 = 22)
 *
 * OCR source: docs/reference/ocr-res/osn/nasional/sd/2024-eksperimen.md (Q4 block)
 * Seed: db/seed/osn/papers/2024-nasional-sd-eksperimen.json (question 5)
 *
 * Stem figure: blank 4×5 grid — the student's canvas for choosing 10 connected cells.
 * Primitive: GridBoard from ./primitives/GridBoard — no custom geometry derived.
 * SSR-safe: no hooks, no browser APIs.
 */

import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'

const ROWS = 4
const COLS = 5
const CELL = 44

export default function PolyominoOSN24NEKQ5Illustration() {
  const vb = gridBoardViewBox(ROWS, COLS, CELL)
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Petak 4×5 kosong — pilih 10 petak satuan yang terhubung untuk memaksimalkan keliling"
    >
      <svg viewBox={vb} width={COLS * CELL} aria-hidden="true">
        <GridBoard
          rows={ROWS}
          cols={COLS}
          cellSize={CELL}
          gridStroke="#6B7280"
        />
      </svg>
    </div>
  )
}
