// Pure-data brand registry: NO pg/node/react imports, so client + server + seed
// can all import it. Single source of truth for brand identity + code format.

export interface Round { key: string; code: string; labelEn: string; labelId: string; sort: number }
export interface Level { key: string; code: string; labelEn: string; labelId: string; sort: number; grade?: number }

// Per-brand scoring rules — the single source of truth read by the Fundamentals
// "scoring" lesson block (a brand-aware table + calculator). `penaltyPerWrong`
// is the signed points delta per WRONG answer (≤ 0; 0 = no penalty).
export interface ScoringSection {
  key: string
  labelEn: string
  labelId: string
  pointsPerCorrect: number
  penaltyPerWrong: number
  pointsPerBlank: number
}
export interface BrandScoring {
  startingPoints: number
  sections: ScoringSection[] // ≥1
  notesEn?: string
  notesId?: string
}

export interface Brand {
  slug: string
  prefix: string
  nameEn: string  // display labels for the selector UI
  nameId: string  // display labels for the selector UI
  rounds: Round[]
  levels: Level[]
  variants?: string[]
  defaultDurationMin: number
  scoring: BrandScoring
  formatCode(parts: { yy: string; round: Round; level: Level; variant?: string }): string
}

export interface SectionCount { correct: number; wrong: number; blank: number }

/**
 * Score = startingPoints + Σ_sections (correct·ppc + wrong·penalty + blank·ppb).
 * `counts` aligns with `scoring.sections` by index; missing entries count as 0.
 */
export function computeScore(scoring: BrandScoring, counts: SectionCount[]): number {
  return scoring.sections.reduce((score, s, i) => {
    const c = counts[i] ?? { correct: 0, wrong: 0, blank: 0 }
    return (
      score +
      c.correct * s.pointsPerCorrect +
      c.wrong * s.penaltyPerWrong +
      c.blank * s.pointsPerBlank
    )
  }, scoring.startingPoints)
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
  // VERIFY against the official WMI rulebook — these are documented assumptions
  // (point values may differ by edition/level). The structure is correct; only
  // the numbers need confirming.
  scoring: {
    startingPoints: 0,
    sections: [
      {
        key: 'all',
        labelEn: 'All questions',
        labelId: 'Semua soal',
        pointsPerCorrect: 4,
        penaltyPerWrong: 0,
        pointsPerBlank: 0,
      },
    ],
    notesEn:
      'WMI does not deduct points for wrong answers, so never leave a blank — always put your best guess.',
    notesId:
      'WMI tidak mengurangi nilai untuk jawaban salah, jadi jangan pernah mengosongkan — selalu isi dengan tebakan terbaikmu.',
  },
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
  // VERIFY against the official SASMO rulebook — documented assumptions. The
  // teaching point (Section A penalizes wrong answers, Section B does not) is
  // the structural contrast with WMI; confirm exact point values.
  scoring: {
    startingPoints: 0,
    sections: [
      {
        key: 'a',
        labelEn: 'Section A (multiple choice)',
        labelId: 'Bagian A (pilihan ganda)',
        pointsPerCorrect: 2,
        penaltyPerWrong: -1,
        pointsPerBlank: 0,
      },
      {
        key: 'b',
        labelEn: 'Section B (fill-in)',
        labelId: 'Bagian B (isian)',
        pointsPerCorrect: 4,
        penaltyPerWrong: 0,
        pointsPerBlank: 0,
      },
    ],
    notesEn:
      'A wrong multiple-choice answer in Section A costs you a point, so only guess after eliminating some options. Section B (fill-in) has no penalty.',
    notesId:
      'Jawaban pilihan ganda yang salah di Bagian A mengurangi satu poin, jadi menebak hanya setelah menghapus beberapa pilihan. Bagian B (isian) tidak ada penalti.',
  },
  formatCode: ({ yy, level }) => `SASMO-${yy}-${level.code}`,
}

const BRANDS: Record<string, Brand> = { wmi: WMI, sasmo: SASMO }

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
