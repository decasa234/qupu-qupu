import {
  BAR_H,
  U,
  lengthFigureGeometry,
  xAt,
  type LengthGeometry,
  type LengthGeometryRow,
} from '../length-measure-compare'
import type { Lang } from './makeTenSteps'

// ---------------------------------------------------------------------------
// length-measure-compare — post-answer storyboard.
//
// The misconception this exists to kill: reading the number under the RIGHT END
// instead of measuring the span. When the object does not start at 0 a child
// says "it stops at 11, so it is 11". So every ruler story walks:
//     where the two ends sit → (offset only) the 0→start stretch that is NOT
//     the object → sweep the span → land end − start.
// Unit chains count the petak with a running tally.
// `longest` / `difference` measure each object in one beat and then line the
// measured bars up so the comparison is visual, not arithmetic.
//
// Kept SHORT on purpose: this plays after the child has already answered, so it
// must not outstay a six-year-old's attention. Every branch fits in 8 beats —
// see `countingStops` for how a long span is swept without a beat per unit.
//
// Pure data: no random, no dates, no DOM — unit-testable and SSR-safe.
// The board's coordinate maths is NOT replayed here: it is imported from the
// static figure so the animated board and the question picture cannot drift.
// ---------------------------------------------------------------------------

export { BAR_H, U, xAt }
/** Choice letters, mirroring LABELS in the concept logic. */
export const LENGTH_LABELS = ['A', 'B', 'C'] as const

/** Spans up to this many units are still counted one unit at a time. */
export const COUNT_ONE_BY_ONE_UP_TO = 5
/** Hard ceiling on counting beats, whatever the length. */
export const MAX_COUNT_BEATS = 4

/**
 * Where the sweep pauses on its way to `length`, never landing on `length`
 * itself (the result beat does that).
 *
 * Short objects are still counted 1, 2, 3 … — that is the arithmetic a Grade-1
 * child needs to watch. Longer ones jump in equal steps — a 10-unit span counts
 * "3, 6, 9" instead of nine separate beats — so the running tally still climbs
 * on screen while the story stays inside its beat budget.
 */
export function countingStops(length: number): number[] {
  const step =
    length <= COUNT_ONE_BY_ONE_UP_TO ? 1 : Math.ceil((length - 1) / MAX_COUNT_BEATS)
  const stops: number[] = []
  for (let k = step; k < length; k += step) stops.push(k)
  return stops
}

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
// layout — the static figure's own geometry, imported rather than recomputed.
// ---------------------------------------------------------------------------

export type LengthRow = LengthGeometryRow
export type LengthLayout = LengthGeometry

/** The board the animation draws on — byte for byte the question picture's. */
export function buildLengthLayout(p: LengthParams): LengthLayout {
  return lengthFigureGeometry(p)
}

// ---------------------------------------------------------------------------
// storyboard
// ---------------------------------------------------------------------------

export type LengthPhase = 'intro' | 'start' | 'trap' | 'count' | 'span' | 'compare' | 'result'

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

  const countCaption = (k: number, first: boolean) =>
    first ? t(`Count: ${k} ${uw(k)}`, `Hitung: ${k} ${uw(k)}`) : `${k} ${uw(k)}`

  /**
   * Sweep the span, stopping short of the total so the result beat still lands
   * it. Short spans get a beat per unit; long ones jump in equal steps (the
   * squares inside a beat still light one after another), so the tally keeps
   * climbing without the story dragging.
   */
  const pushCounting = (i: number) => {
    const stops = countingStops(lenOf(i))
    stops.forEach((k, j) => {
      push('count', countCaption(k, j === 0), {
        item: i,
        markStart: true,
        markEnd: true,
        countTo: k,
        tally: k,
        hold: j === 0 ? 1500 : 900,
      })
    })
  }

  /**
   * One beat per object — used when several objects must be measured, where the
   * comparison, not each individual measurement, is the point.
   */
  const pushMeasure = (i: number) => {
    const s = startOf(i)
    const e = endOf(i)
    const L = lenOf(i)
    measured[i] = L
    const spanCaption = isChain
      ? t(
          `Count the squares under the ${nm(i)}: ${L}.`,
          `Hitung petak di bawah ${nm(i)}: ${L}.`,
        )
      : t(
          `The ${nm(i)} runs ${s} to ${e}, so ${e} ${MINUS} ${s} = ${L} ${uw(L)}.`,
          `${Nm(i)} dari ${s} sampai ${e}, jadi ${e} ${MINUS} ${s} = ${L} ${uw(L)}.`,
        )
    push('span', spanCaption, {
      item: i,
      markStart: true,
      markEnd: !isChain,
      countTo: L,
      tally: L,
      measured: snap(),
      focus: [i],
      hold: 2600,
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
      // Both ends in one beat: the two pointers drop together, and the trap beat
      // that follows an offset case re-states the right-hand number anyway.
      push(
        'start',
        s === 0
          ? t(
              `The ${nm(i)} starts right at 0 and ends at ${e}.`,
              `${Nm(i)} mulai tepat di angka 0 dan berhenti di angka ${e}.`,
            )
          : t(
              `The ${nm(i)} starts at ${s}, not 0, and ends at ${e}.`,
              `${Nm(i)} mulai di angka ${s}, bukan 0, dan berhenti di angka ${e}.`,
            ),
        { item: i, markStart: true, markEnd: true, hold: 2400 },
      )
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
