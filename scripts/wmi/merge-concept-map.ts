import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { ALL_SLUGS } from '../../api/services/wmi/concepts/registry.js'

const RAW = 'docs/reference/wmi-map-raw'
const valid = new Set<string>(ALL_SLUGS)

type Row = {
  file: string
  number: number
  grade: number
  round: string
  slug: string
  proposedType?: string
  rationale?: string
  confidence?: number
}

// Read only the canonical per-year files plus any *-patch.json; ignore interim
// shard files (e.g. 2023-part1.json). Patch rows override year rows for the
// same file#number.
const yearFiles = readdirSync(RAW).filter((f) => /^\d{4}\.json$/.test(f))
const patchFiles = readdirSync(RAW).filter((f) => f.endsWith('-patch.json'))

const byKey = new Map<string, Row>()
const load = (f: string) => {
  for (const r of JSON.parse(readFileSync(`${RAW}/${f}`, 'utf8')) as Row[]) {
    byKey.set(`${r.file}#${r.number}`, r)
  }
}
yearFiles.forEach(load)
patchFiles.forEach(load) // patches win

const rows = [...byKey.values()]

// Recover mis-marked gaps: an UNCOVERED row whose proposedType is actually an
// existing slug becomes a covered row for that slug.
let recovered = 0
for (const r of rows) {
  if (r.slug === 'UNCOVERED' && r.proposedType && valid.has(r.proposedType)) {
    r.slug = r.proposedType
    delete r.proposedType
    delete r.rationale
    recovered++
  }
}

const bad = [...new Set(rows.filter((r) => r.slug !== 'UNCOVERED' && !valid.has(r.slug)).map((b) => b.slug))]
if (bad.length) {
  console.error('typo/unknown slugs (fix raw JSON):', bad)
  process.exit(1)
}

const hist = new Map<string, number>()
for (const r of rows) if (r.slug !== 'UNCOVERED') hist.set(r.slug, (hist.get(r.slug) ?? 0) + 1)

const gaps = new Map<string, Row[]>()
for (const r of rows) if (r.slug === 'UNCOVERED') {
  const k = r.proposedType ?? 'unlabeled'
  if (!gaps.has(k)) gaps.set(k, [])
  gaps.get(k)!.push(r)
}

const ref = (r: Row) => `${r.file.replace('.json', '')} #${r.number} (g${r.grade})`
const histLines = [...hist.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => `| ${s} | ${n} |`)
const gapEntries = [...gaps.entries()].sort((a, b) => b[1].length - a[1].length)
const gapLine = ([k, rs]: [string, Row[]]) =>
  `| ${k} | ${rs.length} | ${rs.length >= 3 ? 'BUILD' : '-'} | ${rs.slice(0, 5).map(ref).join('; ')} |`

const uncovered = rows.filter((r) => r.slug === 'UNCOVERED').length
const buildable = gapEntries.filter(([, rs]) => rs.length >= 3)
const gapQ = gapEntries.reduce((a, [, rs]) => a + rs.length, 0)

const md = [
  '# WMI drill concept map',
  '',
  `Total questions: ${rows.length}. Covered: ${rows.length - uncovered}. Uncovered: ${uncovered}.`,
  `Concepts exercised: ${hist.size} / ${ALL_SLUGS.length}. Recovered mis-marked gaps: ${recovered}.`,
  `Uncovered clusters: ${gapEntries.length} (${gapQ} questions). Buildable (>=3): ${buildable.length}.`,
  '',
  '## Buildable gap concepts (>=3 drill questions) — the Phase-2 candidate list',
  '| proposed concept | count | build? | examples |',
  '| --- | --- | --- | --- |',
  ...buildable.map(gapLine),
  '',
  '## Long-tail gaps (<3 questions — not built, noted)',
  '| proposed concept | count | examples |',
  '| --- | --- | --- |',
  ...gapEntries.filter(([, rs]) => rs.length < 3).map(([k, rs]) => `| ${k} | ${rs.length} | ${rs.slice(0, 3).map(ref).join('; ')} |`),
  '',
  '## Concept usage (existing concepts exercised by drills)',
  '| slug | drill questions |',
  '| --- | --- |',
  ...histLines,
  '',
]. join('\n')

writeFileSync('docs/reference/wmi-drill-concept-map.md', md)
console.log(`report written. total=${rows.length} covered=${rows.length - uncovered} uncovered=${uncovered} recovered=${recovered} buildable=${buildable.length}`)
