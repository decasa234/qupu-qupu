// src/lib/demoWmiProblem.ts
//
// A real WMI-style problem (curated from db/seed/wmi/papers/2024-grade-1-final.json)
// used in the onboarding walkthrough. It deliberately uses the [[perimeter|keliling]]
// glossary term so the demo can show the real glossary-tap feature, and has no
// figure to avoid an image dependency. The correct answer lives alongside because
// the WmiQuestion type (matching the API shape) does not carry the answer.
import type { WmiQuestion } from '../types/wmi'

export interface DemoWmiProblem {
  question: WmiQuestion
  correctAnswer: string
}

export const DEMO_WMI_PROBLEM: DemoWmiProblem = {
  question: {
    id: 'demo-wmi-1',
    paper_id: 'demo',
    number: 1,
    body_en: 'Find the [[perimeter]] of a square with side 4.',
    body_id: 'Cari [[perimeter|keliling]] dari persegi dengan sisi 4.',
    answer_type: 'multiple_choice',
    choices_en: [
      { label: 'A', text: '4' },
      { label: 'B', text: '8' },
      { label: 'C', text: '12' },
      { label: 'D', text: '16' },
    ],
    choices_id: [
      { label: 'A', text: '4' },
      { label: 'B', text: '8' },
      { label: 'C', text: '12' },
      { label: 'D', text: '16' },
    ],
    figure_url: null,
    hint_en: 'Add up all four sides: 4 + 4 + 4 + 4.',
    hint_id: 'Jumlahkan keempat sisi: 4 + 4 + 4 + 4.',
    difficulty: 1,
  },
  correctAnswer: 'D',
}
