import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a pattern-next problem.
// Three modes share the same Breakdown shape; each builds its own highlights,
// quantities, and strategy appropriate to the pattern type.
// Each phrase_* MUST be an exact substring of the rendered body.

/** Duplicate of the sequence builder in index.ts — kept local to avoid a circular dep. */
function buildSequence(params: Params): { shown: number[]; correct: number } {
  if (params.mode === 'arithmetic') {
    const { start, step } = params
    const shown = [0, 1, 2].map((i) => start + i * step)
    return { shown, correct: start + 3 * step }
  }
  if (params.mode === 'second-diff') {
    const { start, diff0, diffStep } = params
    const gaps = [0, 1, 2, 3].map((i) => diff0 + i * diffStep)
    const shown: number[] = [start]
    for (let i = 0; i < 3; i++) shown.push(shown[i] + gaps[i])
    const correct = shown[3] + gaps[3]
    return { shown, correct }
  }
  // alt-rule
  const { start, addK, mulK } = params
  const shown: number[] = [start]
  for (let i = 0; i < 3; i++) {
    const prev = shown[i]
    shown.push(i % 2 === 0 ? prev * mulK : prev + addK)
  }
  return { shown, correct: shown[3] + addK }
}

function choiceLabel(correct: number, shown: number[], params: Params): string {
  let distractors: number[]
  if (params.mode === 'arithmetic') {
    distractors = [correct - 1, correct + 1, correct + params.step + 1].filter(
      (v) => v !== correct && v > 0,
    )
  } else if (params.mode === 'second-diff') {
    const lastGap = params.diff0 + 2 * params.diffStep
    const wrongFlat = shown[3] + lastGap
    const wrongSmall = shown[3] + params.diff0
    distractors = [wrongFlat, wrongSmall, correct - 1].filter(
      (v) => v !== correct && v > 0,
    )
  } else {
    const wrongMul = shown[3] * params.mulK
    distractors = [wrongMul, correct - 1, correct + 1].filter(
      (v) => v !== correct && v > 0,
    )
  }
  const labels = ['A', 'B', 'C', 'D'] as const
  const values = [correct, ...distractors].slice(0, 4)
  while (values.length < 4) values.push(values[values.length - 1] + 1)
  return labels[values.indexOf(correct)]
}

export function buildPatternNextBreakdown(params: Params): Breakdown {
  const { shown, correct } = buildSequence(params)
  const answerLabel = choiceLabel(correct, shown, params)

  let highlights: BreakdownHighlight[]
  let strategy: Breakdown['strategy']
  let quantities: Breakdown['quantities']
  let trap: Breakdown['trap']

  if (params.mode === 'arithmetic') {
    highlights = [
      {
        category: 'fact',
        phrase_en: String(shown[0]),
        phrase_id: String(shown[0]),
        note_en: `The sequence starts at ${shown[0]}.`,
        note_id: `Barisan dimulai dari ${shown[0]}.`,
      },
      {
        category: 'fact',
        phrase_en: String(shown[1]),
        phrase_id: String(shown[1]),
        note_en: `${shown[0]} jumps to ${shown[1]} — that is +${params.step}.`,
        note_id: `${shown[0]} loncat ke ${shown[1]} — itu +${params.step}.`,
      },
      {
        category: 'fact',
        phrase_en: String(shown[2]),
        phrase_id: String(shown[2]),
        note_en: `${shown[1]} jumps to ${shown[2]} — again +${params.step}.`,
        note_id: `${shown[1]} loncat ke ${shown[2]} — lagi-lagi +${params.step}.`,
      },
      {
        category: 'question',
        phrase_en: 'What number comes next in the sequence?',
        phrase_id: 'Angka berapa yang muncul berikutnya dalam barisan ini?',
        note_en: `Add the same jump once more: ${shown[2]} + ${params.step} = ${correct}.`,
        note_id: `Tambahkan loncatan yang sama sekali lagi: ${shown[2]} + ${params.step} = ${correct}.`,
      },
    ]
    strategy = {
      conceptSlug: 'pattern-next',
      name_en: 'Find the step',
      name_id: 'Cari pola loncatan',
    }
    quantities = [
      { label_en: 'Sequence', label_id: 'Barisan', value: shown.join(', ') },
      { label_en: 'Step', label_id: 'Loncatan', value: String(params.step) },
      { label_en: 'Next number', label_id: 'Angka berikutnya', value: String(correct) },
    ]
    trap = null
  } else if (params.mode === 'second-diff') {
    const gaps = [0, 1, 2, 3].map((i) => params.diff0 + i * params.diffStep)
    highlights = [
      {
        category: 'fact',
        phrase_en: String(shown[0]),
        phrase_id: String(shown[0]),
        note_en: `First term: ${shown[0]}.`,
        note_id: `Suku pertama: ${shown[0]}.`,
      },
      {
        category: 'fact',
        phrase_en: String(shown[1]),
        phrase_id: String(shown[1]),
        note_en: `Gap: ${shown[1]} − ${shown[0]} = ${gaps[0]}.`,
        note_id: `Selisih: ${shown[1]} − ${shown[0]} = ${gaps[0]}.`,
      },
      {
        category: 'fact',
        phrase_en: String(shown[2]),
        phrase_id: String(shown[2]),
        note_en: `Gap: ${shown[2]} − ${shown[1]} = ${gaps[1]}. The gap grew by ${params.diffStep}.`,
        note_id: `Selisih: ${shown[2]} − ${shown[1]} = ${gaps[1]}. Selisihnya bertambah ${params.diffStep}.`,
      },
      {
        category: 'fact',
        phrase_en: String(shown[3]),
        phrase_id: String(shown[3]),
        note_en: `Gap: ${shown[3]} − ${shown[2]} = ${gaps[2]}. Pattern confirmed: each gap grows by ${params.diffStep}.`,
        note_id: `Selisih: ${shown[3]} − ${shown[2]} = ${gaps[2]}. Pola terkonfirmasi: setiap selisih bertambah ${params.diffStep}.`,
      },
      {
        category: 'question',
        phrase_en: 'What number comes next in the sequence?',
        phrase_id: 'Angka berapa yang muncul berikutnya dalam barisan ini?',
        note_en: `Next gap = ${gaps[2]} + ${params.diffStep} = ${gaps[3]}. Answer: ${shown[3]} + ${gaps[3]} = ${correct}.`,
        note_id: `Selisih berikutnya = ${gaps[2]} + ${params.diffStep} = ${gaps[3]}. Jawaban: ${shown[3]} + ${gaps[3]} = ${correct}.`,
      },
    ]
    strategy = {
      conceptSlug: 'pattern-next',
      name_en: 'Growing gaps (second difference)',
      name_id: 'Selisih yang bertumbuh (beda kedua)',
    }
    quantities = [
      { label_en: 'Sequence', label_id: 'Barisan', value: shown.join(', ') },
      { label_en: 'Gaps', label_id: 'Selisih', value: gaps.slice(0, 3).join(', ') },
      { label_en: 'Gap growth', label_id: 'Pertumbuhan selisih', value: String(params.diffStep) },
      { label_en: 'Next number', label_id: 'Angka berikutnya', value: String(correct) },
    ]
    trap = {
      wrong: String(shown[3] + gaps[2]),
      why_en: `Using the last gap (${gaps[2]}) again — but the gaps themselves grow by ${params.diffStep} each time.`,
      why_id: `Memakai selisih terakhir (${gaps[2]}) lagi — padahal selisihnya bertambah ${params.diffStep} setiap kali.`,
    }
  } else {
    // alt-rule
    highlights = [
      {
        category: 'fact',
        phrase_en: String(shown[0]),
        phrase_id: String(shown[0]),
        note_en: `First term: ${shown[0]}.`,
        note_id: `Suku pertama: ${shown[0]}.`,
      },
      {
        category: 'fact',
        phrase_en: String(shown[1]),
        phrase_id: String(shown[1]),
        note_en: `Step 1: ${shown[0]} × ${params.mulK} = ${shown[1]}.`,
        note_id: `Langkah 1: ${shown[0]} × ${params.mulK} = ${shown[1]}.`,
      },
      {
        category: 'fact',
        phrase_en: String(shown[2]),
        phrase_id: String(shown[2]),
        note_en: `Step 2: ${shown[1]} + ${params.addK} = ${shown[2]}.`,
        note_id: `Langkah 2: ${shown[1]} + ${params.addK} = ${shown[2]}.`,
      },
      {
        category: 'fact',
        phrase_en: String(shown[3]),
        phrase_id: String(shown[3]),
        note_en: `Step 3: ${shown[2]} × ${params.mulK} = ${shown[3]}.`,
        note_id: `Langkah 3: ${shown[2]} × ${params.mulK} = ${shown[3]}.`,
      },
      {
        category: 'question',
        phrase_en: 'What number comes next in the sequence?',
        phrase_id: 'Angka berapa yang muncul berikutnya dalam barisan ini?',
        note_en: `Step 4 uses +${params.addK}: ${shown[3]} + ${params.addK} = ${correct}.`,
        note_id: `Langkah 4 menggunakan +${params.addK}: ${shown[3]} + ${params.addK} = ${correct}.`,
      },
    ]
    strategy = {
      conceptSlug: 'pattern-next',
      name_en: 'Alternating rules (×, +, ×, +, …)',
      name_id: 'Aturan berselang-seling (×, +, ×, +, …)',
    }
    quantities = [
      { label_en: 'Sequence', label_id: 'Barisan', value: shown.join(', ') },
      { label_en: 'Rule', label_id: 'Aturan', value: `×${params.mulK}, +${params.addK}, ×${params.mulK}, +${params.addK}, …` },
      { label_en: 'Next number', label_id: 'Angka berikutnya', value: String(correct) },
    ]
    trap = {
      wrong: String(shown[3] * params.mulK),
      why_en: `Applying ×${params.mulK} again — but step 4 alternates to +${params.addK}.`,
      why_id: `Menerapkan ×${params.mulK} lagi — padahal langkah 4 berganti ke +${params.addK}.`,
    }
  }

  return {
    needsVisual: false,
    highlights,
    quantities,
    strategy,
    trap,
    answer: {
      form: 'choice',
      unit: null,
      value: String(answerLabel),
    },
    vocab: [],
  }
}
