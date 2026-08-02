import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import {
  askClause,
  countClause,
  itemText,
  LABELS,
  loneClause,
  RULE_CLAUSE_EN,
  RULE_CLAUSE_ID,
  solve,
  trapAnswer,
  type Params,
} from './index.js'

// Authored decomposition of a "which one does not belong" question. The whole
// difficulty sits in one place: the rule is NOT written down, and the child's
// instinct is to look for the option that feels strange. The highlights push the
// other way — find what THREE of them share first, then the fourth names itself.
//
// Every phrase below is assembled from the very same clauses `render` builds the
// body from, so each `phrase_*` is an exact substring of the DISPLAY body (the
// body after `stripSectionLabels` drops the "Find:" / "Cari:" markers). Nothing
// spans that marker, and no two phrases overlap.
export function buildOddOneOutBreakdown(params: Params): Breakdown {
  const { domain, items } = params
  const s = solve(params)
  const trapIndex = trapAnswer(params)

  const thing_en = domain === 'number-sequence' ? 'number' : 'shape'
  const thing_id = domain === 'number-sequence' ? 'bilangan' : 'bangun'

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: countClause(domain, 'en'),
      phrase_id: countClause(domain, 'id'),
      note_en: `Three, not one. The rule belongs to the majority, so start by hunting for something three of them share — the odd ${thing_en} shows up on its own after that.`,
      note_id: `Tiga, bukan satu. Aturan itu milik yang terbanyak, jadi mulailah mencari kesamaan tiga pilihan — ${thing_id} yang tidak sekelompok akan muncul sendiri setelahnya.`,
    },
    {
      category: 'condition',
      phrase_en: RULE_CLAUSE_EN,
      phrase_id: RULE_CLAUSE_ID,
      note_en: `The rule is not written anywhere — that is the puzzle. Try one simple rule at a time on ALL four options and see which rule three of them pass.`,
      note_id: `Aturannya tidak ditulis di mana pun — itulah tekanya. Coba satu aturan sederhana pada KEEMPAT pilihan, lalu lihat aturan mana yang dilewati tiga pilihan.`,
    },
    {
      category: 'condition',
      phrase_en: loneClause(domain, 'en'),
      phrase_id: loneClause(domain, 'id'),
      note_en: `Exactly one. If your rule throws out two options, it is the wrong rule — keep looking for one that only one option fails.`,
      note_id: `Tepat satu. Kalau aturanmu membuang dua pilihan sekaligus, berarti aturannya salah — cari lagi aturan yang hanya dilanggar satu pilihan.`,
    },
    {
      category: 'question',
      phrase_en: askClause(domain, 'en'),
      phrase_id: askClause(domain, 'id'),
      note_en: `Answer with the letter of the option that fails the rule, not with the one that simply looks biggest or strangest.`,
      note_id: `Jawab dengan huruf pilihan yang melanggar aturan, bukan pilihan yang sekadar terlihat paling besar atau paling aneh.`,
    },
  ]

  const optionList = LABELS.map((label, i) => `${label}. ${itemText(domain, items[i], 'id')}`).join(', ')
  const passList = s.checks.map((c) => `${c.label}. ${itemText(domain, items[c.index], 'id')}`).join(', ')

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Options', label_id: 'Pilihan', value: optionList },
    { label_en: 'Rule three of them share', label_id: 'Aturan yang dipatuhi tiga pilihan', value: s.rule_id },
    { label_en: 'Options that pass the rule', label_id: 'Pilihan yang lolos aturan', value: passList },
    {
      label_en: 'Option that breaks it',
      label_id: 'Pilihan yang melanggar',
      value: `${s.answerLabel}. ${s.answerText_id}`,
    },
    { label_en: 'Answer', label_id: 'Jawaban', value: s.answer },
  ]

  return {
    // Numbers and shape names are read as words on the option buttons; there is
    // nothing to draw that the four options do not already say.
    needsVisual: false,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'odd-one-out',
      name_en: 'Find the rule three of them share, then name the one that breaks it',
      name_id: 'Cari aturan yang dipatuhi tiga pilihan, lalu sebut satu yang melanggar',
    },
    // The one wrong move this question really invites: picking the biggest
    // number because being biggest feels like standing out. Worth naming only
    // when the biggest option is not the answer — then it is provably wrong,
    // because that option passes the rule like the other two.
    trap:
      trapIndex === null
        ? null
        : {
            wrong: LABELS[trapIndex],
            why_en: `${LABELS[trapIndex]} (${itemText(domain, items[trapIndex], 'en')}) is only the biggest — and every group of numbers has a biggest one, so that is never a rule. It passes the real rule too: ${s.checks.find((c) => c.index === trapIndex)?.why_en ?? ''}. The one that fails is ${s.answerLabel}.`,
            why_id: `${LABELS[trapIndex]} (${itemText(domain, items[trapIndex], 'id')}) hanya paling besar — dan setiap kumpulan bilangan pasti punya yang paling besar, jadi itu bukan aturan. Pilihan itu juga lolos aturan sebenarnya: ${s.checks.find((c) => c.index === trapIndex)?.why_id ?? ''}. Yang tidak lolos adalah ${s.answerLabel}.`,
          },
    answer: {
      form: 'choice',
      unit: null,
      value: s.answer,
    },
    vocab: [],
  }
}
