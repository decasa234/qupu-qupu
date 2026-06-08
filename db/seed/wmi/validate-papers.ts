import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validatePaper } from '../../../api/services/wmi/paperImport/validate.js'
import type { PaperFile } from '../../../api/services/wmi/paperImport/types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PAPERS = path.join(__dirname, 'papers')
const FIGURES = path.join(__dirname, 'figures')

const figures = new Set((await fs.readdir(FIGURES)).filter((f) => !f.startsWith('.')))
const files = (await fs.readdir(PAPERS)).filter((f) => f.endsWith('.json')).sort()

let problemCount = 0
for (const file of files) {
  const paper = JSON.parse(await fs.readFile(path.join(PAPERS, file), 'utf8')) as PaperFile
  const problems = validatePaper(paper, figures)
  if (problems.length === 0) {
    console.log(`✓ ${file} (${paper.questions.length} questions)`)
  } else {
    problemCount += problems.length
    console.log(`✗ ${file}`)
    for (const p of problems) console.log(`    - ${p}`)
  }
}

if (problemCount > 0) {
  console.error(`\n${problemCount} problem(s) found.`)
  process.exit(1)
}
console.log('\nAll papers valid.')
