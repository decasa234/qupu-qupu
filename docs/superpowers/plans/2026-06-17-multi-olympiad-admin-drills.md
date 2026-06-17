# Multi-Olympiad Admin Drills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the admin drills page cover multiple olympiads by registering the brands and seeding a "paper shell" (metadata + code, zero questions) for every real paper, starting with IOB / SASMO / SIMOC.

**Architecture:** The multi-brand engine already exists (registry + brand-aware `wmi_papers` + a seed loader that walks `db/seed/<brand>/papers/*.json` and accepts empty `questions: []`). We therefore (1) add brand objects to the registry, (2) generate shell JSON files into per-brand seed dirs, and (3) add a "needs extraction" badge for `question_count === 0`. No schema migration, no loader/validator change.

**Tech Stack:** TypeScript, Node/tsx seed scripts, Vitest, React + Vite (admin UI), Postgres.

## Global Constraints

- **Work in the worktree** `/Users/vics/Development/Project/qupu-website/.claude/worktrees/claude-mythos-optimization` (branch `claude-mythos-optimization`). The plain main repo has the pre-merge grade-only code — ignore it.
- **Registry stays pure-data** (no pg/node/react imports). Server/seed import it with `.js`; client imports without `.js`.
- **Add a brand** = define `const X: Brand = {...}` and add `x: X` to the `BRANDS` record in `api/services/wmi/olympiads/registry.ts`.
- **Shell** = a `PaperFile` with `questions: []`. It upserts to `question_count = 0`; that zero IS the "needs extraction" signal (decision T2). Do NOT add a status column.
- **SEAMO X is its own brand** `seamo-x` (decision T1) — relevant only to the later batch.
- **No member-side change** (member papers stay `WHERE brand='wmi'`).
- **The network share** `/Volumes/qupusmb/PastPapers` is machine-local (must be mounted to generate SASMO/IOB/SIMOC shells); it is never committed — only `source_url` pointers are.
- Commands: typecheck `npm run check`; tests `npm test` (vitest); validate shells `npm run wmi:validate`; seed-load `npm run seed:wmi` (needs `DATABASE_URL`).
- The shared `PaperFile` contract lives in `api/services/wmi/paperImport/types.ts`: `{ brand, year, grade?, level, round, variant?, title, source_url?, recommended_duration_min, questions: PaperQuestion[] }`.

---

### Task 1: Register SIMOC and IOB brands

**Files:**
- Modify: `api/services/wmi/olympiads/registry.ts` (add two brand objects + register them in `BRANDS`)
- Test: `api/services/wmi/olympiads/registry.test.ts` (add cases)

**Interfaces:**
- Consumes: existing `Brand`, `Round`, `Level` interfaces; `BRANDS` record; `generatePaperCode`.
- Produces: brands `simoc` and `iob` resolvable via `getBrand('simoc')` / `getBrand('iob')`; codes `SIMOC-19-G2`, `IOB-25-K1-P1`, `IOB-25-TK-F`.

- [ ] **Step 1: Write the failing tests** — append inside the existing `describe('olympiad registry', ...)` block in `registry.test.ts`:

```ts
  test('SIMOC per-grade segmented code', () => {
    expect(generatePaperCode({ brand: 'simoc', year: 2019, round: 'contest', level: 'g2' })).toBe('SIMOC-19-G2')
    expect(generatePaperCode({ brand: 'simoc', year: 2021, round: 'contest', level: 'g1' })).toBe('SIMOC-21-G1')
    expect(getBrand('simoc').levels.find((l) => l.key === 'jc')?.code).toBe('JC')
  })

  test('IOB code carries level + round, bilingual season brand', () => {
    expect(generatePaperCode({ brand: 'iob', year: 2025, round: 'prelim1', level: 'k1' })).toBe('IOB-25-K1-P1')
    expect(generatePaperCode({ brand: 'iob', year: 2025, round: 'final', level: 'tk' })).toBe('IOB-25-TK-F')
    expect(getBrand('iob').rounds.map((r) => r.key)).toEqual(['prelim1', 'prelim2', 'prelim3', 'final', 'grandfinal'])
    expect(getBrand('iob').defaultDurationMin).toBe(60)
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- registry`
Expected: FAIL — `getBrand('simoc')` / `getBrand('iob')` throw `Unknown olympiad brand`.

- [ ] **Step 3: Add the two brand objects** in `registry.ts`, immediately after the `SASMO` const:

```ts
const SIMOC: Brand = {
  slug: 'simoc',
  prefix: 'SIMOC',
  nameEn: 'SIMOC',
  nameId: 'SIMOC',
  rounds: [{ key: 'contest', code: '', labelEn: 'Contest', labelId: 'Kontes', sort: 0 }],
  levels: [
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((g) => ({
      key: `g${g}`, code: `G${g}`, labelEn: `Grade ${g}`, labelId: `Kelas ${g}`, sort: g, grade: g,
    })),
    { key: 'jc', code: 'JC', labelEn: 'Junior College', labelId: 'JC', sort: 11 },
  ],
  defaultDurationMin: 75, // TODO confirm SIMOC written-round duration
  formatCode: ({ yy, level }) => `SIMOC-${yy}-${level.code}`,
}

// Indonesian Olympiad Battle — blended, bilingual (ID/EN), TK..Kelas 12,
// 3 stages (Preliminary 1/2/3 -> Final -> Grand Final), 20 questions, 60 min
// (90 min Grand Final). "Season 1" is the Mathematics season.
const IOB: Brand = {
  slug: 'iob',
  prefix: 'IOB',
  nameEn: 'Indonesian Olympiad Battle',
  nameId: 'Indonesian Olympiad Battle',
  rounds: [
    { key: 'prelim1', code: 'P1', labelEn: 'Preliminary 1', labelId: 'Penyisihan 1', sort: 0 },
    { key: 'prelim2', code: 'P2', labelEn: 'Preliminary 2', labelId: 'Penyisihan 2', sort: 1 },
    { key: 'prelim3', code: 'P3', labelEn: 'Preliminary 3', labelId: 'Penyisihan 3', sort: 2 },
    { key: 'final', code: 'F', labelEn: 'Final', labelId: 'Final', sort: 3 },
    { key: 'grandfinal', code: 'GF', labelEn: 'Grand Final', labelId: 'Grand Final', sort: 4 },
  ],
  levels: [
    { key: 'tk', code: 'TK', labelEn: 'Kindergarten', labelId: 'TK', sort: 0, grade: 0 },
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => ({
      key: `k${g}`, code: `K${g}`, labelEn: `Grade ${g}`, labelId: `Kelas ${g}`, sort: g, grade: g,
    })),
  ],
  defaultDurationMin: 60,
  formatCode: ({ yy, round, level }) => `IOB-${yy}-${level.code}-${round.code}`,
}
```

Then register them — change the `BRANDS` line:

```ts
const BRANDS: Record<string, Brand> = { wmi: WMI, sasmo: SASMO, simoc: SIMOC, iob: IOB }
```

- [ ] **Step 4: Run tests + typecheck to verify they pass**

Run: `npm test -- registry && npm run check`
Expected: PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add api/services/wmi/olympiads/registry.ts api/services/wmi/olympiads/registry.test.ts
git commit -m "feat(olympiads): register SIMOC and IOB brands"
```

---

### Task 2: Shell generator scaffold + SIMOC shells (pilot)

**Files:**
- Create: `db/seed/olympiads/generateShells.ts` (pure mapping helpers + writer)
- Create: `db/seed/olympiads/generate-shells.ts` (CLI entry that invokes the brand generators)
- Create: `db/seed/olympiads/generate-shells.test.ts` (vitest, pure helpers)
- Create (generated): `db/seed/simoc/papers/*.json`
- Modify: `package.json` (add `seed:shells` script)

**Interfaces:**
- Consumes: `PaperFile` from `api/services/wmi/paperImport/types.js`; `getBrand` from the registry.
- Produces: `type ShellInput = { brand: string; year: number; level: string; round: string; title: string; source_url: string }`; `simocShellFromFile(fileName: string): ShellInput | null`; `writeShells(brand: string, shells: ShellInput[]): Promise<void>` (writes one JSON per shell with `variant: 'A'`, `recommended_duration_min` from the registry, `questions: []`).

- [ ] **Step 1: Write the failing test** — `db/seed/olympiads/generate-shells.test.ts`:

```ts
import { describe, test, expect } from 'vitest'
import { simocShellFromFile, shellToPaperFile } from './generateShells.js'

describe('SIMOC shell mapping', () => {
  test('per-grade 2019 file → shell', () => {
    expect(simocShellFromFile('Grade-2-SIMOC-2019.pdf')).toEqual({
      brand: 'simoc', year: 2019, level: 'g2', round: 'contest',
      title: 'SIMOC 2019 Grade 2', source_url: 'qupusmb:PastPapers/SIMOC 2019/Grade-2-SIMOC-2019.pdf',
    })
  })
  test('grade-1 by-year file → shell', () => {
    expect(simocShellFromFile('2021-SIMOC-Grade-1.pdf')?.level).toBe('g1')
    expect(simocShellFromFile('2021-SIMOC-Grade-1.pdf')?.year).toBe(2021)
  })
  test('Grade 10 and JC maps to g10', () => {
    expect(simocShellFromFile('Grade-10-and-JC-SIMOC-2019.pdf')?.level).toBe('g10')
  })
  test('answer keys are skipped', () => {
    expect(simocShellFromFile('SIMOC-2019-Answer-Key.pdf')).toBeNull()
    expect(simocShellFromFile('SIMOC-Past-Year-Paper-Grade-1-Answerkey.pdf')).toBeNull()
  })
  test('shellToPaperFile yields an empty-questions PaperFile', () => {
    const shell = simocShellFromFile('Grade-2-SIMOC-2019.pdf')!
    const pf = shellToPaperFile(shell)
    expect(pf.questions).toEqual([])
    expect(pf.variant).toBe('A')
    expect(pf.recommended_duration_min).toBe(75)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- generate-shells`
Expected: FAIL — module `./generateShells.js` not found.

- [ ] **Step 3: Implement `db/seed/olympiads/generateShells.ts`**

```ts
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
```

- [ ] **Step 4: Implement the CLI entry `db/seed/olympiads/generate-shells.ts`**

```ts
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
```

- [ ] **Step 5: Run the helper test to verify it passes**

Run: `npm test -- generate-shells && npm run check`
Expected: PASS.

- [ ] **Step 6: Generate the SIMOC shells + validate**

Run: `tsx db/seed/olympiads/generate-shells.ts simoc && npm run wmi:validate`
Expected: writes ~13 files under `db/seed/simoc/papers/`; validate prints `✓ simoc/...` for each (0 questions) and ends `All papers valid.`

- [ ] **Step 7: Add the npm script + commit**

In `package.json` scripts add: `"seed:shells": "tsx db/seed/olympiads/generate-shells.ts"`.

```bash
git add db/seed/olympiads/ db/seed/simoc/ package.json
git commit -m "feat(seed): shell generator + SIMOC paper shells"
```

---

### Task 3: SASMO shells (from in-repo archive)

**Files:**
- Modify: `db/seed/olympiads/generateShells.ts` (add `sasmoShellsFromFile`)
- Modify: `db/seed/olympiads/generate-shells.ts` (add `sasmo` generator reading the in-repo archive)
- Modify: `db/seed/olympiads/generate-shells.test.ts`
- Create (generated): `db/seed/sasmo/papers/*.json`

**Interfaces:**
- Produces: `sasmoShellsFromFile(fileName: string): ShellInput[]` — the `2019-2020` bundle yields a 2019 shell; the `2020`-only file yields a 2020 shell.

- [ ] **Step 1: Write the failing test** — append to `generate-shells.test.ts`:

```ts
import { sasmoShellsFromFile } from './generateShells.js'

describe('SASMO shell mapping (in-repo archive)', () => {
  test('2019-2020 bundle → 2019 shell', () => {
    expect(sasmoShellsFromFile('SASMO-2019-2020-G2.pdf')).toEqual([{
      brand: 'sasmo', year: 2019, level: 'g2', round: 'contest',
      title: 'SASMO 2019 Primary 2',
      source_url: 'docs/reference/competition-papers/sasmo/past-papers/SASMO-2019-2020-G2.pdf',
    }])
  })
  test('2020-only file → 2020 shell', () => {
    expect(sasmoShellsFromFile('SASMO-2020-G3.pdf')[0]).toMatchObject({ year: 2020, level: 'g3' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- generate-shells`
Expected: FAIL — `sasmoShellsFromFile` not exported.

- [ ] **Step 3: Implement `sasmoShellsFromFile`** in `generateShells.ts`:

```ts
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
```

- [ ] **Step 4: Add the `sasmo` generator** in `generate-shells.ts` (and to the `generators` map):

```ts
import path from 'node:path'

async function sasmo(): Promise<ShellInput[]> {
  const dir = path.join(process.cwd(), 'docs/reference/competition-papers/sasmo/past-papers')
  const out: ShellInput[] = []
  let files: string[]
  try { files = await fs.readdir(dir) } catch { return out }
  for (const f of files) out.push(...sasmoShellsFromFile(f))
  return out
}
```

Update: `import { simocShellFromFile, sasmoShellsFromFile, writeShells, type ShellInput } from './generateShells.js'` and `const generators = { simoc, sasmo }`.

- [ ] **Step 5: Run tests + generate + validate**

Run: `npm test -- generate-shells && tsx db/seed/olympiads/generate-shells.ts sasmo && npm run wmi:validate`
Expected: PASS; ~10 files under `db/seed/sasmo/papers/`; validate green.

- [ ] **Step 6: Commit**

```bash
git add db/seed/olympiads/ db/seed/sasmo/
git commit -m "feat(seed): SASMO paper shells from in-repo archive"
```

---

### Task 4: IOB shells (from `_index.csv`, bilingual, season year)

**Files:**
- Modify: `db/seed/olympiads/generateShells.ts` (add `iobRoundKey`, `iobLevelKey`, `iobShellsFromIndex`)
- Modify: `db/seed/olympiads/generate-shells.ts` (add `iob` generator that parses the share's `_index.csv`)
- Modify: `db/seed/olympiads/generate-shells.test.ts`
- Create (generated): `db/seed/iob/papers/*.json`

**Interfaces:**
- Produces: `iobRoundKey(exam: string): string` (`"Preliminary Exam 1"`→`prelim1`, `"Final"`→`final`); `iobLevelKey(grade: string): string` (`"TK"`→`tk`, `"Kelas 1"`→`k1`); `iobShellsFromIndex(rows: IobIndexRow[], year: number): ShellInput[]` — collapses EN+ID rows for the same (exam, grade) into ONE shell whose `source_url` lists both Drive IDs.
- `type IobIndexRow = { exam: string; grade: string; language: string; filepath: string; google_drive_id: string }`.

> **Step 0 (do first): confirm the IOB Season 1 calendar year.** Read the schedule in `/Volumes/qupusmb/PastPapers/IOB Season 1/_extras/Detail Kompetisi.pdf` §5.2 (or check file dates: `ls -le "/Volumes/qupusmb/PastPapers/IOB Season 1/Final"`). Set `IOB_SEASON1_YEAR` (Step 3) to that value. The default below is **2025** — change it if the schedule says otherwise. The year only affects the `year` column + code (`IOB-25-...`).

- [ ] **Step 1: Write the failing test** — append to `generate-shells.test.ts`:

```ts
import { iobRoundKey, iobLevelKey, iobShellsFromIndex } from './generateShells.js'

describe('IOB shell mapping (index.csv, bilingual)', () => {
  test('round + level key mapping', () => {
    expect(iobRoundKey('Preliminary Exam 1')).toBe('prelim1')
    expect(iobRoundKey('Preliminary Exam 3')).toBe('prelim3')
    expect(iobRoundKey('Final')).toBe('final')
    expect(iobLevelKey('TK')).toBe('tk')
    expect(iobLevelKey('Kelas 1')).toBe('k1')
    expect(iobLevelKey('Kelas 12')).toBe('k12')
  })
  test('EN + ID rows collapse to one shell with both drive ids', () => {
    const rows = [
      { exam: 'Preliminary Exam 1', grade: 'Kelas 1', language: 'EN', filepath: 'Preliminary Exam 1/Kelas 1 - EN.pdf', google_drive_id: 'EN1' },
      { exam: 'Preliminary Exam 1', grade: 'Kelas 1', language: 'ID', filepath: 'Preliminary Exam 1/Kelas 1 - ID.pdf', google_drive_id: 'ID1' },
    ]
    const shells = iobShellsFromIndex(rows, 2025)
    expect(shells).toHaveLength(1)
    expect(shells[0]).toMatchObject({ brand: 'iob', year: 2025, level: 'k1', round: 'prelim1' })
    expect(shells[0].source_url).toBe('gdrive:EN1,ID1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- generate-shells`
Expected: FAIL — functions not exported.

- [ ] **Step 3: Implement** in `generateShells.ts`:

```ts
export type IobIndexRow = { exam: string; grade: string; language: string; filepath: string; google_drive_id: string }

export function iobRoundKey(exam: string): string {
  const m = exam.match(/Preliminary Exam (\d)/i)
  if (m) return `prelim${m[1]}`
  if (/final/i.test(exam)) return 'final'
  throw new Error(`Unknown IOB exam "${exam}"`)
}

export function iobLevelKey(grade: string): string {
  if (/^TK$/i.test(grade.trim())) return 'tk'
  const m = grade.match(/Kelas\s+(\d+)/i)
  if (!m) throw new Error(`Unknown IOB grade "${grade}"`)
  return `k${m[1]}`
}

export function iobShellsFromIndex(rows: IobIndexRow[], year: number): ShellInput[] {
  const byKey = new Map<string, { level: string; round: string; grade: string; exam: string; ids: string[] }>()
  for (const r of rows) {
    const level = iobLevelKey(r.grade)
    const round = iobRoundKey(r.exam)
    const k = `${round}|${level}`
    if (!byKey.has(k)) byKey.set(k, { level, round, grade: r.grade, exam: r.exam, ids: [] })
    byKey.get(k)!.ids.push(r.google_drive_id)
  }
  return [...byKey.values()].map((v) => ({
    brand: 'iob', year, level: v.level, round: v.round,
    title: `IOB Season 1 (${year}) ${v.exam} — ${v.grade}`,
    source_url: `gdrive:${v.ids.join(',')}`,
  }))
}
```

- [ ] **Step 4: Add the `iob` generator** in `generate-shells.ts`:

```ts
const IOB_SEASON1_YEAR = 2025 // confirm against Detail Kompetisi §5.2 schedule (Step 0)

async function iob(): Promise<ShellInput[]> {
  const csv = await fs.readFile(`${SHARE}/IOB Season 1/_index.csv`, 'utf8')
  const [header, ...lines] = csv.trim().split(/\r?\n/)
  const cols = header.split(',')
  const rows = lines.map((line) => {
    // simple CSV: fields are quoted, no embedded commas in these data
    const cells = line.split(',').map((c) => c.replace(/^"|"$/g, ''))
    return Object.fromEntries(cols.map((c, i) => [c, cells[i]])) as unknown as import('./generateShells.js').IobIndexRow
  })
  return iobShellsFromIndex(rows, IOB_SEASON1_YEAR)
}
```

Register `iob` in the `generators` map and the import line.

- [ ] **Step 5: Run tests + generate + validate**

Run: `npm test -- generate-shells && tsx db/seed/olympiads/generate-shells.ts iob && npm run wmi:validate`
Expected: PASS; ~52 files under `db/seed/iob/papers/`; validate green (every IOB round/level is registered in Task 1).

- [ ] **Step 6: Commit**

```bash
git add db/seed/olympiads/ db/seed/iob/
git commit -m "feat(seed): IOB Season 1 paper shells from index.csv (bilingual)"
```

---

### Task 5: "Needs extraction" badge in the admin drills page

**Files:**
- Modify: `src/pages/admin/AdminWmiDrill.tsx` (paper row + active-paper header)

**Interfaces:**
- Consumes: `AdminPaperSummary.question_count` (already present). No API/DTO change — `question_count === 0` is the signal.

- [ ] **Step 1: Add the badge to the paper row.** In the row JSX (the `items.map((p) => ...)` block), immediately BEFORE the `{p.question_count} soal` span, insert:

```tsx
    {p.question_count === 0 && (
      <span
        className="shrink-0 rounded-full bg-amber-100 px-1.5 text-[9px] font-bold text-amber-700"
        title="Belum ada soal — perlu ekstraksi"
      >
        perlu ekstraksi
      </span>
    )}
```

- [ ] **Step 2: Reflect it in the active-paper header.** Where the header renders `{activePaper.question_count} soal` (the `levelLabelOf(activePaper) · {activePaper.year} · {activePaper.question_count} soal` line), change the count span to:

```tsx
{activePaper.question_count} soal{activePaper.question_count === 0 ? ' · perlu ekstraksi' : ''}
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 4: Manual verify (record result).** With shells seeded (`npm run seed:wmi`, needs `DATABASE_URL` + mounted share), open `/admin/wmi-drill`: confirm SIMOC / SASMO / IOB tabs appear, their shells list with the amber "perlu ekstraksi" badge, and existing WMI papers still show their question counts (no badge).

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/AdminWmiDrill.tsx
git commit -m "feat(admin): needs-extraction badge for 0-question paper shells"
```

---

### Task 6 (follow-up batch): remaining brands

Out of the first build. Repeat Task 1 (registry brand object + code tests) and a generator (Tasks 2–4 pattern) for each remaining brand, sourced from `docs/reference/competition-papers/`:
`seamo`, `seamo-x`, `ikmc`, `timo`, `osn`, `hkimo`. Wrinkles per spec §9 (TIMO booklet split, OSN national `variant` sub-papers, SEAMO-X own brand). Each brand = one registry object + one generator function + generated shells + a commit. The admin UI and loader need no further change.

---

## Self-review notes

- **Spec coverage:** registry expansion (Task 1, 6), shell seeding from both sources (Tasks 2–4, 6), admin surfacing (Task 5). The spec's "registry-driven tabs" item is intentionally **dropped (YAGNI)**: once a brand has shells its tab already appears via the existing `brands` memo, so a brand with zero shells has nothing to show anyway. The optional "needs-extraction filter" is also deferred — the badge covers the need.
- **No loader/validator/migration work:** verified the loader walks all brand dirs and upserts `question_count = 0` for `questions: []`, and the validator no-ops on empty papers. Confirmed against current code.
- **DTO `needs_extraction` flag dropped:** `question_count === 0` is computed client-side in Task 5, so neither server `paperReviews.ts` nor client `wmiAdminApi.ts` DTOs change (avoids the two-place sync).
- **Open values to confirm at build time:** IOB Season 1 year (Task 4 Step 0; default 2025) and SIMOC duration (Task 1; default 75) — both config values, not blockers.
