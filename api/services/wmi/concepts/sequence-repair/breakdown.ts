import type { Breakdown, BreakdownHighlight, BreakdownQuantity, BreakdownTrap } from '../types.js'
import {
  answerOf,
  cleanTerms,
  displayNumbers,
  ruleLabel,
  texts,
  type Params,
} from './index.js'

// Authored decomposition of a sequence-repair problem: a number sequence has
// been damaged (a term taken out, an extra term wedged in, or a stretch of
// terms hidden) and the child must read the rule off the intact part before
// fixing it. Every highlight phrase is taken from `texts(params)`, the same
// source the body is built from, so a phrase can never drift out of the body.
export function buildSequenceRepairBreakdown(params: Params): Breakdown {
  const t = texts(params)
  const clean = cleanTerms(params)
  const answer = answerOf(params)
  const d = params.defect

  const highlights: BreakdownHighlight[] = [
    // fact — the damaged sequence itself
    {
      category: 'fact',
      phrase_en: t.seq,
      phrase_id: t.seq,
      note_en: 'The part that is still intact tells you the rule. Read it first.',
      note_id: 'Bagian yang masih utuh memberi tahu aturannya. Baca itu dulu.',
    },
    // condition — what exactly is wrong with it
    {
      category: 'condition',
      phrase_en: t.condition_en,
      phrase_id: t.condition_id,
      note_en:
        d.kind === 'interior-blank'
          ? 'Only one spot is empty. Everything else still obeys the rule.'
          : d.kind === 'intruder'
            ? 'Only one number is wrong. Take it out and the rule works again.'
            : 'The dots stand for several numbers in a row, not just one.',
      note_id:
        d.kind === 'interior-blank'
          ? 'Hanya satu tempat yang kosong. Bilangan lainnya masih menurut aturan.'
          : d.kind === 'intruder'
            ? 'Hanya satu bilangan yang salah. Buang bilangan itu, aturannya benar lagi.'
            : 'Titik-titik itu mewakili beberapa bilangan berurutan, bukan satu saja.',
    },
    // question — what to hand back
    {
      category: 'question',
      phrase_en: t.question_en,
      phrase_id: t.question_id,
      note_en:
        d.kind === 'hidden-run'
          ? 'Answer with how MANY numbers are hidden, not with the numbers themselves.'
          : 'Answer with one number.',
      note_id:
        d.kind === 'hidden-run'
          ? 'Jawab dengan BERAPA BANYAK bilangan yang tersembunyi, bukan bilangannya.'
          : 'Jawab dengan satu bilangan.',
    },
  ]

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Sequence shown', label_id: 'Barisan yang tampak', value: t.seq },
    { label_en: 'Rule', label_id: 'Aturan', value: ruleLabel(params) },
  ]

  let trap: BreakdownTrap

  if (d.kind === 'interior-blank') {
    const before = clean[d.at - 1]
    const afterBlank = clean[d.at + 1]
    quantities.push(
      { label_en: 'Before the gap', label_id: 'Sebelum tempat kosong', value: String(before) },
      { label_en: 'After the gap', label_id: 'Sesudah tempat kosong', value: String(afterBlank) },
    )
    // Reading the jump ACROSS the empty spot as one step — a two-step gap
    // mistaken for a one-step gap.
    trap =
      params.rule.kind === 'arithmetic'
        ? {
            wrong: String(afterBlank),
            why_en: `From ${before} to ${afterBlank} is two steps, not one.`,
            why_id: `Dari ${before} ke ${afterBlank} itu dua langkah, bukan satu.`,
          }
        : {
            wrong: String(afterBlank),
            why_en: `${afterBlank} belongs to the other family, not the family the empty spot is in.`,
            why_id: `${afterBlank} milik keluarga yang lain, bukan keluarga tempat kosong itu.`,
          }
  } else if (d.kind === 'intruder') {
    const shown = displayNumbers(params)
    const neighbourAfter = shown[d.at + 1]
    quantities.push(
      { label_en: 'Before it', label_id: 'Sebelumnya', value: String(shown[d.at - 1]) },
      { label_en: 'After it', label_id: 'Sesudahnya', value: String(neighbourAfter) },
    )
    // Blaming the number the pattern "breaks at" instead of the one that broke it.
    trap = {
      wrong: String(neighbourAfter),
      why_en: `Removing ${neighbourAfter} still leaves the pattern broken.`,
      why_id: `Kalau ${neighbourAfter} yang dibuang, polanya tetap rusak.`,
    }
  } else {
    const before = clean[d.from - 1]
    const after = clean[d.from + d.count]
    quantities.push(
      { label_en: 'Before the dots', label_id: 'Sebelum titik-titik', value: String(before) },
      { label_en: 'After the dots', label_id: 'Sesudah titik-titik', value: String(after) },
      { label_en: 'Jumps between them', label_id: 'Lompatan di antaranya', value: String(d.count + 1) },
    )
    // Counting the jumps instead of the hidden numbers — the classic off-by-one.
    trap = {
      wrong: String(d.count + 1),
      why_en: `There are ${d.count + 1} jumps from ${before} to ${after}, but ${after} is already shown, so it is not one of the hidden numbers.`,
      why_id: `Dari ${before} ke ${after} ada ${d.count + 1} lompatan, tetapi ${after} sudah terlihat, jadi tidak ikut dihitung.`,
    }
  }

  quantities.push({ label_en: 'Answer', label_id: 'Jawaban', value: answer })

  return {
    // The sequence reads inline in the body text — nothing to draw.
    needsVisual: false,
    highlights,
    quantities,

    strategy: {
      conceptSlug: 'sequence-repair',
      name_en: 'Read the rule, then repair',
      name_id: 'Baca aturannya, lalu perbaiki',
    },

    trap,

    answer: {
      form: 'number',
      unit: null,
      value: answer,
    },

    vocab: [],
  }
}
