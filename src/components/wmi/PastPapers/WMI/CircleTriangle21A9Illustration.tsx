// CircleTriangle21A9Illustration — SEAMO 2021 Paper A Q9
//
// "Fill in each circle with a number from 2, 5, 6 and 7, such that the sum of
//  the 3 numbers along each line is 18. What is X?"
//
// OCR source: docs/reference/ocr-res/seamo/contest/paper-a/2021.md Q9,
// image reference: 2021.imgs/015.jpg
//
// FIGURE: 6 circles arranged in a triangle —
//   3 corner nodes + 3 edge-midpoint nodes.
//   Each "side" of the triangle passes through 3 circles (corner → mid → corner).
//
// Pre-filled values:
//   Top corner       = X (the unknown)
//   Bottom-left      = (blank — value 6)
//   Bottom-right     = 9
//   Left-side mid    = (blank — value 5)
//   Bottom-mid       = 3
//   Right-side mid   = (blank — value 2)
//
// Line sums (all = 18):
//   Top→Right-mid→Bottom-right : X + 2 + 9 = 18 → X = 7  ✓
//   Top→Left-mid→Bottom-left   : 7 + 5 + 6 = 18           ✓
//   Bottom-left→Bot-mid→Bottom-right : 6 + 3 + 9 = 18     ✓
//
// Answer: X = 7 (option D)
//
// Primitive used: NodeGraph from ./primitives/NodeGraph
// SSR-safe — no hooks, no framer-motion, pure SVG.

import { NodeGraph } from './primitives/NodeGraph'

// ── Geometry ──────────────────────────────────────────────────────────────────
// viewBox: 240 × 220 px
// Triangle with apex at top-centre, base at bottom.
// Node radius: 22 px (matches the original — circles are prominent).

const W = 240
const H = 220
const R = 22  // node radius

// Corner nodes
const TOP_X = 120
const TOP_Y = 30

const BL_X = 28
const BL_Y = 192

const BR_X = 212
const BR_Y = 192

// Edge-midpoint nodes (geometric midpoints of each side)
const LEFT_MID_X  = Math.round((TOP_X + BL_X) / 2)   // 74
const LEFT_MID_Y  = Math.round((TOP_Y + BL_Y) / 2)   // 111

const BOT_MID_X   = Math.round((BL_X + BR_X) / 2)    // 120
const BOT_MID_Y   = Math.round((BL_Y + BR_Y) / 2)    // 192

const RIGHT_MID_X = Math.round((TOP_X + BR_X) / 2)   // 166
const RIGHT_MID_Y = Math.round((TOP_Y + BR_Y) / 2)   // 111

// ── Nodes ─────────────────────────────────────────────────────────────────────
//
// The problem shows X in the top circle; the bottom-right and bottom-mid
// are pre-filled (9 and 3).  The other three circles are blank in the problem.
// We render the static puzzle state (as printed): only X, 3, and 9 are labelled;
// the remaining three circles are empty so students can deduce the values.

const NODES = [
  { id: 'top',      x: TOP_X,      y: TOP_Y,      label: 'X' },
  { id: 'bl',       x: BL_X,       y: BL_Y,       label: ''  },
  { id: 'br',       x: BR_X,       y: BR_Y,       label: '9' },
  { id: 'left-mid', x: LEFT_MID_X, y: LEFT_MID_Y, label: ''  },
  { id: 'bot-mid',  x: BOT_MID_X,  y: BOT_MID_Y,  label: '3' },
  { id: 'right-mid',x: RIGHT_MID_X,y: RIGHT_MID_Y,label: ''  },
]

// ── Edges ─────────────────────────────────────────────────────────────────────
// Three sides of the triangle, each as two segments through the midpoint node.
const EDGES = [
  // Left side: top → left-mid → bl
  { a: 'top',      b: 'left-mid' },
  { a: 'left-mid', b: 'bl'       },
  // Bottom side: bl → bot-mid → br
  { a: 'bl',       b: 'bot-mid'  },
  { a: 'bot-mid',  b: 'br'       },
  // Right side: br → right-mid → top
  { a: 'br',       b: 'right-mid'},
  { a: 'right-mid',b: 'top'      },
]

// ── Illustration ──────────────────────────────────────────────────────────────

/**
 * CircleTriangle21A9Illustration
 *
 * Static figure for SEAMO-21-A-Q9.
 * Six circles arranged as a triangle (3 corners + 3 midpoints).
 * Pre-filled: top=X (unknown), bottom-mid=3, bottom-right=9.
 * Blank circles hold 2, 5, 6 (to be filled so each line sums to 18).
 */
export default function CircleTriangle21A9Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Enam lingkaran tersusun membentuk segitiga — tiga di sudut dan tiga di ' +
        'tengah setiap sisi. Lingkaran di atas berlabel X (bilangan yang dicari), ' +
        'lingkaran bawah-tengah berlabel 3, lingkaran bawah-kanan berlabel 9. ' +
        'Tiga lingkaran lainnya kosong. Jumlah tiga bilangan di setiap sisi = 18.'
      }
    >
      <NodeGraph
        nodes={NODES}
        edges={EDGES}
        nodeR={R}
        width={W}
        height={H}
      />
    </div>
  )
}

// ── Registry entry (paste into registry.ts — do NOT add export const VISUALS) ─
//
//   'SEAMO-21-A-Q9': {
//     type: 'stem',
//     illustration: () => import('./CircleTriangle21A9Illustration'),
//   },
