import { promises as fs } from 'node:fs'
import path from 'node:path'
import { simocShellFromFile, sasmoShellsFromFile, iobShellsFromIndex, writeShells, mapDirFiles, seamoShellFromFile, seamoXShellFromFile, ikmcShellFromFile, osnShellFromFile, hkimoShellFromFile, timoShellFromFile, type ShellInput, type IobIndexRow } from './generateShells.js'

const SHARE = '/Volumes/qupusmb/PastPapers'

async function simoc(): Promise<ShellInput[]> {
  const out: ShellInput[] = []
  for (const dir of ['SIMOC 2019', 'SIMOC Grade 1']) {
    let files: string[]
    try { files = await fs.readdir(`${SHARE}/${dir}`) } catch { continue }
    for (const f of files) {
      const shell = simocShellFromFile(f)
      if (shell) out.push(shell)
    }
  }
  return out
}

async function sasmo(): Promise<ShellInput[]> {
  const dir = path.join(process.cwd(), 'docs/reference/competition-papers/sasmo/past-papers')
  const out: ShellInput[] = []
  let files: string[]
  try { files = await fs.readdir(dir) } catch { return out }
  for (const f of files) out.push(...sasmoShellsFromFile(f))
  return out
}

const IOB_SEASON1_YEAR = 2025 // confirmed: Preliminary 1 on 6 December 2025 per Detail Kompetisi §5.2

async function iob(): Promise<ShellInput[]> {
  const csv = await fs.readFile(`${SHARE}/IOB Season 1/_index.csv`, 'utf8')
  const [header, ...lines] = csv.trim().split(/\r?\n/)
  const cols = header.split(',')
  const rows = lines
    .map((line) => {
      // simple CSV: fields are quoted, no embedded commas in these data
      const cells = line.split(',').map((c) => c.replace(/^"|"$/g, ''))
      return Object.fromEntries(cols.map((c, i) => [c, cells[i]])) as unknown as IobIndexRow
    })
    // skip non-paper extras rows (exam="-", e.g. Silabus, Detail Kompetisi)
    .filter((r) => r.exam !== '-')
  return iobShellsFromIndex(rows, IOB_SEASON1_YEAR)
}

async function seamo(): Promise<ShellInput[]> {
  return mapDirFiles(path.join(process.cwd(), 'docs/reference/competition-papers/seamo/past-papers'), seamoShellFromFile)
}

async function seamoX(): Promise<ShellInput[]> {
  return mapDirFiles(path.join(process.cwd(), 'docs/reference/competition-papers/seamo/past-papers'), seamoXShellFromFile)
}

async function ikmc(): Promise<ShellInput[]> {
  return mapDirFiles(path.join(process.cwd(), 'docs/reference/competition-papers/ikmc'), ikmcShellFromFile)
}

async function osn(): Promise<ShellInput[]> {
  return mapDirFiles(path.join(process.cwd(), 'docs/reference/competition-papers/osn'), osnShellFromFile)
}
async function hkimo(): Promise<ShellInput[]> {
  const base = path.join(process.cwd(), 'docs/reference/competition-papers/hkimo')
  const out: ShellInput[] = []
  for (const n of [1, 2, 3, 4, 5, 6]) out.push(...(await mapDirFiles(path.join(base, `primary-${n}`), hkimoShellFromFile)))
  return out
}
async function timo(): Promise<ShellInput[]> {
  return mapDirFiles(path.join(process.cwd(), 'docs/reference/competition-papers/timo'), timoShellFromFile)
}

const brand = process.argv[2]
const generators: Record<string, () => Promise<ShellInput[]>> = { simoc, sasmo, iob, seamo, 'seamo-x': seamoX, ikmc, osn, hkimo, timo }
const gen = generators[brand]
if (!gen) { console.error(`Usage: tsx db/seed/olympiads/generate-shells.ts <${Object.keys(generators).join('|')}>`); process.exit(1) }
const shells = await gen()
const n = await writeShells(brand, shells)
console.log(`Wrote ${n} ${brand} shells.`)
