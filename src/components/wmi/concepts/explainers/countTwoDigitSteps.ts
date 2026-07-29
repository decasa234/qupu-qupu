import type { Lang } from './makeTenSteps'

// N17 `count-two-digit-numbers`: walk 10..99 and keep every number that obeys a
// small set of digit rules, then report how many there are (or the spread
// between the biggest and the smallest one).
//
// The storyboard binds to the concept's own `params` vocabulary
// (api/services/wmi/concepts/count-two-digit-numbers/index.ts) and mirrors its
// three hint steps beat for beat:
//   1. two-digit means 10..99, so the tens digit is never 0   -> `space`
//   2. hold a tens digit still, walk the ones 0..9, mark hits -> `tens`/`units`/`mark`
//   3. count the marks (or take biggest − smallest)           -> `tally`/`smallest`/`largest`
// Nothing is asserted: every beat is a consequence of the grid already on
// screen, and only the last beat carries `answer`.

export type DigitCmp = 'gt' | 'lt' | 'eq'

export type CountTwoDigitConstraint =
  | { kind: 'tens'; cmp: DigitCmp; v: number }
  | { kind: 'units'; cmp: DigitCmp; v: number }
  | { kind: 'digit-sum'; v: number }
  | { kind: 'between'; lo: number; hi: number }

export type CountTwoDigitAsk = 'how-many' | 'largest-minus-smallest'

export type CountTwoDigitPhase =
  | 'space'
  | 'tens'
  | 'units'
  | 'mark'
  | 'tally'
  | 'trap'
  | 'smallest'
  | 'largest'
  | 'result'

export type CountTwoDigitTrapKind = 'leading-zero' | 'fencepost'

export interface CountTwoDigitStep {
  phase: CountTwoDigitPhase
  caption: string
  /** Tens digits (1..9) ruled out by this beat and everything before it. */
  deadRows: number[]
  /** Ones digits (0..9) ruled out by this beat and everything before it. */
  deadCols: number[]
  /** Every qualifying number — populated once `marksShown` is true. */
  marked: number[]
  marksShown: boolean
  /** Hits per tens row (index 0 = the 10s) once the tally is on screen. */
  rowCounts: number[] | null
  /** One-digit near-misses to flash in the ghost "0-" row (trap beat only). */
  zeroRowUnits: number[] | null
  /** Numbers to spotlight this beat. */
  focus: number[]
  showSmallest: boolean
  showLargest: boolean
  /** The landed answer — non-null on the final beat only. */
  answer: number | null
  result: boolean
  hold: number
}

export interface CountTwoDigitStoryboard {
  constraints: CountTwoDigitConstraint[]
  ask: CountTwoDigitAsk
  /** Every two-digit number obeying all the rules, ascending. */
  qualifying: number[]
  smallest: number
  largest: number
  answer: number
  /** Rule chips shown above the grid, already in `lang`. */
  rules: string[]
  /** One-digit near-misses ("08") when the leading-zero trap is claimed. */
  phantoms: number[]
  trapKind: CountTwoDigitTrapKind | null
  /** Render the greyed "0-" row under the header (leading-zero trap only). */
  showZeroRow: boolean
  /** Hits per tens row, index 0 = the 10s. */
  rowCounts: number[]
  steps: CountTwoDigitStep[]
  finalIndex: number
}

const TENS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const UNITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function cmpDigit(d: number, cmp: DigitCmp, v: number): boolean {
  if (cmp === 'gt') return d > v
  if (cmp === 'lt') return d < v
  return d === v
}

/** True when `n` obeys the single rule `c`. A one-digit n has tens digit 0 — which is exactly what makes the leading-zero trap computable. */
export function holdsFor(c: CountTwoDigitConstraint, n: number): boolean {
  const t = Math.floor(n / 10)
  const u = n % 10
  if (c.kind === 'tens') return cmpDigit(t, c.cmp, c.v)
  if (c.kind === 'units') return cmpDigit(u, c.cmp, c.v)
  if (c.kind === 'digit-sum') return t + u === c.v
  return n >= c.lo && n <= c.hi
}

/** The answer set, found by walking every two-digit number — never by a shortcut. */
export function qualifyingFor(cs: CountTwoDigitConstraint[]): number[] {
  const out: number[] = []
  for (let n = 10; n <= 99; n++) {
    if (cs.every((c) => holdsFor(c, n))) out.push(n)
  }
  return out
}

/** One-digit values that WOULD obey the rules if a leading zero were allowed. */
export function phantomsFor(cs: CountTwoDigitConstraint[]): number[] {
  const out: number[] = []
  for (let n = 0; n <= 9; n++) {
    if (cs.every((c) => holdsFor(c, n))) out.push(n)
  }
  return out
}

// Params arrive as plain JSON off the wire, so keep only shapes we can draw.
function sanitize(raw: unknown): CountTwoDigitConstraint[] {
  if (!Array.isArray(raw)) return []
  const out: CountTwoDigitConstraint[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    const kind = rec.kind
    const cmp = rec.cmp
    const v = rec.v
    const isCmp = cmp === 'gt' || cmp === 'lt' || cmp === 'eq'
    const isV = typeof v === 'number' && Number.isFinite(v)
    if ((kind === 'tens' || kind === 'units') && isCmp && isV) {
      out.push({ kind, cmp: cmp as DigitCmp, v: Math.trunc(v as number) })
    } else if (kind === 'digit-sum' && isV) {
      out.push({ kind: 'digit-sum', v: Math.trunc(v as number) })
    } else if (kind === 'between') {
      const lo = rec.lo
      const hi = rec.hi
      if (typeof lo === 'number' && Number.isFinite(lo) && typeof hi === 'number' && Number.isFinite(hi)) {
        out.push({ kind: 'between', lo: Math.trunc(lo), hi: Math.trunc(hi) })
      }
    }
  }
  return out
}

// Kid-facing wording, word-for-word the clauses the question body uses, so the
// animation can never drift from the stem or the breakdown highlights.
export function clauseOf(c: CountTwoDigitConstraint, lang: Lang): string {
  const id = lang === 'id'
  if (c.kind === 'tens') {
    if (c.cmp === 'gt') return id ? `angka puluhannya lebih dari ${c.v}` : `the tens digit is greater than ${c.v}`
    if (c.cmp === 'lt') return id ? `angka puluhannya kurang dari ${c.v}` : `the tens digit is less than ${c.v}`
    return id ? `angka puluhannya ${c.v}` : `the tens digit is ${c.v}`
  }
  if (c.kind === 'units') {
    if (c.cmp === 'gt') return id ? `angka satuannya lebih dari ${c.v}` : `the ones digit is greater than ${c.v}`
    if (c.cmp === 'lt') return id ? `angka satuannya kurang dari ${c.v}` : `the ones digit is less than ${c.v}`
    return id ? `angka satuannya ${c.v}` : `the ones digit is ${c.v}`
  }
  if (c.kind === 'digit-sum') {
    return id ? `jumlah kedua angkanya ${c.v}` : `the two digits add up to ${c.v}`
  }
  return id ? `nilainya dari ${c.lo} sampai ${c.hi}` : `the value is from ${c.lo} to ${c.hi}`
}

/** A tens row is dead under `c` when no ones digit 0..9 can rescue it. */
function rowsKilledBy(c: CountTwoDigitConstraint): number[] {
  const dead: number[] = []
  for (const t of TENS) {
    let alive = false
    for (const u of UNITS) {
      if (holdsFor(c, t * 10 + u)) {
        alive = true
        break
      }
    }
    if (!alive) dead.push(t)
  }
  return dead
}

/** Only a `units` rule kills whole columns — that is what makes it captionable. */
function colsKilledBy(c: CountTwoDigitConstraint): number[] {
  if (c.kind !== 'units') return []
  return UNITS.filter((u) => !cmpDigit(u, c.cmp, c.v))
}

function listDigits(xs: number[]): string {
  if (xs.length === 0) return '-'
  if (xs.length <= 5) return xs.join(', ')
  return `${xs[0]}-${xs[xs.length - 1]}`
}

function cap(s: string): string {
  return s.length > 0 ? s[0].toUpperCase() + s.slice(1) : s
}

/** How a one-digit near-miss looks once a child writes the leading zero. */
export function asLeadingZero(n: number): string {
  return n === 0 ? '0' : `0${n}`
}

export function buildCountTwoDigitSteps(
  rawConstraints: unknown,
  rawAsk: unknown,
  lang: Lang,
): CountTwoDigitStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const constraints = sanitize(rawConstraints)
  const ask: CountTwoDigitAsk = rawAsk === 'largest-minus-smallest' ? 'largest-minus-smallest' : 'how-many'

  const qualifying = qualifyingFor(constraints)
  const has = qualifying.length > 0
  const smallest = has ? qualifying[0] : 0
  const largest = has ? qualifying[qualifying.length - 1] : 0
  const answer = ask === 'how-many' ? qualifying.length : largest - smallest

  const rowCounts = TENS.map((tens) => qualifying.filter((n) => Math.floor(n / 10) === tens).length)
  const parts = rowCounts.filter((n) => n > 0)

  // --- elimination passes ------------------------------------------------
  const rowKillers = constraints.filter((c) => rowsKilledBy(c).length > 0)
  const deadRowSet = new Set<number>()
  for (const c of constraints) for (const r of rowsKilledBy(c)) deadRowSet.add(r)
  const deadRows = TENS.filter((r) => deadRowSet.has(r))
  const aliveRows = TENS.filter((r) => !deadRowSet.has(r))

  const unitRules = constraints.filter((c) => c.kind === 'units')
  const colKillers = unitRules.filter((c) => colsKilledBy(c).length > 0)
  const deadColSet = new Set<number>()
  for (const c of unitRules) for (const u of colsKilledBy(c)) deadColSet.add(u)
  const deadCols = UNITS.filter((u) => deadColSet.has(u))
  const aliveCols = UNITS.filter((u) => !deadColSet.has(u))
  const hasColumnBeat = colKillers.length > 0

  // Cells still standing after the row + column passes. When that already IS
  // the answer set the marking beat is a recolour; otherwise there is genuine
  // cell-by-cell work left (a digit sum, or a range cutting a row in half).
  const liveCells = aliveRows.length * aliveCols.length
  const residualWork = liveCells !== qualifying.length

  // --- trap --------------------------------------------------------------
  // Same priority the authored breakdown uses: the leading-zero over-count
  // first (only while it is down to a few near-misses), then the fencepost.
  const phantoms = phantomsFor(constraints)
  const leadingZero = has && phantoms.length > 0 && phantoms.length <= 3
  const onlyRule = constraints.length === 1 ? constraints[0] : null
  const fencepost =
    !leadingZero && has && ask === 'how-many' && onlyRule !== null && onlyRule.kind === 'between'
  const trapKind: CountTwoDigitTrapKind | null = leadingZero
    ? 'leading-zero'
    : fencepost
      ? 'fencepost'
      : null

  const rules = constraints.map((c) => cap(clauseOf(c, lang)))

  // --- beats -------------------------------------------------------------
  const steps: CountTwoDigitStep[] = []
  const base = {
    deadRows: [] as number[],
    deadCols: [] as number[],
    marked: [] as number[],
    marksShown: false,
    rowCounts: null as number[] | null,
    zeroRowUnits: null as number[] | null,
    focus: [] as number[],
    showSmallest: false,
    showLargest: false,
    answer: null as number | null,
    result: false,
  }

  // 1. the search space — and why a leading 0 is out before we start
  steps.push({
    ...base,
    phase: 'space',
    caption: t(
      'Two-digit numbers run 10 to 99. The tens digit is 1 to 9, never 0.',
      'Bilangan dua angka itu 10 sampai 99. Puluhannya 1 sampai 9, tidak pernah 0.',
    ),
    hold: 2200,
  })

  // 2. fix the tens: cross out whole decades that no ones digit can save
  const tensCaption =
    rowKillers.length > 0
      ? t(
          `${cap(rowKillers.map((c) => clauseOf(c, 'en')).join(' and '))} — tens left: ${listDigits(aliveRows)}.`,
          `${cap(rowKillers.map((c) => clauseOf(c, 'id')).join(' dan '))} — puluhan tinggal ${listDigits(aliveRows)}.`,
        )
      : t(
          'No whole ten is out yet — every tens digit 1 to 9 is still possible.',
          'Belum ada puluhan yang tercoret — semua puluhan 1 sampai 9 masih mungkin.',
        )
  steps.push({ ...base, phase: 'tens', caption: tensCaption, deadRows, hold: 2600 })

  // 3. now scan the ones digit across the rows that survived
  if (hasColumnBeat) {
    steps.push({
      ...base,
      phase: 'units',
      caption: t(
        `${cap(colKillers.map((c) => clauseOf(c, 'en')).join(' and '))} — ones left: ${listDigits(aliveCols)}.`,
        `${cap(colKillers.map((c) => clauseOf(c, 'id')).join(' dan '))} — satuan tinggal ${listDigits(aliveCols)}.`,
      ),
      deadRows,
      deadCols,
      hold: 2600,
    })
  }

  // 4. mark the survivors
  steps.push({
    ...base,
    phase: 'mark',
    caption: residualWork
      ? t(
          'Hold each tens digit still and walk the ones 0 to 9. Mark every number that fits.',
          'Tahan angka puluhannya, lalu jalan di satuan 0 sampai 9. Tandai yang cocok.',
        )
      : t(
          'Every square still standing obeys both rules — mark them all green.',
          'Semua kotak yang tersisa sudah menuruti aturan — tandai hijau semua.',
        ),
    deadRows,
    deadCols,
    marked: qualifying,
    marksShown: true,
    hold: 2800,
  })

  const trapCaption = (): string => {
    if (trapKind === 'leading-zero') {
      const shown = phantoms.map(asLeadingZero)
      const listed = shown.length === 2 ? shown.join(t(' and ', ' dan ')) : shown.join(', ')
      if (ask === 'how-many') {
        return phantoms.length > 1
          ? t(
              `${listed} obey the rules too, but they are not two-digit numbers — do not count them.`,
              `${listed} juga menuruti aturan, tapi bukan bilangan dua angka — jangan dihitung.`,
            )
          : t(
              `${listed} obeys the rules too, but it is not a two-digit number — do not count it.`,
              `${listed} juga menuruti aturan, tapi bukan bilangan dua angka — jangan dihitung.`,
            )
      }
      return t(
        `${asLeadingZero(phantoms[0])} is not a two-digit number, so the smallest is still ${smallest}.`,
        `${asLeadingZero(phantoms[0])} bukan bilangan dua angka, jadi yang terkecil tetap ${smallest}.`,
      )
    }
    if (trapKind === 'fencepost' && onlyRule !== null && onlyRule.kind === 'between') {
      const gap = onlyRule.hi - onlyRule.lo
      return t(
        `Careful: ${onlyRule.hi} − ${onlyRule.lo} = ${gap} forgets to count ${onlyRule.lo} itself.`,
        `Hati-hati: ${onlyRule.hi} − ${onlyRule.lo} = ${gap} lupa menghitung ${onlyRule.lo} sendiri.`,
      )
    }
    return ''
  }

  const marked = { deadRows, deadCols, marked: qualifying, marksShown: true }

  if (ask === 'how-many') {
    // 5. the leading-zero trap sits before the tally, so the count stays clean
    if (trapKind === 'leading-zero') {
      steps.push({
        ...base,
        ...marked,
        phase: 'trap',
        caption: trapCaption(),
        zeroRowUnits: phantoms,
        hold: 3200,
      })
    }

    // 6. count the marks decade by decade
    steps.push({
      ...base,
      ...marked,
      phase: 'tally',
      caption: t('Count the marks inside each ten, one row at a time.', 'Hitung tanda di setiap puluhan, satu baris satu baris.'),
      rowCounts,
      hold: 2400,
    })

    // 7. the fencepost trap lands right before the total it would spoil
    if (trapKind === 'fencepost') {
      steps.push({
        ...base,
        ...marked,
        phase: 'trap',
        caption: trapCaption(),
        rowCounts,
        hold: 3200,
      })
    }

    steps.push({
      ...base,
      ...marked,
      phase: 'result',
      caption:
        parts.length > 1
          ? t(`${parts.join(' + ')} = ${answer} numbers.`, `${parts.join(' + ')} = ${answer} bilangan.`)
          : t(`There are ${answer} numbers.`, `Ada ${answer} bilangan.`),
      rowCounts,
      answer,
      result: true,
      hold: 0,
    })
  } else {
    // 5. read the ends off the marked run
    steps.push({
      ...base,
      ...marked,
      phase: 'smallest',
      caption: t(`The first mark is the smallest: ${smallest}.`, `Tanda paling awal itu yang terkecil: ${smallest}.`),
      focus: [smallest],
      showSmallest: true,
      hold: 2200,
    })

    if (trapKind === 'leading-zero') {
      steps.push({
        ...base,
        ...marked,
        phase: 'trap',
        caption: trapCaption(),
        zeroRowUnits: phantoms,
        focus: [smallest],
        showSmallest: true,
        hold: 3200,
      })
    }

    steps.push({
      ...base,
      ...marked,
      phase: 'largest',
      caption: t(`The last mark is the biggest: ${largest}.`, `Tanda paling akhir itu yang terbesar: ${largest}.`),
      focus: [largest],
      showSmallest: true,
      showLargest: true,
      hold: 2200,
    })

    steps.push({
      ...base,
      ...marked,
      phase: 'result',
      caption: `${largest} − ${smallest} = ${answer}.`,
      focus: smallest === largest ? [smallest] : [smallest, largest],
      showSmallest: true,
      showLargest: true,
      answer,
      result: true,
      hold: 0,
    })
  }

  return {
    constraints,
    ask,
    qualifying,
    smallest,
    largest,
    answer,
    rules,
    phantoms: trapKind === 'leading-zero' ? phantoms : [],
    trapKind,
    showZeroRow: trapKind === 'leading-zero',
    rowCounts,
    steps,
    finalIndex: steps.length - 1,
  }
}
