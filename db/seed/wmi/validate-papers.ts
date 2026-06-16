import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validatePaper } from '../../../api/services/wmi/paperImport/validate.js'
import type { PaperFile } from '../../../api/services/wmi/paperImport/types.js'
import { collectPaperFiles, withBrandDefaults } from './paperFiles.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIGURES = path.join(__dirname, 'figures')

const figures = new Set((await fs.readdir(FIGURES)).filter((f) => !f.startsWith('.')))
const paperFiles = await collectPaperFiles()

let problemCount = 0
for (const { fileName, fullPath } of paperFiles) {
  const paper = withBrandDefaults(JSON.parse(await fs.readFile(fullPath, 'utf8')) as PaperFile)
  const problems = validatePaper(paper, figures)
  if (problems.length === 0) {
    console.log(`✓ ${fileName} (${paper.questions.length} questions)`)
  } else {
    problemCount += problems.length
    console.log(`✗ ${fileName}`)
    for (const p of problems) console.log(`    - ${p}`)
  }
}

if (problemCount > 0) {
  console.error(`\n${problemCount} problem(s) found.`)
  process.exit(1)
}
console.log('\nAll papers valid.')
