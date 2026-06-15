// Block-stacking figure for WMI-24F1A-Q22 (2024 Grade 1 Final).
//
// "Stack blocks in the repeating order cube, cylinder, sphere, cube, cylinder,
//  sphere, … A block may be placed on top of a cube or a cylinder, but NOT on
//  top of a sphere. Stacking as high as possible, at most how many blocks are
//  used?"  Answer: 8 (fill-in).
//
// The static question figure shows ONLY the setup the learner is given:
//   1. the three labelled block TYPES — cube, cylinder, sphere (one row), and
//   2. the repeating ORDER rule as a left-to-right legend:
//          cube → cylinder → sphere → cube → cylinder → sphere → …
//      with the sphere marked "stop" (nothing sits on a sphere).
// It NEVER draws the final tower and NEVER reveals the count (8) — that is the
// animator's job, post-answer, via the co-exported BlockStack24G1 primitive.
//
// The animator builds the tower one block at a time by passing `stackHeight`
// to BlockStack24G1; at the default (stackHeight = 0) only the type row + the
// order legend render, i.e. the pristine question figure.
//
// Pure render, SSR-safe, deterministic — no random / dates / state.
// House-style reference: ShapeAdd24G1Illustration (the 2024 G1 sibling).

const INK = '#1F2937'
// qupu palette mirrored as raw hex for the SVG fills (tokens preferred in
// class-styled figures; this figure is fully hand-drawn so raw hex is allowed).
const BLUE = '#2C9CDB' // qupu-brand-blue family — cube faces
const BLUE_DK = '#1F7FB8' // shaded cube side
const GREEN = '#9ACA3C' // qupu-brand-green family — cylinder body
const GREEN_DK = '#7FAE2C' // shaded cylinder side
const CREAM = '#FBF6EC' // qupu-cream — sphere highlight
const SPHERE = '#E7EDF1' // pale sphere body (the "cap" block)
const SPHERE_DK = '#CBD7DF'
const STOP = '#E8615A' // warm accent for the "stop on sphere" marker

// --- block glyphs -----------------------------------------------------------
// Each glyph is drawn centred on (cx) with its BASE sitting on baseline `by`.
// Footprint width ~ UNIT; heights chosen so a stack reads cleanly.

const UNIT = 46 // nominal footprint of one block
const CUBE_H = 40
const CYL_H = 46
const SPH_R = 22

/** Simple isometric cube centred at cx with its base on `by`. */
function Cube({ cx, by }: { cx: number; by: number }) {
  const w = UNIT
  const d = 12 // iso depth
  const x = cx - w / 2
  const topY = by - CUBE_H
  return (
    <g>
      {/* top face */}
      <polygon
        points={`${x},${topY} ${x + w},${topY} ${x + w + d},${topY - d} ${x + d},${topY - d}`}
        fill={BLUE}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* right (shaded) face */}
      <polygon
        points={`${x + w},${topY} ${x + w + d},${topY - d} ${x + w + d},${by - d} ${x + w},${by}`}
        fill={BLUE_DK}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* front face */}
      <rect x={x} y={topY} width={w} height={CUBE_H} fill={BLUE} stroke={INK} strokeWidth={2} />
    </g>
  )
}

/** Upright cylinder centred at cx with its base on `by`. */
function Cylinder({ cx, by }: { cx: number; by: number }) {
  const w = UNIT - 6
  const rx = w / 2
  const ry = 7
  const x = cx - rx
  const topY = by - CYL_H + ry
  return (
    <g>
      {/* body */}
      <rect x={x} y={topY} width={w} height={CYL_H - ry * 2} fill={GREEN} stroke="none" />
      <line x1={x} y1={topY} x2={x} y2={by - ry} stroke={INK} strokeWidth={2} />
      <line x1={x + w} y1={topY} x2={x + w} y2={by - ry} stroke={INK} strokeWidth={2} />
      {/* shaded sliver on the right for a touch of volume */}
      <rect x={x + w - 7} y={topY} width={7} height={CYL_H - ry * 2} fill={GREEN_DK} stroke="none" />
      {/* bottom ellipse (front arc) */}
      <path
        d={`M ${x} ${by - ry} A ${rx} ${ry} 0 0 0 ${x + w} ${by - ry}`}
        fill="none"
        stroke={INK}
        strokeWidth={2}
      />
      {/* top ellipse */}
      <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill={GREEN} stroke={INK} strokeWidth={2} />
    </g>
  )
}

/** Sphere centred at cx with its base on `by`. */
function Sphere({ cx, by }: { cx: number; by: number }) {
  const cy = by - SPH_R
  return (
    <g>
      <circle cx={cx} cy={cy} r={SPH_R} fill={SPHERE} stroke={INK} strokeWidth={2} />
      {/* simple specular highlight */}
      <ellipse cx={cx - SPH_R * 0.32} cy={cy - SPH_R * 0.34} rx={SPH_R * 0.4} ry={SPH_R * 0.28} fill={CREAM} opacity={0.85} />
      {/* faint bottom shading */}
      <path
        d={`M ${cx - SPH_R * 0.86} ${cy + SPH_R * 0.46} A ${SPH_R} ${SPH_R} 0 0 0 ${cx + SPH_R * 0.86} ${cy + SPH_R * 0.46}`}
        fill="none"
        stroke={SPHERE_DK}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  )
}

type Kind = 'cube' | 'cylinder' | 'sphere'

/** Render one block of `kind`, base on `by`, centred at `cx`. */
function Block({ kind, cx, by }: { kind: Kind; cx: number; by: number }) {
  if (kind === 'cube') return <Cube cx={cx} by={by} />
  if (kind === 'cylinder') return <Cylinder cx={cx} by={by} />
  return <Sphere cx={cx} by={by} />
}

/** Stack height each block adds (so towers line up base-to-top). */
const BLOCK_RISE: Record<Kind, number> = {
  cube: CUBE_H,
  cylinder: CYL_H,
  sphere: SPH_R * 2,
}

// The repeating supply order. The animator's tower draws from this cycle.
const ORDER: Kind[] = ['cube', 'cylinder', 'sphere']
const LABEL_ID: Record<Kind, string> = {
  cube: 'kubus',
  cylinder: 'tabung',
  sphere: 'bola',
}

// --- layout -----------------------------------------------------------------
const VIEW_W = 320

/**
 * Build the legal "as-high-as-possible" tower sequence, bottom → top, for a
 * given visible height. The tower alternates cube / cylinder (both can carry a
 * block) and may be capped by a single sphere — a sphere never carries another
 * block, so it only ever appears as the final top piece. This is used ONLY by
 * the animator (stackHeight > 0); it is never rendered in the question figure.
 */
function towerSequence(height: number): Kind[] {
  const seq: Kind[] = []
  for (let i = 0; i < height; i++) {
    // last block may be a sphere cap; everything below alternates cube/cylinder
    if (i === height - 1 && height % 2 === 1 && height > 1) {
      seq.push('sphere')
    } else {
      seq.push(i % 2 === 0 ? 'cube' : 'cylinder')
    }
  }
  return seq
}

export interface BlockStack24G1Props {
  /**
   * Number of blocks the animator has placed in the tower so far (0 = pristine
   * question figure: just the three labelled types + the order legend).
   * The tower grows bottom-to-top as this increases.
   */
  stackHeight?: number
}

/**
 * Primitive board. At stackHeight = 0 it draws the three block TYPES in a row
 * plus the repeating-order legend (the question setup). When the animator
 * passes stackHeight > 0 it additionally draws the growing tower on the right,
 * one block at a time, so the build-up of the tallest legal stack can be shown
 * post-answer. It never labels the final count.
 */
export function BlockStack24G1({ stackHeight = 0 }: BlockStack24G1Props) {
  const showTower = stackHeight > 0
  const tower = showTower ? towerSequence(stackHeight) : []

  // --- top row: the three labelled block types --------------------------------
  const typeBy = 58 // baseline for the type-row glyphs
  const typeCx = [60, 160, 260]

  // --- legend row: cube → cylinder → sphere → … with the stop marker ---------
  const legendY = 118
  const chipW = 30
  const chipGap = 16
  // six chips: C Y S C Y S, then an ellipsis
  const legendKinds: Kind[] = [...ORDER, ...ORDER]
  const legendStartX = 18

  // --- optional tower (animator only) ----------------------------------------
  // Drawn to the right of the legend so it never overlaps the static setup.
  const towerCx = VIEW_W - 46
  const towerBaseline = 250

  // running baseline for tower stacking
  let runningBase = towerBaseline
  const towerNodes = tower.map((kind, i) => {
    const node = (
      <Block key={`t-${i}`} kind={kind} cx={towerCx} by={runningBase} />
    )
    runningBase -= BLOCK_RISE[kind] - 4 // -4 so blocks visually seat together
    return node
  })

  const VIEW_H = showTower ? 270 : 150

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ---- three labelled block types ---- */}
      {ORDER.map((kind, i) => (
        <g key={`type-${kind}`}>
          <Block kind={kind} cx={typeCx[i]} by={typeBy} />
          <text
            x={typeCx[i]}
            y={typeBy + 20}
            textAnchor="middle"
            fontSize={14}
            fontWeight={700}
            fill={INK}
          >
            {LABEL_ID[kind]}
          </text>
        </g>
      ))}

      {/* ---- repeating-order legend ---- */}
      {legendKinds.map((kind, i) => {
        const x = legendStartX + i * (chipW + chipGap)
        const cx = x + chipW / 2
        const cy = legendY
        return (
          <g key={`leg-${i}`}>
            {/* tiny chip glyph for the kind */}
            <LegendChip kind={kind} cx={cx} cy={cy} size={chipW / 2} />
            {/* arrow to the next chip */}
            {i < legendKinds.length - 1 && (
              <Arrow x1={x + chipW + 2} y={cy} x2={x + chipW + chipGap - 2} />
            )}
            {/* a small "stop" mark over each sphere = nothing stacks on it */}
            {kind === 'sphere' && <StopMark cx={cx} cy={cy - chipW / 2 - 7} />}
          </g>
        )
      })}
      {/* trailing ellipsis = the order repeats forever */}
      <text
        x={legendStartX + legendKinds.length * (chipW + chipGap)}
        y={legendY + 5}
        fontSize={18}
        fontWeight={800}
        fill={INK}
      >
        …
      </text>

      {/* ---- animator-only growing tower ---- */}
      {showTower && (
        <g>
          {/* faint ground line under the tower */}
          <line
            x1={towerCx - UNIT / 2 - 6}
            y1={towerBaseline + 2}
            x2={towerCx + UNIT / 2 + 10}
            y2={towerBaseline + 2}
            stroke={INK}
            strokeWidth={2}
            opacity={0.35}
          />
          {towerNodes}
        </g>
      )}
    </svg>
  )
}

/** A miniature chip showing a block kind for the order legend. */
function LegendChip({ kind, cx, cy, size }: { kind: Kind; cx: number; cy: number; size: number }) {
  if (kind === 'cube') {
    return (
      <rect
        x={cx - size}
        y={cy - size}
        width={size * 2}
        height={size * 2}
        rx={3}
        fill={BLUE}
        stroke={INK}
        strokeWidth={2}
      />
    )
  }
  if (kind === 'cylinder') {
    return (
      <g>
        <rect
          x={cx - size * 0.8}
          y={cy - size + 3}
          width={size * 1.6}
          height={size * 2 - 6}
          fill={GREEN}
          stroke={INK}
          strokeWidth={2}
        />
        <ellipse cx={cx} cy={cy - size + 3} rx={size * 0.8} ry={3} fill={GREEN} stroke={INK} strokeWidth={2} />
        <ellipse cx={cx} cy={cy + size - 3} rx={size * 0.8} ry={3} fill={GREEN_DK} stroke={INK} strokeWidth={2} />
      </g>
    )
  }
  return <circle cx={cx} cy={cy} r={size} fill={SPHERE} stroke={INK} strokeWidth={2} />
}

/** Short right-pointing arrow between legend chips. */
function Arrow({ x1, y, x2 }: { x1: number; y: number; x2: number }) {
  const head = 5
  return (
    <g>
      <line x1={x1} y1={y} x2={x2 - head} y2={y} stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <polygon
        points={`${x2},${y} ${x2 - head},${y - head * 0.7} ${x2 - head},${y + head * 0.7}`}
        fill={INK}
      />
    </g>
  )
}

/** A small no-stacking marker placed above a sphere in the legend. */
function StopMark({ cx, cy }: { cx: number; cy: number }) {
  const r = 6
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={STOP} strokeWidth={2} />
      <line
        x1={cx - r * 0.7}
        y1={cy + r * 0.7}
        x2={cx + r * 0.7}
        y2={cy - r * 0.7}
        stroke={STOP}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  )
}

// Indonesian aria description: names the three types + the repeating order +
// the sphere stop-rule. It does NOT state the answer (8).
const ARIA =
  'Tiga jenis balok: kubus, tabung, dan bola. ' +
  'Balok disusun berulang dengan urutan kubus, tabung, bola, kubus, tabung, bola, dan seterusnya. ' +
  'Sebuah balok boleh diletakkan di atas kubus atau tabung, tetapi tidak boleh di atas bola. ' +
  'Tumpuk setinggi mungkin: paling banyak berapa balok yang dipakai?'

/**
 * Question figure — the three block types + the repeating-order rule, no tower,
 * no count. Sits in the card, no box.
 */
export default function BlockStack24G1Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <BlockStack24G1 stackHeight={0} />
    </div>
  )
}
