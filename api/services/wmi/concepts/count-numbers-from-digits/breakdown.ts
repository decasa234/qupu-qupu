import type { Breakdown, BreakdownHighlight, BreakdownQuantity, BreakdownTrap } from '../types.js'
import {
  listEn,
  listId,
  poolPhraseEn,
  poolPhraseId,
  questionEn,
  questionId,
  repeatsClauseEn,
  repeatsClauseId,
  ruleClauseEn,
  ruleClauseId,
  ruleShortEn,
  ruleShortId,
  shapePhraseEn,
  shapePhraseId,
  solve,
  type Params,
} from './index.js'

// Authored decomposition of a "how many numbers can you build" problem. Every
// phrase below is produced by the SAME helper the body is produced from, so a
// highlight can never drift out of the rendered text (the highlighter matches by
// exact substring on the displayed body, and a miss is silent).
//
// The five spans are the five things a child must separate: the digits they own,
// how often each may be reused, how many places the number has (this is where
// the no-leading-zero rule hides), the rule the number must obey, and the ask.
export function buildCountNumbersFromDigitsBreakdown(params: Params): Breakdown {
  const sol = solve(params)
  const k = params.length
  const hasZero = params.digits.includes(0)

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: poolPhraseEn(params.digits),
      phrase_id: poolPhraseId(params.digits),
      note_en: `These ${params.digits.length} digits are all you get. Nothing else may appear in the number.`,
      note_id: `Cuma ${params.digits.length} angka ini yang boleh dipakai. Angka lain tidak boleh muncul.`,
    },
    {
      category: 'condition',
      phrase_en: repeatsClauseEn(params.repeats),
      phrase_id: repeatsClauseId(params.repeats),
      note_en: params.repeats
        ? 'A digit you already used is still available for the next place.'
        : 'Once a digit is used it is gone, so each place has one fewer digit to choose from.',
      note_id: params.repeats
        ? 'Angka yang sudah dipakai masih boleh dipakai lagi di tempat berikutnya.'
        : 'Angka yang sudah dipakai tidak bisa dipakai lagi, jadi pilihan di tempat berikutnya berkurang satu.',
    },
    {
      category: 'fact',
      phrase_en: shapePhraseEn(k),
      phrase_id: shapePhraseId(k),
      note_en: hasZero
        ? `${k} places to fill — and the first place can never hold 0, or it would not be a ${k}-digit number. So the first digit is one of ${listEn(sol.firstDigits)}.`
        : `${k} places to fill, and the first place can never hold 0. Here the first digit is one of ${listEn(sol.firstDigits)}.`,
      note_id: hasZero
        ? `Ada ${k} tempat yang harus diisi — dan tempat pertama tidak boleh 0, nanti bukan bilangan ${k} angka lagi. Jadi angka pertamanya salah satu dari ${listId(sol.firstDigits)}.`
        : `Ada ${k} tempat yang harus diisi, dan tempat pertama tidak boleh 0. Di sini angka pertamanya salah satu dari ${listId(sol.firstDigits)}.`,
    },
    {
      category: 'condition',
      phrase_en: ruleClauseEn(params.filter),
      phrase_id: ruleClauseId(params.filter),
      note_en: `Only the arrangements that are ${ruleShortEn(params.filter)} are kept — ${sol.set.length} of the ${sol.all.length} you can build.`,
      note_id: `Hanya susunan yang ${ruleShortId(params.filter)} yang disimpan — ${sol.set.length} dari ${sol.all.length} susunan yang bisa dibuat.`,
    },
    {
      category: 'question',
      phrase_en: questionEn(params),
      phrase_id: questionId(params),
      note_en:
        params.ask === 'how-many'
          ? 'Lock the first digit, count the ways to fill the rest, then add the branches together.'
          : 'Build the whole list in order first — smallest first digit first — then read the number the question points at.',
      note_id:
        params.ask === 'how-many'
          ? 'Kunci angka pertama, hitung cara mengisi tempat sisanya, lalu jumlahkan tiap cabangnya.'
          : 'Susun dulu daftarnya secara urut — mulai dari angka pertama terkecil — baru ambil bilangan yang ditanya.',
    },
  ]

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Digits available', label_id: 'Angka yang tersedia', value: params.digits.join(', ') },
    { label_en: 'Places to fill', label_id: 'Banyak tempat', value: String(k) },
    { label_en: 'Allowed first digits', label_id: 'Angka pertama yang boleh', value: sol.firstDigits.join(', ') },
    { label_en: 'Arrangements in all', label_id: 'Semua susunan', value: String(sol.all.length) },
    { label_en: 'Numbers that obey the rule', label_id: 'Bilangan yang memenuhi aturan', value: String(sol.set.length) },
    { label_en: 'Answer', label_id: 'Jawaban', value: sol.answer },
  ]

  // Both traps are real numbers a child lands on, computed in solve() by running
  // the very same reader over the wrong list — never invented here.
  let trap: BreakdownTrap = null
  if (sol.trap?.kind === 'leading-zero') {
    const sample = sol.phantoms[0]
    const asNumber = Number(sample)
    trap = {
      wrong: sol.trap.wrong,
      why_en: `"${sample}" starts with 0, so it is really just ${asNumber} — not a ${k}-digit number. Counting arrangements like that gives ${sol.trap.wrong}.`,
      why_id: `"${sample}" diawali 0, jadi nilainya cuma ${asNumber} — bukan bilangan ${k} angka. Kalau susunan seperti itu ikut dihitung, jawabannya jadi ${sol.trap.wrong}.`,
    }
  } else if (sol.trap?.kind === 'ignored-rule') {
    trap = {
      wrong: sol.trap.wrong,
      why_en: `${sol.trap.wrong} is what you get if all ${sol.all.length} arrangements are used without filtering. The question only wants the ones that are ${ruleShortEn(params.filter)}, so ${sol.all.length - sol.set.length} of them must be thrown away.`,
      why_id: `${sol.trap.wrong} keluar kalau semua ${sol.all.length} susunan dipakai tanpa disaring. Soal ini hanya mau yang ${ruleShortId(params.filter)}, jadi ${sol.all.length - sol.set.length} susunan harus dibuang.`,
    }
  }

  return {
    needsVisual: false,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'count-numbers-from-digits',
      name_en: 'Lock the first digit, then count the rest',
      name_id: 'Kunci angka pertama, lalu hitung sisanya',
    },
    trap,
    answer: { form: 'number', unit: null, value: sol.answer },
    vocab: [],
  }
}
