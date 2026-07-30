import { buildSortCountItems, sortCountHash } from '../sort-count-by-attribute'
import type { Lang } from './makeTenSteps'

// D4 `sort-count-by-attribute` — the most common grade-1 WMI figure task. A
// jumbled picture of objects that differ along ONE attribute; the child sorts
// them into groups, counts each group, then answers.
//
// The whole skill is SORT **THEN** COUNT, and the mistake it prevents is
// counting the jumble without organising it first. So the storyboard always
// opens on the untouched pile, then spends a whole beat on the objects flying
// into their groups, and only afterwards puts numbers on anything. Nothing is
// asserted before it is visible: the tallies appear as groups are counted, the
// comparison is shown before the winner is crowned, the two compared groups are
// lined up before the gap is named. Only the last beat carries the answer.
//
// Mirrors `api/services/wmi/concepts/sort-count-by-attribute` (params, labels,
// wording and hint_steps). Pure + deterministic: no Math.random, no Date.

export type SortAttribute = 'shape' | 'colour' | 'fruit'
export type SortLayout = 'scatter' | 'grid' | 'rows'
export type SortAsk = 'count-one' | 'most' | 'difference' | 'how-many-kinds'

export type SortPhase =
  | 'mixed'
  | 'sort'
  | 'count'
  | 'focus'
  | 'trap'
  | 'compare'
  | 'lineup'
  | 'kinds'
  | 'result'

/** Mirrors the generator's params (api/services/wmi/concepts/sort-count-by-attribute). */
export interface SortCountParams {
  attribute: SortAttribute
  categories: string[]
  counts: number[]
  layout: SortLayout
  ask: SortAsk
  /** [target] for count-one, [bigger, smaller] for difference, [] otherwise. */
  askIndices: number[]
  seed: number
}

/** How one group's box reads on a given beat. */
export interface SortGroupView {
  /** Index into `categoryKeys` / `counts` — also the item colour key. */
  index: number
  key: string
  label: string
  /** True size of the group (always the count from params). */
  count: number
  /** Tally shown in the box, or null while the group is still uncounted. */
  tally: number | null
  /** 1-based group number, shown only when the GROUPS themselves are counted. */
  ordinal: number | null
  state: 'idle' | 'dim' | 'focus' | 'win' | 'trap'
  /** First item position in this group with no partner in the compared group. */
  extraFrom: number | null
}

export interface SortBeat {
  phase: SortPhase
  caption: string
  /** false = the untouched pile, true = the sorted group boxes. */
  grouped: boolean
  /** The group boxes to draw, in render order. Empty while still a pile. */
  groups: SortGroupView[]
  /** Rose chip naming the tempting wrong number / kind. */
  trapLabel: string | null
  /** Chip holding the comparison chain, e.g. "8 > 5 > 4". */
  compareLabel: string | null
  /** Only the final beat is a result. */
  result: boolean
  /** The answer — null on every beat but the last. */
  answer: string | null
  /** How long to hold this beat on screen, in ms. */
  hold: number
}

export interface SortCountStoryboard {
  attribute: SortAttribute
  layout: SortLayout
  seed: number
  ask: SortAsk
  categoryKeys: string[]
  counts: number[]
  /** Language-resolved group names, same order as `counts`. */
  labels: string[]
  total: number
  kinds: number
  /** Biggest group (ties broken by index, exactly like the generator). */
  winner: number
  runnerUp: number
  answer: string
  /** Group index of every item, in pile order — mirrors the question figure. */
  pile: number[]
  /** Pile positions belonging to each group, in pile order. */
  itemsByGroup: number[][]
  steps: SortBeat[]
  finalIndex: number
}

// --- shared vocabulary (mirrors CATEGORY_POOLS / SCENES) --------------------

const LABEL_ID: Record<string, string> = {
  'shape:circle': 'lingkaran',
  'shape:triangle': 'segitiga',
  'shape:square': 'persegi',
  'shape:star': 'bintang',
  'colour:red': 'balon merah',
  'colour:blue': 'balon biru',
  'colour:orange': 'balon oranye',
  'colour:green': 'balon hijau',
  'colour:yellow': 'balon kuning',
  'fruit:apple': 'apel',
  'fruit:banana': 'pisang',
  'fruit:orange': 'jeruk',
  'fruit:grape': 'anggur',
}

const LABEL_EN: Record<string, string> = {
  'shape:circle': 'circles',
  'shape:triangle': 'triangles',
  'shape:square': 'squares',
  'shape:star': 'stars',
  'colour:red': 'red balloons',
  'colour:blue': 'blue balloons',
  'colour:orange': 'orange balloons',
  'colour:green': 'green balloons',
  'colour:yellow': 'yellow balloons',
  'fruit:apple': 'apples',
  'fruit:banana': 'bananas',
  'fruit:orange': 'oranges',
  'fruit:grape': 'grapes',
}

interface SceneWords {
  noun_id: string
  noun_en: string
  kind_id: string
  kind_en: string
}

const SCENE: Record<SortAttribute, SceneWords> = {
  shape: { noun_id: 'bentuk', noun_en: 'shapes', kind_id: 'jenis', kind_en: 'kinds' },
  colour: { noun_id: 'balon', noun_en: 'balloons', kind_id: 'warna', kind_en: 'colours' },
  fruit: { noun_id: 'buah', noun_en: 'fruits', kind_id: 'jenis', kind_en: 'kinds' },
}

const CHOICE_LABELS = ['A', 'B', 'C', 'D'] as const

const ATTRIBUTES: readonly SortAttribute[] = ['shape', 'colour', 'fruit']
const LAYOUTS: readonly SortLayout[] = ['scatter', 'grid', 'rows']
const ASKS: readonly SortAsk[] = ['count-one', 'most', 'difference', 'how-many-kinds']

/** Same shape as the illustration's fallback, so a broken payload still teaches. */
const SAMPLE: SortCountParams = {
  attribute: 'shape',
  categories: ['circle', 'triangle', 'star'],
  counts: [6, 4, 5],
  layout: 'scatter',
  ask: 'most',
  askIndices: [],
  seed: 7,
}

// --- deterministic pile order (OWNED BY the illustration) -------------------
// Re-exported, never re-implemented: the animation replays the exact pile the
// question drew, so both sides must run the same shuffle off the same hash.

export { sortCountHash, buildSortCountItems as buildPile }

// --- params sanitising ------------------------------------------------------

function isFiniteInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function normalise(raw: unknown): SortCountParams {
  const p = (raw ?? {}) as Partial<SortCountParams>
  const attribute = ATTRIBUTES.includes(p.attribute as SortAttribute)
    ? (p.attribute as SortAttribute)
    : null
  const cats = Array.isArray(p.categories) ? p.categories.filter((c) => typeof c === 'string') : []
  const nums = Array.isArray(p.counts) ? p.counts.filter(isFiniteInt).map((n) => Math.round(n)) : []
  const k = Math.min(cats.length, nums.length)
  if (!attribute || k < 2 || nums.slice(0, k).some((n) => n < 1)) return SAMPLE

  const layout = LAYOUTS.includes(p.layout as SortLayout) ? (p.layout as SortLayout) : 'scatter'
  const ask = ASKS.includes(p.ask as SortAsk) ? (p.ask as SortAsk) : 'most'
  const askIndices = (Array.isArray(p.askIndices) ? p.askIndices : []).filter(isFiniteInt)
  const seed = isFiniteInt(p.seed) ? Math.abs(Math.round(p.seed)) % 1000 : 0

  return {
    attribute,
    categories: cats.slice(0, k),
    counts: nums.slice(0, k),
    layout,
    ask,
    askIndices,
    seed,
  }
}

// --- counting voice ---------------------------------------------------------

/** "2, 4, 6, then 7" — the skip-count a grade-1 child actually says out loud. */
function skipCount(n: number, lastWord: string): string {
  const parts: string[] = []
  for (let v = 2; v <= n; v += 2) parts.push(String(v))
  if (n % 2 === 0) return parts.join(', ')
  if (parts.length === 0) return String(n)
  return `${parts.join(', ')}, ${lastWord} ${n}`
}

// --- storyboard -------------------------------------------------------------

export function buildSortCountSteps(raw: unknown, lang: Lang): SortCountStoryboard {
  const p = normalise(raw)
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const { attribute, counts, layout, seed, ask } = p
  const k = counts.length
  const scene = SCENE[attribute]
  const labels = p.categories.map((key) =>
    lang === 'id'
      ? (LABEL_ID[`${attribute}:${key}`] ?? key)
      : (LABEL_EN[`${attribute}:${key}`] ?? key),
  )
  const noun = t(scene.noun_en, scene.noun_id)
  const kindWord = t(scene.kind_en, scene.kind_id)

  const total = counts.reduce((a, b) => a + b, 0)
  const kinds = k

  // Ties broken by index, exactly like the generator's `derive()`.
  const order = counts.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v || a.i - b.i)
  const winner = order[0].i
  const runnerUp = order[Math.min(1, order.length - 1)].i

  const target = clamp(Math.round(p.askIndices[0] ?? 0), 0, k - 1)
  let cmpA = clamp(Math.round(p.askIndices[0] ?? 0), 0, k - 1)
  let cmpB = clamp(Math.round(p.askIndices[1] ?? 1), 0, k - 1)
  if (cmpA === cmpB) cmpB = (cmpA + 1) % k

  const pile = buildSortCountItems(counts, seed)
  const itemsByGroup: number[][] = counts.map(() => [])
  pile.forEach((g, i) => itemsByGroup[g].push(i))

  let answer: string
  if (ask === 'count-one') answer = String(counts[target])
  else if (ask === 'most') answer = CHOICE_LABELS[winner] ?? CHOICE_LABELS[0]
  else if (ask === 'difference') answer = String(counts[cmpA] - counts[cmpB])
  else answer = String(kinds)

  // --- group-view helpers ---------------------------------------------------

  const group = (
    i: number,
    over: Partial<Omit<SortGroupView, 'index' | 'key' | 'label' | 'count'>> = {},
  ): SortGroupView => ({
    index: i,
    key: p.categories[i],
    label: labels[i],
    count: counts[i],
    tally: null,
    ordinal: null,
    state: 'idle',
    extraFrom: null,
    ...over,
  })

  const allGroups = (
    pick: (i: number) => Partial<Omit<SortGroupView, 'index' | 'key' | 'label' | 'count'>>,
  ): SortGroupView[] => counts.map((_, i) => group(i, pick(i)))

  const beat = (
    phase: SortPhase,
    caption: string,
    over: Partial<Omit<SortBeat, 'phase' | 'caption'>> = {},
  ): SortBeat => ({
    phase,
    caption,
    grouped: true,
    groups: [],
    trapLabel: null,
    compareLabel: null,
    result: false,
    answer: null,
    hold: 2000,
    ...over,
  })

  // --- beats ---------------------------------------------------------------

  const steps: SortBeat[] = [
    // 1. The picture exactly as the question showed it: nothing sorted, nothing counted.
    beat('mixed', t(`All the ${noun} are jumbled together.`, `Semua ${noun} masih tercampur.`), {
      grouped: false,
      groups: [],
      hold: 1900,
    }),
    // 2. The beat that teaches the method: every object flies to its own kind.
    beat(
      'sort',
      t('Sort the same ones together first.', 'Kelompokkan dulu yang sama.'),
      { groups: allGroups(() => ({})), hold: 2600 },
    ),
  ]

  if (ask === 'count-one') {
    const label = labels[target]
    const n = counts[target]

    steps.push(
      // The tempting glance: the whole pile. Named, then set aside.
      beat(
        'trap',
        t(
          `There are ${total} ${noun} in all. That is not what we want.`,
          `Semua ${noun} ada ${total}. Bukan itu yang ditanya.`,
        ),
        {
          groups: allGroups(() => ({ state: 'trap' })),
          trapLabel: t(`all ${total}`, `semua ${total}`),
          hold: 2300,
        },
      ),
      // Narrow to one group — the rest of the picture stops mattering.
      beat('focus', t(`We only need the ${label}.`, `Kita cuma perlu ${label}.`), {
        groups: allGroups((i) => ({ state: i === target ? 'focus' : 'dim' })),
        hold: 2100,
      }),
      // Only now does a number land on it.
      beat(
        'result',
        t(
          `Count: ${skipCount(n, 'then')}. There are ${n} ${label}.`,
          `Hitung: ${skipCount(n, 'lalu')}. Ada ${n} ${label}.`,
        ),
        {
          groups: allGroups((i) => ({
            state: i === target ? 'win' : 'dim',
            tally: i === target ? counts[i] : null,
          })),
          result: true,
          answer,
          hold: 0,
        },
      ),
    )
  } else if (ask === 'most') {
    const top = counts[winner]
    const second = counts[runnerUp]

    // Only a real trap when the two leaders are close: from a glance the
    // runner-up looks just as big, so a child who guesses picks it.
    if (winner !== runnerUp && top - second <= 2) {
      steps.push(
        beat(
          'trap',
          t(
            `At a glance the ${labels[runnerUp]} look the most. Do not guess — count.`,
            `Sekilas ${labels[runnerUp]} kelihatan paling banyak. Jangan menebak — hitung.`,
          ),
          {
            groups: allGroups((i) => ({ state: i === runnerUp ? 'trap' : 'idle' })),
            trapLabel: labels[runnerUp],
            hold: 2300,
          },
        ),
      )
    }

    // One beat per group: the tally appears as that group is counted.
    counts.forEach((n, i) => {
      steps.push(
        beat('count', t(`Count the ${labels[i]}: ${n}.`, `Hitung ${labels[i]}: ada ${n}.`), {
          groups: allGroups((j) => ({
            state: j === i ? 'focus' : j < i ? 'idle' : 'dim',
            tally: j <= i ? counts[j] : null,
          })),
          hold: 1600,
        }),
      )
    })

    const chain = [...counts].sort((a, b) => b - a).join(' > ')
    steps.push(
      beat('compare', t(`Compare the numbers: ${chain}.`, `Bandingkan bilangannya: ${chain}.`), {
        groups: allGroups((i) => ({ tally: counts[i] })),
        compareLabel: chain,
        hold: 2300,
      }),
      beat(
        'result',
        t(
          `The most is ${labels[winner]}, ${top}. The answer is ${answer}.`,
          `Paling banyak ${labels[winner]}, ada ${top}. Jawabannya ${answer}.`,
        ),
        {
          groups: allGroups((i) => ({ tally: counts[i], state: i === winner ? 'win' : 'idle' })),
          compareLabel: chain,
          result: true,
          answer,
          hold: 0,
        },
      ),
    )
  } else if (ask === 'difference') {
    const ca = counts[cmpA]
    const cb = counts[cmpB]
    const bigger = ca >= cb ? cmpA : cmpB
    const paired = Math.min(ca, cb)

    steps.push(
      beat('count', t(`Count the ${labels[cmpA]}: ${ca}.`, `Hitung ${labels[cmpA]}: ada ${ca}.`), {
        groups: allGroups((i) => ({
          state: i === cmpA ? 'focus' : 'dim',
          tally: i === cmpA ? ca : null,
        })),
        hold: 1800,
      }),
      beat('count', t(`Count the ${labels[cmpB]}: ${cb}.`, `Hitung ${labels[cmpB]}: ada ${cb}.`), {
        groups: allGroups((i) => ({
          state: i === cmpB ? 'focus' : i === cmpA ? 'idle' : 'dim',
          tally: i === cmpA ? ca : i === cmpB ? cb : null,
        })),
        hold: 1800,
      }),
      // The tempting stop: the size of the bigger group instead of the gap.
      beat(
        'trap',
        t(
          `${ca} is how many ${labels[cmpA]} there are, not the gap.`,
          `${ca} itu banyaknya ${labels[cmpA]}, bukan selisihnya.`,
        ),
        {
          groups: allGroups((i) => ({
            state: i === cmpA ? 'trap' : i === cmpB ? 'idle' : 'dim',
            tally: i === cmpA ? ca : i === cmpB ? cb : null,
          })),
          trapLabel: String(ca),
          hold: 2300,
        },
      ),
      // Line the two groups up so the unpartnered ones stick out on their own.
      beat(
        'lineup',
        t(
          'Line them up. Look at the ones with no partner.',
          'Sejajarkan. Lihat yang tidak punya pasangan.',
        ),
        {
          groups: [cmpA, cmpB].map((i) =>
            group(i, {
              state: 'focus',
              tally: counts[i],
              extraFrom: i === bigger && counts[i] > paired ? paired : null,
            }),
          ),
          hold: 2500,
        },
      ),
      beat(
        'result',
        t(
          `${ca} - ${cb} = ${answer}. So there are ${answer} more.`,
          `${ca} - ${cb} = ${answer}. Jadi lebih banyak ${answer}.`,
        ),
        {
          groups: [cmpA, cmpB].map((i) =>
            group(i, {
              state: i === bigger ? 'win' : 'idle',
              tally: counts[i],
              extraFrom: i === bigger && counts[i] > paired ? paired : null,
            }),
          ),
          result: true,
          answer,
          hold: 0,
        },
      ),
    )
  } else {
    // how-many-kinds — the one ask where the items must NOT be counted.
    steps.push(
      beat(
        'trap',
        t(
          `There are ${total} ${noun} in all. But we count the ${kindWord}.`,
          `Semua ${noun} ada ${total}. Tapi yang dihitung ${scene.kind_id}nya.`,
        ),
        {
          groups: allGroups(() => ({ state: 'trap' })),
          trapLabel: t(`${total} things`, `${total} benda`),
          hold: 2400,
        },
      ),
      beat(
        'kinds',
        t('Look at the groups, not the things inside.', 'Lihat kelompoknya, bukan bendanya.'),
        { groups: allGroups(() => ({ state: 'focus' })), hold: 2200 },
      ),
      beat(
        'result',
        t(
          `The groups: ${labels.join(', ')}. So there are ${kinds} ${kindWord}.`,
          `Kelompoknya: ${labels.join(', ')}. Jadi ada ${kinds} ${scene.kind_id}.`,
        ),
        {
          groups: allGroups((i) => ({ state: 'win', ordinal: i + 1 })),
          result: true,
          answer,
          hold: 0,
        },
      ),
    )
  }

  return {
    attribute,
    layout,
    seed,
    ask,
    categoryKeys: p.categories,
    counts,
    labels,
    total,
    kinds,
    winner,
    runnerUp,
    answer,
    pile,
    itemsByGroup,
    steps,
    finalIndex: steps.length - 1,
  }
}
