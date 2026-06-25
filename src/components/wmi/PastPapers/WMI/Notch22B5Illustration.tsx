// Notch22B5Illustration — SEAMO 2022 Paper B Q5
//
// "Find the perimeter of the figure below."
//
// OCR source: docs/reference/ocr-res/seamo/contest/paper-b/2022.md Q5
// image crop:  2022.imgs/003.jpg
// Answer: D — 110 cm
//
// FIGURE: A 20 cm × 15 cm outer rectangle with two rectangular notches cut
// from the top interior. Each notch is 10 cm deep. Three upward prongs are
// visible; "10 cm" labels the height of each prong/notch from the top, and
// "15 cm" labels the full outer height on the right.
//
// Perimeter logic:
//   Outer rectangle (no notches): 2 × (20 + 15) = 70 cm
//   Each notch adds 2 vertical sides of 10 cm each = 20 cm per notch
//   Two notches: + 40 cm
//   Total: 110 cm
//
// No primitive covers a comb/notched rectangle → fresh SVG.
// SSR-safe — no hooks, no framer-motion, pure SVG.

// ── Layout constants (SVG px units; proportional to cm) ──────────────────────
// Scale: 1 cm → 10 px
// Outer rectangle: 200 × 150 px (plus margins)
const SCALE = 10  // px per cm

// Outer dimensions (cm)
const OW_CM = 20   // outer width
const OH_CM = 15   // outer height

// Notch dimensions (cm)
const NOTCH_DEPTH_CM = 10   // notch depth from top (vertical)

// Layout: 5 equal sections across the 20 cm width
// section width = 20/5 = 4 cm → pillar(4) | notch(4) | pillar(4) | notch(4) | pillar(4)
const SECTION_CM = OW_CM / 5   // 4 cm per section

// Convert to px
const OW = OW_CM * SCALE         // 200
const OH = OH_CM * SCALE         // 150
const ND = NOTCH_DEPTH_CM * SCALE // 100
const SW = SECTION_CM * SCALE     // 40 (section width)

// Margins/offsets
const MX = 40   // left margin
const MY = 20   // top margin

// Dimension label offsets
const LABEL_OFFSET = 18

// ── Comb path (outline of the figure) ────────────────────────────────────────
// Starting at bottom-left corner, going clockwise:
// BL → TL → prong1-top-left → prong1-top-right → notch1-bottom → prong2-top-left
//   → prong2-top-right → notch2-bottom → prong3-top-left → prong3-top-right
//   → TR → BR → BL
//
// Coordinates in SVG space (y increases downward):
//   y=MY           → very top (prong tops)
//   y=MY + ND      → notch bottom (= 100 px down from top)
//   y=MY + OH      → outer bottom edge

const x0 = MX
const y_top = MY            // top of prongs
const y_notch = MY + ND     // bottom of notch cutouts
const y_bot = MY + OH       // bottom of outer rectangle

// x positions of key vertical edges:
// left outer edge:  MX
// prong1 right:     MX + SW       (= MX + 40)
// notch1 left:      MX + SW       (same)
// notch1 right:     MX + 2*SW     (= MX + 80)
// prong2 left:      MX + 2*SW
// prong2 right:     MX + 3*SW     (= MX + 120)
// notch2 left:      MX + 3*SW
// notch2 right:     MX + 4*SW     (= MX + 160)
// prong3 left:      MX + 4*SW
// right outer edge: MX + OW       (= MX + 200)

const x1 = MX + SW        // 40+40=80
const x2 = MX + 2 * SW    // 40+80=120
const x3 = MX + 3 * SW    // 40+120=160
const x4 = MX + 4 * SW    // 40+160=200
const x5 = MX + OW        // 40+200=240

// SVG viewBox
const VW = MX + OW + 80   // 360  (right margin = 80 for dimension labels)
const VH = MY + OH + 50   // 220  (bottom margin = 50)

// Build path data
const pathD = [
  `M ${x0} ${y_bot}`,      // BL
  `L ${x0} ${y_top}`,      // up left outer edge
  `L ${x1} ${y_top}`,      // along top of prong 1
  `L ${x1} ${y_notch}`,    // down into notch 1
  `L ${x2} ${y_notch}`,    // across notch 1 bottom
  `L ${x2} ${y_top}`,      // up to prong 2 top
  `L ${x3} ${y_top}`,      // along top of prong 2
  `L ${x3} ${y_notch}`,    // down into notch 2
  `L ${x4} ${y_notch}`,    // across notch 2 bottom
  `L ${x4} ${y_top}`,      // up to prong 3 top
  `L ${x5} ${y_top}`,      // along top of prong 3
  `L ${x5} ${y_bot}`,      // down right outer edge
  `Z`,                      // close (bottom)
].join(' ')

// ── Text label helpers ────────────────────────────────────────────────────────
const FONT_SIZE = 13
const FONT_SMALL = 11

export default function Notch22B5Illustration() {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width={VW}
      height={VH}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Rectilinear figure: 20 cm × 15 cm rectangle with two 10 cm-deep notches cut from the top"
    >
      {/* ── Shape ── */}
      <path
        d={pathD}
        fill="white"
        stroke="#1a1a1a"
        strokeWidth={2}
        strokeLinejoin="miter"
      />

      {/* ── "10 cm" labels — left prong height (inside prong 1) ── */}
      <text
        x={(x0 + x1) / 2}
        y={(y_top + y_notch) / 2 + 5}
        textAnchor="middle"
        fontSize={FONT_SIZE}
        fill="#1a1a1a"
        fontFamily="sans-serif"
      >
        10 cm
      </text>

      {/* ── "10 cm" label — middle prong (inside prong 2) ── */}
      <text
        x={(x2 + x3) / 2}
        y={(y_top + y_notch) / 2 + 5}
        textAnchor="middle"
        fontSize={FONT_SIZE}
        fill="#1a1a1a"
        fontFamily="sans-serif"
      >
        10 cm
      </text>

      {/* ── "10 cm" label — right prong (inside prong 3) ── */}
      <text
        x={(x4 + x5) / 2}
        y={(y_top + y_notch) / 2 + 5}
        textAnchor="middle"
        fontSize={FONT_SIZE}
        fill="#1a1a1a"
        fontFamily="sans-serif"
      >
        10 cm
      </text>

      {/* ── "15 cm" — right outer height dimension ── */}
      {/* vertical brace line on the right */}
      <line
        x1={x5 + LABEL_OFFSET}
        y1={y_top}
        x2={x5 + LABEL_OFFSET}
        y2={y_bot}
        stroke="#555"
        strokeWidth={1}
        strokeDasharray="3,3"
      />
      <line x1={x5 + LABEL_OFFSET - 4} y1={y_top} x2={x5 + LABEL_OFFSET + 4} y2={y_top} stroke="#555" strokeWidth={1} />
      <line x1={x5 + LABEL_OFFSET - 4} y1={y_bot} x2={x5 + LABEL_OFFSET + 4} y2={y_bot} stroke="#555" strokeWidth={1} />
      <text
        x={x5 + LABEL_OFFSET + 10}
        y={(y_top + y_bot) / 2 + 5}
        fontSize={FONT_SIZE}
        fill="#1a1a1a"
        fontFamily="sans-serif"
      >
        15 cm
      </text>

      {/* ── "20 cm" — bottom width dimension ── */}
      <line
        x1={x0}
        y1={y_bot + LABEL_OFFSET}
        x2={x5}
        y2={y_bot + LABEL_OFFSET}
        stroke="#555"
        strokeWidth={1}
        strokeDasharray="3,3"
      />
      <line x1={x0} y1={y_bot + LABEL_OFFSET - 4} x2={x0} y2={y_bot + LABEL_OFFSET + 4} stroke="#555" strokeWidth={1} />
      <line x1={x5} y1={y_bot + LABEL_OFFSET - 4} x2={x5} y2={y_bot + LABEL_OFFSET + 4} stroke="#555" strokeWidth={1} />
      <text
        x={(x0 + x5) / 2}
        y={y_bot + LABEL_OFFSET + 16}
        textAnchor="middle"
        fontSize={FONT_SIZE}
        fill="#1a1a1a"
        fontFamily="sans-serif"
      >
        20 cm
      </text>
    </svg>
  )
}
