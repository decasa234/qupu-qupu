import type { Lang } from './makeTenSteps'

// L10 `balance-substitution`. Two level scales pin down what each shape weighs
// in unit cubes. The skill is SUBSTITUTION: once a shape balances N cubes you
// may swap that shape for those cubes ANYWHERE, and the beam never moves — an
// equal exchange keeps a scale level. A six-year-old does not try that on their
// own, so this storyboard performs the swap one item at a time, on screen, and
// every board it emits really balances (left weight === right weight) on every
// beat. A tipping beam would teach the wrong thing: these are equalities.
//
// Nothing here reads the puzzle's hidden weights. `deriveWeights` re-earns them
// from the two scales the child can see, walking the same path as the authored
// hint steps, so no number is ever asserted — only the last beat lands the answer.

export const BALANCE_SHAPES = ['circle', 'triangle', 'square', 'star'] as const
export type BalanceShape = (typeof BALANCE_SHAPES)[number]

export type BalanceAsk = 'value-of-one' | 'balance-group'
export type BalanceRole = 'A' | 'B'
export type BalancePhase = 'read' | 'share' | 'mirror' | 'swap' | 'result'
export type BalanceSpotlight = 'left' | 'right' | 'both' | null

export interface BalanceSideData {
  a: number
  b: number
  unit: number
}
export interface BalanceScaleData {
  left: BalanceSideData
  right: BalanceSideData
}

/** Mirrors the generator's params (api/services/wmi/concepts/balance-substitution). */
export interface BalanceParams {
  shapeA: BalanceShape
  shapeB: BalanceShape
  /** Hidden weights. Used ONLY as a last-ditch fallback when the scales are unreadable. */
  wA: number
  wB: number
  scales: [BalanceScaleData, BalanceScaleData]
  ask: BalanceAsk
  askShape: BalanceRole
  askCount: number
}

/**
 * One thing resting on a pan. `id` is stable across beats, so an item that
 * survives a swap keeps its identity and glides to its new slot instead of
 * popping — and an item that leaves the pan flies into the swap tray.
 */
export interface BalanceItem {
  id: string
  kind: 'shape' | 'cube'
  shape: BalanceShape | null
  role: BalanceRole | null
  /** Arrived on this beat — drops in and wears a highlight ring. */
  fresh: boolean
}

export interface BalancePan {
  items: BalanceItem[]
  /** Split the items into this many equal clusters (the sharing beat). 1 = one cluster. */
  groups: number
  /** Cube-weight of everything on the pan, from the DERIVED weights. */
  weight: number
}

export interface BalanceBoard {
  /** 1 or 2 for the two given scales; null for the scale the story builds. */
  index: number | null
  title: string
  left: BalancePan
  right: BalancePan
  /** Always true — asserted by the tests, because a tipping beam is the worst failure here. */
  level: boolean
  spotlight: BalanceSpotlight
}

/** An equivalence the child has EARNED from a scale: 1 shape = n cubes. */
export interface BalanceFact {
  role: BalanceRole
  shape: BalanceShape
  cubes: number
  /** Just earned on this beat. */
  fresh: boolean
}

export interface BalanceBeat {
  phase: BalancePhase
  caption: string
  board: BalanceBoard
  facts: BalanceFact[]
  /** Items exchanged off the pan — they fly into the tray under the scale. */
  traded: BalanceItem[]
  tradedNote: string | null
  /** The answer — non-null ONLY on the final beat. */
  reveal: number | null
  result: boolean
  hold: number
}

export interface BalanceStoryboard {
  ask: BalanceAsk
  shapeA: BalanceShape
  shapeB: BalanceShape
  /** Cube weights derived from the two scales on screen. */
  wA: number
  wB: number
  askCount: number
  answer: number
  steps: BalanceBeat[]
  finalIndex: number
}

// ── wording ───────────────────────────────────────────────────────────────

const SHAPE_ID: Record<BalanceShape, string> = {
  circle: 'lingkaran',
  triangle: 'segitiga',
  square: 'persegi',
  star: 'bintang',
}
const SHAPE_EN: Record<BalanceShape, string> = {
  circle: 'circle',
  triangle: 'triangle',
  square: 'square',
  star: 'star',
}

export function shapeWord(kind: BalanceShape, count: number, lang: Lang): string {
  if (lang === 'id') return SHAPE_ID[kind]
  return count === 1 ? SHAPE_EN[kind] : `${SHAPE_EN[kind]}s`
}
function countShape(n: number, kind: BalanceShape, lang: Lang): string {
  return `${n} ${shapeWord(kind, n, lang)}`
}
function countCubes(n: number, lang: Lang): string {
  if (lang === 'id') return `${n} kubus`
  return n === 1 ? '1 cube' : `${n} cubes`
}
function repeatedSum(times: number, value: number): string {
  return Array.from({ length: times }, () => String(value)).join(' + ')
}

// ── defensive param reading ───────────────────────────────────────────────

const SAMPLE: BalanceParams = {
  shapeA: 'triangle',
  shapeB: 'star',
  wA: 3,
  wB: 6,
  scales: [
    { left: { a: 1, b: 0, unit: 0 }, right: { a: 0, b: 0, unit: 3 } },
    { left: { a: 2, b: 0, unit: 0 }, right: { a: 0, b: 1, unit: 0 } },
  ],
  ask: 'value-of-one',
  askShape: 'B',
  askCount: 1,
}

function int(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
  return Math.max(min, Math.min(max, n))
}
function readShape(value: unknown, fallback: BalanceShape): BalanceShape {
  return BALANCE_SHAPES.includes(value as BalanceShape) ? (value as BalanceShape) : fallback
}
function readSide(value: unknown, fallback: BalanceSideData): BalanceSideData {
  const s = (value ?? {}) as Partial<BalanceSideData>
  return {
    a: int(s.a, 0, 6, fallback.a),
    b: int(s.b, 0, 6, fallback.b),
    unit: int(s.unit, 0, 12, fallback.unit),
  }
}
function readScale(value: unknown, fallback: BalanceScaleData): BalanceScaleData {
  const s = (value ?? {}) as Partial<BalanceScaleData>
  return { left: readSide(s.left, fallback.left), right: readSide(s.right, fallback.right) }
}

export function readBalanceParams(raw: unknown): BalanceParams {
  const p = (raw ?? {}) as Partial<BalanceParams>
  const scalesIn = Array.isArray(p.scales) ? p.scales : []
  return {
    shapeA: readShape(p.shapeA, SAMPLE.shapeA),
    shapeB: readShape(p.shapeB, SAMPLE.shapeB),
    wA: int(p.wA, 1, 6, SAMPLE.wA),
    wB: int(p.wB, 1, 6, SAMPLE.wB),
    scales: [readScale(scalesIn[0], SAMPLE.scales[0]), readScale(scalesIn[1], SAMPLE.scales[1])],
    ask: p.ask === 'balance-group' ? 'balance-group' : 'value-of-one',
    askShape: p.askShape === 'A' ? 'A' : 'B',
    askCount: int(p.askCount, 1, 3, 1),
  }
}

/**
 * Re-earn both shape weights from the two shown scales, exactly the way the
 * child does: start from the side that is pure cubes, then keep substituting
 * what is already known into the other scale. Never reads `p.wA` / `p.wB`
 * unless the scales are unreadable (defensive only — the generator's scales
 * always pin both weights down).
 */
export function deriveWeights(p: BalanceParams): { wA: number; wB: number } {
  let wA: number | null = null
  let wB: number | null = null

  // Return types are spelled out: both helpers read the very `wA` / `wB` the loop
  // below writes, and TypeScript cannot infer through that cycle.
  const solved = (side: BalanceSideData): boolean =>
    (side.a === 0 || wA !== null) && (side.b === 0 || wB !== null)
  const weigh = (side: BalanceSideData): number => side.a * (wA ?? 0) + side.b * (wB ?? 0) + side.unit

  for (let pass = 0; pass < 4 && (wA === null || wB === null); pass++) {
    for (const scale of p.scales) {
      const pairs: Array<[BalanceSideData, BalanceSideData]> = [
        [scale.left, scale.right],
        [scale.right, scale.left],
      ]
      for (const [known, other] of pairs) {
        if (!solved(known)) continue
        const total: number = weigh(known)
        const missA = other.a > 0 && wA === null
        const missB = other.b > 0 && wB === null
        if (missA === missB) continue // both unknown (unsolvable) or nothing to learn
        if (missA) {
          const rest: number = other.b * (wB ?? 0) + other.unit
          const value: number = (total - rest) / other.a
          if (value > 0) wA = value
        } else {
          const rest: number = other.a * (wA ?? 0) + other.unit
          const value: number = (total - rest) / other.b
          if (value > 0) wB = value
        }
      }
    }
  }

  return { wA: wA ?? p.wA, wB: wB ?? p.wB }
}

/** Split a pan's items into `groups` even clusters (used by the sharing beats). */
export function chunkItems(items: BalanceItem[], groups: number): BalanceItem[][] {
  const g = Math.max(1, Math.floor(groups))
  if (g <= 1 || items.length === 0) return [items]
  const size = Math.ceil(items.length / g)
  const out: BalanceItem[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

// ── item + board builders ─────────────────────────────────────────────────

const mkShape = (id: string, role: BalanceRole, shape: BalanceShape, fresh = false): BalanceItem => ({
  id,
  kind: 'shape',
  shape,
  role,
  fresh,
})
const mkCube = (id: string, fresh = false): BalanceItem => ({
  id,
  kind: 'cube',
  shape: null,
  role: null,
  fresh,
})

function sideItems(tag: string, side: BalanceSideData, shapeA: BalanceShape, shapeB: BalanceShape): BalanceItem[] {
  const out: BalanceItem[] = []
  for (let i = 0; i < side.a; i++) out.push(mkShape(`${tag}a${i}`, 'A', shapeA))
  for (let i = 0; i < side.b; i++) out.push(mkShape(`${tag}b${i}`, 'B', shapeB))
  for (let i = 0; i < side.unit; i++) out.push(mkCube(`${tag}u${i}`))
  return out
}

export function buildBalanceSubstitutionSteps(raw: unknown, lang: Lang): BalanceStoryboard {
  const p = readBalanceParams(raw)
  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const { wA, wB } = deriveWeights(p)
  const [s1, s2] = p.scales
  const { shapeA, shapeB } = p

  const A = (n: number) => countShape(n, shapeA, lang)
  const B = (n: number) => countShape(n, shapeB, lang)
  const Aw = (n: number) => shapeWord(shapeA, n, lang)
  const Bw = (n: number) => shapeWord(shapeB, n, lang)
  const cubes = (n: number) => countCubes(n, lang)

  const askedWeight = p.askShape === 'A' ? wA : wB
  const otherWeight = p.askShape === 'A' ? wB : wA
  const answer =
    p.ask === 'value-of-one'
      ? askedWeight
      : otherWeight > 0
        ? (p.askCount * askedWeight) / otherWeight
        : p.askCount * askedWeight

  const pan = (items: BalanceItem[], groups = 1): BalancePan => ({
    items,
    groups: Math.max(1, groups),
    weight: items.reduce((sum, it) => sum + (it.kind === 'cube' ? 1 : it.role === 'A' ? wA : wB), 0),
  })
  const board = (
    index: number | null,
    title: string,
    left: BalancePan,
    right: BalancePan,
    spotlight: BalanceSpotlight = null,
  ): BalanceBoard => ({ index, title, left, right, level: left.weight === right.weight, spotlight })

  const scaleTitle = (n: number) => T(`Scale ${n}`, `Timbangan ${n}`)
  const newTitle = T('New scale', 'Timbangan baru')

  const factA = (fresh: boolean): BalanceFact => ({ role: 'A', shape: shapeA, cubes: wA, fresh })
  const factB = (fresh: boolean): BalanceFact => ({ role: 'B', shape: shapeB, cubes: wB, fresh })

  const sideWords = (side: BalanceSideData) => {
    const parts: string[] = []
    if (side.a > 0) parts.push(A(side.a))
    if (side.b > 0) parts.push(B(side.b))
    if (side.unit > 0) parts.push(cubes(side.unit))
    if (parts.length === 0) return T('nothing', 'kosong')
    return parts.join(T(' and ', ' dan '))
  }
  const readCaption = (n: number, scale: BalanceScaleData) => {
    const count = scale.left.a + scale.left.b + scale.left.unit
    return T(
      `Scale ${n}: ${sideWords(scale.left)} ${count === 1 ? 'balances' : 'balance'} ${sideWords(scale.right)}.`,
      `Timbangan ${n}: ${sideWords(scale.left)} seimbang dengan ${sideWords(scale.right)}.`,
    )
  }

  const steps: BalanceBeat[] = []
  type Draft = {
    phase: BalancePhase
    caption: string
    board: BalanceBoard
    facts: BalanceFact[]
    traded?: BalanceItem[]
    tradedNote?: string | null
    reveal?: number | null
    result?: boolean
    hold?: number
  }
  const push = (draft: Draft) => {
    steps.push({
      traded: [],
      tradedNote: null,
      reveal: null,
      result: false,
      hold: 2200,
      ...draft,
    })
  }

  if (p.ask === 'value-of-one') {
    buildValueOfOne()
  } else {
    buildBalanceGroup()
  }

  return {
    ask: p.ask,
    shapeA,
    shapeB,
    wA,
    wB,
    askCount: p.askCount,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }

  // ── value-of-one ────────────────────────────────────────────────────────
  // Scale 1 anchors shape A against cubes; scale 2 trades A for B. Swap the A
  // glyphs on scale 2 for their cubes, one at a time, and B's weight falls out.
  function buildValueOfOne() {
    const a = Math.max(1, s1.left.a)
    const cubes1 = s1.right.unit
    const c = Math.max(1, s2.left.a)
    const d = Math.max(1, s2.right.b)
    const linked = c * wA

    // Beat 1 — read the anchor scale.
    push({
      phase: 'read',
      caption: readCaption(1, s1),
      board: board(1, scaleTitle(1), pan(sideItems('s1l', s1.left, shapeA, shapeB)), pan(sideItems('s1r', s1.right, shapeA, shapeB))),
      facts: a === 1 ? [factA(true)] : [],
      hold: 2200,
    })

    // Beat 2 — share the cubes out so ONE shape's weight is seen, not asserted.
    if (a > 1) {
      push({
        phase: 'share',
        caption: T(
          `Share them out: ${cubes1} cubes for ${A(a)}. Each ${Aw(1)} = ${cubes(wA)}.`,
          `Bagi rata: ${cubes1} kubus untuk ${A(a)}. Tiap ${Aw(1)} = ${wA} kubus.`,
        ),
        board: board(
          1,
          scaleTitle(1),
          pan(sideItems('s1l', s1.left, shapeA, shapeB), a),
          pan(sideItems('s1r', s1.right, shapeA, shapeB), a),
        ),
        facts: [factA(true)],
        hold: 2800,
      })
    }

    // Beat 3 — read the linking scale.
    const s2left = sideItems('s2l', s2.left, shapeA, shapeB)
    const s2right = sideItems('s2r', s2.right, shapeA, shapeB)
    push({
      phase: 'read',
      caption: readCaption(2, s2),
      board: board(2, scaleTitle(2), pan(s2left), pan(s2right)),
      facts: [factA(false)],
      hold: 2200,
    })

    // Beats 4+ — THE SUBSTITUTION. One shape at a time leaves the pan and its
    // cubes drop in. Same weight in, same weight out, so the beam never moves.
    const swapCubes = (index: number, fresh: boolean) =>
      Array.from({ length: wA }, (_, j) => mkCube(`s2l-a${index}c${j}`, fresh))
    const shapeAt = (index: number) => mkShape(`s2la${index}`, 'A', shapeA)

    const keptAfterFirst = Array.from({ length: c - 1 }, (_, i) => shapeAt(i))
    push({
      phase: 'swap',
      caption: T(
        `Swap 1 ${Aw(1)} for ${cubes(wA)}. Same weight, so the beam does not move.`,
        `Tukar 1 ${Aw(1)} dengan ${wA} kubus. Sama berat, timbangan tetap lurus.`,
      ),
      board: board(2, scaleTitle(2), pan([...keptAfterFirst, ...swapCubes(c - 1, true)]), pan(s2right)),
      facts: [factA(false)],
      traded: [shapeAt(c - 1)],
      tradedNote: T(`= ${cubes(wA)}`, `= ${wA} kubus`),
      hold: 2800,
    })

    const allCubes: BalanceItem[] = []
    for (let i = 0; i < c; i++) allCubes.push(...swapCubes(i, i !== c - 1))
    const allShapes = Array.from({ length: c }, (_, i) => shapeAt(i))

    if (c > 1) {
      push({
        phase: 'swap',
        caption:
          c - 1 === 1
            ? T(
                `Swap the last ${Aw(1)} the same way. Still level.`,
                `Tukar ${Aw(1)} terakhir dengan cara sama. Tetap seimbang.`,
              )
            : T(
                `Swap the other ${A(c - 1)} the same way. Still level.`,
                `Tukar ${A(c - 1)} sisanya dengan cara sama. Tetap seimbang.`,
              ),
        board: board(2, scaleTitle(2), pan(allCubes), pan(s2right)),
        facts: [factA(false)],
        traded: allShapes,
        tradedNote: T(`= ${cubes(linked)}`, `= ${linked} kubus`),
        hold: 2800,
      })
    }

    const countLine = c > 1 ? `${repeatedSum(c, wA)} = ${linked}` : String(linked)

    if (d === 1) {
      // Nothing is left but cubes against one B — count them and land it.
      push({
        phase: 'result',
        caption: T(
          `Count the cubes: ${countLine}. So 1 ${Bw(1)} balances ${cubes(linked)}.`,
          `Hitung kubusnya: ${countLine}. Jadi 1 ${Bw(1)} seimbang dengan ${linked} kubus.`,
        ),
        board: board(2, scaleTitle(2), pan(allCubes.map((it) => ({ ...it, fresh: false }))), pan(s2right), 'both'),
        facts: [factA(false), factB(true)],
        traded: allShapes,
        tradedNote: T(`= ${cubes(linked)}`, `= ${linked} kubus`),
        reveal: answer,
        result: true,
        hold: 0,
      })
    } else {
      // More than one B on the pan: share the cubes between them, evenly.
      push({
        phase: 'result',
        caption: T(
          `Count the cubes: ${countLine}. Shared by ${B(d)}, each ${Bw(1)} = ${cubes(wB)}.`,
          `Hitung kubusnya: ${countLine}. Dibagi rata untuk ${B(d)}, tiap ${Bw(1)} = ${wB} kubus.`,
        ),
        board: board(
          2,
          scaleTitle(2),
          pan(
            allCubes.map((it) => ({ ...it, fresh: false })),
            d,
          ),
          pan(s2right, d),
          'both',
        ),
        facts: [factA(false), factB(true)],
        traded: allShapes,
        tradedNote: T(`= ${cubes(linked)}`, `= ${linked} kubus`),
        reveal: answer,
        result: true,
        hold: 0,
      })
    }
  }

  // ── balance-group ───────────────────────────────────────────────────────
  // Both given scales anchor a shape against cubes. The story then builds a
  // scale that is true by inspection (the same thing on both sides) and turns
  // ONE side into the other shape by two rounds of equal exchange.
  function buildBalanceGroup() {
    const p1 = Math.max(1, s1.left.a)
    const cubes1 = s1.right.unit
    const r = Math.max(1, s2.left.b)
    const cubes2 = s2.right.unit
    const total = p.askCount * wA

    // Beat 1 — read scale 1.
    push({
      phase: 'read',
      caption: readCaption(1, s1),
      board: board(1, scaleTitle(1), pan(sideItems('s1l', s1.left, shapeA, shapeB)), pan(sideItems('s1r', s1.right, shapeA, shapeB))),
      facts: p1 === 1 ? [factA(true)] : [],
      hold: 2200,
    })

    if (p1 > 1) {
      push({
        phase: 'share',
        caption: T(
          `Share them out: ${cubes1} cubes for ${A(p1)}. Each ${Aw(1)} = ${cubes(wA)}.`,
          `Bagi rata: ${cubes1} kubus untuk ${A(p1)}. Tiap ${Aw(1)} = ${wA} kubus.`,
        ),
        board: board(
          1,
          scaleTitle(1),
          pan(sideItems('s1l', s1.left, shapeA, shapeB), p1),
          pan(sideItems('s1r', s1.right, shapeA, shapeB), p1),
        ),
        facts: [factA(true)],
        hold: 2800,
      })
    }

    // Beat — read scale 2.
    push({
      phase: 'read',
      caption: readCaption(2, s2),
      board: board(2, scaleTitle(2), pan(sideItems('s2l', s2.left, shapeA, shapeB)), pan(sideItems('s2r', s2.right, shapeA, shapeB))),
      facts: r === 1 ? [factA(false), factB(true)] : [factA(false)],
      hold: 2200,
    })

    if (r > 1) {
      push({
        phase: 'share',
        caption: T(
          `Share them out: ${cubes2} cubes for ${B(r)}. Each ${Bw(1)} = ${cubes(wB)}.`,
          `Bagi rata: ${cubes2} kubus untuk ${B(r)}. Tiap ${Bw(1)} = ${wB} kubus.`,
        ),
        board: board(
          2,
          scaleTitle(2),
          pan(sideItems('s2l', s2.left, shapeA, shapeB), r),
          pan(sideItems('s2r', s2.right, shapeA, shapeB), r),
        ),
        facts: [factA(false), factB(true)],
        hold: 2800,
      })
    }

    // Beat — the work scale, true by inspection: the same thing on both sides.
    const n = p.askCount
    const leftShapes = Array.from({ length: n }, (_, i) => mkShape(`wkla${i}`, 'A', shapeA))
    const rightShape = (i: number, fresh = false) => mkShape(`wkra${i}`, 'A', shapeA, fresh)
    const facts2 = [factA(false), factB(false)]

    push({
      phase: 'mirror',
      caption: T(
        `A new scale: ${A(n)} on each side. Exactly the same, so it must be level.`,
        `Timbangan baru: ${A(n)} di kiri, ${A(n)} di kanan. Sama persis, pasti seimbang.`,
      ),
      board: board(
        null,
        newTitle,
        pan(leftShapes),
        pan(Array.from({ length: n }, (_, i) => rightShape(i, true))),
      ),
      facts: facts2,
      hold: 2600,
    })

    // Round 1 — turn the right-hand shapes into cubes, one shape per beat.
    const cubesOf = (i: number, fresh: boolean) =>
      Array.from({ length: wA }, (_, j) => mkCube(`wkr-a${i}c${j}`, fresh))
    for (let done = 1; done <= n; done++) {
      const kept = Array.from({ length: n - done }, (_, i) => rightShape(i))
      const swapped: BalanceItem[] = []
      for (let i = n - done; i < n; i++) swapped.push(...cubesOf(i, i === n - done))
      push({
        phase: 'swap',
        caption:
          done === 1
            ? T(
                `Swap 1 ${Aw(1)} on the right for ${cubes(wA)}. Same weight, still level.`,
                `Tukar 1 ${Aw(1)} di kanan dengan ${wA} kubus. Sama berat, tetap seimbang.`,
              )
            : T(
                `Swap the last ${Aw(1)} too: ${repeatedSum(n, wA)} = ${total} cubes.`,
                `Tukar ${Aw(1)} satunya juga: ${repeatedSum(n, wA)} = ${total} kubus.`,
              ),
        board: board(null, newTitle, pan(leftShapes), pan([...kept, ...swapped])),
        facts: facts2,
        traded: Array.from({ length: done }, (_, k) => rightShape(n - done + k)),
        tradedNote: T(`= ${cubes(done * wA)}`, `= ${done * wA} kubus`),
        hold: 2800,
      })
    }

    // Round 2 — the same trick backwards: every wB cubes become one B.
    const allCubes: BalanceItem[] = []
    for (let i = 0; i < n; i++) allCubes.push(...cubesOf(i, false))
    const bAt = (i: number, fresh = false) => mkShape(`wkrb${i}`, 'B', shapeB, fresh)
    const groupsOfB = Math.max(1, Math.round(answer))

    push({
      phase: 'swap',
      caption: T(
        `Now go the other way: ${cubes(wB)} = 1 ${Bw(1)}. Swap them.`,
        `Sekarang sebaliknya: ${wB} kubus = 1 ${Bw(1)}. Tukar!`,
      ),
      board: board(null, newTitle, pan(leftShapes), pan([bAt(0, true), ...allCubes.slice(wB)])),
      facts: facts2,
      traded: allCubes.slice(0, wB),
      tradedNote: T(`= 1 ${Bw(1)}`, `= 1 ${Bw(1)}`),
      hold: 2800,
    })

    push({
      phase: 'result',
      caption: T(
        `Swap the rest the same way: ${B(groupsOfB)}. So ${B(groupsOfB)} balance ${A(n)}.`,
        `Tukar sisanya dengan cara sama: ${B(groupsOfB)}. Jadi ${B(groupsOfB)} seimbang dengan ${A(n)}.`,
      ),
      board: board(
        null,
        newTitle,
        pan(leftShapes),
        pan(Array.from({ length: groupsOfB }, (_, i) => bAt(i, i > 0))),
        'right',
      ),
      facts: facts2,
      traded: allCubes,
      tradedNote: T(`= ${B(groupsOfB)}`, `= ${B(groupsOfB)}`),
      reveal: answer,
      result: true,
      hold: 0,
    })
  }
}
