import type { WmiChoice } from '../../../../types/wmi'

// CHOICE renderer for WMI-22F1A-Q10 (Grade 1):
//   "Which figure has MORE circles than rectangles?"  (answer = A)
//
// Each option A–D is a line-drawing picture from the printed paper. We redraw a
// clean, simplified version of each scene built ONLY from circles and
// rectangles (plus a couple of decorative triangles that are neither), so the
// counts a child must compare are visible and the drawn figure can never drift
// from the authored answer.
//
// Counts read off the scanned option images (drives the explainer):
//   A  toy crane car  — 6 circles, 4 rectangles  → circles > rectangles  ✓ ANSWER
//   B  cartoon figure — 4 circles, 6 rectangles  → circles < rectangles
//   C  house + smoke  — 5 circles, 5 rectangles  → circles = rectangles
//   D  rocket         — 4 circles, 6 rectangles  → circles < rectangles
// A is the only figure with strictly MORE circles than rectangles.

export type FigureLabel = 'A' | 'B' | 'C' | 'D'

const INK = '#1F77C2' // matches the source line-art blue
const TINT_CIRCLE = '#FBE4E4' // soft peach wash when highlighting circles
const TINT_RECT = '#D6EBF7' // soft blue wash when highlighting rectangles

type MarkShape = 'circle' | 'rect'

// Fill chosen per primitive so the explainer can tint just the circles or just
// the rectangles while it counts. `markShape` undefined → plain white figure.
function circleFill(markShape?: MarkShape) {
  return markShape === 'circle' ? TINT_CIRCLE : '#FFFFFF'
}
function rectFill(markShape?: MarkShape) {
  return markShape === 'rect' ? TINT_RECT : '#FFFFFF'
}

interface FigureDef {
  circles: number
  rects: number
  viewBox: string
  label_id: string
  draw: (markShape?: MarkShape) => JSX.Element
}

const SW = 4 // stroke width
const stroke = { stroke: INK, strokeWidth: SW, strokeLinejoin: 'round' as const }

// ── A — toy crane car: 6 circles, 4 rectangles ────────────────────────────
function drawA(markShape?: MarkShape) {
  const c = circleFill(markShape)
  const r = rectFill(markShape)
  return (
    <g fill="none" {...stroke}>
      {/* flag (triangle — neither circle nor rect) + thin pole */}
      <polygon points="60,18 30,34 60,50" fill="#FFFFFF" {...stroke} />
      <rect x={60} y={18} width={8} height={56} fill={r} {...stroke} />
      {/* crane head box (rect 1) with pivot circle (circle 1) */}
      <rect x={42} y={62} width={56} height={42} fill={r} {...stroke} />
      <circle cx={74} cy={84} r={11} fill={c} {...stroke} />
      {/* crane arm/barrel (rect 2) + ball at the tip (circle 2) */}
      <rect x={98} y={74} width={86} height={18} fill={r} {...stroke} />
      <circle cx={194} cy={83} r={11} fill={c} {...stroke} />
      {/* middle body block (rect 3) */}
      <rect x={36} y={104} width={84} height={32} fill={r} {...stroke} />
      {/* lower wide body block (rect 4) */}
      <rect x={14} y={136} width={150} height={52} fill={r} {...stroke} />
      {/* two wheels (circles 3 & 4) each with a hub (circles 5 & 6) */}
      <circle cx={56} cy={222} r={42} fill={c} {...stroke} />
      <circle cx={56} cy={222} r={17} fill={c} {...stroke} />
      <circle cx={132} cy={222} r={42} fill={c} {...stroke} />
      <circle cx={132} cy={222} r={17} fill={c} {...stroke} />
    </g>
  )
}

// ── B — cartoon figure: 4 circles, 6 rectangles ───────────────────────────
function drawB(markShape?: MarkShape) {
  const c = circleFill(markShape)
  const r = rectFill(markShape)
  return (
    <g fill="none" {...stroke}>
      {/* head (circle 1) with two eyes (circles 2 & 3) + round mouth (circle 4) */}
      <circle cx={100} cy={68} r={52} fill={c} {...stroke} />
      <circle cx={82} cy={62} r={10} fill={c} {...stroke} />
      <circle cx={118} cy={62} r={10} fill={c} {...stroke} />
      <circle cx={100} cy={92} r={9} fill={c} {...stroke} />
      {/* body — two stacked rects (rects 1 & 2) */}
      <rect x={86} y={120} width={28} height={34} fill={r} {...stroke} />
      <rect x={86} y={154} width={28} height={34} fill={r} {...stroke} />
      {/* left arm — two angled segment rects (rects 3 & 4) */}
      <g transform="rotate(38 70 168)">
        <rect x={34} y={150} width={32} height={20} fill={r} {...stroke} />
        <rect x={66} y={150} width={32} height={20} fill={r} {...stroke} />
      </g>
      {/* right arm — two angled segment rects (rects 5 & 6) */}
      <g transform="rotate(-38 130 168)">
        <rect x={102} y={150} width={32} height={20} fill={r} {...stroke} />
        <rect x={134} y={150} width={32} height={20} fill={r} {...stroke} />
      </g>
    </g>
  )
}

// ── C — house with chimney smoke: 5 circles, 5 rectangles ─────────────────
function drawC(markShape?: MarkShape) {
  const c = circleFill(markShape)
  const r = rectFill(markShape)
  return (
    <g fill="none" {...stroke}>
      {/* roof (triangle — neither) */}
      <polygon points="100,52 24,108 176,108" fill="#FFFFFF" {...stroke} />
      {/* house body (a plain rect outline, NOT counted as a feature rect) */}
      <rect x={28} y={108} width={144} height={130} fill="#FFFFFF" {...stroke} />
      {/* three upper windows (rects 1, 2, 3) */}
      <rect x={42} y={130} width={30} height={20} fill={r} {...stroke} />
      <rect x={84} y={130} width={30} height={20} fill={r} {...stroke} />
      <rect x={126} y={130} width={30} height={20} fill={r} {...stroke} />
      {/* chimney (rect 4) */}
      <rect x={140} y={70} width={18} height={40} fill={r} {...stroke} />
      {/* door (rect 5) */}
      <rect x={86} y={198} width={28} height={40} fill={r} {...stroke} />
      {/* two round windows (circles 1 & 2) */}
      <circle cx={62} cy={196} r={16} fill={c} {...stroke} />
      <circle cx={138} cy={196} r={16} fill={c} {...stroke} />
      {/* three smoke puffs (circles 3, 4, 5) */}
      <circle cx={150} cy={56} r={8} fill={c} {...stroke} />
      <circle cx={168} cy={40} r={11} fill={c} {...stroke} />
      <circle cx={186} cy={22} r={14} fill={c} {...stroke} />
    </g>
  )
}

// ── D — rocket: 4 circles, 6 rectangles ───────────────────────────────────
function drawD(markShape?: MarkShape) {
  const c = circleFill(markShape)
  const r = rectFill(markShape)
  return (
    <g fill="none" {...stroke}>
      {/* nose cone (triangle — neither) */}
      <polygon points="100,18 84,52 116,52" fill="#FFFFFF" {...stroke} />
      {/* nose tube (rect 1) */}
      <rect x={84} y={52} width={32} height={56} fill={r} {...stroke} />
      {/* mid body (rect 2) with two body dots (circles 1 & 2) */}
      <rect x={84} y={108} width={32} height={64} fill={r} {...stroke} />
      <circle cx={100} cy={126} r={10} fill={c} {...stroke} />
      <circle cx={100} cy={154} r={10} fill={c} {...stroke} />
      {/* left & right fins (rects 3 & 4) */}
      <rect x={62} y={120} width={20} height={52} fill={r} {...stroke} />
      <rect x={118} y={120} width={20} height={52} fill={r} {...stroke} />
      {/* horizontal cross-bar (rect 5) */}
      <rect x={62} y={186} width={76} height={26} fill={r} {...stroke} />
      {/* left & right boosters: arrow heads (triangles) + tip circles (3 & 4) */}
      <polygon points="62,186 30,199 62,212" fill="#FFFFFF" {...stroke} />
      <polygon points="138,186 170,199 138,212" fill="#FFFFFF" {...stroke} />
      <circle cx={22} cy={199} r={14} fill={c} {...stroke} />
      <circle cx={178} cy={199} r={14} fill={c} {...stroke} />
      {/* lower nozzle box (rect 6) + flare (triangle) */}
      <rect x={84} y={212} width={32} height={24} fill={r} {...stroke} />
      <polygon points="100,236 84,262 116,262" fill="#FFFFFF" {...stroke} />
    </g>
  )
}

export const FIGURES: Record<FigureLabel, FigureDef> = {
  A: {
    circles: 6,
    rects: 4,
    viewBox: '0 0 210 268',
    label_id: 'mobil derek mainan',
    draw: drawA,
  },
  B: {
    circles: 4,
    rects: 6,
    viewBox: '0 0 200 200',
    label_id: 'tokoh kartun',
    draw: drawB,
  },
  C: {
    circles: 5,
    rects: 5,
    viewBox: '0 0 200 252',
    label_id: 'rumah berasap',
    draw: drawC,
  },
  D: {
    circles: 4,
    rects: 6,
    viewBox: '0 0 200 272',
    label_id: 'roket',
    draw: drawD,
  },
}

/**
 * Draws ONE option figure built from circles + rectangles. Pass `markShape` to
 * tint just its circles (peach) or just its rectangles (blue) — the explainer
 * uses this to highlight a shape kind while it counts. The static option chip
 * passes nothing, so the figure renders plain white outlines.
 */
export function CircleRectFigure({
  label,
  markShape,
}: {
  label: FigureLabel
  markShape?: MarkShape
}) {
  const fig = FIGURES[label] ?? FIGURES.A
  return (
    <svg
      viewBox={fig.viewBox}
      width="100%"
      style={{ maxWidth: 96, display: 'block' }}
      aria-hidden="true"
    >
      {fig.draw(markShape)}
    </svg>
  )
}

export default function CircleRect22G1Option({ choice }: { choice: WmiChoice }) {
  const label = (choice?.label ?? '') as FigureLabel
  const fig = FIGURES[label]
  if (!fig) return <span>{choice?.text}</span>

  return (
    <span
      role="img"
      aria-label={`Pilihan ${label}: gambar ${fig.label_id} dari lingkaran dan persegi panjang.`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <CircleRectFigure label={label} />
    </span>
  )
}
