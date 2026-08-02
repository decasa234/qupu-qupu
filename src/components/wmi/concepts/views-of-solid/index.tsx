import { IsoCubes, type IsoCube, type IsoPalette } from '../../PastPapers/WMI/primitives/IsoCubes'
import { GridBoard } from '../../PastPapers/WMI/primitives/GridBoard'

// `views-of-solid` — the question figure: the pile exactly as it stands (or, for
// the numbered-plan ask, the plan exactly as it stands). It never shows which
// flat picture is right; working that out is the whole exercise.
//
// The projection helpers below MIRROR api/services/wmi/concepts/views-of-solid.
// They are exported so the post-answer explainer draws the SAME solid and the
// SAME four option grids from the SAME function — one copy of the geometry, so
// figure, options and answer cannot drift apart. `views-of-solid/index.test.ts`
// re-derives every projection from the generator and asserts the two agree.

// ── Mirrored types ───────────────────────────────────────────────────────────

export const ASKS = ['which-view', 'cubes-per-layer', 'count-blocks'] as const
export type ViewsAsk = (typeof ASKS)[number]

export const VIEWS = ['front', 'side', 'top'] as const
export type ViewDir = (typeof VIEWS)[number]

export const CHOICE_LABELS = ['A', 'B', 'C', 'D'] as const
export const OPTION_COUNT = CHOICE_LABELS.length
export const MAX_HEIGHT = 3

export interface Solid {
  width: number
  depth: number
  heights: number[]
}
export interface Voxel {
  x: number
  y: number
  z: number
}
export interface Frame {
  rows: number
  cols: number
}
export interface Flat extends Frame {
  cells: boolean[]
}

export interface ViewsParams extends Solid {
  ask: ViewsAsk
  view: ViewDir
  layer: number
  answerSlot: number
}

/** Hand-checked pile, mirrored from the generator's fallback. */
export const SAMPLE: ViewsParams = {
  width: 3,
  depth: 2,
  heights: [2, 1, 3, 1, 3, 1],
  ask: 'which-view',
  view: 'front',
  layer: 2,
  answerSlot: 1,
}

// ── Mirrored geometry ────────────────────────────────────────────────────────

export function heightAt(solid: Solid, x: number, y: number): number {
  if (x < 0 || x >= solid.width || y < 0 || y >= solid.depth) return 0
  const h = solid.heights[y * solid.width + x]
  return Number.isFinite(h) ? (h as number) : 0
}

export function solidVoxels(solid: Solid): Voxel[] {
  const cubes: Voxel[] = []
  for (let y = 0; y < solid.depth; y++) {
    for (let x = 0; x < solid.width; x++) {
      for (let z = 0; z < heightAt(solid, x, y); z++) cubes.push({ x, y, z })
    }
  }
  return cubes
}

export function cubeCount(solid: Solid): number {
  let total = 0
  for (let y = 0; y < solid.depth; y++) for (let x = 0; x < solid.width; x++) total += heightAt(solid, x, y)
  return total
}

export function maxHeightOf(solid: Solid): number {
  let max = 0
  for (let y = 0; y < solid.depth; y++) for (let x = 0; x < solid.width; x++) max = Math.max(max, heightAt(solid, x, y))
  return max
}

export function viewFrame(solid: Solid, view: ViewDir): Frame {
  if (view === 'top') return { rows: solid.depth, cols: solid.width }
  return { rows: Math.max(1, maxHeightOf(solid)), cols: view === 'front' ? solid.width : solid.depth }
}

/** front: column = x, row from the bottom = z · side: column = y · top: row from the bottom = y. */
export function projectVoxels(cubes: readonly Voxel[], view: ViewDir, frame: Frame): Flat {
  const cells = new Array<boolean>(frame.rows * frame.cols).fill(false)
  for (const { x, y, z } of cubes) {
    const c = view === 'side' ? y : x
    const up = view === 'top' ? y : z
    const r = frame.rows - 1 - up
    if (r < 0 || r >= frame.rows || c < 0 || c >= frame.cols) continue
    cells[r * frame.cols + c] = true
  }
  return { rows: frame.rows, cols: frame.cols, cells }
}

export function fitsFrame(cubes: readonly Voxel[], view: ViewDir, frame: Frame): boolean {
  for (const { x, y, z } of cubes) {
    const c = view === 'side' ? y : x
    const up = view === 'top' ? y : z
    const r = frame.rows - 1 - up
    if (r < 0 || r >= frame.rows || c < 0 || c >= frame.cols) return false
  }
  return true
}

export function flatKey(flat: Flat): string {
  return `${flat.rows}x${flat.cols}:${flat.cells.map((on) => (on ? '1' : '0')).join('')}`
}

export function columnHeights(flat: Flat): number[] {
  const out: number[] = []
  for (let c = 0; c < flat.cols; c++) {
    let n = 0
    for (let r = 0; r < flat.rows; r++) if (flat.cells[r * flat.cols + c]) n += 1
    out.push(n)
  }
  return out
}

export function distractorFlats(solid: Solid, view: ViewDir, frame: Frame, truth: Flat): Flat[] {
  const truthKey = flatKey(truth)
  const grown: Flat[] = []
  const shrunk: Flat[] = []
  for (let i = 0; i < solid.width * solid.depth; i++) {
    for (const delta of [1, -1]) {
      const heights = solid.heights.slice()
      const next = (Number.isFinite(heights[i]) ? heights[i] : 0) + delta
      if (!Number.isFinite(next) || next < 0 || next > MAX_HEIGHT) continue
      heights[i] = next
      const candidate: Solid = { width: solid.width, depth: solid.depth, heights }
      if (cubeCount(candidate) < 1) continue
      const cubes = solidVoxels(candidate)
      if (!fitsFrame(cubes, view, frame)) continue
      const flat = projectVoxels(cubes, view, frame)
      if (flatKey(flat) === truthKey) continue
      ;(delta > 0 ? grown : shrunk).push(flat)
    }
  }
  const out: Flat[] = []
  const seen = new Set<string>([truthKey])
  for (let i = 0; i < Math.max(grown.length, shrunk.length); i++) {
    for (const flat of [grown[i], shrunk[i]]) {
      if (!flat) continue
      const key = flatKey(flat)
      if (seen.has(key)) continue
      seen.add(key)
      out.push(flat)
    }
  }
  return out
}

/** The four offered pictures, or `null` when this pile cannot offer four. */
export function optionFlats(solid: Solid, view: ViewDir, answerSlot: number): Flat[] | null {
  const frame = viewFrame(solid, view)
  const truth = projectVoxels(solidVoxels(solid), view, frame)
  const wrong = distractorFlats(solid, view, frame, truth)
  if (wrong.length < OPTION_COUNT - 1) return null
  const slot = Math.max(0, Math.min(OPTION_COUNT - 1, answerSlot))
  const out: Flat[] = []
  let w = 0
  for (let i = 0; i < OPTION_COUNT; i++) out.push(i === slot ? truth : wrong[w++])
  return out
}

const intIn = (value: unknown, lo: number, hi: number, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.max(lo, Math.min(hi, Math.round(value)))
}

/**
 * Params arrive as `unknown` from the DB, so everything is re-derived and
 * clamped. A pile that cannot carry the question it claims to ask falls back to
 * the sample wholesale rather than drawing four pictures with two right answers.
 */
export function coerceViewsParams(raw: unknown): ViewsParams {
  const p = (raw ?? {}) as Partial<ViewsParams>
  const width = intIn(p.width, 2, 4, SAMPLE.width)
  const depth = intIn(p.depth, 2, 3, SAMPLE.depth)
  const heights = Array.isArray(p.heights) && p.heights.length === width * depth
    ? p.heights.map((h) => intIn(h, 0, MAX_HEIGHT, 0))
    : null
  if (!heights || heights.reduce((a, b) => a + b, 0) < 1) return SAMPLE

  const solid: Solid = { width, depth, heights }
  const ask = ASKS.includes(p.ask as ViewsAsk) ? (p.ask as ViewsAsk) : SAMPLE.ask
  const view = VIEWS.includes(p.view as ViewDir) ? (p.view as ViewDir) : SAMPLE.view
  const layer = intIn(p.layer, 1, Math.max(1, maxHeightOf(solid)), 1)
  const answerSlot = intIn(p.answerSlot, 0, OPTION_COUNT - 1, 0)

  if (ask === 'which-view' && optionFlats(solid, view, answerSlot) === null) return SAMPLE
  return { width, depth, heights, ask, view, layer, answerSlot }
}

// ── Palette (warm brand, literal hex so the figure reads on any surface) ─────

const INK = '#7A4A25'
const PAPER = '#FFFFFF'
const HAIR = '#D9C7B4'
export const CUBE_LIT = '#FFC24D'
export const CUBE_DIM = '#E7DCCF'
export const VIEW_FILL = '#CFE3F5'
export const VIEW_LIT = '#FFE9BA'

export const SOLID_PALETTE: IsoPalette = {
  top: '#FFDFC2',
  left: '#F2AE7E',
  right: '#D98A52',
  ink: INK,
  strokeWidth: 1.4,
}

// ── Shared figure parts (the explainer draws these very components) ──────────

/** The pile in isometric. `colorOf` tints single cubes; everything else is warm. */
export function SolidFigure({
  solid,
  size = 24,
  colorOf,
}: {
  solid: Solid
  size?: number
  colorOf?: (v: Voxel) => string | undefined
}) {
  const cubes: IsoCube[] = solidVoxels(solid).map((v) => ({ ...v, color: colorOf?.(v) }))
  if (cubes.length === 0) return null
  return <IsoCubes cubes={cubes} size={size} palette={SOLID_PALETTE} viewPadding={10} />
}

/** A small triangle under a top view marking which edge is the front. */
function frontMarker(cx: number, y: number) {
  return <polygon points={`${cx - 6},${y} ${cx + 6},${y} ${cx},${y + 8}`} fill={INK} />
}

export type FlatRing = 'none' | 'ring' | 'amber' | 'green' | 'red'

/** One flat picture drawn on a grid. Wordless — only squares. */
export function FlatFigure({
  flat,
  view,
  cellSize = 18,
  fillOf,
  ringOf,
}: {
  flat: Flat
  view: ViewDir
  cellSize?: number
  fillOf?: (r: number, c: number) => string | undefined
  ringOf?: (r: number, c: number) => FlatRing
}) {
  const markerH = view === 'top' ? 12 : 0
  const w = flat.cols * cellSize
  const h = flat.rows * cellSize
  return (
    <svg
      viewBox={`0 0 ${w} ${h + markerH}`}
      width={w}
      height={h + markerH}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <GridBoard
        rows={flat.rows}
        cols={flat.cols}
        cellSize={cellSize}
        gridStroke={HAIR}
        fill={(r, c) => fillOf?.(r, c) ?? (flat.cells[r * flat.cols + c] ? VIEW_FILL : PAPER)}
        highlight={ringOf}
      />
      {markerH > 0 && frontMarker(w / 2, h + 2)}
    </svg>
  )
}

/** The numbered top view: one stack height written in each floor square. */
export function PlanFigure({
  solid,
  cellSize = 40,
  fillOf,
}: {
  solid: Solid
  cellSize?: number
  fillOf?: (r: number, c: number) => string | undefined
}) {
  const rows = solid.depth
  const cols = solid.width
  const w = cols * cellSize
  const h = rows * cellSize
  return (
    <svg
      viewBox={`0 0 ${w} ${h + 12}`}
      width={w}
      height={h + 12}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <GridBoard
        rows={rows}
        cols={cols}
        cellSize={cellSize}
        gridStroke={HAIR}
        fill={(r, c) => fillOf?.(r, c) ?? PAPER}
        label={(r, c) => String(heightAt(solid, c, rows - 1 - r))}
      />
      {frontMarker(w / 2, h + 2)}
    </svg>
  )
}

/** A labelled option card: the letter above, the flat picture below. */
export function OptionCard({
  label,
  flat,
  view,
  cellSize = 18,
  ringOf,
  muted = false,
}: {
  label: string
  flat: Flat
  view: ViewDir
  cellSize?: number
  ringOf?: (r: number, c: number) => FlatRing
  muted?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1" style={{ opacity: muted ? 0.42 : 1 }}>
      <span className="font-display text-[0.6875rem] font-extrabold" style={{ color: INK }}>
        {label}
      </span>
      <FlatFigure flat={flat} view={view} cellSize={cellSize} ringOf={ringOf} />
    </div>
  )
}

// ── Wordless description for screen readers ─────────────────────────────────

const ROW_NAMES_ID = (depth: number): string[] =>
  depth >= 3 ? ['depan', 'tengah', 'belakang'] : ['depan', 'belakang']

export function describeSolidId(solid: Solid): string {
  const names = ROW_NAMES_ID(solid.depth)
  const rows: string[] = []
  for (let y = 0; y < solid.depth; y++) {
    const row: number[] = []
    for (let x = 0; x < solid.width; x++) row.push(heightAt(solid, x, y))
    rows.push(`baris ${names[y]} ${row.join(', ')}`)
  }
  return rows.join('; ')
}

// ── Question figure ─────────────────────────────────────────────────────────

/**
 * Pure render from params: no random, no dates, SSR-safe. It draws only what the
 * child is given — the pile (or the numbered plan) and, for the picture ask, the
 * four unlabelled-as-right choices.
 */
export default function ViewsOfSolidIllustration({ params }: { params: unknown }) {
  const p = coerceViewsParams(params)
  const solid: Solid = { width: p.width, depth: p.depth, heights: p.heights }
  const stacks = describeSolidId(solid)

  if (p.ask === 'count-blocks') {
    return (
      <div
        className="my-4 flex justify-center"
        role="img"
        aria-label={`Tampak atas sebuah bangun kubus. Angka pada tiap kotak adalah tinggi tumpukan di kotak itu: ${stacks}. Sisi bawah gambar adalah bagian depan.`}
      >
        <PlanFigure solid={solid} />
      </div>
    )
  }

  if (p.ask === 'cubes-per-layer') {
    return (
      <div
        className="my-4 flex justify-center"
        role="img"
        aria-label={`Tumpukan kubus satuan. Tinggi tiap tumpukan dari kiri ke kanan: ${stacks}.`}
      >
        <SolidFigure solid={solid} />
      </div>
    )
  }

  const options = optionFlats(solid, p.view, p.answerSlot) ?? []
  return (
    <div
      className="my-4 flex flex-col items-center gap-4"
      role="img"
      aria-label={`Tumpukan kubus satuan. Tinggi tiap tumpukan dari kiri ke kanan: ${stacks}. Di bawahnya empat gambar datar pilihan berlabel A, B, C, dan D.`}
    >
      <SolidFigure solid={solid} />
      <div className="flex flex-wrap items-end justify-center gap-4">
        {options.map((flat, i) => (
          <OptionCard key={CHOICE_LABELS[i]} label={CHOICE_LABELS[i]} flat={flat} view={p.view} />
        ))}
      </div>
    </div>
  )
}
