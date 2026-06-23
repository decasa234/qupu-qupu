// SEAMO-16-B-Q16 — "The numbers 2, 3, 4, 5, 6, 7 and 8 are arranged in circles
// in such a way that the sum of the 3 numbers on each line is 15. What is the
// value of m?"
//
// OCR source: docs/reference/ocr-res/seamo/contest/paper-b/2016.md Q16,
// image reference: 2016.imgs/015.jpg
//
// FIGURE: 7 circles arranged in a 3-arm star (hexagonal spokes) with 1 centre
// and 6 outer nodes. Three straight lines pass through the centre, each line
// holding 3 circles whose values sum to 15:
//   Line 1 (vertical):    top  (2) — centre (m) — bottom (8)    = 15
//   Line 2 (diagonal ↗):  TL   (3) — centre (m) — BR     (7)    = 15
//   Line 3 (diagonal ↘):  TR   (4) — centre (m) — BL     (6)    = 15
//
// The labelled node "m" is the centre circle, whose value is 5 (answer A).
//
// Primitive used: NodeGraph from ./primitives/NodeGraph
// SSR-safe (no hooks, no framer-motion, pure SVG).

import { NodeGraph } from './primitives/NodeGraph'

// ── geometry ──────────────────────────────────────────────────────────────────
// viewBox: 200 × 200 px
// Centre circle at (100, 100); 6 outer circles at radius 70 on a hex layout.

const W   = 200
const H   = 200
const CX  = 100
const CY  = 100
const ARM = 70   // distance from centre to each outer node

function polar(angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: Math.round(CX + ARM * Math.cos(rad)),
    y: Math.round(CY + ARM * Math.sin(rad)),
  }
}

// 6 outer nodes at 60° increments on a hex grid.
// Pairs of opposite nodes form lines through the centre.
const TOP = polar(-90)    // (100, 30)   → labelled "2"
const BOT = polar(90)     // (100, 170)  → labelled "8"
const TL  = polar(-150)   // (39,  65)   → labelled "3"
const BR  = polar(30)     // (161, 135)  → labelled "7"
const TR  = polar(-30)    // (161, 65)   → labelled "4"
const BL  = polar(150)    // (39,  135)  → labelled "6"

// ── node definitions ──────────────────────────────────────────────────────────
// Valid placement where all three line sums equal 15:
//   2 + m + 8 = 15  →  m = 5  ✓
//   3 + m + 7 = 15  →  m = 5  ✓
//   4 + m + 6 = 15  →  m = 5  ✓
// Centre is labelled "m" (the unknown asked in the problem).

const NODES = [
  { id: 'C',  x: CX,    y: CY,    label: 'm' },
  { id: 'T',  x: TOP.x, y: TOP.y, label: '2' },
  { id: 'B',  x: BOT.x, y: BOT.y, label: '8' },
  { id: 'TL', x: TL.x,  y: TL.y,  label: '3' },
  { id: 'BR', x: BR.x,  y: BR.y,  label: '7' },
  { id: 'TR', x: TR.x,  y: TR.y,  label: '4' },
  { id: 'BL', x: BL.x,  y: BL.y,  label: '6' },
]

// ── edge definitions ─────────────────────────────────────────────────────────
// Three lines through the centre, each represented as two edges.
const EDGES = [
  { a: 'T',  b: 'C' },
  { a: 'C',  b: 'B' },
  { a: 'TL', b: 'C' },
  { a: 'C',  b: 'BR' },
  { a: 'TR', b: 'C' },
  { a: 'C',  b: 'BL' },
]

// ── illustration ──────────────────────────────────────────────────────────────

/**
 * CircleLines16B16Illustration
 *
 * Static figure for SEAMO-16-B-Q16.
 * Shows 7 numbered circles connected by 3 straight lines through the centre.
 * The centre is labelled "m" (the unknown). All other circles show their values.
 */
export default function CircleLines16B16Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tujuh lingkaran tersusun dalam pola bintang tiga lengan dengan satu ' +
        'lingkaran di tengah berlabel m dan enam lingkaran di luar. ' +
        'Tiga garis lurus masing-masing melewati pusat: ' +
        'atas(2)-m-bawah(8), kiri-atas(3)-m-kanan-bawah(7), ' +
        'kanan-atas(4)-m-kiri-bawah(6). Setiap garis berjumlah 15.'
      }
    >
      <NodeGraph
        nodes={NODES}
        edges={EDGES}
        nodeR={20}
        width={W}
        height={H}
      />
    </div>
  )
}
