import { RectPartition, type RectPartitionEdgeLabel, type RectPartitionPiece } from '../../PastPapers/WMI/primitives/RectPartition'

// In-card figure for `rectangle-area-decompose`. The stem states the rule; this
// picture carries the evidence — which pieces print their area, which parts of
// the top and left edges print their length, and which value is missing. That
// split is how the WMI papers this concept is mined from present it.
//
// It must NEVER print a value the question asks for: the missing area shows as
// "?", the missing length shows as "?" on its rail, and the aria-label speaks
// only what is printed.
//
// The rails matter as much as the numbers. Ticks at every cut turn the top edge
// and the left edge into named parts ("the second part of the top edge"), which
// is the vocabulary the hints and the animation both use — and the reason a
// length with no printed number is still a thing a child can point at.
//
// Pure SVG, no hooks, no randomness: safe to render on the server and identical
// for the same params every time. Geometry (including the deliberate not-to-
// scale squashing) is entirely RectPartition's; this file only decides what
// goes where.

/** Mirrors NAMES in api/services/wmi/concepts/rectangle-area-decompose. */
const NAMES = ['A', 'B', 'C', 'D', 'E', 'F']

interface Piece {
  r0: number
  c0: number
  r1: number
  c1: number
}

interface SideLabel {
  axis: 'w' | 'h'
  from: number
  to: number
}

interface Params {
  rows: number
  cols: number
  widths: number[]
  heights: number[]
  pieces: Piece[]
  areaShown: boolean[]
  sideLabels: SideLabel[]
  ask: 'area' | 'side'
  target: number
  targetSide: 'width' | 'height' | 'none'
}

const FALLBACK: Params = {
  rows: 2,
  cols: 2,
  widths: [3, 5],
  heights: [4, 6],
  pieces: [
    { r0: 0, c0: 0, r1: 0, c1: 0 },
    { r0: 0, c0: 1, r1: 0, c1: 1 },
    { r0: 1, c0: 0, r1: 1, c1: 0 },
    { r0: 1, c0: 1, r1: 1, c1: 1 },
  ],
  areaShown: [true, true, true, false],
  sideLabels: [{ axis: 'w', from: 0, to: 0 }],
  ask: 'area',
  target: 3,
  targetSide: 'none',
}

const int = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback

/**
 * Params arrive as `unknown` from the DB, so every field is re-derived and
 * clamped. Anything that does not add up falls back whole rather than in
 * pieces — a half-read jigsaw would draw a puzzle nobody set.
 */
export function readRectDecomposeParams(raw: unknown): Params {
  const p = (raw ?? {}) as Partial<Params>
  const rows = Math.max(1, Math.min(3, int(p.rows, 0)))
  const cols = Math.max(1, Math.min(3, int(p.cols, 0)))
  if (!Array.isArray(p.widths) || p.widths.length !== cols) return FALLBACK
  if (!Array.isArray(p.heights) || p.heights.length !== rows) return FALLBACK
  const widths = p.widths.map((v) => Math.max(1, Math.min(99, int(v, 1))))
  const heights = p.heights.map((v) => Math.max(1, Math.min(99, int(v, 1))))

  if (!Array.isArray(p.pieces) || p.pieces.length === 0 || p.pieces.length > NAMES.length) return FALLBACK
  const pieces = p.pieces.map((q) => ({
    r0: int((q as Piece)?.r0, -1),
    c0: int((q as Piece)?.c0, -1),
    r1: int((q as Piece)?.r1, -1),
    c1: int((q as Piece)?.c1, -1),
  }))
  // The jigsaw promise, re-checked on the client: no overlap and no gap.
  const cover = Array.from({ length: rows }, () => new Array<number>(cols).fill(0))
  for (const q of pieces) {
    if (q.r0 < 0 || q.c0 < 0 || q.r0 > q.r1 || q.c0 > q.c1 || q.r1 >= rows || q.c1 >= cols) return FALLBACK
    for (let r = q.r0; r <= q.r1; r++) for (let c = q.c0; c <= q.c1; c++) cover[r][c] += 1
  }
  if (cover.some((row) => row.some((n) => n !== 1))) return FALLBACK

  const areaShown =
    Array.isArray(p.areaShown) && p.areaShown.length === pieces.length ? p.areaShown.map(Boolean) : pieces.map(() => false)

  const sideLabels = (Array.isArray(p.sideLabels) ? p.sideLabels : [])
    .map((l) => ({
      axis: (l as SideLabel)?.axis === 'h' ? ('h' as const) : ('w' as const),
      from: int((l as SideLabel)?.from, -1),
      to: int((l as SideLabel)?.to, -1),
    }))
    .filter((l) => l.from >= 0 && l.from <= l.to && l.to < (l.axis === 'w' ? cols : rows))

  const ask = p.ask === 'side' ? ('side' as const) : ('area' as const)
  const target = Math.max(0, Math.min(pieces.length - 1, int(p.target, 0)))
  const targetSide =
    ask === 'side' ? (p.targetSide === 'height' ? ('height' as const) : ('width' as const)) : ('none' as const)

  return { rows, cols, widths, heights, pieces, areaShown, sideLabels, ask, target, targetSide }
}

export const spanOf = (track: number[], from: number, to: number): number => {
  let total = 0
  for (let i = from; i <= to; i++) total += track[i] ?? 0
  return total
}

export const areaOf = (p: Params, i: number): number =>
  spanOf(p.widths, p.pieces[i].c0, p.pieces[i].c1) * spanOf(p.heights, p.pieces[i].r0, p.pieces[i].r1)

const ORD_ID = ['pertama', 'kedua', 'ketiga']

export default function RectangleAreaDecomposeIllustration({ params }: { params: unknown }) {
  const p = readRectDecomposeParams(params)
  const t = p.pieces[p.target]

  const pieces: RectPartitionPiece[] = p.pieces.map((q, i) => ({
    ...q,
    label: NAMES[i],
    sub:
      p.ask === 'area' && i === p.target ? '?' : p.areaShown[i] ? `${areaOf(p, i)} cm²` : undefined,
    subTone: p.ask === 'area' && i === p.target ? ('rose' as const) : ('ink' as const),
    highlight: i === p.target ? ('amber' as const) : ('none' as const),
  }))

  // The asked length is drawn as "?" in its own slot, never as a number.
  const askW = p.ask === 'side' && p.targetSide === 'width' ? { from: t.c0, to: t.c1 } : null
  const askH = p.ask === 'side' && p.targetSide === 'height' ? { from: t.r0, to: t.r1 } : null

  const topLabels: RectPartitionEdgeLabel[] = []
  const bottomLabels: RectPartitionEdgeLabel[] = []
  const leftLabels: RectPartitionEdgeLabel[] = []
  const rightLabels: RectPartitionEdgeLabel[] = []
  for (const l of p.sideLabels) {
    const track = l.axis === 'w' ? p.widths : p.heights
    const label: RectPartitionEdgeLabel = {
      from: l.from,
      to: l.to,
      text: `${spanOf(track, l.from, l.to)} cm`,
      tone: 'ink',
    }
    if (l.axis === 'w') (l.from === l.to ? topLabels : bottomLabels).push(label)
    else (l.from === l.to ? leftLabels : rightLabels).push(label)
  }
  if (askW) (askW.from === askW.to ? topLabels : bottomLabels).push({ ...askW, text: '?', tone: 'rose' })
  if (askH) (askH.from === askH.to ? leftLabels : rightLabels).push({ ...askH, text: '?', tone: 'rose' })

  // The label speaks only what is printed on the page. The missing value is
  // announced as missing; its number is never mentioned.
  const printedAreas = p.pieces
    .map((_, i) => (p.areaShown[i] ? `luas ${NAMES[i]} ${areaOf(p, i)} cm²` : null))
    .filter((x): x is string => x !== null)
  const partName = (axis: 'w' | 'h', index: number): string => {
    const count = axis === 'w' ? p.cols : p.rows
    const edge = axis === 'w' ? 'sisi atas' : 'sisi kiri'
    return count <= 1 ? edge : `bagian ${ORD_ID[index] ?? index + 1} ${edge}`
  }
  const printedSides = p.sideLabels.map((l) => {
    const track = l.axis === 'w' ? p.widths : p.heights
    const count = l.axis === 'w' ? p.cols : p.rows
    const name =
      l.from === l.to
        ? partName(l.axis, l.from)
        : l.from === 0 && l.to === count - 1
          ? l.axis === 'w'
            ? 'seluruh lebar'
            : 'seluruh tinggi'
          : `${partName(l.axis, l.from)} sampai ${partName(l.axis, l.to)}`
    return `${name} ${spanOf(track, l.from, l.to)} cm`
  })
  const asked =
    p.ask === 'area'
      ? `luas ${NAMES[p.target]}`
      : p.targetSide === 'width'
        ? `lebar ${NAMES[p.target]}`
        : `tinggi ${NAMES[p.target]}`
  const ariaLabel = [
    `Persegi panjang besar dipotong menjadi ${p.pieces.length} persegi panjang: ${p.pieces.map((_, i) => NAMES[i]).join(', ')}.`,
    printedAreas.length > 0 ? `Luas yang tercetak: ${printedAreas.join('; ')}.` : 'Tidak ada luas yang tercetak.',
    printedSides.length > 0
      ? `Panjang yang tercetak: ${printedSides.join('; ')}.`
      : 'Tidak ada panjang sisi yang tercetak.',
    `Yang ditandai tanda tanya: ${asked}. Gambar tidak sesuai skala.`,
  ].join(' ')

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <RectPartition
        colWidths={p.widths}
        rowHeights={p.heights}
        pieces={pieces}
        topLabels={topLabels}
        bottomLabels={bottomLabels}
        leftLabels={leftLabels}
        rightLabels={rightLabels}
        showTopRail={p.cols > 1 || topLabels.length > 0}
        showLeftRail={p.rows > 1 || leftLabels.length > 0}
        style={{ maxWidth: '22rem' }}
      />
    </div>
  )
}
