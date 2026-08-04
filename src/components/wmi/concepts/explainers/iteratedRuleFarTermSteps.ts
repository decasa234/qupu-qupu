import type { Lang } from './makeTenSteps'

// Storyboard for `iterated-rule-far-term`. A rule is applied over and over, the
// list of numbers starts repeating a block, and a far-away number is read off
// with a remainder.
//
// Mirrors api/services/wmi/concepts/iterated-rule-far-term. Params arrive as
// plain JSON, so the list is rebuilt here from the same three rules. The
// repeating block is FOUND, not assumed: the run-up (opening numbers that never
// come back) is measured first, because pretending the list cycles from the
// very first number is exactly the mistake this animation exists to undo.

export type IteratedRule = 'difference-of-previous-two' | 'units-digit-of-product' | 'alternating-add-subtract'
export type IteratedAsk = 'the-term' | 'sum-of-one-cycle'

export interface IteratedRuleFarTermParams {
  rule: IteratedRule
  seedA: number
  seedB: number | null
  multiplier: number | null
  ring: number | null
  forward: number | null
  back: number | null
  targetIndex: number | null
  ask: IteratedAsk
}

export type IteratedPhase = 'list' | 'runup' | 'block' | 'divide' | 'result'

export interface IteratedBeat {
  phase: IteratedPhase
  /** How many chips of the strip are on screen. */
  visible: number
  /** Once true the run-up chips are greyed and labelled as never coming back. */
  markTail: boolean
  /** Once true the repeating block is shown as a ring. */
  showRing: boolean
  /** 1-based slots lit on the ring. */
  lit: number[]
  result: boolean
  caption: string
  hold: number
}

export interface IteratedRuleFarTermStoryboard {
  /** The opening numbers of the list, as chips. */
  strip: number[]
  tailLength: number
  cycleLength: number
  cycleTerms: number[]
  targetIndex: number | null
  slot: number | null
  answer: string
  steps: IteratedBeat[]
  finalIndex: number
}

const WALK = 200

function wrapChair(chair: number, ring: number): number {
  return (((chair - 1) % ring) + ring) % ring + 1
}

/** The list, built straight from the rule the child is given. */
function buildList(p: IteratedRuleFarTermParams, upTo: number): number[] {
  const out: number[] = []
  if (p.rule === 'difference-of-previous-two') {
    out.push(p.seedA, p.seedB ?? 0)
    while (out.length < upTo) out.push(Math.abs(out[out.length - 1] - out[out.length - 2]))
    return out.slice(0, upTo)
  }
  if (p.rule === 'units-digit-of-product') {
    let d = p.seedA
    while (out.length < upTo) {
      out.push(d)
      d = (d * (p.multiplier ?? 1)) % 10
    }
    return out
  }
  const ring = p.ring ?? 1
  let chair = p.seedA
  for (let pass = 1; out.length < upTo; pass++) {
    chair = wrapChair(chair + (pass % 2 === 1 ? (p.forward ?? 0) : -(p.back ?? 0)), ring)
    out.push(chair)
  }
  return out
}

/** Smallest block that makes the list repeat, then the earliest place it can start. */
function findCycle(list: number[]): { tailLength: number; cycleLength: number } {
  for (let len = 1; len <= 16; len++) {
    for (let tail = 0; tail <= 16 && tail + 2 * len < list.length; tail++) {
      let holds = true
      for (let i = tail; i + len < list.length; i++) {
        if (list[i] !== list[i + len]) {
          holds = false
          break
        }
      }
      if (holds) return { tailLength: tail, cycleLength: len }
    }
  }
  return { tailLength: 0, cycleLength: Math.min(list.length, 1) }
}

function ordinal(n: number): string {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  const ones = n % 10
  if (ones === 1) return `${n}st`
  if (ones === 2) return `${n}nd`
  if (ones === 3) return `${n}rd`
  return `${n}th`
}

export function buildIteratedRuleFarTermSteps(
  p: IteratedRuleFarTermParams,
  lang: Lang,
): IteratedRuleFarTermStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const list = buildList(p, WALK)
  const { tailLength, cycleLength } = findCycle(list)
  const cycleTerms = list.slice(tailLength, tailLength + cycleLength)
  const stripLength = Math.min(tailLength + 2 * cycleLength + 1, 14)
  const strip = list.slice(0, stripLength)
  const block = cycleTerms.join(', ')
  const runUp = list.slice(0, tailLength).join(', ')
  const cycleSum = cycleTerms.reduce((sum, n) => sum + n, 0)
  const allSlots = cycleTerms.map((_, i) => i + 1)

  let slot: number | null = null
  let answer = String(cycleSum)
  if (p.ask === 'the-term' && p.targetIndex !== null) {
    const remainder = (p.targetIndex - tailLength) % cycleLength
    slot = remainder === 0 ? cycleLength : remainder
    answer = String(cycleTerms[slot - 1])
  }

  const steps: IteratedBeat[] = [
    {
      phase: 'list',
      visible: strip.length,
      markTail: false,
      showRing: false,
      lit: [],
      result: false,
      caption: t('Follow the rule and write the list out.', 'Ikuti aturannya dan tulis daftarnya.'),
      hold: 1900,
    },
    {
      phase: 'runup',
      visible: strip.length,
      markTail: true,
      showRing: false,
      lit: [],
      result: false,
      caption:
        tailLength > 0
          ? t(
              `The first ${tailLength} ${tailLength === 1 ? 'number' : 'numbers'} (${runUp}) never come back.`,
              `${tailLength} bilangan pertama (${runUp}) tidak pernah kembali.`,
            )
          : t('Nothing to skip — the list repeats from the very first number.', 'Tidak ada yang dilewati — daftarnya berulang sejak bilangan pertama.'),
      hold: 2100,
    },
    {
      phase: 'block',
      visible: strip.length,
      markTail: tailLength > 0,
      showRing: true,
      lit: allSlots,
      result: false,
      caption: t(
        `${block} comes round and round — a block of ${cycleLength}, starting at the ${ordinal(tailLength + 1)} number.`,
        `${block} berputar terus — satu blok berisi ${cycleLength} bilangan, mulai dari bilangan ke-${tailLength + 1}.`,
      ),
      hold: 2300,
    },
  ]

  if (p.ask === 'the-term' && p.targetIndex !== null && slot !== null) {
    const inside = p.targetIndex - tailLength
    const quotient = Math.floor(inside / cycleLength)
    const remainder = inside % cycleLength
    steps.push({
      phase: 'divide',
      visible: strip.length,
      markTail: tailLength > 0,
      showRing: true,
      lit: [],
      result: false,
      caption:
        tailLength > 0
          ? t(
              `${p.targetIndex} − ${tailLength} = ${inside} inside the block. ${inside} ÷ ${cycleLength} = ${quotient} remainder ${remainder}.`,
              `${p.targetIndex} − ${tailLength} = ${inside} bilangan di dalam blok. ${inside} : ${cycleLength} = ${quotient} sisa ${remainder}.`,
            )
          : t(
              `No run-up to skip. ${p.targetIndex} ÷ ${cycleLength} = ${quotient} remainder ${remainder}.`,
              `Tidak ada bilangan awalan. ${p.targetIndex} : ${cycleLength} = ${quotient} sisa ${remainder}.`,
            ),
      hold: 2400,
    })
    steps.push({
      phase: 'result',
      visible: strip.length,
      markTail: tailLength > 0,
      showRing: true,
      lit: [slot],
      result: true,
      caption: t(
        `So the ${ordinal(p.targetIndex)} number is the ${ordinal(slot)} one in the block: ${answer}.`,
        `Jadi bilangan ke-${p.targetIndex} adalah bilangan ke-${slot} di dalam blok: ${answer}.`,
      ),
      hold: 2400,
    })
  } else {
    steps.push({
      phase: 'divide',
      visible: strip.length,
      markTail: tailLength > 0,
      showRing: true,
      lit: allSlots,
      result: false,
      caption:
        tailLength > 0
          ? t(
              `Add one block only — the run-up (${runUp}) is not in it.`,
              `Jumlahkan satu blok saja — bilangan awalan (${runUp}) tidak ikut.`,
            )
          : t('Add the numbers in one block.', 'Jumlahkan bilangan dalam satu blok.'),
      hold: 2200,
    })
    steps.push({
      phase: 'result',
      visible: strip.length,
      markTail: tailLength > 0,
      showRing: true,
      lit: allSlots,
      result: true,
      caption: t(
        `${cycleTerms.join(' + ')} = ${answer}.`,
        `${cycleTerms.join(' + ')} = ${answer}.`,
      ),
      hold: 2400,
    })
  }

  return {
    strip,
    tailLength,
    cycleLength,
    cycleTerms,
    targetIndex: p.targetIndex,
    slot,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
