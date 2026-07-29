import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { derive, type Params } from './index.js'

// Authored decomposition of a sort-count-by-attribute problem: a jumbled picture
// of objects that differ along one attribute; sort, count each group, answer.
// The problem is FIGURE-HEAVY — every number lives in the illustration — so the
// stem carries no digits. The highlights spotlight the three things a grade-1
// child must notice: the pile is mixed (fact), you must group before counting
// (condition), which group(s) the question is about (object), and what to find
// (question).
//
// Display body (after stripSectionLabels removes "Cari:" / "Find:"), example:
//   ID: "Perhatikan gambar di atas. Bentuk-bentuk itu tercampur menjadi satu.
//        Kelompokkan yang sama, lalu hitung tiap kelompok. Berapa banyak lingkaran?"
// Every phrase below is built from the same `derive()` output the body is built
// from, so each phrase is an exact substring of the body in its language.
export function buildSortCountByAttributeBreakdown(params: Params): Breakdown {
  const d = derive(params)

  const highlights: BreakdownHighlight[] = [
    // fact — the pile is jumbled, that is the whole difficulty
    {
      category: 'fact',
      phrase_en: d.factPhrase_en,
      phrase_id: d.factPhrase_id,
      note_en: 'Nothing is tidy yet — the groups are all jumbled up in one picture.',
      note_id: 'Semuanya masih berantakan — kelompoknya tercampur dalam satu gambar.',
    },
    // condition — the rule that makes the counting safe
    {
      category: 'condition',
      phrase_en: d.rulePhrase_en,
      phrase_id: d.rulePhrase_id,
      note_en: 'Group the same ones first. Counting a jumbled pile makes you lose your place.',
      note_id: 'Kumpulkan dulu yang sama. Menghitung yang tercampur membuat hitunganmu kacau.',
    },
  ]

  let trap: Breakdown['trap'] = null

  if (params.ask === 'count-one') {
    const t = params.askIndices[0] ?? 0
    const cat = d.cats[t]
    highlights.push(
      {
        category: 'object',
        phrase_en: cat.plural_en,
        phrase_id: cat.label_id,
        note_en: `Only the ${cat.plural_en} count. Ignore everything else in the picture.`,
        note_id: `Hanya ${cat.label_id} yang dihitung. Abaikan benda yang lain.`,
      },
      {
        category: 'question',
        phrase_en: 'How many',
        phrase_id: 'Berapa banyak',
        note_en: `Find the size of just one group — the ${cat.plural_en}.`,
        note_id: `Cari banyaknya satu kelompok saja — ${cat.label_id}.`,
      },
    )
    trap = {
      wrong: String(d.total),
      why_en: `${d.total} is every object in the picture, not just the ${cat.plural_en}.`,
      why_id: `${d.total} adalah semua benda di gambar, bukan hanya ${cat.label_id}.`,
    }
  } else if (params.ask === 'most') {
    highlights.push({
      category: 'question',
      phrase_en: 'the most of',
      phrase_id: 'yang paling banyak',
      note_en: 'Count every group, then pick the group with the biggest number.',
      note_id: 'Hitung semua kelompok, lalu pilih kelompok dengan bilangan terbesar.',
    })
    const top = d.counts[d.winner]
    const second = d.counts[d.runnerUp]
    // Only a real trap when the two leaders are close — from a glance the runner-up
    // looks just as big, so a child who guesses instead of counting picks it.
    if (top - second <= 2) {
      trap = {
        wrong: d.cats[d.runnerUp].label_id,
        why_en: `The ${d.cats[d.runnerUp].plural_en} look almost as many (${second}), but the ${d.cats[d.winner].plural_en} are ${top}.`,
        why_id: `${d.cats[d.runnerUp].label_id} terlihat hampir sama banyak (${second}), padahal ${d.cats[d.winner].label_id} ada ${top}.`,
      }
    }
  } else if (params.ask === 'difference') {
    const a = params.askIndices[0] ?? 0
    const b = params.askIndices[1] ?? 1
    const ca = d.counts[a]
    const cb = d.counts[b]
    highlights.push(
      {
        category: 'object',
        phrase_en: d.cats[a].plural_en,
        phrase_id: d.cats[a].label_id,
        note_en: `The bigger group in this comparison — count the ${d.cats[a].plural_en} first.`,
        note_id: `Kelompok yang lebih banyak — hitung ${d.cats[a].label_id} lebih dulu.`,
      },
      {
        category: 'object',
        phrase_en: d.cats[b].plural_en,
        phrase_id: d.cats[b].label_id,
        note_en: `The group you compare against — count the ${d.cats[b].plural_en} too.`,
        note_id: `Kelompok pembanding — hitung ${d.cats[b].label_id} juga.`,
      },
      {
        category: 'condition',
        phrase_en: 'than',
        phrase_id: 'daripada',
        note_en: `This word sets the order: ${d.cats[a].plural_en} minus ${d.cats[b].plural_en}.`,
        note_id: `Kata ini menentukan urutan: ${d.cats[a].label_id} dikurangi ${d.cats[b].label_id}.`,
      },
      {
        category: 'question',
        phrase_en: 'How many more',
        phrase_id: 'Berapa lebih banyak',
        note_en: '"How many more" means the gap between the two groups, so subtract.',
        note_id: '"Berapa lebih banyak" berarti selisih dua kelompok, jadi kurangkan.',
      },
    )
    trap = {
      wrong: String(ca),
      why_en: `${ca} is how many ${d.cats[a].plural_en} there are, not the gap. Subtract: ${ca} - ${cb} = ${ca - cb}.`,
      why_id: `${ca} adalah banyaknya ${d.cats[a].label_id}, bukan selisihnya. Kurangkan: ${ca} - ${cb} = ${ca - cb}.`,
    }
  } else {
    highlights.push({
      category: 'question',
      phrase_en: d.q_en,
      phrase_id: d.q_id,
      note_en: 'Count how many different groups there are — not how many objects.',
      note_id: 'Hitung ada berapa kelompok yang berbeda — bukan berapa bendanya.',
    })
    trap = {
      wrong: String(d.total),
      why_en: `${d.total} is how many objects there are. The question asks how many kinds — that is ${d.kinds}.`,
      why_id: `${d.total} adalah banyaknya benda. Yang ditanya banyaknya jenis, yaitu ${d.kinds}.`,
    }
  }

  const quantities: BreakdownQuantity[] = d.cats.map((c, i) => ({
    label_en: c.plural_en,
    label_id: c.label_id,
    value: String(d.counts[i]),
  }))
  quantities.push({ label_en: 'All objects', label_id: 'Semua benda', value: String(d.total) })
  quantities.push({ label_en: 'Kinds', label_id: 'Jenis', value: String(d.kinds) })
  quantities.push({ label_en: 'Answer', label_id: 'Jawaban', value: d.answer })

  return {
    needsVisual: true,
    highlights,
    quantities,

    strategy: {
      conceptSlug: 'sort-count-by-attribute',
      name_en: 'Sort into groups, then count each group',
      name_id: 'Kelompokkan dulu, lalu hitung tiap kelompok',
    },

    trap,

    answer: {
      form: d.answer_type === 'multiple_choice' ? 'choice' : 'number',
      unit: null,
      value: d.answer,
    },

    vocab: [],
  }
}
