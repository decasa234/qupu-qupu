import type { Lang } from './makeTenSteps'

// `comparison-chain-solve`. Three or four children, each described only through
// the one before them, and exactly ONE count printed. The storyboard never draws
// a bar it has not earned: a child stays a dashed question mark until the beat
// that pins them, and that beat shows the arithmetic doing the pinning. The trap
// beat parks the tempting stop (one link early / one child forgotten / the
// loudest printed number) as a picture before the answer lands.
export type ChainAsk = 'value' | 'total' | 'difference' | 'rank'
export type ChainLinkKind = 'more' | 'fewer' | 'times' | 'times-plus'
export type ChainRankMode = 'most' | 'fewest'
export type ChainPhase = 'setup' | 'link' | 'trap' | 'result'

const ASKS: readonly ChainAsk[] = ['value', 'total', 'difference', 'rank']
const KINDS: readonly ChainLinkKind[] = ['more', 'fewer', 'times', 'times-plus']

export interface ChainLink {
  kind: ChainLinkKind
  k: number
  m: number
}

/** Mirrors the generator's params (api/services/wmi/concepts/comparison-chain-solve). */
export interface ChainParams {
  ask: ChainAsk
  names: string[]
  start: number
  links: ChainLink[]
  givenIndex: number
  targetIndex: number
  cmpA: number
  cmpB: number
  rankMode: ChainRankMode
  item_en: string
  item_one_en: string
  item_id: string
}

export interface ChainBeat {
  phase: ChainPhase
  caption: string
  /** Per child: their count once it is pinned, else null (still a question mark). */
  known: (number | null)[]
  /** The child pinned on THIS beat — their bar grows in and glows. */
  focus: number | null
  /** The relation chip lit on this beat. */
  linkFocus: number | null
  trap: boolean
  /** Short rose chip naming the tempting answer, already in `lang`. */
  trapLabel: string | null
  /** Children the tempting reading points at (rose). */
  trapIdx: number[]
  /** Children the answer rests on, on the final beat (green). */
  resultIdx: number[]
  /** The answer — non-null ONLY on the final beat. */
  reveal: string | null
  result: boolean
  hold: number
}

export interface ChainStoryboard {
  ask: ChainAsk
  names: string[]
  values: number[]
  /** Relation chip per child ("Ani + 4", "Budi × 3"); null for the chain head. */
  relations: (string | null)[]
  givenIndex: number
  itemLabel: string
  /** Largest count on screen — bars scale against this. */
  max: number
  answer: string
  steps: ChainBeat[]
  finalIndex: number
}

const clampInt = (value: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
  return Math.max(min, Math.min(max, n))
}

const str = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback

function readLink(raw: unknown): ChainLink {
  const l = (raw ?? {}) as Partial<ChainLink>
  return {
    kind: KINDS.includes(l.kind as ChainLinkKind) ? (l.kind as ChainLinkKind) : 'more',
    k: clampInt(l.k, 1, 99, 1),
    m: clampInt(l.m, 2, 9, 2),
  }
}

export function applyChainLink(prev: number, link: ChainLink): number {
  switch (link.kind) {
    case 'more':
      return prev + link.k
    case 'fewer':
      return prev - link.k
    case 'times':
      return prev * link.m
    case 'times-plus':
      return prev * link.m + link.k
  }
}

export function buildComparisonChainSteps(raw: unknown, lang: Lang): ChainStoryboard {
  const p = (raw ?? {}) as Partial<ChainParams>
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const rawNames = Array.isArray(p.names) ? p.names.filter((s) => typeof s === 'string') : []
  const names = rawNames.length >= 2 ? rawNames.slice(0, 4) : ['Ani', 'Budi', 'Citra']
  const n = names.length
  const links = (Array.isArray(p.links) ? p.links : []).slice(0, n - 1).map(readLink)
  while (links.length < n - 1) links.push({ kind: 'more', k: 1, m: 2 })

  const ask: ChainAsk = ASKS.includes(p.ask as ChainAsk) ? (p.ask as ChainAsk) : 'value'
  const rankMode: ChainRankMode = p.rankMode === 'fewest' ? 'fewest' : 'most'
  const itemEn = str(p.item_en, 'marbles')
  const itemId = str(p.item_id, 'kelereng')
  const itemLabel = lang === 'id' ? itemId : itemEn

  const start = clampInt(p.start, 1, 999, 2)
  const values = [start]
  for (const link of links) values.push(Math.max(0, applyChainLink(values[values.length - 1], link)))

  // The printed count sits at one end; anything else would split the walk in two.
  const givenIndex = clampInt(p.givenIndex, 0, n - 1, 0) === 0 ? 0 : n - 1
  const forward = givenIndex === 0
  const order: number[] = []
  if (forward) for (let i = 0; i < n; i++) order.push(i)
  else for (let i = n - 1; i >= 0; i--) order.push(i)

  const total = values.reduce((s, v) => s + v, 0)
  const targetRaw = clampInt(p.targetIndex, 0, n - 1, forward ? n - 1 : 0)
  const targetIndex = targetRaw === givenIndex ? (forward ? n - 1 : 0) : targetRaw
  const cmpA = clampInt(p.cmpA, 0, n - 1, 0)
  const cmpB = clampInt(p.cmpB, 0, n - 1, n - 1)
  const [hiIndex, loIndex] = values[cmpA] >= values[cmpB] ? [cmpA, cmpB] : [cmpB, cmpA]
  const diff = values[hiIndex] - values[loIndex]
  const best = rankMode === 'most' ? Math.max(...values) : Math.min(...values)
  const rankIndex = values.indexOf(best)

  const answer =
    ask === 'value'
      ? String(values[targetIndex])
      : ask === 'total'
        ? String(total)
        : ask === 'difference'
          ? String(diff)
          : names[rankIndex]

  const relations: (string | null)[] = names.map((_, i) => {
    if (i === 0) return null
    const link = links[i - 1]
    const from = names[i - 1]
    switch (link.kind) {
      case 'more':
        return `${from} + ${link.k}`
      case 'fewer':
        return `${from} − ${link.k}`
      case 'times':
        return `${from} × ${link.m}`
      case 'times-plus':
        return `${from} × ${link.m} + ${link.k}`
    }
  })

  const steps: ChainBeat[] = []
  type Draft = Partial<ChainBeat> & { phase: ChainPhase; caption: string; known: (number | null)[] }
  const push = (draft: Draft) => {
    steps.push({
      focus: null,
      linkFocus: null,
      trap: false,
      trapLabel: null,
      trapIdx: [],
      resultIdx: [],
      reveal: null,
      result: false,
      hold: 2200,
      ...draft,
    })
  }

  // ── Beat 1: only the printed count exists. Everything else is a question mark.
  const known: (number | null)[] = names.map((_, i) => (i === givenIndex ? values[i] : null))
  push({
    phase: 'setup',
    known: known.slice(),
    focus: givenIndex,
    caption: T(
      `Only ${names[givenIndex]}'s count is printed: ${values[givenIndex]} ${itemEn}. Everybody else is described through somebody else, so nothing else is known yet.`,
      `Cuma jumlah ${names[givenIndex]} yang tertulis: ${values[givenIndex]} ${itemId}. Yang lain hanya dijelaskan lewat temannya, jadi belum ada yang tahu.`,
    ),
    hold: 2600,
  })

  // ── Beats 2…n: one hop each, and each hop SHOWS the arithmetic that pins it.
  for (let step = 1; step < order.length; step++) {
    const idx = order[step]
    const linkIdx = forward ? idx - 1 : idx
    const link = links[linkIdx]
    const fromIdx = forward ? idx - 1 : idx + 1
    const from = names[fromIdx]
    const to = names[idx]
    const a = values[fromIdx]
    const b = values[idx]
    known[idx] = values[idx]

    const sum = forward
      ? link.kind === 'more'
        ? `${a} + ${link.k} = ${b}`
        : link.kind === 'fewer'
          ? `${a} − ${link.k} = ${b}`
          : link.kind === 'times'
            ? `${a} × ${link.m} = ${b}`
            : `${a} × ${link.m} + ${link.k} = ${b}`
      : link.kind === 'more'
        ? `${a} − ${link.k} = ${b}`
        : link.kind === 'fewer'
          ? `${a} + ${link.k} = ${b}`
          : link.kind === 'times'
            ? `${a} ÷ ${link.m} = ${b}`
            : `(${a} − ${link.k}) ÷ ${link.m} = ${b}`

    push({
      phase: 'link',
      known: known.slice(),
      focus: idx,
      linkFocus: linkIdx,
      caption: forward
        ? T(
            `${from} is pinned, so ${to} can be worked out now — ${sum}. ${to} has ${b}.`,
            `${from} sudah terkunci, jadi ${to} bisa dihitung sekarang — ${sum}. ${to} punya ${b}.`,
          )
        : T(
            `${from} is pinned, so rewind the link back to ${to} — ${sum}. ${to} has ${b}.`,
            `${from} sudah terkunci, jadi putar balik langkahnya ke ${to} — ${sum}. ${to} punya ${b}.`,
          ),
      hold: 2600,
    })
  }

  // ── The trap beat: the picture the tempting stop draws, right before the answer.
  const trap = trapBeat()
  if (trap) push(trap)

  // ── The landing beat. It only ever says out loud what the bars already show.
  push({
    phase: 'result',
    known: known.slice(),
    caption: finalCaption(),
    resultIdx:
      ask === 'value'
        ? [targetIndex]
        : ask === 'difference'
          ? [hiIndex, loIndex]
          : ask === 'rank'
            ? [rankIndex]
            : names.map((_, i) => i),
    reveal: answer,
    result: true,
    hold: 0,
  })

  return {
    ask,
    names,
    values,
    relations,
    givenIndex,
    itemLabel,
    max: Math.max(1, ...values),
    answer,
    steps,
    finalIndex: steps.length - 1,
  }

  function trapBeat(): Draft | null {
    if (ask === 'value') {
      const pos = order.indexOf(targetIndex)
      const prev = order[pos - 1]
      if (prev === undefined || values[prev] === values[targetIndex]) return null
      return {
        phase: 'trap',
        known: known.slice(),
        trap: true,
        trapIdx: [prev],
        trapLabel: T(`${values[prev]}?`, `${values[prev]}?`),
        caption: T(
          `Careful — ${values[prev]} is the easy stop, but that bar belongs to ${names[prev]}. The question asks about ${names[targetIndex]}, one link further on.`,
          `Hati-hati — ${values[prev]} itu berhenti terlalu cepat, batang itu punya ${names[prev]}. Yang ditanya ${names[targetIndex]}, satu langkah lebih jauh.`,
        ),
        hold: 3000,
      }
    }
    if (ask === 'total') {
      const last = order[order.length - 1]
      return {
        phase: 'trap',
        known: known.slice(),
        trap: true,
        trapIdx: [last],
        trapLabel: T(`${total - values[last]}?`, `${total - values[last]}?`),
        caption: T(
          `${names[last]} was the last one worked out, and is the easiest to leave out of the sum — that would give ${total - values[last]}. Every bar on screen belongs in the total.`,
          `${names[last]} paling terakhir dihitung, jadi paling gampang kelewat waktu menjumlah — hasilnya jadi ${total - values[last]}. Semua batang di layar ikut dijumlahkan.`,
        ),
        hold: 3000,
      }
    }
    if (ask === 'difference') {
      const step = hiIndex < loIndex ? 1 : -1
      const near = hiIndex + step
      if (near === loIndex) return null
      const wrong = Math.abs(values[hiIndex] - values[near])
      if (wrong === diff) return null
      return {
        phase: 'trap',
        known: known.slice(),
        trap: true,
        trapIdx: [hiIndex, near],
        trapLabel: T(`${wrong}?`, `${wrong}?`),
        caption: T(
          `The neighbouring pair is the tempting one: ${names[hiIndex]} against ${names[near]} gives ${wrong}. But the question named ${names[loIndex]}, further down the chain.`,
          `Pasangan bersebelahan paling menggoda: ${names[hiIndex]} dengan ${names[near]} hasilnya ${wrong}. Padahal yang ditanya ${names[loIndex]}, lebih jauh di rantai.`,
        ),
        hold: 3000,
      }
    }
    // rank — the loudest printed number is rarely the biggest pile.
    const printed = names.map((_, i) => {
      if (i === givenIndex) return values[i]
      const link = links[i - 1]
      if (!link) return -1
      return link.kind === 'times' || link.kind === 'times-plus' ? link.m : link.k
    })
    let loud = 0
    for (let i = 1; i < printed.length; i++) if (printed[i] > printed[loud]) loud = i
    if (printed[loud] < 0 || loud === rankIndex) return null
    return {
      phase: 'trap',
      known: known.slice(),
      trap: true,
      trapIdx: [loud],
      trapLabel: T(`${names[loud]}?`, `${names[loud]}?`),
      caption: T(
        `${printed[loud]} is the biggest number printed in the story and it sits with ${names[loud]} — but a comparison number is not a pile. Read the bars, not the sentences.`,
        `${printed[loud]} adalah angka terbesar yang tertulis di soal dan ada di ${names[loud]} — tapi angka perbandingan bukan jumlah tumpukan. Lihat batangnya, bukan kalimatnya.`,
      ),
      hold: 3000,
    }
  }

  function finalCaption(): string {
    const roll = names.map((nm, i) => `${nm} ${values[i]}`).join(', ')
    if (ask === 'value') {
      return T(
        `Every bar is earned from the one before it: ${roll}. ${names[targetIndex]} has ${values[targetIndex]} ${itemEn}.`,
        `Tiap batang didapat dari batang sebelumnya: ${roll}. ${names[targetIndex]} punya ${values[targetIndex]} ${itemId}.`,
      )
    }
    if (ask === 'total') {
      return T(
        `All ${n} bars are pinned now, so stack them up: ${values.join(' + ')} = ${total} ${itemEn}.`,
        `Semua ${n} batang sudah terkunci, tinggal ditumpuk: ${values.join(' + ')} = ${total} ${itemId}.`,
      )
    }
    if (ask === 'difference') {
      return T(
        `${names[hiIndex]} ended on ${values[hiIndex]} and ${names[loIndex]} on ${values[loIndex]}, so the gap is ${values[hiIndex]} − ${values[loIndex]} = ${diff}.`,
        `${names[hiIndex]} berakhir di ${values[hiIndex]} dan ${names[loIndex]} di ${values[loIndex]}, jadi selisihnya ${values[hiIndex]} − ${values[loIndex]} = ${diff}.`,
      )
    }
    return T(
      `Line the finished bars up: ${roll}. The ${rankMode === 'most' ? 'longest' : 'shortest'} one is ${names[rankIndex]}.`,
      `Sejajarkan batang yang sudah jadi: ${roll}. Yang paling ${rankMode === 'most' ? 'panjang' : 'pendek'} adalah ${names[rankIndex]}.`,
    )
  }
}
