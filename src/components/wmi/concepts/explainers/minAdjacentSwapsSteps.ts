import type { SwapKind, TokenState } from '../min-adjacent-swaps'
import type { Lang } from './makeTenSteps'

// C8 `min-adjacent-swaps`. The fewest neighbour swaps that sort a row is the
// number of pairs sitting the wrong way round — every pair, not just the ones
// standing side by side. This storyboard never asserts that. It parks the
// tempting "only count neighbours" answer on its own rose beat, then counts the
// wrong pairs one item at a time, then performs the swaps ONE AT A TIME so the
// child watches the running total fall by exactly 1 per swap and land on 0.
//
// Mirrors api/services/wmi/concepts/min-adjacent-swaps (the frontend keeps its
// own copy of the arithmetic, as every concept storyboard here does).

export type SwapOrder = 'asc' | 'desc'
export type SwapPhase = 'setup' | 'trap' | 'count' | 'total' | 'swap' | 'result'

const KINDS: readonly SwapKind[] = ['cards', 'flags', 'animals']
const MAX_LEN = 7

/** Mirrors the generator's params. */
export interface MinSwapParams {
  kind: SwapKind
  order: SwapOrder
  name: string
  values: number[]
}

export interface SwapBeat {
  phase: SwapPhase
  caption: string
  /** The row on this beat, left to right. */
  values: number[]
  states: TokenState[]
  /** Dashed arc joining one wrong pair (the trap beat). */
  link: [number, number] | null
  /** Two-headed arrow over the neighbour pair that just traded places. */
  swap: [number, number] | null
  /** Running count of wrong pairs found so far, or still left during the swaps. */
  tally: number | null
  tallyLabel: string | null
  trap: boolean
  /** The tempting wrong number this beat is warning about. */
  trapLabel: string | null
  swapsDone: number
  /** The answer — non-null ONLY on the final beat. */
  reveal: number | null
  result: boolean
  hold: number
}

export interface MinSwapStoryboard {
  kind: SwapKind
  order: SwapOrder
  name: string
  values: number[]
  /** The row the child is aiming for; also the hue order for the tokens. */
  target: number[]
  /** The answer: how many pairs sit the wrong way round. */
  inversions: number
  steps: SwapBeat[]
  finalIndex: number
}

const str = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback

/** True when `a` sitting to the LEFT of `b` is the wrong way round. */
export function isWrongPair(a: number, b: number, order: SwapOrder): boolean {
  return order === 'asc' ? a > b : a < b
}

export function wrongPairsToRight(values: readonly number[], order: SwapOrder): number[] {
  return values.map((v, i) => {
    let n = 0
    for (let j = i + 1; j < values.length; j++) if (isWrongPair(v, values[j], order)) n++
    return n
  })
}

export function inversionCount(values: readonly number[], order: SwapOrder): number {
  return wrongPairsToRight(values, order).reduce((a, b) => a + b, 0)
}

function coerce(raw: unknown): MinSwapParams {
  const p = (raw ?? {}) as Partial<MinSwapParams>
  const ok =
    Array.isArray(p.values) &&
    p.values.length >= 2 &&
    p.values.every((v) => typeof v === 'number' && Number.isFinite(v)) &&
    new Set(p.values).size === p.values.length
  return {
    kind: KINDS.includes(p.kind as SwapKind) ? (p.kind as SwapKind) : 'cards',
    order: p.order === 'desc' ? 'desc' : 'asc',
    name: str(p.name, 'Ayu'),
    values: ok ? (p.values as number[]).slice(0, MAX_LEN).map((v) => Math.round(v)) : [3, 5, 1, 4, 2],
  }
}

export function buildMinAdjacentSwapsSteps(raw: unknown, lang: Lang): MinSwapStoryboard {
  const p = coerce(raw)
  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const { order, name, values, kind } = p
  const n = values.length

  const target = [...values].sort((a, b) => (order === 'asc' ? a - b : b - a))
  const perItem = wrongPairsToRight(values, order)
  const inversions = perItem.reduce((a, b) => a + b, 0)
  const rowText = (row: readonly number[]) => row.join(', ')
  const compare = T(order === 'asc' ? 'smaller' : 'bigger', order === 'asc' ? 'lebih kecil' : 'lebih besar')

  // Wrong pairs that happen to stand side by side — the tempting undercount —
  // and the left-most wrong pair that does NOT, which is what proves it short.
  let neighbours = 0
  for (let i = 0; i + 1 < n; i++) if (isWrongPair(values[i], values[i + 1], order)) neighbours++
  let distant: { i: number; j: number } | null = null
  for (let i = 0; i < n && !distant; i++) {
    for (let j = i + 2; j < n; j++) {
      if (isWrongPair(values[i], values[j], order)) {
        distant = { i, j }
        break
      }
    }
  }

  const blank = (): TokenState[] => Array.from({ length: n }, () => 'normal' as TokenState)

  const steps: SwapBeat[] = []
  type Draft = Partial<SwapBeat> & { phase: SwapPhase; caption: string; values: number[] }
  const push = (draft: Draft) =>
    steps.push({
      states: blank(),
      link: null,
      swap: null,
      tally: null,
      tallyLabel: null,
      trap: false,
      trapLabel: null,
      swapsDone: 0,
      reveal: null,
      result: false,
      hold: 2200,
      ...draft,
    })

  // ── Beat 1: the row as given, and what it must become. ─────────────────────
  push({
    phase: 'setup',
    values: [...values],
    caption: T(
      `${name} has this row: ${rowText(values)}. It must end up ${rowText(target)}, and only two that stand side by side may ever trade places.`,
      `Baris ${name} sekarang: ${rowText(values)}. Harus jadi ${rowText(target)}, dan hanya dua yang bersebelahan boleh bertukar.`,
    ),
    hold: 2800,
  })

  // ── Beat 2: the trap. Only offered when a wrong pair sits apart — that is
  // exactly when "count the side-by-side ones" is short of the truth. ────────
  if (distant) {
    const states = blank()
    for (let i = 0; i + 1 < n; i++) {
      if (isWrongPair(values[i], values[i + 1], order)) {
        states[i] = 'wrong'
        states[i + 1] = 'wrong'
      }
    }
    const a = values[distant.i]
    const b = values[distant.j]
    push({
      phase: 'trap',
      values: [...values],
      states,
      link: [distant.i, distant.j],
      trap: true,
      trapLabel: T(`${neighbours} swaps?`, `${neighbours} tukar?`),
      caption: T(
        `Tempting: only ${neighbours} pairs look wrong, because only those stand side by side. But ${a} is still in front of ${b} — that pair is the wrong way round too, and a wrong pair does not have to be side by side.`,
        `Godaan: kelihatannya cuma ${neighbours} pasang yang terbalik, karena cuma itu yang bersebelahan. Padahal ${a} masih di depan ${b} — pasangan itu juga terbalik, dan pasangan terbalik tidak harus bersebelahan.`,
      ),
      hold: 3400,
    })
  }

  // ── Beats 3…: count the wrong pairs, one item at a time. The last item has
  // nothing to its right, so it is skipped rather than shown as a fake 0. ────
  let running = 0
  for (let i = 0; i < n - 1; i++) {
    const states = blank()
    states[i] = 'focus'
    for (let j = i + 1; j < n; j++) if (isWrongPair(values[i], values[j], order)) states[j] = 'wrong'
    const c = perItem[i]
    running += c
    push({
      phase: 'count',
      values: [...values],
      states,
      tally: running,
      tallyLabel: T(`${running} wrong pairs`, `${running} pasang terbalik`),
      caption:
        c > 0
          ? T(
              `Look at ${values[i]}. To its right, ${c} ${c === 1 ? 'number is' : 'numbers are'} ${compare} than it — that is ${c} wrong ${c === 1 ? 'pair' : 'pairs'}. Running total: ${running}.`,
              `Lihat ${values[i]}. Di sebelah kanannya ada ${c} angka yang ${compare} — berarti ${c} pasang terbalik. Total sekarang: ${running}.`,
            )
          : T(
              `Look at ${values[i]}. Nothing to its right is ${compare} than it, so it makes 0 wrong pairs. Running total: ${running}.`,
              `Lihat ${values[i]}. Tidak ada angka di kanannya yang ${compare}, jadi 0 pasang terbalik. Total tetap: ${running}.`,
            ),
      hold: c > 0 ? 2400 : 1900,
    })
  }

  // ── The total, and why it is a floor and not just a count. ────────────────
  const sumExpr = perItem.slice(0, -1).join(' + ')
  push({
    phase: 'total',
    values: [...values],
    tally: inversions,
    tallyLabel: T(`${inversions} wrong pairs`, `${inversions} pasang terbalik`),
    caption: T(
      `${sumExpr} = ${inversions} wrong pairs altogether. One swap trades two neighbours, so it flips exactly one pair — this row can never be fixed in fewer than ${inversions} swaps.`,
      `${sumExpr} = ${inversions} pasang terbalik semuanya. Satu tukar menukar dua tetangga, jadi tepat satu pasang yang terbalik dibetulkan — baris ini tidak mungkin beres kurang dari ${inversions} kali tukar.`,
    ),
    hold: 3200,
  })

  // ── Now do it. Always swap the LEFT-MOST neighbour pair that is wrong: each
  // such swap removes exactly one wrong pair, so the run is exactly
  // `inversions` long and the tally ticks 1 → 0 with nothing left over. ──────
  const row = [...values]
  let done = 0
  for (let guard = 0; guard <= (n * (n - 1)) / 2; guard++) {
    let at = -1
    for (let i = 0; i + 1 < n; i++) {
      if (isWrongPair(row[i], row[i + 1], order)) {
        at = i
        break
      }
    }
    if (at < 0) break
    const left = row[at]
    const right = row[at + 1]
    row[at] = right
    row[at + 1] = left
    done += 1
    const remaining = inversionCount(row, order)
    const last = remaining === 0
    const states = blank()
    if (last) {
      for (let i = 0; i < n; i++) states[i] = 'done'
    } else {
      states[at] = 'focus'
      states[at + 1] = 'focus'
    }
    push({
      phase: last ? 'result' : 'swap',
      values: [...row],
      states,
      swap: [at, at + 1],
      tally: remaining,
      tallyLabel: T(`${remaining} wrong pairs left`, `sisa ${remaining} pasang terbalik`),
      swapsDone: done,
      caption: last
        ? T(
            `Sorted in ${done} ${done === 1 ? 'swap' : 'swaps'}: ${rowText(row)}. Every swap cleared exactly one wrong pair and there were ${inversions} of them, so ${inversions} is both enough and the fewest.`,
            `Urut setelah ${done} kali tukar: ${rowText(row)}. Tiap tukar membereskan tepat satu pasang terbalik dan tadi ada ${inversions} pasang, jadi ${inversions} kali tukar itu cukup sekaligus paling sedikit.`,
          )
        : T(
            `Swap ${left} and ${right} — side by side and the wrong way round. That clears exactly 1 pair, ${remaining} to go.`,
            `Tukar ${left} dan ${right} — bersebelahan dan terbalik. Tepat 1 pasang beres, tinggal ${remaining}.`,
          ),
      reveal: last ? inversions : null,
      result: last,
      hold: last ? 0 : 2000,
    })
  }

  // Degenerate params (an already-sorted row) still deserve a landing beat.
  if (!steps.some((s) => s.result)) {
    push({
      phase: 'result',
      values: [...row],
      states: Array.from({ length: n }, () => 'done' as TokenState),
      tally: 0,
      tallyLabel: T('0 wrong pairs left', 'sisa 0 pasang terbalik'),
      swapsDone: done,
      caption: T(
        `The row is already ${rowText(target)} — there are no wrong pairs, so ${inversions} swaps are needed.`,
        `Barisnya sudah ${rowText(target)} — tidak ada pasangan terbalik, jadi butuh ${inversions} kali tukar.`,
      ),
      reveal: inversions,
      result: true,
      hold: 0,
    })
  }

  return {
    kind,
    order,
    name,
    values,
    target,
    inversions,
    steps,
    finalIndex: steps.length - 1,
  }
}
