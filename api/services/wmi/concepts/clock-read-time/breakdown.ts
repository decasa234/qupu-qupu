import type { Breakdown, BreakdownHighlight } from '../types.js'
import { fmt, type Params } from './index.js'

// Authored decomposition of a clock-read-time problem: read the time shown on an
// analog clock and pick the matching choice. This is figure-heavy — the clock
// face carries the data — so the stem text is short. We highlight only the words
// the kid actually sees in the body.
// Display body (after stripSectionLabels + resolving [[analog-clock|jam analog]]):
//   EN: "The clock above shows a time. What time does the analog clock show?"
//   ID: "Jam di atas menunjukkan suatu waktu. Pukul berapa yang ditunjukkan jam analog tersebut?"
// Each highlight phrase MUST be an exact substring of that display body.
export function buildClockReadTimeBreakdown(params: Params): Breakdown {
  const correct = fmt(params.hour, params.minute)
  const minuteStr = params.minute === 0 ? '00' : String(params.minute)
  const labels = ['A', 'B', 'C', 'D'] as const
  const answerLabel = labels[params.options.indexOf(correct)]

  const highlights: BreakdownHighlight[] = [
    // fact — the figure you must read; the clock face holds the time
    {
      category: 'fact',
      phrase_en: 'analog clock',
      phrase_id: 'jam analog',
      note_en: 'Read the two hands on the clock face to find the time.',
      note_id: 'Baca dua jarum di muka jam untuk menemukan waktunya.',
    },
    // condition — the clock is showing one time you must name
    {
      category: 'condition',
      phrase_en: 'shows a time',
      phrase_id: 'menunjukkan suatu waktu',
      note_en: 'Short hand = the hour, long hand = the minutes.',
      note_id: 'Jarum pendek = jam, jarum panjang = menit.',
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'What time',
      phrase_id: 'Pukul berapa',
      note_en: `The time shown is ${correct}.`,
      note_id: `Waktu yang ditunjukkan adalah pukul ${correct}.`,
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Hour (short hand)', label_id: 'Jam (jarum pendek)', value: String(params.hour) },
      { label_en: 'Minutes (long hand)', label_id: 'Menit (jarum panjang)', value: minuteStr },
      { label_en: 'Time shown', label_id: 'Waktu ditunjukkan', value: correct },
      { label_en: 'Answer', label_id: 'Jawaban', value: answerLabel },
    ],

    strategy: {
      conceptSlug: 'clock-read-time',
      name_en: 'Read the short hand for the hour, the long hand for the minutes',
      name_id: 'Baca jarum pendek untuk jam, jarum panjang untuk menit',
    },

    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: answerLabel,
    },

    vocab: [],
  }
}
