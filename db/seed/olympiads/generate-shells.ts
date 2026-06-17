import { promises as fs } from 'node:fs'
import { simocShellFromFile, writeShells, type ShellInput } from './generateShells.js'

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

const brand = process.argv[2]
const generators: Record<string, () => Promise<ShellInput[]>> = { simoc }
const gen = generators[brand]
if (!gen) { console.error(`Usage: tsx db/seed/olympiads/generate-shells.ts <${Object.keys(generators).join('|')}>`); process.exit(1) }
const shells = await gen()
const n = await writeShells(brand, shells)
console.log(`Wrote ${n} ${brand} shells.`)
