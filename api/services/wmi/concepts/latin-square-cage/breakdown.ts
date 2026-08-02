import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import {
  askClause,
  BOX_SIZE,
  cageClue,
  LETTERS,
  listEn,
  listId,
  solve,
  trapAnswer,
  type Params,
} from './index.js'

// Authored decomposition of a Latin-square-with-frames puzzle. One idea carries
// all three ask forms: the grid is not filled by guessing but by finding the
// single square where the line rule and a printed clue together leave exactly
// one number — and every square that gets filled hands the next one away.
//
// Every phrase below is assembled from the very same sentences `render` builds
// the body from, so each `phrase_*` is an exact substring of the DISPLAY body
// (the body after `stripSectionLabels` drops the "Find:" / "Cari:" markers).
// Nothing here spans that marker, and no two phrases overlap.
export function buildLatinSquareCageBreakdown(params: Params): Breakdown {
  const { n, clueSystem, cages, givens, letters, ask } = params
  const s = solve(params)
  const trap = trapAnswer(params, s)
  const marks: string[] = LETTERS.slice(0, letters.length)
  const boxed = clueSystem === 'thick-box'
  const first = s.neededSteps[0]

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: `the ${n} by ${n} grid`,
      phrase_id: `kisi ${n} kali ${n}`,
      note_en: `Find it in the picture first: ${n} rows down and ${n} columns across, ${n * n} squares in all.`,
      note_id: `Temukan dulu di gambar: ${n} baris ke bawah dan ${n} kolom ke samping, seluruhnya ${n * n} kotak.`,
    },
    {
      category: 'fact',
      phrase_en: `a number from 1 to ${n}`,
      phrase_id: `bilangan 1 sampai ${n}`,
      note_en: `Only these ${n} numbers are ever allowed — nothing bigger, nothing smaller, and no square stays empty.`,
      note_id: `Hanya ${n} bilangan ini yang boleh dipakai — tidak ada yang lebih besar, tidak ada yang lebih kecil, dan tidak ada kotak yang dibiarkan kosong.`,
    },
    {
      category: 'condition',
      phrase_en: 'each row and each column holds every number exactly once',
      phrase_id: 'setiap baris dan setiap kolom memuat semua bilangan itu tepat satu kali',
      note_en: `This is the rule that does the work: once a number sits somewhere, it is banned from every other square on its row and on its column.`,
      note_id: `Inilah aturan yang bekerja: begitu sebuah bilangan menempati satu kotak, bilangan itu dilarang muncul lagi di baris dan kolom kotak tersebut.`,
    },
  ]

  if (boxed) {
    highlights.push({
      category: 'condition',
      phrase_en: `Each bold ${BOX_SIZE} by ${BOX_SIZE} box`,
      phrase_id: `Setiap kotak tebal ${BOX_SIZE} kali ${BOX_SIZE}`,
      note_en: `A third kind of line. A number in a bold box is banned from the other three squares of that box, even when they sit in different rows and columns.`,
      note_id: `Jenis garis yang ketiga. Bilangan di dalam kotak tebal dilarang muncul di tiga kotak lain dalam kotak tebal itu, walaupun barisnya dan kolomnya berbeda.`,
    })
  } else {
    highlights.push({
      category: 'condition',
      phrase_en: 'a clue in its corner',
      phrase_id: 'petunjuk di pojoknya',
      note_en: `The clue is about the squares INSIDE that frame only. Because a frame is a straight strip, its numbers are all different — which is what makes the clue pin things down.`,
      note_id: `Petunjuk itu hanya bercerita tentang kotak-kotak DI DALAM bingkai itu. Karena bingkai berbentuk jalur lurus, isinya pasti berbeda semua — itulah yang membuat petunjuknya bisa memastikan isi kotak.`,
    })
  }

  if (givens.length > 0) {
    highlights.push({
      category: 'fact',
      phrase_en: 'already filled in',
      phrase_id: 'sudah terisi',
      note_en: `Free numbers, and the best place to start: each one bans itself from the rest of its row, its column${boxed ? ' and its bold box' : ''}.`,
      note_id: `Bilangan gratis, dan tempat terbaik untuk memulai: masing-masing melarang dirinya muncul lagi di sisa baris, kolom${boxed ? ', dan kotak tebalnya' : 'nya'}.`,
    })
  }

  highlights.push({
    category: 'question',
    phrase_en: askClause(ask, letters.length, 'en'),
    phrase_id: askClause(ask, letters.length, 'id'),
    note_en:
      ask === 'single-letter'
        ? `Only square A is asked for, but you will probably have to fill other squares on the way to it.`
        : ask === 'letters-sum'
          ? `Work out ${listEn(marks)} one at a time first, then add them.`
          : `Not ${marks.join(' plus ')} — the numbers stand side by side, ${marks[0]} in the biggest place.`,
    note_id:
      ask === 'single-letter'
        ? `Yang ditanya hanya kotak A, tapi kamu mungkin harus mengisi kotak lain dulu untuk sampai ke situ.`
        : ask === 'letters-sum'
          ? `Cari ${listId(marks)} satu per satu dulu, baru dijumlahkan.`
          : `Bukan ${marks.join(' ditambah ')} — angka-angkanya berdiri berdampingan, ${marks[0]} di tempat paling besar.`,
  })

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Grid', label_id: 'Kisi', value: `${n} × ${n}` },
    { label_en: 'Numbers allowed', label_id: 'Bilangan yang boleh dipakai', value: `1–${n}` },
    {
      label_en: 'Clue system',
      label_id: 'Jenis petunjuk',
      value: boxed
        ? `${BOX_SIZE} × ${BOX_SIZE} boxes`
        : cages.map((cage) => cageClue(cage)).join(', '),
    },
    {
      label_en: 'Squares printed in',
      label_id: 'Kotak yang sudah terisi',
      value:
        givens.length === 0
          ? '—'
          : givens.map((g) => `(${g.r + 1},${g.c + 1})`).join(', '),
    },
    {
      label_en: 'Lettered squares',
      label_id: 'Kotak berhuruf',
      value: marks.map((m, i) => `${m} = (${letters[i].r + 1},${letters[i].c + 1})`).join(', '),
    },
    {
      label_en: 'First square that is forced',
      label_id: 'Kotak pertama yang sudah pasti',
      value: first ? `(${first.cell.r + 1},${first.cell.c + 1})` : '—',
    },
    {
      label_en: 'Steps the answer needs',
      label_id: 'Langkah yang dibutuhkan jawaban',
      value: String(s.neededSteps.length),
    },
    { label_en: 'Answer', label_id: 'Jawaban', value: s.answer },
  ]

  return {
    // The grid, its frames, its printed squares and its letters only exist as a
    // picture; the stem states the rules, the figure carries the clues —
    // exactly how the WMI papers this concept is mined from present it.
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'latin-square-cage',
      name_en: 'Fill the square that has only one number left, then repeat',
      name_id: 'Isi kotak yang tinggal punya satu kemungkinan, lalu ulangi',
    },
    // Only the multi-digit ask has a genuinely tempting wrong answer: the right
    // digits written the wrong way round.
    trap:
      trap === null
        ? null
        : {
            wrong: trap,
            why_en: `${trap} uses the right digits in the wrong order. The question asks for ${marks.join('')} with ${marks[0]} first, and ${marks[0]} holds ${s.letterValues[0]}, so ${s.letterValues[0]} takes the biggest place: ${s.answer}.`,
            why_id: `${trap} memakai angka yang benar tapi urutannya terbalik. Yang diminta adalah ${marks.join('')} dengan ${marks[0]} lebih dulu, dan ${marks[0]} berisi ${s.letterValues[0]}, jadi ${s.letterValues[0]} menempati tempat paling besar: ${s.answer}.`,
          },
    answer: {
      form: 'number',
      unit: null,
      value: s.answer,
    },
    vocab: [],
  }
}
