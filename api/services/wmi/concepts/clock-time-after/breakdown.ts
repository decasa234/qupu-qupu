import type { Breakdown, BreakdownHighlight } from '../types.js'
import { fmtTime, resultTime, type Params } from './index.js'

// Authored decomposition of a clock-time-after problem: a clock starts at one
// time, some hours and minutes pass, and the learner finds the new time.
// Strategy is to add the minutes first (carrying one hour when they reach 60),
// then add the hours (wrapping back to 1 after 12).
// Each highlight phrase MUST be an exact substring of the DISPLAY body. The body
// has no glossary markup and no section labels survive stripSectionLabels except
// "Find:" / "Cari:", which are removed — so highlight the plain words the kid
// sees (the start time, the added amounts, and the question sentence).
export function buildClockTimeAfterBreakdown(params: Params): Breakdown {
  const start = fmtTime(params.hour, params.minute)
  const r = resultTime(params)
  const result = fmtTime(r.hour, r.minute)

  const hWord = params.addHour === 1 ? 'hour' : 'hours'

  // Minute carry: when start minutes + added minutes reach 60, one hour rolls
  // over. This is the spot where kids slip.
  const rawMin = params.minute + params.addMin
  const carryHour = rawMin >= 60 ? 1 : 0
  const resultMin = rawMin % 60

  // Tempting wrong answer (only when there IS a carry): adding the hours but
  // forgetting the extra hour the minutes rolled over.
  const wrongTotal = ((params.hour % 12) + params.addHour) % 12
  const wrongHour = wrongTotal === 0 ? 12 : wrongTotal
  const wrongTime = fmtTime(wrongHour, resultMin)

  const highlights: BreakdownHighlight[] = [
    // fact — the time the clock starts at
    {
      category: 'fact',
      phrase_en: start,
      phrase_id: start,
      note_en: `The clock starts at ${start}.`,
      note_id: `Jam dimulai pada pukul ${start}.`,
    },
    // fact — the hours that pass
    {
      category: 'fact',
      phrase_en: `${params.addHour} ${hWord}`,
      phrase_id: `${params.addHour} jam`,
      note_en: `Add ${params.addHour} ${hWord} to the hour.`,
      note_id: `Tambah ${params.addHour} jam ke jamnya.`,
    },
    // fact — the minutes that pass
    {
      category: 'fact',
      phrase_en: `${params.addMin} minutes`,
      phrase_id: `${params.addMin} menit`,
      note_en: `Add ${params.addMin} minutes to the minutes.`,
      note_id: `Tambah ${params.addMin} menit ke menitnya.`,
    },
    // condition — pass first, the minutes; carry into the hour at 60
    {
      category: 'condition',
      phrase_en: 'later',
      phrase_id: 'berlalu',
      note_en: 'Time has passed, so add — do the minutes first, then the hours.',
      note_id: 'Waktu sudah berlalu, jadi tambahkan — menit dulu, baru jam.',
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'What time does the clock show now?',
      phrase_id: 'Pukul berapa jam itu sekarang?',
      note_en: `The new time is ${result}.`,
      note_id: `Waktu yang baru adalah pukul ${result}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Start time', label_id: 'Waktu mulai', value: start },
      { label_en: 'Hours added', label_id: 'Jam ditambah', value: String(params.addHour) },
      { label_en: 'Minutes added', label_id: 'Menit ditambah', value: String(params.addMin) },
      { label_en: 'Answer', label_id: 'Jawaban', value: result },
    ],

    strategy: {
      conceptSlug: 'clock-time-after',
      name_en: 'Add minutes first, carry the hour, then wrap past 12',
      name_id: 'Tambah menit dulu, simpan jamnya, lalu putar setelah 12',
    },

    // Only a genuine trap when the minutes roll over an hour and the learner
    // might forget to carry that hour.
    trap: carryHour === 1
      ? {
          wrong: wrongTime,
          why_en: `${params.minute} + ${params.addMin} = ${rawMin} reaches 60, so carry 1 hour — don't keep the old hour.`,
          why_id: `${params.minute} + ${params.addMin} = ${rawMin} mencapai 60, jadi simpan 1 jam — jangan pakai jam lama.`,
        }
      : null,

    answer: {
      form: 'number',
      unit: null,
      value: result,
    },

    vocab: [],
  }
}
