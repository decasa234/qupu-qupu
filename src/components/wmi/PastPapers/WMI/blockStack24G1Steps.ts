// Storyboard for WMI-24F1A-Q22 (2024 Grade 1 Final) — "stack as high as possible".
//
// Blocks repeat in the order  cube → cylinder → sphere → cube → cylinder → …
// Supply (from the source scan, 12 blocks): 5 cubes, 3 cylinders, 4 spheres.
// RULE: a block may sit on a cube or a cylinder, but NOTHING may sit on a sphere.
//   → a sphere can only ever be the TOP of a stack (a cap that ends it).
//
// To stack as high as possible we never spend a sphere in the middle. We load
// the two carriers, alternating cube / cylinder, until the cylinders run out,
// then cap the tower with ONE sphere (the cap still counts as a block!):
//
//   cube, cylinder, cube, cylinder, cube, cylinder, cube  = 7 carrier blocks
//   + sphere cap                                          = 8 blocks total.
//
// We are bounded by the 3 cylinders (the scarcer carrier): 4 cubes + 3
// cylinders = 7 carriers. The next carrier would have to be a cylinder we don't
// have, so the only legal continuation is a single sphere cap — after which
// nothing may be placed. So 8 is the tallest legal stack.  Answer: 8.
//
// We DEDUCE one idea per beat, never jumping to the answer:
//   Beat 1 — state the rule: nothing sits on a sphere, so a sphere ends a stack.
//   Beat 2 — strategy: alternate the carriers (cube & cylinder), keep spheres
//            out of the middle, and save one sphere for the top.
//   Beats 3..9 — build the 7 carrier blocks one at a time with a running count
//            (stackHeight = 1..7), each beat naming the block laid.
//   Beat 10 — out of cylinders → cap with the sphere (stackHeight = 8).
//   Beat 11 (result) — nothing can sit on the sphere → stop at 8.
//
// `stackHeight` is the gate the bound primitive (BlockStack24G1) reads: it grows
// the tallest legal tower to that height (0 = pristine figure, 1..8 = building).
//
// Pure builder: (lang) => storyboard. No random / dates / state — SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type BlockStack24Phase = 'rule' | 'plan' | 'build' | 'result'

export type BlockKind = 'cube' | 'cylinder' | 'sphere'

export interface BlockStack24Step {
  phase: BlockStack24Phase
  /** How many blocks the bound BlockStack24G1 primitive should draw this beat. */
  stackHeight: number
  /** Running block count to show as a big tally (0 = don't show). */
  running: number
  /** The block kind just laid this beat (for accent colour), or null. */
  laid: BlockKind | null
  caption: string
  /** ms to linger before advancing; winner is the last beat with hold 0. */
  hold: number
  result: boolean
}

export interface BlockStack24Storyboard {
  /** Tallest legal stack — the answer. */
  answer: number
  /** Supply counts (mirror the question figure). */
  cubes: number
  cylinders: number
  spheres: number
  steps: BlockStack24Step[]
  finalIndex: number
}

// The fixed givens of this question (from the source scan).
const CUBES = 5
const CYLINDERS = 3
const SPHERES = 4
const CARRIERS = 2 * CYLINDERS + 1 // 7 — alternating C,Y,…,C is capped by the 3 cylinders
const ANSWER = CARRIERS + 1 // 8 — the 7 carriers plus one sphere cap on top

/** The block laid at tower height h (1-based): carriers alternate, 8th = cap. */
function laidAt(height: number): BlockKind {
  if (height === ANSWER) return 'sphere'
  return height % 2 === 1 ? 'cube' : 'cylinder'
}

const KIND_NAME = (kind: BlockKind, lang: Lang): string => {
  if (lang === 'id') return kind === 'cube' ? 'kubus' : kind === 'cylinder' ? 'tabung' : 'bola'
  return kind === 'cube' ? 'cube' : kind === 'cylinder' ? 'cylinder' : 'sphere'
}

export function buildBlockStack24G1Steps(lang: Lang): BlockStack24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BlockStack24Step[] = [
    {
      // Beat 1 — the rule: nothing sits on a sphere, so a sphere ends a stack.
      phase: 'rule',
      stackHeight: 0,
      running: 0,
      laid: null,
      hold: 2200,
      result: false,
      caption: t(
        'Nothing can sit on a sphere. So a sphere can only be the top — it ends a stack.',
        'Tidak ada yang bisa di atas bola. Jadi bola hanya bisa jadi puncak — ia menutup tumpukan.',
      ),
    },
    {
      // Beat 2 — strategy: alternate the carriers, save one sphere for the top.
      phase: 'plan',
      stackHeight: 0,
      running: 0,
      laid: null,
      hold: 2200,
      result: false,
      caption: t(
        'To go tall, alternate cubes and cylinders — no sphere in the middle. Save one sphere for the very top.',
        'Agar tinggi, selang-seling kubus dan tabung — jangan bola di tengah. Simpan satu bola untuk puncak.',
      ),
    },
  ]

  // Beats 3..9 — lay one carrier block per beat, counting up to the 7 carriers.
  for (let h = 1; h <= CARRIERS; h++) {
    const kind = laidAt(h)
    const name = KIND_NAME(kind, lang)
    steps.push({
      phase: 'build',
      stackHeight: h,
      running: h,
      laid: kind,
      hold: 1500,
      result: false,
      caption: t(
        `Lay a ${name}. That makes ${h} block${h === 1 ? '' : 's'}.`,
        `Susun ${name}. Sekarang ${h} balok.`,
      ),
    })
  }

  // Beat 10 — out of cylinders (only 3) → cap the tower with one sphere.
  steps.push({
    phase: 'build',
    stackHeight: ANSWER,
    running: ANSWER,
    laid: 'sphere',
    hold: 1800,
    result: false,
    caption: t(
      `Out of cylinders (only ${CYLINDERS}) — so cap the tower with a sphere. That makes ${ANSWER} blocks.`,
      `Tabung habis (hanya ${CYLINDERS}) — jadi tutup menara dengan bola. Sekarang ${ANSWER} balok.`,
    ),
  })

  // Beat 11 (result) — nothing may sit on the sphere → the tower stops at 8.
  steps.push({
    phase: 'result',
    stackHeight: ANSWER,
    running: ANSWER,
    laid: null,
    hold: 0,
    result: true,
    caption: t(
      `Nothing can sit on the sphere — the tower stops. At most ${ANSWER} blocks.`,
      `Tidak ada yang bisa di atas bola — menara berhenti. Paling banyak ${ANSWER} balok.`,
    ),
  })

  return {
    answer: ANSWER,
    cubes: CUBES,
    cylinders: CYLINDERS,
    spheres: SPHERES,
    steps,
    finalIndex: steps.length - 1,
  }
}
