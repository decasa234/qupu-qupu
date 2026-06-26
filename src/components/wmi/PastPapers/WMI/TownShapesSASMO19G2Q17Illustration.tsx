// SASMO-19-G2-Q17 — "What is the total number of triangles, rectangles and circles?"
// Source figure: town scene (house + traffic light + truck/trailer + sun + sky birds).
// Counts bound to seed quantities: rectangles=15, triangles=8, circles=19, total=42.
//
// rectangles (15):
//   house-body(1) + chimney(1) + window-outer(1) + window-TL(1) + window-TR(1)
//   + window-BL(1) + window-BR(1) + door(1) [house=8]
//   + traffic-pole(1) + traffic-housing(1) [traffic=2]
//   + cab-body(1) + cab-window(1) + connector(1) + trailer(1) [truck=4]
//   + road(1) [=15 total]
// triangles (8):
//   house-roof(1) + truck-cab-roof(1) + 6 sky birds [=8 total]
// circles (19):
//   chimney-bubbles(3) + door-knob(1) + traffic-lights(4)
//   + cab-wheel(1) + trailer-wheels(3) + sun(1) + sun-rays(6) [=19 total]
//
// SSR-safe: no hooks, no framer-motion, no random.

const W = 520
const H = 260
const SW = 1.8
const INK = '#1F2937'
const WHITE = '#FFFFFF'

// highlight palette for explainer phase
const COLORS = {
  tri:  { stroke: '#7C3AED', fill: '#EDE9FE' },  // purple
  rect: { stroke: '#B45309', fill: '#FEF3C7' },  // amber
  circ: { stroke: '#047857', fill: '#D1FAE5' },  // green
  dim:  { stroke: '#D1D5DB', fill: '#F9FAFB' },  // faded
  base: { stroke: INK,       fill: WHITE       },
}

type Phase = 'all' | 'triangles' | 'rectangles' | 'circles'

function shapeStyle(
  type: 'tri' | 'rect' | 'circ',
  phase: Phase,
  sw = SW,
): React.SVGProps<SVGElement> {
  if (phase === 'all') return { stroke: INK, fill: WHITE, strokeWidth: sw }
  const active =
    (type === 'tri'  && phase === 'triangles') ||
    (type === 'rect' && phase === 'rectangles') ||
    (type === 'circ' && phase === 'circles')
  const c = active ? COLORS[type] : COLORS.dim
  return { stroke: c.stroke, fill: c.fill, strokeWidth: active ? sw + 0.6 : sw * 0.7 }
}

// ─── reusable diagram (imported by explainer) ────────────────────────────────

export interface TownDiagramProps {
  phase?: Phase
}

export function TownShapesDiagram({ phase = 'all' }: TownDiagramProps) {
  const r = (sw?: number) => shapeStyle('rect', phase, sw)
  const t = (sw?: number) => shapeStyle('tri',  phase, sw)
  const c = (sw?: number) => shapeStyle('circ', phase, sw)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* ── sky triangles (6 flat birds/mountains) ── */}
      <polygon points="115,82 142,55 169,82" {...t()} />
      <polygon points="174,70 202,44 230,70" {...t()} />
      <polygon points="235,92 263,66 291,92" {...t()} />
      <polygon points="293,78 321,52 349,78" {...t()} />
      <polygon points="352,95 378,70 404,95" {...t()} />
      <polygon points="163,105 188,82 213,105" {...t()} />

      {/* ── sun: 1 large circle + 6 small ray-circles ── */}
      <circle cx={456} cy={66} r={26}  {...c()} />
      <circle cx={456} cy={32} r={5.5} {...c()} />
      <circle cx={479} cy={43} r={5}   {...c()} />
      <circle cx={488} cy={66} r={5}   {...c()} />
      <circle cx={479} cy={90} r={5}   {...c()} />
      <circle cx={456} cy={100} r={5.5} {...c()} />
      <circle cx={424} cy={66} r={5}   {...c()} />

      {/* ── road (ground rectangle) ── */}
      <rect x={0} y={242} width={W} height={18} {...r()} />

      {/* ── house ── */}
      {/* chimney (behind roof) */}
      <rect x={42} y={72} width={13} height={82} {...r()} />
      {/* body */}
      <rect x={14} y={150} width={88} height={92} {...r()} />
      {/* roof (triangle) */}
      <polygon points="14,150 58,78 102,150" {...t()} />
      {/* window outer */}
      <rect x={18} y={156} width={40} height={32} {...r()} />
      {/* window panes (4 rectangles) */}
      <rect x={19} y={157} width={18} height={14} {...r()} />
      <rect x={39} y={157} width={18} height={14} {...r()} />
      <rect x={19} y={173} width={18} height={14} {...r()} />
      <rect x={39} y={173} width={18} height={14} {...r()} />
      {/* door */}
      <rect x={52} y={194} width={24} height={48} {...r()} />

      {/* ── chimney bubbles (3 circles) ── */}
      <circle cx={36} cy={68} r={4}   {...c()} />
      <circle cx={44} cy={54} r={5}   {...c()} />
      <circle cx={53} cy={41} r={4}   {...c()} />

      {/* ── door knob (1 circle) ── */}
      <circle cx={73} cy={217} r={3} {...c()} />

      {/* ── traffic light ── */}
      {/* pole */}
      <rect x={208} y={192} width={10} height={50} {...r()} />
      {/* housing */}
      <rect x={196} y={108} width={32} height={84} {...r()} />
      {/* 4 light circles */}
      <circle cx={212} cy={122} r={8.5} {...c()} />
      <circle cx={212} cy={140} r={8.5} {...c()} />
      <circle cx={212} cy={158} r={8.5} {...c()} />
      <circle cx={212} cy={176} r={8.5} {...c()} />

      {/* ── truck cab + trailer ── */}
      {/* cab roof (triangle) */}
      <polygon points="252,180 277,155 322,180" {...t()} />
      {/* cab body */}
      <rect x={252} y={180} width={72} height={62} {...r()} />
      {/* cab front window */}
      <rect x={257} y={184} width={30} height={22} {...r()} />
      {/* connector */}
      <rect x={324} y={194} width={14} height={12} {...r()} />
      {/* trailer */}
      <rect x={338} y={155} width={148} height={87} {...r()} />

      {/* ── wheels ── */}
      {/* cab wheel */}
      <circle cx={278} cy={236} r={11} {...c()} />
      {/* trailer wheels (3) */}
      <circle cx={370} cy={236} r={11} {...c()} />
      <circle cx={413} cy={236} r={11} {...c()} />
      <circle cx={457} cy={236} r={11} {...c()} />
    </svg>
  )
}

// ─── default export: stem illustration ───────────────────────────────────────

export default function TownShapesSASMO19G2Q17Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[520px]"
      role="img"
      aria-label="Gambar kota dengan rumah, lampu lalu lintas, truk, dan matahari — hitung segitiga, persegi panjang, dan lingkaran"
    >
      <TownShapesDiagram phase="all" />
    </div>
  )
}
