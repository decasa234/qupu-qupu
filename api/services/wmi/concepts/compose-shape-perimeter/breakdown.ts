import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import {
  analyse,
  askClause,
  givenPhrase,
  joinPhrase,
  piecesPhrase,
  trapAnswer,
  type Params,
} from './index.js'

// Authored decomposition of a "build it out of identical pieces, then measure
// it" question.
//
// One idea carries all three asks: the pieces do not change when you push them
// together, but the OUTLINE does. Every join swallows two edges, so the finished
// shape's perimeter is always less than the pieces' perimeters added up — while
// its area is exactly the pieces' areas added up. The highlights point at the
// three words that decide it: what the pieces are, that they are pushed edge to
// edge, and which measurement is wanted.
//
// Every phrase below is lifted from the very functions `render` builds the body
// out of — `piecesPhrase`, `joinPhrase`, `givenPhrase` and `askClause` — so each
// `phrase_*` is an exact substring of the DISPLAY body (the body after
// `stripSectionLabels` drops the "Find:" / "Cari:" markers). Nothing spans that
// marker and no two phrases overlap.
export function buildComposeShapePerimeterBreakdown(params: Params): Breakdown {
  const a = analyse(params)
  const trap = trapAnswer(params, a)

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: piecesPhrase(params, 'en'),
      phrase_id: piecesPhrase(params, 'id'),
      note_en: `Find them in the picture first. All ${a.count} are the same size, so measuring one measures them all.`,
      note_id: `Temukan dulu di gambar. Semua ${a.count} keping sama besar, jadi mengukur satu berarti mengukur semuanya.`,
    },
    {
      category: 'fact',
      phrase_en: joinPhrase('en'),
      phrase_id: joinPhrase('id'),
      note_en:
        'This is the whole trick: where two pieces touch, both of their edges are shut inside and stop being part of the outline.',
      note_id:
        'Ini kuncinya: di tempat dua keping bersentuhan, kedua sisinya terkunci di dalam dan tidak lagi menjadi tepi luar.',
    },
    {
      category: 'condition',
      phrase_en: givenPhrase(params, a, 'en'),
      phrase_id: givenPhrase(params, a, 'id'),
      note_en:
        params.given === 'piece-side'
          ? 'This is the only length you are told. Everything else has to be built out of it.'
          : params.given === 'piece-perimeter'
            ? 'This is one piece all the way round, not the finished shape. Share it over the 4 equal sides to get one side.'
            : params.given === 'piece-area'
              ? 'A square of area this big has a side that times itself makes this number.'
              : 'The string measures the finished outline, so it counts only the edges still facing outside.',
      note_id:
        params.given === 'piece-side'
          ? 'Hanya panjang inilah yang diberitahu. Semua yang lain harus dibangun dari sini.'
          : params.given === 'piece-perimeter'
            ? 'Ini keliling satu keping, bukan bentuk jadinya. Bagi rata ke 4 sisi yang sama untuk mendapat satu sisi.'
            : params.given === 'piece-area'
              ? 'Persegi dengan luas segitu punya sisi yang kalau dikali dirinya sendiri hasilnya angka itu.'
              : 'Tali itu mengukur tepi luar bentuk jadinya, jadi yang dihitung hanya sisi yang masih menghadap ke luar.',
    },
    {
      category: 'question',
      phrase_en: askClause(params.ask, 'en'),
      phrase_id: askClause(params.ask, 'id'),
      note_en:
        params.ask === 'side'
          ? 'One small piece, not the big shape.'
          : params.ask === 'perimeter'
            ? 'The whole way round the OUTSIDE of the big shape — the joins inside do not count.'
            : 'The surface the big shape covers, not the line round it.',
      note_id:
        params.ask === 'side'
          ? 'Satu keping kecil, bukan bentuk besarnya.'
          : params.ask === 'perimeter'
            ? 'Keliling bagian LUAR bentuk besarnya — sambungan di dalam tidak ikut dihitung.'
            : 'Permukaan yang ditutupi bentuk besarnya, bukan garis yang mengelilinginya.',
    },
  ]

  const givenLabel_en =
    params.given === 'piece-side'
      ? 'Given: one piece measures'
      : params.given === 'piece-perimeter'
        ? 'Given: perimeter of one piece'
        : params.given === 'piece-area'
          ? 'Given: area of one piece'
          : 'Given: string round the finished shape'
  const givenLabel_id =
    params.given === 'piece-side'
      ? 'Diketahui: ukuran satu keping'
      : params.given === 'piece-perimeter'
        ? 'Diketahui: keliling satu keping'
        : params.given === 'piece-area'
          ? 'Diketahui: luas satu keping'
          : 'Diketahui: tali mengelilingi bentuk jadi'
  const givenValue =
    params.given === 'piece-side'
      ? params.piece === 'square'
        ? `${a.pieceW} cm × ${a.pieceW} cm`
        : `${a.pieceW} cm × ${a.pieceH} cm`
      : params.given === 'piece-area'
        ? `${a.pieceArea} cm²`
        : `${a.givenValue} cm`

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Pieces', label_id: 'Banyak keping', value: String(a.count) },
    { label_en: givenLabel_en, label_id: givenLabel_id, value: givenValue },
    {
      label_en: 'Shape, in pieces (across × down)',
      label_id: 'Bentuk jadi, dalam keping (samping × bawah)',
      value: `${a.width} × ${a.height}`,
    },
    {
      label_en: 'Edges if the pieces stayed apart',
      label_id: 'Sisi kalau keping tetap terpisah',
      value: `${a.count} × 4 = ${a.count * 4}`,
    },
    {
      label_en: 'Joins, and edges they bury',
      label_id: 'Sambungan, dan sisi yang terkubur',
      value: `${a.joins} → ${a.hiddenEdges}`,
    },
    {
      label_en: 'Edges left on the outline (sideways + up-down)',
      label_id: 'Sisi yang tersisa di tepi luar (mendatar + tegak)',
      value: `${a.horizontalEdges} + ${a.verticalEdges} = ${a.outlineEdges}`,
    },
    { label_en: 'Answer', label_id: 'Jawaban', value: `${a.answer} ${a.unit}` },
  ]

  return {
    // The layout only exists as a picture — the stem names the pieces and the
    // rule, the drawing carries the arrangement.
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'compose-shape-perimeter',
      name_en: 'Measure one piece, lay the shape out, then count only the edges still facing outside',
      name_id: 'Ukur satu keping, susun bentuknya, lalu hitung hanya sisi yang masih menghadap ke luar',
    },
    trap:
      trap === null
        ? null
        : {
            wrong: trap,
            why_en:
              params.ask === 'perimeter'
                ? `${trap} is ${a.count} × ${a.piecePerimeter}, every piece keeping its whole outline. But the ${a.joins} joins shut ${a.hiddenEdges} of those edges inside, leaving ${a.outlineEdges} edges on the outline: ${a.shapePerimeter} cm.`
                : params.ask === 'area'
                  ? `${trap} is ${a.count} × ${a.piecePerimeter}, the pieces' EDGES added up. Area is the surface inside, not the line round it: one piece covers ${a.pieceArea} cm², so ${a.count} pieces cover ${a.shapeArea} cm².`
                  : `${trap} comes from splitting the string into ${a.count} whole square outlines, ${a.shapePerimeter} ÷ ${a.count} ÷ 4. But the pieces are pushed together, so ${a.hiddenEdges} edges are hidden inside and the string only covers ${a.outlineEdges} edges: ${a.shapePerimeter} ÷ ${a.outlineEdges} = ${a.pieceW} cm.`,
            why_id:
              params.ask === 'perimeter'
                ? `${trap} adalah ${a.count} × ${a.piecePerimeter}, seolah setiap keping tetap punya keliling utuh. Padahal ${a.joins} sambungan mengunci ${a.hiddenEdges} sisi di dalam, sehingga tersisa ${a.outlineEdges} sisi di tepi luar: ${a.shapePerimeter} cm.`
                : params.ask === 'area'
                  ? `${trap} adalah ${a.count} × ${a.piecePerimeter}, yaitu SISI-sisi keping yang dijumlahkan. Luas itu permukaan di dalam, bukan garis kelilingnya: satu keping luasnya ${a.pieceArea} cm², jadi ${a.count} keping luasnya ${a.shapeArea} cm².`
                  : `${trap} muncul kalau tali dibagi menjadi ${a.count} keliling persegi utuh, ${a.shapePerimeter} ÷ ${a.count} ÷ 4. Padahal kepingnya dirapatkan, jadi ${a.hiddenEdges} sisi tersembunyi di dalam dan tali hanya menempuh ${a.outlineEdges} sisi: ${a.shapePerimeter} ÷ ${a.outlineEdges} = ${a.pieceW} cm.`,
          },
    answer: { form: 'unit', unit: a.unit, value: a.answer },
    vocab: [],
  }
}
