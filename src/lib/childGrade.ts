// src/lib/childGrade.ts
//
// Infers a child's WMI grade (1-3) from the age group stored on their
// profile. This is the exact reverse of ChildOnboardingWizard's forward
// mapping: the wizard asks TK / SD Kelas 1-6, takes a representative age per
// choice, and stores the FIRST age group (sorted by min_age, as the API
// returns them) whose [minAge, maxAge] contains that age. We replay that
// forward map for every wizard option, collect the options that land on the
// child's age group, and take the youngest (never overshoot difficulty),
// clamped into WMI's 1-3 range (TK / grade 0 → 1; Kelas 4-6 → 3).
//
// Total function: any missing/unknown input falls back to grade 1.

import type { AgeGroupOption, Child } from '../types'

export type InferredWmiGrade = 1 | 2 | 3

// Mirrors GRADE_OPTIONS in ChildOnboardingWizard.tsx (key → representative
// age). schoolGrade 0 = TK.
const WIZARD_GRADE_AGES: Array<{ schoolGrade: number; age: number }> = [
  { schoolGrade: 0, age: 5 }, // TK
  { schoolGrade: 1, age: 6 }, // Kelas 1
  { schoolGrade: 2, age: 7 }, // Kelas 2
  { schoolGrade: 3, age: 8 }, // Kelas 3
  { schoolGrade: 4, age: 9 }, // Kelas 4
  { schoolGrade: 5, age: 10 }, // Kelas 5
  { schoolGrade: 6, age: 11 }, // Kelas 6
]

function clampToWmiGrade(schoolGrade: number): InferredWmiGrade {
  if (schoolGrade <= 1) return 1
  if (schoolGrade >= 3) return 3
  return 2
}

export function inferWmiGrade(
  child: Pick<Child, 'ageGroupId'> | null | undefined,
  ageGroups: readonly AgeGroupOption[] | null | undefined,
): InferredWmiGrade {
  try {
    const ageGroupId = child?.ageGroupId
    if (!ageGroupId || !ageGroups || ageGroups.length === 0) return 1

    // Reproduce the wizard's lookup order (API returns ORDER BY min_age).
    const sorted = [...ageGroups].sort((a, b) => a.minAge - b.minAge)
    const candidates = WIZARD_GRADE_AGES.filter((option) => {
      const match = sorted.find(
        (group) => option.age >= group.minAge && option.age <= group.maxAge,
      )
      return match?.id === ageGroupId
    })
    if (candidates.length === 0) return 1

    return clampToWmiGrade(candidates[0].schoolGrade)
  } catch {
    return 1
  }
}
