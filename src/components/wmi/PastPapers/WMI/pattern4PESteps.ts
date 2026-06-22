import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { CYCLE, TOY_EMOJI, OPTION_PAIRS, ANSWER_LABEL, SHOWN_COUNT } from './Pattern4PEIllustration'
import type { Toy } from './Pattern4PEIllustration'

// Storyboard for IKMC-20-PE-Q4 — magician hat toy sequence.
// Five beats:
//   1. Introduce: "Toys always repeat in the same order of 5."
//   2. Show the cycle bracket under slots 0–4: "The repeating cycle is 🐭🐌🐦🐦🐸"
//   3. Highlight last shown toy (slot 10, position 1 = mouse) + fill slot 11 with snail
//   4. Fill slot 12 with canary
//   5. Highlight option E as the answer

// Compute the next two toys from SHOWN_COUNT
const _next1: Toy = CYCLE[SHOWN_COUNT % CYCLE.length]       // position (11 % 5 = 1) → index 1 = snail
const _next2: Toy = CYCLE[(SHOWN_COUNT + 1) % CYCLE.length] // position (12 % 5 = 2) → index 2 = canary

export interface P4PEStep {
  /** Show the repeating-cycle bracket under slots 0–4. */
  showCycleBracket: boolean
  /** 0-indexed slot indices in the 13-slot row that are highlighted. */
  highlightSlots: number[]
  /** Toy to fill into slot 11 (first "?" slot), or null if not yet revealed. */
  fillSlot11: Toy | null
  /** Toy to fill into slot 12 (second "?" slot), or null if not yet revealed. */
  fillSlot12: Toy | null
  /** Highlight option E as the correct answer. */
  showOption: boolean
  caption: string
  /** Hold duration in ms (0 = final beat, stays). */
  hold: number
  result: boolean
}

export interface P4PEStoryboard {
  steps: P4PEStep[]
  finalIndex: number
}

export function buildPattern4PESteps(lang: Lang): P4PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const cycleStr = CYCLE.map((toy) => TOY_EMOJI[toy]).join(' ')
  const next1Emoji = TOY_EMOJI[_next1]
  const next2Emoji = TOY_EMOJI[_next2]
  const pairStr = `${next1Emoji} ${next2Emoji}`
  const optPair = OPTION_PAIRS[ANSWER_LABEL]
  const optStr = `${TOY_EMOJI[optPair[0]]} ${TOY_EMOJI[optPair[1]]}`

  const steps: P4PEStep[] = [
    // Beat 1: introduce the repeating pattern concept
    {
      showCycleBracket: false,
      highlightSlots: [],
      fillSlot11: null,
      fillSlot12: null,
      showOption: false,
      hold: 2200,
      result: false,
      caption: t(
        `The toys always come out in the same order of 5: ${cycleStr}.`,
        `Mainan selalu keluar dalam urutan yang sama, 5 mainan berulang: ${cycleStr}.`,
      ),
    },
    // Beat 2: show the cycle bracket under the first 5 slots
    {
      showCycleBracket: true,
      highlightSlots: [0, 1, 2, 3, 4],
      fillSlot11: null,
      fillSlot12: null,
      showOption: false,
      hold: 2500,
      result: false,
      caption: t(
        `So the repeating cycle is: ${cycleStr}, then the same 5 again — forever.`,
        `Jadi pola berulangnya: ${cycleStr}, lalu 5 mainan yang sama lagi — terus berulang.`,
      ),
    },
    // Beat 3: 11 toys already shown; last is mouse (position 1 in cycle), next = position 2 = snail
    {
      showCycleBracket: true,
      highlightSlots: [SHOWN_COUNT - 1],
      fillSlot11: _next1,
      fillSlot12: null,
      showOption: false,
      hold: 2600,
      result: false,
      caption: t(
        `After ${SHOWN_COUNT} toys, the last one is a mouse (cycle position 1). Next = position 2 = ${next1Emoji}.`,
        `Setelah ${SHOWN_COUNT} mainan, yang terakhir adalah tikus (posisi ke-1 dalam pola). Berikutnya = posisi ke-2 = ${next1Emoji}.`,
      ),
    },
    // Beat 4: then position 3 = canary
    {
      showCycleBracket: true,
      highlightSlots: [SHOWN_COUNT - 1, SHOWN_COUNT],
      fillSlot11: _next1,
      fillSlot12: _next2,
      showOption: false,
      hold: 2400,
      result: false,
      caption: t(
        `Then position 3 of the cycle = ${next2Emoji}.`,
        `Lalu posisi ke-3 dalam pola = ${next2Emoji}.`,
      ),
    },
    // Beat 5: answer revealed
    {
      showCycleBracket: true,
      highlightSlots: [SHOWN_COUNT, SHOWN_COUNT + 1],
      fillSlot11: _next1,
      fillSlot12: _next2,
      showOption: true,
      hold: 0,
      result: true,
      caption: t(
        `The next two toys are ${pairStr} — that's answer (${ANSWER_LABEL}): ${optStr}!`,
        `Dua mainan berikutnya adalah ${pairStr} — itu pilihan (${ANSWER_LABEL}): ${optStr}!`,
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
