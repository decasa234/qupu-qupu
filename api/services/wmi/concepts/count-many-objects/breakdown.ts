import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import {
  ARRANGEMENT,
  ICON_WORDS,
  answerLabel,
  grouping,
  optionValues,
  trapValue,
  type Params,
} from './index.js'

// Authored decomposition of a count-many-objects problem: a large pile of icons
// (15–65) laid out in rows, in clusters of ten, or scattered; the learner counts
// them EFFICIENTLY and picks the total from four near-miss options.
//
// The problem is FIGURE-HEAVY — the icons live in the illustration — so the stem
// is short and the highlights spotlight the arrangement clue that unlocks the
// shortcut. Display body (after stripSectionLabels drops "Find:" / "Cari:" and
// collapses the blank line):
//   EN: "The picture above shows a big group of stars. All the stars are laid
//        out in neat rows of equal length. How many stars are there in all?"
//   ID: "Gambar di atas menunjukkan banyak bintang. Semua bintang itu disusun
//        rapi dalam baris yang sama panjang. Ada berapa bintang seluruhnya?"
// Every phrase below is built from the same pieces as the body, so each one is
// an exact substring of the rendered text in its language.
export function buildCountManyObjectsBreakdown(params: Params): Breakdown {
  const noun = ICON_WORDS[params.icon]
  const how = ARRANGEMENT[params.layout]
  const { step, chunks, leftover } = grouping(params)
  const fromChunks = step * chunks
  const label = answerLabel(params)
  const trap = trapValue(params)
  const missedBy = Math.abs(trap - params.total)

  // Layout-specific note on why the arrangement is the shortcut.
  const conditionNote = {
    rows: {
      en: `Every row holds the same ${step} — count one row, then skip-count row by row.`,
      id: `Tiap baris isinya sama, yaitu ${step} — hitung satu baris, lalu lompat hitung per baris.`,
    },
    'grouped-tens': {
      en: 'They sit in clumps set far apart; every full clump is 10, so skip-count 10, 20, 30 … instead of one by one.',
      id: 'Bendanya menumpuk terpisah-pisah; tiap tumpukan penuh isinya 10, jadi lompat hitung 10, 20, 30 … bukan satu per satu.',
    },
    scatter: {
      en: 'Nothing is lined up, so ring off 5 at a time first — then the pile becomes countable.',
      id: 'Tidak ada yang berbaris, jadi lingkari 5-5 dulu — setelah itu baru gampang dihitung.',
    },
  }[params.layout]

  const highlights: BreakdownHighlight[] = [
    // fact — the data is not in the words, it is in the figure
    {
      category: 'fact',
      phrase_en: 'The picture above',
      phrase_id: 'Gambar di atas',
      note_en: 'All the numbers you need are in the picture, not in the words.',
      note_id: 'Semua angka yang kamu butuhkan ada di gambar, bukan di kalimat.',
    },
    // object — the thing being counted, and the warning that there are a lot
    {
      category: 'object',
      phrase_en: `a big group of ${noun.en_p}`,
      phrase_id: `banyak ${noun.id}`,
      note_en: 'There are a lot of them — too many to point at one at a time.',
      note_id: 'Jumlahnya banyak — terlalu banyak kalau ditunjuk satu per satu.',
    },
    // condition — the arrangement clue that unlocks the shortcut
    {
      category: 'condition',
      phrase_en: how.en,
      phrase_id: how.id,
      note_en: conditionNote.en,
      note_id: conditionNote.id,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: `How many ${noun.en_p} are there in all?`,
      phrase_id: `Ada berapa ${noun.id} seluruhnya?`,
      note_en: 'Find the total of the whole picture, then match it to an option.',
      note_id: 'Cari jumlah seluruh gambar, lalu cocokkan dengan pilihan jawaban.',
    },
  ]

  const chunkLabel = {
    rows: { en: 'Icons per row', id: 'Isi tiap baris' },
    'grouped-tens': { en: 'Icons per group', id: 'Isi tiap kelompok' },
    scatter: { en: 'Icons per ring', id: 'Isi tiap lingkaran' },
  }[params.layout]

  const chunkCountLabel = {
    rows: { en: 'Full rows', id: 'Baris penuh' },
    'grouped-tens': { en: 'Full groups', id: 'Kelompok penuh' },
    scatter: { en: 'Rings of 5', id: 'Lingkaran 5-an' },
  }[params.layout]

  const quantities: BreakdownQuantity[] = [
    { label_en: chunkLabel.en, label_id: chunkLabel.id, value: String(step) },
    { label_en: chunkCountLabel.en, label_id: chunkCountLabel.id, value: String(chunks) },
    { label_en: 'From the groups', label_id: 'Dari kelompok', value: String(fromChunks) },
    { label_en: 'Left over', label_id: 'Sisa', value: String(leftover) },
    { label_en: 'Total', label_id: 'Jumlah', value: String(params.total) },
    { label_en: 'Options', label_id: 'Pilihan', value: optionValues(params).join(', ') },
    { label_en: 'Answer', label_id: 'Jawaban', value: label },
  ]

  const strategyName = {
    rows: { en: 'Skip-count row by row', id: 'Lompat hitung per baris' },
    'grouped-tens': { en: 'Skip-count by tens', id: 'Lompat hitung sepuluhan' },
    scatter: { en: 'Ring off fives, then add', id: 'Lingkari lima-lima, lalu jumlahkan' },
  }[params.layout]

  return {
    needsVisual: true,
    highlights,
    quantities,

    strategy: {
      conceptSlug: 'count-many-objects',
      name_en: strategyName.en,
      name_id: strategyName.id,
    },

    // The near-miss options exist precisely to catch a one-by-one count that
    // slips by a couple. Name the number that mistake produces.
    trap:
      trap < params.total
        ? {
            wrong: String(trap),
            why_en: `Counting one by one, it is easy to skip ${missedBy} — you get ${trap} instead of ${params.total}.`,
            why_id: `Kalau dihitung satu per satu, ${missedBy} ${noun.id} gampang terlewat — hasilnya ${trap}, bukan ${params.total}.`,
          }
        : {
            wrong: String(trap),
            why_en: `Counting one by one, ${missedBy} can get counted twice — you get ${trap} instead of ${params.total}.`,
            why_id: `Kalau dihitung satu per satu, ${missedBy} ${noun.id} bisa terhitung dua kali — hasilnya ${trap}, bukan ${params.total}.`,
          },

    answer: {
      form: 'choice',
      unit: null,
      value: label,
    },

    vocab: [],
  }
}
