// SEAMO-17-A-Q7 — "Which of the following can be traced, without drawing over
// any line twice, and without lifting your pen?"
//
// Three figures shown as the problem stem:
//   Fig 1 — regular hexagon with one diagonal (top-left → bottom-right)
//   Fig 2 — rectangle with a right-pointing triangle (arrow/play-button shape)
//   Fig 3 — rectangle divided into 3 equal vertical panels by 2 internal lines
//
// OCR source: docs/reference/ocr-res/seamo/contest/paper-a/2017.md Q7
// Crops: 2017.imgs/009.jpg (Fig1), 010.jpg (Fig2), 011.jpg (Fig3)
//
// EULER PATH ANALYSIS (traceable ⟺ exactly 0 or 2 odd-degree vertices):
//   Fig 1: 6 hexagon vertices; diagonal makes 2 of them degree-3 (odd) → 2 odd → TRACEABLE
//   Fig 2: 5 vertices; shared vertical edge makes TR and BR degree-3 → 2 odd → TRACEABLE
//   Fig 3: 6 vertices; each internal junction (top+bottom of dividers) is degree-3 → 4 odd → NOT TRACEABLE
//
// Answer: B (Figures 1 and 2)
//
// Implementation note:
//   These figures are filled-polygon geometric shapes, not node-and-edge graphs.
//   They are hand-drawn with SVG polygons + lines matching the original exam crops.
//   NodeGraph is not used because the shapes show filled regions (red, dark-blue,
//   purple) with superimposed dividing lines — this matches the exam format exactly.
//
// Pure SVG, SSR-safe, no hooks, no framer-motion.

// ---------------------------------------------------------------------------
// Shared stroke style
// ---------------------------------------------------------------------------

const STROKE = '#111827'
const STROKE_W = 2.4

// ---------------------------------------------------------------------------
// Fig 1 — Regular hexagon (flat-top) + one diagonal
//
// viewBox 0 0 120 112
// Flat-top hexagon: top edge horizontal. Vertices (cx=60, cy=56, r=52):
//   A = (60-26, 56-45) = (34, 11)   [top-left]
//   B = (60+26, 56-45) = (86, 11)   [top-right]
//   C = (60+52, 56   ) = (112,56)   [right]
//   D = (86,    56+45) = (86, 101)  [bottom-right]
//   E = (34,    56+45) = (34, 101)  [bottom-left]
//   F = (60-52, 56   ) = (8,  56)   [left]
//
// Diagonal: A(34,11) → D(86,101) — top-left to bottom-right
// ---------------------------------------------------------------------------

function Fig1() {
  const pts = '34,11 86,11 112,56 86,101 34,101 8,56'
  return (
    <svg
      viewBox="0 0 120 112"
      width={120}
      height={112}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* filled hexagon */}
      <polygon
        points={pts}
        fill="#C0392B"
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />
      {/* one diagonal: top-left (A) → bottom-right (D) */}
      <line
        x1={34} y1={11}
        x2={86} y2={101}
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Fig 2 — Rectangle (left) + right-pointing triangle (right)
//
// viewBox 0 0 140 108
//   Rectangle: TL(8,12)–TR(88,12)–BR(88,96)–BL(8,96)
//   Triangle:  TR(88,12)–TIP(132,54)–BR(88,96)
//   Shared vertical edge: TR–BR (right side of rect = left side of triangle)
//
// Colour from crop: rect fill = dark slate (#34495E), triangle fill = gold (#F1C40F)
// ---------------------------------------------------------------------------

function Fig2() {
  return (
    <svg
      viewBox="0 0 140 108"
      width={140}
      height={108}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* rectangle (left portion) */}
      <polygon
        points="8,12 88,12 88,96 8,96"
        fill="#34495E"
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />
      {/* triangle (right portion, gold) */}
      <polygon
        points="88,12 132,54 88,96"
        fill="#F1C40F"
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />
      {/* shared internal edge (TR–BR) — draw on top so it's visible */}
      <line
        x1={88} y1={12}
        x2={88} y2={96}
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Fig 3 — Rectangle divided into 3 equal vertical panels
//
// viewBox 0 0 160 100
//   Outer rect: TL(8,12)–TR(152,12)–BR(152,88)–BL(8,88)
//   Divider 1:  (56,12)–(56,88)
//   Divider 2:  (104,12)–(104,88)
// ---------------------------------------------------------------------------

function Fig3() {
  return (
    <svg
      viewBox="0 0 160 100"
      width={160}
      height={100}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* filled rectangle */}
      <rect
        x={8} y={12}
        width={144} height={76}
        fill="#8E44AD"
        stroke={STROKE}
        strokeWidth={STROKE_W}
      />
      {/* first vertical divider */}
      <line
        x1={56} y1={12}
        x2={56} y2={88}
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
      />
      {/* second vertical divider */}
      <line
        x1={104} y1={12}
        x2={104} y2={88}
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Default export — static stem illustration (all three figures, side by side)
// ---------------------------------------------------------------------------

/**
 * EulerTrace17A7Illustration
 *
 * Shows the three figures from SEAMO 2017 Paper A Q7 for Euler-path traceability.
 * Figures 1 and 2 are traceable (2 odd-degree vertices each);
 * Figure 3 is not (4 odd-degree vertices). No answer hint is displayed.
 *
 * Question type: stem — text choices only (A–E are text strings, not picture options).
 */
export default function EulerTrace17A7Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tiga gambar untuk soal penelusuran satu goresan. ' +
        'Gambar 1: segi enam beraturan dengan satu diagonal. ' +
        'Gambar 2: persegi panjang dengan segitiga panah di sebelah kanan. ' +
        'Gambar 3: persegi panjang dibagi tiga panel vertikal oleh dua garis.'
      }
    >
      <div className="flex flex-wrap items-end justify-center gap-6" aria-hidden="true">
        <div className="flex flex-col items-center gap-1">
          <Fig1 />
          <span className="font-display text-xs font-bold text-gray-700">Fig. 1</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Fig2 />
          <span className="font-display text-xs font-bold text-gray-700">Fig. 2</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Fig3 />
          <span className="font-display text-xs font-bold text-gray-700">Fig. 3</span>
        </div>
      </div>
    </div>
  )
}
