/**
 * blockPack22G1Steps — WMI-22F1A-Q8 (Grade 1) storyboard builder.
 *
 * Problem: "At most, how many 3 × 1 blocks can be cut from the model below?"
 * The model is a solid built from unit cubes. Each block is a straight 1×1×3
 * piece, so it uses exactly 3 cubes. The most blocks you can cut is therefore
 * bounded by floor(N / 3), where N = total cubes — and the illustrator's PACKING
 * shows that the bound is actually reached, so the answer is floor(N / 3).
 *
 * Method the animation must SHOW (Grade-1 concrete):
 *   1. Look at the whole model and count the cubes (N).
 *   2. Each block needs 3 cubes, so think "N ÷ 3" — that is the most we can hope
 *      for.
 *   3. Now actually cut the blocks, one at a time, keeping a running count
 *      1, 2, 3, … and colouring the cubes that are used.
 *   4. When every cube is used up, count how many blocks we made — it matches
 *      N ÷ 3, so that is the answer.
 *
 * Pure & deterministic — no Math.random, no Date. The cube count and the block
 * count are DERIVED from the illustrator's CUBES / PACKING arrays, so the
 * captions and the floor(N/3) bound can never drift from the figure.
 */

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { CUBES, PACKING } from './BlockPack22G1Illustration'

export type BlockPackPhase = 'model' | 'bound' | 'place' | 'result'

export interface BlockPackStep {
  phase: BlockPackPhase
  /** How many blocks are coloured / placed on this beat (drives CubeModel showBlocks). */
  showBlocks: number
  /** The running block count to display in the counter chip (0 = none yet). */
  count: number
  caption: string
  hold: number
  result: boolean
}

export interface BlockPackStoryboard {
  /** Total cubes in the model (N). */
  cubeCount: number
  /** Total blocks the packing fits (= answer = floor(N / 3)). */
  blockCount: number
  /** floor(N / 3) — the at-most bound; equals blockCount here. */
  bound: number
  /** Localized answer string (the number of blocks). */
  answer: string
  /** Localized "cubes" / "blocks" words. */
  cubesLabel: string
  blocksLabel: string
  steps: BlockPackStep[]
  finalIndex: number
}

export function buildBlockPack22G1Steps(lang: Lang): BlockPackStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Everything is read straight from the illustrator's verified layout so the
  // counter and the "N ÷ 3" arithmetic always agree with what the figure draws.
  const cubeCount = CUBES.length
  const blockCount = PACKING.length
  const bound = Math.floor(cubeCount / 3)
  const answer = String(blockCount)

  const cubesLabel = t('cubes', 'kubus')
  const blocksLabel = t('blocks', 'balok')

  const steps: BlockPackStep[] = []

  // 1 — Show the whole model and count its cubes.
  steps.push({
    phase: 'model',
    showBlocks: 0,
    count: 0,
    hold: 2600,
    result: false,
    caption: t(
      `Here is the whole model. Count the little cubes: there are ${cubeCount} of them.`,
      `Ini seluruh modelnya. Hitung kubus-kubus kecilnya: ada ${cubeCount} kubus.`,
    ),
  })

  // 2 — A block is 3 cubes, so the most we can hope for is N ÷ 3.
  steps.push({
    phase: 'bound',
    showBlocks: 0,
    count: 0,
    hold: 2800,
    result: false,
    caption: t(
      `Each 3 × 1 block needs 3 cubes. So at most we can cut ${cubeCount} ÷ 3 = ${bound} ${blocksLabel}. Let's see if they all fit!`,
      `Setiap balok 3 × 1 perlu 3 kubus. Jadi paling banyak kita bisa potong ${cubeCount} ÷ 3 = ${bound} ${blocksLabel}. Ayo lihat apakah semuanya muat!`,
    ),
  })

  // 3 — Place the blocks one at a time, keeping a running count.
  for (let k = 1; k <= blockCount; k += 1) {
    const isLast = k === blockCount
    steps.push({
      phase: 'place',
      showBlocks: k,
      count: k,
      // The last placement lingers a touch longer so "all cubes used" reads.
      hold: isLast ? 2400 : 1500,
      result: false,
      caption: isLast
        ? t(
            `Block ${k}! That uses the last 3 cubes — every cube is now part of a block.`,
            `Balok ke-${k}! Itu memakai 3 kubus terakhir — sekarang setiap kubus jadi bagian sebuah balok.`,
          )
        : k === 1
          ? t(
              `Cut block 1: pick 3 cubes in a straight row. Count: 1.`,
              `Potong balok ke-1: ambil 3 kubus lurus berderet. Hitungan: 1.`,
            )
          : t(`Cut another straight block. Count: ${k}.`, `Potong satu balok lurus lagi. Hitungan: ${k}.`),
    })
  }

  // 4 — Result: count the blocks; it matches N ÷ 3.
  steps.push({
    phase: 'result',
    showBlocks: blockCount,
    count: blockCount,
    hold: 0,
    result: true,
    caption: t(
      `Count the blocks: ${blockCount}. And ${cubeCount} ÷ 3 = ${blockCount}, so the most is ${answer}.`,
      `Hitung baloknya: ${blockCount}. Dan ${cubeCount} ÷ 3 = ${blockCount}, jadi paling banyak ${answer}.`,
    ),
  })

  return {
    cubeCount,
    blockCount,
    bound,
    answer,
    cubesLabel,
    blocksLabel,
    steps,
    finalIndex: steps.length - 1,
  }
}
