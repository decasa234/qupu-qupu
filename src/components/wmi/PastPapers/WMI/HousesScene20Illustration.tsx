// Faithful line-drawing reproduction of the WMI-20F1A Q14 figure
// (wmiPastPaper/2020 WMI Final G01 Paper A/images/6e4e6090...913ec7.jpg):
// three houses, a bird perched on the middle house's roof, two small ground
// triangles, and a sun made of circles and rectangle rays in the top-right.
//
// Canonical shape counts the drawing must reconcile to (answer A):
//   8 triangles  = roof x3 + bird beak + bird tail x2 + ground x2
//   9 circles    = bird head + eye + body + tail tip  + sun center + sun diagonals x4
//   7 squares    = house-1 body + windows (1 + 2 + 3)
//   6 rectangles = house-2 body + house-3 body + sun rays x4
export default function HousesScene20Illustration() {
  const stroke = '#1F2937'
  const sw = 2
  const shape = { fill: '#FFFFFF', stroke, strokeWidth: sw, strokeLinejoin: 'round' as const }

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A line drawing of three houses with triangle roofs and square windows, a bird made of circles and triangles sitting on the middle house's roof, two small triangles on the ground, and a sun in the top right made of circles with rectangle rays."
    >
      <svg viewBox="0 0 880 460" width="100%" style={{ maxWidth: 720, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {/* ── House 1 (small): triangle roof + SQUARE body + 1 square window ── */}
        <polygon points="28,340 132,340 80,268" {...shape} /> {/* triangle 1/8: roof 1 */}
        <rect x={40} y={340} width={80} height={80} {...shape} /> {/* square 1/7: house-1 body */}
        <rect x={68} y={360} width={24} height={24} {...shape} /> {/* square 2/7: house-1 window */}

        {/* ── House 2 (medium): triangle roof + tall RECTANGLE body + 2 windows ── */}
        <polygon points="215,300 325,300 270,222" {...shape} /> {/* triangle 2/8: roof 2 */}
        <rect x={235} y={300} width={70} height={120} {...shape} /> {/* rectangle 1/6: house-2 body */}
        <rect x={257} y={318} width={26} height={26} {...shape} /> {/* square 3/7: house-2 window top */}
        <rect x={257} y={362} width={26} height={26} {...shape} /> {/* square 4/7: house-2 window bottom */}

        {/* ── Bird perched on house 2's roof ── */}
        {/* beak (points left), drawn before the head so the head outline sits on top */}
        <polygon points="208,110 208,134 180,122" {...shape} /> {/* triangle 3/8: bird beak */}
        <circle cx={270} cy={186} r={32} {...shape} /> {/* circle 1/9: bird body */}
        <circle cx={235} cy={126} r={28} {...shape} /> {/* circle 2/9: bird head */}
        <circle cx={231} cy={121} r={7} {...shape} /> {/* circle 3/9: bird eye */}
        {/* tail: two small triangles pointing right, then a small circle at the tip */}
        <polygon points="300,150 300,184 330,167" {...shape} /> {/* triangle 4/8: tail */}
        <polygon points="330,152 330,182 356,167" {...shape} /> {/* triangle 5/8: tail */}
        <circle cx={367} cy={156} r={11} {...shape} /> {/* circle 4/9: tail tip */}

        {/* ── Small ground triangle between houses 2 and 3 ── */}
        <polygon points="395,420 455,420 425,378" {...shape} /> {/* triangle 6/8 */}

        {/* ── House 3 (big): large triangle roof + large RECTANGLE body + 3 windows ── */}
        <polygon points="470,270 710,270 590,162" {...shape} /> {/* triangle 7/8: roof 3 */}
        <rect x={490} y={270} width={200} height={150} {...shape} /> {/* rectangle 2/6: house-3 body */}
        <rect x={528} y={292} width={36} height={36} {...shape} /> {/* square 5/7: house-3 window */}
        <rect x={608} y={318} width={32} height={32} {...shape} /> {/* square 6/7: house-3 window */}
        <rect x={550} y={352} width={32} height={32} {...shape} /> {/* square 7/7: house-3 window */}

        {/* ── Small ground triangle at the far right ── */}
        <polygon points="740,420 800,420 770,378" {...shape} /> {/* triangle 8/8 */}

        {/* ── Sun (top right): center circle, 4 diagonal circles, 4 rectangle rays ── */}
        <rect x={781} y={38} width={18} height={26} {...shape} /> {/* rectangle 3/6: ray top */}
        <rect x={781} y={126} width={18} height={26} {...shape} /> {/* rectangle 4/6: ray bottom */}
        <rect x={728} y={86} width={26} height={18} {...shape} /> {/* rectangle 5/6: ray left */}
        <rect x={826} y={86} width={26} height={18} {...shape} /> {/* rectangle 6/6: ray right */}
        <circle cx={790} cy={95} r={22} {...shape} /> {/* circle 5/9: sun center */}
        <circle cx={763} cy={68} r={10} {...shape} /> {/* circle 6/9: sun diagonal */}
        <circle cx={817} cy={68} r={10} {...shape} /> {/* circle 7/9: sun diagonal */}
        <circle cx={763} cy={122} r={10} {...shape} /> {/* circle 8/9: sun diagonal */}
        <circle cx={817} cy={122} r={10} {...shape} /> {/* circle 9/9: sun diagonal */}
      </svg>
    </div>
  )
}
