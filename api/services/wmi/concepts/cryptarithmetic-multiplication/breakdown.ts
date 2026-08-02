import type { Breakdown, BreakdownHighlight, BreakdownTrap } from '../types.js'
import { answerOf, buildPuzzle, columnTrace, type Params } from './index.js'

/**
 * Authored decomposition of a missing-digit long multiplication. Letters cover
 * digits in a written `top × multiplier = product`; the child recovers them from
 * the ones column and the carries. Every `phrase_*` MUST be a substring of the
 * rendered body in that language.
 */
export function buildCryptaMulBreakdown(params: Params): Breakdown {
  const z = buildPuzzle(params)

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: z.topMask,
      phrase_id: z.topMask,
      note_en: `The number being multiplied, written as ${z.topMask}.`,
      note_id: `Bilangan yang dikalikan, ditulis ${z.topMask}.`,
    },
    {
      category: 'fact',
      phrase_en: `× ${z.multiplier}`,
      phrase_id: `× ${z.multiplier}`,
      note_en: `Every digit above gets multiplied by ${z.multiplier}.`,
      note_id: `Setiap angka di atas dikalikan ${z.multiplier}.`,
    },
    {
      category: 'fact',
      phrase_en: z.prodMask,
      phrase_id: z.prodMask,
      note_en: `The result, written as ${z.prodMask}. Its last digit comes from the ones column.`,
      note_id: `Hasilnya, ditulis ${z.prodMask}. Angka terakhirnya datang dari kolom satuan.`,
    },
    {
      category: 'condition',
      phrase_en: 'two letters may hide the same digit',
      phrase_id: 'dua huruf boleh menutupi angka yang sama',
      note_en: 'Unlike a letter puzzle, each letter is just a covered box — they can match.',
      note_id: 'Beda dengan teka-teki huruf, tiap huruf cuma kotak tertutup — boleh sama.',
    },
    {
      category: 'condition',
      phrase_en: 'no number starts with 0',
      phrase_id: 'tidak ada bilangan yang diawali 0',
      note_en: 'So a letter in the front spot can never be 0.',
      note_id: 'Jadi huruf di posisi paling depan tidak mungkin 0.',
    },
  ]

  if (params.ask === 'the-product') {
    highlights.push({
      category: 'question',
      phrase_en: 'the product',
      phrase_id: 'hasil perkaliannya',
      note_en: 'Fill in every covered box first, then read the whole result.',
      note_id: 'Isi dulu semua kotak yang tertutup, baru baca hasilnya utuh.',
    })
  } else if (params.ask === 'sum-of-hidden-digits') {
    highlights.push({
      category: 'question',
      phrase_en: 'the sum of all the hidden digits',
      phrase_id: 'jumlah semua angka yang tertutup huruf',
      note_en: `Find each of the ${z.slots.length} covered digits, then add them.`,
      note_id: `Cari ${z.slots.length} angka yang tertutup, lalu jumlahkan.`,
    })
  } else {
    highlights.push({
      category: 'question',
      phrase_en: `the letter ${z.askedSlot.letter}`,
      phrase_id: `huruf ${z.askedSlot.letter}`,
      note_en: `Find the single digit hiding under ${z.askedSlot.letter}.`,
      note_id: `Cari satu angka yang bersembunyi di bawah ${z.askedSlot.letter}.`,
    })
  }

  // The classic slip in written multiplication: reading a product digit straight
  // off `digit × multiplier` and forgetting the carry from the column to its
  // right. Only offered when that mistake really produces a different digit.
  let trap: BreakdownTrap | null = null
  if (params.ask === 'one-named-digit' && z.askedSlot.row === 'product') {
    const c = columnTrace(params).find((col) => col.col === z.askedSlot.col)
    if (c && c.hasTop && c.carryIn > 0) {
      const wrong = (c.topDigit * z.multiplier) % 10
      if (wrong !== z.askedSlot.digit) {
        trap = {
          wrong: String(wrong),
          why_en: `That is ${c.topDigit} × ${z.multiplier} with the carried ${c.carryIn} from the column on the right left out.`,
          why_id: `Itu ${c.topDigit} × ${z.multiplier} tanpa menambahkan simpanan ${c.carryIn} dari kolom sebelah kanan.`,
        }
      }
    }
  }

  return {
    needsVisual: false,
    highlights,

    quantities: [
      {
        label_en: 'Puzzle',
        label_id: 'Teka-teki',
        value: `${z.topMask} × ${z.multiplier} = ${z.prodMask}`,
      },
      { label_en: 'Covered digits', label_id: 'Angka tertutup', value: z.letters.join(', ') },
      { label_en: 'Answer', label_id: 'Jawaban', value: answerOf(params) },
    ],

    strategy: {
      conceptSlug: 'cryptarithmetic-multiplication',
      name_en: 'Work column by column from the ones, carrying left',
      name_id: 'Kerjakan kolom demi kolom dari satuan, bawa simpanan ke kiri',
    },

    trap,

    answer: {
      form: 'number',
      unit: null,
      value: answerOf(params),
    },

    vocab: [],
  }
}
