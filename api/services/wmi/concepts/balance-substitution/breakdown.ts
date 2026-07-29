import type { Breakdown, BreakdownHighlight, BreakdownTrap } from '../types.js'
import {
  SHAPE_ID,
  askedShapeKind,
  otherShapeKind,
  questionText,
  scaleSentence,
  shapeNameEn,
  solve,
  type Params,
} from './index.js'

// Authored decomposition of a balance-substitution problem: two level scales,
// swap one group of shapes for the group that weighs the same.
//
// Display body (after stripSectionLabels drops the "Find:" / "Cari:" marker and
// whitespace collapses):
//   "Ada dua timbangan yang seimbang. Pada timbangan pertama, 1 segitiga
//    seimbang dengan 3 kubus. Pada timbangan kedua, 2 segitiga seimbang dengan
//    1 bintang. Berapa kubus yang seimbang dengan 1 bintang?"
// Every highlight phrase below is lifted verbatim from that string, so the
// substring match can never drift when params change.
export function buildBalanceSubstitutionBreakdown(params: Params): Breakdown {
  const [s1, s2] = params.scales
  const answer = solve(params)
  const asked = askedShapeKind(params)
  const other = otherShapeKind(params)
  const idAsked = SHAPE_ID[asked]
  const idOther = SHAPE_ID[other]
  const enAsked = shapeNameEn(asked, 1)
  const enOther = shapeNameEn(other, 2)

  const first_id = scaleSentence(s1, params, 'id')
  const first_en = scaleSentence(s1, params, 'en')
  const second_id = scaleSentence(s2, params, 'id')
  const second_en = scaleSentence(s2, params, 'en')

  const highlights: BreakdownHighlight[] = [
    // condition — a level beam is the whole rule of the puzzle
    {
      category: 'condition',
      phrase_en: 'Two balance scales are level',
      phrase_id: 'dua timbangan yang seimbang',
      note_en: 'Level means both sides weigh exactly the same. That lets you swap one side for the other.',
      note_id: 'Seimbang berarti kedua sisi sama berat. Jadi satu sisi boleh ditukar dengan sisi lainnya.',
    },
    // fact — scale 1: the anchor, the only place a real number of cubes appears
    {
      category: 'fact',
      phrase_en: first_en,
      phrase_id: first_id,
      note_en: 'Start here — this scale tells you the weight in cubes.',
      note_id: 'Mulai dari sini — timbangan ini memberi tahu beratnya dalam kubus.',
    },
    // fact — scale 2: the swap
    {
      category: 'fact',
      phrase_en: second_en,
      phrase_id: second_id,
      note_en: 'Now swap this group for the cubes you just found.',
      note_id: 'Sekarang tukar kelompok ini dengan kubus yang tadi kamu temukan.',
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: questionText(params, 'en'),
      phrase_id: questionText(params, 'id'),
      note_en:
        params.ask === 'value-of-one'
          ? `Count the cubes that make one ${enAsked} balance.`
          : `Count how many ${enOther} weigh the same as that group.`,
      note_id:
        params.ask === 'value-of-one'
          ? `Hitung berapa kubus yang membuat 1 ${idAsked} seimbang.`
          : `Hitung berapa ${idOther} yang beratnya sama dengan kelompok itu.`,
    },
  ]

  // The tempting wrong answer differs per ask: on 'value-of-one' a kid often
  // reports the anchor shape's weight; on 'balance-group' they count cubes
  // instead of shapes. Only emit a trap when that value really differs from the
  // answer — otherwise there is no misleading number to flag.
  let trap: BreakdownTrap | null = null
  if (params.ask === 'value-of-one') {
    const anchorWeight = params.askShape === 'A' ? params.wB : params.wA
    const anchorKindId = params.askShape === 'A' ? SHAPE_ID[params.shapeB] : SHAPE_ID[params.shapeA]
    const anchorKindEn = shapeNameEn(params.askShape === 'A' ? params.shapeB : params.shapeA, 1)
    if (anchorWeight !== answer) {
      trap = {
        wrong: String(anchorWeight),
        why_en: `${anchorWeight} is the weight of one ${anchorKindEn}, not one ${enAsked}.`,
        why_id: `${anchorWeight} itu berat 1 ${anchorKindId}, bukan 1 ${idAsked}.`,
      }
    }
  } else {
    const cubeTotal = params.askCount * (params.askShape === 'A' ? params.wA : params.wB)
    const perOne = answer / params.askCount
    if (cubeTotal !== answer) {
      trap = {
        wrong: String(cubeTotal),
        why_en: `${cubeTotal} counts cubes, not ${enOther}.`,
        why_id: `${cubeTotal} itu banyaknya kubus, bukan banyaknya ${idOther}.`,
      }
    } else if (params.askCount > 1 && perOne !== answer) {
      trap = {
        wrong: String(perOne),
        why_en: `${perOne} is enough for just one ${enAsked}, but there are ${params.askCount} ${shapeNameEn(asked, params.askCount)}.`,
        why_id: `${perOne} itu untuk 1 ${idAsked} saja, padahal ada ${params.askCount} ${idAsked}.`,
      }
    }
  }

  const quantities = [
    {
      label_en: `Cubes for one ${shapeNameEn(params.shapeA, 1)}`,
      label_id: `Kubus untuk 1 ${SHAPE_ID[params.shapeA]}`,
      value: String(params.wA),
    },
    {
      label_en: `Cubes for one ${shapeNameEn(params.shapeB, 1)}`,
      label_id: `Kubus untuk 1 ${SHAPE_ID[params.shapeB]}`,
      value: String(params.wB),
    },
  ]
  if (params.ask === 'balance-group') {
    const cubeTotal = params.askCount * (params.askShape === 'A' ? params.wA : params.wB)
    quantities.push({
      label_en: `Cubes for ${params.askCount} ${shapeNameEn(asked, params.askCount)}`,
      label_id: `Kubus untuk ${params.askCount} ${idAsked}`,
      value: String(cubeTotal),
    })
  }
  quantities.push({ label_en: 'Answer', label_id: 'Jawaban', value: String(answer) })

  return {
    needsVisual: true,
    highlights,
    quantities,

    strategy: {
      conceptSlug: 'balance-substitution',
      name_en: 'Swap for the same weight',
      name_id: 'Tukar dengan berat yang sama',
    },

    trap,

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
