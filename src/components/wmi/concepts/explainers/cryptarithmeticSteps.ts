import {
  buildCryptaMapping,
  cryptaColumns,
  cryptaLeading,
  normalizeCryptaParams,
  type CryptaColumn,
} from '../cryptarithmetic-addition'

// cryptarithmetic-addition (N16) — post-answer storyboard.
//
// Each letter stands for a different digit and no number starts with 0. The
// skill being taught is NOT "spot the answer", it is COLUMN WORK: write the sum
// vertically, start at the ones column, take only what that column forces, push
// the carry left, and repeat. A child who guesses globally gets lost.
//
// So the storyboard is a real solver, not a script. It keeps a set of still-
// possible digits per letter (and per carry) and tightens them ONE COLUMN AT A
// TIME, right to left, looping until the asked letter has a single digit left.
// Every beat is therefore something a column genuinely proved:
//
//   setup   — write it down; the rightmost column is where you start
//   rules   — no number starts with 0, so leading letters lose 0
//   column  — one column's worth of eliminations (repeatable, right to left)
//   trial   — when the columns stall, test the leftover candidates one by one
//   answer  — the beat the asked letter finally has exactly one digit left
//
// Nothing before the last beat resolves the asked letter: `step.answer` is null
// until then, and the asked letter's chip still shows its surviving candidates.
//
// Pure data, no React, no randomness, no dates — unit-testable and SSR-safe.

export type Lang = 'en' | 'id'

export type CryptaTone = 'plan' | 'work' | 'reject' | 'win'

export type CryptaStepKind = 'setup' | 'rules' | 'column' | 'trial' | 'answer'

/** What is still possible for one letter, after this beat. */
export interface CryptaDomain {
  letter: string
  /** Digits still standing, ascending. */
  alive: number[]
  /** Digits struck out BY THIS BEAT — drawn in reject red. */
  cut: number[]
  /** The digit, once exactly one candidate is left. */
  settled: number | null
  /** True for the letter the question asks about. */
  asked: boolean
}

export interface CryptaStep {
  kind: CryptaStepKind
  /** Short chip naming the move, e.g. "Kolom satuan". */
  phase: string
  caption: string
  /** The arithmetic line under the sum, e.g. "B + B = D + 10". */
  work: string
  /** Small note under it, e.g. "simpan 1 ke kolom puluhan". */
  workSub: string | null
  tone: CryptaTone
  /** Spotlighted column, 0 = ones; null spotlights none. */
  focus: number | null
  /**
   * Carry INTO column j, for j = 0…columnCount. `null` where it is still
   * either 0 or 1. Index columnCount is the spill past the total (always 0).
   */
  carries: Array<number | null>
  domains: CryptaDomain[]
  /** The asked digit — null on every beat but the last. */
  answer: number | null
  result: boolean
  /** How long this beat holds on screen during a play-through, in ms. */
  hold: number
}

export interface CryptaStoryboard {
  addend1: number
  addend2: number
  askDigit: number
  wordA: string
  wordB: string
  wordS: string
  letters: string[]
  askLetter: string
  columnCount: number
  answer: number
  steps: CryptaStep[]
  finalIndex: number
}

// ---------------------------------------------------------------------------
// domains
// ---------------------------------------------------------------------------

type Dom = Map<string, Set<number>>
type Carries = Array<Set<number>>

const asc = (a: number, b: number) => a - b
const sorted = (s: Set<number>) => [...s].sort(asc)

function freshDomains(letters: string[]): Dom {
  const D: Dom = new Map()
  for (const L of letters) D.set(L, new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
  return D
}

function cloneDomains(D: Dom): Dom {
  const out: Dom = new Map()
  for (const [L, s] of D) out.set(L, new Set(s))
  return out
}

function cloneCarries(C: Carries): Carries {
  return C.map((s) => new Set(s))
}

function snapshot(D: Dom, letters: string[]): Record<string, number[]> {
  const out: Record<string, number[]> = {}
  for (const L of letters) out[L] = sorted(D.get(L) as Set<number>)
  return out
}

/** True when some letter has run out of digits — the branch is impossible. */
function wiped(D: Dom): boolean {
  for (const s of D.values()) if (s.size === 0) return true
  return false
}

/**
 * Tighten one column: keep only the digits (and carries) that take part in at
 * least one arithmetic that actually works. Different letters must hold
 * different digits; the same letter must hold the same digit.
 * Returns true when something was struck out.
 */
function applyColumn(col: CryptaColumn, D: Dom, C: Carries): boolean {
  const j = col.index
  const supA = new Set<number>()
  const supB = new Set<number>()
  const supS = new Set<number>()
  const supIn = new Set<number>()
  const supOut = new Set<number>()
  // A column position past the end of a shorter addend contributes a plain 0.
  const dom = (L: string | null) => (L === null ? new Set([0]) : (D.get(L) as Set<number>))
  const clash = (x: string | null, y: string | null, vx: number, vy: number) =>
    x !== null && y !== null && (x === y ? vx !== vy : vx === vy)

  for (const a of dom(col.a)) {
    for (const b of dom(col.b)) {
      if (clash(col.a, col.b, a, b)) continue
      for (const s of dom(col.s)) {
        if (clash(col.a, col.s, a, s)) continue
        if (clash(col.b, col.s, b, s)) continue
        for (const cIn of C[j]) {
          const total = a + b + cIn
          if (total % 10 !== s) continue
          const cOut = Math.floor(total / 10)
          if (!C[j + 1].has(cOut)) continue
          supA.add(a)
          supB.add(b)
          supS.add(s)
          supIn.add(cIn)
          supOut.add(cOut)
        }
      }
    }
  }

  let changed = false
  const cut = (set: Set<number> | undefined, sup: Set<number>) => {
    if (!set) return
    for (const v of [...set]) {
      if (!sup.has(v)) {
        set.delete(v)
        changed = true
      }
    }
  }
  if (col.a) cut(D.get(col.a), supA)
  if (col.b) cut(D.get(col.b), supB)
  cut(D.get(col.s), supS)
  cut(C[j], supIn)
  cut(C[j + 1], supOut)
  return changed
}

/** A letter that is down to one digit takes that digit away from every other. */
function applyAllDifferent(letters: string[], D: Dom): boolean {
  let changed = false
  for (const L of letters) {
    const s = D.get(L) as Set<number>
    if (s.size !== 1) continue
    const v = [...s][0]
    for (const M of letters) {
      if (M === L) continue
      if ((D.get(M) as Set<number>).delete(v)) changed = true
    }
  }
  return changed
}

// ---------------------------------------------------------------------------
// words
// ---------------------------------------------------------------------------

const COL_NAME_ID = ['satuan', 'puluhan', 'ratusan', 'ribuan']
const COL_NAME_EN = ['ones', 'tens', 'hundreds', 'thousands']

function colName(index: number, lang: Lang): string {
  const table = lang === 'id' ? COL_NAME_ID : COL_NAME_EN
  return table[index] ?? (lang === 'id' ? `kolom ${index + 1}` : `column ${index + 1}`)
}

/** "0, 2 dan 4" / "0, 2 and 4". */
function listOf(values: number[], lang: Lang): string {
  if (values.length === 0) return ''
  if (values.length === 1) return String(values[0])
  const head = values.slice(0, -1).join(', ')
  return `${head} ${lang === 'id' ? 'dan' : 'and'} ${values[values.length - 1]}`
}

// ---------------------------------------------------------------------------
// storyboard
// ---------------------------------------------------------------------------

const HOLD_SETUP = 2200
const HOLD_RULES = 2000
const HOLD_COLUMN = 2400
const HOLD_TRIAL = 2600

export function buildCryptarithmeticSteps(params: unknown, lang: Lang): CryptaStoryboard {
  const p = normalizeCryptaParams(params)
  const m = buildCryptaMapping(p.addend1, p.addend2)
  const cols = cryptaColumns(m)
  const leading = cryptaLeading(m)
  const letters = m.letters
  const askLetter = m.digitToLetter[String(p.askDigit)]
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const D = freshDomains(letters)
  const C: Carries = []
  for (let j = 0; j <= cols.length; j++) {
    // Nothing carries into the ones column, and nothing may spill past the total.
    C.push(j === 0 || j === cols.length ? new Set([0]) : new Set([0, 1]))
  }

  const steps: CryptaStep[] = []
  let before = snapshot(D, letters)

  // How a letter is drawn right now, in an equation: its digit once it is
  // pinned down, otherwise the letter itself.
  const disp = (L: string | null): string => {
    if (L === null) return '0'
    const s = D.get(L) as Set<number>
    return s.size === 1 ? String([...s][0]) : L
  }
  const carryOf = (j: number): number | null => (C[j].size === 1 ? [...C[j]][0] : null)
  const carriesNow = (): Array<number | null> => C.map((_, j) => carryOf(j))

  const domainsNow = (): CryptaDomain[] => {
    const after = snapshot(D, letters)
    return letters.map((L) => {
      const alive = after[L]
      const cut = before[L].filter((d) => !alive.includes(d))
      return {
        letter: L,
        alive,
        cut,
        settled: alive.length === 1 ? alive[0] : null,
        asked: L === askLetter,
      }
    })
  }

  const push = (
    step: Omit<CryptaStep, 'domains' | 'carries'> & Partial<Pick<CryptaStep, 'domains' | 'carries'>>,
  ) => {
    steps.push({ ...step, carries: carriesNow(), domains: domainsNow() } as CryptaStep)
    before = snapshot(D, letters)
  }

  // ── beat: write it down ──────────────────────────────────────────────────
  push({
    kind: 'setup',
    phase: t('Line it up', 'Susun'),
    caption: t(
      'Stack it in columns and start at the right.',
      'Susun menurun, lalu mulai dari kolom kanan.',
    ),
    work: `${m.wordA} + ${m.wordB} = ${m.wordS}`,
    workSub: t('a carry moves one column left', 'simpanan naik satu kolom ke kiri'),
    tone: 'plan',
    focus: 0,
    answer: null,
    result: false,
    hold: HOLD_SETUP,
  })

  // ── beat: the two rules, and the first thing they strike out ─────────────
  const leaders = letters.filter((L) => leading.has(L))
  for (const L of leaders) (D.get(L) as Set<number>).delete(0)
  push({
    kind: 'rules',
    phase: t('The rules', 'Aturan'),
    caption: t('No number starts with 0.', 'Tidak ada bilangan yang diawali 0.'),
    work: `${leaders.join(', ')} ${lang === 'id' ? 'bukan' : 'is not'} 0`,
    workSub: t('different letters, different digits', 'huruf beda, angka beda'),
    tone: 'plan',
    focus: null,
    answer: null,
    result: false,
    hold: HOLD_RULES,
  })

  const settledValue = (L: string): number | null => {
    const s = D.get(L) as Set<number>
    return s.size === 1 ? [...s][0] : null
  }
  const solved = () => settledValue(askLetter) === p.askDigit

  // ── beats: one per column that actually strikes something out ────────────
  // The loop repeats right-to-left: a column that gave nothing on the first
  // pass often gives plenty once the column to its left has pinned a carry.
  //
  // Equations are written in PREMISE form: a letter this very beat pinned down
  // still shows as a letter, so the line reads as the thing being reasoned from
  // ("B + B = B") and the caption carries the conclusion ("so B = 0"). Letters
  // pinned down on an earlier beat show their digit — that is knowledge the
  // child already has.
  const premise = (L: string | null): string => {
    if (L === null) return '0'
    return before[L].length > 1 ? L : disp(L)
  }

  const columnWork = (col: CryptaColumn): string => {
    const j = col.index
    if (col.a === null && col.b === null) {
      return `${t('carry', 'simpanan')} → ${premise(col.s)}`
    }
    const cIn = carryOf(j)
    const lead =
      cIn === null
        ? `${premise(col.a)} + ${premise(col.b)} + ?`
        : cIn === 0
          ? `${premise(col.a)} + ${premise(col.b)}`
          : `${premise(col.a)} + ${premise(col.b)} + 1`
    const cOut = carryOf(j + 1)
    const tail =
      cOut === null
        ? `${premise(col.s)} ${t('or', 'atau')} ${premise(col.s)} + 10`
        : cOut === 1
          ? `${premise(col.s)} + 10`
          : premise(col.s)
    return `${lead} = ${tail}`
  }

  const columnSub = (col: CryptaColumn, carryOutWas: number | null): string | null => {
    const j = col.index
    if (col.a === null && col.b === null) {
      return t('a carry is only 0 or 1', 'simpanan cuma 0 atau 1')
    }
    const cOut = carryOf(j + 1)
    if (cOut !== null && carryOutWas === null) {
      if (cOut === 1) {
        return t(`carry 1 into the ${colName(j + 1, lang)}`, `simpan 1 ke kolom ${colName(j + 1, lang)}`)
      }
      return t('nothing to carry', 'tidak ada simpanan')
    }
    // Same letter twice: doubling can only land on one parity, and the carry in
    // decides which — a genuinely useful thing for a child to notice.
    const cIn = carryOf(j)
    if (col.a !== null && col.a === col.b && cIn !== null && settledValue(col.s) === null) {
      return cIn === 0
        ? t(`${premise(col.s)} must be even`, `${premise(col.s)} pasti genap`)
        : t(`${premise(col.s)} must be odd`, `${premise(col.s)} pasti ganjil`)
    }
    return null
  }

  /** The "just read this column out loud" beat, before anything is struck out. */
  const readCaption = (col: CryptaColumn): string => {
    if (col.a === null && col.b === null) {
      return t(
        'Only the carry reaches this column.',
        'Kolom ini cuma kebagian simpanan.',
      )
    }
    const cIn = carryOf(col.index)
    const lead =
      cIn === null
        ? `${premise(col.a)} + ${premise(col.b)} + ?`
        : cIn === 1
          ? `${premise(col.a)} + ${premise(col.b)} + 1`
          : `${premise(col.a)} + ${premise(col.b)}`
    return t(`${lead} has to end in ${premise(col.s)}.`, `${lead} harus berakhir ${premise(col.s)}.`)
  }

  const columnCaption = (col: CryptaColumn, settledNow: string[]): string => {
    if (settledNow.length > 0) {
      const list = settledNow.map((L) => `${L} = ${settledValue(L)}`).join(lang === 'id' ? ' dan ' : ' and ')
      return t(`Only one digit fits: ${list}.`, `Cuma satu yang cocok: ${list}.`)
    }
    // Nothing pinned down — report the biggest narrowing instead, so the beat
    // still says something true and concrete.
    let best: { letter: string; alive: number[]; cut: number[] } | null = null
    for (const L of letters) {
      const alive = sorted(D.get(L) as Set<number>)
      const cut = before[L].filter((d) => !alive.includes(d))
      if (cut.length === 0) continue
      if (!best || cut.length > best.cut.length) best = { letter: L, alive, cut }
    }
    if (best) {
      if (best.alive.length <= 4) {
        return t(
          `${best.letter} is down to ${listOf(best.alive, lang)}.`,
          `${best.letter} tinggal ${listOf(best.alive, lang)}.`,
        )
      }
      const shown = best.cut.slice(0, 4)
      const more = best.cut.length > shown.length ? (lang === 'id' ? ', …' : ', …') : ''
      return t(
        `${best.letter} cannot be ${shown.join(', ')}${more}.`,
        `${best.letter} tidak bisa ${shown.join(', ')}${more}.`,
      )
    }
    const cOut = carryOf(col.index + 1)
    if (cOut === 1) return t('This column must carry 1.', 'Kolom ini pasti menyimpan 1.')
    if (cOut === 0) return t('This column carries nothing.', 'Kolom ini tidak menyimpan.')
    return t('Keep the carry and move left.', 'Simpan simpanannya, geser ke kiri.')
  }

  // ── beat: read the ones column out loud, before touching anything ────────
  // The rightmost column is where column work starts, so the child sees it
  // named and read before any digit is struck out — and so the first thing they
  // meet is never the answer.
  push({
    kind: 'column',
    phase: t(`${colName(0, lang)} column`, `Kolom ${colName(0, lang)}`),
    caption: readCaption(cols[0]),
    work: columnWork(cols[0]),
    workSub: t('try every digit and see which fit', 'coba tiap angka, lihat mana yang muat'),
    tone: 'work',
    focus: 0,
    answer: null,
    result: false,
    hold: HOLD_COLUMN,
  })

  let stalled = false
  outer: for (let pass = 0; pass < 8 && !solved() && !stalled; pass++) {
    let progress = false
    for (const col of cols) {
      const carryOutWas = carryOf(col.index + 1)
      // Keep a way back: a wipe-out means these params are not a real puzzle,
      // and the board must still be drawable for the closing beat.
      const rescueD = cloneDomains(D)
      const rescueC = cloneCarries(C)

      let changed = applyColumn(col, D, C)
      // Which letters the column equation alone pinned down, before the
      // "different letters, different digits" rule gets its turn.
      const byColumn = letters.filter(
        (L) => (D.get(L) as Set<number>).size === 1 && before[L].length > 1,
      )
      if (applyAllDifferent(letters, D)) changed = true
      if (wiped(D)) {
        for (const [L, s] of rescueD) D.set(L, s)
        for (let j = 0; j < rescueC.length; j++) C[j] = rescueC[j]
        stalled = true
        break outer
      }
      if (!changed) continue
      progress = true

      const settledNow = letters.filter(
        (L) => (D.get(L) as Set<number>).size === 1 && before[L].length > 1,
      )
      const landed = settledValue(askLetter) === p.askDigit
      // When the asked letter fell out of the all-different rule rather than the
      // column arithmetic, name the letter that took its digit — otherwise the
      // beat would look like it came from nowhere.
      const donor = byColumn.find(
        (L) => L !== askLetter && before[askLetter].includes(settledValue(L) as number),
      )
      const landedSub =
        landed && !byColumn.includes(askLetter) && donor
          ? t(
              `${donor} = ${settledValue(donor)}, and no two letters share a digit`,
              `${donor} = ${settledValue(donor)}, huruf beda angka beda`,
            )
          : landed
            ? t('only one digit fits this column', 'cuma satu angka yang muat di kolom ini')
            : null
      push({
        kind: landed ? 'answer' : 'column',
        phase: t(`${colName(col.index, lang)} column`, `Kolom ${colName(col.index, lang)}`),
        caption: landed
          ? t(`So ${askLetter} = ${p.askDigit}.`, `Jadi ${askLetter} = ${p.askDigit}.`)
          : columnCaption(col, settledNow),
        work: columnWork(col),
        workSub: landed ? landedSub : columnSub(col, carryOutWas),
        tone: landed ? 'win' : 'work',
        focus: col.index,
        answer: landed ? p.askDigit : null,
        result: landed,
        hold: landed ? 0 : HOLD_COLUMN,
      })
      if (landed) break outer
    }
    // Each pass sweeps the columns right to left again: a column that gave
    // nothing the first time often gives plenty once the column to its LEFT has
    // pinned a carry down.
    if (!progress) break
  }

  // ── beats: the columns stalled, so test the leftovers one at a time ──────
  if (!solved() && !stalled && (D.get(askLetter) as Set<number>).has(p.askDigit)) {
    const trials = sorted(D.get(askLetter) as Set<number>).filter((d) => d !== p.askDigit)
    const firstBad = trials[0]
    if (firstBad !== undefined) {
      const reason = explainTrial(cols, letters, D, C, askLetter, firstBad, lang)
      ;(D.get(askLetter) as Set<number>).delete(firstBad)
      push({
        kind: 'trial',
        phase: t('Try it', 'Coba'),
        caption: t(
          `Try ${askLetter} = ${firstBad} → it does not fit.`,
          `Coba ${askLetter} = ${firstBad} → tidak cocok.`,
        ),
        work: reason.work,
        workSub: reason.sub,
        tone: 'reject',
        focus: reason.focus,
        answer: null,
        result: false,
        hold: HOLD_TRIAL,
      })
    }
  }

  // ── beat: land the answer ────────────────────────────────────────────────
  if (!solved()) {
    const askSet = D.get(askLetter) as Set<number>
    const rest = sorted(askSet).filter((d) => d !== p.askDigit)
    askSet.clear()
    askSet.add(p.askDigit)
    applyAllDifferent(letters, D)
    push({
      kind: 'answer',
      phase: t('The answer', 'Jawaban'),
      caption: t(`So ${askLetter} = ${p.askDigit}.`, `Jadi ${askLetter} = ${p.askDigit}.`),
      work: `${askLetter} = ${p.askDigit}`,
      workSub:
        rest.length > 0
          ? t('every other digit fails the same way', 'angka lain juga gagal dicoba satu-satu')
          : null,
      tone: 'win',
      focus: null,
      answer: p.askDigit,
      result: true,
      hold: 0,
    })
  }

  return {
    addend1: p.addend1,
    addend2: p.addend2,
    askDigit: p.askDigit,
    wordA: m.wordA,
    wordB: m.wordB,
    wordS: m.wordS,
    letters,
    askLetter,
    columnCount: cols.length,
    answer: p.askDigit,
    steps,
    finalIndex: steps.length - 1,
  }
}

/**
 * Why one candidate for the asked letter cannot work: pin the letter to it, run
 * the columns, and report the first column that runs out of digits — with the
 * concrete arithmetic when everything in that column is already known.
 */
function explainTrial(
  cols: CryptaColumn[],
  letters: string[],
  D: Dom,
  C: Carries,
  askLetter: string,
  candidate: number,
  lang: Lang,
): { work: string; sub: string | null; focus: number | null } {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const TD = cloneDomains(D)
  const TC = cloneCarries(C)
  const s = TD.get(askLetter) as Set<number>
  s.clear()
  s.add(candidate)

  for (let pass = 0; pass < 8; pass++) {
    let progress = false
    for (const col of cols) {
      const one = (L: string | null): number | null => {
        if (L === null) return 0
        const set = TD.get(L) as Set<number>
        return set.size === 1 ? [...set][0] : null
      }
      const cInBefore = TC[col.index].size === 1 ? [...TC[col.index]][0] : null
      const a = one(col.a)
      const b = one(col.b)
      const sVal = one(col.s)

      let changed = applyColumn(col, TD, TC)
      if (applyAllDifferent(letters, TD)) changed = true
      if (changed) progress = true

      if (wiped(TD)) {
        // The column that just collapsed. Spell it out when its two addends and
        // its incoming carry were already known — that is a claim a child can
        // check with their own fingers.
        if (a !== null && b !== null && cInBefore !== null && col.a !== null) {
          const total = a + b + cInBefore
          const lead = cInBefore === 1 ? `${a} + ${b} + 1` : `${a} + ${b}`
          const need = total % 10
          const sub =
            sVal !== null
              ? t(
                  `${col.s} would have to be ${need}, but ${col.s} = ${sVal}`,
                  `${col.s} harus ${need}, padahal ${col.s} = ${sVal}`,
                )
              : t(`${col.s} would have to be ${need}`, `${col.s} harus ${need}`)
          return { work: `${lead} = ${total}`, sub, focus: col.index }
        }
        return {
          work: `${askLetter} = ${candidate}`,
          sub: t(
            `no digit fits the ${colName(col.index, lang)} column`,
            `tak ada angka yang muat di kolom ${colName(col.index, lang)}`,
          ),
          focus: col.index,
        }
      }
    }
    if (!progress) break
  }
  return {
    work: `${askLetter} = ${candidate}`,
    sub: t('the columns cannot all work out', 'kolomnya tidak bisa semua cocok'),
    focus: null,
  }
}
