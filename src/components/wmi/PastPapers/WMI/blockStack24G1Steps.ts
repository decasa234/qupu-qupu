// Storyboard for WMI-24F1A-Q22 (2024 Grade 1 Final) — "stack as high as possible".
//
// Official stem: "Take the blocks in the order of blue -> green -> white ->
// blue -> green -> white -> ... A block can be put on a cube or a cylinder, but
// it cannot be put on a sphere. If the blocks are piled up vertically as high as
// possible, how many blocks are used the most?"
//
// The cycle is by COLOUR, not by shape. Each turn the colour is fixed; the child
// picks the SHAPE freely out of that colour's own stock. RULE: a block may sit on
// a cube or a cylinder, but nothing may sit on a sphere — so a sphere can only
// ever be the very top of the tower.
//
// Stock, exactly as the paper prints it (mirrors GROUPS in
// BlockStack24G1Illustration, which is the rendering source of truth):
//     blue  : cube, cube, cylinder, sphere    -> 3 blocks that can carry
//     green : cube, cube, sphere,   sphere    -> 2 blocks that can carry
//     white : cube, cylinder, cylinder, sphere -> 3 blocks that can carry
//
// GREEN owning only two carriers is the whole problem. Green plays on turns 2, 5
// and 8, so by its third turn both green cubes are spent and block 8 has to be a
// green sphere — and nothing may sit on a sphere. Eight blocks. Answer: 8.
//
// An earlier revision narrated a cube -> cylinder -> sphere SHAPE cycle with a
// shape-only supply ("5 cubes, 3 cylinders, 4 spheres") and concluded the tower
// was "bounded by the 3 cylinders". That reached the right number by a route the
// paper does not contain, so the argument is rebuilt here from the colour cycle:
// the tower is bounded by the SCARCEST COLOUR's carrier stock, not by a shape
// total.
//
// The tower itself is DERIVED (greedy: on each turn spend that colour's first
// unused carrier), which reproduces the sequence the bound BlockStack24G1
// primitive draws:
//     1 blue cube   2 green cube  3 white cube    4 blue cube
//     5 green cube  6 white cyl.  7 blue cylinder 8 green sphere (cap)
//
// `stackHeight` is the gate the primitive reads: 0 = pristine question figure,
// 1..8 = the tower growing bottom-to-top.
//
// Pure builder: (lang) => storyboard. No random / dates / state — SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type BlockStack24Phase = 'rule' | 'order' | 'stock' | 'build' | 'forced' | 'result'

export type BlockKind = 'cube' | 'cylinder' | 'sphere'
export type BlockHue = 'blue' | 'green' | 'white'

export interface BlockStack24Step {
  phase: BlockStack24Phase
  /** How many blocks the bound BlockStack24G1 primitive should draw this beat. */
  stackHeight: number
  /** Running block count to show as a big tally (0 = don't show). */
  running: number
  /** The shape laid this beat (for the accent), or null. */
  laid: BlockKind | null
  /** The colour laid this beat (for the accent), or null. */
  hue: BlockHue | null
  caption: string
  /** ms to linger before advancing; winner is the last beat with hold 0. */
  hold: number
  result: boolean
}

export interface BlockStack24Storyboard {
  /** Tallest legal stack — the answer. */
  answer: number
  /** The repeating colour cycle the blocks must be taken in. */
  order: readonly BlockHue[]
  /** Per colour, how many of its blocks can carry another block (non-spheres). */
  carriers: Readonly<Record<BlockHue, number>>
  /** The colour with the fewest carriers — the one that caps the tower. */
  scarcest: BlockHue
  /** 1-based turns on which `scarcest` plays, up to and including the cap. */
  scarcestTurns: readonly number[]
  steps: BlockStack24Step[]
  finalIndex: number
}

// --- the question's data (mirrors BlockStack24G1Illustration) ----------------

/** The repeating COLOUR cycle. */
const ORDER: readonly BlockHue[] = ['blue', 'green', 'white']

/**
 * Exactly what each colour group holds on the paper, in printed order.
 * Exported so the coherence test can assert this still matches the
 * illustration's GROUPS — the two are deliberately independent (the derivation
 * below is what proves the reasoning reproduces the drawing) but they must
 * describe the same paper.
 */
export const STOCK: Readonly<Record<BlockHue, readonly BlockKind[]>> = {
  blue: ['cube', 'cube', 'cylinder', 'sphere'],
  green: ['cube', 'cube', 'sphere', 'sphere'],
  white: ['cube', 'cylinder', 'cylinder', 'sphere'],
}

/** A block can carry another block iff it is not a sphere. */
const canCarry = (kind: BlockKind): boolean => kind !== 'sphere'

const CARRIERS: Record<BlockHue, number> = {
  blue: STOCK.blue.filter(canCarry).length,
  green: STOCK.green.filter(canCarry).length,
  white: STOCK.white.filter(canCarry).length,
}

/** The colour with the fewest carriers (first one wins on a tie). */
const SCARCEST: BlockHue = ORDER.reduce((a, b) => (CARRIERS[b] < CARRIERS[a] ? b : a))

interface Placement {
  /** 1-based turn number. */
  turn: number
  hue: BlockHue
  kind: BlockKind
}

/**
 * The tallest legal tower, bottom -> top. The colour of turn t is forced by the
 * cycle; the shape is our choice, so we spend that colour's first unused carrier
 * every time. The first turn whose colour has no carrier left must spend a
 * sphere, which caps the tower.
 */
function buildTower(): Placement[] {
  const left: Record<BlockHue, BlockKind[]> = {
    blue: [...STOCK.blue],
    green: [...STOCK.green],
    white: [...STOCK.white],
  }
  const out: Placement[] = []
  // The cycle can never outrun the total stock, so this loop always terminates.
  for (let turn = 1; turn <= 12; turn++) {
    const hue = ORDER[(turn - 1) % ORDER.length]
    const carrier = left[hue].findIndex(canCarry)
    if (carrier === -1) {
      // No carrier left in this colour: the turn has to spend a sphere, and
      // nothing may sit on a sphere, so this block ends the tower.
      const sphere = left[hue].indexOf('sphere')
      if (sphere === -1) break
      left[hue].splice(sphere, 1)
      out.push({ turn, hue, kind: 'sphere' })
      break
    }
    const [kind] = left[hue].splice(carrier, 1)
    out.push({ turn, hue, kind })
  }
  return out
}

/**
 * Exported for the coherence test: the illustration hardcodes the same tower as
 * TOWER_SHAPES to draw it, and nothing but that test keeps the two agreeing.
 */
export const TOWER: readonly Placement[] = buildTower()
const ANSWER = TOWER.length // 8
/** Turns 1..ANSWER-1 all carry; the last turn is the forced sphere cap. */
const CARRY_TURNS = ANSWER - 1

const SCARCEST_TURNS: readonly number[] = Array.from({ length: ANSWER }, (_, i) => i + 1).filter(
  (turn) => ORDER[(turn - 1) % ORDER.length] === SCARCEST,
)

// --- wording ----------------------------------------------------------------

const KIND_NAME = (kind: BlockKind, lang: Lang): string => {
  if (lang === 'id') return kind === 'cube' ? 'kubus' : kind === 'cylinder' ? 'tabung' : 'bola'
  return kind
}

const HUE_NAME = (hue: BlockHue, lang: Lang): string => {
  if (lang === 'id') return hue === 'blue' ? 'biru' : hue === 'green' ? 'hijau' : 'putih'
  return hue
}

/** Sentence-case a colour name for use at the start of a sentence. */
const capitalise = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1)

/**
 * Why the shape laid on each carrying turn is the one it is. Written as a
 * function of the shape word so the prose can never drift from the derived
 * tower: the shape named is always the shape actually placed.
 */
const CARRY_REASON: Record<number, { en: (kind: string) => string; id: (kind: string) => string }> = {
  1: {
    en: (k) => `A ${k} can carry the next block, so lay a ${k}.`,
    id: (k) => `${capitalise(k)} bisa memikul balok berikutnya, jadi susun ${k}.`,
  },
  2: {
    en: (k) => `Lay another ${k} here.`,
    id: (k) => `Susun ${k} lagi di sini.`,
  },
  3: {
    en: (k) => `And one more ${k}.`,
    id: (k) => `Dan satu ${k} lagi.`,
  },
  4: {
    en: (k) => `This colour still has a second ${k}.`,
    id: (k) => `Warna ini masih punya ${k} kedua.`,
  },
  5: {
    en: (k) => `That is this colour's second and last ${k}.`,
    id: (k) => `Itu ${k} kedua dan terakhir milik warna ini.`,
  },
  6: {
    en: (k) => `The cube of this colour is used up, but a ${k} can carry too.`,
    id: (k) => `Kubus warna ini sudah habis, tapi ${k} juga bisa memikul.`,
  },
  7: {
    en: (k) => `Both cubes of this colour are used up, so lay its ${k}.`,
    id: (k) => `Kedua kubus warna ini sudah habis, jadi susun ${k}nya.`,
  },
}

export function buildBlockStack24G1Steps(lang: Lang): BlockStack24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const hueWord = (hue: BlockHue) => HUE_NAME(hue, lang)
  const scarce = hueWord(SCARCEST)

  const steps: BlockStack24Step[] = [
    {
      // Beat 1 — the rule: a sphere carries nothing, so it can only be the top.
      phase: 'rule',
      stackHeight: 0,
      running: 0,
      laid: null,
      hue: null,
      hold: 2400,
      result: false,
      caption: t(
        'A block may sit on a cube or a cylinder, but nothing may sit on a sphere. So a sphere can only be the very top.',
        'Balok boleh diletakkan di atas kubus atau tabung, tapi tidak ada yang boleh di atas bola. Jadi bola hanya bisa jadi puncak.',
      ),
    },
    {
      // Beat 2 — the cycle is by COLOUR: the colour is forced, the shape is free.
      phase: 'order',
      stackHeight: 0,
      running: 0,
      laid: null,
      hue: null,
      hold: 2600,
      result: false,
      caption: t(
        `The blocks must be taken in colour order: ${ORDER.map(hueWord).join(', ')}, ${ORDER.map(hueWord).join(', ')}, and so on. Each turn the colour is fixed; only the shape is ours to pick.`,
        `Balok harus diambil menurut urutan warna: ${ORDER.map(hueWord).join(', ')}, ${ORDER.map(hueWord).join(', ')}, dan seterusnya. Tiap putaran warnanya sudah ditentukan; hanya bentuknya yang kita pilih.`,
      ),
    },
    {
      // Beat 3 — count each colour's carriers. The scarcest one will cap us.
      phase: 'stock',
      stackHeight: 0,
      running: 0,
      laid: null,
      hue: null,
      hold: 2600,
      result: false,
      caption: t(
        `Count the blocks that can carry in each colour: ${ORDER.map((h) => `${hueWord(h)} ${CARRIERS[h]}`).join(', ')}. ${capitalise(scarce)} has the fewest.`,
        `Hitung balok yang bisa memikul di tiap warna: ${ORDER.map((h) => `${hueWord(h)} ${CARRIERS[h]}`).join(', ')}. ${capitalise(scarce)} paling sedikit.`,
      ),
    },
  ]

  // Beats 4..10 — lay one carrying block per turn, colour forced by the cycle.
  for (let turn = 1; turn <= CARRY_TURNS; turn++) {
    const place = TOWER[turn - 1]
    const kind = KIND_NAME(place.kind, lang)
    const reason = CARRY_REASON[turn]
    steps.push({
      phase: 'build',
      stackHeight: turn,
      running: turn,
      laid: place.kind,
      hue: place.hue,
      hold: 1700,
      result: false,
      caption: t(
        `Turn ${turn} is ${hueWord(place.hue)}. ${reason.en(kind)} That makes ${turn} block${turn === 1 ? '' : 's'}.`,
        `Putaran ${turn} warna ${hueWord(place.hue)}. ${reason.id(kind)} Sekarang ${turn} balok.`,
      ),
    })
  }

  // Beat 11 — the cap is FORCED: the scarcest colour's turn comes round again
  // with no carrier left, so this block has to be one of its spheres.
  const cap = TOWER[ANSWER - 1]
  steps.push({
    phase: 'forced',
    stackHeight: ANSWER,
    running: ANSWER,
    laid: cap.kind,
    hue: cap.hue,
    hold: 2600,
    result: false,
    caption: t(
      `Turn ${ANSWER} is ${hueWord(cap.hue)} again. ${capitalise(hueWord(cap.hue))} plays on turns ${SCARCEST_TURNS.join(', ')}, and its ${CARRIERS[SCARCEST]} carrying blocks are already used. So block ${ANSWER} has to be a ${hueWord(cap.hue)} ${KIND_NAME(cap.kind, lang)}.`,
      `Putaran ${ANSWER} warna ${hueWord(cap.hue)} lagi. ${capitalise(hueWord(cap.hue))} dapat putaran ${SCARCEST_TURNS.join(', ')}, dan ${CARRIERS[SCARCEST]} balok pemikulnya sudah terpakai. Jadi balok ke-${ANSWER} harus ${KIND_NAME(cap.kind, lang)} ${hueWord(cap.hue)}.`,
    ),
  })

  // Beat 12 (result) — nothing may sit on a sphere, so the tower stops there.
  steps.push({
    phase: 'result',
    stackHeight: ANSWER,
    running: ANSWER,
    laid: null,
    hue: null,
    hold: 0,
    result: true,
    caption: t(
      `Nothing may sit on a sphere, so the tower stops here. At most ${ANSWER} blocks.`,
      `Tidak ada yang boleh di atas bola, jadi menara berhenti di sini. Paling banyak ${ANSWER} balok.`,
    ),
  })

  return {
    answer: ANSWER,
    order: ORDER,
    carriers: CARRIERS,
    scarcest: SCARCEST,
    scarcestTurns: SCARCEST_TURNS,
    steps,
    finalIndex: steps.length - 1,
  }
}
