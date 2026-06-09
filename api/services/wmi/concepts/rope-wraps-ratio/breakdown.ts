import type { Breakdown, BreakdownHighlight } from '../types.js'
import { answer as answerValue, type Params } from './index.js'

// Authored decomposition of a rope-wraps-ratio problem: one rope wraps a thick
// pillar A and a thin pillar B, keeping a fixed ratio aWraps : bWraps. A longer
// rope wraps pillar B bSecond times — find how many times it wraps pillar A.
// Each highlight phrase MUST be an exact substring of the DISPLAY body (after
// stripSectionLabels removes "Find:" / "Cari:"; this concept has no [[glossary]]
// markup), so highlight the plain rope/wrap wording exactly as the kid sees it.
export function buildRopeWrapsRatioBreakdown(params: Params): Breakdown {
  const ans = answerValue(params)
  const scale = params.bSecond / params.bWraps

  const highlights: BreakdownHighlight[] = [
    // fact — the given baseline: the same rope wraps A aWraps times and B bWraps times.
    {
      category: 'fact',
      phrase_en: `wraps pillar A ${params.aWraps} times, or pillar B ${params.bWraps} times`,
      phrase_id: `melilit tiang A ${params.aWraps} kali, atau tiang B ${params.bWraps} kali`,
      note_en: `Same rope: A : B wraps stay ${params.aWraps} : ${params.bWraps}.`,
      note_id: `Tali sama: lilitan A : B tetap ${params.aWraps} : ${params.bWraps}.`,
    },
    // condition — the per-wrap relationship for the longer rope: it wraps B bSecond times.
    {
      category: 'condition',
      phrase_en: `A longer rope wraps pillar B ${params.bSecond} times`,
      phrase_id: `Tali yang lebih panjang melilit tiang B ${params.bSecond} kali`,
      note_en: `B grew ${params.bWraps} → ${params.bSecond}, that is ${scale}× more.`,
      note_id: `B naik ${params.bWraps} → ${params.bSecond}, jadi ${scale}× lipat.`,
    },
    // question — the unknown: how many times the longer rope wraps pillar A.
    {
      category: 'question',
      phrase_en: 'How many times does the longer rope wrap pillar A?',
      phrase_id: 'Berapa kali tali yang lebih panjang melilit tiang A?',
      note_en: `A grows the same way: ${params.aWraps} × ${scale} = ${ans}.`,
      note_id: `A naik dengan cara yang sama: ${params.aWraps} × ${scale} = ${ans}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,
    quantities: [
      { label_en: 'Ratio A : B', label_id: 'Rasio A : B', value: `${params.aWraps} : ${params.bWraps}` },
      { label_en: 'Longer rope on B', label_id: 'Tali panjang di B', value: String(params.bSecond) },
      { label_en: 'Longer rope on A', label_id: 'Tali panjang di A', value: String(ans) },
    ],
    strategy: {
      conceptSlug: 'rope-wraps-ratio',
      name_en: 'Scale both wraps by the same ratio',
      name_id: 'Kalikan kedua lilitan dengan rasio yang sama',
    },
    trap: null,
    answer: {
      form: 'number',
      unit: null,
      value: String(ans),
    },
    vocab: [],
  }
}
