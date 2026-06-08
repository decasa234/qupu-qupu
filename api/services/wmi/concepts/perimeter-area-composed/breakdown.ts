import type { Breakdown, BreakdownHighlight } from '../types.js'
import { area, type Params } from './index.js'

// Authored decomposition of a perimeter-area-composed problem: a full
// rectangle (W × H) with a smaller corner (cw × ch) cut out, leaving an
// L-shape. The learner-facing part is a set of color-coded, clickable
// highlights over the problem text. Each phrase MUST be an exact substring of
// the DISPLAY body (after stripSectionLabels removes "Find:" / "Cari:"; this
// body carries no [[glossary]] markup). The DISPLAY question word is
// "area" / "luas".
export function buildPerimeterAreaComposedBreakdown(params: Params): Breakdown {
  const { W, H, cw, ch } = params
  const fullArea = W * H
  const cutArea = cw * ch
  const result = area(params)

  const highlights: BreakdownHighlight[] = [
    // fact — the given side lengths of the full rectangle
    {
      category: 'fact',
      phrase_en: `${W} cm × ${H} cm rectangle`,
      phrase_id: `persegi panjang ${W} cm × ${H} cm`,
      note_en: `The whole rectangle is ${W} by ${H}, so it covers ${W} × ${H} = ${fullArea} cm².`,
      note_id: `Persegi panjang utuh ${W} kali ${H}, jadi luasnya ${W} × ${H} = ${fullArea} cm².`,
    },
    // fact — the size of the cut-out corner
    {
      category: 'fact',
      phrase_en: `${cw} cm × ${ch} cm corner`,
      phrase_id: `sudut ${cw} cm × ${ch} cm`,
      note_en: `The missing corner is ${cw} by ${ch}, covering ${cw} × ${ch} = ${cutArea} cm².`,
      note_id: `Sudut yang hilang ${cw} kali ${ch}, luasnya ${cw} × ${ch} = ${cutArea} cm².`,
    },
    // condition — the shape is composed: a rectangle with a piece removed
    {
      category: 'condition',
      phrase_en: 'corner cut out',
      phrase_id: 'yang dipotong',
      note_en: 'One corner is gone, so the shape is the rectangle minus that corner.',
      note_id: 'Satu sudut hilang, jadi bangun ini persegi panjang dikurangi sudut itu.',
    },
    // question — what to find (DISPLAY word: area / luas)
    {
      category: 'question',
      phrase_en: 'the area of the shape',
      phrase_id: 'luas bangun tersebut',
      note_en: `Find how many cm² the L-shape covers: ${fullArea} − ${cutArea} = ${result}.`,
      note_id: `Cari berapa cm² luas bangun L: ${fullArea} − ${cutArea} = ${result}.`,
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Rectangle', label_id: 'Persegi panjang', value: `${W} × ${H}` },
      { label_en: 'Cut corner', label_id: 'Sudut dipotong', value: `${cw} × ${ch}` },
      { label_en: 'Full area', label_id: 'Luas penuh', value: String(fullArea) },
      { label_en: 'Cut area', label_id: 'Luas potongan', value: String(cutArea) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(result) },
    ],

    strategy: {
      conceptSlug: 'perimeter-area-composed',
      name_en: 'Full rectangle minus the cut-out',
      name_id: 'Persegi panjang penuh dikurangi potongan',
    },

    // Tempting wrong answer: forgetting to subtract the corner and giving the
    // full rectangle area instead.
    trap: {
      wrong: String(fullArea),
      why_en: `${fullArea} is the whole rectangle — you still have to take away the ${cutArea} cm² corner.`,
      why_id: `${fullArea} itu persegi panjang utuh — kamu masih harus mengurangi sudut ${cutArea} cm².`,
    },

    answer: {
      form: 'number',
      unit: 'cm²',
      value: String(result),
    },

    vocab: [],
  }
}
