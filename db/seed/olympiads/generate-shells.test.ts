import { describe, test, expect } from 'vitest'
import { simocShellFromFile, shellToPaperFile, sasmoShellsFromFile } from './generateShells.js'

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
