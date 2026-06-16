// Stacked-cube counting figure for WMI-25P2A-Q2 (2025 Grade-2 Semifinal).
//
// "How many cubes are there in total?"  Answer: B = 20.
//
// The seed records: total 20, the trap is 16 (counting only the cubes you can
// clearly see), and the strategy is "count layer by layer, include the hidden
// cubes behind and under the stack." The small source thumbnail is a generic
// cube-icon placeholder, so the honest reconstruction is the unique tidy solid
// that satisfies every recorded fact:
//
//   a 5 (wide) × 2 (high) × 2 (deep) rectangular block = 20 unit cubes.
//
// From the standard isometric viewpoint (front + top + right side visible) this
// block shows exactly 16 cubes on its shell and hides exactly 4 — the bottom-
// back row at columns 0..3 (each occluded by the cube to its right, above, and
// in front). Verified by occupancy analysis:
//   total = 20, visible = 16, hidden = 4.
// That is precisely the answer (20), the trap (16), and the "4 hidden" story.
//
// The static figure draws ONLY the assembled solid. It NEVER prints the count
// and NEVER exposes the hidden cubes — that is the explainer's job. The
// co-exported IsoCubeSolid primitive lets the explainer peel the front shell to
// reveal the 4 hidden cubes and run the layer-by-layer tally.
//
// Pure render, SSR-safe, deterministic — no random / dates / window / state.

const INK = '#5B2A2A' // dark brown outline (matches the source figure)
const FACE = '#F4B9B9' // front face (salmon pink)
const FACE_TOP = '#F9D2D2' // top face (lighter)
const FACE_SIDE = '#E59B9B' // right face (darker)
const HIDE = '#C9D8E8' // pale blue tint for a revealed hidden cube
const HIDE_TOP = '#DDE8F2'
const HIDE_SIDE = '#AFC4DA'

// Solid dimensions.
export const COLS = 5 // x: left → right
export const ROWS = 2 // y: bottom → top
export const DEPTH = 2 // z: front(0) → back(1)
export const TOTAL_CUBES = COLS * ROWS * DEPTH // 20
export const HIDDEN_CUBES = COLS - 1 // 4 (bottom-back cubes at cols 0..3)
export const VISIBLE_CUBES = TOTAL_CUBES - HIDDEN_CUBES // 16

// ── isometric projection ─────────────────────────────────────────────────────
// Screen = origin + gx*RIGHT + gy*UP + gz*BACK, where BACK pushes a cube up-right
// (away from the viewer). So gz = 0 is the FRONT layer (nearest the viewer) and
// gz = DEPTH-1 is the BACK layer. The 4 hidden cubes are the BACK-bottom row at
// columns 0..3: each has a cube in front of it (gz-1), above it (gy+1) and to its
// right (gx+1), so none of its viewer-facing faces show. Drawing order: far cubes
// first, near cubes last.
const S = 38 // cube edge (front face) in px
const DZ = 20 // per-depth screen offset (the iso "back" vector)
const VIEW_W = 360
const VIEW_H = 240
const ORIGIN_X = 70 // screen x of the front-bottom-left corner of cube (0,0,0)
const ORIGIN_Y = 196 // screen y of that corner

function project(gx: number, gy: number, gz: number): { x: number; y: number } {
  return {
    x: ORIGIN_X + gx * S + gz * DZ,
    y: ORIGIN_Y - gy * S - gz * DZ,
  }
}

/** One isometric unit cube whose front-bottom-left corner sits at grid (gx,gy,gz). */
export function IsoCube({
  gx,
  gy,
  gz,
  hidden = false,
}: {
  gx: number
  gy: number
  gz: number
  hidden?: boolean
}) {
  const p = project(gx, gy, gz)
  const front = FACE
  const top = hidden ? HIDE_TOP : FACE_TOP
  const side = hidden ? HIDE_SIDE : FACE_SIDE
  const face = hidden ? HIDE : front

  // front face corners (a square of side S, top-left at (p.x, p.y - S))
  const fx = p.x
  const fyTop = p.y - S
  return (
    <g>
      {/* top face: front-top edge pushed back by (DZ, -DZ) */}
      <polygon
        points={`${fx},${fyTop} ${fx + S},${fyTop} ${fx + S + DZ},${fyTop - DZ} ${fx + DZ},${fyTop - DZ}`}
        fill={top}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* right face: right edge of front pushed back */}
      <polygon
        points={`${fx + S},${fyTop} ${fx + S},${fyTop + S} ${fx + S + DZ},${fyTop + S - DZ} ${fx + S + DZ},${fyTop - DZ}`}
        fill={side}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* front face */}
      <rect x={fx} y={fyTop} width={S} height={S} fill={face} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
    </g>
  )
}

export interface IsoCubeSolidProps {
  /** When true, the front shell is drawn translucent and the 4 hidden cubes show through. */
  revealHidden?: boolean
  /** 0 = none; 1..ROWS highlights that many layers (bottom-up) with a halo. */
  countLayers?: number
}

/**
 * The 5×2×2 solid. By default it is a clean opaque block (the question figure).
 * `revealHidden` peels the near shell so the bottom-back hidden cubes are seen;
 * `countLayers` puts a soft outline around the bottom `n` height-layers so the
 * explainer can tally layer by layer.
 */
export function IsoCubeSolid({ revealHidden = false, countLayers = 0 }: IsoCubeSolidProps) {
  // Enumerate every cube, sorted far → near so nearer cubes paint over farther.
  // "far" = larger gz (back) and larger gy (higher) drawn before, larger gx later.
  const cubes: Array<{ gx: number; gy: number; gz: number; hidden: boolean }> = []
  for (let gz = DEPTH - 1; gz >= 0; gz--) {
    for (let gy = ROWS - 1; gy >= 0; gy--) {
      for (let gx = 0; gx < COLS; gx++) {
        const hidden = gz === DEPTH - 1 && gy === 0 && gx < COLS - 1
        cubes.push({ gx, gy, gz, hidden })
      }
    }
  }
  // Painter's order: back-top first … front-bottom last. Sort by (gz desc, gy desc, gx asc)
  cubes.sort((a, b) => b.gz - a.gz || b.gy - a.gy || a.gx - b.gx)

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* layer-counting halo behind the bottom n layers */}
      {countLayers > 0 &&
        Array.from({ length: Math.min(countLayers, ROWS) }).map((_, layer) => {
          const corner = project(0, layer, 0)
          const far = project(COLS, layer + 1, DEPTH)
          return (
            <rect
              key={`halo${layer}`}
              x={corner.x - 6}
              y={far.y - 6}
              width={far.x - corner.x + 12}
              height={corner.y - far.y + 12}
              fill="#FEF3C7"
              opacity={0.5}
              rx={8}
            />
          )
        })}

      {cubes.map(({ gx, gy, gz, hidden }) => {
        // In reveal mode, the back-bottom hidden cubes glow blue and the entire
        // FRONT layer (gz = 0) is drawn translucent so they read through it.
        if (revealHidden && hidden) {
          return <IsoCube key={`h${gx}-${gy}-${gz}`} gx={gx} gy={gy} gz={gz} hidden />
        }
        if (revealHidden && gz === 0) {
          return (
            <g key={`t${gx}-${gy}-${gz}`} opacity={0.3}>
              <IsoCube gx={gx} gy={gy} gz={gz} />
            </g>
          )
        }
        return <IsoCube key={`c${gx}-${gy}-${gz}`} gx={gx} gy={gy} gz={gz} hidden={hidden} />
      })}
    </svg>
  )
}

const ARIA =
  'Sebuah bangun padat tersusun dari kubus-kubus satuan yang sama besar, ' +
  'digambar secara isometrik. Berapa banyak kubus seluruhnya?'

export default function P25G2Q2Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <IsoCubeSolid />
    </div>
  )
}
