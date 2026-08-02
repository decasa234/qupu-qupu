import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { askClause, clueSentence, score, solve, trapAnswer, type Params } from './index.js'

// Authored decomposition of a lock-code deduction. One idea carries the whole
// problem: a report is evidence about the WHOLE list of possible codes, and the
// list only ever gets shorter. The report that found nothing at all is the one
// to read first, because it settles which digits are in play; every other
// report then argues about order.
//
// Every phrase below is assembled from the very same sentences `render` builds
// the body from, so each `phrase_*` is an exact substring of the DISPLAY body
// (the body after `stripSectionLabels` drops the "Find:" / "Cari:" markers).
// Nothing here spans that marker, and no two phrases overlap.
export function buildMastermindCodeDeduceBreakdown(params: Params): Breakdown {
  const { poolSize, codeLength } = params
  const s = solve(params)
  const trap = trapAnswer(params, s)
  const opener = s.steps[0]
  const last = s.steps[s.steps.length - 1]
  const settled = s.steps.find((st) => st.settledDigits !== null)?.settledDigits ?? null

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: `a secret code of ${codeLength} different digits`,
      phrase_id: `kode rahasia berisi ${codeLength} angka berbeda`,
      note_en: `${codeLength} slots in a row, and no digit may be used twice — so the code is ${codeLength} digits picked out and then put in some order.`,
      note_id: `${codeLength} tempat berjajar, dan tidak ada angka yang boleh dipakai dua kali — jadi kodenya ${codeLength} angka yang dipilih lalu disusun dalam suatu urutan.`,
    },
    {
      category: 'fact',
      phrase_en: `each one from 1 to ${poolSize}`,
      phrase_id: `masing-masing dari 1 sampai ${poolSize}`,
      note_en: `Only ${poolSize} digits can ever appear. Cross ${poolSize - codeLength} of them out and the ones left MUST be the code's digits.`,
      note_id: `Hanya ${poolSize} angka yang mungkin muncul. Coret ${poolSize - codeLength} di antaranya dan sisanya PASTI angka-angka kodenya.`,
    },
    {
      category: 'fact',
      phrase_en: 'how many are correct but in the wrong spot',
      phrase_id: 'berapa angka yang benar tetapi salah tempat',
      note_en: 'A digit counted here IS in the code — it is just standing in the wrong slot. That is a clue about order, not about which digits.',
      note_id: 'Angka yang dihitung di sini MEMANG ada di dalam kode — hanya saja berdiri di tempat yang salah. Itu petunjuk tentang urutan, bukan tentang angka mana.',
    },
    {
      category: 'condition',
      phrase_en: clueSentence(opener.clue, 'en'),
      phrase_id: clueSentence(opener.clue, 'id'),
      note_en:
        opener.ruledOut.length > 0
          ? `Read this one first: ${opener.ruledOut.join(', ')} are out, so the code can only be built from ${(settled ?? []).join(', ')}.`
          : `Read this one first — it narrows down which digits the code can be built from.`,
      note_id:
        opener.ruledOut.length > 0
          ? `Baca yang ini dulu: ${opener.ruledOut.join(', ')} gugur, jadi kode hanya bisa disusun dari ${(settled ?? []).join(', ')}.`
          : `Baca yang ini dulu — laporan ini mempersempit angka mana saja yang bisa menyusun kode.`,
    },
    {
      category: 'condition',
      phrase_en: clueSentence(last.clue, 'en'),
      phrase_id: clueSentence(last.clue, 'id'),
      note_en: `Save this one for last: by the time you read it only ${last.before.length} orders are still standing, and it crosses off ${last.killed.length} of them.`,
      note_id: `Simpan yang ini untuk terakhir: saat kamu membacanya hanya tinggal ${last.before.length} urutan yang bertahan, dan laporan ini mencoret ${last.killed.length} di antaranya.`,
    },
    {
      category: 'question',
      phrase_en: askClause('en'),
      phrase_id: askClause('id'),
      note_en: `Write all ${codeLength} digits in the right order — the order is the whole puzzle, not just which digits appear.`,
      note_id: `Tulis ${codeLength} angka itu dalam urutan yang benar — urutannya adalah inti soal ini, bukan hanya angka mana yang muncul.`,
    },
  ]

  const reports = s.clues
    .map((c) => `${c.guess.join(' ')} → ${c.placed} | ${c.present}`)
    .join(', ')

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Digits available', label_id: 'Angka yang tersedia', value: Array.from({ length: poolSize }, (_, i) => i + 1).join(', ') },
    { label_en: 'Slots in the code', label_id: 'Tempat dalam kode', value: String(codeLength) },
    { label_en: 'Guesses reported', label_id: 'Tebakan yang dilaporkan', value: String(params.guesses.length) },
    {
      label_en: 'Reports (right spot | wrong spot)',
      label_id: 'Laporan (tepat | salah tempat)',
      value: reports,
    },
    {
      label_en: 'Digits ruled out at once',
      label_id: 'Angka yang langsung gugur',
      value: opener.ruledOut.length > 0 ? opener.ruledOut.join(', ') : '—',
    },
    {
      label_en: "The code's digits",
      label_id: 'Angka penyusun kode',
      value: settled !== null ? settled.join(', ') : '—',
    },
    {
      label_en: 'Orders still standing after each report',
      label_id: 'Urutan yang bertahan setelah tiap laporan',
      value: s.steps.map((st) => st.after.length).join(' → '),
    },
    { label_en: 'Answer', label_id: 'Jawaban', value: s.answer },
  ]

  return {
    // The guesses and their two counts read far better as a table than as a
    // paragraph — the in-card figure lays them out one row per try. The stem
    // still states every report in words, so the puzzle is answerable without
    // the picture.
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'mastermind-code-deduce',
      name_en: 'Cross codes off the list until one is left',
      name_id: 'Coret kemungkinan kode sampai tersisa satu',
    },
    // The real misconception: stopping once you know WHICH digits are in the
    // code and writing them down in plain order.
    trap:
      trap === null
        ? null
        : (() => {
            const f = score(trap.step.clue.guess, trap.wrong.split('').map(Number))
            const g = trap.step.clue.guess.join(' ')
            return {
              wrong: trap.wrong,
              why_en: `${trap.wrong} uses the right digits but not the right order — knowing which digits are in the code says nothing about where they stand. Line ${trap.wrong} up against the guess ${g}: it would give ${f.placed} in the right spot and ${f.present} in the wrong spot, but the lock reported ${trap.step.clue.placed} and ${trap.step.clue.present}. So ${trap.wrong} is out, and ${s.answer} is the only order left.`,
              why_id: `${trap.wrong} memakai angka yang benar tetapi urutannya salah — tahu angka mana yang ada di kode belum berarti tahu letaknya. Sejajarkan ${trap.wrong} dengan tebakan ${g}: hasilnya ${f.placed} tepat tempat dan ${f.present} salah tempat, padahal gembok melaporkan ${trap.step.clue.placed} dan ${trap.step.clue.present}. Jadi ${trap.wrong} gugur, dan ${s.answer} satu-satunya urutan yang tersisa.`,
            }
          })(),
    answer: {
      form: 'number',
      unit: null,
      value: s.answer,
    },
    vocab: [],
  }
}
