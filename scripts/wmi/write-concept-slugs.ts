import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { ALL_SLUGS } from '../../api/services/wmi/concepts/registry.js'

// Format-preserving insertion of breakdown.strategy.conceptSlug into the seed
// papers. The papers use a compact-pretty JSON style with inlined leaf objects,
// so we must NOT reserialize (that would reformat every choice object). Instead
// we insert one line per target question via bounded text surgery, anchored to
// each question's "number" field so a strategy-less question never shifts the
// alignment.

const valid = new Set<string>(ALL_SLUGS)
const map = new Map<string, string>() // `${file}#${number}` -> slug
for (const f of readdirSync('docs/reference/wmi-map-raw')) {
  for (const r of JSON.parse(readFileSync(`docs/reference/wmi-map-raw/${f}`, 'utf8'))) {
    if (r.slug !== 'UNCOVERED' && valid.has(r.slug)) map.set(`${r.file}#${r.number}`, r.slug)
  }
}

const dir = 'db/seed/wmi/papers'
let touched = 0
let skippedNoStrategy = 0

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const path = `${dir}/${file}`
  let text = readFileSync(path, 'utf8')
  const doc = JSON.parse(text)
  const questions: Array<{ number: number }> = doc.questions ?? []

  // Build the edit list first (positions computed against the ORIGINAL text),
  // then apply right-to-left so earlier offsets stay valid.
  type Edit = { at: number; insert: string }
  const edits: Edit[] = []

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const slug = map.get(`${file}#${q.number}`)
    if (!slug) continue

    // Span of this question: from its "number": N field to the next question's.
    const numRe = new RegExp(`"number"\\s*:\\s*${q.number}\\s*,`)
    const nStart = text.search(numRe)
    if (nStart < 0) continue
    let spanEnd = text.length
    if (i + 1 < questions.length) {
      const nextRe = new RegExp(`"number"\\s*:\\s*${questions[i + 1].number}\\s*,`)
      const nextAt = text.slice(nStart + 1).search(nextRe)
      if (nextAt >= 0) spanEnd = nStart + 1 + nextAt
    }

    // Locate this question's strategy object inside its span.
    const stratRe = /"strategy"\s*:\s*\{/g
    stratRe.lastIndex = nStart
    const m = stratRe.exec(text)
    if (!m || m.index >= spanEnd) {
      skippedNoStrategy++
      continue
    }
    const braceAt = m.index + m[0].length // position just after the '{'
    const rest = text.slice(braceAt)
    const value = JSON.stringify(slug)

    if (rest[0] === '\n') {
      // Multiline object: match the indentation of the first inner key.
      const indent = (rest.slice(1).match(/^[ \t]*/) as RegExpMatchArray)[0]
      edits.push({ at: braceAt, insert: `\n${indent}"conceptSlug": ${value},` })
    } else {
      // Inline object: `{ "name_en": ... }`
      const lead = rest[0] === ' ' ? '' : ' '
      edits.push({ at: braceAt, insert: `${lead} "conceptSlug": ${value},` })
    }
    touched++
  }

  edits.sort((a, b) => b.at - a.at)
  for (const e of edits) text = text.slice(0, e.at) + e.insert + text.slice(e.at)
  writeFileSync(path, text)
}

console.log(`set conceptSlug on ${touched} questions; skipped ${skippedNoStrategy} with no strategy object`)
