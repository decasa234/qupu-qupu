// Pure-data brand registry: NO pg/node/react imports, so client + server + seed
// can all import it. Single source of truth for brand identity + code format.

export interface Round { key: string; code: string; labelEn: string; labelId: string; sort: number }
export interface Level { key: string; code: string; labelEn: string; labelId: string; sort: number; grade?: number }
export interface Brand {
  slug: string
  prefix: string
  nameEn: string  // display labels for the selector UI
  nameId: string  // display labels for the selector UI
  rounds: Round[]
  levels: Level[]
  variants?: string[]
  defaultDurationMin: number
  formatCode(parts: { yy: string; round: Round; level: Level; variant?: string }): string
}

export interface PaperCodeInput {
  brand?: string          // default 'wmi'
  year: number
  round: string           // brand round key ('final'|'semifinal'|'contest'|...)
  grade?: number          // legacy WMI input; mapped to level 'g'+grade
  level?: string          // brand level key; preferred
  variant?: string        // default 'A'
}

const WMI: Brand = {
  slug: 'wmi',
  prefix: 'WMI',
  nameEn: 'WMI',
  nameId: 'WMI',
  rounds: [
    { key: 'semifinal', code: 'P', labelEn: 'Semifinal', labelId: 'Semifinal', sort: 0 },
    { key: 'final', code: 'F', labelEn: 'Final', labelId: 'Final', sort: 1 },
  ],
  // WMI grades start at 0 (pre-primary tier); g0..g3 are all real.
  levels: [0, 1, 2, 3].map((g) => ({
    key: `g${g}`, code: String(g), labelEn: `Grade ${g}`, labelId: `Kelas ${g}`, sort: g, grade: g,
  })),
  variants: ['A', 'B'],
  defaultDurationMin: 60,
  // Compact, no separators: WMI-19F1A
  formatCode: ({ yy, round, level, variant }) => `WMI-${yy}${round.code}${level.code}${variant ?? 'A'}`,
}

const SASMO: Brand = {
  slug: 'sasmo',
  prefix: 'SASMO',
  nameEn: 'SASMO',
  nameId: 'SASMO',
  rounds: [{ key: 'contest', code: '', labelEn: 'Contest', labelId: 'Kontes', sort: 0 }],
  levels: [
    { key: 'g2', code: 'G2', labelEn: 'Primary 2', labelId: 'Primary 2 (Kelas 2)', sort: 2, grade: 2 },
    { key: 'g3', code: 'G3', labelEn: 'Primary 3', labelId: 'Primary 3 (Kelas 3)', sort: 3, grade: 3 },
    { key: 'g4', code: 'G4', labelEn: 'Primary 4', labelId: 'Primary 4 (Kelas 4)', sort: 4, grade: 4 },
    { key: 'g5', code: 'G5', labelEn: 'Primary 5', labelId: 'Primary 5 (Kelas 5)', sort: 5, grade: 5 },
    { key: 'g6', code: 'G6', labelEn: 'Primary 6', labelId: 'Primary 6 (Kelas 6)', sort: 6, grade: 6 },
    { key: 's1', code: 'S1', labelEn: 'Secondary 1', labelId: 'Secondary 1', sort: 7 },
    { key: 's2', code: 'S2', labelEn: 'Secondary 2', labelId: 'Secondary 2', sort: 8 },
    { key: 's3', code: 'S3', labelEn: 'Secondary 3', labelId: 'Secondary 3', sort: 9 },
    { key: 's4', code: 'S4', labelEn: 'Secondary 4', labelId: 'Secondary 4', sort: 10 },
  ],
  // No variant; segmented: SASMO-19-G2
  defaultDurationMin: 90,
  formatCode: ({ yy, level }) => `SASMO-${yy}-${level.code}`,
}

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

const SEAMO: Brand = {
  slug: 'seamo', prefix: 'SEAMO', nameEn: 'SEAMO', nameId: 'SEAMO',
  rounds: [{ key: 'contest', code: '', labelEn: 'Contest', labelId: 'Kontes', sort: 0 }],
  levels: [
    { key: 'k', code: 'K', labelEn: 'Kindergarten', labelId: 'TK', sort: 0 },
    { key: 'a', code: 'A', labelEn: 'Paper A (Grades 1-2)', labelId: 'Paper A (Kelas 1-2)', sort: 1 },
    { key: 'b', code: 'B', labelEn: 'Paper B (Grades 3-4)', labelId: 'Paper B (Kelas 3-4)', sort: 2 },
    { key: 'c', code: 'C', labelEn: 'Paper C (Grades 5-6)', labelId: 'Paper C (Kelas 5-6)', sort: 3 },
    { key: 'd', code: 'D', labelEn: 'Paper D', labelId: 'Paper D', sort: 4 },
    { key: 'e', code: 'E', labelEn: 'Paper E', labelId: 'Paper E', sort: 5 },
    { key: 'f', code: 'F', labelEn: 'Paper F', labelId: 'Paper F', sort: 6 },
  ],
  defaultDurationMin: 90,
  formatCode: ({ yy, level }) => `SEAMO-${yy}-${level.code}`,
}

const SEAMO_X: Brand = {
  slug: 'seamo-x', prefix: 'SEAMOX', nameEn: 'SEAMO X', nameId: 'SEAMO X',
  rounds: [{ key: 'contest', code: '', labelEn: 'Contest', labelId: 'Kontes', sort: 0 }],
  levels: [
    { key: 'a', code: 'A', labelEn: 'Paper A (Grades 1-2)', labelId: 'Paper A (Kelas 1-2)', sort: 1 },
    { key: 'b', code: 'B', labelEn: 'Paper B (Grades 3-4)', labelId: 'Paper B (Kelas 3-4)', sort: 2 },
    { key: 'c', code: 'C', labelEn: 'Paper C (Grades 5-6)', labelId: 'Paper C (Kelas 5-6)', sort: 3 },
  ],
  defaultDurationMin: 90,
  formatCode: ({ yy, level }) => `SEAMOX-${yy}-${level.code}`,
}

const IKMC: Brand = {
  slug: 'ikmc', prefix: 'IKMC', nameEn: 'IKMC', nameId: 'IKMC',
  rounds: [{ key: 'contest', code: '', labelEn: 'Contest', labelId: 'Kontes', sort: 0 }],
  levels: [
    { key: 'preecolier', code: 'PE', labelEn: 'Pre-Ecolier (Class 1-2)', labelId: 'Pre-Ecolier (Kelas 1-2)', sort: 1, grade: 1 },
    { key: 'ecolier', code: 'EC', labelEn: 'Ecolier (Class 3-4)', labelId: 'Ecolier (Kelas 3-4)', sort: 2, grade: 3 },
    { key: 'benjamin', code: 'BE', labelEn: 'Benjamin (Class 5-6)', labelId: 'Benjamin (Kelas 5-6)', sort: 3 },
    { key: 'cadet', code: 'CA', labelEn: 'Cadet (Class 7-8)', labelId: 'Cadet (Kelas 7-8)', sort: 4 },
    { key: 'junior', code: 'JU', labelEn: 'Junior (Class 9-10)', labelId: 'Junior (Kelas 9-10)', sort: 5 },
    { key: 'student', code: 'ST', labelEn: 'Student (Class 11-12)', labelId: 'Student (Kelas 11-12)', sort: 6 },
  ],
  defaultDurationMin: 120,
  formatCode: ({ yy, level }) => `IKMC-${yy}-${level.code}`,
}

const TIMO: Brand = {
  slug: 'timo', prefix: 'TIMO', nameEn: 'TIMO', nameId: 'TIMO',
  rounds: [
    { key: 'prelim', code: 'PRE', labelEn: 'Preliminary', labelId: 'Penyisihan', sort: 0 },
    { key: 'heat', code: 'H', labelEn: 'Heat', labelId: 'Heat', sort: 1 },
    { key: 'final', code: 'F', labelEn: 'Final', labelId: 'Final', sort: 2 },
  ],
  levels: [1, 2, 3, 4, 5, 6].map((g) => ({
    key: `p${g}`, code: `P${g}`, labelEn: `Primary ${g}`, labelId: `Primary ${g}`, sort: g, grade: g,
  })),
  defaultDurationMin: 90,
  formatCode: ({ yy, round, level }) => `TIMO-${yy}-${level.code}${round.code}`,
}

const OSN: Brand = {
  slug: 'osn', prefix: 'OSN',
  nameEn: 'Olimpiade Sains Nasional (Matematika)', nameId: 'Olimpiade Sains Nasional (Matematika)',
  rounds: [
    { key: 'kecamatan', code: 'KEC', labelEn: 'District', labelId: 'Kecamatan', sort: 0 },
    { key: 'kabupaten', code: 'KAB', labelEn: 'Regency', labelId: 'Kabupaten/Kota', sort: 1 },
    { key: 'provinsi', code: 'PROV', labelEn: 'Province', labelId: 'Provinsi', sort: 2 },
    { key: 'nasional', code: 'NAS', labelEn: 'National', labelId: 'Nasional', sort: 3 },
  ],
  levels: [
    { key: 'sd', code: 'SD', labelEn: 'Elementary (SD)', labelId: 'Sekolah Dasar (SD)', sort: 0 },
    { key: 'smp', code: 'SMP', labelEn: 'Junior High (SMP)', labelId: 'SMP', sort: 1 },
    { key: 'sma', code: 'SMA', labelEn: 'Senior High (SMA)', labelId: 'SMA', sort: 2 },
  ],
  // No `variants` array on purpose: OSN national sub-papers (teori1/teori2/eksperimen/
  // final/semifinal) ride in the `variant` field, so arbitrary variant strings must pass
  // the import-time validator (which only checks against `variants` when it is defined).
  defaultDurationMin: 150,
  formatCode: ({ yy, round, level, variant }) =>
    `OSN-${yy}-${level.code}-${round.code}${variant && variant !== 'A' ? `-${variant.toUpperCase()}` : ''}`,
}

const HKIMO: Brand = {
  slug: 'hkimo', prefix: 'HKIMO', nameEn: 'HKIMO', nameId: 'HKIMO',
  rounds: [
    { key: 'heat', code: 'H', labelEn: 'Heat', labelId: 'Heat', sort: 0 },
    { key: 'semifinal', code: 'SF', labelEn: 'Semifinal', labelId: 'Semifinal', sort: 1 },
    { key: 'final', code: 'F', labelEn: 'Final', labelId: 'Final', sort: 2 },
  ],
  levels: [1, 2, 3, 4, 5, 6].map((g) => ({
    key: `p${g}`, code: `P${g}`, labelEn: `Primary ${g}`, labelId: `Primary ${g}`, sort: g, grade: g,
  })),
  defaultDurationMin: 90,
  formatCode: ({ yy, round, level }) => `HKIMO-${yy}-${level.code}${round.code}`,
}

const BRANDS: Record<string, Brand> = {
  wmi: WMI, sasmo: SASMO, simoc: SIMOC, iob: IOB,
  seamo: SEAMO, 'seamo-x': SEAMO_X, ikmc: IKMC, timo: TIMO, osn: OSN, hkimo: HKIMO,
}

export function getBrand(slug: string): Brand {
  const b = BRANDS[slug]
  if (!b) throw new Error(`Unknown olympiad brand "${slug}"`)
  return b
}

export function listBrands(): Brand[] {
  return Object.values(BRANDS)
}

export function generatePaperCode(input: PaperCodeInput): string {
  const brand = getBrand(input.brand ?? 'wmi')
  const round = brand.rounds.find((r) => r.key === input.round)
  if (!round) throw new Error(`Brand "${brand.slug}" has no round "${input.round}"`)
  const levelKey = input.level ?? (input.grade != null ? `g${input.grade}` : undefined)
  if (levelKey === undefined) throw new Error('generatePaperCode requires "level" or "grade"')
  const level = brand.levels.find((l) => l.key === levelKey)
  if (!level) throw new Error(`Brand "${brand.slug}" has no level "${levelKey}"`)
  const yy = String(input.year).slice(-2)
  // Brands with variants default to their first variant (WMI → 'A') when none is given.
  const variant = input.variant ?? brand.variants?.[0]
  return brand.formatCode({ yy, round, level, variant })
}

export function generateQuestionCode(input: PaperCodeInput, n: number): string {
  return `${generatePaperCode(input)}-Q${n}`
}
