import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { analyse, askClause, trapAnswer, type Params } from './index.js'

// Authored decomposition of a "how many tiles cover this shape?" question.
//
// One idea carries all three asks: a tile is a UNIT, and covering is counting
// how many of that unit fit. Everything else in the stem only says which unit
// (a whole grid square, or half of one) and which squares are still waiting.
//
// Every phrase below is lifted from the very sentences `render` builds the body
// out of — `tileClause`, `setupClause` and `askClause` — so each `phrase_*` is
// an exact substring of the DISPLAY body (the body after `stripSectionLabels`
// drops the "Find:" / "Cari:" markers). Nothing spans that marker and no two
// phrases overlap.
export function buildTileFillCountBreakdown(params: Params): Breakdown {
  const a = analyse(params)
  const trap = trapAnswer(params, a)
  const isTriangle = params.tile === 'half-square-triangle'

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: 'The shape in the picture',
      phrase_id: 'Bentuk pada gambar',
      note_en: 'Find it in the picture first. Its edges follow the grid lines, so it is made of whole squares.',
      note_id: 'Temukan dulu di gambar. Tepinya mengikuti garis kotak, jadi bentuk itu tersusun dari kotak-kotak utuh.',
    },
    isTriangle
      ? {
          category: 'fact',
          phrase_en: 'two tiles fit together to make one whole square',
          phrase_id: 'dua keping disatukan menjadi satu kotak penuh',
          note_en: 'This is the whole trick: a tile is only HALF a square, so every square you count eats 2 tiles.',
          note_id: 'Ini kuncinya: satu keping hanya SETENGAH kotak, jadi setiap kotak yang kamu hitung menghabiskan 2 keping.',
        }
      : {
          category: 'fact',
          phrase_en: 'exactly the same size as one square of the grid',
          phrase_id: 'persis sama besar dengan satu kotak pada kertas',
          note_en: 'Same size means one tile covers one square, so counting tiles is the same as counting squares.',
          note_id: 'Sama besar berarti satu keping menutup satu kotak, jadi menghitung keping sama saja dengan menghitung kotak.',
        },
  ]

  if (params.ask === 'how-many-more') {
    highlights.push({
      category: 'condition',
      phrase_en: 'already coloured in',
      phrase_id: 'sudah diwarnai',
      note_en: 'Those squares are finished — they get no new tile. Skip them and count only the white ones.',
      note_id: 'Kotak-kotak itu sudah selesai — tidak dapat keping baru. Lewati saja dan hitung hanya yang masih putih.',
    })
  } else if (params.ask === 'fewest-to-complete') {
    highlights.push({
      category: 'condition',
      phrase_en: `${a.boxSide} squares across at its widest and ${a.boxSide} squares tall`,
      phrase_id: `paling lebar ${a.boxSide} kotak dan tingginya ${a.boxSide} kotak`,
      note_en: `A square that covers the shape can never be narrower than the shape, so its side is at least ${a.boxSide} — and ${a.boxSide} by ${a.boxSide} already fits, so that is the smallest one.`,
      note_id: `Persegi yang menutup bentuk itu tidak mungkin lebih sempit dari bentuknya, jadi sisinya paling sedikit ${a.boxSide} — dan ${a.boxSide} kali ${a.boxSide} sudah cukup, jadi itulah yang terkecil.`,
    })
  }

  highlights.push({
    category: 'question',
    phrase_en: askClause(params.ask, 'en'),
    phrase_id: askClause(params.ask, 'id'),
    note_en:
      params.ask === 'total'
        ? 'Every square of the shape, none left out.'
        : params.ask === 'how-many-more'
          ? 'Not the whole shape — only what is still missing.'
          : 'Not the whole big square — only the empty squares you have to add.',
    note_id:
      params.ask === 'total'
        ? 'Semua kotak pada bentuk itu, tidak ada yang terlewat.'
        : params.ask === 'how-many-more'
          ? 'Bukan seluruh bentuknya — hanya bagian yang masih kurang.'
          : 'Bukan seluruh persegi besarnya — hanya kotak kosong yang harus ditambahkan.',
  })

  const rowTally = a.targetRows.map(({ row, cells }) => `${row + 1}: ${cells.length}`).join(', ')

  const quantities: BreakdownQuantity[] = [
    {
      label_en: 'Tile',
      label_id: 'Keping',
      value: isTriangle ? 'half a grid square' : 'one grid square',
    },
    { label_en: 'Squares in the shape', label_id: 'Kotak pada bentuk', value: String(a.cells.length) },
  ]
  if (params.ask === 'how-many-more') {
    quantities.push({
      label_en: 'Squares already covered',
      label_id: 'Kotak yang sudah tertutup',
      value: String(a.filled.length),
    })
  }
  if (params.ask === 'fewest-to-complete') {
    quantities.push({
      label_en: 'Smallest square it fits in',
      label_id: 'Persegi terkecil yang memuatnya',
      value: `${a.boxSide} × ${a.boxSide}`,
    })
  }
  quantities.push(
    { label_en: 'Squares to count, row by row', label_id: 'Kotak yang dihitung, per baris', value: rowTally },
    { label_en: 'Squares to cover', label_id: 'Kotak yang harus ditutup', value: String(a.squares) },
    { label_en: 'Tiles per square', label_id: 'Keping per kotak', value: String(a.perSquare) },
    { label_en: 'Answer', label_id: 'Jawaban', value: a.answer },
  )

  return {
    // The shape only exists as a picture — the stem states the rule, the drawing
    // carries the squares. Exactly how the WMI grade-1 papers present it.
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'tile-fill-count',
      name_en: 'Count the squares row by row, then turn squares into tiles',
      name_id: 'Hitung kotaknya baris demi baris, lalu ubah kotak menjadi keping',
    },
    trap:
      trap === null
        ? null
        : {
            wrong: trap,
            why_en: isTriangle
              ? `${trap} counts the SQUARES and stops. But a tile is only half a square, so each of those ${a.squares} squares needs 2 tiles: ${a.squares} + ${a.squares} = ${a.tiles}.`
              : params.ask === 'how-many-more'
                ? `${trap} covers the whole shape from scratch. But ${a.filled.length} of its ${a.cells.length} squares are already coloured, so only ${a.squares} are still waiting.`
                : `${trap} is the whole big square, ${a.boxSide} by ${a.boxSide}. The question only wants the tiles you ADD, and ${a.cells.length} of those squares are already part of the shape: ${a.boxSide * a.boxSide} − ${a.cells.length} = ${a.squares}.`,
            why_id: isTriangle
              ? `${trap} menghitung KOTAKnya lalu berhenti. Padahal satu keping hanya setengah kotak, jadi tiap kotak dari ${a.squares} kotak itu butuh 2 keping: ${a.squares} + ${a.squares} = ${a.tiles}.`
              : params.ask === 'how-many-more'
                ? `${trap} menutup seluruh bentuk dari awal. Padahal ${a.filled.length} dari ${a.cells.length} kotaknya sudah diwarnai, jadi tinggal ${a.squares} kotak yang menunggu.`
                : `${trap} adalah seluruh persegi besar, ${a.boxSide} kali ${a.boxSide}. Yang ditanya hanya keping yang DITAMBAHKAN, dan ${a.cells.length} kotak di antaranya sudah menjadi bagian bentuk: ${a.boxSide * a.boxSide} − ${a.cells.length} = ${a.squares}.`,
          },
    answer: { form: 'number', unit: null, value: a.answer },
    vocab: [],
  }
}
