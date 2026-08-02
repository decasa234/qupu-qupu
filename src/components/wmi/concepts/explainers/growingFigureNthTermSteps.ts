import type { Lang } from './makeTenSteps'

// `growing-figure-nth-term`. Pictures 1 … k of a figure that grows by the same
// move every time, and a question about a picture nobody drew.
//
// The move this storyboard has to teach is that the drawings are EVIDENCE, not
// the puzzle: you count them, you look at the jumps, and then you read off HOW
// picture n is built. Only then does a far-away picture become answerable. So no
// beat ever announces the rule — the counts arrive first, the jumps second, and
// the rule is justified against the very pictures on screen before it is used.
//
// Mirrors api/services/wmi/concepts/growing-figure-nth-term. Params arrive as
// `unknown` from the DB, so the shape, the cell lists and the counts are all
// re-derived here. `growingFigureCells` is the single description of the figure
// on this side of the wire: the illustration draws it and every number in the
// captions counts it, so the picture and the arithmetic cannot drift apart.
export type GrowingShape =
  | 'staircase'
  | 'square-block'
  | 'oblong'
  | 'l-corner'
  | 'plus-arms'
  | 'bar-rows'
export type GrowingAsk = 'count-at-n' | 'n-where-count-is' | 'difference-between-two'
export type GrowingPhase = 'setup' | 'count' | 'jump' | 'rule' | 'trap' | 'result'

/** A cell of a drawn picture as `[row, col]`, row 0 = top, col 0 = left. */
export type FigureCell = [number, number]

export interface GrowingParams {
  shape: GrowingShape
  height: number
  shownCount: number
  ask: GrowingAsk
  targetIndex: number
  secondIndex: number
}

const SHAPES: GrowingShape[] = [
  'staircase',
  'square-block',
  'oblong',
  'l-corner',
  'plus-arms',
  'bar-rows',
]
const ASKS: GrowingAsk[] = ['count-at-n', 'n-where-count-is', 'difference-between-two']

const MAX_INDEX = 60

const FALLBACK: GrowingParams = {
  shape: 'staircase',
  height: 1,
  shownCount: 4,
  ask: 'count-at-n',
  targetIndex: 10,
  secondIndex: 0,
}

/**
 * Mirrors `figureCells` in api/services/wmi/concepts/growing-figure-nth-term.
 * Picture `n` as a cell list — the only description of the figure the frontend
 * has, shared by the in-card illustration and by every count in this storyboard.
 */
export function growingFigureCells(
  shape: GrowingShape,
  height: number,
  n: number,
): FigureCell[] {
  const cells: FigureCell[] = []
  if (!Number.isInteger(n) || n < 1) return cells
  switch (shape) {
    case 'staircase':
      for (let r = 0; r < n; r++) for (let c = 0; c <= r; c++) cells.push([r, c])
      return cells
    case 'square-block':
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cells.push([r, c])
      return cells
    case 'oblong':
      for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) cells.push([r, c])
      return cells
    case 'l-corner':
      for (let r = 0; r < n; r++) cells.push([r, 0])
      for (let c = 1; c < n; c++) cells.push([n - 1, c])
      return cells
    case 'plus-arms': {
      const m = n - 1
      cells.push([m, m])
      for (let k = 1; k <= m; k++) {
        cells.push([m - k, m])
        cells.push([m + k, m])
        cells.push([m, m - k])
        cells.push([m, m + k])
      }
      return cells
    }
    case 'bar-rows':
      for (let r = 0; r < height; r++) for (let c = 0; c < n; c++) cells.push([r, c])
      return cells
  }
}

/** How many squares picture `n` holds — counted off the drawing, never guessed. */
export function growingCount(shape: GrowingShape, height: number, n: number): number {
  return growingFigureCells(shape, height, n).length
}

const int = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback

/**
 * Params arrive as `unknown` from the DB, so every field is re-derived and
 * clamped. Anything that does not add up falls back WHOLE rather than in pieces
 * — a half-read pattern would draw a puzzle nobody set.
 */
export function readGrowingParams(raw: unknown): GrowingParams {
  const p = (raw ?? {}) as Partial<GrowingParams>
  const shape = SHAPES.includes(p.shape as GrowingShape) ? (p.shape as GrowingShape) : null
  if (shape === null) return FALLBACK
  const height = shape === 'bar-rows' ? Math.max(2, Math.min(3, int(p.height, 2))) : 1
  const shownCount = Math.max(3, Math.min(4, int(p.shownCount, 4)))
  const ask = ASKS.includes(p.ask as GrowingAsk) ? (p.ask as GrowingAsk) : 'count-at-n'
  const targetIndex = Math.max(shownCount + 1, Math.min(MAX_INDEX, int(p.targetIndex, shownCount + 3)))
  const rawSecond = int(p.secondIndex, 0)
  const secondIndex =
    ask === 'difference-between-two'
      ? Math.max(shownCount + 1, Math.min(targetIndex - 1, rawSecond))
      : 0
  // A difference needs two distinct undrawn pictures; if the clamping collapsed
  // them, fall back to the ask we can narrate honestly.
  if (ask === 'difference-between-two' && secondIndex >= targetIndex) {
    return { shape, height, shownCount, ask: 'count-at-n', targetIndex, secondIndex: 0 }
  }
  return { shape, height, shownCount, ask, targetIndex, secondIndex }
}

// ── Layout, shared by the in-card figure and the explainer ───────────────────

export interface PictureBox {
  /** Top-left of the picture's own SVG inside the strip. */
  x: number
  y: number
  w: number
  h: number
  spanR: number
  spanC: number
}

export interface FigureStrip {
  boxes: PictureBox[]
  width: number
  height: number
}

function span(cells: FigureCell[]): { rows: number; cols: number } {
  let maxR = 0
  let maxC = 0
  for (const [r, c] of cells) {
    if (r > maxR) maxR = r
    if (c > maxC) maxC = c
  }
  return { rows: maxR + 1, cols: maxC + 1 }
}

/** Picture cell size that keeps the whole strip inside `maxWidth`. */
export function pickCellSize(
  pictures: FigureCell[][],
  maxWidth: number,
  gap: number,
  pad: number,
): number {
  const cols = pictures.reduce((sum, cells) => sum + span(cells).cols, 0)
  if (cols === 0) return 12
  const room = maxWidth - gap * Math.max(0, pictures.length - 1) - pad * 2 * pictures.length
  return Math.max(6, Math.min(22, Math.floor(room / cols)))
}

/**
 * Lays the pictures out left to right, sitting on one baseline so the growth
 * reads as growth. Positions depend only on the params, never on the beat — the
 * figures must never move while the explainer plays.
 */
export function layoutPictures(
  pictures: FigureCell[][],
  cell: number,
  gap: number,
  pad: number,
): FigureStrip {
  const boxes: PictureBox[] = []
  const sizes = pictures.map((cells) => span(cells))
  const heights = sizes.map((s) => s.rows * cell + pad * 2)
  const maxH = heights.reduce((m, h) => Math.max(m, h), 0)
  let x = 0
  pictures.forEach((_, i) => {
    const w = sizes[i].cols * cell + pad * 2
    boxes.push({ x, y: maxH - heights[i], w, h: heights[i], spanR: sizes[i].rows, spanC: sizes[i].cols })
    x += w + gap
  })
  return { boxes, width: Math.max(0, x - gap), height: maxH }
}

// ── Wording, mirrored from the concept's render() ────────────────────────────

/** How picture n is BUILT — the sentence that makes the rule the only one. */
export function growingRuleSentence(
  shape: GrowingShape,
  height: number,
  lang: Lang,
): string {
  const id = lang === 'id'
  switch (shape) {
    case 'staircase':
      return id
        ? 'gambar ke-n adalah tangga dengan n baris berisi 1, 2, sampai n persegi, jadi isinya 1 + 2 + ... + n = n × (n + 1) : 2'
        : 'picture n is a staircase of n rows holding 1, 2, up to n squares, so it holds 1 + 2 + ... + n = n × (n + 1) ÷ 2'
    case 'square-block':
      return id
        ? 'gambar ke-n adalah blok selebar n dan setinggi n persegi, jadi isinya n × n'
        : 'picture n is a block n squares wide and n squares tall, so it holds n × n'
    case 'oblong':
      return id
        ? 'gambar ke-n adalah blok setinggi n dan selebar n + 1 persegi, jadi isinya n × (n + 1)'
        : 'picture n is a block n squares tall and n + 1 squares wide, so it holds n × (n + 1)'
    case 'l-corner':
      return id
        ? 'gambar ke-n adalah siku: n persegi ke bawah lalu n − 1 lagi ke kanan, jadi isinya 2 × n − 1'
        : 'picture n is a corner: n squares down then n − 1 more to the right, so it holds 2 × n − 1'
    case 'plus-arms':
      return id
        ? 'gambar ke-n adalah tanda tambah: 1 persegi di tengah dan 4 lengan berisi n − 1, jadi isinya 4 × n − 3'
        : 'picture n is a plus sign: 1 middle square and 4 arms of n − 1, so it holds 4 × n − 3'
    case 'bar-rows':
      return id
        ? `gambar ke-n adalah ${height} baris berisi n persegi, jadi isinya ${height} × n`
        : `picture n is ${height} rows of n squares, so it holds ${height} × n`
  }
}

/** "10 × 11 ÷ 2 = 55" — the rule with a number put in for n. */
export function growingEvalPhrase(
  shape: GrowingShape,
  height: number,
  n: number,
  lang: Lang,
): string {
  const v = growingCount(shape, height, n)
  const id = lang === 'id'
  switch (shape) {
    case 'staircase':
      return id ? `${n} × ${n + 1} : 2 = ${v}` : `${n} × ${n + 1} ÷ 2 = ${v}`
    case 'square-block':
      return `${n} × ${n} = ${v}`
    case 'oblong':
      return `${n} × ${n + 1} = ${v}`
    case 'l-corner':
      return `2 × ${n} − 1 = ${v}`
    case 'plus-arms':
      return `4 × ${n} − 3 = ${v}`
    case 'bar-rows':
      return `${height} × ${n} = ${v}`
  }
}

/** Running the rule backwards from a count to the picture number. */
export function growingBackwardPhrase(
  shape: GrowingShape,
  height: number,
  count: number,
  n: number,
  lang: Lang,
): string {
  const id = lang === 'id'
  switch (shape) {
    case 'staircase':
      return id
        ? `n × (n + 1) : 2 = ${count}, jadi n × (n + 1) = ${2 * count}; ${n} × ${n + 1} = ${2 * count}, maka n = ${n}`
        : `n × (n + 1) ÷ 2 = ${count}, so n × (n + 1) = ${2 * count}; ${n} × ${n + 1} = ${2 * count}, so n = ${n}`
    case 'square-block':
      return id
        ? `n × n = ${count}, dan ${n} × ${n} = ${count}, jadi n = ${n}`
        : `n × n = ${count}, and ${n} × ${n} = ${count}, so n = ${n}`
    case 'oblong':
      return id
        ? `n × (n + 1) = ${count}, dan ${n} × ${n + 1} = ${count}, jadi n = ${n}`
        : `n × (n + 1) = ${count}, and ${n} × ${n + 1} = ${count}, so n = ${n}`
    case 'l-corner':
      return id
        ? `2 × n − 1 = ${count}, jadi 2 × n = ${count + 1} dan n = ${n}`
        : `2 × n − 1 = ${count}, so 2 × n = ${count + 1} and n = ${n}`
    case 'plus-arms':
      return id
        ? `4 × n − 3 = ${count}, jadi 4 × n = ${count + 3} dan n = ${n}`
        : `4 × n − 3 = ${count}, so 4 × n = ${count + 3} and n = ${n}`
    case 'bar-rows':
      return id
        ? `${height} × n = ${count}, jadi n = ${count} : ${height} = ${n}`
        : `${height} × n = ${count}, so n = ${count} ÷ ${height} = ${n}`
  }
}

function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

// ── Storyboard ───────────────────────────────────────────────────────────────

export interface GrowingBeat {
  phase: GrowingPhase
  caption: string
  /** Which drawn pictures are lit up on this beat (index 0 = picture 1). */
  lit: boolean[]
  /** Count chip under each drawn picture; '' before it has been counted. */
  counts: string[]
  /** Jump chip between picture i and i + 1; '' before the jumps are read. */
  jumps: string[]
  /** What sits in the dashed "not drawn" slot: '?', a wrong number, or the answer. */
  slot: string
  slotState: 'asked' | 'wrong' | 'solved'
  /** The wrong number a child reaches by keeping the last jump going. */
  trapNumber: string | null
  /** The answer — non-null ONLY on the final beat. */
  reveal: string | null
  hold: number
}

export interface GrowingStoryboard {
  shape: GrowingShape
  height: number
  shownCount: number
  /** Cell list per drawn picture, index 0 = picture 1. */
  pictures: FigureCell[][]
  /** Caption under each drawn picture. */
  labels: string[]
  /** Caption under the dashed slot. */
  slotLabel: string
  answer: string
  steps: GrowingBeat[]
  finalIndex: number
}

export function buildGrowingFigureNthTermSteps(raw: unknown, lang: Lang): GrowingStoryboard {
  const p = readGrowingParams(raw)
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const pictures = Array.from({ length: p.shownCount }, (_, i) =>
    growingFigureCells(p.shape, p.height, i + 1),
  )
  const shown = pictures.map((cells) => cells.length)
  const jumps = shown.slice(1).map((v, i) => v - shown[i])
  const sameJump = jumps.length > 0 && jumps.every((j) => j === jumps[0])
  const growths = jumps.slice(1).map((j, i) => j - jumps[i])
  const jumpGrowth = growths.length > 0 && growths.every((g) => g === growths[0]) ? growths[0] : null

  const targetCount = growingCount(p.shape, p.height, p.targetIndex)
  const secondCount = p.secondIndex > 0 ? growingCount(p.shape, p.height, p.secondIndex) : 0
  const answer =
    p.ask === 'count-at-n'
      ? String(targetCount)
      : p.ask === 'n-where-count-is'
        ? String(p.targetIndex)
        : String(targetCount - secondCount)

  // "Keep adding the last jump forever" — the one genuinely tempting wrong road,
  // and only on a pattern whose jumps are still growing.
  const lastJump = jumps.length > 0 ? jumps[jumps.length - 1] : 0
  const tailAt = (n: number) => shown[shown.length - 1] + (n - p.shownCount) * lastJump
  let trapNumber: string | null = null
  if (!sameJump && jumps.length > 0) {
    if (p.ask === 'count-at-n') trapNumber = String(tailAt(p.targetIndex))
    else if (p.ask === 'difference-between-two')
      trapNumber = String(tailAt(p.targetIndex) - tailAt(p.secondIndex))
    else {
      for (let n = 1; n <= 200; n++) {
        const v = tailAt(n)
        if (v === targetCount) {
          trapNumber = String(n)
          break
        }
        if (v > targetCount) break
      }
    }
    if (trapNumber === answer) trapNumber = null
  }

  const labels = shown.map((_, i) => (lang === 'id' ? `ke-${i + 1}` : String(i + 1)))
  // Kept short on purpose: it sits under a slot barely wider than one square.
  const slotLabel =
    p.ask === 'n-where-count-is'
      ? T('#?', 'ke-?')
      : p.ask === 'difference-between-two'
        ? T('gap', 'selisih')
        : T(`#${p.targetIndex}`, `ke-${p.targetIndex}`)

  const blankCounts = shown.map(() => '')
  const blankJumps = jumps.map(() => '')
  const shownCounts = shown.map(String)
  const shownJumps = jumps.map((j) => `+${j}`)
  const allLit = shown.map(() => true)
  const noneLit = shown.map(() => false)

  const steps: GrowingBeat[] = []
  const push = (beat: Partial<GrowingBeat> & { phase: GrowingPhase; caption: string }) => {
    steps.push({
      lit: noneLit,
      counts: blankCounts,
      jumps: blankJumps,
      slot: '?',
      slotState: 'asked',
      trapNumber: null,
      reveal: null,
      hold: 2600,
      ...beat,
    })
  }

  // ── Beat 1 — the drawings, and what they are for. ─────────────────────────
  push({
    phase: 'setup',
    caption: T(
      `Pictures 1 to ${p.shownCount} are drawn; the dashed one is not. Each picture grows from the one before it in the same way, so one rule has to cover them all.`,
      `Gambar ke-1 sampai ke-${p.shownCount} sudah digambar; yang bergaris putus-putus tidak. Tiap gambar tumbuh dari gambar sebelumnya dengan cara yang sama, jadi satu aturan harus berlaku untuk semuanya.`,
    ),
    hold: 3000,
  })

  // ── Beat 2 — count them. Nothing can be argued before this. ───────────────
  push({
    phase: 'count',
    lit: allLit,
    counts: shownCounts,
    caption: T(
      `Count the small squares one picture at a time: ${listEn(shownCounts)}.`,
      `Hitung persegi kecilnya satu gambar demi satu gambar: ${listId(shownCounts)}.`,
    ),
  })

  // ── Beat 3 — the jumps between them. ──────────────────────────────────────
  push({
    phase: 'jump',
    lit: allLit,
    counts: shownCounts,
    jumps: shownJumps,
    caption: sameJump
      ? T(
          `The jumps are ${listEn(jumps.map(String))} — the same jump every time, so every new picture adds ${jumps[0]}.`,
          `Lompatannya ${listId(jumps.map(String))} — selalu sama, jadi setiap gambar baru menambah ${jumps[0]}.`,
        )
      : T(
          `The jumps are ${listEn(jumps.map(String))} — never the same twice${jumpGrowth === null ? '' : `, each one is ${jumpGrowth} bigger than the last`}. One number added over and over will not do.`,
          `Lompatannya ${listId(jumps.map(String))} — tidak pernah sama${jumpGrowth === null ? '' : `, tiap lompatan ${jumpGrowth} lebih besar dari sebelumnya`}. Menambah satu bilangan terus-menerus tidak akan cocok.`,
        ),
  })

  // ── Beat 4 — the rule, read off the build and checked on the drawings. ────
  push({
    phase: 'rule',
    lit: allLit,
    counts: shownCounts,
    jumps: shownJumps,
    caption: T(
      `Look at how a picture is made: ${growingRuleSentence(p.shape, p.height, 'en')}. Check it: ${growingEvalPhrase(p.shape, p.height, 1, 'en')} and ${growingEvalPhrase(p.shape, p.height, p.shownCount, 'en')} — both match the drawings.`,
      `Lihat cara gambarnya dibuat: ${growingRuleSentence(p.shape, p.height, 'id')}. Cek: ${growingEvalPhrase(p.shape, p.height, 1, 'id')} dan ${growingEvalPhrase(p.shape, p.height, p.shownCount, 'id')} — dua-duanya cocok dengan gambar.`,
    ),
    hold: 3400,
  })

  // ── The wrong road, drawn instead of told. ────────────────────────────────
  if (trapNumber !== null) {
    push({
      phase: 'trap',
      lit: allLit,
      counts: shownCounts,
      jumps: shownJumps,
      slot: trapNumber,
      slotState: 'wrong',
      trapNumber,
      caption: T(
        `Careful: keeping the last jump of ${lastJump} going gives ${trapNumber}. But the jumps are still growing, so that road is wrong.`,
        `Hati-hati: kalau lompatan terakhir ${lastJump} diteruskan, hasilnya ${trapNumber}. Padahal lompatannya masih membesar, jadi jalan itu salah.`,
      ),
      hold: 3200,
    })
  }

  // ── What the question actually wanted. ────────────────────────────────────
  const close_en =
    p.ask === 'count-at-n'
      ? `Put ${p.targetIndex} in place of n: ${growingEvalPhrase(p.shape, p.height, p.targetIndex, 'en')}, so picture ${p.targetIndex} has ${answer} small squares.`
      : p.ask === 'n-where-count-is'
        ? `Run the rule backwards: ${growingBackwardPhrase(p.shape, p.height, targetCount, p.targetIndex, 'en')}. So it is picture ${answer}.`
        : `Use the rule twice: ${growingEvalPhrase(p.shape, p.height, p.targetIndex, 'en')} and ${growingEvalPhrase(p.shape, p.height, p.secondIndex, 'en')}, so the gap is ${targetCount} − ${secondCount} = ${answer}.`
  const close_id =
    p.ask === 'count-at-n'
      ? `Ganti n dengan ${p.targetIndex}: ${growingEvalPhrase(p.shape, p.height, p.targetIndex, 'id')}, jadi gambar ke-${p.targetIndex} punya ${answer} persegi kecil.`
      : p.ask === 'n-where-count-is'
        ? `Jalankan aturannya mundur: ${growingBackwardPhrase(p.shape, p.height, targetCount, p.targetIndex, 'id')}. Jadi itu gambar ke-${answer}.`
        : `Pakai aturannya dua kali: ${growingEvalPhrase(p.shape, p.height, p.targetIndex, 'id')} dan ${growingEvalPhrase(p.shape, p.height, p.secondIndex, 'id')}, jadi selisihnya ${targetCount} − ${secondCount} = ${answer}.`

  push({
    phase: 'result',
    lit: allLit,
    counts: shownCounts,
    jumps: shownJumps,
    slot: answer,
    slotState: 'solved',
    trapNumber,
    caption: T(close_en, close_id),
    reveal: answer,
    hold: 0,
  })

  return {
    shape: p.shape,
    height: p.height,
    shownCount: p.shownCount,
    pictures,
    labels,
    slotLabel,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
