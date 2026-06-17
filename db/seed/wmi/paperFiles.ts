import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PaperFile } from '../../../api/services/wmi/paperImport/types.js'

// db/seed (parent of this file's db/seed/wmi dir)
const SEED_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

// WMI seed files predate the brand axis: default brand to 'wmi' and derive the
// level key from the legacy numeric grade ('g'+grade) when absent.
export function withBrandDefaults(p: PaperFile): PaperFile {
  return {
    ...p,
    brand: p.brand ?? 'wmi',
    level: p.level ?? (p.grade != null ? `g${p.grade}` : p.level),
  }
}

// A shell (0 questions) must not overwrite an already-extracted paper.
export function isShellDowngrade(incomingQuestionCount: number, existingQuestionCount: number): boolean {
  return incomingQuestionCount === 0 && existingQuestionCount > 0
}

// Walk db/seed/<brand>/papers/*.json across every brand directory.
export async function collectPaperFiles(): Promise<Array<{ fileName: string; brand: string; fullPath: string }>> {
  const out: Array<{ fileName: string; brand: string; fullPath: string }> = []
  for (const brand of await fs.readdir(SEED_ROOT, { withFileTypes: true })) {
    if (!brand.isDirectory()) continue
    const papersDir = path.join(SEED_ROOT, brand.name, 'papers')
    let entries: string[]
    try { entries = await fs.readdir(papersDir) } catch { continue }
    for (const f of entries.filter((e) => e.endsWith('.json')).sort()) {
      out.push({ fileName: `${brand.name}/${f}`, brand: brand.name, fullPath: path.join(papersDir, f) })
    }
  }
  return out
}
