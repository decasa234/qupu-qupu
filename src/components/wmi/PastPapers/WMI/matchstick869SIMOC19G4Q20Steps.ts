// Beat storyboard for SIMOC-19-G4-Q20.
// "869 with 19 matchsticks → move exactly 3 → greatest 4-digit number (9951)."
// Seed hint_steps: 8(7)+6(6)+9(6)=19; aim for 9s; 9951=6+6+5+2=19 ✓; 3 moves.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export interface Matchstick869Step {
  showAfter: boolean
  highlightAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Matchstick869Storyboard {
  answer: number
  steps: Matchstick869Step[]
  finalIndex: number
}

export function buildMatchstick869Steps(lang: Lang): Matchstick869Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Matchstick869Step[] = [
    {
      showAfter: false,
      highlightAnswer: false,
      hold: 2400,
      result: false,
      caption: t(
        'Tom built 869 from matchsticks: digit 8 costs 7 sticks, 6 costs 6, 9 costs 6 — total 7+6+6 = 19 sticks.',
        'Tom membuat 869 dari korek api: angka 8 butuh 7 batang, 6 butuh 6, 9 butuh 6 — total 7+6+6 = 19 batang.',
      ),
    },
    {
      showAfter: false,
      highlightAnswer: false,
      hold: 2600,
      result: false,
      caption: t(
        'Goal: form the GREATEST 4-digit number by moving exactly 3 sticks (total stays 19). Lead with 9s — each 9 costs only 6 sticks.',
        'Tujuan: bentuk bilangan 4 digit TERBESAR dengan memindahkan tepat 3 batang (total tetap 19). Awali dengan 9 — setiap 9 hanya butuh 6 batang.',
      ),
    },
    {
      showAfter: true,
      highlightAnswer: false,
      hold: 2600,
      result: false,
      caption: t(
        'Try 9951: 9(6)+9(6)+5(5)+1(2) = 19 ✓ — same 19 sticks! The third digit 5 leaves exactly 2 sticks for digit 1 (cheapest).',
        'Coba 9951: 9(6)+9(6)+5(5)+1(2) = 19 ✓ — tetap 19 batang! Digit ketiga 5 menyisakan tepat 2 batang untuk angka 1 (paling murah).',
      ),
    },
    {
      showAfter: true,
      highlightAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        '9951 is the greatest 4-digit number achievable by moving exactly 3 matchsticks from 869.',
        '9951 adalah bilangan 4 digit terbesar yang dapat dibentuk dengan memindahkan tepat 3 batang korek dari 869.',
      ),
    },
  ]

  return { answer: 9951, steps, finalIndex: steps.length - 1 }
}
