import type { CellState } from '../ordinal-position-read'
import type { Lang } from './makeTenSteps'

// `ordinal-position-read`. The whole difficulty is direction: a six-year-old
// reads left to right, so "3rd from the right" gets counted from the left. This
// storyboard therefore never states the rule. It draws the tempting picture
// FIRST (count from the left, land on the wrong card, rose), then restarts at
// the correct end and walks the row one card at a time with a running badge, so
// the answer is something the child watched being reached rather than told.

export type OrdinalAsk = 'read' | 'sum' | 'difference' | 'which-option-contains-both'
export type OrdinalKind = 'number' | 'picture'
export type OrdinalPhase = 'setup' | 'trap' | 'aim' | 'count' | 'land' | 'result'

const ASKS: readonly OrdinalAsk[] = ['read', 'sum', 'difference', 'which-option-contains-both']

const PICTURE_NAMES: Record<string, { id: string; en: string }> = {
  apple: { id: 'apel', en: 'apple' },
  banana: { id: 'pisang', en: 'banana' },
  cherry: { id: 'ceri', en: 'cherry' },
  star: { id: 'bintang', en: 'star' },
  tree: { id: 'pohon', en: 'tree' },
  house: { id: 'rumah', en: 'house' },
}

/** Mirrors the generator's anchor union (api/services/wmi/concepts/ordinal-position-read). */
export type OrdinalAnchor =
  | { type: 'from-left'; k: number }
  | { type: 'from-right'; k: number }
  | { type: 'neighbour-of'; marker: number; side: 'left' | 'right' }
  | { type: 'offset-from-item'; marker: number; dir: 'left' | 'right'; step: number }

/** Mirrors the generator's params. */
export interface OrdinalParams {
  kind: OrdinalKind
  cells: string[]
  anchors: OrdinalAnchor[]
  ask: OrdinalAsk
  optionShift: number
}

export interface OrdinalBeat {
  phase: OrdinalPhase
  caption: string
  /** Per-cell tint, same length as `cells`. */
  states: CellState[]
  /** Per-cell running-count chip, same length as `cells`. */
  badges: (number | null)[]
  /** Which end the counting arrow sits under. */
  arrow: 'left' | 'right' | null
  /** The answer — non-null ONLY on the final beat. */
  reveal: string | null
  trap: boolean
  result: boolean
  hold: number
}

export interface OrdinalStoryboard {
  ask: OrdinalAsk
  kind: OrdinalKind
  cells: string[]
  n: number
  answer: string
  steps: OrdinalBeat[]
  finalIndex: number
}

const clampInt = (value: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
  return Math.max(min, Math.min(max, n))
}

/** Same resolution the generator uses; duplicated so the beats can never drift. */
export function resolveAnchor(a: OrdinalAnchor, n: number): number {
  switch (a.type) {
    case 'from-left':
      return a.k - 1
    case 'from-right':
      return n - a.k
    case 'neighbour-of':
      return a.side === 'left' ? a.marker - 1 : a.marker + 1
    case 'offset-from-item':
      return a.dir === 'left' ? a.marker - a.step : a.marker + a.step
  }
}

function labelOf(cell: string, kind: OrdinalKind, lang: Lang): string {
  if (kind === 'number') return cell
  const entry = PICTURE_NAMES[cell]
  return entry ? entry[lang] : cell
}

const ORD_EN = ['0th', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th']
const ordEn = (k: number): string => ORD_EN[k] ?? `${k}th`

function sanitizeAnchor(raw: unknown, n: number): OrdinalAnchor {
  const a = (raw ?? {}) as Partial<OrdinalAnchor> & Record<string, unknown>
  if (a.type === 'neighbour-of' || a.type === 'offset-from-item') {
    const marker = clampInt(a.marker, 0, n - 1, Math.floor(n / 2))
    if (a.type === 'neighbour-of') {
      const side = a.side === 'left' ? 'left' : 'right'
      const fits = side === 'left' ? marker - 1 >= 0 : marker + 1 <= n - 1
      return { type: 'neighbour-of', marker, side: fits ? side : side === 'left' ? 'right' : 'left' }
    }
    const step = clampInt(a.step, 1, 3, 2)
    const dir = a.dir === 'left' ? 'left' : 'right'
    const fits = dir === 'left' ? marker - step >= 0 : marker + step <= n - 1
    return {
      type: 'offset-from-item',
      marker,
      step,
      dir: fits ? dir : dir === 'left' ? 'right' : 'left',
    }
  }
  const k = clampInt(a.k, 1, n, 2)
  return a.type === 'from-right' ? { type: 'from-right', k } : { type: 'from-left', k }
}

export function buildOrdinalPositionReadSteps(raw: unknown, lang: Lang): OrdinalStoryboard {
  const p = (raw ?? {}) as Partial<OrdinalParams>
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const kind: OrdinalKind = p.kind === 'picture' ? 'picture' : 'number'
  const cellsRaw =
    Array.isArray(p.cells) && p.cells.length > 0 && p.cells.every((c) => typeof c === 'string')
      ? (p.cells as string[])
      : ['5', '2', '8', '1', '9', '4', '7']
  const cells = cellsRaw
  const n = cells.length
  let ask: OrdinalAsk = ASKS.includes(p.ask as OrdinalAsk) ? (p.ask as OrdinalAsk) : 'read'
  // Arithmetic asks only exist on number rows; a mismatched instance degrades to
  // the plain read rather than printing NaN.
  if (kind !== 'number' && (ask === 'sum' || ask === 'difference')) ask = 'read'
  const anchorList = Array.isArray(p.anchors) && p.anchors.length > 0 ? p.anchors : [{ type: 'from-right', k: 2 }]
  const anchors = anchorList.slice(0, ask === 'read' ? 1 : 2).map((a) => sanitizeAnchor(a, n))
  if (ask !== 'read' && anchors.length === 1) anchors.push(sanitizeAnchor({ type: 'from-left', k: 2 }, n))

  const label = (i: number) => labelOf(cells[i], kind, lang)
  const unit = T(kind === 'number' ? 'card' : 'place', kind === 'number' ? 'kartu' : 'tempat')
  const unitPlural = T(kind === 'number' ? 'cards' : 'places', kind === 'number' ? 'kartu' : 'tempat')

  const targets = anchors.map((a) => resolveAnchor(a, n))
  const values = targets.map((t) => Number(cells[t]))

  const answer =
    ask === 'sum'
      ? String(values[0] + values[1])
      : ask === 'difference'
        ? String(Math.abs(values[0] - values[1]))
        : ask === 'read'
          ? label(targets[0])
          : `${label(targets[0])} + ${label(targets[1])}`

  const idle = (): CellState[] => new Array<CellState>(n).fill('idle')
  const noBadges = (): (number | null)[] => new Array<number | null>(n).fill(null)

  const steps: OrdinalBeat[] = []
  type Draft = Partial<OrdinalBeat> & { phase: OrdinalPhase; caption: string }
  const push = (draft: Draft) => {
    steps.push({
      states: idle(),
      badges: noBadges(),
      arrow: null,
      reveal: null,
      trap: false,
      result: false,
      hold: 1800,
      ...draft,
    })
  }

  // ── Beat 1: just the row, counted out loud. Everything below leans on n. ──
  push({
    phase: 'setup',
    caption: T(
      `The row holds ${n} ${unitPlural}. Nothing is marked yet — we have to walk it ourselves.`,
      `Barisan ini berisi ${n} ${unitPlural}. Belum ada yang ditandai — kita harus menelusurinya sendiri.`,
    ),
    hold: 2200,
  })

  /** Marks every target already settled on earlier beats, so they stay green. */
  const settled = (upTo: number): CellState[] => {
    const s = idle()
    for (let i = 0; i < upTo; i++) s[targets[i]] = 'target'
    return s
  }
  const settledBadges = () => noBadges()

  for (let ai = 0; ai < anchors.length; ai++) {
    const a = anchors[ai]
    const t = targets[ai]
    const fromLeftPos = t + 1
    const fromRightPos = n - t
    const many = anchors.length > 1
    const which = many ? T(ai === 0 ? 'First target: ' : 'Second target: ', ai === 0 ? 'Sasaran pertama: ' : 'Sasaran kedua: ') : ''

    if (a.type === 'from-left' || a.type === 'from-right') {
      /** The end the question counts from. */
      const startSide: 'left' | 'right' = a.type === 'from-left' ? 'left' : 'right'
      /** The end a slip counts from — also the end the cross-check comes back from. */
      const otherSide: 'left' | 'right' = startSide === 'left' ? 'right' : 'left'
      const startSideId = startSide === 'left' ? 'kiri' : 'kanan'
      const otherSideId = otherSide === 'left' ? 'kiri' : 'kanan'
      const wrongIdx = startSide === 'left' ? n - a.k : a.k - 1
      const otherPos = startSide === 'left' ? fromRightPos : fromLeftPos

      // ── Trap beat: the picture the wrong end draws. Only worth showing when
      // it lands somewhere else, and only for the "from the right" slip a child
      // actually makes (reading order pulls them left).
      if (wrongIdx !== t && a.type === 'from-right') {
        const wrongStates = settled(ai)
        for (let j = 0; j < a.k; j++) wrongStates[j] = 'count'
        wrongStates[wrongIdx] = 'wrong'
        const wrongBadges = settledBadges()
        for (let j = 0; j < a.k; j++) wrongBadges[j] = j + 1
        push({
          phase: 'trap',
          caption: T(
            `${which}Reading order pulls us left: 1, 2, … ${a.k} from the LEFT lands on ${label(wrongIdx)}. But the question said from the right, so this count started at the wrong end.`,
            `${which}Kebiasaan membaca menarik kita ke kiri: 1, 2, … ${a.k} dari KIRI mendarat di ${label(wrongIdx)}. Padahal soal minta dari kanan, jadi hitungan ini mulai dari ujung yang salah.`,
          ),
          states: wrongStates,
          badges: wrongBadges,
          arrow: 'left',
          trap: true,
          hold: 3200,
        })
      }

      push({
        phase: 'aim',
        caption: T(
          `${which}Start over at the far ${startSide} ${unit}. That one is count 1.`,
          `${which}Mulai lagi dari ${unit} paling ujung ${startSideId}. Itulah hitungan ke-1.`,
        ),
        states: settled(ai),
        arrow: startSide,
        hold: 2000,
      })

      for (let j = 1; j <= a.k; j++) {
        const idx = startSide === 'left' ? j - 1 : n - j
        const s = settled(ai)
        const b = settledBadges()
        for (let q = 1; q <= j; q++) {
          const qi = startSide === 'left' ? q - 1 : n - q
          s[qi] = q === j && j === a.k ? 'target' : 'count'
          b[qi] = q
        }
        const last = j === a.k
        push({
          phase: last ? 'land' : 'count',
          caption: last
            ? T(
                `Count ${j} from the ${startSide} — stop here. This ${unit} holds ${label(idx)}.`,
                `Hitungan ke-${j} dari ${startSideId} — berhenti di sini. Isinya ${label(idx)}.`,
              )
            : T(
                `Count ${j} from the ${startSide}: ${label(idx)}.`,
                `Hitungan ke-${j} dari ${startSideId}: ${label(idx)}.`,
              ),
          states: s,
          badges: b,
          arrow: startSide,
          hold: last ? 2400 : 1200,
        })
      }

      push({
        phase: 'land',
        caption: T(
          `Check from the other end: ${n} − ${a.k} + 1 = ${otherPos}, and the ${ordEn(otherPos)} ${unit} from the ${otherSide} is ${label(t)} too.`,
          `Cek dari sisi lain: ${n} − ${a.k} + 1 = ${otherPos}, dan ${unit} ke-${otherPos} dari ${otherSideId} juga ${label(t)}.`,
        ),
        states: settled(ai + 1),
        hold: 2600,
      })
      continue
    }

    // ── Landmark anchors: find the named item, then step away from it. ──────
    const marker = a.marker
    const dir = a.type === 'neighbour-of' ? a.side : a.dir
    const step = a.type === 'neighbour-of' ? 1 : a.step
    const dirId = dir === 'left' ? 'kiri' : 'kanan'
    const markerLabel = label(marker)

    const findStates = settled(ai)
    findStates[marker] = 'landmark'
    push({
      phase: 'aim',
      caption: T(
        `${which}Find ${markerLabel} first. Counting from the left it is place ${marker + 1}.`,
        `${which}Cari ${markerLabel} dulu. Dihitung dari kiri, itu urutan ke-${marker + 1}.`,
      ),
      states: findStates,
      badges: (() => {
        const b = settledBadges()
        b[marker] = marker + 1
        return b
      })(),
      arrow: 'left',
      hold: 2400,
    })

    // The classic slip: stopping on the landmark itself (or one place short).
    const nearIdx = dir === 'left' ? marker - 1 : marker + 1
    if (step > 1 && nearIdx !== t) {
      const s = settled(ai)
      s[marker] = 'landmark'
      s[nearIdx] = 'wrong'
      push({
        phase: 'trap',
        caption: T(
          `${step} places away is not the same as the next one. Stopping at ${label(nearIdx)} is only 1 step.`,
          `${step} tempat bukan berarti yang tepat di sebelahnya. Berhenti di ${label(nearIdx)} baru 1 langkah.`,
        ),
        states: s,
        trap: true,
        hold: 2800,
      })
    }

    for (let j = 1; j <= step; j++) {
      const idx = dir === 'left' ? marker - j : marker + j
      const s = settled(ai)
      s[marker] = 'landmark'
      for (let q = 1; q < j; q++) s[dir === 'left' ? marker - q : marker + q] = 'count'
      s[idx] = j === step ? 'target' : 'count'
      const b = settledBadges()
      b[marker] = marker + 1
      const last = j === step
      push({
        phase: last ? 'land' : 'count',
        caption: last
          ? T(
              `Step ${j} to the ${dir} lands on place ${idx + 1} from the left: ${label(idx)}.`,
              `Langkah ke-${j} ke ${dirId} mendarat di urutan ke-${idx + 1} dari kiri: ${label(idx)}.`,
            )
          : T(
              `Step ${j} to the ${dir}: place ${idx + 1}.`,
              `Langkah ke-${j} ke ${dirId}: urutan ke-${idx + 1}.`,
            ),
        states: s,
        badges: b,
        hold: last ? 2400 : 1200,
      })
    }

    push({
      phase: 'land',
      caption: T(
        `Check from the right: the ${ordEn(fromRightPos)} ${unit} from the right is ${label(t)} too — the landmark ${markerLabel} was only the starting point.`,
        `Cek dari kanan: ${unit} ke-${fromRightPos} dari kanan juga ${label(t)} — ${markerLabel} tadi hanya titik awal.`,
      ),
      states: settled(ai + 1),
      hold: 2600,
    })
  }

  // ── Final beat: only now is the answer said out loud, as the payoff. ───────
  const finalStates = settled(anchors.length)
  const finalCaption =
    ask === 'read'
      ? T(
          `So the place the question pointed at holds ${label(targets[0])}.`,
          `Jadi tempat yang ditunjuk soal berisi ${label(targets[0])}.`,
        )
      : ask === 'sum'
        ? T(
            `Both places are green now: ${values[0]} and ${values[1]}. Add them: ${values[0]} + ${values[1]} = ${answer}.`,
            `Kedua tempatnya sudah hijau: ${values[0]} dan ${values[1]}. Jumlahkan: ${values[0]} + ${values[1]} = ${answer}.`,
          )
        : ask === 'difference'
          ? T(
              `Both places are green now: ${values[0]} and ${values[1]}. Take the smaller from the larger: ${Math.max(values[0], values[1])} − ${Math.min(values[0], values[1])} = ${answer}.`,
              `Kedua tempatnya sudah hijau: ${values[0]} dan ${values[1]}. Kurangkan yang besar dengan yang kecil: ${Math.max(values[0], values[1])} − ${Math.min(values[0], values[1])} = ${answer}.`,
            )
          : T(
              `The two places hold ${label(targets[0])} and ${label(targets[1])} — pick the option that names exactly those two.`,
              `Kedua tempat itu berisi ${label(targets[0])} dan ${label(targets[1])} — pilih jawaban yang menyebutkan tepat kedua itu.`,
            )

  push({
    phase: 'result',
    caption: finalCaption,
    states: finalStates,
    reveal: answer,
    result: true,
    hold: 0,
  })

  return {
    ask,
    kind,
    cells,
    n,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
