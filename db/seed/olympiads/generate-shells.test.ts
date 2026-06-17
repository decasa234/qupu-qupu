import { describe, test, expect } from 'vitest'
import { simocShellFromFile, shellToPaperFile, sasmoShellsFromFile, iobRoundKey, iobLevelKey, iobShellsFromIndex } from './generateShells.js'

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
