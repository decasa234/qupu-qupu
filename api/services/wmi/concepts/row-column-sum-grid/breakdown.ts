import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { askClause, solve, SYMBOLS, trapAnswer, type Params } from './index.js'

// Authored decomposition of a row-and-column-total grid. One idea carries all
// three ask forms: a printed total is evidence only about the line it sits on,
// and it becomes an ANSWER the moment that line has a single covered square
// left. Everything else in the stem exists to say which numbers are printed
// where.
//
// Every phrase below is assembled from the very same sentences `render` builds
// the body from, so each `phrase_*` is an exact substring of the DISPLAY body
// (the body after `stripSectionLabels` drops the "Find:" / "Cari:" markers).
// Nothing here spans that marker, and no two phrases overlap.
export function buildRowColumnSumGridBreakdown(params: Params): Breakdown {
  const { rows, cols, hidden, rowSumShown, colSumShown, ask } = params
  const s = solve(params)
  const trap = trapAnswer(params, s)
  const showsRows = rowSumShown.some(Boolean)
  const showsCols = colSumShown.some(Boolean)
  const glyphs: string[] = SYMBOLS.slice(0, hidden.length)
  const first = s.steps[0]

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: `the ${rows}-by-${cols} grid`,
      phrase_id: `kisi ${rows} kali ${cols}`,
      note_en: `Find it in the picture first: ${rows} rows across and ${cols} columns down, ${rows * cols} squares in all.`,
      note_id: `Temukan dulu di gambar: ${rows} baris ke bawah dan ${cols} kolom ke samping, seluruhnya ${rows * cols} kotak.`,
    },
    {
      category: 'fact',
      phrase_en: 'a number from 1 to 9',
      phrase_id: 'satu bilangan dari 1 sampai 9',
      note_en: 'Whole numbers only, and never bigger than 9 — handy for checking your answer looks sensible.',
      note_id: 'Bilangan bulat saja, dan tidak pernah lebih dari 9 — enak dipakai memeriksa jawabanmu masuk akal.',
    },
  ]

  if (showsRows) {
    highlights.push({
      category: 'fact',
      phrase_en: 'the sum of that whole row',
      phrase_id: 'jumlah seluruh baris itu',
      note_en: `Add every square in that row and you get the number printed beside it. It says nothing about any other row.`,
      note_id: `Jumlahkan semua kotak di baris itu dan hasilnya bilangan yang tercetak di sampingnya. Bilangan itu tidak bercerita apa pun tentang baris lain.`,
    })
  }
  if (showsCols) {
    highlights.push({
      category: 'fact',
      phrase_en: 'the sum of that whole column',
      phrase_id: 'jumlah seluruh kolom itu',
      note_en: `Add every square in that column and you get the number printed underneath it. It says nothing about any other column.`,
      note_id: `Jumlahkan semua kotak di kolom itu dan hasilnya bilangan yang tercetak di bawahnya. Bilangan itu tidak bercerita apa pun tentang kolom lain.`,
    })
  }

  highlights.push({
    category: 'condition',
    phrase_en: hidden.length === 1 ? 'whose number is missing' : 'whose numbers are missing',
    phrase_id: 'yang bilangannya belum diketahui',
    note_en:
      hidden.length === 1
        ? `You cannot see it — but a line whose total is printed and that has only this one square covered gives it away.`
        : `You cannot see them yet. Start with a line whose total is printed and that has only ONE covered square; filling that one can leave another line with only one too.`,
    note_id:
      hidden.length === 1
        ? `Kamu tidak bisa melihatnya — tapi garis yang jumlahnya tercetak dan hanya punya kotak tertutup ini akan membocorkannya.`
        : `Kamu belum bisa melihatnya. Mulai dari garis yang jumlahnya tercetak dan hanya punya SATU kotak tertutup; setelah kotak itu terisi, bisa jadi garis lain pun tinggal punya satu.`,
  })

  highlights.push({
    category: 'question',
    phrase_en: askClause(ask, s.targetSymbols, 'en'),
    phrase_id: askClause(ask, s.targetSymbols, 'id'),
    note_en:
      ask === 'one-cell'
        ? `Only ${s.targetSymbols[0]} is asked for, but you may have to uncover other squares on the way to it.`
        : ask === 'sum-of-two'
          ? `Two squares, so uncover ${s.targetSymbols[0]} and ${s.targetSymbols[1]} separately first, then add them.`
          : `Not ${s.targetSymbols[0]} plus ${s.targetSymbols[1]} — the two numbers stand side by side, ${s.targetSymbols[0]} in the tens place and ${s.targetSymbols[1]} in the ones place.`,
    note_id:
      ask === 'one-cell'
        ? `Yang ditanya hanya ${s.targetSymbols[0]}, tapi kamu mungkin harus membuka kotak lain dulu untuk sampai ke situ.`
        : ask === 'sum-of-two'
          ? `Ada dua kotak, jadi buka ${s.targetSymbols[0]} dan ${s.targetSymbols[1]} satu per satu dulu, baru dijumlahkan.`
          : `Bukan ${s.targetSymbols[0]} ditambah ${s.targetSymbols[1]} — kedua angka berdiri berdampingan, ${s.targetSymbols[0]} di tempat puluhan dan ${s.targetSymbols[1]} di tempat satuan.`,
  })

  const rowTotals = rowSumShown
    .map((on, r) => (on ? `${r + 1} → ${sumOfRow(params, r)}` : null))
    .filter((x): x is string => x !== null)
  const colTotals = colSumShown
    .map((on, c) => (on ? `${c + 1} → ${sumOfCol(params, c)}` : null))
    .filter((x): x is string => x !== null)

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Grid', label_id: 'Kisi', value: `${rows} × ${cols}` },
    { label_en: 'Covered squares', label_id: 'Kotak tertutup', value: glyphs.join(', ') },
    {
      label_en: 'Row totals printed',
      label_id: 'Jumlah baris yang tercetak',
      value: rowTotals.length > 0 ? rowTotals.join(', ') : '—',
    },
    {
      label_en: 'Column totals printed',
      label_id: 'Jumlah kolom yang tercetak',
      value: colTotals.length > 0 ? colTotals.join(', ') : '—',
    },
    {
      label_en: 'First line that is forced',
      label_id: 'Garis pertama yang sudah pasti',
      value: first
        ? `${first.kind === 'row' ? 'row' : 'column'} ${first.index + 1} = ${first.sum}`
        : '—',
    },
    {
      label_en: 'Order the covers fall in',
      label_id: 'Urutan kotak terbuka',
      value: s.steps.map((step) => step.symbol).join(' → '),
    },
    {
      label_en: 'What each cover hides',
      label_id: 'Isi tiap kotak tertutup',
      value: glyphs.map((g, i) => `${g} = ${s.values[i]}`).join(', '),
    },
    { label_en: 'Answer', label_id: 'Jawaban', value: s.answer },
  ]

  return {
    // The grid, its covers and its printed totals only exist as a picture; the
    // stem states the rule, the figure carries the numbers — exactly how the
    // WMI papers this concept is mined from present it.
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'row-column-sum-grid',
      name_en: 'Solve the line that has only one covered square',
      name_id: 'Selesaikan garis yang tinggal punya satu kotak tertutup',
    },
    // Only the two-digit ask has a genuinely tempting wrong answer: the right
    // two digits written the wrong way round.
    trap:
      trap === null
        ? null
        : {
            wrong: trap,
            why_en: `${trap} uses the right two digits in the wrong order. The question asks for ${s.targetSymbols[0]}${s.targetSymbols[1]} with ${s.targetSymbols[0]} first, and ${s.targetSymbols[0]} hides ${s.targetValues[0]}, so ${s.targetValues[0]} is the tens digit: ${s.answer}.`,
            why_id: `${trap} memakai dua angka yang benar tapi urutannya terbalik. Yang diminta adalah ${s.targetSymbols[0]}${s.targetSymbols[1]} dengan ${s.targetSymbols[0]} lebih dulu, dan ${s.targetSymbols[0]} menyembunyikan ${s.targetValues[0]}, jadi ${s.targetValues[0]} yang jadi angka puluhan: ${s.answer}.`,
          },
    answer: {
      form: 'number',
      unit: null,
      value: s.answer,
    },
    vocab: [],
  }
}

function sumOfRow(p: Params, r: number): number {
  return p.grid[r].reduce((sum, v) => sum + v, 0)
}

function sumOfCol(p: Params, c: number): number {
  return p.grid.reduce((sum, row) => sum + row[c], 0)
}
