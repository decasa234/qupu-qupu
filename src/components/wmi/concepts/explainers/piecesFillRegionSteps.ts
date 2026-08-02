import type { Lang } from './makeTenSteps'

// `pieces-fill-region`. The board is tiled except for one hole; which offered
// piece (or pair) drops in? Turning is allowed, flipping is not.
//
// A child's instinct is to recognise the silhouette and pick it, which is
// exactly what the mirror-image option punishes. So this storyboard never
// asserts the answer: it walks the wrong options one at a time and kills each
// one with a number that is on the screen — the square count, then the longest
// straight line, then the handedness — and only then seats the survivor in the
// hole, square by square. The answer arrives as the last shape standing.
export type PfrAsk = 'single-piece' | 'pair-of-pieces'
export type PfrPhase = 'setup' | 'rule' | 'try' | 'trap' | 'result'

const ASKS: readonly PfrAsk[] = ['single-piece', 'pair-of-pieces']
const OPTION_LABELS = ['A', 'B', 'C', 'D']

export type PfrCell = [number, number]

/** Mirrors the generator's params (api/services/wmi/concepts/pieces-fill-region). */
export interface PfrParams {
  ask: PfrAsk
  region: PfrCell[]
  hole: PfrCell[]
  options: PfrCell[][][]
  answerIndex: number
  actor: string
}

export interface PfrOption {
  label: string
  pieces: PfrCell[][]
  squares: number
  run: number
}

export interface PfrBeat {
  phase: PfrPhase
  caption: string
  /** Which option is on the bench for this beat (index), or null. */
  optionIndex: number | null
  optionLabel: string | null
  tone: 'neutral' | 'wrong' | 'right'
  /** Short chip naming what killed this option, already in `lang`. */
  verdict: string | null
  trap: boolean
  /** Result beat: cell key → which of the winner's pieces covers it. */
  seated: Record<string, number> | null
  /** The answer — non-null ONLY on the final beat. */
  reveal: string | null
  hold: number
}

export interface PfrStoryboard {
  ask: PfrAsk
  region: PfrCell[]
  hole: PfrCell[]
  options: PfrOption[]
  /** Squares in the hole. */
  n: number
  /** Longest straight line of squares inside the hole. */
  holeRun: number
  answer: string
  actor: string
  steps: PfrBeat[]
  finalIndex: number
}

export const cellKey = (cell: PfrCell): string => `${cell[0]},${cell[1]}`

function readCells(raw: unknown): PfrCell[] {
  if (!Array.isArray(raw)) return []
  const out: PfrCell[] = []
  for (const item of raw) {
    if (!Array.isArray(item) || item.length < 2) continue
    const [r, c] = item
    if (typeof r !== 'number' || typeof c !== 'number' || !Number.isFinite(r) || !Number.isFinite(c)) continue
    out.push([Math.round(r), Math.round(c)])
  }
  return out
}

function anchorAt(cells: PfrCell[]): PfrCell[] {
  const minR = Math.min(...cells.map((c) => c[0]))
  const minC = Math.min(...cells.map((c) => c[1]))
  return cells
    .map(([r, c]) => [r - minR, c - minC] as PfrCell)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
}

/** The four quarter turns of a shape, duplicates removed. Never a reflection. */
export function turnsOf(cells: PfrCell[]): PfrCell[][] {
  const seen = new Set<string>()
  const out: PfrCell[][] = []
  let cur = anchorAt(cells)
  for (let i = 0; i < 4; i++) {
    const k = cur.map(cellKey).join(' ')
    if (!seen.has(k)) {
      seen.add(k)
      out.push(cur)
    }
    cur = anchorAt(cur.map(([r, c]) => [c, -r] as PfrCell))
  }
  return out
}

/** Longest straight line of touching squares — unchanged by turning. */
export function longestRun(cells: PfrCell[]): number {
  const set = new Set(cells.map(cellKey))
  let best = 0
  for (const [r, c] of cells) {
    if (!set.has(cellKey([r, c - 1]))) {
      let k = 0
      while (set.has(cellKey([r, c + k]))) k++
      if (k > best) best = k
    }
    if (!set.has(cellKey([r - 1, c]))) {
      let k = 0
      while (set.has(cellKey([r + k, c]))) k++
      if (k > best) best = k
    }
  }
  return best
}

/**
 * Where each of the winner's pieces actually lands in the hole, so the final
 * beat can colour the hole in square by square instead of just declaring it
 * full. Turns only. Returns null when nothing seats (never for real params).
 */
export function seatPieces(hole: PfrCell[], pieces: PfrCell[][]): Record<string, number> | null {
  const total = pieces.reduce((sum, p) => sum + p.length, 0)
  if (total !== hole.length || pieces.length === 0) return null
  const turns = pieces.map(turnsOf)

  const walk = (
    remaining: Set<string>,
    left: number[],
    placed: Record<string, number>,
  ): Record<string, number> | null => {
    if (remaining.size === 0) return left.length === 0 ? placed : null
    if (left.length === 0) return null
    let anchor: PfrCell | null = null
    for (const k of remaining) {
      const [r, c] = k.split(',').map(Number) as PfrCell
      if (!anchor || r < anchor[0] || (r === anchor[0] && c < anchor[1])) anchor = [r, c]
    }
    if (!anchor) return null

    for (const index of left) {
      const rest = left.filter((i) => i !== index)
      for (const turn of turns[index]) {
        const dr = anchor[0] - turn[0][0]
        const dc = anchor[1] - turn[0][1]
        const keys = turn.map(([r, c]) => cellKey([r + dr, c + dc]))
        if (!keys.every((k) => remaining.has(k))) continue
        const next = new Set(remaining)
        const withPiece = { ...placed }
        for (const k of keys) {
          next.delete(k)
          withPiece[k] = index
        }
        const done = walk(next, rest, withPiece)
        if (done) return done
      }
    }
    return null
  }

  return walk(new Set(hole.map(cellKey)), pieces.map((_, i) => i), {})
}

export function buildPiecesFillRegionSteps(raw: unknown, lang: Lang): PfrStoryboard {
  const p = (raw ?? {}) as Partial<PfrParams>
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ask: PfrAsk = ASKS.includes(p.ask as PfrAsk) ? (p.ask as PfrAsk) : 'single-piece'
  const actor = typeof p.actor === 'string' && p.actor.trim().length > 0 ? p.actor : 'Nadia'
  const region = readCells(p.region)
  const hole = readCells(p.hole)
  const rawOptions = Array.isArray(p.options)
    ? p.options
        .map((option) => (Array.isArray(option) ? option.map(readCells).filter((piece) => piece.length > 0) : []))
        .filter((option) => option.length > 0)
    : []

  const n = hole.length
  const holeRun = hole.length > 0 ? longestRun(hole) : 0
  const options: PfrOption[] = rawOptions.map((pieces, i) => ({
    label: OPTION_LABELS[i] ?? '?',
    pieces,
    squares: pieces.reduce((sum, piece) => sum + piece.length, 0),
    run: Math.max(...pieces.map(longestRun)),
  }))
  const answerIndex =
    typeof p.answerIndex === 'number' && p.answerIndex >= 0 && p.answerIndex < options.length
      ? Math.round(p.answerIndex)
      : 0
  const answer = options[answerIndex]?.label ?? 'A'
  const pair = ask === 'pair-of-pieces'

  const steps: PfrBeat[] = []
  type Draft = Partial<PfrBeat> & { phase: PfrPhase; caption: string }
  const push = (draft: Draft) => {
    steps.push({
      optionIndex: null,
      optionLabel: null,
      tone: 'neutral',
      verdict: null,
      trap: false,
      seated: null,
      reveal: null,
      hold: 2400,
      ...draft,
    })
  }

  push({
    phase: 'setup',
    caption: T(
      `${actor}'s board is tiled everywhere except this hole. Count it: ${n} squares, and its longest straight line is ${holeRun}.`,
      `Papan ${actor} sudah tertutup ubin kecuali lubang ini. Hitung: ${n} kotak, dan garis lurus terpanjangnya ${holeRun} kotak.`,
    ),
    hold: 2800,
  })
  push({
    phase: 'rule',
    caption: pair
      ? T(
          `Two pieces must fill it together, and each one may be TURNED any way you like — but never FLIPPED over.`,
          `Dua kepingan harus mengisinya bersama, dan tiap kepingan boleh DIPUTAR sesukamu — tetapi tidak pernah boleh DIBALIK.`,
        )
      : T(
          `One piece must fill it, and it may be TURNED any way you like — but never FLIPPED over.`,
          `Satu kepingan harus mengisinya, dan boleh DIPUTAR sesukamu — tetapi tidak pernah boleh DIBALIK.`,
        ),
    hold: 2600,
  })

  // Rule the wrong ones out in the order a child can check them: the square
  // count first, then the straight line, then the handedness.
  const rank = (option: PfrOption): number => {
    if (option.squares !== n) return 0
    if (option.run > holeRun) return 1
    return 2
  }
  const losers = options
    .map((option, i) => ({ option, i }))
    .filter(({ i }) => i !== answerIndex)
    .sort((a, b) => rank(a.option) - rank(b.option) || a.i - b.i)

  for (const { option, i } of losers) {
    const kind = rank(option)
    push({
      phase: kind === 2 ? 'trap' : 'try',
      optionIndex: i,
      optionLabel: option.label,
      tone: 'wrong',
      trap: kind === 2,
      verdict:
        kind === 0
          ? T(`${option.squares} squares, not ${n}`, `${option.squares} kotak, bukan ${n}`)
          : kind === 1
            ? T(`line of ${option.run} > ${holeRun}`, `garis ${option.run} > ${holeRun}`)
            : T(`mirror image`, `bayangan cermin`),
      caption:
        kind === 0
          ? T(
              `${option.label} carries ${option.squares} squares and the hole needs ${n}. Too ${option.squares > n ? 'many' : 'few'} — it cannot fit however you turn it. Cross it off.`,
              `${option.label} punya ${option.squares} kotak sedangkan lubangnya butuh ${n}. Ter${option.squares > n ? 'lalu banyak' : 'lalu sedikit'} — diputar bagaimanapun tetap tidak pas. Coret.`,
            )
          : kind === 1
            ? T(
                `${option.label} has ${option.squares} squares — the right number — but a straight line of ${option.run}, and the hole's longest line is only ${holeRun}. Turning never shortens a line, so ${option.label} cannot even sit inside. Cross it off.`,
                `${option.label} punya ${option.squares} kotak — jumlahnya pas — tetapi garis lurusnya ${option.run}, sedangkan garis terpanjang di lubang hanya ${holeRun}. Memutar tidak pernah memendekkan garis, jadi ${option.label} tidak bisa masuk sama sekali. Coret.`,
              )
            : T(
                `${option.label} has ${option.squares} squares and no line too long — it looks perfect. But it is a mirror image: its corner turns the other way. Turn it once, twice, three times, four — the corner never swaps sides, so a square always pokes out. Cross it off.`,
                `${option.label} punya ${option.squares} kotak dan garisnya pun tidak kepanjangan — kelihatannya pas. Tetapi bentuknya bayangan cermin: tekukannya menghadap sebaliknya. Putar sekali, dua kali, tiga, empat — tekukannya tidak pernah pindah sisi, jadi selalu ada kotak yang menonjol. Coret.`,
              ),
      hold: kind === 2 ? 3400 : 2800,
    })
  }

  const winner = options[answerIndex]
  push({
    phase: 'result',
    optionIndex: answerIndex,
    optionLabel: answer,
    tone: 'right',
    seated: winner ? seatPieces(hole, winner.pieces) : null,
    caption: pair
      ? T(
          `That leaves ${answer}. Turn its two pieces and lay them in: together they cover all ${n} squares, no gap and nothing on top of anything. The answer is ${answer}.`,
          `Tinggal ${answer}. Putar kedua kepingannya lalu masukkan: bersama-sama menutup semua ${n} kotak, tanpa celah dan tanpa bertumpuk. Jawabannya ${answer}.`,
        )
      : T(
          `That leaves ${answer}. Turn it and drop it in: all ${n} squares of the hole are covered and nothing sticks out. The answer is ${answer}.`,
          `Tinggal ${answer}. Putar lalu masukkan: semua ${n} kotak lubang tertutup dan tidak ada yang menonjol. Jawabannya ${answer}.`,
        ),
    reveal: answer,
    hold: 0,
  })

  return {
    ask,
    region,
    hole,
    options,
    n,
    holeRun,
    answer,
    actor,
    steps,
    finalIndex: steps.length - 1,
  }
}
