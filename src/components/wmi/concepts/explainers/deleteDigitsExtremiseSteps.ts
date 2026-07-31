import type { Lang } from './makeTenSteps'

// `delete-digits-extremise`. A strip of digits, a fixed number of deletions, and
// one rule that decides everything: the survivors keep the order they are
// written in. Deleting thins the line out — it never reorders it.
//
// The instinct this storyboard has to beat is "grab the biggest digits and line
// them up", so beat 2 draws exactly that picture and shows where those digits
// actually stand. After that, every kept digit is chosen out loud: the front
// digit is worth the most, it must still leave enough digits behind it, so it
// can only come from a window — and the best digit in that window wins.
//
// Mirrors api/services/wmi/concepts/delete-digits-extremise. Params arrive as
// `unknown` from the DB, so everything is re-derived and clamped here; the
// storyboard can never narrate a walk that lands somewhere other than `result`.
export type DeleteObjective = 'max' | 'min'
export type DeleteAsk = 'the-number' | 'digit-sum-of-middle-three'
export type DeletePhase = 'setup' | 'trap' | 'pick' | 'forced' | 'tail' | 'result' | 'sum'

/** What one cell of the source strip looks like on a given beat. */
export type CellState = 'idle' | 'window' | 'chosen' | 'kept' | 'struck' | 'wrong'

export interface DeleteDigitsParams {
  source: 'explicit' | 'concat'
  digits: string
  concatTo: number | null
  k: number
  objective: DeleteObjective
  ask: DeleteAsk
}

export interface DeleteBeat {
  phase: DeletePhase
  caption: string
  /** Index-aligned with `digits` — one state per cell of the source strip. */
  cells: CellState[]
  /** The answer strip as it has grown so far, left to right. */
  kept: string
  /** Positions within `kept` to ring (the three middle digits on the sum beat). */
  keptLit: number[]
  /** Deletions still unspent at the end of this beat. */
  budgetLeft: number
  trap: boolean
  /** The sorted-digits number this beat is warning about (trap beat only). */
  trapNumber: string | null
  result: boolean
  /** The answer — non-null ONLY on the final beat. */
  reveal: string | null
  hold: number
}

export interface DeleteStoryboard {
  digits: string
  k: number
  keep: number
  objective: DeleteObjective
  ask: DeleteAsk
  /** The extremised number left standing. */
  result: string
  /** What the question actually asks for (the number, or the middle-three sum). */
  answer: string
  middle: string[]
  middleSum: number
  steps: DeleteBeat[]
  finalIndex: number
}

interface Pick {
  slot: number
  from: number
  to: number
  index: number
  digit: string
  deleted: number
}

const FALLBACK_DIGITS = '7503375812'

const str = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback

/** Leading-digit walk: each slot takes the best digit that still leaves room. */
function selectionPicks(digits: string, k: number, objective: DeleteObjective): Pick[] {
  const keep = digits.length - k
  const picks: Pick[] = []
  let start = 0
  for (let slot = 0; slot < keep; slot++) {
    const to = digits.length - (keep - slot)
    let best = start
    for (let i = start + 1; i <= to; i++) {
      if (objective === 'max' ? digits[i] > digits[best] : digits[i] < digits[best]) best = i
    }
    picks.push({ slot, from: start, to, index: best, digit: digits[best], deleted: best - start })
    start = best + 1
  }
  return picks
}

/** The `keep` most extreme digits by value, sorted — the order-losing trap. */
function trapNumberOf(digits: string, keep: number, objective: DeleteObjective): string {
  const sorted = digits.split('').sort()
  return (objective === 'max' ? sorted.slice(sorted.length - keep).reverse() : sorted.slice(0, keep)).join('')
}

/** Where those same digits actually sit on the strip (leftmost occurrences). */
function trapPositions(digits: string, keep: number, objective: DeleteObjective): number[] {
  const order = digits
    .split('')
    .map((d, i) => ({ d, i }))
    .sort((a, b) => (a.d === b.d ? a.i - b.i : objective === 'max' ? (a.d < b.d ? 1 : -1) : a.d < b.d ? -1 : 1))
  return order.slice(0, keep).map((x) => x.i)
}

export function buildDeleteDigitsExtremiseSteps(raw: unknown, lang: Lang): DeleteStoryboard {
  const p = (raw ?? {}) as Partial<DeleteDigitsParams>
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const rawDigits = str(p.digits, FALLBACK_DIGITS)
  const digits = /^[0-9]{2,}$/.test(rawDigits) ? rawDigits : FALLBACK_DIGITS
  const objective: DeleteObjective = p.objective === 'min' ? 'min' : 'max'
  const ask: DeleteAsk = p.ask === 'digit-sum-of-middle-three' ? 'digit-sum-of-middle-three' : 'the-number'
  const len = digits.length
  const kRaw = typeof p.k === 'number' && Number.isFinite(p.k) ? Math.round(p.k) : 1
  const k = Math.max(1, Math.min(len - 1, kRaw))
  const keep = len - k

  const picks = selectionPicks(digits, k, objective)
  const result = picks.map((pk) => pk.digit).join('')
  const last = picks[picks.length - 1]
  const tailDeleted = len - (last.index + 1)
  const midStart = Math.max(0, Math.floor((keep - 3) / 2))
  const middle = keep >= 3 ? result.slice(midStart, midStart + 3).split('') : []
  const middleSum = middle.reduce((sum, d) => sum + Number(d), 0)
  const wantsSum = ask === 'digit-sum-of-middle-three' && middle.length === 3
  const answer = wantsSum ? String(middleSum) : result

  const big = objective === 'max'
  const best_en = big ? 'biggest' : 'smallest'
  const best_id = big ? 'terbesar' : 'terkecil'
  const trapNumber = trapNumberOf(digits, keep, objective)
  const trapAt = new Set(trapPositions(digits, keep, objective))

  const steps: DeleteBeat[] = []
  type Draft = Partial<DeleteBeat> & { phase: DeletePhase; caption: string; cells: CellState[] }
  const push = (draft: Draft) => {
    steps.push({
      kept: '',
      keptLit: [],
      budgetLeft: k,
      trap: false,
      trapNumber: null,
      result: false,
      reveal: null,
      hold: 2200,
      ...draft,
    })
  }

  // Running picture of the strip: everything before `start` is settled.
  const settled = (upToSlot: number): CellState[] => {
    const cells: CellState[] = new Array(len).fill('idle')
    for (let s = 0; s < upToSlot; s++) {
      const pk = picks[s]
      for (let i = pk.from; i < pk.index; i++) cells[i] = 'struck'
      cells[pk.index] = 'kept'
    }
    return cells
  }
  const keptUpTo = (slot: number) =>
    picks
      .slice(0, slot)
      .map((pk) => pk.digit)
      .join('')
  const budgetAfter = (slot: number) =>
    k - picks.slice(0, slot).reduce((sum, pk) => sum + pk.deleted, 0)

  // ── Beat 1 — the board and the budget. ─────────────────────────────────────
  push({
    phase: 'setup',
    cells: new Array(len).fill('idle'),
    caption: T(
      `${len} digits on the board: ${digits}. Delete exactly ${k}, and the ${keep} left over stay in the order they are written.`,
      `Ada ${len} angka di papan: ${digits}. Hapus tepat ${k} angka, dan ${keep} angka yang tersisa tetap pada urutan aslinya.`,
    ),
    hold: 2600,
  })

  // ── Beat 2 — the trap, drawn instead of told. ──────────────────────────────
  push({
    phase: 'trap',
    cells: digits.split('').map((_, i) => (trapAt.has(i) ? 'wrong' : 'idle')),
    trap: true,
    trapNumber,
    caption: T(
      `Tempting: pick out the ${keep} ${best_en} digits and line them up — ${trapNumber}. But look where they really stand. Deleting can rub a digit out; it can never slide one along. ${digits} can never read ${trapNumber}.`,
      `Godaan: ambil ${keep} angka ${best_id} lalu jejerkan — ${trapNumber}. Tapi lihat posisi aslinya. Menghapus bisa membuang angka, tapi tidak pernah bisa menggeser angka. ${digits} tidak mungkin terbaca ${trapNumber}.`,
    ),
    hold: 3400,
  })

  // ── Beats 3+ — one beat per slot where a real choice existed. ──────────────
  // Window width is always `budgetLeft + 1`, so the free slots are a prefix and
  // the forced ones are the suffix.
  const choiceSlots = picks.filter((pk) => pk.to > pk.from)
  const forcedSlots = picks.filter((pk) => pk.to === pk.from)

  for (const pk of choiceSlots) {
    const cells = settled(pk.slot)
    for (let i = pk.from; i <= pk.to; i++) cells[i] = 'window'
    for (let i = pk.from; i < pk.index; i++) cells[i] = 'struck'
    cells[pk.index] = 'chosen'
    const windowText = digits.slice(pk.from, pk.to + 1)
    const behind = keep - 1 - pk.slot
    const left = budgetAfter(pk.slot + 1)

    const caption =
      pk.slot === 0
        ? T(
            `The front digit is worth the most, so make it as ${best_en} as you can. It still needs ${behind} digits standing behind it, so it can only come from the first ${pk.to + 1}: ${windowText}. The ${best_en} there is ${pk.digit}` +
              (pk.deleted > 0
                ? ` — take it, and the ${pk.deleted} in front of it go.`
                : ` — and it is already at the front, so nothing goes yet.`),
            `Angka paling depan paling menentukan, jadi buat angka depan se${big ? 'besar' : 'kecil'} mungkin. Di belakangnya masih harus ada ${behind} angka, jadi angka depan hanya boleh diambil dari ${pk.to + 1} angka pertama: ${windowText}. Yang ${best_id} di situ adalah ${pk.digit}` +
              (pk.deleted > 0
                ? ` — ambil itu, dan ${pk.deleted} angka di depannya terhapus.`
                : ` — dan itu memang sudah paling depan, jadi belum ada yang terhapus.`),
          )
        : T(
            `Digit ${pk.slot + 1} plays the same game: ${behind} must still stand behind it, so it comes from ${windowText}. The ${best_en} is ${pk.digit}` +
              (pk.deleted > 0
                ? `, so ${pk.deleted} more go. ${left} deletions left.`
                : `, and it is already next in line — nothing extra goes. ${left} deletions left.`),
            `Angka ke-${pk.slot + 1} main dengan aturan yang sama: di belakangnya harus tersisa ${behind} angka, jadi diambil dari ${windowText}. Yang ${best_id} adalah ${pk.digit}` +
              (pk.deleted > 0
                ? `, jadi ${pk.deleted} angka lagi terhapus. Sisa hapusan ${left}.`
                : `, dan itu memang giliran berikutnya — tidak ada tambahan yang terhapus. Sisa hapusan ${left}.`),
          )

    push({
      phase: 'pick',
      cells,
      kept: keptUpTo(pk.slot + 1),
      budgetLeft: left,
      caption,
      hold: pk.slot === 0 ? 3000 : 2400,
    })
  }

  // ── The spent budget forces every remaining slot at once. ──────────────────
  if (forcedSlots.length > 0) {
    const cells = settled(picks.length)
    for (const pk of forcedSlots) cells[pk.index] = 'chosen'
    push({
      phase: 'forced',
      cells,
      kept: result,
      budgetLeft: 0,
      caption: T(
        `All ${k} deletions are spent, so there is no choice left: the last ${forcedSlots.length} ${forcedSlots.length === 1 ? 'digit stays' : 'digits stay'} exactly as ${forcedSlots.length === 1 ? 'it is' : 'they are'} — ${forcedSlots.map((pk) => pk.digit).join('')}.`,
        `${k} hapusan sudah terpakai semua, jadi tidak ada pilihan lagi: ${forcedSlots.length} angka terakhir tinggal ikut apa adanya — ${forcedSlots.map((pk) => pk.digit).join('')}.`,
      ),
      hold: 2400,
    })
  }

  // ── Leftover deletions can only come off the back. ─────────────────────────
  if (tailDeleted > 0) {
    const cells = settled(picks.length)
    for (let i = last.index + 1; i < len; i++) cells[i] = 'struck'
    push({
      phase: 'tail',
      cells,
      kept: result,
      budgetLeft: 0,
      caption: T(
        `All ${keep} digits are chosen and ${tailDeleted} ${tailDeleted === 1 ? 'deletion is' : 'deletions are'} still unspent — the only digits left to spend them on are the ${tailDeleted} hanging off the back.`,
        `${keep} angka sudah terpilih dan masih ada ${tailDeleted} hapusan yang belum terpakai — satu-satunya yang bisa dihapus tinggal ${tailDeleted} angka yang menggantung di belakang.`,
      ),
      hold: 2400,
    })
  }

  // ── The number that is left. ───────────────────────────────────────────────
  const finalCells = settled(picks.length)
  for (let i = last.index + 1; i < len; i++) finalCells[i] = 'struck'
  push({
    phase: 'result',
    cells: finalCells,
    kept: result,
    budgetLeft: 0,
    caption: T(
      `The digits still standing, read left to right, are ${result} — and every one of them is still where it started. That is the ${big ? 'biggest' : 'smallest'} number ${digits} can be cut down to.`,
      `Angka yang masih berdiri, dibaca dari kiri ke kanan, adalah ${result} — dan semuanya masih di tempat asalnya. Itulah bilangan ${best_id} yang bisa dibentuk dari ${digits}.`,
    ),
    result: !wantsSum,
    reveal: wantsSum ? null : answer,
    hold: wantsSum ? 2800 : 0,
  })

  // ── The question wanted the middle three, not the number. ──────────────────
  if (wantsSum) {
    push({
      phase: 'sum',
      cells: finalCells,
      kept: result,
      keptLit: [midStart, midStart + 1, midStart + 2],
      budgetLeft: 0,
      caption: T(
        `The question does not want ${result} itself — it wants its three middle digits: ${middle.join(', ')}. So ${middle.join(' + ')} = ${middleSum}.`,
        `Yang ditanya bukan ${result}-nya — tapi tiga angka tengahnya: ${middle.join(', ')}. Jadi ${middle.join(' + ')} = ${middleSum}.`,
      ),
      result: true,
      reveal: answer,
      hold: 0,
    })
  }

  return {
    digits,
    k,
    keep,
    objective,
    ask,
    result,
    answer,
    middle,
    middleSum,
    steps,
    finalIndex: steps.length - 1,
  }
}
