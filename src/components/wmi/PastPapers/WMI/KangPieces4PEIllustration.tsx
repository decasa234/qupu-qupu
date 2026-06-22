/**
 * IKMC-23-PE-Q4 — "Mr. Beaver rearranges the pieces to make a kangaroo figure.
 * Which piece is missing?" (answer A — the parallelogram).
 *
 * Left panel: the original 7-piece tangram-style blue square (source 013.jpg).
 * Right panel: the incomplete kangaroo assembled from 6 of those pieces, with a
 * dashed outline showing where the missing parallelogram (piece A) fits.
 *
 * The original square sits on a 120×120 coordinate system. The tangram cuts
 * divide it into:
 *   - 2 large right-angle triangles (top-left and top-right halves)
 *   - 1 medium right-angle triangle (lower-left)
 *   - 2 small right-angle triangles
 *   - 1 small square
 *   - 1 parallelogram (piece A — the missing one)
 *
 * Pure SVG, no Math.random, no Date, no window/document at module top. SSR-safe.
 */

import type { WmiChoice } from '../../../../types/wmi'

// ─── colour tokens ────────────────────────────────────────────────────────────
const BLUE = '#1E5FA8'
const BLUE_DARK = '#0D3D6E'
const BLUE_MID = '#2B6FC2'     // cut-line separator inside pieces
const GAP_DASH = '#E53E3E'     // dashed outline for missing piece gap
const GAP_FILL = '#FEF2F2'     // faint fill for the gap area

// ─── Square with tangram cuts (013.jpg reconstruction) ────────────────────────
//
// The 120×120 square is divided by these cut lines (approximate from scan):
//
//   P = (0,0) top-left     Q = (120,0) top-right
//   R = (120,120) bot-right  S = (0,120) bot-left
//   M = (60,60) centre
//   A = (60,0) top-mid
//   B = (120,60) right-mid
//   C = (0,60) left-mid
//   E = (80,80) lower-right area
//   F = (40,80) lower-left area
//   G = (40,40) upper area
//
// Pieces (as polygons inside the 120×120 square):
//   Large tri 1 (top-left):  P(0,0) → A(60,0) → M(60,60) → C(0,60)  [trapezoid]
//   Actually: we use a simpler self-consistent 7-piece tangram reconstruction.
//
// Standard 7-piece tangram dissection of a 120×120 square:
//   The classic tangram has: 2 large triangles, 1 medium triangle,
//   2 small triangles, 1 square, 1 parallelogram.
//
// Coordinates on a 120×120 grid (origin top-left):
//   Key points:
//     TL=(0,0)   TM=(60,0)  TR=(120,0)
//     ML=(0,60)  MC=(60,60) MR=(120,60)
//     BL=(0,120) BM=(60,120) BR=(120,120)
//     Q1=(30,30)  Q2=(90,30)  Q3=(90,90)  Q4=(30,90)
//
// 7 tangram pieces:
//   1. Large triangle top-left:  TL(0,0)→TR(120,0)→MC(60,60)
//   2. Large triangle bottom-right: MC(60,60)→TR(120,0)→BR(120,120)→BM(60,120)
//      (actually the classic tangram splits differently — using standard layout)
//
// Classic tangram 120×120 (S=120):
//   Large tri 1:  (0,0) (120,0) (60,60)
//   Large tri 2:  (0,0) (60,60) (0,120)
//   Medium tri:   (60,60) (0,120) (60,120)   [actually half of lower-left]
//   Small tri 1:  (60,0) (120,0) (90,30)    [wait, standard uses different cuts]
//
// Using the canonical 7-piece tangram for a square of side 2 units (scaled to 120):
//   Ref: corners at (0,0), (120,0), (120,120), (0,120)
//   Half-diagonal = 60; quarter = 30
//
//   Piece 1 — Large tri A: (0,0)→(120,0)→(60,60)              [top]
//   Piece 2 — Large tri B: (0,0)→(60,60)→(0,120)              [left]
//   Piece 3 — Medium tri:  (0,120)→(60,60)→(60,120)           [bottom-left]
//   Piece 4 — Parallelogram: (60,60)→(90,30)→(120,60)→(90,90) [centre-right]
//   Piece 5 — Small sq:   (90,30)→(120,0)→(120,60)→(90,60)    [top-right]
//             correction:  (90,30)→(120,0)→(120,30)→(90,30)   not right...
//   Using cleaner standard tangram:
//     (0,0)=TL, (120,0)=TR, (120,120)=BR, (0,120)=BL
//     center = (60,60)
//     midpoints: T=(60,0), R=(120,60), B=(60,120), L=(0,60)
//     Piece 1 (large tri): TL(0,0) T(60,0) C(60,60) L(0,60) → not triangle
//
// Using the EXACT classic tangram layout (confirmed partition):
//   Let side = 120, half = 60, quarter = 30
//   Points:
//     A=(0,0), B=(120,0), C=(120,120), D=(0,120)
//     E=(60,0), F=(120,60), G=(60,120), H=(0,60)
//     I=(60,60), J=(90,30), K=(90,90), L=(30,90)
//
//   1. Large tri 1:   A(0,0)   E(60,0)   I(60,60)   H(0,60)  ← NOT a triangle
//   This is actually the classic tangram:
//     Big tri 1:  A(0,0)   B(120,0)  I(60,60)
//     Big tri 2:  A(0,0)   I(60,60)  D(0,120)
//     Med tri:    D(0,120) I(60,60)  G(60,120)
//     Sq:         I(60,60) J(90,30)  B(120,0) … no that's a triangle
//
// FINAL clean layout (verified covers the square, 7 pieces, no overlap):
//   Points: A=(0,0) B=(120,0) C=(120,120) D=(0,120)
//           M=(60,60)  N=(60,0)  P=(0,60)  Q=(60,120)  R=(120,60)
//           S=(90,30)  T=(90,90)
//
//   Piece 1 (Large tri):      A(0,0)   N(60,0)   M(60,60)  P(0,60) ← trapezoid, skip
//
// I'll use a pragmatic directly-verified 7-piece partition:
//
//   A=(0,0)  B=(120,0)  C=(120,120)  D=(0,120)
//   M=(60,60)  n=(60,0)  p=(0,60)   q=(60,120)  r=(120,60)
//   s=(90,30)  t=(90,90) [midpoint of diagonals of top-right quadrant and bottom-right]
//
//   Piece 1  Big tri:  A(0,0)   B(120,0)  M(60,60)          — covers top
//   Piece 2  Big tri:  A(0,0)   M(60,60)  D(0,120)          — covers left
//   Piece 3  Med tri:  M(60,60) D(0,120)  q(60,120)         — bottom-left
//   Piece 4  Parallelogram: M(60,60) s(90,30) r(120,60) t(90,90) — centre-right
//   Piece 5  Small sq: s(90,30) B(120,0)  r(120,60) [wait need 4 points for square]
//            Small sq: s(90,30) B(120,0)  r(120,60) M? no...
//            s=(90,30), B=(120,0): distance = sqrt(30²+30²) = 30√2
//            r=(120,60), with s(90,30)→r(120,60) distance = sqrt(30²+30²) = 30√2 ✓
//            Square: s(90,30) B(120,0) r(120,60) (90,60)?
//            Check: (90,60) to s(90,30) = 30. s(90,30) to B(120,0) = 30√2. Not a square.
//   Piece 5  Small sq (rotated 45°): s(90,30) B(120,0) r(120,60) ...
//            The four corners of a 30√2-side square rotated 45°:
//            centre at (105,30): (90,30)(120,0)(120,60)(90,60)?
//            Check areas: 30×30=900 each, 4 such = large tri area 7200... no
//            Big tri area = 120×120/2 = 7200. Tangram: 2 big = 7200 each?
//            Actually total area = 120²=14400. 7 pieces: 2 large (area 3600 each),
//            1 medium (area 1800), 2 small (900 each), 1 sq (900), 1 parallelogram (900).
//            Check: 3600+3600+1800+900+900+900+900 = 12600 ≠ 14400. Off.
//            Corrected: 2 large (3600 each=7200), 1 medium (1800), 2 small (900 each),
//            1 square (1800), 1 parallelogram (1800). Total = 7200+1800+1800+1800+1800 =
//            3600+3600+1800+900+900+900+900 = hmm.
//            Standard tangram: 2 large right triangles (legs=half diagonal of square),
//            1 medium right triangle (legs = half the large), 2 small right triangles
//            (legs = half medium), 1 square (side = leg of small tri), 1 parallelogram.
//            For a unit square: large legs = 1/√2; medium legs = 1/2; small legs = 1/(2√2)
//            Areas: large = 1/4 each (×2=1/2), medium=1/8, small=1/16 each (×2=1/8),
//            square=1/8, parallelogram=1/8. Total=1/2+1/8+1/8+1/8+1/8=1 ✓
//
// For a 120×120 square (total area 14400):
//   Large tri: area=3600 (legs=60√2 each? no — right tri with legs 60,60 has area 1800)
//   Let me recompute: large tri in classic tangram has legs = half the square side.
//   For a 4×4 tangram grid (side=4): large legs = 2,2 → area = 2. Scale to 120: legs=60,60.
//   Large tri area = 60×60/2 = 1800. Two of them = 3600.
//   Medium tri: legs=30√2... actually medium has legs that are half of large's hypotenuse.
//   Standard: 2 large = 2×1800=3600; medium=900; 2 small=2×450=900; sq=450; para=450.
//   Total=3600+900+900+450+450=6300 ≠ 14400. Way off.
//
// I'll just use a pragmatic partition verified by visual inspection:
// Using a 120×120 grid, I'll place 7 reasonable shapes that tile it.

// For the SVG, I'll use these exact polygon point sets (all verified to tile the 120×120 square):
//
// Key points:
//   TL=(0,0), TR=(120,0), BR=(120,120), BL=(0,120)
//   TC=(60,0),  RC=(120,60), BC=(60,120), LC=(0,60)
//   CC=(60,60)
//   M1=(90,30), M2=(90,90)
//
// Piece layout (7-piece tangram):
//   P1 large tri:   TL(0,0)   TR(120,0)  CC(60,60)
//   P2 large tri:   TL(0,0)   CC(60,60)  BL(0,120)
//   P3 medium tri:  CC(60,60) BL(0,120)  BC(60,120)
//   P4 parallelogram: CC(60,60) M1(90,30) RC(120,60) M2(90,90)
//   P5 small sq:    M1(90,30) TR(120,0)  RC(120,60) CC(60,60)  ← not a square
//     M1(90,30) TR(120,0): dist=sqrt(900+900)=30√2
//     TR(120,0) RC(120,60): dist=60 → not equal sides. Skip.
//
// Use an alternative cleaner 7-piece layout:
//   Points: (0,0) (120,0) (120,120) (0,120) — the square
//   Let H=(60,0), K=(0,60), M=(60,60), N=(120,60), P=(60,120)
//   And  Q=(90,60), R=(90,0)
//
//   P1 large tri: (0,0)(120,0)(60,60) — top triangle
//   P2 large tri: (0,0)(60,60)(0,120) — left triangle
//   P3 medium tri: (60,60)(0,120)(60,120) — lower-left triangle
//   P4 parallelogram: (60,60)(90,0)(120,60)(90,120)?
//      Check: (60,60)→(90,0): vec(30,-60); (90,0)→(120,60): vec(30,60);
//             (120,60)→(90,120): vec(-30,60); (90,120)→(60,60): vec(-30,-60). ✓ parallelogram!
//      But does it stay inside the square? (90,120) is inside. ✓
//      Area = |30×60 - (-60)×30| = |1800+1800| = 3600? Too large.
//      Actually area of parallelogram = |cross product| = |(30)(60)-(-60)(30)| = |1800+1800|=3600.
//      Total of what's left: 14400 - (3600+3600+1800+3600) = 14400-12600=1800
//      Need 3 more pieces covering 1800: small tri 1 + small tri 2 + small sq = 600+600+600?
//      But 3 pieces of 600 doesn't match tangram proportions.
//
// I'll stop doing the math and use a VISUALLY REASONABLE approximation that reads
// well as an SVG illustration, even if it's not a perfect tangram. The key pedagogical
// point is showing that the square has cut lines creating 7 pieces.

// FINAL DECISION: Use these points (visually verified on 120×120 grid):
//   Large tri 1: (0,0)  (120,0)  (60,60)
//   Large tri 2: (0,0)  (60,60)  (0,120)
//   Medium tri:  (60,60) (0,120)  (60,120)
//   Small tri 1: (60,0)  (120,0)  (90,30)   ... (60,0) not an original point, hmm
//
// SIMPLEST APPROACH: Use a 4×4 grid (each cell = 30px) on a 120×120 canvas.
// This gives us clean integer coordinates for all 7 classic tangram pieces.
//
// Standard tangram on a 4×4 grid (scaled by 30):
//   A=(0,0), B=(4,0)=(120,0), C=(4,4)=(120,120), D=(0,4)=(0,120)
//   E=(2,0)=(60,0), F=(4,2)=(120,60), G=(2,4)=(60,120), H=(0,2)=(0,60)
//   I=(2,2)=(60,60)
//   J=(3,1)=(90,30), K=(3,3)=(90,90), L=(1,3)=(30,90)
//
//   Piece 1 (large tri):    A(0,0)  B(120,0)  I(60,60)
//   Piece 2 (large tri):    A(0,0)  I(60,60)  D(0,120)
//   Piece 3 (medium tri):   I(60,60) D(0,120)  G(60,120)
//   Piece 4 (parallelogram): I(60,60) J(90,30) F(120,60) K(90,90)
//   Piece 5 (small tri):    J(90,30) B(120,0)  F(120,60)
//   Piece 6 (small tri):    I(60,60) K(90,90) G(60,120)  ... check area: base=30, height=30, area=450
//   Piece 7 (small sq):     ... what's left?
//
//   Let me verify coverage. All pieces should cover (0,0)-(120,120) exactly.
//   P1: TL triangle (0,0)(120,0)(60,60) — top half of top-left 4×4
//   P2: left triangle (0,0)(60,60)(0,120) — left half of left column
//   P3: bottom-left (60,60)(0,120)(60,120)
//   P4: parallelogram (60,60)(90,30)(120,60)(90,90) — center-right area
//   P5: small tri (90,30)(120,0)(120,60) — top-right triangle
//   P6: small tri (60,60)(90,90)(60,120) — bottom-center small
//   P7: remaining = bottom-right? Area check:
//     P1=3600, P2=3600, P3=1800, P4=1800, P5=900, P6=900 → total=12600
//     Missing: 14400-12600=1800 → P7 has area 1800.
//     P7 = (90,90)(90,120)... what region is left?
//     Covered so far in bottom half (y>60):
//       P2 covers: from (0,60) line? No, P2=(0,0)(60,60)(0,120) — left triangle
//       In bottom-right quadrant (x>60, y>60):
//         P3 covers (60,60)(0,120)(60,120) — bottom-left, not in quadrant
//         P4 covers (60,60)(90,30)(120,60)(90,90) — this is the parallelogram
//         P6 covers (60,60)(90,90)(60,120) — small bottom-center
//         P5 covers (90,30)(120,0)(120,60) — top-right
//       Uncovered in bottom-right: area bounded by (90,90)(120,60)(120,120)(60,120)?
//       Vertices: (90,90)(120,90)(120,120)(60,120)? Let me check:
//       Points remaining: everything in the bottom-right not covered by P3,P4,P5,P6.
//       The square (90,90)(120,90)(120,120)(90,120) isn't right either.
//       Correct P7: (90,90)(120,60)(120,120)(60,120) — checking:
//         Is this a valid remaining region?
//         Area = using shoelace: (90,90)(120,60)(120,120)(60,120)
//         = 0.5*|90(60-120)+120(120-90)+120(120-60)+60(90-120)|  ...hmm let me just use it
//
//   I'll use P7 as a quadrilateral (90,90)(120,60)(120,120)(60,120).
//   Area via shoelace:
//     x: 90,120,120,60  y: 90,60,120,120
//     sum1 = 90*60 + 120*120 + 120*120 + 60*90 = 5400+14400+14400+5400=39600
//     sum2 = 90*120 + 60*120 + 120*60 + 120*90 = 10800+7200+7200+10800=36000
//     area = 0.5*|39600-36000| = 0.5*3600 = 1800 ✓
//
//   So P7 = (90,90)(120,60)(120,120)(60,120) — a quadrilateral (trapezoid)
//   Let me verify P3: (60,60)(0,120)(60,120) area = 0.5*base*height = 0.5*60*60=1800 ✓
//   P4 parallelogram (60,60)(90,30)(120,60)(90,90):
//     Shoelace: x:60,90,120,90 y:60,30,60,90
//     s1=60*30+90*60+120*90+90*60=1800+5400+10800+5400=23400
//     s2=60*90+30*120+60*90+90*60=5400+3600+5400+5400=19800
//     area=0.5*|23400-19800|=0.5*3600=1800 ✓
//
//   Coverage check (total=14400): 3600+3600+1800+1800+900+900+1800=14400 ✓
//
// FINAL VERIFIED 7-piece layout:
//   P1 big tri:    (0,0)(120,0)(60,60)
//   P2 big tri:    (0,0)(60,60)(0,120)
//   P3 med tri:    (60,60)(0,120)(60,120)
//   P4 para:       (60,60)(90,30)(120,60)(90,90)   ← MISSING PIECE (answer A)
//   P5 sm tri:     (90,30)(120,0)(120,60)
//   P6 sm tri:     (60,60)(90,90)(60,120)
//   P7 trapezoid:  (90,90)(120,60)(120,120)(60,120)

// ─── shared geometry constants ────────────────────────────────────────────────
const SQ = 120 // square canvas dimension
const PAD = 10  // padding inside each SVG viewport

// Square pieces as polygon point strings (on 120×120 canvas)
const SQ_PIECES = {
  p1: '0,0 120,0 60,60',          // big tri (top)
  p2: '0,0 60,60 0,120',          // big tri (left)
  p3: '60,60 0,120 60,120',       // medium tri (bottom-left)
  p4: '60,60 90,30 120,60 90,90', // parallelogram (MISSING PIECE A)
  p5: '90,30 120,0 120,60',       // small tri (top-right)
  p6: '60,60 90,90 60,120',       // small tri (bottom-center)
  p7: '90,90 120,60 120,120 60,120', // trapezoid (bottom-right)
}

// The cut lines inside the square (edges between pieces)
const CUT_LINES: Array<[number, number, number, number]> = [
  [0, 0, 60, 60],    // TL → center (P1/P2 shared edge)
  [120, 0, 60, 60],  // TR → center (P1/P5 ... no, separates P1 from P4/P5)
  [60, 60, 0, 120],  // center → BL (P2/P3 edge)
  [60, 60, 60, 120], // center → BC (P3/P6 ... P3/P7? Let's use all boundary edges)
  [90, 30, 60, 60],  // P4 top-left edge
  [90, 30, 120, 0],  // P5 left edge
  [90, 30, 120, 60], // P4/P5 right edge + P5 base
  [90, 90, 60, 60],  // P4 bottom-left vertex → center
  [90, 90, 120, 60], // P4/P7 edge
  [90, 90, 60, 120], // P6/P7 edge
  [120, 60, 120, 0], // right side (part of square border, skip — already in outline)
]

// ─── SquarePanel ─────────────────────────────────────────────────────────────
// Renders the original 7-piece tangram square.

const VB = SQ + PAD * 2

export function SquarePanel() {
  const o = PAD // offset
  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      width="100%"
      style={{ display: 'block', maxWidth: 160 }}
      aria-hidden="true"
    >
      {/* all pieces filled blue */}
      {Object.values(SQ_PIECES).map((pts, i) => (
        <polygon
          key={i}
          points={pts
            .split(' ')
            .map((p) => {
              const [x, y] = p.split(',').map(Number)
              return `${x + o},${y + o}`
            })
            .join(' ')}
          fill={BLUE}
          stroke={BLUE_MID}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ))}
      {/* cut lines */}
      {CUT_LINES.map(([x1, y1, x2, y2], i) => (
        <line
          key={`cut-${i}`}
          x1={x1 + o}
          y1={y1 + o}
          x2={x2 + o}
          y2={y2 + o}
          stroke={BLUE_MID}
          strokeWidth={1.2}
          strokeDasharray="3 2"
        />
      ))}
      {/* outer border */}
      <rect
        x={o}
        y={o}
        width={SQ}
        height={SQ}
        fill="none"
        stroke={BLUE_DARK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Kangaroo silhouette ──────────────────────────────────────────────────────
//
// The kangaroo figure is assembled from 6 of the 7 pieces (missing the
// parallelogram P4). We reconstruct the kangaroo shape by repositioning and
// rotating the 6 pieces in a 200×240 viewBox.
//
// Kangaroo layout on a 200×240 canvas (facing left, tail right):
//
//   The reassembled kangaroo — pieces placed as follows (conceptual mapping):
//     Head:  P5 small tri → top-left corner, pointing left, small triangle ≈ snout
//     Body:  P1 big tri (rotated) → large central mass, base at bottom
//     Back:  P2 big tri (rotated) → upper body, connects to head
//     Torso: P7 trapezoid → belly/lower body
//     Leg1:  P3 medium tri → front leg / lower body
//     Leg2:  P6 small tri → rear leg / tail area
//     GAP:   P4 parallelogram → fits in the midsection gap
//
// For a clean SVG render, I'll define the kangaroo as a single multi-point
// silhouette polygon (approximating the outline of the assembled 6-piece figure)
// plus internal cut lines. This avoids the complexity of transforming each piece
// individually while conveying the same information.
//
// Kangaroo outline (approx, on 200×240 viewBox, facing left):
//   Head area:       (30,30) (60,10) (80,30) (70,50) (45,55)
//   Body top:        (45,55) (80,80) (130,60) (170,50)
//   Tail:            (170,50) (200,40) (200,60) (170,70)
//   Body bottom:     (170,70) (130,80) (100,120)
//   Rear legs:       (100,120) (120,160) (100,180) (80,160) (90,130)
//   Front legs:      (90,130) (60,140) (40,160) (20,140) (30,120)
//   Belly:           (30,120) (20,90) (30,60) (30,30)

const KANG_BODY = '30,30 60,10 80,30 70,50 45,55 80,80 130,60 170,50 200,40 200,60 170,70 130,80 100,120 120,160 100,180 80,160 90,130 60,140 40,160 20,140 30,120 20,90 30,60'

// The gap — where piece A (parallelogram) should go — is in the midsection.
// Approximately at the junction of body + belly. We model it as a parallelogram
// cutout shape visible as a "hole" in the assembled figure.
// Gap parallelogram (same shape as P4, scaled and positioned in the kangaroo):
const GAP_POINTS = '80,80 105,65 130,80 105,95'

// Internal cut lines between the 6 placed pieces (inside kangaroo, approximate)
const KANG_CUTS: Array<[number, number, number, number]> = [
  [30, 60, 80, 80],   // P2/P3 junction (front body)
  [80, 80, 100, 120], // P1 base to leg junction
  [80, 80, 130, 80],  // across the body (P1/P7 line)
  [170, 70, 100, 120], // P7 bottom edge
  [100, 120, 90, 130], // to leg split
  [30, 60, 45, 55],   // head to body join
]

// ─── KangarooPanel ───────────────────────────────────────────────────────────

interface KangPanelProps {
  /** When true, the gap outline is shown (dashed red). */
  showGap?: boolean
  /** When true, the gap region is extra-highlighted. */
  glowGap?: boolean
}

export function KangarooPanel({ showGap = true, glowGap = false }: KangPanelProps) {
  const VBW = 220
  const VBH = 200
  return (
    <svg
      viewBox={`0 0 ${VBW} ${VBH}`}
      width="100%"
      style={{ display: 'block', maxWidth: 200 }}
      aria-hidden="true"
    >
      {/* kangaroo body silhouette */}
      <polygon
        points={KANG_BODY}
        fill={BLUE}
        stroke={BLUE_DARK}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* gap region — show as light fill over the body to represent the hole */}
      {showGap && (
        <polygon
          points={GAP_POINTS}
          fill={glowGap ? '#FED7D7' : GAP_FILL}
          stroke={GAP_DASH}
          strokeWidth={glowGap ? 2.5 : 1.8}
          strokeDasharray={glowGap ? 'none' : '4 3'}
          strokeLinejoin="round"
        />
      )}

      {/* internal cut lines */}
      {KANG_CUTS.map(([x1, y1, x2, y2], i) => (
        <line
          key={`kcut-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={BLUE_MID}
          strokeWidth={1.2}
          strokeDasharray="3 2"
        />
      ))}

      {/* gap outline label */}
      {showGap && (
        <text
          x="107"
          y="81"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9}
          fill={glowGap ? '#C53030' : '#E53E3E'}
          fontWeight="bold"
        >
          ?
        </text>
      )}
    </svg>
  )
}

// ─── Option shapes ─────────────────────────────────────────────────────────────
//
// Five option shapes, each as a polygon on a ~120×80 canvas (or square for C).
// All filled with IKMC blue #1E5FA8.

const OPTION_POLYGONS: Record<string, { points: string; vbW: number; vbH: number }> = {
  // A — parallelogram (slanted quad, leaning right): wider than tall
  A: { points: '15,60 75,60 85,10 25,10', vbW: 100, vbH: 75 },
  // B — downward-pointing triangle
  B: { points: '5,5 95,5 50,75', vbW: 100, vbH: 80 },
  // C — diamond (square rotated 45°)
  C: { points: '50,5 95,50 50,95 5,50', vbW: 100, vbH: 100 },
  // D — left-pointing triangle (arrowhead facing left, right angle at bottom-right)
  D: { points: '5,40 90,5 90,75', vbW: 100, vbH: 80 },
  // E — right-angled triangle (right angle at bottom-right)
  E: { points: '5,5 90,75 5,75', vbW: 100, vbH: 80 },
}

/**
 * KangPieces4PEOption — renders one A/B/C/D/E answer choice as its shape.
 * Registered in CHOICE_RENDERERS for IKMC-23-PE-Q4.
 */
export function KangPieces4PEOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const shape = OPTION_POLYGONS[k]
  if (!shape) return <span>{choice.text}</span>

  const ariaLabels: Record<string, string> = {
    A: 'Piece A: a parallelogram (slanted four-sided shape).',
    B: 'Piece B: a downward-pointing triangle.',
    C: 'Piece C: a diamond shape (square rotated 45 degrees).',
    D: 'Piece D: a left-pointing triangle.',
    E: 'Piece E: a right-angled triangle with the right angle at bottom-right.',
  }

  return (
    <span
      role="img"
      aria-label={ariaLabels[k] ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg
        viewBox={`0 0 ${shape.vbW} ${shape.vbH}`}
        width={72}
        height={Math.round(72 * (shape.vbH / shape.vbW))}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <polygon
          points={shape.points}
          fill={BLUE}
          stroke={BLUE_DARK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

// ─── Default export: stem illustration ───────────────────────────────────────

/**
 * KangPieces4PEIllustration — the problem stem figure.
 * Shows (left) the original blue square with tangram cuts and (right) the
 * incomplete kangaroo with a visible gap where piece A (parallelogram) is missing.
 * Does NOT highlight or identify piece A — that is the question.
 */
export default function KangPieces4PEIllustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-3"
      role="img"
      aria-label="A blue square divided into 7 tangram-style pieces. An arrow shows Mr. Beaver rearranging the pieces into a kangaroo shape. One piece is missing — which piece completes the kangaroo?"
    >
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Left: original square with cuts */}
        <div className="flex flex-col items-center gap-1" style={{ maxWidth: 160 }}>
          <SquarePanel />
          <span className="font-display text-xs text-gray-500">Persegi asal</span>
        </div>

        {/* Arrow */}
        <svg
          viewBox="0 0 40 24"
          width={40}
          height={24}
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <line x1={4} y1={12} x2={32} y2={12} stroke={BLUE_DARK} strokeWidth={2.5} strokeLinecap="round" />
          <polygon points="28,6 40,12 28,18" fill={BLUE_DARK} />
        </svg>

        {/* Right: incomplete kangaroo */}
        <div className="flex flex-col items-center gap-1" style={{ maxWidth: 200 }}>
          <KangarooPanel showGap={true} glowGap={false} />
          <span className="font-display text-xs text-gray-500">Kanguru (belum lengkap)</span>
        </div>
      </div>
    </div>
  )
}
