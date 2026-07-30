// db/seed/wmi/mark-unplayable-questions.ts
//
// Set wmi_questions.unplayable_reason on questions no child can answer, so the
// drill stops serving them. Idempotent — safe to re-run after importing papers
// or after building new option renderers, which is the point: once a
// CHOICE_RENDERERS entry exists for a code, the next run CLEARS its reason and
// the question comes back.
//
// Two sources of unanswerable questions:
//
//   1. Picture-option questions whose A-E options are figures. The seed stores
//      placeholder text ("(A)", "Gambar B") because the real options are drawn
//      client-side by CHOICE_RENDERERS[code]. Where that component was never
//      built (originals lost), every choice renders identically and the child
//      is guessing between four copies of the same thing.
//
//   2. Defects in the SOURCE paper, where more than one printed option
//      satisfies the stated condition but only one is the official key. These
//      are listed by hand below because no rule can detect them.
//
// Run: tsx db/seed/wmi/mark-unplayable-questions.ts [--dry]

import dotenv from 'dotenv'
import { query } from '../../../api/db.js'
import { questionCode } from '../../../api/services/wmi/paperCode.js'
import { CHOICE_RENDERERS } from '../../../src/components/wmi/PastPapers/WMI/registry.js'

dotenv.config()

// A choice carries no information beyond its own label: "A", "(A)", "Option A",
// "Gambar A", "Pilihan A", optionally behind a markdown picture ref.
const PLACEHOLDER =
  /^\s*(?:!?\[[^\]]*\]\([^)]*\)\s*)?\(?\s*(?:option|gambar|pilihan|opsi)?\s*([A-E])\s*\)?\.?\s*$/i

const allPlaceholder = (choices: unknown): boolean =>
  Array.isArray(choices) &&
  choices.length > 0 &&
  (choices as { text?: string }[]).every((c) => PLACEHOLDER.test(String(c?.text ?? '')))

/**
 * Questions the printed paper itself gets wrong. Keyed by question code so they
 * survive a re-import (row ids do not).
 */
const SOURCE_DEFECTS: Record<string, string> = {
  'WMI-23F1A-Q14':
    'Source-paper defect, not ours: under the printed 7-segment matchstick glyphs BOTH option D (59 -> 50) and option E (65 -> 56) become even when one stick is moved. D is the official key, so a child who reasons correctly to E is still marked wrong. Verified against the official 2023 Final Grade 01 PDF; there is nothing to fix in the seed.',
}

type Row = {
  id: string
  number: number
  choices_en: unknown
  choices_id: unknown
  unplayable_reason: string | null
  year: number
  round: 'final' | 'semifinal'
  brand: string
  level_code: string
  title: string
}

async function main() {
  const dry = process.argv.includes('--dry')

  const rows = await query<Row>(
    `SELECT q.id, q.number, q.choices_en, q.choices_id, q.unplayable_reason,
            p.year, p.round, p.brand, p.level_code, p.title
       FROM wmi_questions q
       JOIN wmi_papers p ON p.id = q.paper_id
      WHERE q.answer_type = 'multiple_choice'
      ORDER BY p.title, q.number`,
  )

  let marked = 0
  let cleared = 0
  let unchanged = 0
  const byPaper = new Map<string, number[]>()

  for (const row of rows) {
    const code = questionCode(
      { brand: row.brand, year: row.year, round: row.round, level: row.level_code },
      row.number,
    )

    // A source defect wins over the placeholder rule: it is the more specific
    // statement about the same question.
    const defect = SOURCE_DEFECTS[code]
    const needsRenderer =
      (allPlaceholder(row.choices_id) || allPlaceholder(row.choices_en)) &&
      !CHOICE_RENDERERS[code as keyof typeof CHOICE_RENDERERS]

    const reason =
      defect ??
      (needsRenderer
        ? `Picture-option question: the A-E option figures were never built (originals lost), so every choice renders as an indistinguishable placeholder. Add a CHOICE_RENDERERS entry for ${code} and re-run this script to bring it back.`
        : null)

    if (reason === row.unplayable_reason) {
      unchanged += 1
      continue
    }
    if (reason) {
      byPaper.set(row.title, [...(byPaper.get(row.title) ?? []), row.number])
      marked += 1
    } else {
      cleared += 1
      console.log(`  restored ${code} — it renders now`)
    }
    if (!dry) {
      await query('UPDATE wmi_questions SET unplayable_reason = $2 WHERE id = $1', [row.id, reason])
    }
  }

  for (const [title, ns] of [...byPaper].sort()) {
    console.log(`  ${title}: Q${ns.sort((a, b) => a - b).join(', Q')}`)
  }

  const [totals] = await query<{ hidden: string; empty: string }>(
    `SELECT (SELECT COUNT(*) FROM wmi_questions WHERE unplayable_reason IS NOT NULL)::text AS hidden,
            (SELECT COUNT(*) FROM (
               SELECT p.id FROM wmi_papers p JOIN wmi_questions q ON q.paper_id = p.id
                GROUP BY p.id HAVING COUNT(*) FILTER (WHERE q.unplayable_reason IS NULL) = 0) z)::text AS empty`,
  )

  console.log(
    `\n${dry ? '[dry run] ' : ''}newly hidden: ${marked}, restored: ${cleared}, unchanged: ${unchanged}`,
  )
  console.log(`hidden in total: ${totals.hidden}`)
  if (Number(totals.empty) > 0) {
    // A paper with nothing left to play would 404 the child rather than teach
    // them anything, so surface it loudly instead of hiding the problem.
    console.error(`WARNING: ${totals.empty} paper(s) now have ZERO playable questions`)
    process.exit(1)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
