import type { Breakdown, BreakdownHighlight } from '../types.js'
import { buildChoices, DAYS_EN, DAYS_ID, dayIndex, type Params } from './index.js'

// Authored decomposition of a calendar-day-reasoning problem: given a starting
// day and a number of days ahead, use the remainder of division by 7 to find
// the day of the week. Each highlighted phrase MUST be a substring of the
// rendered body in that language.
export function buildCalendarBreakdown(params: Params): Breakdown {
  const startDayEn = DAYS_EN[params.startDay]
  const startDayId = DAYS_ID[params.startDay]
  const answerIdx = dayIndex(params)
  const answerDayEn = DAYS_EN[answerIdx]
  const remainder = params.delta % 7
  const { answerLabel } = buildChoices(params)

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: startDayEn,
      phrase_id: startDayId,
      note_en: `Today is ${startDayEn} — the day you start counting from.`,
      note_id: `Hari ini ${startDayId} — hari mulai menghitung.`,
    },
    {
      category: 'condition',
      phrase_en: `${params.delta} days`,
      phrase_id: `${params.delta} hari`,
      note_en: `You need to count ${params.delta} days ahead.`,
      note_id: `Kamu perlu menghitung maju ${params.delta} hari.`,
    },
    {
      category: 'question',
      phrase_en: 'What day',
      phrase_id: 'Hari apa',
      note_en: 'Find the day of the week that many days later.',
      note_id: 'Cari hari dalam seminggu setelah sekian hari.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Start day', label_id: 'Hari mulai', value: startDayEn },
      { label_en: 'Days ahead', label_id: 'Hari ke depan', value: String(params.delta) },
      { label_en: 'Remainder ÷ 7', label_id: 'Sisa ÷ 7', value: String(remainder) },
      { label_en: 'Answer', label_id: 'Jawaban', value: answerDayEn },
    ],

    strategy: {
      conceptSlug: 'calendar-day-reasoning',
      name_en: 'Divide by 7, use the remainder',
      name_id: 'Bagi 7, pakai sisanya',
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
