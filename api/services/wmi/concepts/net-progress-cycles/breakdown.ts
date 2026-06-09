import type { Breakdown, BreakdownHighlight } from '../types.js'
import { answer as answerValue, type Params } from './index.js'

// Authored decomposition of a net-progress-cycles problem (snail-climbs-well
// style): each round the climber goes UP some steps then slips DOWN fewer, so a
// round's NET gain is (up - down). After the rounds repeat, find the net height.
// Each highlight phrase MUST be an exact substring of the DISPLAY body — the body
// after stripSectionLabels removes "Find:" / "Cari:" — so highlight
// "up 5 steps", never "Find: ... up 5 steps". Spans must not overlap: the
// renderer consumes each match greedily and never re-matches inside it.
export function buildNetProgressCyclesBreakdown(params: Params): Breakdown {
  const net = params.up - params.down
  const ans = answerValue(params)
  // Classic tempting wrong: count only the climbs and forget the slips back down.
  const ignoreSlip = params.up * params.cycles

  const highlights: BreakdownHighlight[] = [
    // fact — the gain: how far up each round.
    {
      category: 'fact',
      phrase_en: `up ${params.up} steps`,
      phrase_id: `naik ${params.up} anak tangga`,
      note_en: `Each round the climber gains ${params.up} steps going up.`,
      note_id: `Tiap putaran anak naik ${params.up} anak tangga.`,
    },
    // fact — the slip: how far back down each round.
    {
      category: 'fact',
      phrase_en: `down ${params.down} steps`,
      phrase_id: `turun ${params.down} anak tangga`,
      note_en: `But then it slips back ${params.down} steps.`,
      note_id: `Tapi lalu melorot ${params.down} anak tangga.`,
    },
    // fact — the goal: how many rounds the up-then-down repeats.
    {
      category: 'fact',
      phrase_en: `repeats ${params.cycles} times`,
      phrase_id: `diulang ${params.cycles} kali`,
      note_en: `The same up-then-down round happens ${params.cycles} times.`,
      note_id: `Putaran naik-lalu-turun yang sama terjadi ${params.cycles} kali.`,
    },
    // condition (rule) — the net gain each round comes from "up THEN down".
    {
      category: 'condition',
      phrase_en: 'then',
      phrase_id: 'lalu',
      note_en: `Up THEN down, so each round only gains ${params.up} - ${params.down} = ${net}.`,
      note_id: `Naik LALU turun, jadi tiap putaran bertambah ${params.up} - ${params.down} = ${net}.`,
    },
    // question — what to find: the net height after all the rounds.
    {
      category: 'question',
      phrase_en: 'How many steps higher',
      phrase_id: 'lebih tinggi dari awal',
      note_en: `Find the net climb: ${net} per round × ${params.cycles} rounds.`,
      note_id: `Cari kemajuan bersih: ${net} per putaran × ${params.cycles} putaran.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Up each round', label_id: 'Naik tiap putaran', value: String(params.up) },
      { label_en: 'Down each round', label_id: 'Turun tiap putaran', value: String(params.down) },
      { label_en: 'Net per round', label_id: 'Bersih per putaran', value: String(net) },
      { label_en: 'Rounds', label_id: 'Putaran', value: String(params.cycles) },
      { label_en: 'Net height', label_id: 'Tinggi bersih', value: String(ans) },
    ],

    strategy: {
      conceptSlug: 'net-progress-cycles',
      name_en: 'net gain each round',
      name_id: 'kemajuan bersih tiap putaran',
    },

    trap: {
      wrong: String(ignoreSlip),
      why_en: `${ignoreSlip} forgets the slips — each round nets only ${net}, not ${params.up}.`,
      why_id: `${ignoreSlip} lupa pada melorotnya — tiap putaran bersihnya ${net}, bukan ${params.up}.`,
    },

    answer: {
      form: 'number',
      unit: null,
      value: String(ans),
    },

    vocab: [],
  }
}
