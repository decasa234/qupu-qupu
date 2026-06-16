// WMI-23F3A-Q5 (2023 Grade 3 Final) — snail crawling in right-angle turns.
//
// "A snail crawls in straight lines and right-angle turns. From A it goes
// north 14, west 12, east 29, south 5. At least how many cm to get back to A?"
// MC answer = D = 26.
//
// MATH (for reference only — the static problem figure must NOT reveal it):
// net displacement = (14 − 5) = 9 cm north and (29 − 12) = 17 cm east, so the
// shortest (taxicab, right-angle-only) return = 9 + 17 = 26 cm.
//
// The source image is a decorative snail cartoon; this is a fresh, house-style
// grid + path figure. The default export draws ONLY the outbound path (the
// problem) — A, the four labelled/arrowed segments, the END point, and a compass
// hint. It never draws the return path or the value 26. Revealing the dashed
// L-shaped return (17 west + 9 south = 26) is the animator's job via the
// co-exported SnailPath23G3 primitive with showReturn=true.
//
// Pure render: no Math.random, no Date, no state — SSR-safe & deterministic.

const INK = '#1F2937' // labels / markers
const GRID = '#E7DECF' // light square grid (cream-dark family)

export const ANSWER = 26 // shortest return in cm — never drawn in the static figure

// Net displacement of the outbound walk (animator-facing).
export const NET_NORTH = 14 - 5 // 9
export const NET_EAST = 29 - 12 // 17

// Outbound path in problem coordinates (north = +y up, east = +x right).
// A at origin; each vertex is the end of one straight segment.
export const OUTBOUND: ReadonlyArray<{ x: number; y: number }> = [
  { x: 0, y: 0 }, // A
  { x: 0, y: 14 }, // N 14
  { x: -12, y: 14 }, // W 12
  { x: 17, y: 14 }, // E 29
  { x: 17, y: 9 }, // S 5  -> END
]

// Per-segment metadata for labels / arrows (problem space).
const SEGMENTS: ReadonlyArray<{ len: number; dir: 'N' | 'W' | 'E' | 'S' }> = [
  { len: 14, dir: 'N' },
  { len: 12, dir: 'W' },
  { len: 29, dir: 'E' },
  { len: 5, dir: 'S' },
]

// ---- geometry --------------------------------------------------------------
// Problem-space bounds: x in [-12, 17], y in [0, 14].
const MIN_X = -12
const MAX_X = 17
const MIN_Y = 0
const MAX_Y = 14
const SCALE = 8 // user units per cm
const PAD = 26 // headroom so arrowheads / labels never clip
const SPAN_X = MAX_X - MIN_X // 29
const SPAN_Y = MAX_Y - MIN_Y // 14

const WIDTH = SPAN_X * SCALE + PAD * 2
const HEIGHT = SPAN_Y * SCALE + PAD * 2

// Problem (north-up) -> SVG (y-down) transform.
const sx = (x: number) => PAD + (x - MIN_X) * SCALE
const sy = (y: number) => PAD + (MAX_Y - y) * SCALE

/** A small filled arrowhead at (tx,ty) pointing along the given unit dir. */
function Arrow({ tx, ty, dir }: { tx: number; ty: number; dir: 'N' | 'W' | 'E' | 'S' }) {
  const s = 6 // arrow half-size
  // SVG y is down, so N points up = -y, S = +y.
  let pts: string
  if (dir === 'N') pts = `${tx},${ty - s} ${tx - s},${ty + s} ${tx + s},${ty + s}`
  else if (dir === 'S') pts = `${tx},${ty + s} ${tx - s},${ty - s} ${tx + s},${ty - s}`
  else if (dir === 'E') pts = `${tx + s},${ty} ${tx - s},${ty - s} ${tx - s},${ty + s}`
  else pts = `${tx - s},${ty} ${tx + s},${ty - s} ${tx + s},${ty + s}` // W
  return <polygon points={pts} fill="currentColor" className="text-qupu-brand-orange" />
}

export interface SnailPath23G3Props {
  /** Also draw the dashed shortest return path (17 W + 9 S = 26). Animator only. */
  showReturn?: boolean
}

/**
 * Primitive. Draws the light grid + outbound path with arrows and cm labels.
 * With showReturn it adds the dashed L-shaped return from END back to A and the
 * net-displacement labels (17 and 9) plus the total (26).
 */
export function SnailPath23G3({ showReturn = false }: SnailPath23G3Props = {}) {
  // Outbound polyline points in SVG space.
  const outPts = OUTBOUND.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')

  // Label placement per segment: offset perpendicular to the segment, outward.
  const labels = SEGMENTS.map((seg, i) => {
    const a = OUTBOUND[i]
    const b = OUTBOUND[i + 1]
    const mx = (sx(a.x) + sx(b.x)) / 2
    const my = (sy(a.y) + sy(b.y)) / 2
    let lx = mx
    let ly = my
    let anchor: 'start' | 'middle' | 'end' = 'middle'
    if (seg.dir === 'N') {
      lx = mx - 8
      anchor = 'end'
    } else if (seg.dir === 'S') {
      lx = mx + 8
      anchor = 'start'
    } else if (seg.dir === 'W') {
      ly = my - 10
    } else {
      ly = my - 10 // E
    }
    return { key: `seg-${i}`, x: lx, y: ly, anchor, text: `${seg.len} cm`, dir: seg.dir }
  })

  // Arrowhead positions: just before each segment's endpoint, along travel dir.
  const arrows = SEGMENTS.map((seg, i) => {
    const b = OUTBOUND[i + 1]
    const back = 1.2 // pull the arrowhead a touch inside the endpoint (cm)
    let bx = b.x
    let by = b.y
    if (seg.dir === 'N') by -= back
    else if (seg.dir === 'S') by += back
    else if (seg.dir === 'E') bx -= back
    else bx += back // W
    return { key: `arr-${i}`, tx: sx(bx), ty: sy(by), dir: seg.dir }
  })

  const A = OUTBOUND[0]
  const END = OUTBOUND[OUTBOUND.length - 1]

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={Math.min(280, WIDTH)} className="text-qupu-brand-orange">
      {/* ---- light square grid -------------------------------------------- */}
      <g>
        {Array.from({ length: SPAN_X + 1 }).map((_, i) => {
          const x = sx(MIN_X + i)
          return <line key={`gx-${i}`} x1={x} y1={sy(MAX_Y)} x2={x} y2={sy(MIN_Y)} stroke={GRID} strokeWidth={1} />
        })}
        {Array.from({ length: SPAN_Y + 1 }).map((_, i) => {
          const y = sy(MIN_Y + i)
          return <line key={`gy-${i}`} x1={sx(MIN_X)} y1={y} x2={sx(MAX_X)} y2={y} stroke={GRID} strokeWidth={1} />
        })}
      </g>

      {/* ---- compass hint (N up) ------------------------------------------ */}
      <g transform={`translate(${WIDTH - PAD - 2}, ${PAD - 2})`}>
        <line x1={0} y1={16} x2={0} y2={0} stroke="currentColor" strokeWidth={2} className="text-qupu-brand-blue" />
        <polygon points="0,-5 -4,3 4,3" fill="currentColor" className="text-qupu-brand-blue" />
        <text x={0} y={28} textAnchor="middle" fontSize={11} fontWeight={800} className="fill-qupu-brand-blue">
          U
        </text>
      </g>

      {/* ---- shortest return path (animator only) ------------------------- */}
      {showReturn && (
        <g>
          {/* END -> west to (0,9), then south to A(0,0). Dashed L-shape. */}
          <polyline
            points={`${sx(END.x)},${sy(END.y)} ${sx(0)},${sy(9)} ${sx(A.x)},${sy(A.y)}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-qupu-brand-blue"
          />
          {/* net-east 17 label on the westward leg */}
          <text
            x={(sx(END.x) + sx(0)) / 2}
            y={sy(9) + 16}
            textAnchor="middle"
            fontSize={11}
            fontWeight={800}
            className="fill-qupu-brand-blue"
          >
            17 cm
          </text>
          {/* net-north 9 label on the southward leg */}
          <text
            x={sx(0) - 8}
            y={(sy(9) + sy(0)) / 2}
            textAnchor="end"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={800}
            className="fill-qupu-brand-blue"
          >
            9 cm
          </text>
          {/* total return distance */}
          <text
            x={(sx(END.x) + sx(0)) / 2}
            y={sy(9) - 8}
            textAnchor="middle"
            fontSize={13}
            fontWeight={900}
            className="fill-qupu-brand-blue"
          >
            17 + 9 = 26
          </text>
        </g>
      )}

      {/* ---- outbound path ------------------------------------------------- */}
      <polyline
        points={outPts}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-qupu-brand-orange"
      />
      {arrows.map((a) => (
        <Arrow key={a.key} tx={a.tx} ty={a.ty} dir={a.dir} />
      ))}
      {labels.map((l) => (
        <text
          key={l.key}
          x={l.x}
          y={l.y}
          textAnchor={l.anchor}
          dominantBaseline={l.dir === 'N' || l.dir === 'S' ? 'central' : 'auto'}
          fontSize={11}
          fontWeight={800}
          fill={INK}
        >
          {l.text}
        </text>
      ))}

      {/* ---- END marker ---------------------------------------------------- */}
      <circle cx={sx(END.x)} cy={sy(END.y)} r={4.5} className="fill-white stroke-qupu-brand-orange" strokeWidth={2.5} />

      {/* ---- A start marker ------------------------------------------------ */}
      <circle cx={sx(A.x)} cy={sy(A.y)} r={5.5} className="fill-qupu-brand-orange" />
      <text
        x={sx(A.x) - 9}
        y={sy(A.y) + 5}
        textAnchor="end"
        fontSize={14}
        fontWeight={900}
        fill={INK}
      >
        A
      </text>
    </svg>
  )
}

/**
 * Default export: the outbound-only problem figure (A, four arrowed/labelled
 * segments, END point, compass). Reveals nothing about the 26 cm return.
 */
export default function SnailPath23G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Jalur siput pada kisi-kisi: mulai dari titik A, merangkak ke utara 14 cm, ke barat 12 cm, ke timur 29 cm, lalu ke selatan 5 cm, dan berhenti di titik akhir. Panah menunjukkan arah gerak; ada penunjuk arah utara. Berapa cm paling sedikit untuk kembali ke titik A?"
    >
      <SnailPath23G3 />
    </div>
  )
}
