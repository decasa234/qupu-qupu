// Block-stacking figure for WMI-24F1A-Q22 (2024 Grade 1 Final). Answer: 8.
//
// Official stem: "Take the blocks in the order of blue → green → white → blue →
// green → white → …  A block can be put on a cube or a cylinder, but it cannot
// be put on a sphere, as shown in the figure below. If the blocks are piled up
// vertically as high as possible, how many blocks are used the most?"
//
// The repeating cycle is by COLOUR, not by shape. (An earlier revision of this
// figure modelled a cube → cylinder → sphere SHAPE cycle and printed a shape-only
// supply "cube ×5, cylinder ×3, sphere ×4" — which loses the whole problem: the
// child chooses the SHAPE freely and is only forced on the COLOUR.)
//
// What the paper prints, and what this figure therefore draws:
//   • three colour groups with their exact contents —
//       blue  : cube, cube, cylinder, sphere
//       green : cube, cube, sphere,   sphere
//       white : cube, cylinder, cylinder, sphere
//     (5 cubes, 3 cylinders and 4 spheres in total, but the totals are NOT the
//      binding data — the per-colour split is)
//   • the colour order strip  blue → green → white → blue → green → white → …
//   • the paper's dotted worked example: a blue cylinder carrying a green cube
//     carrying a white sphere, with the sphere marked "nothing goes on top".
//
// Why the answer is 8 (never drawn here): a sphere ends the tower, so every
// block below the top must be a cube or a cylinder. Each colour's stock of
// non-spheres is blue 3, GREEN 2, white 3. Colour turns run 1 blue, 2 green,
// 3 white, 4 blue, 5 green, 6 white, 7 blue, 8 green … so green's third turn is
// block 8 — and green has only 2 non-spheres, so block 8 must be a green sphere
// and nothing can sit on it. Eight blocks.
//
// The animator drives `stackHeight` on the co-exported BlockStack24G1 primitive
// to build that tower a block at a time; at stackHeight = 0 only the colour
// groups, the order strip and the example render — the pristine question figure.
//
// Pure render, SSR-safe, deterministic — no random / dates / state.
// Wordless by design: illustrations get no `lang` prop, so nothing here is
// captioned in Indonesian or English.

const INK = '#2B2622'
const STOP = '#E8615A' // warm accent for the "nothing sits on a sphere" marker
const FRAME = '#C6BBA6' // dotted frame around the paper's worked example
const ARROW = '#8C8172' // order-strip arrows + trailing ellipsis

type Kind = 'cube' | 'cylinder' | 'sphere'
type Hue = 'blue' | 'green' | 'white'

/** qupu brand hues, each split into front / top / shaded-side faces. */
const FACES: Record<Hue, { face: string; top: string; side: string }> = {
  blue: { face: '#30598A', top: '#3E6EA6', side: '#24446A' },
  green: { face: '#58A700', top: '#6BC30D', side: '#417C00' },
  white: { face: '#FFFDF7', top: '#FFFFFF', side: '#EDE4D4' },
}

// --- block glyphs -----------------------------------------------------------
// Each glyph is drawn centred on `cx` with its BASE sitting on baseline `by`.

const U = 28 // nominal footprint width of one block
const ISO_D = 7 // isometric depth of a cube (extends up-right)
const CUBE_H = 26
const CYL_H = 30
const SPH_R = 13

/** Height each block adds to a tower, so stacks seat base-to-top. */
const RISE: Record<Kind, number> = {
  cube: CUBE_H,
  cylinder: CYL_H,
  sphere: SPH_R * 2,
}

function Cube({ cx, by, hue }: { cx: number; by: number; hue: Hue }) {
  const c = FACES[hue]
  const x = cx - U / 2
  const topY = by - CUBE_H
  const d = ISO_D
  return (
    <g>
      <polygon
        points={`${x},${topY} ${x + U},${topY} ${x + U + d},${topY - d} ${x + d},${topY - d}`}
        fill={c.top}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <polygon
        points={`${x + U},${topY} ${x + U + d},${topY - d} ${x + U + d},${by - d} ${x + U},${by}`}
        fill={c.side}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <rect x={x} y={topY} width={U} height={CUBE_H} fill={c.face} stroke={INK} strokeWidth={1.6} />
    </g>
  )
}

function Cylinder({ cx, by, hue }: { cx: number; by: number; hue: Hue }) {
  const c = FACES[hue]
  const w = U - 4
  const rx = w / 2
  const ry = 5
  const x = cx - rx
  const topY = by - CYL_H + ry
  // One closed path for the whole body INCLUDING the bottom arc, so the crescent
  // under the barrel is filled rather than left white.
  const body =
    `M ${x} ${topY} L ${x} ${by - ry} ` +
    `A ${rx} ${ry} 0 0 0 ${x + w} ${by - ry} ` +
    `L ${x + w} ${topY} Z`
  return (
    <g>
      <path d={body} fill={c.face} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      {/* top face, a shade lighter, reads as the open rim */}
      <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill={c.top} stroke={INK} strokeWidth={1.6} />
    </g>
  )
}

function Sphere({ cx, by, hue }: { cx: number; by: number; hue: Hue }) {
  const c = FACES[hue]
  const cy = by - SPH_R
  return (
    <g>
      <circle cx={cx} cy={cy} r={SPH_R} fill={c.face} stroke={INK} strokeWidth={1.6} />
      <ellipse
        cx={cx - SPH_R * 0.3}
        cy={cy - SPH_R * 0.32}
        rx={SPH_R * 0.36}
        ry={SPH_R * 0.24}
        fill={c.top}
        opacity={0.7}
      />
    </g>
  )
}

/** Render one block of `kind` in `hue`, base on `by`, centred at `cx`. */
function Block({ kind, hue, cx, by }: { kind: Kind; hue: Hue; cx: number; by: number }) {
  if (kind === 'cube') return <Cube cx={cx} by={by} hue={hue} />
  if (kind === 'cylinder') return <Cylinder cx={cx} by={by} hue={hue} />
  return <Sphere cx={cx} by={by} hue={hue} />
}

// --- the question's data ----------------------------------------------------

/** The repeating COLOUR cycle the blocks must be taken in. */
const ORDER: readonly Hue[] = ['blue', 'green', 'white']

/** Exactly what each colour group holds on the paper, in printed order. */
const GROUPS: ReadonlyArray<{ hue: Hue; blocks: readonly Kind[] }> = [
  { hue: 'blue', blocks: ['cube', 'cube', 'cylinder', 'sphere'] },
  { hue: 'green', blocks: ['cube', 'cube', 'sphere', 'sphere'] },
  { hue: 'white', blocks: ['cube', 'cylinder', 'cylinder', 'sphere'] },
]

/**
 * The tallest legal tower, bottom → top. The COLOUR of block i is forced by the
 * cycle (ORDER[i % 3]); the SHAPE is our choice, so we spend non-spheres first
 * and let green — the colour with only two non-spheres — run out on its third
 * turn, block 8, which therefore has to be the sphere cap.
 *   1 blue cube · 2 green cube · 3 white cube · 4 blue cube · 5 green cube
 *   6 white cylinder · 7 blue cylinder · 8 green sphere (cap)
 * Every prefix is itself legal, so the animator's build never re-arranges
 * blocks. Used ONLY by the animator (stackHeight > 0).
 */
const TOWER_SHAPES: readonly Kind[] = [
  'cube',
  'cube',
  'cube',
  'cube',
  'cube',
  'cylinder',
  'cylinder',
  'sphere',
]

function towerSequence(height: number): { kind: Kind; hue: Hue }[] {
  const n = Math.max(0, Math.min(TOWER_SHAPES.length, Math.floor(height)))
  return Array.from({ length: n }, (_, i) => ({
    kind: TOWER_SHAPES[i],
    hue: ORDER[i % ORDER.length],
  }))
}

// --- layout -----------------------------------------------------------------
const VIEW_W = 360

// colour groups (left): 3 rows x 4 blocks
const GROUP_CX = [30, 72, 114, 156]
const GROUP_BY = [44, 90, 136]

// colour order strip (bottom left)
const STRIP_CY = 172
const CHIP = 18
const CHIP_PITCH = 36
const STRIP_X0 = 20

// worked example / animator tower (right)
const EX_FRAME = { x: 250, y: 46, w: 92, h: 114 }
const EX_CX = 296
const EX_BY = 150

const TOWER_CX = 296
const TOWER_BY = 250
const TOWER_SCALE = 0.55

/** A flat colour chip for the order strip. */
function HueChip({ hue, cx, cy }: { hue: Hue; cx: number; cy: number }) {
  return (
    <rect
      x={cx - CHIP / 2}
      y={cy - CHIP / 2}
      width={CHIP}
      height={CHIP}
      rx={4}
      fill={FACES[hue].face}
      stroke={INK}
      strokeWidth={1.6}
    />
  )
}

/** Short right-pointing arrow between order-strip chips. */
function Arrow({ x1, y, x2 }: { x1: number; y: number; x2: number }) {
  const head = 4.5
  return (
    <g>
      <line x1={x1} y1={y} x2={x2 - head} y2={y} stroke={ARROW} strokeWidth={1.8} strokeLinecap="round" />
      <polygon points={`${x2},${y} ${x2 - head},${y - head * 0.7} ${x2 - head},${y + head * 0.7}`} fill={ARROW} />
    </g>
  )
}

/** "Nothing may sit here" marker — a small crossed-out circle. */
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

export interface BlockStack24G1Props {
  /**
   * Number of blocks the animator has placed so far (0 = pristine question
   * figure: the three colour groups, the order strip and the worked example).
   * Above 0 the worked example is replaced by the tower, which grows
   * bottom-to-top as this increases.
   */
  stackHeight?: number
}

/**
 * Primitive board. At stackHeight = 0 it draws the three COLOUR groups with
 * their exact contents, the blue → green → white order strip, and the paper's
 * dotted worked example. When the animator passes stackHeight > 0 the example
 * is swapped for the growing tallest-legal tower. It never labels the count.
 */
export function BlockStack24G1({ stackHeight = 0 }: BlockStack24G1Props) {
  const showTower = stackHeight > 0
  const tower = showTower ? towerSequence(stackHeight) : []

  // Running baseline for the tower, stacking bottom → top.
  let runningBase = TOWER_BY
  const towerNodes = tower.map((b, i) => {
    const node = <Block key={`t-${i}`} kind={b.kind} hue={b.hue} cx={TOWER_CX} by={runningBase} />
    runningBase -= RISE[b.kind] - 2 // −2 so blocks visually seat together
    return node
  })

  const VIEW_H = showTower ? 272 : 196

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ---- the three COLOUR groups and their exact contents (the data!) ---- */}
      {GROUPS.map((group, r) =>
        group.blocks.map((kind, c) => (
          <Block key={`g-${group.hue}-${c}`} kind={kind} hue={group.hue} cx={GROUP_CX[c]} by={GROUP_BY[r]} />
        )),
      )}

      {/* ---- the repeating COLOUR order: blue → green → white → … ---- */}
      {Array.from({ length: 6 }, (_, i) => {
        const cx = STRIP_X0 + CHIP / 2 + i * CHIP_PITCH
        return (
          <g key={`chip-${i}`}>
            <HueChip hue={ORDER[i % ORDER.length]} cx={cx} cy={STRIP_CY} />
            {i < 5 && <Arrow x1={cx + CHIP / 2 + 3} y={STRIP_CY} x2={cx + CHIP_PITCH - CHIP / 2 - 3} />}
          </g>
        )
      })}
      {/* trailing ellipsis = the colour order repeats forever */}
      <text
        x={STRIP_X0 + CHIP + 5 * CHIP_PITCH + 8}
        y={STRIP_CY}
        dominantBaseline="central"
        fontSize={18}
        fontWeight={800}
        fill={ARROW}
      >
        …
      </text>

      {/* ---- the paper's worked example (question state only) ----
          blue cylinder carrying a green cube carrying a white sphere, with the
          sphere marked so the "nothing sits on a sphere" rule is visible. */}
      {!showTower && (
        <g>
          <rect
            x={EX_FRAME.x}
            y={EX_FRAME.y}
            width={EX_FRAME.w}
            height={EX_FRAME.h}
            rx={6}
            fill="none"
            stroke={FRAME}
            strokeWidth={1.8}
            strokeDasharray="3 4"
          />
          {/* seated bottom-up: cylinder top edge carries the cube, whose front-top
              edge carries the sphere (the sphere nestles onto the iso top face) */}
          <Block kind="cylinder" hue="blue" cx={EX_CX} by={EX_BY} />
          <Block kind="cube" hue="green" cx={EX_CX} by={EX_BY - CYL_H} />
          <Block kind="sphere" hue="white" cx={EX_CX} by={EX_BY - CYL_H - CUBE_H} />
          <StopMark cx={EX_CX} cy={EX_BY - CYL_H - CUBE_H - SPH_R * 2 - 7} />
        </g>
      )}

      {/* ---- animator-only growing tower ----
          Scaled about its own base so the full 8-block tower stays in view. */}
      {showTower && (
        <g
          transform={`translate(${TOWER_CX * (1 - TOWER_SCALE)}, ${TOWER_BY * (1 - TOWER_SCALE)}) scale(${TOWER_SCALE})`}
        >
          <line
            x1={TOWER_CX - U / 2 - 8}
            y1={TOWER_BY + 3}
            x2={TOWER_CX + U / 2 + 12}
            y2={TOWER_BY + 3}
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

// Indonesian aria description: the colour groups with their contents, the colour
// order, and the sphere rule. It does NOT state the answer (8).
const ARIA =
  'Tiga kelompok balok menurut warna. Kelompok biru: kubus, kubus, tabung, bola. ' +
  'Kelompok hijau: kubus, kubus, bola, bola. Kelompok putih: kubus, tabung, tabung, bola. ' +
  'Balok diambil berulang dengan urutan warna biru, hijau, putih, biru, hijau, putih, dan seterusnya. ' +
  'Contoh tumpukan: tabung biru di bawah, kubus hijau di tengah, bola putih di atas — ' +
  'tidak ada balok yang boleh diletakkan di atas bola. Tumpuk setinggi mungkin.'

/**
 * Question figure — the colour groups, the colour order strip and the worked
 * example. No tower, no count. Sits in the card, no box.
 */
export default function BlockStack24G1Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <BlockStack24G1 stackHeight={0} />
    </div>
  )
}
