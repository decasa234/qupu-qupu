import { describe, expect, test } from 'vitest'
import { inferWmiGrade } from './childGrade'
import type { AgeGroupOption } from '../types'

// Seeded age groups (db/seed.sql), in the API's ORDER BY min_age order —
// the same list ChildOnboardingWizard fetches from /public/meta.
const AGE_GROUPS: AgeGroupOption[] = [
  { id: 'g-5-8', name: 'Usia 5-8', minAge: 5, maxAge: 8 },
  { id: 'g-8-10', name: 'Usia 8-10', minAge: 8, maxAge: 10 },
  { id: 'g-10-12', name: 'Usia 10-12', minAge: 10, maxAge: 12 },
]

function childWith(ageGroupId: string | null, grade: number | null = null) {
  return { ageGroupId, grade }
}

describe('inferWmiGrade', () => {
  test('reverses the wizard mapping for each seeded age group', () => {
    // Wizard forward map (first group containing the representative age):
    // TK(5), Kelas 1(6), Kelas 2(7), Kelas 3(8) → Usia 5-8
    // Kelas 4(9), Kelas 5(10)                   → Usia 8-10
    // Kelas 6(11)                               → Usia 10-12
    expect(inferWmiGrade(childWith('g-5-8'), AGE_GROUPS)).toBe(1)
    expect(inferWmiGrade(childWith('g-8-10'), AGE_GROUPS)).toBe(3)
    expect(inferWmiGrade(childWith('g-10-12'), AGE_GROUPS)).toBe(3)
  })

  test('is order-insensitive in the age-group list', () => {
    const shuffled = [AGE_GROUPS[2], AGE_GROUPS[0], AGE_GROUPS[1]]
    expect(inferWmiGrade(childWith('g-5-8'), shuffled)).toBe(1)
    expect(inferWmiGrade(childWith('g-8-10'), shuffled)).toBe(3)
    expect(inferWmiGrade(childWith('g-10-12'), shuffled)).toBe(3)
  })

  test('falls back to grade 1 on missing/unknown input', () => {
    expect(inferWmiGrade(childWith(null), AGE_GROUPS)).toBe(1)
    expect(inferWmiGrade(childWith('not-a-real-group'), AGE_GROUPS)).toBe(1)
    expect(inferWmiGrade(null, AGE_GROUPS)).toBe(1)
    expect(inferWmiGrade(undefined, AGE_GROUPS)).toBe(1)
    expect(inferWmiGrade(childWith('g-5-8'), null)).toBe(1)
    expect(inferWmiGrade(childWith('g-5-8'), [])).toBe(1)
  })

  test('prefers the server-persisted grade over age-group inference', () => {
    expect(inferWmiGrade(childWith(null, 3), [])).toBe(3)
    expect(inferWmiGrade(childWith(null, 5), [])).toBe(3) // clamped to WMI 1-3
    expect(inferWmiGrade(childWith(null, 0), [])).toBe(1) // TK
    // A persisted grade also beats a contradicting age-group inference.
    expect(inferWmiGrade(childWith('g-10-12', 2), AGE_GROUPS)).toBe(2)
  })

  test('falls back to inference when grade is null', () => {
    expect(inferWmiGrade(childWith(null, null), [])).toBe(1)
    expect(inferWmiGrade(childWith('g-8-10', null), AGE_GROUPS)).toBe(3)
  })

  test('maps a finer-grained hypothetical group split to grade 2', () => {
    // If age groups were per-year, Kelas 2 (age 7) should land on grade 2 —
    // guards the clamp logic (TK/K1 → 1, K2 → 2, K3+ → 3).
    const fine: AgeGroupOption[] = [
      { id: 'a5', name: '5', minAge: 5, maxAge: 5 },
      { id: 'a6', name: '6', minAge: 6, maxAge: 6 },
      { id: 'a7', name: '7', minAge: 7, maxAge: 7 },
      { id: 'a8', name: '8', minAge: 8, maxAge: 8 },
      { id: 'a9', name: '9', minAge: 9, maxAge: 9 },
    ]
    expect(inferWmiGrade(childWith('a5'), fine)).toBe(1) // TK → 1
    expect(inferWmiGrade(childWith('a6'), fine)).toBe(1) // Kelas 1
    expect(inferWmiGrade(childWith('a7'), fine)).toBe(2) // Kelas 2
    expect(inferWmiGrade(childWith('a8'), fine)).toBe(3) // Kelas 3
    expect(inferWmiGrade(childWith('a9'), fine)).toBe(3) // Kelas 4 → clamp 3
  })
})
