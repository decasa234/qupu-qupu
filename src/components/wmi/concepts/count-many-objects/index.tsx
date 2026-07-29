import type { ReactNode } from 'react'

type IconKind = 'star' | 'apple' | 'ball' | 'leaf' | 'fish'
type Layout = 'rows' | 'scatter' | 'grouped-tens'

interface CountManyParams {
  icon: IconKind
  layout: Layout
  total: number
  perRow: number
}

const ICON_KINDS: readonly IconKind[] = ['star', 'apple', 'ball', 'leaf', 'fish']
const LAYOUTS: readonly Layout[] = ['rows', 'scatter', 'grouped-tens']

const SAMPLE: CountManyParams = { icon: 'star', layout: 'rows', total: 34, perRow: 8 }

// Warm brand palette — literal hex so the figure reads the same in any surface.
const BLUE = '#30598A'
const ORANGE = '#F0853A'
const GREEN = '#58A700'
const YELLOW = '#E0A000'
const CREAM = '#FAF6EF'

type Dot = { x: number; y: number }
type Ring = { x: number; y: number; w: number; h: number }
type Figure = { dots: Dot[]; rings: Ring[]; r: number; width: number; height: number }

/** Neat lattice, `perRow` per row, last row left-aligned so it stays skip-countable. */
function rowsFigure(total: number, perRow: number): Figure {
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
    rings: [],
    r: 9,
    width: pad * 2 + perRow * cell,
    height: pad * 2 + rows * cell,
  }
}

/**
 * Irregular-looking but provably non-overlapping: a staggered lattice with a
 * deterministic per-index jitter (integer hash of `i`, never Math.random).
 * cell 28, jitter ±5, stagger 14, icon radius 8 → the closest two centres can
 * ever come is ~18 > 2r, so nothing collides.
 */
function scatterFigure(total: number, perRow: number): Figure {
  const cell = 28
  const pad = 14
  const stagger = 14
  const jitter = 5
  const span = jitter * 2 + 1 // 11
  // Widen the lattice when the pile is large so the blob stays card-shaped
  // instead of growing into a tall narrow column.
  const cols = Math.max(perRow, Math.ceil(total / 8))
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
    rings: [],
    r: 8,
    width: pad * 2 + cols * cell + stagger,
    height: pad * 2 + rows * cell,
  }
}

/** Clusters of exactly ten (5 x 2 inside a dashed basket), leftovers loose below. */
function groupedTensFigure(total: number): Figure {
  const cell = 22
  const boxPad = 9
  const gap = 12
  const pad = 12
  const groups = Math.floor(total / 10)
  const leftover = total % 10
  const boxW = boxPad * 2 + 5 * cell
  const boxH = boxPad * 2 + 2 * cell
  const perBoxRow = Math.min(2, Math.max(1, groups))
  const boxRows = groups > 0 ? Math.ceil(groups / perBoxRow) : 0
  const gridW = groups > 0 ? perBoxRow * boxW + (perBoxRow - 1) * gap : 0
  const gridH = boxRows > 0 ? boxRows * boxH + (boxRows - 1) * gap : 0

  const dots: Dot[] = []
  const rings: Ring[] = []
  for (let g = 0; g < groups; g++) {
    const col = g % perBoxRow
    const row = Math.floor(g / perBoxRow)
    const bx = pad + col * (boxW + gap)
    const by = pad + row * (boxH + gap)
    rings.push({ x: bx, y: by, w: boxW, h: boxH })
    for (let j = 0; j < 10; j++) {
      dots.push({
        x: bx + boxPad + (j % 5) * cell + cell / 2,
        y: by + boxPad + Math.floor(j / 5) * cell + cell / 2,
      })
    }
  }

  const looseGap = groups > 0 ? 16 : 0
  const looseY = pad + gridH + looseGap
  for (let k = 0; k < leftover; k++) {
    dots.push({ x: pad + boxPad + k * cell + cell / 2, y: looseY + cell / 2 })
  }
  const looseW = leftover > 0 ? boxPad * 2 + leftover * cell : 0

  return {
    dots,
    rings,
    r: 8,
    width: pad * 2 + Math.max(gridW, looseW),
    height: pad * 2 + gridH + (leftover > 0 ? looseGap + cell : 0),
  }
}

/** One icon, drawn centred on (0,0) and always inside the circle of radius r. */
function glyph(kind: IconKind, r: number): ReactNode {
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

const ARIA: Record<Layout, string> = {
  rows: 'Sekumpulan benda yang disusun rapi dalam baris yang sama panjang — hitung semuanya.',
  'grouped-tens':
    'Sekumpulan benda yang dikelompokkan sepuluh-sepuluh di dalam keranjang, sisanya di luar — hitung semuanya.',
  scatter: 'Sekumpulan benda yang tersebar tidak beraturan — hitung semuanya.',
}

/**
 * count-many-objects — question figure.
 *
 * Draws `total` (15–65) icons in one of three layouts. It shows ONLY the pile;
 * it never prints the total or hints which option is right. Every position is
 * computed arithmetically from the params (staggered lattice + integer-hash
 * jitter for 'scatter'), so the render is pure, SSR-safe and never overlaps.
 * Falls back to a sample when params arrive with the wrong shape.
 */
export default function CountManyObjectsIllustration({ params }: { params: unknown }) {
  const p = (params ?? {}) as Partial<CountManyParams>
  const icon = ICON_KINDS.includes(p.icon as IconKind) ? (p.icon as IconKind) : SAMPLE.icon
  const layout = LAYOUTS.includes(p.layout as Layout) ? (p.layout as Layout) : SAMPLE.layout
  const total =
    typeof p.total === 'number' && Number.isFinite(p.total)
      ? Math.min(65, Math.max(1, Math.round(p.total)))
      : SAMPLE.total
  const perRow =
    typeof p.perRow === 'number' && Number.isFinite(p.perRow)
      ? Math.min(10, Math.max(3, Math.round(p.perRow)))
      : SAMPLE.perRow

  const fig =
    layout === 'rows'
      ? rowsFigure(total, perRow)
      : layout === 'scatter'
        ? scatterFigure(total, perRow)
        : groupedTensFigure(total)

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA[layout]}>
      <svg
        viewBox={`0 0 ${fig.width} ${fig.height}`}
        width={Math.min(320, fig.width)}
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {fig.rings.map((ring, i) => (
          <rect
            key={`ring-${i}`}
            x={ring.x}
            y={ring.y}
            width={ring.w}
            height={ring.h}
            rx={14}
            fill={CREAM}
            stroke={BLUE}
            strokeWidth={2}
            strokeDasharray="7 5"
          />
        ))}
        {fig.dots.map((dot, i) => (
          <g key={`icon-${i}`} transform={`translate(${dot.x.toFixed(2)} ${dot.y.toFixed(2)})`}>
            {glyph(icon, fig.r)}
          </g>
        ))}
      </svg>
    </div>
  )
}
