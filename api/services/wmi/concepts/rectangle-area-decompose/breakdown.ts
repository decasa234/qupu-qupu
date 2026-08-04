import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import {
  askClause,
  listEn,
  listId,
  NAMES,
  solve,
  trapAnswer,
  type Params,
  type SideLabel,
} from './index.js'

// Authored decomposition of a rectangle jigsaw. One idea carries both ask
// forms: the pieces were cut out of ONE rectangle, so every cut is shared, and
// a length learned on one piece is the same length on its neighbour. The
// printed areas and the printed edge parts are just the two doors into that
// chain.
//
// Every phrase below is lifted from the very same sentences `render` builds the
// body from, so each `phrase_*` is an exact substring of the DISPLAY body (the
// body after `stripSectionLabels` drops the "Find:" / "Cari:" markers). Nothing
// spans that marker, and no two phrases overlap.
export function buildRectangleAreaDecomposeBreakdown(params: Params): Breakdown {
  const s = solve(params)
  const trap = trapAnswer(params, s)
  const n = params.pieces.length
  const names = params.pieces.map((_, i) => NAMES[i])
  const targetName = NAMES[params.target]
  const first = s.neededSteps[0]

  const countEn = ['', 'one', 'two', 'three', 'four', 'five', 'six'][n] ?? String(n)
  const countId = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam'][n] ?? String(n)

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: `cut into ${countEn} smaller rectangles`,
      phrase_id: `dipotong menjadi ${countId} persegi panjang kecil`,
      note_en: `Find the whole rectangle in the picture first, then the ${countEn} pieces inside it: ${listEn(names)}.`,
      note_id: `Temukan dulu persegi panjang besarnya di gambar, lalu ${countId} potongan di dalamnya: ${listId(names)}.`,
    },
    {
      category: 'condition',
      phrase_en: 'the sides they share have the same length',
      phrase_id: 'sisi yang mereka pakai bersama sama panjang',
      note_en:
        'This is the whole trick. A length you work out on one piece is the same length on the piece next to it, so one number can travel right across the picture.',
      note_id:
        'Ini kunci soalnya. Panjang yang kamu temukan di satu potongan berlaku juga di potongan sebelahnya, jadi satu bilangan bisa berjalan ke seluruh gambar.',
    },
    {
      category: 'fact',
      phrase_en: 'areas are printed inside the pieces',
      phrase_id: 'luas tercetak di dalam potongan',
      note_en:
        'An area is a door: divide it by a side you already know and the piece hands you its other side.',
      note_id:
        'Luas itu pintu masuk: bagi dengan sisi yang sudah kamu tahu, dan potongan itu memberikan sisi satunya.',
    },
    {
      category: 'fact',
      phrase_en: 'some side lengths are printed along the edges',
      phrase_id: 'beberapa panjang sisi tercetak di tepinya',
      note_en:
        'The rails outside the rectangle split its top edge and its left edge into parts. A printed length tells you a part, or a run of parts you can subtract from.',
      note_id:
        'Garis di luar persegi panjang membagi sisi atas dan sisi kirinya menjadi bagian-bagian. Panjang yang tercetak memberi tahu satu bagian, atau sekumpulan bagian yang bisa kamu kurangi.',
    },
    {
      category: 'condition',
      phrase_en: 'not to scale',
      phrase_id: 'tidak sesuai skala',
      note_en:
        'Do not measure the picture and do not trust which piece looks bigger. Only the printed numbers count.',
      note_id:
        'Jangan mengukur gambarnya dan jangan percaya potongan mana yang kelihatan lebih besar. Hanya bilangan yang tercetak yang berlaku.',
    },
    {
      category: 'question',
      phrase_en: askClause(params.ask, params.targetSide, targetName, 'en'),
      phrase_id: askClause(params.ask, params.targetSide, targetName, 'id'),
      note_en:
        params.ask === 'area'
          ? `${targetName} does not print its area, so you have to build it: get both of ${targetName}'s sides first, then multiply.`
          : `Only one length is asked for, but you will have to win a few others on the way to it.`,
      note_id:
        params.ask === 'area'
          ? `${targetName} tidak mencetak luasnya, jadi kamu harus membangunnya sendiri: dapatkan dulu kedua sisi ${targetName}, baru dikalikan.`
          : `Yang ditanya hanya satu panjang, tapi kamu harus memenangkan beberapa panjang lain dulu di jalan menuju ke situ.`,
    },
  ]

  const printedAreas = params.areaShown
    .map((on, i) => (on ? `${NAMES[i]} = ${pieceArea(params, i)} cm²` : null))
    .filter((x): x is string => x !== null)
  const printedSides = params.sideLabels.map((l) => `${spanCode(params, l)} = ${spanValue(params, l)} cm`)

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Pieces', label_id: 'Potongan', value: names.join(', ') },
    {
      label_en: 'Areas printed',
      label_id: 'Luas yang tercetak',
      value: printedAreas.length > 0 ? printedAreas.join(', ') : '—',
    },
    {
      label_en: 'Lengths printed',
      label_id: 'Panjang yang tercetak',
      value: printedSides.length > 0 ? printedSides.join(', ') : '—',
    },
    {
      label_en: 'First move that is forced',
      label_id: 'Langkah pertama yang sudah pasti',
      value: first
        ? first.rule === 'area'
          ? `${NAMES[first.pieceIndex]}: ${first.area} ÷ ${first.otherLen} = ${first.spanTotal}`
          : `${first.spanTotal} − ${first.parts.map((k) => k.value).join(' − ')} = ${first.value}`
        : '—',
    },
    {
      label_en: 'Order the lengths fall in',
      label_id: 'Urutan panjang yang terbuka',
      value: s.neededSteps.map((st) => `${varCode(params, st.axis, st.index)} = ${st.value}`).join(' → '),
    },
    {
      label_en: `${targetName}: width × height`,
      label_id: `${targetName}: lebar × tinggi`,
      value: `${s.targetWidth} × ${s.targetHeight}`,
    },
    {
      label_en: 'Answer',
      label_id: 'Jawaban',
      value: params.ask === 'area' ? `${s.answer} cm²` : `${s.answer} cm`,
    },
  ]

  return {
    // The cuts, the printed areas and the printed edge lengths only exist as a
    // picture; the stem states the rule, the figure carries the numbers —
    // exactly how the WMI papers this concept is mined from present it.
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'rectangle-area-decompose',
      name_en: 'Chase the shared sides from a printed area to the missing one',
      name_id: 'Kejar sisi yang dipakai bersama dari luas yang tercetak ke yang hilang',
    },
    // Only the area ask has a genuinely tempting wrong answer: the classic
    // grade-3 slip of adding the two sides instead of multiplying them.
    trap:
      trap === null
        ? null
        : {
            wrong: trap,
            why_en: `${trap} is ${s.targetWidth} + ${s.targetHeight}, which is half of ${targetName}'s way round, not its area. Area counts the 1 cm squares that fit inside, and ${s.targetHeight} rows of ${s.targetWidth} squares make ${s.targetWidth} × ${s.targetHeight} = ${s.answer}.`,
            why_id: `${trap} adalah ${s.targetWidth} + ${s.targetHeight}, itu setengah keliling ${targetName}, bukan luasnya. Luas menghitung persegi 1 cm yang muat di dalamnya, dan ${s.targetHeight} baris berisi ${s.targetWidth} persegi menjadi ${s.targetWidth} × ${s.targetHeight} = ${s.answer}.`,
          },
    answer: {
      form: 'unit',
      unit: params.ask === 'area' ? 'cm²' : 'cm',
      value: s.answer,
    },
    vocab: [],
  }
}

function pieceArea(p: Params, i: number): number {
  const q = p.pieces[i]
  let w = 0
  for (let c = q.c0; c <= q.c1; c++) w += p.widths[c]
  let h = 0
  for (let r = q.r0; r <= q.r1; r++) h += p.heights[r]
  return w * h
}

function spanValue(p: Params, l: SideLabel): number {
  const track = l.axis === 'w' ? p.widths : p.heights
  let total = 0
  for (let i = l.from; i <= l.to; i++) total += track[i]
  return total
}

/** Language-neutral shorthand for one part of an edge, for the machine brief. */
function varCode(p: Params, axis: 'w' | 'h', index: number): string {
  const count = axis === 'w' ? p.cols : p.rows
  const edge = axis === 'w' ? 'top' : 'left'
  return count <= 1 ? `${edge} edge` : `${edge} part ${index + 1}`
}

function spanCode(p: Params, l: SideLabel): string {
  const count = l.axis === 'w' ? p.cols : p.rows
  if (count > 1 && l.from === 0 && l.to === count - 1) {
    return l.axis === 'w' ? 'whole width' : 'whole height'
  }
  if (l.from === l.to) return varCode(p, l.axis, l.from)
  const edge = l.axis === 'w' ? 'top' : 'left'
  return `${edge} parts ${l.from + 1}-${l.to + 1}`
}
