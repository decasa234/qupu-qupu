import type { Lang } from './makeTenSteps'

// P8 `sequence-repair`: a number sequence has been damaged — a term taken out
// (`interior-blank`), an extra term wedged in (`intruder`), or a stretch hidden
// behind `…` (`hidden-run`). The storyboard never asserts the repair: it reads
// the jumping rule off the part that is still intact, then lets the answer fall
// out of that rule on the very last beat.
//
// Mirrors api/services/wmi/concepts/sequence-repair/index.ts — same `params`,
// same term arithmetic, same three hint steps. Kept dependency-free (no zod) so
// the client never pulls the server concept module into its bundle.

// ── Params (mirror of the concept's zod schema) ───────────────────────────────

export interface ArithmeticRule {
  kind: 'arithmetic'
  start: number
  step: number
  direction: 'up' | 'down'
}

export interface InterleavedRule {
  kind: 'interleaved'
  startA: number
  stepA: number
  startB: number
  stepB: number
}

export type SequenceRule = ArithmeticRule | InterleavedRule

export type SequenceDefect =
  | { kind: 'interior-blank'; at: number }
  | { kind: 'intruder'; at: number; value: number }
  | { kind: 'hidden-run'; from: number; count: number }

export interface SequenceRepairParams {
  rule: SequenceRule
  length: number
  defect: SequenceDefect
}

export const BLANK = '__'
export const DOTS = '…'

// ── Storyboard model ──────────────────────────────────────────────────────────

/** What a chip stands for. Orthogonal to its tone. */
export type ChipKind = 'number' | 'blank' | 'dots'
/** How a chip is dressed this beat. */
export type ChipTone = 'idle' | 'focus' | 'good' | 'bad' | 'gone' | 'reveal'
/** Which band of the board the chip sits in (`zigzag` uses top/bottom). */
export type ChipRow = 'top' | 'mid' | 'bottom'

export interface SeqChip {
  /** Stable across beats so the renderer can magic-move it. */
  id: string
  label: string
  kind: ChipKind
  tone: ChipTone
  row: ChipRow
  /** 0 = the small family, 1 = the big family, null = no family tint. */
  family: 0 | 1 | null
}

export type LinkTone = 'muted' | 'focus' | 'good' | 'bad'
/** Bracket above the chips, or below them. */
export type LinkRow = 'above' | 'below'

export interface SeqLink {
  id: string
  /** Chip index the bracket starts at. */
  from: number
  /** Chip index it ends at (`from + 1` = a neighbour gap, `from + 2` = a family arc). */
  to: number
  label: string
  tone: LinkTone
  row: LinkRow
}

export interface SeqBeat {
  caption: string
  chips: SeqChip[]
  links: SeqLink[]
  /** True on the answer beat only. */
  result: boolean
  /** ms to hold this beat before auto-advancing (0 on the last beat). */
  hold: number
}

export interface SequenceRepairStoryboard {
  defect: SequenceDefect['kind']
  ruleKind: SequenceRule['kind']
  /** 'line' = one row of chips; 'zigzag' = the two interleaved families split apart. */
  layout: 'line' | 'zigzag'
  /** The numbers the child actually sees, before any repair. */
  shown: string[]
  answer: string
  beats: SeqBeat[]
  finalIndex: number
}

// ── Term arithmetic (mirror of the concept's builders) ────────────────────────

function clamp(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo
  return Math.min(hi, Math.max(lo, Math.round(v)))
}

/** The intact sequence the rule describes, before anything is broken. */
export function sequenceTerms(params: SequenceRepairParams): number[] {
  const { rule } = params
  const length = clamp(params.length, 1, 12)
  if (rule.kind === 'arithmetic') {
    const sign = rule.direction === 'up' ? 1 : -1
    return Array.from({ length }, (_, i) => rule.start + sign * i * rule.step)
  }
  return Array.from({ length }, (_, i) =>
    i % 2 === 0 ? rule.startA + (i >> 1) * rule.stepA : rule.startB + (i >> 1) * rule.stepB,
  )
}

/** Every number on screen — the intruder wedged in, nothing taken away. */
export function shownNumbers(params: SequenceRepairParams): number[] {
  const clean = sequenceTerms(params)
  if (params.defect.kind !== 'intruder') return clean
  const at = clamp(params.defect.at, 1, clean.length)
  const out = clean.slice()
  out.splice(at, 0, params.defect.value)
  return out
}

export function repairAnswer(params: SequenceRepairParams): string {
  const d = params.defect
  const clean = sequenceTerms(params)
  if (d.kind === 'interior-blank') return String(clean[clamp(d.at, 0, clean.length - 1)])
  if (d.kind === 'intruder') return String(d.value)
  return String(clamp(d.count, 1, clean.length))
}

/** Every edge index `i` of `xs` whose pair `(i, i+1)` steps clear of `skip`. */
function intactEdges(xs: number[], skip: number): number[] {
  const out: number[] = []
  for (let i = 0; i + 1 < xs.length; i++) {
    if (i !== skip && i + 1 !== skip) out.push(i)
  }
  return out
}

function signed(v: number): string {
  return v < 0 ? `−${Math.abs(v)}` : `+${v}`
}

// ── Chip / link helpers ───────────────────────────────────────────────────────

function numberChips(values: number[]): SeqChip[] {
  return values.map((v, i) => ({
    id: `c${i}`,
    label: String(v),
    kind: 'number' as const,
    tone: 'idle' as const,
    row: 'mid' as const,
    family: null,
  }))
}

function withTone(chips: SeqChip[], index: number, tone: ChipTone): SeqChip[] {
  return chips.map((c, i) => (i === index ? { ...c, tone } : c))
}

function withTones(chips: SeqChip[], indices: number[], tone: ChipTone): SeqChip[] {
  const set = new Set(indices)
  return chips.map((c, i) => (set.has(i) ? { ...c, tone } : c))
}

function gapLink(
  from: number,
  label: string,
  tone: LinkTone,
  row: LinkRow = 'above',
): SeqLink {
  return { id: `g${from}-${row}`, from, to: from + 1, label, tone, row }
}

function arcLink(
  from: number,
  to: number,
  label: string,
  tone: LinkTone,
  row: LinkRow,
): SeqLink {
  return { id: `a${from}-${to}-${row}`, from, to, label, tone, row }
}

// ── The storyboard ────────────────────────────────────────────────────────────

export function buildSequenceRepairSteps(
  params: SequenceRepairParams,
  lang: Lang,
): SequenceRepairStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const d = params.defect

  if (d.kind === 'interior-blank') return blankStory(params, d, t)
  if (d.kind === 'intruder') return intruderStory(params, d, t)
  return hiddenRunStory(params, d, t)
}

type T = (en: string, id: string) => string

// ── interior-blank ────────────────────────────────────────────────────────────

function blankStory(
  params: SequenceRepairParams,
  d: { kind: 'interior-blank'; at: number },
  t: T,
): SequenceRepairStoryboard {
  const clean = sequenceTerms(params)
  const n = clean.length
  const at = clamp(d.at, 1, Math.max(1, n - 2))
  const ans = clean[at]

  const base = numberChips(clean).map((c, i) =>
    i === at ? { ...c, label: BLANK, kind: 'blank' as const } : c,
  )
  const shown = base.map((c) => c.label)

  const beats: SeqBeat[] =
    params.rule.kind === 'arithmetic'
      ? blankArithmeticBeats(params.rule, clean, at, ans, base, t)
      : blankInterleavedBeats(params.rule, clean, at, ans, base, t)

  return {
    defect: 'interior-blank',
    ruleKind: params.rule.kind,
    layout: params.rule.kind === 'arithmetic' ? 'line' : 'zigzag',
    shown,
    answer: String(ans),
    beats,
    finalIndex: beats.length - 1,
  }
}

function blankArithmeticBeats(
  rule: ArithmeticRule,
  clean: number[],
  at: number,
  ans: number,
  base: SeqChip[],
  t: T,
): SeqBeat[] {
  const up = rule.direction === 'up'
  const sign = up ? '+' : '−'
  const stepLabel = `${sign}${rule.step}`
  const opId = up ? `tambah ${rule.step}` : `kurang ${rule.step}`
  const opEn = up ? `up by ${rule.step}` : `down by ${rule.step}`
  const prev = clean[at - 1]

  const edges = intactEdges(clean, at)
  const first = edges.length > 0 ? edges[0] : null
  const last = edges.length > 1 ? edges[edges.length - 1] : null

  const beats: SeqBeat[] = [
    {
      caption: t(
        'One box is empty. First find the jumping rule.',
        'Satu kotak kosong. Cari dulu aturan lompatannya.',
      ),
      chips: base,
      links: [],
      result: false,
      hold: 2200,
    },
  ]

  if (first !== null) {
    beats.push({
      caption: t(
        `${clean[first]} then ${clean[first + 1]}: the gap is ${rule.step}.`,
        `${clean[first]} lalu ${clean[first + 1]}: bedanya ${rule.step}.`,
      ),
      chips: withTones(base, [first, first + 1], 'focus'),
      links: [gapLink(first, stepLabel, 'focus')],
      result: false,
      hold: 2300,
    })
  }

  if (last !== null) {
    beats.push({
      caption: t(
        `Check again: ${clean[last]} then ${clean[last + 1]} — the gap is ${rule.step} too.`,
        `Cek lagi: ${clean[last]} lalu ${clean[last + 1]}, bedanya ${rule.step} juga.`,
      ),
      chips: withTones(withTones(base, [first as number, (first as number) + 1], 'good'), [last, last + 1], 'focus'),
      links: [gapLink(first as number, stepLabel, 'good'), gapLink(last, stepLabel, 'focus')],
      result: false,
      hold: 2300,
    })
  }

  beats.push({
    caption: t(`Every jump is the same: ${opEn}.`, `Semua lompatan sama: ${opId}.`),
    chips: base.map((c, i) => (i === at ? c : { ...c, tone: 'good' as const })),
    links: edges.map((i) => gapLink(i, stepLabel, 'good')),
    result: false,
    hold: 2300,
  })

  beats.push({
    caption: t(
      `The empty box is right after ${prev}.`,
      `Kotak kosong tepat setelah ${prev}.`,
    ),
    chips: withTones(base, [at - 1, at], 'focus'),
    links: [...edges.map((i) => gapLink(i, stepLabel, 'muted')), gapLink(at - 1, '?', 'focus')],
    result: false,
    hold: 2500,
  })

  beats.push({
    caption: t(
      `${prev} ${sign} ${rule.step} = ${ans}. Fill in ${ans}.`,
      `${prev} ${sign} ${rule.step} = ${ans}. Isi ${ans}.`,
    ),
    chips: base.map((c, i) =>
      i === at
        ? { ...c, label: String(ans), kind: 'number' as const, tone: 'reveal' as const }
        : { ...c, tone: 'good' as const },
    ),
    links: [
      ...edges.map((i) => gapLink(i, stepLabel, 'good')),
      gapLink(at - 1, stepLabel, 'good'),
      ...(at + 1 < clean.length ? [gapLink(at, stepLabel, 'good')] : []),
    ],
    result: true,
    hold: 0,
  })

  return beats
}

/** Which family a clean-sequence index belongs to: 0 = small, 1 = big. */
function familyOf(index: number): 0 | 1 {
  return index % 2 === 0 ? 0 : 1
}

function familyRow(family: 0 | 1 | null): ChipRow {
  if (family === 1) return 'top'
  if (family === 0) return 'bottom'
  return 'mid'
}

function blankInterleavedBeats(
  rule: InterleavedRule,
  clean: number[],
  at: number,
  ans: number,
  base: SeqChip[],
  t: T,
): SeqBeat[] {
  const fam = familyOf(at)
  const famStep = fam === 0 ? rule.stepA : rule.stepB
  const famId = fam === 0 ? 'kecil' : 'besar'
  const famEn = fam === 0 ? 'small' : 'big'

  // Split the chips into the two family bands.
  const split = base.map((c, i) => {
    const f = familyOf(i)
    return { ...c, family: f, row: familyRow(f) }
  })

  const smallIdx = clean.map((_, i) => i).filter((i) => i % 2 === 0)
  const bigIdx = clean.map((_, i) => i).filter((i) => i % 2 === 1)
  // A "rung" joins two *neighbouring* members of one family. Only rungs that
  // step clear of the blank show a real step — a rung that touches it is the
  // unknown we are about to solve, so its size must never be claimed.
  const rungs = (idx: number[]) => idx.slice(0, -1).map((i, k) => [i, idx[k + 1]] as const)
  const smallRungs = rungs(smallIdx)
  const bigRungs = rungs(bigIdx)
  const clear = ([a, b]: readonly [number, number]) => a !== at && b !== at

  const smallGood = smallRungs
    .filter(clear)
    .map(([a, b]) => arcLink(a, b, `+${rule.stepA}`, 'good', 'below'))
  const bigGood = bigRungs
    .filter(clear)
    .map(([a, b]) => arcLink(a, b, `+${rule.stepB}`, 'good', 'above'))

  // The blank's own family: when only two of its members are on screen (the
  // blank sits between them) no single rung reads, so the step has to come out
  // of the span instead — the blank is exactly halfway.
  const famRungs = fam === 0 ? smallRungs : bigRungs
  const famRow: LinkRow = fam === 1 ? 'above' : 'below'
  const spanFrom = at - 2
  const spanTo = at + 2
  const straddled =
    spanFrom >= 0 &&
    spanTo < clean.length &&
    famRungs.length > 0 &&
    famRungs.every((r) => !clear(r))
  const spanA = clean[spanFrom]
  const spanB = clean[spanTo]
  const span = straddled ? Math.abs(spanB - spanA) : 0

  // Otherwise anchor on the family member next to the blank: the one before it
  // when there is one, else the one after (a blank at index 1 has none before).
  const usePrev = at - 2 >= 0
  const anchorIdx = usePrev ? at - 2 : at + 2
  const anchor = clean[anchorIdx]
  const anchorSign = usePrev ? '+' : '−'
  const unknownRung = usePrev
    ? arcLink(at - 2, at, '?', 'focus', famRow)
    : arcLink(at, at + 2, '?', 'focus', famRow)

  /** The caption that reads one family's step off the board. */
  const familyLine = (f: 0 | 1): string => {
    const rungsF = f === 0 ? smallRungs : bigRungs
    const stepF = f === 0 ? rule.stepA : rule.stepB
    const idF = f === 0 ? 'kecil' : 'besar'
    const enF = f === 0 ? 'small' : 'big'
    const cr = rungsF.find(clear)
    if (cr) {
      return t(
        `The ${enF} ones: ${clean[cr[0]]} then ${clean[cr[1]]} — add ${stepF}.`,
        `Yang ${idF}: ${clean[cr[0]]} lalu ${clean[cr[1]]} — tambah ${stepF}.`,
      )
    }
    return t(
      `Only ${spanA} and ${spanB} of the ${enF} ones are showing — ${span} apart.`,
      `Yang ${idF} cuma terlihat ${spanA} dan ${spanB} — bedanya ${span}.`,
    )
  }

  const smallLinks = straddled && fam === 0
    ? [arcLink(spanFrom, spanTo, String(span), 'focus', 'below')]
    : smallGood
  const bigLinks = straddled && fam === 1
    ? [arcLink(spanFrom, spanTo, String(span), 'focus', 'above')]
    : bigGood

  const beats: SeqBeat[] = [
    {
      caption: t(
        'One box is empty. The jumps are not all the same.',
        'Satu kotak kosong. Lompatannya tidak sama.',
      ),
      chips: base,
      links: intactEdges(clean, at).map((i) =>
        gapLink(i, signed(clean[i + 1] - clean[i]), 'muted'),
      ),
      result: false,
      hold: 2400,
    },
    {
      caption: t('Small and big numbers take turns.', 'Bilangan kecil dan besar bergantian.'),
      chips: split,
      links: [],
      result: false,
      hold: 2300,
    },
  ]

  beats.push({
    caption: familyLine(0),
    chips: withTones(split, smallIdx.filter((i) => i !== at), 'focus'),
    links: smallLinks,
    result: false,
    hold: 2300,
  })

  beats.push({
    caption: familyLine(1),
    chips: withTones(split, bigIdx.filter((i) => i !== at), 'focus'),
    links: [...smallLinks, ...bigLinks],
    result: false,
    hold: 2300,
  })

  beats.push({
    caption: straddled
      ? t(
          `The empty box is a ${famEn} one, and both of its jumps are equal. So it sits right in the middle.`,
          `Kotak kosong ikut yang ${famId}. Dua lompatannya sama besar, jadi tepat di tengah.`,
        )
      : usePrev
        ? t(
            `The empty box is a ${famEn} one. Before it comes ${anchor}.`,
            `Kotak kosong ikut yang ${famId}. Sebelumnya ${anchor}.`,
          )
        : t(
            `The empty box is a ${famEn} one. After it comes ${anchor}.`,
            `Kotak kosong ikut yang ${famId}. Sesudahnya ${anchor}.`,
          ),
    chips: withTones(split, straddled ? [spanFrom, at, spanTo] : [anchorIdx, at], 'focus'),
    // The span arc from the previous beat steps aside here so the two halves it
    // splits into have the band to themselves.
    links: straddled
      ? [
          ...(fam === 0 ? bigLinks : smallLinks),
          arcLink(spanFrom, at, '?', 'focus', famRow),
          arcLink(at, spanTo, '?', 'focus', famRow),
        ]
      : [...smallLinks, ...bigLinks, unknownRung],
    result: false,
    hold: 2500,
  })

  beats.push({
    caption: straddled
      ? t(
          `Halfway between ${spanA} and ${spanB} is ${ans}. Fill in ${ans}.`,
          `Tengah-tengah ${spanA} dan ${spanB} itu ${ans}. Isi ${ans}.`,
        )
      : t(
          `${anchor} ${anchorSign} ${famStep} = ${ans}. Fill in ${ans}.`,
          `${anchor} ${anchorSign} ${famStep} = ${ans}. Isi ${ans}.`,
        ),
    chips: split.map((c, i) =>
      i === at
        ? { ...c, label: String(ans), kind: 'number' as const, tone: 'reveal' as const }
        : c,
    ),
    links: [
      ...smallRungs.map(([a, b]) => arcLink(a, b, `+${rule.stepA}`, 'good', 'below')),
      ...bigRungs.map(([a, b]) => arcLink(a, b, `+${rule.stepB}`, 'good', 'above')),
    ],
    result: true,
    hold: 0,
  })

  return beats
}

// ── intruder ──────────────────────────────────────────────────────────────────

function intruderStory(
  params: SequenceRepairParams,
  d: { kind: 'intruder'; at: number; value: number },
  t: T,
): SequenceRepairStoryboard {
  const clean = sequenceTerms(params)
  const shownVals = shownNumbers(params)
  const at = clamp(d.at, 1, Math.max(1, shownVals.length - 2))
  const base = numberChips(shownVals)

  const beats =
    params.rule.kind === 'arithmetic'
      ? intruderArithmeticBeats(params.rule, shownVals, at, d.value, base, t)
      : intruderInterleavedBeats(params.rule, clean, shownVals, at, d.value, base, t)

  return {
    defect: 'intruder',
    ruleKind: params.rule.kind,
    layout: params.rule.kind === 'arithmetic' ? 'line' : 'zigzag',
    shown: shownVals.map(String),
    answer: String(d.value),
    beats,
    finalIndex: beats.length - 1,
  }
}

function intruderArithmeticBeats(
  rule: ArithmeticRule,
  shownVals: number[],
  at: number,
  value: number,
  base: SeqChip[],
  t: T,
): SeqBeat[] {
  const up = rule.direction === 'up'
  const sign = up ? '+' : '−'
  const stepLabel = `${sign}${rule.step}`
  const opId = up ? `tambah ${rule.step}` : `kurang ${rule.step}`
  const opEn = up ? `up by ${rule.step}` : `down by ${rule.step}`

  const prevV = shownVals[at - 1]
  const expected = shownVals[at + 1]

  const edges = intactEdges(shownVals, at)
  const first = edges.length > 0 ? edges[0] : null
  const last = edges.length > 1 ? edges[edges.length - 1] : null

  const beats: SeqBeat[] = [
    {
      caption: t(
        'One number sneaked in. First find the jumping rule.',
        'Satu bilangan menyelinap. Cari dulu aturan lompatannya.',
      ),
      chips: base,
      links: [],
      result: false,
      hold: 2200,
    },
  ]

  if (first !== null) {
    beats.push({
      caption: t(
        `${shownVals[first]} then ${shownVals[first + 1]}: the gap is ${rule.step}.`,
        `${shownVals[first]} lalu ${shownVals[first + 1]}: bedanya ${rule.step}.`,
      ),
      chips: withTones(base, [first, first + 1], 'focus'),
      links: [gapLink(first, stepLabel, 'focus')],
      result: false,
      hold: 2300,
    })
  }

  if (last !== null) {
    beats.push({
      caption: t(
        `Check again: ${shownVals[last]} then ${shownVals[last + 1]} — the gap is ${rule.step} too.`,
        `Cek lagi: ${shownVals[last]} lalu ${shownVals[last + 1]}, bedanya ${rule.step} juga.`,
      ),
      chips: withTones(
        withTones(base, [first as number, (first as number) + 1], 'good'),
        [last, last + 1],
        'focus',
      ),
      links: [gapLink(first as number, stepLabel, 'good'), gapLink(last, stepLabel, 'focus')],
      result: false,
      hold: 2300,
    })
  }

  // Walk from the front: every gap holds until the one that lands on the wedge.
  const walked = edges.filter((i) => i < at - 1)
  beats.push({
    caption: t(
      `Walk from the front. After ${prevV} it should be ${expected}.`,
      `Telusuri dari depan. Setelah ${prevV} seharusnya ${expected}.`,
    ),
    chips: withTone(
      base.map((c, i) => (i < at ? { ...c, tone: 'good' as const } : c)),
      at,
      'bad',
    ),
    links: [
      ...walked.map((i) => gapLink(i, stepLabel, 'good')),
      gapLink(at - 1, signed(shownVals[at] - prevV), 'bad'),
    ],
    result: false,
    hold: 2400,
  })

  beats.push({
    caption: t(
      `But ${expected} sits one box later. Something sneaked in.`,
      `Tapi ${expected} ada di kotak berikutnya. Ada yang menyelinap.`,
    ),
    chips: withTone(withTone(base, at + 1, 'good'), at, 'bad'),
    links: [
      gapLink(at - 1, signed(shownVals[at] - prevV), 'bad'),
      gapLink(at, signed(expected - shownVals[at]), 'bad'),
      arcLink(at - 1, at + 1, stepLabel, 'good', 'below'),
    ],
    result: false,
    hold: 2600,
  })

  // Repaired run: neighbour gaps everywhere except across the removed chip,
  // where one arc hops it.
  const repaired: SeqLink[] = []
  for (let i = 0; i + 1 < shownVals.length; i++) {
    if (i === at - 1 || i === at) continue
    repaired.push(gapLink(i, stepLabel, 'good'))
  }
  repaired.push(arcLink(at - 1, at + 1, stepLabel, 'good', 'below'))

  beats.push({
    caption: t(
      `Remove ${value}. Every jump is ${opEn} again.`,
      `Buang ${value}. Semua lompatan ${opId} lagi.`,
    ),
    chips: base.map((c, i) =>
      i === at ? { ...c, tone: 'gone' as const } : { ...c, tone: 'good' as const },
    ),
    links: repaired,
    result: true,
    hold: 0,
  })

  return beats
}

function intruderInterleavedBeats(
  rule: InterleavedRule,
  clean: number[],
  shownVals: number[],
  at: number,
  value: number,
  base: SeqChip[],
  t: T,
): SeqBeat[] {
  // Shown index → clean index (the wedge shifts everything after it by one).
  const cleanIndexOf = (i: number): number | null => (i === at ? null : i < at ? i : i - 1)
  const famOfShown = (i: number): 0 | 1 | null => {
    const ci = cleanIndexOf(i)
    return ci === null ? null : familyOf(ci)
  }

  // Where the wedge sits before it is unmasked: with it, by size, so it does not
  // give itself away just by standing apart.
  const nA = Math.ceil(clean.length / 2)
  const maxA = rule.startA + (nA - 1) * rule.stepA
  const looksSmall =
    value <= maxA || (value < rule.startB && value - maxA <= rule.startB - value)

  const split = base.map((c, i) => {
    const f = famOfShown(i)
    return {
      ...c,
      family: f,
      row: f === null ? (looksSmall ? 'bottom' : 'top') : familyRow(f),
    } as SeqChip
  })

  const smallShown = shownVals.map((_, i) => i).filter((i) => famOfShown(i) === 0)
  const bigShown = shownVals.map((_, i) => i).filter((i) => famOfShown(i) === 1)
  const rungs = (idx: number[]) => idx.slice(0, -1).map((i, k) => [i, idx[k + 1]] as const)
  const smallLinks = rungs(smallShown).map(([a, b]) =>
    arcLink(a, b, `+${rule.stepA}`, 'good', 'below'),
  )
  const bigLinks = rungs(bigShown).map(([a, b]) => arcLink(a, b, `+${rule.stepB}`, 'good', 'above'))

  const beats: SeqBeat[] = [
    {
      caption: t(
        'One number sneaked in. The jumps are not all the same.',
        'Satu bilangan menyelinap. Lompatannya tidak sama.',
      ),
      chips: base,
      links: shownVals
        .slice(0, -1)
        .map((_, i) => gapLink(i, signed(shownVals[i + 1] - shownVals[i]), 'muted')),
      result: false,
      hold: 2400,
    },
    {
      caption: t('Small and big numbers take turns.', 'Bilangan kecil dan besar bergantian.'),
      chips: split,
      links: [],
      result: false,
      hold: 2300,
    },
  ]

  if (smallShown.length >= 2) {
    beats.push({
      caption: t(
        `The small ones: ${shownVals[smallShown[0]]} then ${shownVals[smallShown[1]]} — add ${rule.stepA}.`,
        `Yang kecil: ${shownVals[smallShown[0]]} lalu ${shownVals[smallShown[1]]} — tambah ${rule.stepA}.`,
      ),
      chips: withTones(split, smallShown, 'focus'),
      links: smallLinks,
      result: false,
      hold: 2300,
    })
  }

  if (bigShown.length >= 2) {
    beats.push({
      caption: t(
        `The big ones: ${shownVals[bigShown[0]]} then ${shownVals[bigShown[1]]} — add ${rule.stepB}.`,
        `Yang besar: ${shownVals[bigShown[0]]} lalu ${shownVals[bigShown[1]]} — tambah ${rule.stepB}.`,
      ),
      chips: withTones(split, bigShown, 'focus'),
      links: [...smallLinks, ...bigLinks],
      result: false,
      hold: 2300,
    })
  }

  beats.push({
    caption: t(
      'One number is on neither ladder.',
      'Satu bilangan tidak ikut tangga mana pun.',
    ),
    chips: split.map((c, i) =>
      i === at ? { ...c, row: 'mid' as const, tone: 'bad' as const } : c,
    ),
    links: [...smallLinks, ...bigLinks],
    result: false,
    hold: 2600,
  })

  beats.push({
    caption: t(
      `Remove ${value}. Small and big take turns again.`,
      `Buang ${value}. Kecil dan besar bergantian lagi.`,
    ),
    chips: split.map((c, i) =>
      i === at ? { ...c, row: 'mid' as const, tone: 'gone' as const } : c,
    ),
    links: [...smallLinks, ...bigLinks],
    result: true,
    hold: 0,
  })

  return beats
}

// ── hidden-run (always arithmetic — the concept rejects interleaved here) ──────

function hiddenRunStory(
  params: SequenceRepairParams,
  d: { kind: 'hidden-run'; from: number; count: number },
  t: T,
): SequenceRepairStoryboard {
  const clean = sequenceTerms(params)
  const n = clean.length
  // Two terms must stay visible on each side of the dots — that is what lets the
  // step be read off both flanks. The concept's `isSound` already guarantees it;
  // the clamps keep a malformed params object from indexing off the board.
  const from = clamp(d.from, 2, Math.max(2, n - 3))
  const count = clamp(d.count, 1, Math.max(1, n - from - 2))

  const rule = params.rule
  const up = rule.kind === 'arithmetic' ? rule.direction === 'up' : true
  const step =
    rule.kind === 'arithmetic' ? rule.step : Math.abs((clean[1] ?? clean[0] + 1) - clean[0])
  const sign = up ? '+' : '−'
  const stepLabel = `${sign}${step}`
  const opId = up ? `tambah ${step}` : `kurang ${step}`
  const opEn = up ? `up by ${step}` : `down by ${step}`

  // Board: left flank, one dots chip, right flank.
  const leftVals = clean.slice(0, from)
  const rightVals = clean.slice(from + count)
  const hiddenVals = clean.slice(from, from + count)

  const leftChips: SeqChip[] = leftVals.map((v, i) => ({
    id: `c${i}`,
    label: String(v),
    kind: 'number',
    tone: 'idle',
    row: 'mid',
    family: null,
  }))
  const dotsChip: SeqChip = {
    id: 'dots',
    label: DOTS,
    kind: 'dots',
    tone: 'idle',
    row: 'mid',
    family: null,
  }
  const rightChips: SeqChip[] = rightVals.map((v, k) => ({
    id: `c${from + count + k}`,
    label: String(v),
    kind: 'number',
    tone: 'idle',
    row: 'mid',
    family: null,
  }))

  const base = [...leftChips, dotsChip, ...rightChips]
  const dotsAt = leftChips.length
  const beforeAt = dotsAt - 1
  const afterAt = dotsAt + 1
  const before = clean[from - 1]
  const after = clean[from + count]
  const lastAt = base.length - 1

  const gap = Math.abs(after - before)
  const jumps = count + 1

  const beats: SeqBeat[] = [
    {
      caption: t(
        'Some numbers are hidden. First find the jumping rule.',
        'Ada bilangan yang tertutup. Cari dulu aturan lompatannya.',
      ),
      chips: base,
      links: [],
      result: false,
      hold: 2200,
    },
    {
      caption: t(
        `${clean[0]} then ${clean[1]}: the gap is ${step}.`,
        `${clean[0]} lalu ${clean[1]}: bedanya ${step}.`,
      ),
      chips: withTones(base, [0, 1], 'focus'),
      links: [gapLink(0, stepLabel, 'focus')],
      result: false,
      hold: 2300,
    },
    {
      caption: t(
        `Check the right end: ${clean[n - 2]} then ${clean[n - 1]} — the gap is ${step} too. The rule is ${opEn}.`,
        `Cek ujung kanan: ${clean[n - 2]} lalu ${clean[n - 1]}, bedanya ${step} juga. Aturannya ${opId}.`,
      ),
      chips: withTones(withTones(base, [0, 1], 'good'), [lastAt - 1, lastAt], 'focus'),
      links: [gapLink(0, stepLabel, 'good'), gapLink(lastAt - 1, stepLabel, 'focus')],
      result: false,
      hold: 2300,
    },
    {
      caption: t(
        `From ${before} to ${after} the gap is ${gap}.`,
        `Dari ${before} ke ${after} bedanya ${gap}.`,
      ),
      chips: withTones(base, [beforeAt, dotsAt, afterAt], 'focus'),
      links: [arcLink(beforeAt, afterAt, String(gap), 'focus', 'below')],
      result: false,
      hold: 2400,
    },
    {
      caption: t(
        `Jump ${step} at a time: that is ${jumps} jumps.`,
        `Lompat ${step} demi ${step}: ada ${jumps} lompatan.`,
      ),
      chips: withTones(base, [beforeAt, dotsAt, afterAt], 'focus'),
      links: [arcLink(beforeAt, afterAt, `${jumps} × ${stepLabel}`, 'good', 'below')],
      result: false,
      hold: 2600,
    },
  ]

  // Final: the dots open up, so the child can see that the last jump lands on a
  // number that was on the board all along.
  const revealed: SeqChip[] = [
    ...leftChips.map((c) => ({ ...c, tone: 'good' as const })),
    ...hiddenVals.map((v, k) => ({
      id: `h${k}`,
      label: String(v),
      kind: 'number' as const,
      tone: 'reveal' as const,
      row: 'mid' as const,
      family: null,
    })),
    ...rightChips.map((c) => ({ ...c, tone: 'good' as const })),
  ]
  const revealedLinks: SeqLink[] = revealed
    .slice(0, -1)
    .map((_, i) => gapLink(i, stepLabel, 'good'))

  beats.push({
    caption: t(
      `${after} is already shown. So ${count} numbers are hidden.`,
      `${after} sudah terlihat. Jadi tersembunyi ${count} bilangan.`,
    ),
    chips: revealed,
    links: revealedLinks,
    result: true,
    hold: 0,
  })

  return {
    defect: 'hidden-run',
    ruleKind: params.rule.kind,
    layout: 'line',
    shown: base.map((c) => c.label),
    answer: String(count),
    beats,
    finalIndex: beats.length - 1,
  }
}
