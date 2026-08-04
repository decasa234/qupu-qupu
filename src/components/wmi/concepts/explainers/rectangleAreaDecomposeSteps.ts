import { areaOf, readRectDecomposeParams, spanOf } from '../rectangle-area-decompose'

export type Lang = 'en' | 'id'

/**
 * The one place the frontend replays `rectangle-area-decompose`.
 *
 * The in-card figure and this storyboard read params through the SAME
 * `readRectDecomposeParams`, and the chain below is a faithful replay of the
 * backend solver in `api/services/wmi/concepts/rectangle-area-decompose` — same
 * two rules, same order of trying them, same backwards walk for "which moves
 * does the answer actually lean on". That matters: the animation must narrate
 * the very chain the written hints narrate, not a second route to the same
 * number. Because the algorithm is deterministic given params, client and
 * server land on the same steps without shipping the backend module.
 *
 * The two rules, and nothing else:
 *   • a printed AREA ÷ a side already known → the piece's other side
 *   • a printed EDGE length − the parts of it already known → the last part
 * Both only work because the pieces were cut from one rectangle, so a cut is
 * shared and a length won on one piece is the same length on its neighbour.
 */

/** Mirrors NAMES in the backend concept. */
export const NAMES = ['A', 'B', 'C', 'D', 'E', 'F'] as const

export interface RectPart {
  index: number
  value: number
}

/** One move of the chain: a column width or a row height becomes known. */
export interface RectDeriveStep {
  /** `'segment'` = printed edge minus its known parts; `'area'` = area ÷ known side. */
  rule: 'segment' | 'area'
  axis: 'w' | 'h'
  index: number
  value: number
  from: number
  to: number
  spanTotal: number
  parts: RectPart[]
  /** `'area'` only. */
  pieceIndex: number
  area: number
  otherLen: number
  otherParts: RectPart[]
}

export interface RectDecomposeView {
  rows: number
  cols: number
  widths: number[]
  heights: number[]
  pieces: { r0: number; c0: number; r1: number; c1: number }[]
  areaShown: boolean[]
  sideLabels: { axis: 'w' | 'h'; from: number; to: number }[]
  ask: 'area' | 'side'
  target: number
  targetSide: 'width' | 'height' | 'none'
  targetName: string
  /** Column widths / row heights the paper prints outright on a single part. */
  givenW: (number | null)[]
  givenH: (number | null)[]
  /** Every move the printed numbers force, and the sub-chain the answer needs. */
  steps: RectDeriveStep[]
  neededSteps: RectDeriveStep[]
  targetWidth: number
  targetHeight: number
  answerValue: number
  unit: 'cm' | 'cm²'
  /** False when the printed numbers do not pin the answer down (bad params). */
  forced: boolean
}

const varKey = (axis: 'w' | 'h', index: number): string => `${axis}${index}`

export function readRectDecomposeView(raw: unknown): RectDecomposeView {
  const p = readRectDecomposeParams(raw)
  const truth: Record<'w' | 'h', number[]> = { w: p.widths, h: p.heights }
  const known: Record<'w' | 'h', (number | null)[]> = {
    w: new Array<number | null>(p.cols).fill(null),
    h: new Array<number | null>(p.rows).fill(null),
  }
  const spanSum = (axis: 'w' | 'h', from: number, to: number): number => spanOf(truth[axis], from, to)

  // A label printed on a single part is a given, not a deduction.
  for (const l of p.sideLabels) {
    if (l.from === l.to) known[l.axis][l.from] = truth[l.axis][l.from]
  }
  const givenW = [...known.w]
  const givenH = [...known.h]

  const steps: RectDeriveStep[] = []

  const trySegment = (l: { axis: 'w' | 'h'; from: number; to: number }): RectDeriveStep | null => {
    if (l.from === l.to) return null
    const parts: RectPart[] = []
    let blank = -1
    for (let i = l.from; i <= l.to; i++) {
      const at = known[l.axis][i]
      if (at === null) {
        if (blank >= 0) return null
        blank = i
      } else {
        parts.push({ index: i, value: at })
      }
    }
    if (blank < 0) return null
    const spanTotal = spanSum(l.axis, l.from, l.to)
    const value = parts.reduce((rest, k) => rest - k.value, spanTotal)
    return {
      rule: 'segment',
      axis: l.axis,
      index: blank,
      value,
      from: l.from,
      to: l.to,
      spanTotal,
      parts,
      pieceIndex: -1,
      area: 0,
      otherLen: 0,
      otherParts: [],
    }
  }

  const tryArea = (i: number, axis: 'w' | 'h'): RectDeriveStep | null => {
    const q = p.pieces[i]
    const other: 'w' | 'h' = axis === 'w' ? 'h' : 'w'
    const from = axis === 'w' ? q.c0 : q.r0
    const to = axis === 'w' ? q.c1 : q.r1
    const ofrom = other === 'w' ? q.c0 : q.r0
    const oto = other === 'w' ? q.c1 : q.r1

    const otherParts: RectPart[] = []
    for (let k = ofrom; k <= oto; k++) {
      const at = known[other][k]
      if (at === null) return null
      otherParts.push({ index: k, value: at })
    }
    const otherLen = otherParts.reduce((sum, k) => sum + k.value, 0)
    if (otherLen <= 0) return null

    const parts: RectPart[] = []
    let blank = -1
    for (let k = from; k <= to; k++) {
      const at = known[axis][k]
      if (at === null) {
        if (blank >= 0) return null
        blank = k
      } else {
        parts.push({ index: k, value: at })
      }
    }
    if (blank < 0) return null

    const area = areaOf(p, i)
    if (area % otherLen !== 0) return null
    const spanTotal = area / otherLen
    const value = parts.reduce((rest, k) => rest - k.value, spanTotal)
    return { rule: 'area', axis, index: blank, value, from, to, spanTotal, parts, pieceIndex: i, area, otherLen, otherParts }
  }

  for (;;) {
    let move: RectDeriveStep | null = null
    for (const l of p.sideLabels) {
      move = trySegment(l)
      if (move) break
    }
    if (!move) {
      for (let i = 0; i < p.pieces.length && !move; i++) {
        if (!p.areaShown[i]) continue
        move = tryArea(i, 'h') ?? tryArea(i, 'w')
      }
    }
    if (!move) break
    known[move.axis][move.index] = move.value
    steps.push(move)
  }

  const t = p.pieces[p.target]
  const targetVars: { axis: 'w' | 'h'; index: number }[] = []
  if (p.ask === 'area' || p.targetSide === 'width') {
    for (let c = t.c0; c <= t.c1; c++) targetVars.push({ axis: 'w', index: c })
  }
  if (p.ask === 'area' || p.targetSide === 'height') {
    for (let r = t.r0; r <= t.r1; r++) targetVars.push({ axis: 'h', index: r })
  }
  const forced = targetVars.every((v) => known[v.axis][v.index] !== null)

  // A move matters if the answer needs it, and a move the answer needs drags in
  // whichever earlier values it leaned on.
  const need = new Set(targetVars.map((v) => varKey(v.axis, v.index)))
  for (let i = steps.length - 1; i >= 0; i--) {
    const st = steps[i]
    if (!need.has(varKey(st.axis, st.index))) continue
    for (const part of st.parts) need.add(varKey(st.axis, part.index))
    const other: 'w' | 'h' = st.axis === 'w' ? 'h' : 'w'
    for (const part of st.otherParts) need.add(varKey(other, part.index))
  }
  const neededSteps = steps.filter((st) => need.has(varKey(st.axis, st.index)))

  const targetWidth = spanSum('w', t.c0, t.c1)
  const targetHeight = spanSum('h', t.r0, t.r1)

  return {
    rows: p.rows,
    cols: p.cols,
    widths: p.widths,
    heights: p.heights,
    pieces: p.pieces,
    areaShown: p.areaShown,
    sideLabels: p.sideLabels,
    ask: p.ask,
    target: p.target,
    targetSide: p.targetSide,
    targetName: NAMES[p.target] ?? 'A',
    givenW,
    givenH,
    steps,
    neededSteps,
    targetWidth,
    targetHeight,
    answerValue:
      p.ask === 'area' ? targetWidth * targetHeight : p.targetSide === 'height' ? targetHeight : targetWidth,
    unit: p.ask === 'area' ? 'cm²' : 'cm',
    forced,
  }
}

// ── the child's vocabulary for one part of an edge ───────────────────────────
// The figure draws a tick rail above the rectangle and another down its left
// side, so "the second part of the top edge" is a thing that can be pointed at
// even when its length is not printed. Same wording as the written hints.

const ORD_EN = ['first', 'second', 'third'] as const
const ORD_ID = ['pertama', 'kedua', 'ketiga'] as const

export function partName(axis: 'w' | 'h', index: number, count: number, lang: Lang): string {
  if (count <= 1) {
    if (axis === 'w') return lang === 'id' ? 'sisi atas' : 'the top edge'
    return lang === 'id' ? 'sisi kiri' : 'the left edge'
  }
  // rows / cols are clamped to 3 upstream, so the ordinal always lands.
  const ord = lang === 'id' ? ORD_ID[index] : ORD_EN[index]
  if (axis === 'w') {
    return lang === 'id' ? `bagian ${ord} sisi atas` : `the ${ord} part of the top edge`
  }
  return lang === 'id' ? `bagian ${ord} sisi kiri` : `the ${ord} part of the left edge`
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

export function spanName(axis: 'w' | 'h', from: number, to: number, count: number, lang: Lang): string {
  if (from === to) return partName(axis, from, count, lang)
  if (from === 0 && to === count - 1) {
    if (axis === 'w') return lang === 'id' ? 'seluruh lebar' : 'the whole width'
    return lang === 'id' ? 'seluruh tinggi' : 'the whole height'
  }
  const names: string[] = []
  for (let i = from; i <= to; i++) names.push(partName(axis, i, count, lang))
  return lang === 'id' ? listId(names) : listEn(names)
}

const cap = (s: string): string => (s.length === 0 ? s : `${s.charAt(0).toUpperCase()}${s.slice(1)}`)

// ── beats ────────────────────────────────────────────────────────────────────

export interface RectDecomposeBeat {
  /** Column widths / row heights won so far — givens plus every earlier move. */
  knownW: (number | null)[]
  knownH: (number | null)[]
  /** The part THIS beat recovers, drawn as it lands. */
  recovered: { axis: 'w' | 'h'; index: number; value: number } | null
  /** The piece whose printed area this beat spends, or -1. */
  spendPiece: number
  /** The printed edge label this beat spends, or null. */
  spendSpan: { axis: 'w' | 'h'; from: number; to: number } | null
  /** Already-known parts this beat leans on — the "why it is knowable now". */
  spentW: number[]
  spentH: number[]
  /** Fill the target's missing value in. Last beat only. */
  reveal: boolean
  caption: string
  /** ms to hold this beat when playing (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface RectDecomposeStoryboard {
  view: RectDecomposeView
  steps: RectDecomposeBeat[]
  finalIndex: number
}

/** The caption for one move: what it recovers, and why that side is knowable NOW. */
function moveCaption(view: RectDecomposeView, st: RectDeriveStep, lang: Lang): string {
  const count = st.axis === 'w' ? view.cols : view.rows
  const mine = partName(st.axis, st.index, count, lang)
  const nums = st.parts.map((k) => k.value).join(' − ')

  if (st.rule === 'segment') {
    const whole = spanName(st.axis, st.from, st.to, count, lang)
    if (lang === 'id') {
      return `${cap(whole)} tertulis ${st.spanTotal} cm dan kita sudah punya ${nums}, jadi ${mine} = ${st.spanTotal} − ${nums} = ${st.value} cm.`
    }
    return `${cap(whole)} is printed as ${st.spanTotal} cm and we already have ${nums}, so ${mine} = ${st.spanTotal} − ${nums} = ${st.value} cm.`
  }

  const name = NAMES[st.pieceIndex] ?? '?'
  const other: 'w' | 'h' = st.axis === 'w' ? 'h' : 'w'
  if (lang === 'id') {
    const sudah = other === 'w' ? 'lebarnya' : 'tingginya'
    const cari = st.axis === 'w' ? 'lebar' : 'tinggi'
    const head = `${name} luasnya ${st.area} cm² dan ${sudah} sudah kita tahu, ${st.otherLen} cm — sisi itu dipakai bersama.`
    if (st.parts.length === 0) {
      return `${head} Jadi ${mine} = ${st.area} ÷ ${st.otherLen} = ${st.value} cm.`
    }
    return `${head} Jadi seluruh ${cari} ${name} = ${st.area} ÷ ${st.otherLen} = ${st.spanTotal} cm, dan ${mine} = ${st.spanTotal} − ${nums} = ${st.value} cm.`
  }
  const knownWord = other === 'w' ? 'wide' : 'tall'
  const wantedWord = st.axis === 'w' ? 'wide' : 'tall'
  const head = `${name} covers ${st.area} cm² and we already know it is ${st.otherLen} cm ${knownWord} — that side is shared.`
  if (st.parts.length === 0) {
    return `${head} So ${mine} = ${st.area} ÷ ${st.otherLen} = ${st.value} cm.`
  }
  return `${head} So ${name} is ${st.area} ÷ ${st.otherLen} = ${st.spanTotal} cm ${wantedWord}, and ${mine} = ${st.spanTotal} − ${nums} = ${st.value} cm.`
}

/**
 * The beat order IS the argument: the setup, then one forced deduction per beat
 * — each naming the shared side it recovers and why that side is knowable now —
 * and only then the assembly. The asked value appears exactly once, on the last
 * beat, as the end of that chain and never as a number pasted in.
 */
export function buildRectangleAreaDecomposeSteps(raw: unknown, lang: Lang): RectDecomposeStoryboard {
  const view = readRectDecomposeView(raw)
  const t = view.pieces[view.target]
  const T = view.targetName
  const steps: RectDecomposeBeat[] = []

  const knownW = [...view.givenW]
  const knownH = [...view.givenH]
  const blank = {
    recovered: null,
    spendPiece: -1,
    spendSpan: null,
    spentW: [] as number[],
    spentH: [] as number[],
    reveal: false,
    result: false,
  }

  // Setup: the rule that makes the whole chase legal, and what is missing —
  // named, never valued.
  const missing =
    view.ask === 'area'
      ? lang === 'id'
        ? `luas ${T} belum tercetak`
        : `${T}'s area is not printed`
      : view.targetSide === 'width'
        ? lang === 'id'
          ? `lebar ${T} belum tercetak`
          : `how wide ${T} is is not printed`
        : lang === 'id'
          ? `tinggi ${T} belum tercetak`
          : `how tall ${T} is is not printed`
  steps.push({
    ...blank,
    knownW: [...knownW],
    knownH: [...knownH],
    caption:
      lang === 'id'
        ? `Semua potongan dari satu persegi panjang, jadi garis potongnya dipakai bersama — dan ${missing}.`
        : `The pieces came out of one rectangle, so every cut is shared — and ${missing}.`,
    hold: 1900,
  })

  // Fold the last move into the finale whenever that move ALREADY yields the
  // asked length. Left unfolded it would speak the answer a beat early and then
  // repeat it, which is the one thing this storyboard must never do.
  //
  // Only the last needed move can do that: the chain is trimmed to the moves the
  // answer leans on, so a move that settles the asked side leaves nothing after
  // it to need. Two shapes reach it:
  //   • the move pins the single edge part that IS the asked side
  //   • the move divides the TARGET's own printed area and lands the asked side
  //     whole (`spanTotal`), with the edge part it also fixes a mere by-product
  const askAxis: 'w' | 'h' = view.targetSide === 'height' ? 'h' : 'w'
  const askFrom = askAxis === 'w' ? t.c0 : t.r0
  const askTo = askAxis === 'w' ? t.c1 : t.r1
  const singlePart = askFrom === askTo
  const last = view.neededSteps[view.neededSteps.length - 1]
  const foldPart =
    view.ask === 'side' && singlePart && last !== undefined && last.axis === askAxis && last.index === askFrom
  const foldWhole =
    view.ask === 'side' &&
    !singlePart &&
    last !== undefined &&
    last.rule === 'area' &&
    last.pieceIndex === view.target &&
    last.axis === askAxis &&
    last.from === askFrom &&
    last.to === askTo &&
    last.spanTotal === view.answerValue
  const foldFinal = foldPart || foldWhole

  view.neededSteps.forEach((st, i) => {
    if (st.axis === 'w') knownW[st.index] = st.value
    else knownH[st.index] = st.value
    const isFinale = foldFinal && i === view.neededSteps.length - 1
    const other: 'w' | 'h' = st.axis === 'w' ? 'h' : 'w'
    const spentSelf = st.parts.map((k) => k.index)
    const spentOther = st.otherParts.map((k) => k.index)

    let caption = moveCaption(view, st, lang)
    if (isFinale && foldWhole) {
      // The division IS the answer, so the by-product edge part is left out
      // rather than trailing the punchline.
      const knownWord = other === 'w' ? 'wide' : 'tall'
      const sudah = other === 'w' ? 'lebarnya' : 'tingginya'
      const wantedWord = view.targetSide === 'width' ? 'wide' : 'tall'
      const dicari = view.targetSide === 'width' ? 'lebarnya' : 'tingginya'
      caption =
        lang === 'id'
          ? `${T} luasnya ${st.area} cm² dan ${sudah} sudah kita tahu, ${st.otherLen} cm — sisi itu dipakai bersama. Luas = lebar × tinggi, jadi ${T} ${dicari} ${st.area} ÷ ${st.otherLen} = ${view.answerValue} cm.`
          : `${T} covers ${st.area} cm² and we already know it is ${st.otherLen} cm ${knownWord} — that side is shared. Area = width × height, so ${T} is ${st.area} ÷ ${st.otherLen} = ${view.answerValue} cm ${wantedWord}.`
    } else if (isFinale) {
      caption +=
        lang === 'id'
          ? ` Bagian itu persis ${view.targetSide === 'width' ? 'lebar' : 'tinggi'} ${T}, jadi ${T} ${view.targetSide === 'width' ? 'lebarnya' : 'tingginya'} ${view.answerValue} cm.`
          : ` That part is exactly ${T}'s ${view.targetSide === 'width' ? 'width' : 'height'}, so ${T} is ${view.answerValue} cm ${view.targetSide === 'width' ? 'wide' : 'tall'}.`
    }

    steps.push({
      knownW: [...knownW],
      knownH: [...knownH],
      recovered: { axis: st.axis, index: st.index, value: st.value },
      spendPiece: st.rule === 'area' ? st.pieceIndex : -1,
      spendSpan: st.rule === 'segment' ? { axis: st.axis, from: st.from, to: st.to } : null,
      spentW: st.axis === 'w' ? spentSelf : other === 'w' ? spentOther : [],
      spentH: st.axis === 'h' ? spentSelf : other === 'h' ? spentOther : [],
      reveal: isFinale,
      caption,
      hold: isFinale ? 0 : 1900,
      result: isFinale,
    })
  })

  if (!foldFinal) {
    const cols: number[] = []
    for (let c = t.c0; c <= t.c1; c++) cols.push(c)
    const rows: number[] = []
    for (let r = t.r0; r <= t.r1; r++) rows.push(r)
    const wParts = cols.map((c) => view.widths[c]).join(' + ')
    const hParts = rows.map((r) => view.heights[r]).join(' + ')

    let caption: string
    if (view.ask === 'area') {
      caption =
        lang === 'id'
          ? `Sekarang ${T} lebarnya ${view.targetWidth} cm dan tingginya ${view.targetHeight} cm. Luas = lebar × tinggi, jadi ${view.targetWidth} × ${view.targetHeight} = ${view.answerValue} cm².`
          : `Now ${T} is ${view.targetWidth} cm wide and ${view.targetHeight} cm tall. Area is width × height, so ${view.targetWidth} × ${view.targetHeight} = ${view.answerValue} cm².`
    } else if (view.targetSide === 'width') {
      caption =
        lang === 'id'
          ? `Lebar ${T} menempuh ${cols.length} bagian sisi atas: ${wParts} = ${view.answerValue} cm.`
          : `${T}'s width covers ${cols.length} parts of the top edge: ${wParts} = ${view.answerValue} cm.`
    } else {
      caption =
        lang === 'id'
          ? `Tinggi ${T} menempuh ${rows.length} bagian sisi kiri: ${hParts} = ${view.answerValue} cm.`
          : `${T}'s height covers ${rows.length} parts of the left edge: ${hParts} = ${view.answerValue} cm.`
    }

    steps.push({
      ...blank,
      knownW: [...knownW],
      knownH: [...knownH],
      spentW: view.ask === 'area' || view.targetSide === 'width' ? cols : [],
      spentH: view.ask === 'area' || view.targetSide === 'height' ? rows : [],
      reveal: true,
      caption,
      hold: 0,
      result: true,
    })
  }

  return { view, steps, finalIndex: steps.length - 1 }
}
