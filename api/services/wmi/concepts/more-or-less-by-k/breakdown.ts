import type { Breakdown, BreakdownHighlight } from '../types.js'
import { result, type Params } from './index.js'

// Authored decomposition of a more-or-less-by-k problem: a number is k MORE
// (add) or k LESS (subtract) than a base number x; find that number. The
// learner-facing part is a set of color-coded, clickable highlights over the
// problem text. Each phrase MUST be an exact substring of the DISPLAY body
// (after stripSectionLabels removes "Find:" / "Cari:"). There is no glossary
// markup, so the display body equals the rendered body with the label dropped.
export function buildMoreOrLessByKBreakdown(params: Params): Breakdown {
  const { x, k, dir } = params
  const ans = result(params)
  const more = dir === 'more'
  const word = more ? 'more than' : 'less than'
  const wordId = more ? 'lebih dari' : 'kurang dari'
  const op = more ? '+' : '−'
  const opWord = more ? 'add' : 'subtract'
  const opWordId = more ? 'tambah' : 'kurangi'
  // The opposite (wrong) operation a learner is tempted into.
  const wrong = more ? x - k : x + k
  const wrongOp = more ? '−' : '+'

  const highlights: BreakdownHighlight[] = [
    // fact — the base number we start from
    {
      category: 'fact',
      phrase_en: String(x),
      phrase_id: String(x),
      note_en: `The number we compare to — start here (${x}).`,
      note_id: `Bilangan pembanding — mulai dari sini (${x}).`,
    },
    // fact — the gap k
    {
      category: 'fact',
      phrase_en: String(k),
      phrase_id: String(k),
      note_en: `The gap — how far away the mystery number is (${k}).`,
      note_id: `Selisihnya — sejauh apa bilangan misteri itu (${k}).`,
    },
    // condition — the direction word that decides add vs subtract
    {
      category: 'condition',
      phrase_en: word,
      phrase_id: wordId,
      note_en: `"${word}" means ${opWord} ${k} to ${x}.`,
      note_id: `"${wordId}" berarti ${opWordId} ${k} pada ${x}.`,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'What is that number?',
      phrase_id: 'Bilangan apakah itu?',
      note_en: `${x} ${op} ${k} = ${ans}.`,
      note_id: `${x} ${op} ${k} = ${ans}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Base number', label_id: 'Bilangan awal', value: String(x) },
      { label_en: 'Gap', label_id: 'Selisih', value: String(k) },
      { label_en: 'Direction', label_id: 'Arah', value: more ? 'more (+)' : 'less (−)' },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(ans) },
    ],

    strategy: {
      conceptSlug: 'more-or-less-by-k',
      name_en: more ? 'Add the gap' : 'Subtract the gap',
      name_id: more ? 'Tambahkan selisih' : 'Kurangkan selisih',
    },

    // Tempting wrong answer: doing the OPPOSITE operation — the word "${word}"
    // flips which way to go, and learners often run it backwards. Only a real
    // distractor when it stays non-negative (the "more" reversal can underflow
    // below 0, which no child would write).
    trap:
      wrong >= 0
        ? {
            wrong: String(wrong),
            why_en: `${x} ${wrongOp} ${k} = ${wrong} goes the wrong way — "${word}" means ${opWord}, so it is ${x} ${op} ${k} = ${ans}.`,
            why_id: `${x} ${wrongOp} ${k} = ${wrong} salah arah — "${wordId}" berarti ${opWordId}, jadi ${x} ${op} ${k} = ${ans}.`,
          }
        : null,

    answer: {
      form: 'number',
      unit: null,
      value: String(ans),
    },

    vocab: [],
  }
}
