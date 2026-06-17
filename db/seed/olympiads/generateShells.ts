import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBrand } from '../../../api/services/wmi/olympiads/registry.js'
import type { PaperFile } from '../../../api/services/wmi/paperImport/types.js'

export type ShellInput = {
  brand: string
  year: number
  level: string
  round: string
  title: string
  source_url: string
}

const SEED_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..') // db/seed

// Stable, portable source pointer for a share file (the share itself is not committed).
export function shareRef(relPath: string): string {
  return `qupusmb:${relPath}`
}

const isAnswerKey = (f: string) => /answer\s*-?key/i.test(f)

// SIMOC filenames: "Grade-2-SIMOC-2019.pdf", "Grade-10-and-JC-SIMOC-2019.pdf",
// "2021-SIMOC-Grade-1.pdf". Answer keys skipped.
export function simocShellFromFile(fileName: string): ShellInput | null {
  if (isAnswerKey(fileName) || !fileName.toLowerCase().endsWith('.pdf')) return null
  let grade: number | undefined
  let year: number | undefined
  let dir = 'SIMOC 2019'
  const perGrade = fileName.match(/Grade-(\d+)(?:-and-JC)?-SIMOC-(\d{4})\.pdf$/i)
  const byYear = fileName.match(/^(\d{4})-SIMOC-Grade-(\d+)\.pdf$/i)
  if (perGrade) { grade = Number(perGrade[1]); year = Number(perGrade[2]) }
  else if (byYear) { year = Number(byYear[1]); grade = Number(byYear[2]); dir = 'SIMOC Grade 1' }
  else return null
  if (grade == null || year == null) return null
  return {
    brand: 'simoc', year, level: `g${grade}`, round: 'contest',
    title: `SIMOC ${year} Grade ${grade}`,
    source_url: shareRef(`PastPapers/${dir}/${fileName}`),
  }
}

// SASMO in-repo files: "SASMO-2019-2020-G2.pdf" (take 2019), "SASMO-2020-G2.pdf" (take 2020).
export function sasmoShellsFromFile(fileName: string): ShellInput[] {
  const bundle = fileName.match(/^SASMO-(\d{4})-\d{4}-G(\d)\.pdf$/i)
  const single = fileName.match(/^SASMO-(\d{4})-G(\d)\.pdf$/i)
  const m = bundle ?? single
  if (!m) return []
  const year = Number(m[1])
  const grade = Number(m[2])
  return [{
    brand: 'sasmo', year, level: `g${grade}`, round: 'contest',
    title: `SASMO ${year} Primary ${grade}`,
    source_url: `docs/reference/competition-papers/sasmo/past-papers/${fileName}`,
  }]
}

export function shellToPaperFile(s: ShellInput): PaperFile {
  const brand = getBrand(s.brand)
  return {
    brand: s.brand,
    year: s.year,
    level: s.level,
    round: s.round,
    variant: 'A',
    title: s.title,
    source_url: s.source_url,
    recommended_duration_min: brand.defaultDurationMin,
    questions: [],
  }
}

// Write one JSON per shell into db/seed/<brand>/papers/<code>.json
export async function writeShells(brand: string, shells: ShellInput[]): Promise<number> {
  const dir = path.join(SEED_ROOT, brand, 'papers')
  await fs.mkdir(dir, { recursive: true })
  for (const s of shells) {
    const pf = shellToPaperFile(s)
    const base = `${s.year}-${s.round}-${s.level}.json`
    await fs.writeFile(path.join(dir, base), JSON.stringify(pf, null, 2) + '\n', 'utf8')
  }
  return shells.length
}
