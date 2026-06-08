import type { Breakdown, BreakdownHighlight } from '../types.js'
import { rectangleCount, type Params } from './index.js'

// Authored decomposition of a count-rectangles-grid problem: count every square
// of every size inside a cols x rows grid — the unit 1x1 cells AND the larger
// squares made by combining cells. Figure-heavy: the drawn grid carries the
// shape, the stem holds only the grid size, so we highlight the words the kid
// actually sees.
// Display body (after stripSectionLabels drops the "Find:" / "Cari:" label and
// the blank line collapses to a single space):
//   EN: "The grid below has C columns and R rows. How many squares of any size
//        are in the grid?"
//   ID: "Kisi di bawah memiliki C kolom dan R baris. Ada berapa persegi dari
//        semua ukuran dalam kisi tersebut?"
// Each highlight phrase MUST be an exact substring of that display body.
export function buildCountRectanglesGridBreakdown(params: Params): Breakdown {
  const { cols, rows } = params
  const total = rectangleCount(params)
  const maxSize = Math.min(cols, rows)
  const unitCount = cols * rows

  // Exact substring of the rendered body (mirror index.ts pluralization).
  const sizePhraseEn = `${cols} column${cols > 1 ? 's' : ''} and ${rows} row${rows > 1 ? 's' : ''}`
  const sizePhraseId = `${cols} kolom dan ${rows} baris`

  const highlights: BreakdownHighlight[] = [
    // question — what to find: how many squares
    {
      category: 'question',
      phrase_en: 'How many squares',
      phrase_id: 'Ada berapa persegi',
      note_en: 'Find the total number of squares in the grid.',
      note_id: 'Cari jumlah seluruh persegi dalam kisi.',
    },
    // condition — count EVERY size, not just the small cells
    {
      category: 'condition',
      phrase_en: 'of any size',
      phrase_id: 'dari semua ukuran',
      note_en: 'Count small 1x1 squares and bigger squares made of several cells.',
      note_id: 'Hitung persegi kecil 1x1 dan persegi besar dari beberapa sel.',
    },
    // fact — the grid size tells you how many cells to start from
    {
      category: 'fact',
      phrase_en: sizePhraseEn,
      phrase_id: sizePhraseId,
      note_en: `The grid is ${cols} by ${rows}, so it has ${unitCount} small cells.`,
      note_id: `Kisi ${cols} kali ${rows}, jadi ada ${unitCount} sel kecil.`,
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Columns', label_id: 'Kolom', value: String(cols) },
      { label_en: 'Rows', label_id: 'Baris', value: String(rows) },
      { label_en: 'Largest square', label_id: 'Persegi terbesar', value: `${maxSize}x${maxSize}` },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(total) },
    ],

    strategy: {
      conceptSlug: 'count-rectangles-grid',
      name_en: 'Count squares by size, then add',
      name_id: 'Hitung persegi per ukuran, lalu jumlahkan',
    },

    // The trap only exists when a square larger than 1x1 can fit; with a single
    // row (maxSize === 1) the unit count IS the answer, so there is no trap.
    trap:
      maxSize > 1
        ? {
            wrong: String(unitCount),
            why_en: `${unitCount} counts only the 1x1 cells and misses the bigger squares; the total is ${total}.`,
            why_id: `${unitCount} hanya menghitung sel 1x1 dan melewatkan persegi besar; totalnya ${total}.`,
          }
        : null,

    answer: {
      form: 'number',
      unit: null,
      value: String(total),
    },

    vocab: [],
  }
}
