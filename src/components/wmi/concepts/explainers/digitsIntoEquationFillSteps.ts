import type { Lang } from './makeTenSteps'

// `digits-into-equation-fill`. A pile of number cards and an equation made of
// empty boxes. The habit this storyboard teaches is the opposite of guessing:
// you read ONE column (or one divisor, or one place value), that reading hands
// you a short finite list of candidates, and then you knock the list down until
// a single arrangement is left standing.
//
// So the picture is always the same three things — the card rail, the boxes, and
// a LEDGER of candidates that fills in one beat at a time with a ✓ or a ✗. The
// ledger is the point: the child watches the possibilities run out.
//
// Mirrors api/services/wmi/concepts/digits-into-equation-fill. Params arrive as
// `unknown` from the DB, so every number is re-derived and clamped here, and any
// params that do not describe a solvable puzzle fall back to a known-good one.
// The storyboard can therefore never narrate a sweep that lands nowhere.
export type FillAsk = 'which-card-used' | 'the-result' | 'largest-quotient' | 'minimise-largest-term'
export type FillSkeleton =
  | 'two-plus-one'
  | 'two-plus-two'
  | 'div-triple'
  | 'three-by-one'
  | 'three-two-digit-sum'

/** How one box of the equation frame looks on a given beat. */
export type SlotTone = 'empty' | 'trial' | 'good' | 'bad'
/** How one card on the rail looks on a given beat. */
export type CardState = 'idle' | 'trial' | 'used' | 'out'

export interface FillSlot {
  text: string
  tone: SlotTone
}

/** One line of the exhaustive sweep, revealed on the beat that tests it. */
export interface LedgerRow {
  text: string
  ok: boolean
}

/** The frame is a flat list of boxes and the operators between them. */
export type FrameToken = { kind: 'box'; index: number } | { kind: 'op'; text: string }

export interface FillBeat {
  phase: 'setup' | 'rule' | 'trap' | 'probe' | 'result'
  caption: string
  /** Index-aligned with the card rail. */
  cards: CardState[]
  /** Index-aligned with the frame's boxes. */
  slots: FillSlot[]
  /** Ledger rows visible so far. */
  rows: LedgerRow[]
  /** Indices within `rows` that were added on this beat. */
  litRows: number[]
  trap: boolean
  result: boolean
  /** The answer — non-null ONLY on the final beat. */
  reveal: string | null
  hold: number
}

export interface FillStoryboard {
  ask: FillAsk
  skeleton: FillSkeleton
  cards: number[]
  tokens: FrameToken[]
  boxCount: number
  /** What the child types (or the choice letter for the picker ask). */
  answer: string
  steps: FillBeat[]
  finalIndex: number
}

export interface DigitsIntoEquationFillParams {
  ask: FillAsk
  skeleton: FillSkeleton
  cards: number[]
  total: number | null
  choices: number[] | null
  answerCard: number | null
}

const FRAME_TOKENS: Record<FillSkeleton, FrameToken[]> = {
  'two-plus-one': [
    { kind: 'box', index: 0 },
    { kind: 'box', index: 1 },
    { kind: 'op', text: '+' },
    { kind: 'box', index: 2 },
    { kind: 'op', text: '=' },
    { kind: 'box', index: 3 },
    { kind: 'box', index: 4 },
  ],
  'two-plus-two': [
    { kind: 'box', index: 0 },
    { kind: 'box', index: 1 },
    { kind: 'op', text: '+' },
    { kind: 'box', index: 2 },
    { kind: 'box', index: 3 },
    { kind: 'op', text: '=' },
    { kind: 'box', index: 4 },
    { kind: 'box', index: 5 },
  ],
  'div-triple': [
    { kind: 'box', index: 0 },
    { kind: 'op', text: '÷' },
    { kind: 'box', index: 1 },
    { kind: 'op', text: '=' },
    { kind: 'box', index: 2 },
  ],
  'three-by-one': [
    { kind: 'box', index: 0 },
    { kind: 'box', index: 1 },
    { kind: 'box', index: 2 },
    { kind: 'op', text: '÷' },
    { kind: 'box', index: 3 },
  ],
  'three-two-digit-sum': [
    { kind: 'box', index: 0 },
    { kind: 'box', index: 1 },
    { kind: 'op', text: '+' },
    { kind: 'box', index: 2 },
    { kind: 'box', index: 3 },
    { kind: 'op', text: '+' },
    { kind: 'box', index: 4 },
    { kind: 'box', index: 5 },
  ],
}

const BOX_COUNT: Record<FillSkeleton, number> = {
  'two-plus-one': 5,
  'two-plus-two': 6,
  'div-triple': 3,
  'three-by-one': 4,
  'three-two-digit-sum': 6,
}

const CARD_COUNT: Record<FillSkeleton, number> = {
  'two-plus-one': 5,
  'two-plus-two': 6,
  'div-triple': 8,
  'three-by-one': 4,
  'three-two-digit-sum': 6,
}

const SKELETON_FOR: Record<FillAsk, FillSkeleton> = {
  'which-card-used': 'div-triple',
  'the-result': 'two-plus-one',
  'largest-quotient': 'three-by-one',
  'minimise-largest-term': 'three-two-digit-sum',
}

/** A puzzle that always works, used whenever the stored params do not. */
const FALLBACK: DigitsIntoEquationFillParams = {
  ask: 'the-result',
  skeleton: 'two-plus-one',
  cards: [1, 2, 3, 4, 7],
  total: null,
  choices: null,
  answerCard: null,
}

const CHECK = '✓'
const CROSS = '✗'
/** Beats spent on the sweep. More candidates than this get grouped per beat. */
const MAX_PROBE_BEATS = 5

// ── Re-derivation (no shared code with the server; same maths, checked twice) ─

interface UnitsProbe {
  p: number
  q: number
  sum: number
  unit: number
  carry: 0 | 1
  leftover: number[]
  leftoverSum: number
  halved: number | null
  /** the answer's tens, when this pair survives */
  tens: number | null
  addendTens: number[]
  result: number | null
}

/**
 * Units column first: two cards meet, and the digit they write must be a free
 * card. The cards then left over ARE the tens boxes, and since the addend tens
 * plus the carry make the answer's tens, their total is 2 × (answer tens) − carry.
 * Halving is therefore the whole tens test, in both addition frames alike.
 */
function unitsProbes(cards: number[]): UnitsProbe[] {
  const out: UnitsProbe[] = []
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const p = cards[i]
      const q = cards[j]
      const sum = p + q
      const unit = sum % 10
      const carry: 0 | 1 = sum >= 10 ? 1 : 0
      const rest = cards.filter((_, k) => k !== i && k !== j)
      const ui = rest.indexOf(unit)
      if (ui < 0) continue // never reaches the tens column at all
      const leftover = rest.filter((_, k) => k !== ui)
      const leftoverSum = leftover.reduce((s, c) => s + c, 0)
      const doubled = leftoverSum + carry
      const halved = doubled % 2 === 0 ? doubled / 2 : null
      const wins = halved !== null && leftover.includes(halved)
      out.push({
        p,
        q,
        sum,
        unit,
        carry,
        leftover,
        leftoverSum,
        halved,
        tens: wins ? (halved as number) : null,
        addendTens: wins ? leftover.filter((c) => c !== halved) : [],
        result: wins ? 10 * (halved as number) + unit : null,
      })
    }
  }
  return out
}

interface QuotientProbe {
  divisor: number
  others: number[]
  dividend: number | null
  quotient: number | null
  digits: number[]
}

const THREE_DIGIT_ORDERS: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
]

function quotientProbes(cards: number[]): QuotientProbe[] {
  const out: QuotientProbe[] = []
  for (let i = 0; i < cards.length; i++) {
    const divisor = cards[i]
    if (divisor <= 0) continue
    const others = cards.filter((_, k) => k !== i)
    let bestDividend: number | null = null
    let bestDigits: number[] = []
    for (const [x, y, z] of THREE_DIGIT_ORDERS) {
      const digits = [others[x], others[y], others[z]]
      if (digits[0] === 0) continue
      const dividend = 100 * digits[0] + 10 * digits[1] + digits[2]
      if (dividend % divisor !== 0) continue
      if (bestDividend === null || dividend > bestDividend) {
        bestDividend = dividend
        bestDigits = digits
      }
    }
    out.push({
      divisor,
      others,
      dividend: bestDividend,
      quotient: bestDividend === null ? null : bestDividend / divisor,
      digits: bestDigits,
    })
  }
  return out.sort((m, n) => m.divisor - n.divisor)
}

interface TensProbe {
  tens: number[]
  units: number[]
  numbers: number[]
  largest: number
}

function tensProbes(cards: number[], total: number): TensProbe[] {
  const sigma = cards.reduce((s, c) => s + c, 0)
  if ((total - sigma) % 9 !== 0) return []
  const tensSum = (total - sigma) / 9
  const out: TensProbe[] = []
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      for (let k = j + 1; k < cards.length; k++) {
        const trio = [cards[i], cards[j], cards[k]]
        if (trio[0] + trio[1] + trio[2] !== tensSum) continue
        if (trio.some((t) => t <= 0)) continue
        const units = cards.filter((_, m) => m !== i && m !== j && m !== k)
        const tens = [...trio].sort((x, y) => y - x)
        const unitsAsc = [...units].sort((x, y) => x - y)
        const numbers = tens.map((t, m) => 10 * t + unitsAsc[m])
        out.push({ tens, units: unitsAsc, numbers, largest: numbers[0] })
      }
    }
  }
  return out.sort((m, n) => m.largest - n.largest)
}

interface ProductProbe {
  x: number
  y: number
  product: number
  hits: boolean
}

function productProbes(cards: number[]): ProductProbe[] {
  const asc = [...cards].sort((m, n) => m - n)
  const max = asc[asc.length - 1]
  const out: ProductProbe[] = []
  for (let i = 0; i < asc.length; i++) {
    for (let j = i + 1; j < asc.length; j++) {
      const product = asc[i] * asc[j]
      if (product > max) continue
      out.push({ x: asc[i], y: asc[j], product, hits: asc.includes(product) })
    }
  }
  return out
}

// ── Params hardening ─────────────────────────────────────────────────────────

const isAsk = (v: unknown): v is FillAsk =>
  v === 'which-card-used' || v === 'the-result' || v === 'largest-quotient' || v === 'minimise-largest-term'

function cleanCards(v: unknown): number[] | null {
  if (!Array.isArray(v)) return null
  const out: number[] = []
  for (const raw of v) {
    if (typeof raw !== 'number' || !Number.isFinite(raw)) return null
    const n = Math.round(raw)
    if (n < 1 || n > 99 || out.includes(n)) return null
    out.push(n)
  }
  return out
}

/** Accept the stored params only if they really describe a solvable puzzle. */
function harden(raw: unknown): DigitsIntoEquationFillParams {
  const p = (raw ?? {}) as Partial<DigitsIntoEquationFillParams>
  if (!isAsk(p.ask)) return FALLBACK
  const ask = p.ask
  const skeleton: FillSkeleton =
    ask === 'the-result' && p.skeleton === 'two-plus-two' ? 'two-plus-two' : SKELETON_FOR[ask]
  const cards = cleanCards(p.cards)
  if (!cards || cards.length !== CARD_COUNT[skeleton]) return FALLBACK

  if (ask === 'the-result') {
    if (unitsProbes(cards).some((x) => x.result !== null)) {
      return { ask, skeleton, cards, total: null, choices: null, answerCard: null }
    }
    return FALLBACK
  }
  if (ask === 'largest-quotient') {
    if (quotientProbes(cards).some((x) => x.quotient !== null)) {
      return { ask, skeleton, cards, total: null, choices: null, answerCard: null }
    }
    return FALLBACK
  }
  if (ask === 'minimise-largest-term') {
    const total = typeof p.total === 'number' && Number.isFinite(p.total) ? Math.round(p.total) : -1
    if (total > 0 && tensProbes(cards, total).length > 0) {
      return { ask, skeleton, cards, total, choices: null, answerCard: null }
    }
    return FALLBACK
  }
  const choices = cleanCards(p.choices)
  const answerCard =
    typeof p.answerCard === 'number' && Number.isFinite(p.answerCard) ? Math.round(p.answerCard) : -1
  const hit = productProbes(cards).find((x) => x.hits)
  if (!choices || choices.length !== 4 || !choices.includes(answerCard) || !hit) return FALLBACK
  return { ask, skeleton, cards, total: null, choices, answerCard }
}

// ── Beat assembly ────────────────────────────────────────────────────────────

/**
 * Split a sweep into beats. The winning row always gets a beat to itself; the
 * losers either side are spread across the remaining budget, so a short sweep
 * gets one beat per line and a long one groups a few lines at a time. Order is
 * preserved exactly, so group `n` of the output always lines up with the same
 * slice of the probe list.
 */
function groupSizes(rows: LedgerRow[], maxGroups: number): number[] {
  const winAt = rows.findIndex((r) => r.ok)
  if (winAt < 0) return chunk(rows.length, maxGroups)
  const before = winAt
  const after = rows.length - winAt - 1
  const budget = Math.max(1, maxGroups - 1)
  const losers = before + after
  const share = (n: number) => (n === 0 ? 0 : Math.max(1, Math.round((n / losers) * budget)))
  return [...chunk(before, share(before)), 1, ...chunk(after, share(after))]
}

/** Sizes of `count` items split into at most `maxGroups` runs. */
function chunk(count: number, maxGroups: number): number[] {
  if (count <= 0) return []
  const size = Math.ceil(count / Math.max(1, maxGroups))
  const out: number[] = []
  for (let i = 0; i < count; i += size) out.push(Math.min(size, count - i))
  return out
}

export function buildDigitsIntoEquationFillSteps(raw: unknown, lang: Lang): FillStoryboard {
  const p = harden(raw)
  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const { ask, skeleton, cards } = p
  const tokens = FRAME_TOKENS[skeleton]
  const boxCount = BOX_COUNT[skeleton]

  const steps: FillBeat[] = []
  const rows: LedgerRow[] = []
  const empty = (): FillSlot[] => Array.from({ length: boxCount }, () => ({ text: '', tone: 'empty' as SlotTone }))
  const railIdle = (): CardState[] => cards.map(() => 'idle' as CardState)
  const railFor = (trial: number[], used: number[] = []): CardState[] =>
    cards.map((c) => (used.includes(c) ? 'used' : trial.includes(c) ? 'trial' : 'idle'))

  type Draft = Partial<FillBeat> & { phase: FillBeat['phase']; caption: string }
  const push = (draft: Draft) => {
    steps.push({
      cards: railIdle(),
      slots: empty(),
      rows: [...rows],
      litRows: [],
      trap: false,
      result: false,
      reveal: null,
      hold: 2600,
      ...draft,
    })
  }
  /** Reveal a group of ledger rows on this beat. */
  const addRows = (group: LedgerRow[]): number[] => {
    const at = group.map((_, i) => rows.length + i)
    rows.push(...group)
    return at
  }

  const list = cards.join(', ')

  // ── the-result: □□ + □ = □□ and □□ + □□ = □□ ───────────────────────────────
  if (ask === 'the-result') {
    const probes = unitsProbes(cards)
    const winner = probes.find((x) => x.result !== null) as UnitsProbe
    const answer = String(winner.result)
    const unitBoxes = skeleton === 'two-plus-one' ? [1, 2, 4] : [1, 3, 5]
    const tensBoxes = skeleton === 'two-plus-one' ? [0, 3] : [0, 2, 4]

    push({
      phase: 'setup',
      caption: T(
        `${cards.length} cards, ${cards.length} boxes: ${list}. Every card goes in exactly once, and the sum has to come out true.`,
        `${cards.length} kartu, ${cards.length} kotak: ${list}. Setiap kartu masuk tepat satu kali, dan penjumlahannya harus benar.`,
      ),
    })

    push({
      phase: 'rule',
      slots: empty().map((s, i) => (unitBoxes.includes(i) ? { text: '', tone: 'trial' } : s)),
      caption: T(
        `Start at the units column, on the right. Two cards meet there, and the digit they write down has to be one of the cards still free.`,
        `Mulai dari kolom satuan, di sebelah kanan. Dua kartu bertemu di situ, dan angka satuan yang mereka tulis harus salah satu kartu yang masih bebas.`,
      ),
      hold: 3000,
    })

    push({
      phase: 'rule',
      slots: empty().map((s, i) => (tensBoxes.includes(i) ? { text: '', tone: 'trial' } : s)),
      caption: T(
        `The cards left over then fill the tens boxes, and the addend tens plus the carry make the answer's tens. So the leftover cards add up to twice the answer's tens, minus the carry — halve, and you know exactly which card the answer's tens must be.`,
        `Kartu yang tersisa lalu mengisi kotak puluhan, dan puluhan penjumlah ditambah simpanan jadi puluhan hasil. Berarti kartu sisa berjumlah dua kali puluhan hasil dikurangi simpanan — tinggal dibagi dua, dan ketahuan kartu mana yang harus jadi puluhan hasil.`,
      ),
      hold: 3600,
    })

    const ledger: LedgerRow[] = probes.map((x) => ({
      ok: x.result !== null,
      text:
        x.halved === null
          ? `${x.p}+${x.q}=${x.sum} → ${x.leftover.join('+')}=${x.leftoverSum}, (${x.leftoverSum}+${x.carry})÷2 ${T('is not whole', 'tidak bulat')} ${CROSS}`
          : `${x.p}+${x.q}=${x.sum} → ${x.leftover.join('+')}=${x.leftoverSum}, (${x.leftoverSum}+${x.carry})÷2=${x.halved} ${
              x.result !== null ? CHECK : CROSS
            }`,
    }))
    let cursor = 0
    for (const size of groupSizes(ledger, MAX_PROBE_BEATS)) {
      const slice = probes.slice(cursor, cursor + size)
      const probe = slice[slice.length - 1]
      cursor += size
      const slots = empty()
      const trialBoxes = skeleton === 'two-plus-one' ? [1, 2] : [1, 3]
      slots[trialBoxes[0]] = { text: String(probe.p), tone: probe.result !== null ? 'good' : 'bad' }
      slots[trialBoxes[1]] = { text: String(probe.q), tone: probe.result !== null ? 'good' : 'bad' }
      slots[boxCount - 1] = { text: String(probe.unit), tone: probe.result !== null ? 'good' : 'bad' }
      const litRows = addRows(ledger.slice(cursor - size, cursor))
      const pairs = slice.map((x) => `${x.p}+${x.q}`).join(', ')
      push({
        phase: 'probe',
        cards: railFor([probe.p, probe.q, probe.unit]),
        slots,
        rows: [...rows],
        litRows,
        caption:
          probe.result !== null
            ? T(
                `${probe.p} + ${probe.q} = ${probe.sum} carries, and the leftover cards ${probe.leftover.join(', ')} add to ${probe.leftoverSum}. Half of ${probe.leftoverSum} + ${probe.carry} is ${probe.halved}, which IS one of them ${CHECK}`,
                `${probe.p} + ${probe.q} = ${probe.sum} menyimpan 1, dan kartu sisa ${probe.leftover.join(', ')} berjumlah ${probe.leftoverSum}. Setengah dari ${probe.leftoverSum} + ${probe.carry} adalah ${probe.halved}, dan itu ADA di kartu sisa ${CHECK}`,
              )
            : size === 1
              ? T(
                  `${probe.p} + ${probe.q} = ${probe.sum}, leaving ${probe.leftover.join(' + ')} = ${probe.leftoverSum}. Half of ${probe.leftoverSum} + ${probe.carry} ${probe.halved === null ? 'is not even a whole number' : `is ${probe.halved}, and no leftover card says ${probe.halved}`} ${CROSS}`,
                  `${probe.p} + ${probe.q} = ${probe.sum}, sisanya ${probe.leftover.join(' + ')} = ${probe.leftoverSum}. Setengah dari ${probe.leftoverSum} + ${probe.carry} ${probe.halved === null ? 'bahkan tidak bulat' : `adalah ${probe.halved}, dan tidak ada kartu sisa ${probe.halved}`} ${CROSS}`,
                )
              : T(
                  `Halve the leftover total plus the carry for ${pairs}: not one of them lands on a leftover card, so every one of those pairs is dead ${CROSS}`,
                  `Bagi dua total kartu sisa ditambah simpanan untuk ${pairs}: tidak ada satu pun yang jatuh di kartu sisa, jadi semua pasangan itu gugur ${CROSS}`,
                ),
        hold: 3000,
      })
    }

    const winSlots = empty()
    if (skeleton === 'two-plus-one') {
      winSlots[0] = { text: String(winner.addendTens[0]), tone: 'good' }
      winSlots[1] = { text: String(winner.p), tone: 'good' }
      winSlots[2] = { text: String(winner.q), tone: 'good' }
      winSlots[3] = { text: String(winner.tens), tone: 'good' }
      winSlots[4] = { text: String(winner.unit), tone: 'good' }
    } else {
      winSlots[0] = { text: String(winner.addendTens[0]), tone: 'good' }
      winSlots[1] = { text: String(winner.p), tone: 'good' }
      winSlots[2] = { text: String(winner.addendTens[1]), tone: 'good' }
      winSlots[3] = { text: String(winner.q), tone: 'good' }
      winSlots[4] = { text: String(winner.tens), tone: 'good' }
      winSlots[5] = { text: String(winner.unit), tone: 'good' }
    }
    push({
      phase: 'result',
      cards: cards.map(() => 'used' as CardState),
      slots: winSlots,
      rows: [...rows],
      caption: T(
        `Only one pair survived, so every box is now forced: the answer's tens is ${winner.tens} and its units is ${winner.unit}. The answer boxes hold ${answer}.`,
        `Cuma satu pasangan yang lolos, jadi semua kotak sudah pasti: puluhan hasilnya ${winner.tens} dan satuannya ${winner.unit}. Kotak hasil berisi ${answer}.`,
      ),
      result: true,
      reveal: answer,
      hold: 0,
    })

    return { ask, skeleton, cards, tokens, boxCount, answer, steps, finalIndex: steps.length - 1 }
  }

  // ── largest-quotient: □□□ ÷ □ ──────────────────────────────────────────────
  if (ask === 'largest-quotient') {
    const probes = quotientProbes(cards)
    const scored = probes.filter((x) => x.quotient !== null)
    const winner = scored.reduce((m, x) => ((x.quotient as number) > (m.quotient as number) ? x : m))
    const answer = String(winner.quotient)
    const desc = [...cards].sort((m, n) => n - m)
    const greedy = 100 * desc[0] + 10 * desc[1] + desc[2]
    const smallest = desc[3]
    const remainder = greedy % smallest

    push({
      phase: 'setup',
      caption: T(
        `Four cards, four boxes: ${list}. Three build the number on top, and the one left over is the divisor.`,
        `Empat kartu, empat kotak: ${list}. Tiga jadi bilangan di atas, satu sisanya jadi pembagi.`,
      ),
    })

    push({
      phase: 'trap',
      cards: railFor(cards),
      slots: [
        { text: String(desc[0]), tone: 'bad' },
        { text: String(desc[1]), tone: 'bad' },
        { text: String(desc[2]), tone: 'bad' },
        { text: String(smallest), tone: 'bad' },
      ],
      trap: true,
      caption: T(
        `Tempting: biggest top number ${greedy} over the smallest card ${smallest}. But ${greedy} ÷ ${smallest} leaves ${remainder} over, and the division has to be exact — so this arrangement is not even allowed.`,
        `Godaan: bilangan atas terbesar ${greedy} dibagi kartu terkecil ${smallest}. Tapi ${greedy} ÷ ${smallest} bersisa ${remainder}, padahal pembagiannya harus habis — jadi susunan ini tidak sah.`,
      ),
      hold: 3600,
    })

    const ledger: LedgerRow[] = probes.map((x) => ({
      ok: x.divisor === winner.divisor,
      text:
        x.dividend === null
          ? `÷${x.divisor}: ${T('no exact', 'tidak ada yang habis')} (${x.others.join('/')}) ${CROSS}`
          : `${x.dividend}÷${x.divisor}=${x.quotient} ${x.divisor === winner.divisor ? CHECK : CROSS}`,
    }))
    let cursor = 0
    for (const size of groupSizes(ledger, MAX_PROBE_BEATS)) {
      const probe = probes[cursor + size - 1]
      cursor += size
      const won = probe.divisor === winner.divisor
      const slots: FillSlot[] =
        probe.dividend === null
          ? [
              { text: '', tone: 'empty' },
              { text: '', tone: 'empty' },
              { text: '', tone: 'empty' },
              { text: String(probe.divisor), tone: 'bad' },
            ]
          : [
              { text: String(probe.digits[0]), tone: won ? 'good' : 'trial' },
              { text: String(probe.digits[1]), tone: won ? 'good' : 'trial' },
              { text: String(probe.digits[2]), tone: won ? 'good' : 'trial' },
              { text: String(probe.divisor), tone: won ? 'good' : 'trial' },
            ]
      const litRows = addRows(ledger.slice(cursor - size, cursor))
      push({
        phase: 'probe',
        cards: railFor([probe.divisor]),
        slots,
        rows: [...rows],
        litRows,
        caption:
          probe.dividend === null
            ? T(
                `Try ${probe.divisor} as the divisor: no way of ordering ${probe.others.join(', ')} divides by ${probe.divisor} exactly, so ${probe.divisor} can never be the divisor ${CROSS}`,
                `Coba ${probe.divisor} jadi pembagi: susunan ${probe.others.join(', ')} tidak ada yang habis dibagi ${probe.divisor}, jadi ${probe.divisor} tidak mungkin jadi pembagi ${CROSS}`,
              )
            : T(
                `Try ${probe.divisor} as the divisor. A bigger top number always gives a bigger answer, so take the biggest one that divides exactly: ${probe.dividend} ÷ ${probe.divisor} = ${probe.quotient}.`,
                `Coba ${probe.divisor} jadi pembagi. Bilangan atas yang lebih besar selalu memberi hasil lebih besar, jadi ambil yang terbesar dan habis dibagi: ${probe.dividend} ÷ ${probe.divisor} = ${probe.quotient}.`,
              ),
        hold: 3000,
      })
    }

    push({
      phase: 'result',
      cards: cards.map(() => 'used' as CardState),
      slots: [
        { text: String(winner.digits[0]), tone: 'good' },
        { text: String(winner.digits[1]), tone: 'good' },
        { text: String(winner.digits[2]), tone: 'good' },
        { text: String(winner.divisor), tone: 'good' },
      ],
      rows: [...rows],
      caption: T(
        `All four cards have been tried as the divisor, so the list is complete. The biggest answer on it is ${winner.dividend} ÷ ${winner.divisor} = ${answer}.`,
        `Keempat kartu sudah dicoba jadi pembagi, jadi daftarnya lengkap. Hasil bagi terbesar di daftar itu ${winner.dividend} ÷ ${winner.divisor} = ${answer}.`,
      ),
      result: true,
      reveal: answer,
      hold: 0,
    })

    return { ask, skeleton, cards, tokens, boxCount, answer, steps, finalIndex: steps.length - 1 }
  }

  // ── minimise-largest-term: □□ + □□ + □□ = total ────────────────────────────
  if (ask === 'minimise-largest-term') {
    const total = p.total as number
    const probes = tensProbes(cards, total)
    const winner = probes[0]
    const answer = String(winner.largest)
    const sigma = cards.reduce((s, c) => s + c, 0)
    const tensSum = (total - sigma) / 9

    push({
      phase: 'setup',
      caption: T(
        `Six cards, six boxes: ${list}. Three of them will stand in tens boxes and three in units boxes, and the three numbers must add to ${total}.`,
        `Enam kartu, enam kotak: ${list}. Tiga berdiri di kotak puluhan dan tiga di kotak satuan, dan ketiga bilangannya harus berjumlah ${total}.`,
      ),
    })

    push({
      phase: 'rule',
      slots: empty().map((s, i) => (i % 2 === 0 ? { text: '', tone: 'trial' as SlotTone } : s)),
      caption: T(
        `A card in a tens box counts ten times, in a units box once. All six cards add to ${sigma}, so ${total} = 9 × (the tens cards) + ${sigma}. That pins the tens cards: they must add to (${total} − ${sigma}) ÷ 9 = ${tensSum}.`,
        `Kartu di kotak puluhan bernilai sepuluh kali, di kotak satuan satu kali. Keenam kartu berjumlah ${sigma}, jadi ${total} = 9 × (kartu puluhan) + ${sigma}. Itu memaku kartu puluhan: jumlahnya harus (${total} − ${sigma}) ÷ 9 = ${tensSum}.`,
      ),
      hold: 3800,
    })

    const ledger: LedgerRow[] = probes.map((x) => ({
      ok: x.largest === winner.largest,
      text: `${x.tens.join('+')} → ${x.numbers.join(', ')} → ${x.largest} ${x.largest === winner.largest ? CHECK : CROSS}`,
    }))
    let cursor = 0
    for (const size of groupSizes(ledger, MAX_PROBE_BEATS)) {
      const probe = probes[cursor + size - 1]
      cursor += size
      const won = probe.largest === winner.largest
      const slots: FillSlot[] = []
      for (let i = 0; i < 3; i++) {
        slots.push({ text: String(probe.tens[i]), tone: won ? 'good' : 'trial' })
        slots.push({ text: String(probe.units[i]), tone: won ? 'good' : 'trial' })
      }
      const litRows = addRows(ledger.slice(cursor - size, cursor))
      push({
        phase: 'probe',
        cards: railFor(probe.tens),
        slots,
        rows: [...rows],
        litRows,
        caption: T(
          `Tens cards ${probe.tens.join(', ')}. Whichever number holds ${probe.tens[0]} is the biggest one, so give it the smallest units card ${probe.units[0]}: ${probe.numbers.join(' + ')} = ${total}. Biggest term ${probe.largest} ${won ? CHECK : CROSS}`,
          `Kartu puluhan ${probe.tens.join(', ')}. Bilangan yang memegang ${probe.tens[0]} pasti yang terbesar, jadi beri dia kartu satuan terkecil ${probe.units[0]}: ${probe.numbers.join(' + ')} = ${total}. Bilangan terbesarnya ${probe.largest} ${won ? CHECK : CROSS}`,
        ),
        hold: 3400,
      })
    }

    const winSlots: FillSlot[] = []
    for (let i = 0; i < 3; i++) {
      winSlots.push({ text: String(winner.tens[i]), tone: 'good' })
      winSlots.push({ text: String(winner.units[i]), tone: 'good' })
    }
    push({
      phase: 'result',
      cards: cards.map(() => 'used' as CardState),
      slots: winSlots,
      rows: [...rows],
      caption: T(
        `Those were the only sets of tens cards adding to ${tensSum}, so nothing else can be tried. The smallest the biggest number can be squeezed to is ${answer}.`,
        `Cuma itu kelompok kartu puluhan yang berjumlah ${tensSum}, jadi tidak ada lagi yang bisa dicoba. Bilangan terbesar paling kecil bisa ditekan sampai ${answer}.`,
      ),
      result: true,
      reveal: answer,
      hold: 0,
    })

    return { ask, skeleton, cards, tokens, boxCount, answer, steps, finalIndex: steps.length - 1 }
  }

  // ── which-card-used: □ ÷ □ = □ picked out of a long pile ───────────────────
  const choices = p.choices as number[]
  const answerCard = p.answerCard as number
  const probes = productProbes(cards)
  const winner = probes.find((x) => x.hits) as ProductProbe
  const used = [winner.product, winner.x, winner.y].sort((m, n) => m - n)
  const label = String.fromCharCode(65 + choices.indexOf(answerCard))
  const answer = label
  const max = Math.max(...cards)

  push({
    phase: 'setup',
    caption: T(
      `${cards.length} cards on the table: ${list}. Only 3 of them go into the 3 boxes — the rest are here to be ruled out.`,
      `Ada ${cards.length} kartu di meja: ${list}. Cuma 3 yang masuk ke 3 kotak — sisanya memang untuk dicoret.`,
    ),
  })

  push({
    phase: 'rule',
    slots: [
      { text: '', tone: 'trial' },
      { text: '', tone: 'trial' },
      { text: '', tone: 'trial' },
    ],
    caption: T(
      `Turn the division upside down: big ÷ small = another card means small × another = big. So two cards multiplied have to land exactly on a third card — and their product cannot be bigger than the biggest card, ${max}.`,
      `Balik pembagiannya: besar ÷ kecil = kartu lain sama saja dengan kecil × kartu lain = besar. Jadi dua kartu dikalikan harus jatuh tepat di kartu ketiga — dan hasil kalinya tidak boleh lebih dari kartu terbesar, ${max}.`,
    ),
    hold: 3600,
  })

  const ledger: LedgerRow[] = probes.map((x) => ({
    ok: x.hits,
    text: `${x.x}×${x.y}=${x.product} ${x.hits ? CHECK : CROSS}`,
  }))
  let cursor = 0
  for (const size of groupSizes(ledger, MAX_PROBE_BEATS)) {
    const slice = probes.slice(cursor, cursor + size)
    const probe = slice[slice.length - 1]
    cursor += size
    const litRows = addRows(ledger.slice(cursor - size, cursor))
    const tried = slice.map((x) => `${x.x}×${x.y}=${x.product}`).join(', ')
    push({
      phase: 'probe',
      cards: railFor([probe.x, probe.y]),
      slots: [
        { text: String(probe.product), tone: probe.hits ? 'good' : 'bad' },
        { text: String(probe.x), tone: probe.hits ? 'good' : 'trial' },
        { text: String(probe.y), tone: probe.hits ? 'good' : 'trial' },
      ],
      rows: [...rows],
      litRows,
      caption: probe.hits
        ? T(
            `${probe.x} × ${probe.y} = ${probe.product}, and ${probe.product} IS on the table ${CHECK} So ${probe.product} ÷ ${probe.x} = ${probe.y} really can be built.`,
            `${probe.x} × ${probe.y} = ${probe.product}, dan ${probe.product} ADA di meja ${CHECK} Jadi ${probe.product} ÷ ${probe.x} = ${probe.y} memang bisa dibuat.`,
          )
        : T(
            `Multiply pairs of cards and hunt for the product on the table: ${tried}. Not one of those products is a card, so the last box would have nothing to hold ${CROSS}`,
            `Kalikan pasangan kartu, lalu cari hasil kalinya di meja: ${tried}. Tidak ada satu pun hasil kali itu yang jadi kartu, jadi kotak terakhir tidak ada isinya ${CROSS}`,
          ),
      hold: 3000,
    })
  }

  push({
    phase: 'result',
    cards: cards.map((c) => (used.includes(c) ? 'used' : 'out')),
    slots: [
      { text: String(winner.product), tone: 'good' },
      { text: String(winner.x), tone: 'good' },
      { text: String(winner.y), tone: 'good' },
    ],
    rows: [...rows],
    caption: T(
      `Every pair that could possibly work has been multiplied, and only one landed on a card. The cards used are ${used.join(', ')} — so of ${choices.join(', ')}, the answer is ${answerCard}.`,
      `Semua pasangan yang mungkin sudah dikalikan, dan cuma satu yang jatuh di kartu. Kartu yang terpakai ${used.join(', ')} — jadi dari ${choices.join(', ')}, jawabannya ${answerCard}.`,
    ),
    result: true,
    reveal: `${label} · ${answerCard}`,
    hold: 0,
  })

  return { ask, skeleton, cards, tokens, boxCount, answer, steps, finalIndex: steps.length - 1 }
}
