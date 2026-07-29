import type { Lang } from './makeTenSteps'

// ---------------------------------------------------------------------------
// length-measure-compare — post-answer storyboard.
//
// The misconception this exists to kill: reading the number under the RIGHT END
// instead of measuring the span. When the object does not start at 0 a child
// says "it stops at 11, so it is 11". So every ruler story walks:
//     where it starts → where it ends → (offset only) the 0→start stretch that
//     is NOT the object → sweep the span unit by unit → land end − start.
// Unit chains count the petak one at a time with a running tally.
// `longest` / `difference` measure each object the same way and then line the
// measured bars up so the comparison is visual, not arithmetic.
//
// Pure data: no random, no dates, no DOM — unit-testable and SSR-safe.
// ---------------------------------------------------------------------------

/** Pixels per whole unit — pinned to the static figure (src/components/wmi/concepts/length-measure-compare). */
export const U = 22
/** Object bar height — pinned to the static figure. */
export const BAR_H = 18
/** Choice letters, mirroring LABELS in the concept logic. */
export const LENGTH_LABELS = ['A', 'B', 'C'] as const

const MINUS = '−' // proper minus sign, matching the concept's hint steps

export interface LengthItem {
  name: string
  start: number
  length: number
}

export interface LengthParams {
  medium: 'ruler' | 'offset-ruler' | 'unit-chain'
  unitLabel: 'cm' | 'petak'
  ask: 'measure-one' | 'longest' | 'difference'
  rulerMax: number
  items: LengthItem[]
  focusA: number
  focusB: number
}

// Same fallback the static figure uses, so a malformed payload still draws the
// signature offset case instead of an empty board.
const SAMPLE: LengthParams = {
  medium: 'offset-ruler',
  unitLabel: 'cm',
  ask: 'measure-one',
  rulerMax: 12,
  items: [{ name: 'pita', start: 3, length: 8 }],
  focusA: 0,
  focusB: 0,
}

const OBJECT_NAMES: Record<string, { id: string; en: string }> = {
  pensil: { id: 'pensil', en: 'pencil' },
  pita: { id: 'pita', en: 'ribbon' },
  ranting: { id: 'ranting', en: 'twig' },
  sedotan: { id: 'sedotan', en: 'straw' },
  krayon: { id: 'krayon', en: 'crayon' },
  tali: { id: 'tali', en: 'string' },
}

function capWord(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function unitWord(unitLabel: LengthParams['unitLabel'], k: number, lang: Lang): string {
  if (unitLabel === 'cm') return 'cm'
  if (lang === 'id') return 'petak'
  return k === 1 ? 'square' : 'squares'
}

/**
 * Same shape-guard the static figure runs, with one deliberate difference: the
 * figure throws `focusA`/`focusB` away (it never needs them), while the story
 * does — `difference` asks about a specific pair and in the right order.
 */
export function coerceLengthParams(params: unknown): LengthParams {
  const p = (params ?? {}) as Partial<LengthParams>
  const rawItems = Array.isArray(p.items) ? p.items : []
  const ok =
    rawItems.length > 0 &&
    rawItems.every(
      (it) =>
        !!it &&
        typeof it.name === 'string' &&
        typeof it.start === 'number' &&
        Number.isFinite(it.start) &&
        typeof it.length === 'number' &&
        Number.isFinite(it.length) &&
        it.length > 0,
    )
  const items: LengthItem[] = ok
    ? rawItems.slice(0, 3).map((it) => ({
        name: it.name,
        start: Math.max(0, Math.round(it.start)),
        length: Math.max(1, Math.round(it.length)),
      }))
    : SAMPLE.items.map((it) => ({ ...it }))

  const medium =
    p.medium === 'ruler' || p.medium === 'offset-ruler' || p.medium === 'unit-chain'
      ? p.medium
      : SAMPLE.medium
  // Rulers are always cm; unit chains are always petak. Derive rather than trust.
  const unitLabel: LengthParams['unitLabel'] = medium === 'unit-chain' ? 'petak' : 'cm'
  const ask =
    p.ask === 'measure-one' || p.ask === 'longest' || p.ask === 'difference' ? p.ask : SAMPLE.ask

  const widest = items.reduce((m, it) => Math.max(m, it.start + it.length), 1)
  const rulerMax =
    typeof p.rulerMax === 'number' && Number.isFinite(p.rulerMax) && p.rulerMax >= widest
      ? Math.round(p.rulerMax)
      : widest

  const last = items.length - 1
  const clamp = (v: unknown) =>
    typeof v === 'number' && Number.isFinite(v) ? Math.min(last, Math.max(0, Math.round(v))) : 0

  return { medium, unitLabel, ask, rulerMax, items, focusA: clamp(p.focusA), focusB: clamp(p.focusB) }
}

// ---------------------------------------------------------------------------
// layout — a literal replay of the static figure's coordinate maths so the
// animated board and the question's picture are the same picture.
// ---------------------------------------------------------------------------

export interface LengthRow {
  name: string
  /** top of the row box */
  top: number
  /** y of the object bar (ruler rows sit 4px below the row top; chain rows sit on it) */
  barY: number
  /** left / right edge of the object bar */
  x0: number
  x1: number
  /** chain only: y of the unit-square strip */
  stripY: number
  start: number
  end: number
  length: number
}

export interface LengthLayout {
  kind: 'ruler' | 'chain'
  width: number
  height: number
  padL: number
  padR: number
  topPad: number
  rowH: number
  rowGap: number
  /** ruler only (0 on chains) */
  rulerTop: number
  rulerH: number
  rulerMax: number
  single: boolean
  showLetters: boolean
  rows: LengthRow[]
}

export function buildLengthLayout(p: LengthParams): LengthLayout {
  const single = p.items.length === 1
  const gutter = single ? 0 : 78
  const padL = 22 + gutter
  const padR = 22
  const showLetters = p.ask === 'longest'

  if (p.medium === 'unit-chain') {
    const widest = p.items.reduce((m, it) => Math.max(m, it.length), 1)
    const topPad = single ? 24 : 12
    const rowH = 54
    const rowGap = 12
    const width = padL + widest * U + padR
    const height = topPad + p.items.length * rowH + (p.items.length - 1) * rowGap + 8
    const rows: LengthRow[] = p.items.map((it, i) => {
      const top = topPad + i * (rowH + rowGap)
      return {
        name: it.name,
        top,
        barY: top,
        x0: padL,
        x1: padL + it.length * U,
        stripY: top + 26,
        start: 0,
        end: it.length,
        length: it.length,
      }
    })
    return {
      kind: 'chain',
      width,
      height,
      padL,
      padR,
      topPad,
      rowH,
      rowGap,
      rulerTop: 0,
      rulerH: 0,
      rulerMax: widest,
      single,
      showLetters,
      rows,
    }
  }

  const topPad = single ? 26 : 12
  const rowH = 26
  const rowGap = 10
  const objectsH = p.items.length * rowH + (p.items.length - 1) * rowGap
  const rulerTop = topPad + objectsH + 14
  const rulerH = 46
  const width = padL + p.rulerMax * U + padR
  const height = rulerTop + rulerH + 8
  const rows: LengthRow[] = p.items.map((it, i) => {
    const top = topPad + i * (rowH + rowGap)
    return {
      name: it.name,
      top,
      barY: top + 4,
      x0: padL + it.start * U,
      x1: padL + (it.start + it.length) * U,
      stripY: 0,
      start: it.start,
      end: it.start + it.length,
      length: it.length,
    }
  })
  return {
    kind: 'ruler',
    width,
    height,
    padL,
    padR,
    topPad,
    rowH,
    rowGap,
    rulerTop,
    rulerH,
    rulerMax: p.rulerMax,
    single,
    showLetters,
    rows,
  }
}

/** x of ruler value `v` — the figure's `xAt`. */
export function xAt(layout: LengthLayout, v: number): number {
  return layout.padL + v * U
}

// ---------------------------------------------------------------------------
// storyboard
// ---------------------------------------------------------------------------

export type LengthPhase = 'intro' | 'start' | 'end' | 'trap' | 'count' | 'span' | 'compare' | 'result'

export interface LengthTrap {
  /** The tempting wrong number — always the right-end reading, never the answer. */
  wrong: number
  /** The dead stretch of ruler that the wrong number also counts. */
  from: number
  to: number
}

export interface LengthStep {
  phase: LengthPhase
  caption: string
  /** Item this beat is about, or null (intro / compare / a pure result beat). */
  item: number | null
  /** Light the start tick of `item`. */
  markStart: boolean
  /** Light the end tick of `item`. */
  markEnd: boolean
  /** Units of `item` swept / counted so far (0 … length). */
  countTo: number
  /** Running tally shown in the counter pill (null hides it). */
  tally: number | null
  trap: LengthTrap | null
  /** Length measured so far per item index; null = not measured yet. */
  measured: (number | null)[]
  /** Item indices spotlighted in the measured-bar comparison. */
  focus: number[]
  result: boolean
  /** ms this beat holds on screen during autoplay. */
  hold: number
}

export interface LengthStoryboard {
  params: LengthParams
  layout: LengthLayout
  /** Localized lowercase object names, per item index. */
  names: string[]
  unitShort: string
  answer: string
  longestIndex: number
  farthestEndIndex: number
  /** Focused pair (indices) — `a` is the object the question asks about first. */
  aIndex: number
  bIndex: number
  /** true when the measured-bar comparison strip belongs on the board. */
  compare: boolean
  strategy: string
  steps: LengthStep[]
  finalIndex: number
}

export function buildLengthMeasureSteps(raw: unknown, lang: Lang): LengthStoryboard {
  const p = coerceLengthParams(raw)
  const layout = buildLengthLayout(p)
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const uw = (k: number) => unitWord(p.unitLabel, k, lang)
  const isChain = p.medium === 'unit-chain'
  const isOffset = p.medium === 'offset-ruler'
  const n = p.items.length

  const names = p.items.map((it) => {
    const entry = OBJECT_NAMES[it.name]
    if (!entry) return it.name
    return lang === 'id' ? entry.id : entry.en
  })
  const nm = (i: number) => names[i]
  const Nm = (i: number) => capWord(names[i])
  const startOf = (i: number) => layout.rows[i].start
  const endOf = (i: number) => layout.rows[i].end
  const lenOf = (i: number) => p.items[i].length

  // Match derive(): first strict maximum wins.
  let longestIndex = 0
  let farthestEndIndex = 0
  for (let i = 1; i < n; i++) {
    if (lenOf(i) > lenOf(longestIndex)) longestIndex = i
    if (endOf(i) > endOf(farthestEndIndex)) farthestEndIndex = i
  }

  const aIndex = Math.min(p.focusA, n - 1)
  const bIndex = Math.min(p.focusB, n - 1)

  const answer =
    p.ask === 'longest'
      ? LENGTH_LABELS[longestIndex]
      : p.ask === 'measure-one'
        ? String(lenOf(aIndex))
        : String(lenOf(aIndex) - lenOf(bIndex))

  const strategy = isOffset
    ? t(`Subtract: right end ${MINUS} left end`, `Kurangi: ujung kanan ${MINUS} ujung kiri`)
    : isChain
      ? t('Count the unit squares', 'Hitung petak satuan')
      : t('Read the ruler from 0', 'Baca penggaris mulai dari 0')

  const steps: LengthStep[] = []
  const measured: (number | null)[] = p.items.map(() => null)
  const snap = () => measured.slice()

  const push = (
    phase: LengthPhase,
    caption: string,
    extra: Partial<LengthStep> & { hold: number },
  ) => {
    steps.push({
      phase,
      caption,
      item: null,
      markStart: false,
      markEnd: false,
      countTo: 0,
      tally: null,
      trap: null,
      measured: snap(),
      focus: [],
      result: false,
      ...extra,
    })
  }

  // --- intro ---------------------------------------------------------------
  const introCaption =
    p.ask === 'measure-one'
      ? isChain
        ? t(`How many squares long is the ${nm(aIndex)}?`, `Berapa petak panjang ${nm(aIndex)}?`)
        : t(`How long is the ${nm(aIndex)}?`, `Berapa panjang ${nm(aIndex)}?`)
      : p.ask === 'longest'
        ? t('Which object is the longest?', 'Benda mana yang paling panjang?')
        : t(
            `How much longer is the ${nm(aIndex)} than the ${nm(bIndex)}?`,
            `Berapa ${nm(aIndex)} lebih panjang dari ${nm(bIndex)}?`,
          )
  push('intro', introCaption, { hold: 1900 })

  // --- shared beat makers --------------------------------------------------

  /** The trap gets its own beat: the right-end number counts the empty ruler too. */
  const pushTrap = (i: number) => {
    const s = startOf(i)
    const e = endOf(i)
    push(
      'trap',
      t(
        `Careful: it stops at ${e}, but 0 to ${s} is empty ruler — not the ${nm(i)}.`,
        `Hati-hati: berhenti di ${e}, tapi 0 sampai ${s} penggaris kosong — bukan ${nm(i)}.`,
      ),
      { item: i, markStart: true, markEnd: true, trap: { wrong: e, from: 0, to: s }, hold: 2600 },
    )
  }

  const countCaption = (k: number) =>
    k === 1 ? t(`Count: 1 ${uw(1)}`, `Hitung: 1 ${uw(1)}`) : `${k} ${uw(k)}`

  /** Sweep the span one unit at a time, stopping one short of the total. */
  const pushCounting = (i: number) => {
    const L = lenOf(i)
    for (let k = 1; k < L; k++) {
      push('count', countCaption(k), {
        item: i,
        markStart: true,
        markEnd: true,
        countTo: k,
        tally: k,
        hold: k === 1 ? 1500 : 900,
      })
    }
  }

  /** Compact two-beat measure used when several objects must be measured. */
  const pushMeasure = (i: number) => {
    const s = startOf(i)
    const e = endOf(i)
    const L = lenOf(i)
    if (isChain) {
      push(
        'start',
        t(
          `Squares sit under the ${nm(i)} with no gaps.`,
          `Petak berjajar rapat di bawah ${nm(i)}.`,
        ),
        { item: i, markStart: true, hold: 1600 },
      )
    } else {
      push(
        'start',
        t(`The ${nm(i)} runs from ${s} to ${e}.`, `${Nm(i)} dari angka ${s} sampai ${e}.`),
        { item: i, markStart: true, markEnd: true, hold: 1800 },
      )
    }
    measured[i] = L
    const spanCaption = isChain
      ? t(
          `Count the squares under the ${nm(i)}: ${L}.`,
          `Hitung petak di bawah ${nm(i)}: ${L}.`,
        )
      : t(
          `Length of the ${nm(i)} = ${e} ${MINUS} ${s} = ${L} ${uw(L)}.`,
          `Panjang ${nm(i)} = ${e} ${MINUS} ${s} = ${L} ${uw(L)}.`,
        )
    push('span', spanCaption, {
      item: i,
      markStart: true,
      markEnd: !isChain,
      countTo: L,
      tally: L,
      measured: snap(),
      focus: [i],
      hold: 2200,
    })
  }

  // --- measure-one ---------------------------------------------------------
  if (p.ask === 'measure-one') {
    const i = aIndex
    const s = startOf(i)
    const e = endOf(i)
    const L = lenOf(i)

    if (isChain) {
      push(
        'start',
        t(
          `Unit squares lie along the ${nm(i)}, edge to edge, no gaps.`,
          `Petak satuan berjajar sepanjang ${nm(i)}, rapat tanpa celah.`,
        ),
        { item: i, markStart: true, hold: 2000 },
      )
    } else {
      push(
        'start',
        s === 0
          ? t(`The ${nm(i)} starts right at 0.`, `${Nm(i)} mulai tepat di angka 0.`)
          : t(`The ${nm(i)} starts at ${s}, not at 0.`, `${Nm(i)} mulai di angka ${s}, bukan 0.`),
        { item: i, markStart: true, hold: 1900 },
      )
      push('end', t(`It ends at ${e}.`, `Ujung kanannya di angka ${e}.`), {
        item: i,
        markStart: true,
        markEnd: true,
        hold: 1900,
      })
      if (isOffset) pushTrap(i)
    }

    pushCounting(i)

    measured[i] = L
    const finalCaption = isChain
      ? t(
          `The last count is ${L}, so it is ${L} ${uw(L)} long.`,
          `Hitungan terakhir ${L}, jadi panjangnya ${L} ${uw(L)}.`,
        )
      : t(
          `Length = ${e} ${MINUS} ${s} = ${L} ${uw(L)}.`,
          `Panjang = ${e} ${MINUS} ${s} = ${L} ${uw(L)}.`,
        )
    push('result', finalCaption, {
      item: i,
      markStart: true,
      markEnd: !isChain,
      countTo: L,
      tally: L,
      measured: snap(),
      focus: [i],
      result: true,
      hold: 0,
    })

    return {
      params: p,
      layout,
      names,
      unitShort: uw(2),
      answer,
      longestIndex,
      farthestEndIndex,
      aIndex,
      bIndex,
      compare: false,
      strategy,
      steps,
      finalIndex: steps.length - 1,
    }
  }

  // --- longest -------------------------------------------------------------
  if (p.ask === 'longest') {
    if (isOffset) pushTrap(farthestEndIndex)
    for (let i = 0; i < n; i++) pushMeasure(i)

    const listed = p.items
      .map((_, i) => `${nm(i)} ${lenOf(i)}`)
      .join(', ')
    push(
      'compare',
      t(`Line the measured bars up: ${listed}.`, `Sejajarkan hasil ukurnya: ${listed}.`),
      {
        countTo: 0,
        measured: snap(),
        focus: p.items.map((_, i) => i),
        hold: 2400,
      },
    )

    const winLen = lenOf(longestIndex)
    push(
      'result',
      t(
        `${winLen} is the biggest, so the ${nm(longestIndex)} is the longest → ${answer}.`,
        `${winLen} paling besar, jadi ${nm(longestIndex)} yang paling panjang → ${answer}.`,
      ),
      {
        item: longestIndex,
        markStart: true,
        markEnd: !isChain,
        countTo: lenOf(longestIndex),
        tally: winLen,
        measured: snap(),
        focus: [longestIndex],
        result: true,
        hold: 0,
      },
    )

    return {
      params: p,
      layout,
      names,
      unitShort: uw(2),
      answer,
      longestIndex,
      farthestEndIndex,
      aIndex,
      bIndex,
      compare: true,
      strategy,
      steps,
      finalIndex: steps.length - 1,
    }
  }

  // --- difference ----------------------------------------------------------
  if (isOffset) pushTrap(aIndex)
  pushMeasure(aIndex)
  if (bIndex !== aIndex) pushMeasure(bIndex)

  const lenA = lenOf(aIndex)
  const lenB = lenOf(bIndex)
  push(
    'compare',
    t(
      `Line them up: the ${nm(aIndex)} is ${lenA}, the ${nm(bIndex)} is ${lenB}.`,
      `Sejajarkan: ${nm(aIndex)} ${lenA}, ${nm(bIndex)} ${lenB}.`,
    ),
    { countTo: 0, measured: snap(), focus: [aIndex, bIndex], hold: 2400 },
  )

  const diff = lenA - lenB
  push(
    'result',
    t(
      `Difference: ${lenA} ${MINUS} ${lenB} = ${diff} ${uw(diff)}.`,
      `Selisihnya: ${lenA} ${MINUS} ${lenB} = ${diff} ${uw(diff)}.`,
    ),
    {
      countTo: 0,
      measured: snap(),
      focus: [aIndex, bIndex],
      result: true,
      hold: 0,
    },
  )

  return {
    params: p,
    layout,
    names,
    unitShort: uw(2),
    answer,
    longestIndex,
    farthestEndIndex,
    aIndex,
    bIndex,
    compare: true,
    strategy,
    steps,
    finalIndex: steps.length - 1,
  }
}
