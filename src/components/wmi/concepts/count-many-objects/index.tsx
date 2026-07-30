import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// This module is the SINGLE SOURCE of the count-many-objects picture: the icon
// positions, the glyphs and the param clamps all live here and are exported, so
// the post-answer explainer (src/components/wmi/concepts/explainers/
// countManySteps.ts + CountManyObjectsExplainer.tsx) draws its rings around the
// very same coordinates instead of keeping a second copy that can drift.
// ---------------------------------------------------------------------------

export type IconKind = 'star' | 'apple' | 'ball' | 'leaf' | 'fish'
export type Layout = 'rows' | 'scatter' | 'grouped-tens'

export interface CountManyParams {
  icon: IconKind
  layout: Layout
  total: number
  perRow: number
}

export const ICON_KINDS: readonly IconKind[] = ['star', 'apple', 'ball', 'leaf', 'fish']
export const LAYOUTS: readonly Layout[] = ['rows', 'scatter', 'grouped-tens']

export const SAMPLE: CountManyParams = { icon: 'star', layout: 'rows', total: 34, perRow: 8 }

/** The figure's own clamps — the one place params are coerced onto the board. */
export function normalizeCountManyFigureParams(raw: unknown): CountManyParams {
  const p = (raw ?? {}) as Partial<CountManyParams>
  return {
    icon: ICON_KINDS.includes(p.icon as IconKind) ? (p.icon as IconKind) : SAMPLE.icon,
    layout: LAYOUTS.includes(p.layout as Layout) ? (p.layout as Layout) : SAMPLE.layout,
    total:
      typeof p.total === 'number' && Number.isFinite(p.total)
        ? Math.min(65, Math.max(1, Math.round(p.total)))
        : SAMPLE.total,
    perRow:
      typeof p.perRow === 'number' && Number.isFinite(p.perRow)
        ? Math.min(10, Math.max(3, Math.round(p.perRow)))
        : SAMPLE.perRow,
  }
}

// Warm brand palette — literal hex so the figure reads the same in any surface.
const BLUE = '#30598A'
const ORANGE = '#F0853A'
const GREEN = '#58A700'
const YELLOW = '#E0A000'
const CREAM = '#FAF6EF'

export type Dot = { x: number; y: number }
export type Figure = { dots: Dot[]; r: number; width: number; height: number }

/**
 * Deterministic 32-bit integer hash of two small integers — the only source of
 * "randomness" in this figure. Same params in, same pixels out (SSR-safe).
 */
function hash32(a: number, b: number): number {
  let h = Math.imul(a + 0x9e37, 0x85ebca6b) ^ Math.imul(b + 0x165667, 0xc2b2ae35)
  h ^= h >>> 15
  h = Math.imul(h, 0x27d4eb2f)
  h ^= h >>> 13
  return h >>> 0
}

/** Neat lattice, `perRow` per row, last row left-aligned so it stays skip-countable. */
export function rowsFigure(total: number, perRow: number): Figure {
  const cell = 30
  const pad = 12
  const rows = Math.ceil(total / perRow)
  const dots: Dot[] = []
  for (let i = 0; i < total; i++) {
    const col = i % perRow
    const row = Math.floor(i / perRow)
    dots.push({ x: pad + col * cell + cell / 2, y: pad + row * cell + cell / 2 })
  }
  return {
    dots,
    r: 9,
    width: pad * 2 + perRow * cell,
    height: pad * 2 + rows * cell,
  }
}

/**
 * Lattice columns the scatter layout uses. Widen the lattice when the pile is
 * large so the blob stays card-shaped instead of growing into a tall narrow
 * column. The explainer's rings key off this too.
 */
export function scatterCols(total: number, perRow: number): number {
  return Math.max(perRow, Math.ceil(total / 8))
}

/**
 * Irregular-looking but provably non-overlapping: a staggered lattice with a
 * deterministic per-index jitter (integer hash of `i`, never Math.random).
 * cell 28, jitter ±5, stagger 14, icon radius 8 → the closest two centres can
 * ever come is ~18 > 2r, so nothing collides.
 */
export function scatterFigure(total: number, perRow: number): Figure {
  const cell = 28
  const pad = 14
  const stagger = 14
  const jitter = 5
  const span = jitter * 2 + 1 // 11
  const cols = scatterCols(total, perRow)
  const rows = Math.ceil(total / cols)
  const dots: Dot[] = []
  for (let i = 0; i < total; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const h = Math.abs(Math.imul(i + 1, 2654435761)) % (span * span)
    const jx = (h % span) - jitter
    const jy = (Math.floor(h / span) % span) - jitter
    dots.push({
      x: pad + col * cell + cell / 2 + (row % 2 === 1 ? stagger : 0) + jx,
      y: pad + row * cell + cell / 2 + jy,
    })
  }
  return {
    dots,
    r: 8,
    width: pad * 2 + cols * cell + stagger,
    height: pad * 2 + rows * cell,
  }
}

// --- grouped-tens geometry -------------------------------------------------
// A cluster of ten is a *messy* pile, not a tidy 5x2 basket: up to three icons
// per staggered row, four rows, every row shifted by a hash-picked whole-cell
// offset AND a sub-cell stagger, every icon nudged by a hash-picked jitter. The
// pitch/jitter budget is what keeps the mess safe:
//   in-row and cross-row centres are always >= G_CELL - 2*G_JIT = 16 apart,
//   which beats the icon diameter 2*G_R = 15 — so nothing can ever collide.
// Clusters are told apart by whitespace alone (no drawn basket): neighbouring
// clusters sit >= G_GAP = 68 apart, while the widest gap *inside* a cluster is
// G_CELL + 2*G_JIT = 32 — a 2.1x proximity ratio, so the tens still pop out but
// the child, not the picture, is the one doing the grouping.
const G_CELL = 24
const G_JIT = 4
const G_COLS = 3
const G_STAG = 10
const G_PHASE = 10
const G_GAP = 68
const G_PAD = 14
const G_R = 7.5
const G_BOX_W = (G_COLS - 1) * G_CELL + G_STAG + G_JIT * 2

/** How many rows a pile of `n` uses — never a lonely row of one (unless n === 1). */
function clusterRowCount(n: number): number {
  return Math.max(1, Math.ceil(n / G_COLS))
}

/** Bounding height reserved for a pile of `n`, phase drift included. */
function clusterBoxH(n: number): number {
  return (clusterRowCount(n) - 1) * G_CELL + G_JIT * 2 + G_PHASE
}

/**
 * One casually-scattered pile of `n` icons (n <= 10) with its box top-left at
 * (ox, oy). Row lengths, row offsets, row stagger, the pile's vertical phase and
 * every icon's jitter all come from `hash32(seed, …)`, so the pile looks
 * hand-thrown yet renders identically every time. The phase is what stops the
 * row baselines of neighbouring piles from lining up into visible bands.
 * Stays inside [ox, ox + G_BOX_W] x [oy, oy + clusterBoxH(n)].
 */
function pushCluster(out: Dot[], n: number, seed: number, ox: number, oy: number): void {
  const rowCount = clusterRowCount(n)
  const base = Math.floor(n / rowCount)
  const extra = n % rowCount
  const rot = hash32(seed, 1) % rowCount
  const phase = hash32(seed, 7) % (G_PHASE + 1)
  const span = G_JIT * 2 + 1
  let idx = 0
  for (let r = 0; r < rowCount; r++) {
    // Spread the "+1" rows around so the fat rows are not always on top.
    const len = base + ((r + rot) % rowCount < extra ? 1 : 0)
    const slack = G_COLS - len
    const offCells = slack > 0 ? hash32(seed, 10 + r) % (slack + 1) : 0
    const stagger = hash32(seed, 40 + r) % (G_STAG + 1)
    for (let c = 0; c < len; c++) {
      const h = hash32(seed, 100 + idx)
      const jx = (h % span) - G_JIT
      const jy = (Math.floor(h / span) % span) - G_JIT
      out.push({
        x: ox + G_JIT + (offCells + c) * G_CELL + stagger + jx,
        y: oy + G_JIT + phase + r * G_CELL + jy,
      })
      idx++
    }
    if (idx >= n) break
  }
}

/**
 * Piles of exactly ten, scattered inside each pile but held apart by generous
 * whitespace; the incomplete remainder sits on its own, visibly smaller than a
 * full ten. No dashed basket — spotting the tens is the exercise.
 */
export function groupedTensFigure(total: number): Figure {
  const groups = Math.floor(total / 10)
  const leftover = total % 10
  const boxH = clusterBoxH(10)

  const gridRows = groups > 0 ? Math.ceil(groups / 3) : 0
  const perRow = gridRows > 0 ? Math.ceil(groups / gridRows) : 0
  const gridW = groups > 0 ? perRow * G_BOX_W + (perRow - 1) * G_GAP : 0
  const gridH = gridRows > 0 ? gridRows * boxH + (gridRows - 1) * G_GAP : 0

  const dots: Dot[] = []
  for (let g = 0; g < groups; g++) {
    const row = Math.floor(g / perRow)
    const col = g % perRow
    // Centre a short last row so the pile-of-piles stays balanced.
    const inRow = Math.min(perRow, groups - row * perRow)
    const rowW = inRow * G_BOX_W + (inRow - 1) * G_GAP
    pushCluster(
      dots,
      10,
      (total + 1) * 31 + g,
      G_PAD + (gridW - rowW) / 2 + col * (G_BOX_W + G_GAP),
      G_PAD + row * (boxH + G_GAP),
    )
  }

  // The remainder: same messy style, but short — it reads as the pile that never
  // made it to ten. It always sits apart from the grid with extra breathing room
  // so it is never mistaken for another full group. Normally that means "below";
  // on a narrow two-column grid it goes beside instead, which keeps the whole
  // figure inside three pile-columns rather than growing a very tall card.
  const looseGap = leftover > 0 && groups > 0 ? G_GAP + 24 : 0
  const looseH = leftover > 0 ? clusterBoxH(leftover) : 0
  const looseBeside = leftover > 0 && perRow > 0 && perRow < 3 && gridRows > 1
  const contentW =
    Math.max(gridW, leftover > 0 && !looseBeside ? G_BOX_W : 0) +
    (looseBeside ? looseGap + G_BOX_W : 0)
  if (leftover > 0) {
    pushCluster(
      dots,
      leftover,
      (total + 1) * 31 + groups,
      looseBeside ? G_PAD + gridW + looseGap : G_PAD + (contentW - G_BOX_W) / 2,
      looseBeside ? G_PAD + (gridH - looseH) / 2 : G_PAD + gridH + looseGap,
    )
  }

  return {
    dots,
    r: G_R,
    width: G_PAD * 2 + contentW,
    height: G_PAD * 2 + gridH + (leftover > 0 && !looseBeside ? looseGap + looseH : 0),
  }
}

/** The exact icon positions this figure draws for these params. */
export function countManyFigure(layout: Layout, total: number, perRow: number): Figure {
  if (layout === 'rows') return rowsFigure(total, perRow)
  if (layout === 'scatter') return scatterFigure(total, perRow)
  return groupedTensFigure(total)
}

/** One icon, drawn centred on (0,0) and always inside the circle of radius r. */
export function countManyGlyph(kind: IconKind, r: number): ReactNode {
  const w = Math.max(1, r * 0.15)
  switch (kind) {
    case 'star': {
      const pts: string[] = []
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 === 0 ? r : r * 0.44
        const a = -Math.PI / 2 + (i * Math.PI) / 5
        pts.push(`${(rr * Math.cos(a)).toFixed(2)},${(rr * Math.sin(a)).toFixed(2)}`)
      }
      return (
        <polygon
          points={pts.join(' ')}
          fill={YELLOW}
          stroke={ORANGE}
          strokeWidth={w * 0.6}
          strokeLinejoin="round"
        />
      )
    }
    case 'apple':
      return (
        <>
          <path
            d={`M 0 ${-0.38 * r} C ${-1.0 * r} ${-1.0 * r}, ${-0.95 * r} ${0.95 * r}, 0 ${0.88 * r} C ${0.95 * r} ${0.95 * r}, ${1.0 * r} ${-1.0 * r}, 0 ${-0.38 * r} Z`}
            fill={ORANGE}
          />
          <path
            d={`M 0 ${-0.42 * r} L ${0.1 * r} ${-0.92 * r}`}
            stroke={GREEN}
            strokeWidth={w}
            strokeLinecap="round"
            fill="none"
          />
          <ellipse
            cx={0.4 * r}
            cy={-0.78 * r}
            rx={0.33 * r}
            ry={0.18 * r}
            fill={GREEN}
            transform={`rotate(-25 ${0.4 * r} ${-0.78 * r})`}
          />
        </>
      )
    case 'ball':
      return (
        <>
          <circle cx={0} cy={0} r={0.92 * r} fill={BLUE} />
          <ellipse
            cx={0}
            cy={0}
            rx={0.34 * r}
            ry={0.9 * r}
            fill="none"
            stroke={CREAM}
            strokeWidth={w}
          />
          <path
            d={`M ${-0.9 * r} 0 L ${0.9 * r} 0`}
            stroke={CREAM}
            strokeWidth={w}
            strokeLinecap="round"
          />
        </>
      )
    case 'leaf':
      return (
        <>
          <path
            d={`M 0 ${-0.95 * r} C ${0.85 * r} ${-0.35 * r}, ${0.6 * r} ${0.75 * r}, 0 ${0.95 * r} C ${-0.6 * r} ${0.75 * r}, ${-0.85 * r} ${-0.35 * r}, 0 ${-0.95 * r} Z`}
            fill={GREEN}
          />
          <path
            d={`M 0 ${-0.78 * r} L 0 ${0.85 * r}`}
            stroke={CREAM}
            strokeWidth={w}
            strokeLinecap="round"
          />
        </>
      )
    case 'fish':
      return (
        <>
          <polygon
            points={`${0.4 * r},0 ${0.95 * r},${-0.5 * r} ${0.95 * r},${0.5 * r}`}
            fill={ORANGE}
          />
          <ellipse cx={-0.18 * r} cy={0} rx={0.7 * r} ry={0.46 * r} fill={BLUE} />
          <circle cx={-0.5 * r} cy={-0.12 * r} r={0.14 * r} fill={CREAM} />
        </>
      )
  }
}

const ICON_NOUN_ID: Record<IconKind, string> = {
  star: 'bintang',
  apple: 'apel',
  ball: 'bola',
  leaf: 'daun',
  fish: 'ikan',
}

/**
 * Aria policy for this figure: describe what is pictured richly enough that a
 * screen-reader user can attempt the question — but never state a value that IS
 * the answer. The answer here is the TOTAL, so the label names the object and
 * the arrangement only: never the total, never how many sit in a group, never
 * how many groups there are. (No digits appear at all.)
 *
 * The one param-dependent clause is whether a loose pile exists in
 * 'grouped-tens' — that is a plain feature of the picture every sighted child
 * can see, and it is not a count.
 */
export function countManyAriaLabel(icon: IconKind, layout: Layout, total: number): string {
  const noun = ICON_NOUN_ID[icon]
  if (layout === 'rows') {
    return `Banyak ${noun} tersusun rapi dalam baris-baris yang sama panjang — hitung semuanya.`
  }
  if (layout === 'scatter') {
    return `Banyak ${noun} tersebar tidak beraturan — hitung semuanya.`
  }
  const loose = total % 10 > 0 ? ', dan ada juga yang menumpuk sendiri di luar tumpukan' : ''
  return `Banyak ${noun} terkumpul menjadi beberapa tumpukan yang letaknya berjauhan${loose} — hitung semuanya.`
}

/**
 * count-many-objects — question figure.
 *
 * Draws `total` (15–65) icons in one of three layouts. It shows ONLY the pile;
 * it never prints the total or hints which option is right. Every position is
 * computed arithmetically from the params (staggered lattice + integer-hash
 * jitter for 'scatter' and 'grouped-tens'), so the render is pure, SSR-safe and
 * never overlaps. 'grouped-tens' draws no basket around each ten — the piles are
 * separated by whitespace only, because spotting the tens is the exercise.
 * Falls back to a sample when params arrive with the wrong shape.
 *
 * The geometry, the glyphs and the clamps are exported above; the post-answer
 * explainer imports them so its rings hug these exact icons.
 */
export default function CountManyObjectsIllustration({ params }: { params: unknown }) {
  const { icon, layout, total, perRow } = normalizeCountManyFigureParams(params)
  const fig = countManyFigure(layout, total, perRow)

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={countManyAriaLabel(icon, layout, total)}
    >
      <svg
        viewBox={`0 0 ${fig.width} ${fig.height}`}
        width={Math.min(320, fig.width)}
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {fig.dots.map((dot, i) => (
          <g key={`icon-${i}`} transform={`translate(${dot.x.toFixed(2)} ${dot.y.toFixed(2)})`}>
            {countManyGlyph(icon, fig.r)}
          </g>
        ))}
      </svg>
    </div>
  )
}
