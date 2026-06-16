// Storyboard for WMI-24F1A-Q22 (2024 Grade 1 Final) — "stack as high as possible".
//
// Blocks repeat in the order  cube → cylinder → sphere → cube → cylinder → …
// Supply: 5 cubes, 4 cylinders, 3 spheres.
// RULE: a block may sit on a cube or a cylinder, but NOTHING may sit on a sphere.
//   → a sphere can only ever be the TOP of a stack (a cap that ends it).
//
// To stack as high as possible we never spend a sphere in the middle. We load
// only the two carriers, alternating cube / cylinder, until we run out:
//
//   cube, cylinder, cube, cylinder, cube, cylinder, cube, cylinder = 8 blocks.
//
// We are bounded by the 4 cylinders (the scarcer carrier): 4 cubes + 4 cylinders
// = 8. The next required carrier would have to be a cylinder we don't have, and a
// sphere would only CAP the tower (no extra height). So 8 is the tallest legal
// stack.  Answer: 8.
//
// We DEDUCE one idea per beat, never jumping to the answer:
//   Beat 1 — state the rule: nothing sits on a sphere, so a sphere ends a stack.
//   Beat 2 — strategy: use cubes & cylinders (the carriers), never a sphere
//            in the middle, and alternate them.
//   Beats 3..10 — build the tower one block at a time with a running count
//            (stackHeight = 1, 2, …, 8), each beat naming the block laid.
//   Beat 11 (result) — out of cylinders; the next block could only be a sphere
//            CAP, which adds no usable height → stop at 8.
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
  /** Supply counts (mirror the question). */
  cubes: number
  cylinders: number
  spheres: number
  steps: BlockStack24Step[]
  finalIndex: number
}

// The fixed givens of this question.
const CUBES = 5
const CYLINDERS = 4
const SPHERES = 3
const ANSWER = 8 // 4 cubes + 4 cylinders, bounded by the 4 cylinders

// The carriers alternate cube / cylinder as the tower grows.
function laidAt(height: number): BlockKind {
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
      // Beat 2 — strategy: use carriers (cube & cylinder), skip spheres, alternate.
      phase: 'plan',
      stackHeight: 0,
      running: 0,
      laid: null,
      hold: 2200,
      result: false,
      caption: t(
        'To go tall, use cubes and cylinders — never a sphere in the middle. Alternate them.',
        'Agar tinggi, pakai kubus dan tabung — jangan bola di tengah. Selang-seling.',
      ),
    },
  ]

  // Beats 3..10 — lay one carrier block per beat, counting up to ANSWER.
  for (let h = 1; h <= ANSWER; h++) {
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

  // Beat 11 (result) — out of cylinders; next could only be a sphere CAP → stop at 8.
  steps.push({
    phase: 'result',
    stackHeight: ANSWER,
    running: ANSWER,
    laid: null,
    hold: 0,
    result: true,
    caption: t(
      `Out of cylinders! The next block could only be a sphere cap — no taller. So ${ANSWER} blocks.`,
      `Tabung habis! Balok berikutnya hanya bisa bola penutup — tak lebih tinggi. Jadi ${ANSWER} balok.`,
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
