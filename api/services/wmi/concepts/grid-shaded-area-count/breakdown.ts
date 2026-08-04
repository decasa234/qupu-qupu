import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import {
  analyse,
  askClause,
  cellNoun,
  sceneClause,
  slantClause,
  trapAnswer,
  unitClause,
  type Params,
} from './index.js'

// Authored decomposition of a "how big is the shaded part?" question.
//
// One idea carries all three asks: the grid supplies a UNIT, and area is how
// many of that unit the shading covers — with a cell the edge slices corner to
// corner worth exactly half of one. Everything else in the stem only says which
// unit, how much it is worth, and which shapes are in play.
//
// Every phrase below is lifted from the very clauses `render` builds the body
// out of — `sceneClause`, `unitClause`, `slantClause` and `askClause` — so each
// `phrase_*` is an exact substring of the DISPLAY body (the body after
// `stripSectionLabels` drops the "Find:" / "Cari:" markers). Nothing spans that
// marker and no two phrases overlap.
export function buildGridShadedAreaCountBreakdown(params: Params): Breakdown {
  const a = analyse(params)
  const trap = trapAnswer(a)
  const noun_en = cellNoun(params.lattice, 'en')
  const noun_id = cellNoun(params.lattice, 'id')

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: sceneClause(params.ask, params.lattice, 'en'),
      phrase_id: sceneClause(params.ask, params.lattice, 'id'),
      note_en: `Find it in the picture first. Its edges follow the grid lines, so the whole shape is built out of ${noun_en}s of the grid.`,
      note_id: `Temukan dulu di gambar. Tepinya mengikuti garis petak, jadi seluruh bentuk tersusun dari ${noun_id} pada petak.`,
    },
    {
      category: 'fact',
      phrase_en: unitClause(params.lattice, params.unitValue, 'en'),
      phrase_id: unitClause(params.lattice, params.unitValue, 'id'),
      note_en:
        params.unitValue === 1
          ? `Every ${noun_en} of the grid is worth the same, so counting ${noun_en}s IS measuring the area.`
          : `Every ${noun_en} of the grid is worth the same ${params.unitValue} cm², so count ${noun_en}s first and multiply by ${params.unitValue} at the very end.`,
      note_id:
        params.unitValue === 1
          ? `Setiap ${noun_id} pada petak bernilai sama, jadi mencacah ${noun_id} sama saja dengan mengukur luas.`
          : `Setiap ${noun_id} pada petak bernilai sama, yaitu ${params.unitValue} cm², jadi cacah dulu ${noun_id}nya lalu kalikan ${params.unitValue} di akhir.`,
    },
  ]

  const slant_en = slantClause(a.anyHalves, params.lattice, 'en')
  const slant_id = slantClause(a.anyHalves, params.lattice, 'id')
  if (slant_en && slant_id) {
    highlights.push({
      category: 'condition',
      phrase_en: slant_en,
      phrase_id: slant_id,
      note_en: `Exactly in half means each of those is worth half a ${noun_en}, so two of them together are worth one whole ${noun_en}.`,
      note_id: `Tepat dua bagian sama besar berarti tiap potongan bernilai setengah ${noun_id}, jadi dua potongan bersama-sama bernilai satu ${noun_id} utuh.`,
    })
  }

  highlights.push({
    category: 'question',
    phrase_en: askClause(params.ask, 'en'),
    phrase_id: askClause(params.ask, 'id'),
    note_en:
      params.ask === 'area'
        ? 'A number of cm², not a number of squares — the last step turns one into the other.'
        : params.ask === 'which-largest'
          ? 'A letter, not a number. Count all of them, then compare the counts.'
          : 'A letter, not a number. Count the example first, then look for the one that matches it.',
    note_id:
      params.ask === 'area'
        ? 'Yang diminta cm², bukan banyaknya kotak — langkah terakhir mengubah yang satu menjadi yang lain.'
        : params.ask === 'which-largest'
          ? 'Yang diminta huruf, bukan angka. Cacah semuanya dulu, baru dibandingkan.'
          : 'Yang diminta huruf, bukan angka. Cacah bentuk contohnya dulu, baru cari yang sama.',
  })

  const rowTally = a.target.wholeRows.map(({ row, cells }) => `${row + 1}: ${cells.length}`).join(', ')

  const quantities: BreakdownQuantity[] = [
    {
      label_en: 'One grid cell',
      label_id: 'Satu petak',
      value: `1 ${noun_en} = ${params.unitValue} cm²`,
    },
  ]
  if (a.example) {
    quantities.push({
      label_en: 'Example: whole + halves',
      label_id: 'Contoh: utuh + setengah',
      value: `${a.example.whole.length} + ${a.example.halves.length}/2 = ${a.example.units}`,
    })
  }
  if (a.options.length > 0) {
    quantities.push({
      label_en: 'Each option, in grid cells',
      label_id: 'Tiap pilihan, dalam petak',
      value: a.options.map((o) => `${o.label}: ${o.figure.units}`).join(', '),
    })
  } else {
    quantities.push(
      { label_en: 'Whole cells, row by row', label_id: 'Kotak utuh, per baris', value: rowTally },
      { label_en: 'Whole cells', label_id: 'Petak utuh', value: String(a.target.whole.length) },
      { label_en: 'Half cells', label_id: 'Potongan setengah', value: String(a.target.halves.length) },
    )
  }
  quantities.push(
    { label_en: 'Grid cells covered', label_id: 'Petak yang tertutup', value: String(a.target.units) },
    { label_en: 'Area', label_id: 'Luas', value: `${a.target.value} cm²` },
    { label_en: 'Answer', label_id: 'Jawaban', value: a.answer },
  )

  const trapWhy = (): { why_en: string; why_id: string } => {
    const touched = a.target.whole.length + a.target.halves.length
    if (params.ask === 'area' && a.target.halves.length > 0) {
      return {
        why_en: `${trap} counts every ${noun_en} the shading touches as a whole one — all ${touched} of them. But ${a.target.halves.length} of those are only half covered, and ${a.target.halves.length} halves are worth ${a.target.halves.length / 2}, not ${a.target.halves.length}.`,
        why_id: `${trap} menghitung setiap ${noun_id} yang tersentuh warna sebagai utuh — semuanya ${touched}. Padahal ${a.target.halves.length} di antaranya hanya tertutup setengah, dan ${a.target.halves.length} setengah bernilai ${a.target.halves.length / 2}, bukan ${a.target.halves.length}.`,
      }
    }
    if (params.ask === 'area') {
      return {
        why_en: `${trap} is the number of ${noun_en}s, not the area. Each ${noun_en} stands for ${params.unitValue} cm², so it still has to be multiplied: ${a.target.units} × ${params.unitValue} = ${a.target.value}.`,
        why_id: `${trap} adalah banyaknya ${noun_id}, bukan luasnya. Setiap ${noun_id} bernilai ${params.unitValue} cm², jadi masih harus dikalikan: ${a.target.units} × ${params.unitValue} = ${a.target.value}.`,
      }
    }
    const wrong = a.options.find((o) => o.label === trap)
    const wrongTouched = wrong ? wrong.figure.whole.length + wrong.figure.halves.length : 0
    return {
      why_en: `${trap} touches the most ${noun_en}s — ${wrongTouched} of them — so it looks the biggest. But ${wrong?.figure.halves.length ?? 0} of those are half covered, which brings it down to ${wrong?.figure.units ?? 0}.`,
      why_id: `${trap} menyentuh ${noun_id} paling banyak — ada ${wrongTouched} — jadi terlihat paling besar. Padahal ${wrong?.figure.halves.length ?? 0} di antaranya hanya setengah, sehingga turun menjadi ${wrong?.figure.units ?? 0}.`,
    }
  }

  return {
    // The region only exists as a picture: the stem states what one cell is
    // worth, the drawing carries the shape. Exactly how the WMI papers ask it.
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'grid-shaded-area-count',
      name_en: 'Count the whole cells, pair up the halves, then turn cells into cm²',
      name_id: 'Cacah petak utuh, pasangkan yang setengah, lalu ubah petak menjadi cm²',
    },
    trap: trap === null ? null : { wrong: trap, ...trapWhy() },
    answer: {
      form: params.ask === 'area' ? 'number' : 'choice',
      unit: params.ask === 'area' ? 'cm²' : null,
      value: a.answer,
    },
    vocab: [],
  }
}
