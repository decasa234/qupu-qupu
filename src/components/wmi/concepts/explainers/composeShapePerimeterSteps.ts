export type Lang = 'en' | 'id'

export type ComposeCell = [number, number]
export type ComposePiece = 'square' | 'rectangle'
export type ComposeGiven = 'piece-side' | 'piece-perimeter' | 'piece-area' | 'shape-perimeter'
export type ComposeAsk = 'side' | 'perimeter' | 'area'

/** A boundary or internal edge, in PIECE-corner coordinates. */
export interface ComposeEdge {
  x1: number
  y1: number
  x2: number
  y2: number
  /** 'h' runs left-right (one piece wide); 'v' runs up-down (one piece tall). */
  dir: 'h' | 'v'
}

/**
 * The one place the frontend turns `compose-shape-perimeter` params into
 * numbers and lines.
 *
 * Both the in-card figure and the animated explainer read this, so the drawn
 * pieces and every number spoken about them come from the SAME layout. No count
 * is stored in params to contradict the picture: `outline` is produced by
 * walking the layout and keeping only the cell edges with empty space behind
 * them, and `shapePerimeter` is those edges measured. Joining two pieces removes
 * two entries from `outline` — the thing the animation exists to show.
 */
export interface ComposeView {
  piece: ComposePiece
  given: ComposeGiven
  ask: ComposeAsk
  /** Pieces as [row, col], reading order. */
  cells: ComposeCell[]
  count: number
  /** Shape size measured in PIECES. */
  width: number
  height: number
  pieceW: number
  pieceH: number
  piecePerimeter: number
  pieceArea: number
  /** Boundary edges, split by direction. */
  outline: ComposeEdge[]
  horizontalEdges: number
  verticalEdges: number
  outlineEdges: number
  /** Edges buried where two pieces touch — drawn once each. */
  internal: ComposeEdge[]
  joins: number
  hiddenEdges: number
  shapePerimeter: number
  shapeArea: number
  answerValue: number
  unit: 'cm' | 'cm²'
}

const key = (cell: ComposeCell): string => `${cell[0]},${cell[1]}`
const readingOrder = (a: ComposeCell, b: ComposeCell): number => a[0] - b[0] || a[1] - b[1]

/** Four 1-cell pieces in a 2-by-2 block — the layout used when params are unusable. */
const FALLBACK_CELLS: ComposeCell[] = [
  [0, 0], [0, 1],
  [1, 0], [1, 1],
]

function toCells(raw: unknown): ComposeCell[] {
  if (!Array.isArray(raw)) return []
  const out: ComposeCell[] = []
  const seen = new Set<string>()
  for (const item of raw) {
    if (!Array.isArray(item) || item.length < 2) continue
    const r = Number(item[0])
    const c = Number(item[1])
    if (!Number.isFinite(r) || !Number.isFinite(c)) continue
    const cell: ComposeCell = [Math.round(r), Math.round(c)]
    const k = key(cell)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(cell)
  }
  return out.sort(readingOrder)
}

/** Re-anchors a layout so its top row is 0 and its left column is 0. */
function normalise(cells: ComposeCell[]): ComposeCell[] {
  if (cells.length === 0) return []
  const minR = Math.min(...cells.map(([r]) => r))
  const minC = Math.min(...cells.map(([, c]) => c))
  return cells.map(([r, c]) => [r - minR, c - minC] as ComposeCell).sort(readingOrder)
}

function positive(raw: unknown, fallback: number): number {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export function readComposeParams(raw: unknown): ComposeView {
  const p = (raw ?? {}) as Record<string, unknown>

  const parsed = toCells(p.cells)
  const cells = normalise(parsed.length >= 2 ? parsed : FALLBACK_CELLS)
  const grid = new Set(cells.map(key))

  const piece: ComposePiece = p.piece === 'rectangle' ? 'rectangle' : 'square'
  const pieceW = positive(p.pieceW, 3)
  const pieceH = piece === 'square' ? pieceW : positive(p.pieceH, 2)

  const givenRaw = p.given
  const given: ComposeGiven =
    givenRaw === 'piece-perimeter' || givenRaw === 'piece-area' || givenRaw === 'shape-perimeter'
      ? givenRaw
      : 'piece-side'
  const askRaw = p.ask
  const ask: ComposeAsk = askRaw === 'side' || askRaw === 'area' ? askRaw : 'perimeter'

  // THE count: every cell edge with empty space on the other side, plus the ones
  // buried between two pieces kept separately so the animation can show them go.
  const outline: ComposeEdge[] = []
  const internal: ComposeEdge[] = []
  for (const [r, c] of cells) {
    const top: ComposeEdge = { x1: c, y1: r, x2: c + 1, y2: r, dir: 'h' }
    const bottom: ComposeEdge = { x1: c, y1: r + 1, x2: c + 1, y2: r + 1, dir: 'h' }
    const left: ComposeEdge = { x1: c, y1: r, x2: c, y2: r + 1, dir: 'v' }
    const right: ComposeEdge = { x1: c + 1, y1: r, x2: c + 1, y2: r + 1, dir: 'v' }

    if (grid.has(key([r - 1, c]))) {
      // shared with the piece above — recorded once, by the lower piece
      internal.push(top)
    } else {
      outline.push(top)
    }
    if (!grid.has(key([r + 1, c]))) outline.push(bottom)
    if (grid.has(key([r, c - 1]))) {
      internal.push(left)
    } else {
      outline.push(left)
    }
    if (!grid.has(key([r, c + 1]))) outline.push(right)
  }

  const horizontalEdges = outline.filter((e) => e.dir === 'h').length
  const verticalEdges = outline.filter((e) => e.dir === 'v').length
  const joins = internal.length
  const pieceArea = pieceW * pieceH
  const shapePerimeter = horizontalEdges * pieceW + verticalEdges * pieceH
  const shapeArea = cells.length * pieceArea

  return {
    piece,
    given,
    ask,
    cells,
    count: cells.length,
    width: Math.max(...cells.map(([, c]) => c)) + 1,
    height: Math.max(...cells.map(([r]) => r)) + 1,
    pieceW,
    pieceH,
    piecePerimeter: 2 * (pieceW + pieceH),
    pieceArea,
    outline,
    horizontalEdges,
    verticalEdges,
    outlineEdges: horizontalEdges + verticalEdges,
    internal,
    joins,
    hiddenEdges: joins * 2,
    shapePerimeter,
    shapeArea,
    answerValue: ask === 'side' ? pieceW : ask === 'perimeter' ? shapePerimeter : shapeArea,
    unit: ask === 'area' ? 'cm²' : 'cm',
  }
}

export interface ComposeStep {
  /** Draw the pieces pulled slightly apart, each with its own four edges. */
  loose: boolean
  /** Draw the buried edges, so a child can watch them go. */
  showBuried: boolean
  /** Light the boundary edges that run left-right. */
  litHorizontal: boolean
  /** Light the boundary edges that run up-down. */
  litVertical: boolean
  /** Shade one piece — the "this much surface" beat. */
  shadePiece: boolean
  /** Shade every piece — the finished area. */
  shadeAll: boolean
  caption: string
  /** ms to hold this beat when playing (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface ComposeStoryboard {
  view: ComposeView
  steps: ComposeStep[]
  finalIndex: number
}

const blank = {
  loose: false,
  showBuried: false,
  litHorizontal: false,
  litVertical: false,
  shadePiece: false,
  shadeAll: false,
  result: false,
}

/**
 * The beat order is the argument: all the edges the loose pieces have, then the
 * ones the joins bury, then the ones that survive counted column-wise and
 * row-wise, and only then the multiplication. The answer appears once, at the
 * end of that chain, never as a value pasted in.
 */
export function buildComposeShapePerimeterSteps(raw: unknown, lang: Lang): ComposeStoryboard {
  const view = readComposeParams(raw)
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: ComposeStep[] = []

  // Area with the piece already described never needs the edge walk — joining
  // hides edges, never surface.
  const edgeWalk = view.ask !== 'area' || view.given === 'shape-perimeter'

  // Always open on the loose pieces — the unit being repeated is what every
  // later beat measures.
  steps.push({
    ...blank,
    loose: true,
    caption: edgeWalk
      ? t(
          `Apart, the ${view.count} pieces show ${view.count} × 4 = ${view.count * 4} edges`,
          `Terpisah, ${view.count} keping punya ${view.count} × 4 = ${view.count * 4} sisi`,
        )
      : t(
          `${view.count} identical pieces, and none of them overlaps`,
          `${view.count} keping yang sama besar, dan tidak ada yang tumpang tindih`,
        ),
    hold: 1700,
  })

  if (edgeWalk) {
    steps.push({
      ...blank,
      showBuried: true,
      caption: t(
        `${view.joins} joins — each buries 2 edges, so ${view.hiddenEdges} edges go`,
        `${view.joins} sambungan — tiap satu mengubur 2 sisi, jadi ${view.hiddenEdges} sisi hilang`,
      ),
      hold: 1800,
    })
    steps.push({
      ...blank,
      litHorizontal: true,
      caption: t(
        `Top and bottom of each column: 2 × ${view.width} = ${view.horizontalEdges} sideways edges`,
        `Atas dan bawah tiap kolom: 2 × ${view.width} = ${view.horizontalEdges} sisi mendatar`,
      ),
      hold: 1700,
    })
    steps.push({
      ...blank,
      litHorizontal: true,
      litVertical: true,
      caption: t(
        `Left and right of each row: 2 × ${view.height} = ${view.verticalEdges} more — ${view.outlineEdges} edges on the outline`,
        `Kiri dan kanan tiap baris: 2 × ${view.height} = ${view.verticalEdges} lagi — ${view.outlineEdges} sisi di tepi luar`,
      ),
      hold: 1800,
    })
  }

  if (view.given === 'shape-perimeter') {
    steps.push({
      ...blank,
      litHorizontal: true,
      litVertical: true,
      caption: t(
        `The string covers all ${view.outlineEdges}: ${view.shapePerimeter} ÷ ${view.outlineEdges} = ${view.pieceW} cm a side`,
        `Tali menempuh ${view.outlineEdges} sisi: ${view.shapePerimeter} ÷ ${view.outlineEdges} = ${view.pieceW} cm tiap sisi`,
      ),
      hold: view.ask === 'side' ? 0 : 1800,
      result: view.ask === 'side',
    })
  }

  if (view.ask === 'perimeter') {
    steps.push({
      ...blank,
      litHorizontal: true,
      litVertical: true,
      caption:
        view.piece === 'square'
          ? t(
              `${view.outlineEdges} edges × ${view.pieceW} cm = ${view.shapePerimeter} cm`,
              `${view.outlineEdges} sisi × ${view.pieceW} cm = ${view.shapePerimeter} cm`,
            )
          : t(
              `${view.horizontalEdges} × ${view.pieceW} + ${view.verticalEdges} × ${view.pieceH} = ${view.shapePerimeter} cm`,
              `${view.horizontalEdges} × ${view.pieceW} + ${view.verticalEdges} × ${view.pieceH} = ${view.shapePerimeter} cm`,
            ),
      hold: 0,
      result: true,
    })
  } else if (view.ask === 'area') {
    steps.push({
      ...blank,
      shadePiece: true,
      caption: t(
        `One piece covers ${view.pieceW} × ${view.pieceH} = ${view.pieceArea} cm²`,
        `Satu keping menutup ${view.pieceW} × ${view.pieceH} = ${view.pieceArea} cm²`,
      ),
      hold: 1700,
    })
    steps.push({
      ...blank,
      shadeAll: true,
      caption: t(
        `Nothing overlaps: ${view.count} × ${view.pieceArea} = ${view.shapeArea} cm²`,
        `Tidak ada yang tumpang tindih: ${view.count} × ${view.pieceArea} = ${view.shapeArea} cm²`,
      ),
      hold: 0,
      result: true,
    })
  }

  return { view, steps, finalIndex: steps.length - 1 }
}
