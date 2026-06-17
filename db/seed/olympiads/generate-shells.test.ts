import { describe, test, expect } from 'vitest'
import { simocShellFromFile, shellToPaperFile, sasmoShellsFromFile, iobRoundKey, iobLevelKey, iobShellsFromIndex, seamoShellFromFile, seamoXShellFromFile, ikmcShellFromFile } from './generateShells.js'

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

describe('SEAMO / SEAMO-X / IKMC shell mapping', () => {
  test('SEAMO paper A → shell', () => {
    expect(seamoShellFromFile('SEAMO-2019-Paper-A.pdf')).toEqual({
      brand: 'seamo', year: 2019, level: 'a', round: 'contest',
      title: 'SEAMO 2019 Paper A',
      source_url: 'docs/reference/competition-papers/seamo/past-papers/SEAMO-2019-Paper-A.pdf',
    })
  })
  test('SEAMO ignores SEAMO-X files and Solutions PDFs', () => {
    expect(seamoShellFromFile('SEAMO-X-2020-Paper-A.pdf')).toBeNull()
    expect(seamoShellFromFile('SEAMO-2016-Paper-A-Solutions.pdf')).toBeNull()
  })
  test('SEAMO-X paper → shell (brand seamo-x); ignores plain SEAMO', () => {
    expect(seamoXShellFromFile('SEAMO-X-2022-Paper-B.pdf')).toMatchObject({ brand: 'seamo-x', year: 2022, level: 'b', round: 'contest' })
    expect(seamoXShellFromFile('SEAMO-2022-Paper-B.pdf')).toBeNull()
  })
  test('IKMC levels + skips answer key', () => {
    expect(ikmcShellFromFile('IKMC-2023-Class1-2_PreEcolier.pdf')).toMatchObject({ brand: 'ikmc', year: 2023, level: 'preecolier', round: 'contest' })
    expect(ikmcShellFromFile('IKMC-2023-Class3-4_Ecolier.pdf')?.level).toBe('ecolier')
    expect(ikmcShellFromFile('IKMC-2023-AnswerKey.pdf')).toBeNull()
  })
})

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
