import type { Lang } from '../concepts/explainers/makeTenSteps'
import { OPS, OUTPUT, INPUT, undoOp, type Op } from './P23G3Q23Illustration'

// WMI-23P3A-Q23 — work BACKWARDS from the output 60, undoing each operation in
// reverse (÷3→×3, −8→+8, ×4→÷4, +5→−5, ×2→÷2). Each beat lights the op being
// undone and records the value flowing INTO it, landing on the input 21 → D.
// Every number is computed from OPS / OUTPUT, never a literal.

export interface MachineStep {
  /** Op pill (index into OPS) highlighted this beat, or undefined. */
  litOp?: number
  /** Output pill text ("60"). */
  output: string
  /** Input pill text ("?" until solved, then "21"). */
  input: string
  /**
   * Value flowing OUT of each op (forward direction), shown under the pill once
   * discovered. Index i = value after op i. undefined = not yet revealed.
   */
  flowValues: ReadonlyArray<number | undefined>
  result: boolean
  caption: string
  hold: number
}

export interface MachineStoryboard {
  answer: number
  steps: MachineStep[]
  finalIndex: number
}

const inverseLabel = (op: Op): string => {
  switch (op.kind) {
    case '×':
      return `÷${op.n}`
    case '+':
      return `−${op.n}`
    case '−':
      return `+${op.n}`
    case '÷':
      return `×${op.n}`
  }
}

export function buildP23G3Q23Steps(lang: Lang): MachineStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Forward chain of values: forward[0] = input, forward[i+1] = value after op i.
  // We discover these from the output backwards.
  const afterOp: number[] = new Array(OPS.length) // afterOp[i] = value out of op i
  afterOp[OPS.length - 1] = OUTPUT
  for (let i = OPS.length - 1; i >= 1; i--) {
    afterOp[i - 1] = undoOp(afterOp[i], OPS[i])
  }
  const inputValue = undoOp(afterOp[0], OPS[0]) // = INPUT

  const steps: MachineStep[] = []
  const flow: Array<number | undefined> = new Array(OPS.length).fill(undefined)

  // Beat 0 — set the strategy.
  steps.push({
    output: String(OUTPUT),
    input: '?',
    flowValues: [...flow],
    result: false,
    hold: 2400,
    caption: t(
      `The output is ${OUTPUT}. Walk the machine backwards, undoing each step with its opposite.`,
      `Hasilnya ${OUTPUT}. Telusuri mesin mundur, batalkan tiap langkah dengan kebalikannya.`,
    ),
  })

  // Undo from the last op to the first.
  for (let i = OPS.length - 1; i >= 0; i--) {
    const op = OPS[i]
    const before = i === 0 ? inputValue : afterOp[i - 1]
    const after = afterOp[i]
    const inv = inverseLabel(op) // e.g. "÷3" is undone by "×3"; inv already the undo op label
    // The undo arithmetic, e.g. "60 × 3 = 180" (undo of ÷3).
    const undoMath = `${after} ${inv.charAt(0)} ${op.n} = ${before}`
    // Reveal the value flowing out of op i; also the value into it (= out of prev op).
    flow[i] = after
    if (i - 1 >= 0) flow[i - 1] = before
    steps.push({
      litOp: i,
      output: String(OUTPUT),
      input: '?',
      flowValues: [...flow],
      result: false,
      hold: 1700,
      caption: t(
        `Undo ${op.kind}${op.n} with ${inv}: ${undoMath}.`,
        `Batalkan ${op.kind}${op.n} dengan ${inv}: ${undoMath}.`,
      ),
    })
  }

  // Final beat — input found.
  steps.push({
    output: String(OUTPUT),
    input: String(inputValue),
    flowValues: [...flow],
    result: true,
    hold: 0,
    caption: t(
      `The input is ${inputValue} — answer D.`,
      `Inputnya ${inputValue} — jawaban D.`,
    ),
  })

  return { answer: INPUT, steps, finalIndex: steps.length - 1 }
}
