import { describe, test, expect } from 'vitest'
import { getBrand, generatePaperCode, generateQuestionCode, listBrands } from './registry.js'

describe('olympiad registry', () => {
  test('WMI reproduces legacy codes', () => {
    expect(generatePaperCode({ year: 2019, round: 'final', grade: 1, variant: 'A' })).toBe('WMI-19F1A')
    expect(generatePaperCode({ year: 2020, round: 'semifinal', grade: 3, variant: 'B' })).toBe('WMI-20P3B')
    expect(generateQuestionCode({ year: 2019, round: 'final', grade: 1, variant: 'A' }, 7)).toBe('WMI-19F1A-Q7')
  })

  test('SASMO single-round segmented code', () => {
    expect(generatePaperCode({ brand: 'sasmo', year: 2019, round: 'contest', level: 'g2' })).toBe('SASMO-19-G2')
    expect(generateQuestionCode({ brand: 'sasmo', year: 2019, round: 'contest', level: 'g2' }, 16)).toBe('SASMO-19-G2-Q16')
  })

  test('registry exposes brand metadata', () => {
    expect(getBrand('wmi').prefix).toBe('WMI')
    expect(getBrand('sasmo').rounds).toHaveLength(1)
    expect(getBrand('sasmo').levels.find((l) => l.key === 'g2')?.labelEn).toBe('Primary 2')
  })

  test('unknown brand / round / level throw', () => {
    expect(() => getBrand('nope')).toThrow()
    expect(() => generatePaperCode({ brand: 'sasmo', year: 2019, round: 'final', level: 'g2' })).toThrow()
    expect(() => generatePaperCode({ brand: 'wmi', year: 2019, round: 'final', level: 'g9', variant: 'A' })).toThrow()
  })

  test('throws when neither level nor grade is provided', () => {
    expect(() => generatePaperCode({ year: 2019, round: 'final', variant: 'A' } as never)).toThrow(/requires "level" or "grade"/)
  })

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

  test('remaining brands produce expected codes', () => {
    expect(generatePaperCode({ brand: 'seamo', year: 2019, round: 'contest', level: 'a' })).toBe('SEAMO-19-A')
    expect(generatePaperCode({ brand: 'seamo-x', year: 2022, round: 'contest', level: 'b' })).toBe('SEAMOX-22-B')
    expect(generatePaperCode({ brand: 'ikmc', year: 2023, round: 'contest', level: 'preecolier' })).toBe('IKMC-23-PE')
    expect(generatePaperCode({ brand: 'timo', year: 2022, round: 'heat', level: 'p1' })).toBe('TIMO-22-P1H')
    expect(generatePaperCode({ brand: 'hkimo', year: 2023, round: 'semifinal', level: 'p1' })).toBe('HKIMO-23-P1SF')
    expect(generatePaperCode({ brand: 'osn', year: 2024, round: 'provinsi', level: 'sd' })).toBe('OSN-24-SD-PROV')
    expect(generatePaperCode({ brand: 'osn', year: 2024, round: 'nasional', level: 'sd', variant: 'teori1' })).toBe('OSN-24-SD-NAS-TEORI1')
  })

  test('all ten brands are registered', () => {
    expect(listBrands().map((b) => b.slug).sort()).toEqual(
      ['hkimo', 'ikmc', 'iob', 'osn', 'sasmo', 'seamo', 'seamo-x', 'simoc', 'timo', 'wmi'],
    )
  })
})
