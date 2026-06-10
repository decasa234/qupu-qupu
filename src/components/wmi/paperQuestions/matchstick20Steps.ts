import type { Lang } from '../concepts/explainers/makeTenSteps'
import type { MatchstickCandidate } from './Matchstick20Illustration'
import { STICK_COUNT } from './Matchstick20Illustration'

// Storyboard for WMI-20F1A-Q16: third largest 2-digit number with ≤ 8 sticks.
// Deduction (seed hint_steps): 91 (6+2=8 ✓, largest) → tens 8 impossible
// (no 1-stick digit) → 77 (3+3=6 ✓, second) → 76 (3+6=9 ✗) → 75 (3+5=8 ✓, THIRD).

export interface MatchstickStep {
  /** Candidate numbers on the board so far, in try order. */
  candidates: MatchstickCandidate[]
  /** Highlight the answer row (75) in green. */
  highlightAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface MatchstickStoryboard {
  answer: number
  steps: MatchstickStep[]
  finalIndex: number
}

export function buildMatchstick20Steps(lang: Lang): MatchstickStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const c91: MatchstickCandidate = { tens: '9', ones: '1', math: `${STICK_COUNT['9']} + ${STICK_COUNT['1']} = 8`, ok: true, rank: 1 }
  const c8x: MatchstickCandidate = {
    tens: '8',
    ones: null,
    math: t(`${STICK_COUNT['8']} + ? — no digit costs just 1 stick`, `${STICK_COUNT['8']} + ? — tak ada angka berharga 1 batang`),
    ok: false,
    rank: null,
  }
  const c77: MatchstickCandidate = { tens: '7', ones: '7', math: `${STICK_COUNT['7']} + ${STICK_COUNT['7']} = 6`, ok: true, rank: 2 }
  const c76: MatchstickCandidate = {
    tens: '7',
    ones: '6',
    math: t(`${STICK_COUNT['7']} + ${STICK_COUNT['6']} = 9 — too many!`, `${STICK_COUNT['7']} + ${STICK_COUNT['6']} = 9 — kebanyakan!`),
    ok: false,
    rank: null,
  }
  const c75: MatchstickCandidate = { tens: '7', ones: '5', math: `${STICK_COUNT['7']} + ${STICK_COUNT['5']} = 8`, ok: true, rank: 3 }

  const steps: MatchstickStep[] = [
    {
      candidates: [],
      highlightAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        'Every digit has a stick price! 1 is the cheapest (2 sticks), 7 costs 3 — and 8 is the priciest with 7 sticks.',
        'Setiap angka punya harga batang! 1 paling murah (2 batang), 7 berharga 3 — dan 8 paling mahal dengan 7 batang.',
      ),
    },
    {
      candidates: [c91],
      highlightAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Go big first: tens digit 9 costs 6 sticks, so only 2 are left — just the digit 1 fits! 91 uses 6 + 2 = 8 ✓ the largest.',
        'Mulai dari yang besar: puluhan 9 butuh 6 batang, sisa cuma 2 — hanya angka 1 yang muat! 91 pakai 6 + 2 = 8 ✓ yang terbesar.',
      ),
    },
    {
      candidates: [c91, c8x, c77],
      highlightAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Tens digit 8? It eats 7 sticks, and NO digit costs just 1 ✗. So try tens 7 (3 sticks): the biggest ones digit that fits in 5 sticks is 7 → 77 uses 6 ✓ the second!',
        'Puluhan 8? Habis 7 batang, dan TIDAK ada angka berharga 1 ✗. Coba puluhan 7 (3 batang): satuan terbesar yang muat 5 batang adalah 7 → 77 pakai 6 ✓ yang kedua!',
      ),
    },
    {
      candidates: [c91, c8x, c77, c76],
      highlightAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        'Just under 77, try 76: that needs 3 + 6 = 9 sticks — over our budget of 8 ✗.',
        'Tepat di bawah 77, coba 76: butuh 3 + 6 = 9 batang — melebihi jatah 8 ✗.',
      ),
    },
    {
      candidates: [c91, c8x, c77, c76, c75],
      highlightAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        'Try 75: 3 + 5 = 8 sticks ✓ it fits — that is the THIRD largest!',
        'Coba 75: 3 + 5 = 8 batang ✓ muat — itulah yang terbesar KETIGA!',
      ),
    },
    {
      candidates: [c91, c8x, c77, c76, c75],
      highlightAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        'Ranked from biggest: 91, 77, 75 — the third largest is 75.',
        'Urut dari terbesar: 91, 77, 75 — yang terbesar ketiga adalah 75.',
      ),
    },
  ]

  return { answer: 75, steps, finalIndex: steps.length - 1 }
}
