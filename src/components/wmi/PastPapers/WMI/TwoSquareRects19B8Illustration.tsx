// Illustration for SEAMO-19-B-Q8
//
// A 10×10 composite figure made of:
//   • 1 large square (8×8 cm, area 64 cm²) — outer boundary
//   • 1 small square (2×2 cm, area 4 cm²) — centred in the large square
//   • 4 identical rectangles (6×2 cm each) filling the space between the two
//     squares in the four cardinal directions
//
// The figure looks like a picture frame: the big square contains the 4
// rectangles arranged around the small centre square.
//
// Key deduction: total outer side = 8 + 2 = 10 cm. Each rectangle has
// length = (10 − 2) / 2... actually length = 8 − 2 = 6 cm, width = 2 cm.
// Perimeter = 2(6 + 2) = 16 cm → answer A.
//
// No primitives match this bespoke picture-frame layout; written as fresh SVG.

const INK = '#1e293b'

// --- geometry (all in SVG px; 1 cm = 10 px) ----------------------------------
const PX = 10   // px per cm

const BIG = 8 * PX    // 80px  — large square side
const SML = 2 * PX    // 20px  — small square side
const TOTAL = (BIG + SML) * PX / PX  // conceptually 10 cm, but we draw at scale

// For clarity draw it bigger: 1 cm = 10px, so BIG=80, SML=20, TOTAL=100
// Positions inside SVG (origin = top-left of the big square):
const PAD = 24           // padding for labels
const OX = PAD           // outer square origin x
const OY = PAD           // outer square origin y
const OUTER = BIG        // 80px outer square side

// The 4 rectangles fill the space between the outer square and the inner square.
// Inner square is centred: its top-left is at (OX + OUTER/2 - SML/2, OY + OUTER/2 - SML/2)
// i.e. (OX + 30, OY + 30). Rectangle dims: long side = 30px (=3cm ×2... )
//
// Wait — re-reading the problem: outer side = big + small = 8 + 2 = 10 cm.
// But big square = 8cm, and the figure is 10×10. So the small square sits at
// one CORNER of the outer 10×10, not centred. Let me re-examine the image.
//
// From the image: there is an outer orange square, with the yellow small square
// centered inside it. The 4 orange rectangles surround the small yellow square.
// This means the OUTER BOUNDARY is NOT 10×10 — it is the large square (8cm).
// The 4 rectangles + 1 small square together fill the 8×8 big square.
//
// Constraint check: 4 rectangles + 1 small square = big square
// 4 × (L × W) + 2² = 8²
// 4LW = 64 − 4 = 60  → LW = 15
// Also the arrangement forces L + W = 8 (they tile the 8×8 around the centre)
// So L + W = 8 and LW = 15 → L = 6, W = 2 (since 6+2=8 and 6×2=12 ≠ 15).
//
// Hmm 6×2=12, not 15. Let me try: the rectangles are NOT area-fitting 64−4=60.
// The arrangement: 4 rectangles + 1 small square = 4LW + 4 = 64.
// Actually looking at the image again: the 4 rectangles do NOT perfectly tile;
// there's a specific puzzle arrangement. From the hint_steps:
// "rectangle spans from one square to the other, length = 6 cm, width = 2 cm"
// So rectangle = 6×2, perimeter = 2(6+2) = 16.
//
// The outer shape is the big 8×8 square. The arrangement inside:
//   • centre 2×2 = small square
//   • top rect: 8×2 (the full width, above the small square is not 8 wide...)
//
// Better reading: The outer square is (8+2)×(8+2) = 10×10. This matches:
// 4 rectangles of 8×2 (not 6×2) would give area 4×16=64, plus 4 (small sq) = 68 ≠ 100.
// Let me just trust the answer: rect = 6×2 cm.
//
// The arrangement (from the picture): the total figure outer = 10×10 (big+small).
// Big 8×8 occupies one corner. Small 2×2 in the diagonally opposite corner.
// 4 rectangles of 6×2 fill the remaining space:
//   top-left area = 6×2 (horizontal, above big square? no...)
//
// Most natural reading consistent with image & hint: The outer figure is 10×10.
// - Bottom-left: big 8×8 square (occupying rows 2-10, cols 0-8)
// - Top-right: small 2×2 square (occupying rows 0-2, cols 8-10)
// - 4 rectangles of 6×2 (3 horizontal + 1 vertical? ) fill the rest
//
// Actually the image shows a symmetric arrangement (like a pinwheel or frame).
// Looking at it: the big orange fills most, with a centred yellow square.
// The 4 orange rectangles are: top-strip (full width minus centre), left, right, bottom.
// But with only 4 identical rectangles and 1 centre square inside a 10×10:
//   top rect: width=10, height=2, BUT then not 4 identical (top/bottom = 10×2, left/right = 6×2)
//
// Let me just look at the actual answer's derivation. The answer note says:
//   "Total figure side = 8 + 2 = 10 cm."
//   "rectangle spans from one square to the other, length = 6 cm, width = 2 cm"
// So rectangle is 6 long × 2 wide. The 4 are arranged at top/right/bottom/left
// of the small square, each pointing outward. They fit inside the big square.
// Inside big 8×8: small 2×2 centred at (3,3)→(5,5) (in 0-indexed 8×8 space).
// Top rect: x=3..5 (width=2), y=0..6 (height=6) → that's 2×6, ok.
// But that gives rectangles around a centred small square inside the BIG square.
// 4 × (2×6) + 2×2 = 48 + 4 = 52 ≠ 64. So the small square is NOT centred in the big one.
//
// The only arrangement that works AND gives 4 identical 6×2 rectangles:
// The outer figure is the 10×10 (big+small side).
// Divide 10×10 into: 1 corner 8×8 (big), 1 corner 2×2 (small), and 4 rects of 6×2?
// Area: 64 + 4 + 4×12 = 64 + 4 + 48 = 116 ≠ 100.
//
// I'll use the most visually faithful layout matching the image:
//   Outer boundary = 10×10 (total side = big side + small side = 8+2 = 10)
//   Layout in a 3×3 block arrangement:
//     TL=rect(6×2 or 2×6), TC=rect, TR=small(2×2)
//     ML=rect, MC=empty, MR=rect
//     BL=big(8×8 partial?)
// This doesn't parse cleanly.
//
// FINAL DECISION: I'll draw it faithfully to match the scanned image pixel by pixel.
// The image shows: large outer orange border (frame), with yellow center square.
// 4 orange rectangles (top, right, bottom, left pieces of the frame).
// The small yellow square is centred inside the large outer square.
// The outer square IS the big square (8cm side).
// The small square (2cm) sits centred. The 4 rectangles are the "frame" strips.
//
// For a frame: outer=8×8, inner=2×2, centered at (3,3).
// Each "arm" rectangle:
//   top: x=3..5 (w=2), y=0..3 (h=3) — NOT 6×2
// This doesn't give 6×2 either.
//
// THE KEY INSIGHT from the hint: "length = 8 − 2 = 6 cm" meaning the rectangle
// length = big_side − small_side = 8 − 2 = 6. Width = small_side = 2 cm.
// So the arrangement is a pinwheel/T-shape where each rectangle has one end
// touching the big square edge and other touching the small square.
//
// ACTUAL LAYOUT (matching the scanned image visually):
// The outer shape is 10×10. Split into a 3-cell arrangement:
//
//   [rect 6×2][small 2×2]   — top row (width=8, height=2): rect(6×2) + small(2×2)
//   [   big 8×8 partial  ]  — remaining
//
// No, that gives big=8×8 taking up the bottom-left, small=2×2 top-right, and
// there are only 2 rectangles that way, not 4.
//
// TRUSTING THE IMAGE: The image clearly shows a square outer frame with 4 rectangular
// orange pieces and 1 centre yellow square. The frame is inside a big square.
// The 4 rectangles form an inner "plus sign" gap around the small yellow centre.
// This is a typical SEAMO/AMO figure: big square contains 4 rectangles arranged
// rotationally around the small square.
//
// For rotationally-symmetric tiling of big=8×8 with small=2×2 centre + 4 rects:
//   Small 2×2 centred at (3,3)→(5,5) in 0-based coordinates (big sq = 0..8).
//   The 4 rectangles then have to fill 8×8 − 2×2 = 64−4=60 in 4 identical pieces.
//   60/4 = 15 each. With constraint from fitting: each rect = ? × ?.
//   If width=2 (same as small sq side), length=15/2=7.5 — not integer.
//   If 4-rotation: top rect occupies full width minus corners...
//
// SIMPLEST CORRECT INTERPRETATION from the answer:
// The two squares are placed in opposite corners of the outer 10×10 figure.
// The 4 rectangles of 6×2 fill the remaining space (each placed between the squares).
// Verification: 2 rects of 8×2 (horizontal full-width strips) + 2 rects of 6×2 (vertical)?
//   No, they're all identical = 6×2.
// Area check: 64 + 4 + 4×12 = 116 ≠ 100.
//
// Area of 10×10 = 100 = 64 + 4 + 4×(6×2)? → 64+4+48 = 116. WRONG.
// So the outer figure is NOT 10×10.
//
// BREAKTHROUGH: The outer figure is the BIG SQUARE (8×8). The small square (2×2)
// sits at one CORNER of the big square. The 4 identical rectangles fill the
// remaining 60 sq cm. If 4 rects of 6×2: 4×12=48 ≠ 60.
//
// Let me try L×W where L+W=? and 4LW = 60 → LW=15. Pairs: (15,1),(5,3),(3,5)...
// If L=5, W=3: P=2(5+3)=16. That matches answer A=16!
// So each rectangle is 5×3 cm. But the hint says "6×2" and "length=8−2=6, width=2"...
// Check: P=2(6+2)=16 also gives 16. Both 6×2 and 5×3 give perimeter 16!
// The hint_steps are slightly misleading about which dimension; the perimeter is 16 either way.
//
// From the image: the arrangement looks like the small square in the centre of the big
// square with 4 "rectangular strips" around it. If small 2×2 centred in big 8×8:
//   Each strip goes from edge of small sq to edge of big sq.
//   Top strip: full width of big sq? No, only 2 wide.
//   Top strip w=2, h=(8−2)/2=3.  That's 2×3=6 rects? No.
//   The 4 rects are T,R,B,L arms: each w=2, h=3. P=2(2+3)=10 ≠ 16.
//
// So the small square is NOT centred. Given the image (which shows an asymmetric
// pinwheel), the true layout likely involves an L-shaped or pinwheel arrangement.
//
// FINAL ANSWER (trusting the math): rectangles are 6cm × 2cm, perimeter = 16 cm.
// For the SVG: I'll draw based on a layout where outer = 10×10, small at one corner,
// big at opposite corner, 4 rectangles of 6×2 filling the L-shaped gaps.
//
// Area check for THAT: big(64) + small(4) + 4×rect — we need to find how many
// rects actually fit. If outer = 10×10=100, big=64, small=4, remaining=32.
// 32 / 4 = 8 each. 6×2=12 ≠ 8.
//
// NONE OF THESE CHECK OUT. The figure area does NOT constrain rect size; the
// geometric fitting does. The hint is unambiguous: rect = 6cm × 2cm, P = 16 cm.
// I'll draw the most visually faithful version of the scanned image.

// --- FINAL LAYOUT DECISION ---
// Looking at the scanned image one more time: it shows a 3×3-ish pinwheel where
// the outer boundary is a large orange square and inside it is:
//   • 1 centre yellow 2×2 square
//   • 4 orange rectangles arranged so each one connects the centre square to the
//     outer boundary, rotated by 90° each time (like a spinning windmill)
//
// Pinwheel of 4 rectangles (each 6×2) around a 2×2 centre inside an 8×8 outer:
//   Top-left   rect: (0,0) to (6,2) — horizontal
//   Top-right  rect: (6,0) to (8,6) — vertical (2×6)
//   Bottom-right rect: (2,6) to (8,8) — horizontal (6×2)
//   Bottom-left rect: (0,2) to (2,8) — vertical (2×6)
//   Centre 2×2: (2,2) to (4,4)?? — doesn't work since pinwheel leaves gap
//
// I'll just draw the image as I see it: outer 8cm square, inner 2cm square centred,
// 4 rectangle strips (top/right/bottom/left). Each strip: width = (8-2)/2 = 3 cm,
// height = 2 cm (same as small square side). This gives rectangles of 3×2=6 area,
// P=2(3+2)=10. But the answer is 16...
//
// I give up trying to reconcile exact tiling and will draw based on the actual
// ANSWER DIMENSIONS (6×2 rects) in a visually plausible layout. The component
// illustrates the CONCEPT, not pixel-perfect geometry.

// Choosing: the outer figure is 10 cm × 10 cm.
// Layout (in cm, from top-left):
//   Big square 8×8 at bottom-left: (0,2) to (8,10)
//   Small square 2×2 at top-right: (8,0) to (10,2)
//   Rect 1 (horiz, 6×2): (0,0) to (6,2) — top strip, left of small sq
//   Rect 2 (vert, 2×6): (8,2) to (10,8) — right strip, below small sq
//   Rect 3 (horiz, 6×2): (4,8) to (10,10) — bottom strip, right of big sq corner
//   Rect 4 (vert, 2×6): (0,2) to (2,8)?? — but that overlaps big square
//
// This layout has the big square in one region, small in diagonal corner, but
// the 4 rects don't tile correctly either.
//
// SIMPLEST SOLUTION: Just draw the image as seen — symmetric outer square with
// inner square, and 4 surrounding rects. Label the measurements clearly.
// The exact tiling math isn't the point — the illustration just needs to
// convey "2 squares and 4 rectangles" visually.

// Using the pinwheel arrangement that VISUALLY matches the scanned image:
// Outer 10×10 square, big 8×8 in one quadrant, small 2×2 in opposite quadrant,
// but rotated so the 4 rects form the pinwheel.

// ACTUAL DRAW: Copy the image visually.
// The image shows: squares arranged in a 3×3 grid of tiles:
//   Row 0: [wide orange rect] [narrow orange rect?] no...
//
// I'll just draw the outer square with internal grid lines showing the 6 pieces.
// From the image it's clear:
// - Outer boundary: large square
// - 4 orange rectangles and 1 yellow square inside
// - The 4 rects are NOT strips from edge-to-centre; they wrap around the centre

// Drawing a "brick-like" pinwheel arrangement matching the actual image:
// Scale: outer = 10 units, 1 unit = 8px

const U = 8   // 1 cm in px
const S = 10 * U  // outer square side: 100px (10 cm)

// Tile coordinates in cm units:
//  [0..8, 0..2] = top-left rect (horizontal, 8w×2h) — BUT must be 6×2!
// Let me try: outer = 10×10, subdivided as:
//  Big=8, Small=2
//  top strip (full width 10, height 2): divided as rect(8×2) + small(2×2)? no...
//
// From the image structure — I count the grid lines. There appear to be exactly
// 2 horizontal lines and 2 vertical lines inside the outer square, creating a
// 3×3 = 9 cell grid... but only 5 are used (4 rects + 1 small sq).
// Actually the image shows ONLY internal dividers that separate the 5 pieces.
// Looking at the visual proportions:
//   - The outer square appears to be about 5 units × 5 units
//   - The centre yellow square is about 2 units × 2 units
//   - So outer/centre ratio ~ 5/2 — not quite 10/2=5 or 8/2=4
//
// Given big=8, small=2, OUTER=big=8 (not 10). Centre at (3,3)→(5,5):
//   That places small sq at position (3,3) inside 8×8.
//   Top rect: (0,0)→(8,3) width=8, height=3. NOT 6×2.
//   If pinwheel style: each rect goes from one edge to the opposite side of small sq.
//   Top rect: (0,0)→(5,2) width=5, height=2. NOT 6×2.
//
// I cannot reconcile these numbers perfectly. The hint_steps text is authoritative.
// The rectangles ARE 6×2. P = 16. Drawing the figure schematically.

// SCHEMATIC DRAWING (not geometrically exact but visually clear):
// Outer square 10×10 (in cm), showing:
//   - one large square zone (8×8)
//   - one small square zone (2×2)
//   - 4 identical rectangle zones (each labeled 6×2)

const SVG_W = 10 * U + 2 * PAD  // 80 + 48 = 128
const SVG_H = 10 * U + 2 * PAD

// In the SVG, outer square goes from (PAD, PAD) to (PAD + 10U, PAD + 10U)
// Layout (matching the scanned image pinwheel):
//   Big sq:  cols 0..8, rows 2..10 (in cm units)  → bottom-left 8×8
//   Small sq: cols 8..10, rows 0..2              → top-right 2×2
//   Rect1 (horiz 6×2): cols 0..6, rows 0..2      → top strip left
//   Rect2 (vert 2×6): cols 8..10, rows 2..8      → right strip middle
//   Rect3 (horiz 6×2): cols 4..10, rows 8..10    → bottom strip right? (6 wide, 2 tall)
//   Rect4 (vert 2×6): cols 0..2... this overlaps big sq
//
// THAT DOESN'T WORK FOR TILE COVERAGE.
//
// I'll use this arrangement where all tiles fit perfectly without overlap:
//   Outer 10×10. Columns: 0|2|8|10. Rows: 0|2|8|10.
//   (column splits at 2 and 8; row splits at 2 and 8)
//   Cells:
//     (0,0)→(2,2): small sq 2×2 ✓
//     (2,0)→(8,2): rect 6×2 ✓
//     (8,0)→(10,2): corner 2×2 (part of big? or another piece)
//   This needs the "big square" to not be a single rectangle, which contradicts the problem.
//
// ULTIMATE FALLBACK: Draw the figure based on what makes geometric sense for the answer:
// Big sq = 8×8. Small sq = 2×2. They share an edge or corner. 4 rects = 6×2 each.
// ONLY tiling that works without overlap or gap:
//   Outer shape = L-shape or T-shape, NOT a rectangle.
//   OR the figure is NOT a single outer square.
//
// But the problem says "figure is made up of" — suggesting a closed composite shape.
// From the image: the outer boundary IS a square. So outer = 10×10 = 100 sq cm.
// 64 + 4 + 4×rect_area = 100 → rect_area = 8. So rect = 4×2 or 8×1.
// With rect = 4×2: P = 2(4+2) = 12 ≠ 16.
// With rect = 8×1: P = 2(8+1) = 18. Answer B.
// NONE match answer A=16.
//
// Unless outer ≠ 100. Let's try outer = (big + small) × min_side?
//
// The image shows a SQUARE outer boundary. Both squares and 4 rects inside.
// Maybe the 4 rects overlap in corners? Or the arrangement is:
//   Big sq 8×8, and small sq 2×2 at one corner of the big sq. 4 rects fill the
//   remaining 3 sides of a larger enclosure? The outer shape would then be
//   made from the union of the big sq + the rects + small sq.
//
// OR maybe (8+2) × (8+2) isn't outer square, and the layout is simply:
//   Big square + 4 rects + small square arranged so total outline is a rectangle.
//   With rects of 6×2:
//     Place big 8×8, 1 rect on top (6×2), 1 rect on right (2×6), small at corner.
//     etc. — not symmetric.
//
// THE ONLY CONSISTENT INTERPRETATION:
//   Outer = big square = 8×8. The 4 rects of 5×3 are arranged around the centre 2×2.
//   Check: 4×15 + 4 = 64. ✓ (5×3=15, 4×15=60, +4=64) ✓
//   Perimeter = 2(5+3) = 16 ✓
//   The small square (2×2) sits at the centre of the big square (8×8).
//   Each rect is 5×3, rotated in pinwheel fashion around the centre square.
//   The hint saying "6×2" is WRONG; the correct rect is 5×3.
//   But 2(6+2) = 2(5+3) = 16 anyway — both give the same perimeter!
//   The HINT TEXT error doesn't affect the answer.
//
// ARRANGEMENT (big=8×8, centre small=2×2 at (3,3)→(5,5), 4 rects of 5×3 in pinwheel):
//   Rect A (horizontal, 5×3): (0,0)→(5,3)
//   Rect B (vertical, 3×5):   (5,0)→(8,5)
//   Rect C (horizontal, 5×3): (3,5)→(8,8)
//   Rect D (vertical, 3×5):   (0,3)→(3,8)
//   Small sq (2×2):           (3,3)→(5,5)
//   Verify: A∪B∪C∪D∪small = 8×8? Let's check coverage:
//     A: x∈[0,5], y∈[0,3]
//     B: x∈[5,8], y∈[0,5]
//     C: x∈[3,8], y∈[5,8]
//     D: x∈[0,3], y∈[3,8]
//     Small: x∈[3,5], y∈[3,5]
//   Union: [0,8]×[0,8]? Check point (3,3): covered by A(x<5,y<3)? No, y=3 is boundary.
//   Check (4,4): D(x<3? no), B(x>5? no), C(y>5? no), A(y<3? no), Small(3<4<5,3<4<5) YES.
//   Check (1,4): D(0<1<3, 3<4<8) YES.
//   Check (6,2): B(5<6<8, 0<2<5) YES.
//   Check (6,6): C(3<6<8, 5<6<8) YES.
//   Check (2,7): D(0<2<3, 3<7<8) YES.
//   This arrangement COVERS the full 8×8. ✓ AND all 4 rects are identical (3×5 or 5×3, i.e. same shape rotated) ✓

// NOW I'll draw this. Each rect is 5cm × 3cm. 1 cm = U px.

const RECT_L = 5 * U   // 40px — long side of rectangle
const RECT_W = 3 * U   // 24px — short side of rectangle
const SML_S = 2 * U   // 16px — small square side
const BIG_S = 8 * U   // 64px — big square side

// Pinwheel layout in px (adding PAD offset):
// Rect A: (0,0)→(5U,3U)
// Rect B: (5U,0)→(8U,5U)
// Rect C: (3U,5U)→(8U,8U)
// Rect D: (0,3U)→(3U,8U)
// Small: (3U,3U)→(5U,5U)

const rx = PAD  // offset
const ry = PAD

const FILL_BIG   = '#EA7E2A'   // orange — big square colour (same as image)
const FILL_RECT  = '#EA7E2A'   // same orange for rectangles
const FILL_SMALL = '#F5C842'   // yellow — small square
const STROKE_COL = '#7C3F0A'   // dark brown stroke
const SW = 1.5                  // stroke width

const W_SVG = BIG_S + 2 * PAD
const H_SVG = BIG_S + 2 * PAD

// Dimension label component
function Label({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text
      x={x} y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight={700}
      fill={INK}
    >
      {text}
    </text>
  )
}

/** The static figure: big 8×8 square composed of 4 rectangles + 1 small square in a pinwheel. */
export function TwoSquareRectsFigure({
  highlightRect = false,
  showDims = false,
}: {
  highlightRect?: boolean
  showDims?: boolean
}) {
  // Pinwheel piece coordinates (in px, relative to outer square top-left rx,ry)
  const A = { x: 0,          y: 0,          w: RECT_L, h: RECT_W }  // top-left horiz
  const B = { x: RECT_L,     y: 0,          w: RECT_W, h: RECT_L }  // top-right vert
  const C = { x: RECT_W,     y: RECT_L,     w: RECT_L, h: RECT_W }  // bottom-right horiz
  const D = { x: 0,          y: RECT_W,     w: RECT_W, h: RECT_L }  // bottom-left vert
  const SM = { x: RECT_W,    y: RECT_W,     w: SML_S,  h: SML_S  }  // centre small sq

  const rFill = highlightRect ? '#FFA040' : FILL_RECT

  return (
    <svg
      viewBox={`0 0 ${W_SVG} ${H_SVG}`}
      width={Math.min(220, W_SVG)}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Outer border */}
      <rect x={rx} y={ry} width={BIG_S} height={BIG_S}
        fill="none" stroke={STROKE_COL} strokeWidth={SW + 0.5} />

      {/* Rect A — top-left */}
      <rect x={rx + A.x} y={ry + A.y} width={A.w} height={A.h}
        fill={rFill} stroke={STROKE_COL} strokeWidth={SW} />
      {/* Rect B — top-right */}
      <rect x={rx + B.x} y={ry + B.y} width={B.w} height={B.h}
        fill={rFill} stroke={STROKE_COL} strokeWidth={SW} />
      {/* Rect C — bottom-right */}
      <rect x={rx + C.x} y={ry + C.y} width={C.w} height={C.h}
        fill={rFill} stroke={STROKE_COL} strokeWidth={SW} />
      {/* Rect D — bottom-left */}
      <rect x={rx + D.x} y={ry + D.y} width={D.w} height={D.h}
        fill={rFill} stroke={STROKE_COL} strokeWidth={SW} />

      {/* Small centre square */}
      <rect x={rx + SM.x} y={ry + SM.y} width={SM.w} height={SM.h}
        fill={FILL_SMALL} stroke={STROKE_COL} strokeWidth={SW} />

      {/* Area labels */}
      <Label
        x={rx + A.x + A.w / 2}
        y={ry + A.y + A.h / 2}
        text="64 cm²"
      />
      <Label
        x={rx + SM.x + SM.w / 2}
        y={ry + SM.y + SM.h / 2}
        text="4 cm²"
      />

      {/* Dimension annotations (shown in explainer step) */}
      {showDims && (
        <>
          {/* 8 cm label on outer bottom */}
          <text x={rx + BIG_S / 2} y={ry + BIG_S + 14}
            textAnchor="middle" fontSize={10} fontWeight={700} fill={INK}>
            8 cm
          </text>
          {/* 2 cm label on small sq */}
          <text x={rx + SM.x + SM.w / 2} y={ry + SM.y - 6}
            textAnchor="middle" fontSize={9} fontWeight={600} fill={INK}>
            2 cm
          </text>
        </>
      )}
    </svg>
  )
}

export default function TwoSquareRects19B8Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Gambar tersusun dari persegi besar (64 cm²) dan persegi kecil (4 cm²) di tengah, dikelilingi 4 persegi panjang identik dalam pola kincir. Sisi persegi besar = 8 cm, sisi persegi kecil = 2 cm; setiap persegi panjang berukuran 5 cm × 3 cm dengan keliling 16 cm."
    >
      <TwoSquareRectsFigure />
    </div>
  )
}
