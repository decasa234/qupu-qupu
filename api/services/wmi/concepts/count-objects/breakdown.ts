import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

const KIND_EN: Record<Params['kind'], string> = {
  apel: 'apples',
  bola: 'balls',
  bintang: 'stars',
  kucing: 'cats',
}

// Authored decomposition of a count-objects problem: a figure shows a group of
// objects and the learner counts how many there are in all. The learner-facing
// part is a set of color-coded, clickable highlights over the problem text.
// Each phrase MUST be an exact substring of the rendered body.
export function buildCountObjectsBreakdown(params: Params): Breakdown {
  const n = params.n
  const en = KIND_EN[params.kind]
  const id = params.kind

  // Mirror render(): the four choices are [n, n-1, n+1, n+2] rotated by offset,
  // labelled A–D. The answer is the label sitting on the correct count n.
  const labels = ['A', 'B', 'C', 'D'] as const
  const values = [n, n - 1, n + 1, n + 2]
  const valuePool = [...values.slice(params.offset), ...values.slice(0, params.offset)]
  const answerLabel = labels[valuePool.indexOf(n)]

  const highlights: BreakdownHighlight[] = [
    // fact — the picture is where the objects live
    {
      category: 'fact',
      phrase_en: `The figure shows a group of ${en}`,
      phrase_id: `Gambar menunjukkan sekumpulan ${id}`,
      note_en: `Look at the picture — that is where you count the ${en}.`,
      note_id: `Lihat gambarnya — di situlah kamu menghitung ${id}.`,
    },
    // condition — count every object, none twice
    {
      category: 'condition',
      phrase_en: `in all`,
      phrase_id: `seluruhnya`,
      note_en: `Count every one, and do not count any twice.`,
      note_id: `Hitung semuanya, dan jangan ada yang terhitung dua kali.`,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: `How many ${en} are there in all?`,
      phrase_id: `Ada berapa ${id} seluruhnya?`,
      note_en: `Find the total number of ${en} in the picture.`,
      note_id: `Cari jumlah ${id} di gambar.`,
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Objects to count', label_id: 'Benda yang dihitung', value: en },
      { label_en: 'Total', label_id: 'Jumlah', value: String(n) },
    ],

    strategy: {
      conceptSlug: 'count-objects',
      name_en: 'Count one by one',
      name_id: 'Hitung satu per satu',
    },

    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: String(answerLabel),
    },

    vocab: [],
  }
}
