// src/lib/demoQuestions.ts
//
// Curated, grade-fitted sample questions for the /mulai demo. Keyed by a
// stable "band" derived from the selected age group's minAge — NOT by the
// age-group DB UUID, which differs across environments.

export type DemoBand = 'lower' | 'middle' | 'upper'

export interface DemoQuestion {
  prompt: string
  choices: string[]
  correctIndex: number
  explanation: string
}

// Used when /public/meta is unavailable so the demo still runs. IDs are
// sentinel values (prefixed 'fallback-') and are never persisted as a real
// ageGroupId — see Mulai.tsx.
export const FALLBACK_GRADES = [
  { id: 'fallback-lower', name: 'Kelas 1-2', minAge: 6, maxAge: 7 },
  { id: 'fallback-middle', name: 'Kelas 3-4', minAge: 8, maxAge: 9 },
  { id: 'fallback-upper', name: 'Kelas 5-6', minAge: 10, maxAge: 12 },
]

const QUESTIONS: Record<DemoBand, DemoQuestion[]> = {
  lower: [
    {
      prompt: '3 + 4 = ?',
      choices: ['6', '7', '8', '9'],
      correctIndex: 1,
      explanation: '3 ditambah 4 sama dengan 7.',
    },
    {
      prompt: 'Berapa banyak sisi pada segitiga?',
      choices: ['2', '3', '4', '5'],
      correctIndex: 1,
      explanation: 'Segitiga punya 3 sisi.',
    },
  ],
  middle: [
    {
      prompt: '12 × 3 = ?',
      choices: ['15', '36', '32', '9'],
      correctIndex: 1,
      explanation: '12 dikali 3 sama dengan 36.',
    },
    {
      prompt: 'Setengah dari 20 adalah?',
      choices: ['5', '8', '10', '12'],
      correctIndex: 2,
      explanation: 'Setengah dari 20 adalah 10.',
    },
  ],
  upper: [
    {
      prompt: 'Berapakah 25% dari 80?',
      choices: ['15', '20', '25', '40'],
      correctIndex: 1,
      explanation: '25% dari 80 adalah 20.',
    },
    {
      prompt: 'Keliling persegi dengan sisi 6 cm adalah?',
      choices: ['12 cm', '18 cm', '24 cm', '36 cm'],
      correctIndex: 2,
      explanation: 'Keliling = 4 × 6 = 24 cm.',
    },
  ],
}

export function bandForAgeGroup(group: { minAge: number } | null): DemoBand {
  if (!group) return 'middle'
  if (group.minAge < 8) return 'lower'
  if (group.minAge <= 9) return 'middle'
  return 'upper'
}

export function getDemoQuestions(band: DemoBand): DemoQuestion[] {
  return QUESTIONS[band]
}
