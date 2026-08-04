import type { Lang } from './makeTenSteps'

// `interval-fencepost-count`. One off-by-one, told as a picture that gets
// counted rather than a rule that gets announced:
//
//   beat 1  the arrangement as the problem describes it
//   beat 2  the SMALLEST picture (2 in a line, 3 round a ring) with its gaps lit
//   beat 3  the same lighting on this problem's arrangement, gap count named
//   beat 4  the single division, which always comes out whole
//   beat 5  (scale asks) the same rule applied to the arrangement being asked about
//   beat 6  the off-by-one answer, shown as wrong
//   beat 7  the answer
//
// Mirrors api/services/wmi/concepts/interval-fencepost-count. Params arrive as
// `unknown` from the DB, so everything is re-derived and clamped here — the
// storyboard can never narrate a division that does not come out whole.
export type FencepostEnds = 'open' | 'closed'
export type FencepostAsk = 'gap' | 'total-for-m-items' | 'how-long-until-the-nth'
export type FencepostScenario = 'lamps-on-a-road' | 'trees' | 'clock-chimes'
export type FencepostPhase = 'setup' | 'smallest' | 'count' | 'divide' | 'apply' | 'trap' | 'result'

export interface FencepostParams {
  scenario: FencepostScenario
  ends: FencepostEnds
  count: number
  span: number
  ask: FencepostAsk
  target: number | null
}

export interface FencepostBeat {
  phase: FencepostPhase
  caption: string
  /** Dots drawn in the row this beat. */
  items: number
  /** Draw the extra gap that closes the row back onto item 1. */
  ring: boolean
  /** Gap indices lit. Straight gaps are 0…items-2; the wrap gap is items-1. */
  lit: number[]
  /** The drawn row is shorter than the arrangement being talked about. */
  truncated: boolean
  /** Short badge under the row — a gap tally or the arithmetic. */
  chip: string | null
  trap: boolean
  /** The answer — non-null ONLY on the final beat. */
  reveal: string | null
  hold: number
}

export interface FencepostStoryboard {
  count: number
  span: number
  ends: FencepostEnds
  gapCount: number
  gapSize: number
  value: number
  answer: string
  unit: string
  steps: FencepostBeat[]
  finalIndex: number
}

/** Never draw more than this many dots in one row. */
const MAX_DRAWN = 12

const FALLBACK: FencepostParams = {
  scenario: 'lamps-on-a-road',
  ends: 'open',
  count: 6,
  span: 30,
  ask: 'gap',
  target: null,
}

const gapsFor = (items: number, ends: FencepostEnds): number => (ends === 'open' ? items - 1 : items)

const allGaps = (items: number, ends: FencepostEnds): number[] =>
  Array.from({ length: gapsFor(items, ends) }, (_, i) => i)

function pairList(items: number, ends: FencepostEnds, lang: Lang): string {
  const pairs: Array<[number, number]> = []
  for (let i = 1; i < items; i++) pairs.push([i, i + 1])
  if (ends === 'closed') pairs.push([items, 1])
  const say = ([a, b]: [number, number]) => (lang === 'id' ? `${a} ke ${b}` : `${a} to ${b}`)
  if (pairs.length <= 4) return pairs.map(say).join(', ')
  return [say(pairs[0]), say(pairs[1]), '…', say(pairs[pairs.length - 1])].join(', ')
}

function readParams(raw: unknown): FencepostParams {
  const p = (raw ?? {}) as Partial<FencepostParams>
  const scenario: FencepostScenario =
    p.scenario === 'trees' || p.scenario === 'clock-chimes' || p.scenario === 'lamps-on-a-road'
      ? p.scenario
      : FALLBACK.scenario
  const count =
    Number.isInteger(p.count) && (p.count as number) >= 3 && (p.count as number) <= 20
      ? (p.count as number)
      : FALLBACK.count
  const ends: FencepostEnds = p.ends === 'closed' && scenario !== 'clock-chimes' ? 'closed' : 'open'
  const ask: FencepostAsk =
    p.ask === 'total-for-m-items' || p.ask === 'how-long-until-the-nth' || p.ask === 'gap' ? p.ask : 'gap'

  // The span must divide exactly by the gap count, or the narration would put a
  // lamp half a metre along. A span that does not is replaced, not rounded.
  const gapCount = gapsFor(count, ends)
  const rawSpan = Number.isInteger(p.span) && (p.span as number) > 0 ? (p.span as number) : 0
  const span = rawSpan > 0 && rawSpan % gapCount === 0 ? rawSpan : gapCount * 5

  let target: number | null = null
  if (ask === 'total-for-m-items') {
    const m = Number.isInteger(p.target) ? (p.target as number) : count + 3
    target = m > count && m <= 30 ? m : count + 3
  } else if (ask === 'how-long-until-the-nth') {
    const n = Number.isInteger(p.target) ? (p.target as number) : Math.max(3, count - 1)
    target = n >= 3 && n < count ? n : Math.max(3, count - 1)
  }

  return { scenario, ends, count, span, ask, target }
}

export function buildIntervalFencepostCountSteps(raw: unknown, lang: Lang): FencepostStoryboard {
  const p = readParams(raw)
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const { count, span, ends, ask, target } = p
  const ring = ends === 'closed'
  const chimes = p.scenario === 'clock-chimes'
  const gapCount = gapsFor(count, ends)
  const gapSize = span / gapCount

  const unit = chimes ? T('s', 'detik') : 'm'
  const thing = chimes ? T('chimes', 'dentangan') : p.scenario === 'trees' ? T('trees', 'pohon') : T('posts', 'tiang')
  const gapWord = chimes ? T('gap', 'jeda') : T('gap', 'jarak')
  const gapsWord = chimes ? T('gaps', 'jeda') : T('gaps', 'jarak')

  // The arrangement the ANSWER counts. Walking from item 1 to item n is a
  // straight run of n even when the things stand round a ring.
  const askItems = ask === 'gap' ? count : (target as number)
  const askEnds: FencepostEnds = ask === 'how-long-until-the-nth' ? 'open' : ends
  const askGaps = gapsFor(askItems, askEnds)
  const value = ask === 'gap' ? gapSize : askGaps * gapSize
  const trapGaps = askEnds === 'open' ? askItems : askItems - 1
  const rawTrap = ask === 'gap' ? span / trapGaps : trapGaps * gapSize
  const trapValue = Number.isInteger(rawTrap) && rawTrap > 0 && rawTrap !== value ? rawTrap : null

  const drawn = Math.min(askItems, MAX_DRAWN)
  const steps: FencepostBeat[] = []

  steps.push({
    phase: 'setup',
    caption: T(
      ring
        ? `${count} ${thing} stand right around, and the whole way round is ${span} ${unit}.`
        : `${count} ${thing} stand in a line, and the whole line is ${span} ${unit}.`,
      ring
        ? `Ada ${count} ${thing} mengelilingi, dan keliling seluruhnya ${span} ${unit}.`
        : `Ada ${count} ${thing} berbaris, dan seluruhnya ${span} ${unit}.`,
    ),
    items: Math.min(count, MAX_DRAWN),
    ring,
    lit: [],
    truncated: count > MAX_DRAWN,
    chip: null,
    trap: false,
    reveal: null,
    hold: 2600,
  })

  steps.push({
    phase: 'smallest',
    caption: T(
      ring
        ? `Smallest picture first: 3 ${thing} round a ring. 1 to 2, 2 to 3, and 3 back to 1 — that last one is a ${gapWord} too. 3 ${thing}, 3 ${gapsWord}.`
        : `Smallest picture first: 2 ${thing} in a line have just 1 ${gapWord} between them. A third adds one more. So a line always has one ${gapWord} fewer than it has ${thing}.`,
      ring
        ? `Gambar terkecil dulu: 3 ${thing} melingkar. 1 ke 2, 2 ke 3, lalu 3 kembali ke 1 — yang terakhir juga satu ${gapWord}. 3 ${thing}, 3 ${gapsWord}.`
        : `Gambar terkecil dulu: 2 ${thing} berbaris hanya punya 1 ${gapWord} di antaranya. Tambah satu lagi, bertambah satu ${gapWord}. Jadi di barisan lurus, ${gapWord} selalu satu lebih sedikit daripada ${thing}.`,
    ),
    items: ring ? 3 : 2,
    ring,
    lit: allGaps(ring ? 3 : 2, ends),
    truncated: false,
    chip: `${ring ? 3 : 1} ${gapsWord}`,
    trap: false,
    reveal: null,
    hold: 3400,
  })

  steps.push({
    phase: 'count',
    caption: T(
      `Now count this one's ${gapsWord}: ${pairList(count, ends, lang)}. That is ${gapCount} ${gapsWord}${ring ? '' : `, not ${count}`}.`,
      `Sekarang hitung ${gapWord} di soal ini: ${pairList(count, ends, lang)}. Ada ${gapCount} ${gapsWord}${ring ? '' : `, bukan ${count}`}.`,
    ),
    items: Math.min(count, MAX_DRAWN),
    ring,
    lit: allGaps(Math.min(count, MAX_DRAWN), ends),
    truncated: count > MAX_DRAWN,
    chip: `${gapCount} ${gapsWord}`,
    trap: false,
    reveal: null,
    hold: 3400,
  })

  steps.push({
    phase: 'divide',
    caption: T(
      `Share the ${span} ${unit} equally between those ${gapCount} ${gapsWord}: ${span} : ${gapCount} = ${gapSize}. One ${gapWord} is ${gapSize} ${unit}.`,
      `Bagi ${span} ${unit} rata ke ${gapCount} ${gapsWord} itu: ${span} : ${gapCount} = ${gapSize}. Satu ${gapWord} adalah ${gapSize} ${unit}.`,
    ),
    items: Math.min(count, MAX_DRAWN),
    ring,
    lit: allGaps(Math.min(count, MAX_DRAWN), ends),
    truncated: count > MAX_DRAWN,
    chip: `${span} : ${gapCount} = ${gapSize}`,
    trap: false,
    reveal: null,
    hold: 3200,
  })

  if (ask !== 'gap') {
    steps.push({
      phase: 'apply',
      caption: T(
        ask === 'how-long-until-the-nth'
          ? `From number 1 to number ${askItems} you cross ${pairList(askItems, 'open', lang)} — ${askGaps} ${gapsWord}, not ${askItems}. So ${askGaps} x ${gapSize} = ${value} ${unit}.`
          : askEnds === 'closed'
            ? `${askItems} ${thing} round a ring make ${askItems} ${gapsWord}, because the last one closes the circle. So ${askItems} x ${gapSize} = ${value} ${unit}.`
            : `${askItems} ${thing} in a line make ${askItems} - 1 = ${askGaps} ${gapsWord}. So ${askGaps} x ${gapSize} = ${value} ${unit}.`,
        ask === 'how-long-until-the-nth'
          ? `Dari nomor 1 sampai nomor ${askItems} kamu melewati ${pairList(askItems, 'open', lang)} — ${askGaps} ${gapsWord}, bukan ${askItems}. Jadi ${askGaps} x ${gapSize} = ${value} ${unit}.`
          : askEnds === 'closed'
            ? `${askItems} ${thing} melingkar membuat ${askItems} ${gapsWord}, karena yang terakhir menutup lingkaran. Jadi ${askItems} x ${gapSize} = ${value} ${unit}.`
            : `${askItems} ${thing} berbaris lurus membuat ${askItems} - 1 = ${askGaps} ${gapsWord}. Jadi ${askGaps} x ${gapSize} = ${value} ${unit}.`,
      ),
      items: drawn,
      ring: askEnds === 'closed',
      lit: allGaps(drawn, askEnds),
      truncated: askItems > MAX_DRAWN,
      chip: `${askGaps} x ${gapSize} = ${value}`,
      trap: false,
      reveal: null,
      hold: 3800,
    })
  }

  if (trapValue !== null) {
    steps.push({
      phase: 'trap',
      caption: T(
        `Counting ${trapGaps} ${gapsWord} instead of ${askGaps} would give ${trapValue} — that is counting the ${thing}, not the spaces between them.`,
        `Kalau ${gapsWord}nya dihitung ${trapGaps} dan bukan ${askGaps}, hasilnya ${trapValue} — itu menghitung ${thing}nya, bukan ruang di antaranya.`,
      ),
      items: drawn,
      ring: askEnds === 'closed',
      lit: allGaps(drawn, askEnds),
      truncated: askItems > MAX_DRAWN,
      chip: `${trapValue} ${unit}`,
      trap: true,
      reveal: null,
      hold: 3600,
    })
  }

  steps.push({
    phase: 'result',
    caption: T(`The answer is ${value} ${unit}.`, `Jawabannya ${value} ${unit}.`),
    items: drawn,
    ring: askEnds === 'closed',
    lit: allGaps(drawn, askEnds),
    truncated: askItems > MAX_DRAWN,
    chip: null,
    trap: false,
    reveal: `${value} ${unit}`,
    hold: 3200,
  })

  return {
    count,
    span,
    ends,
    gapCount,
    gapSize,
    value,
    answer: String(value),
    unit,
    steps,
    finalIndex: steps.length - 1,
  }
}
