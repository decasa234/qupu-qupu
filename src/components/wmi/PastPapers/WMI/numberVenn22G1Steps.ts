// WMI-22F1A-Q4 — storyboard for the "circle but NOT square" Venn problem.
//
// A circle, a tilted square, and a triangle overlap, holding the digits 1–9:
//   CIRCLE   : 2, 4, 5, 7, 9
//   SQUARE   : 1, 3, 5, 7
//   TRIANGLE : 4, 6, 7, 8
// Question: sum of the digits INSIDE the circle but OUTSIDE the square.
//   circle = {2,4,5,7,9}; drop the ones also in the square (5 and 7)
//   → keep {2, 4, 9}; sum = 2 + 4 + 9 = 15.
//
// The method this animation teaches: take everything in the circle, then throw
// out anything that is ALSO inside the square. We show the rejection (5 and 7
// leaving) with the reason visible, then add up the keepers. The figure itself
// is the illustrator's NumberVenn primitive — we drive it with `highlight`.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

// The three sets (kept here so the arithmetic is deduced, not hard-coded).
const CIRCLE = [2, 4, 5, 7, 9] as const
const SQUARE = [1, 3, 5, 7] as const

// Inside the circle but NOT in the square.
const KEEPERS = CIRCLE.filter((d) => !SQUARE.includes(d as never)) // [2, 4, 9]
const DROPPED = CIRCLE.filter((d) => SQUARE.includes(d as never)) // [5, 7]
const ANSWER = KEEPERS.reduce((a, b) => a + b, 0) // 15

export interface NumberVennStep {
  /** Digits to ring in the figure this beat (passed to NumberVenn `highlight`). */
  highlight: number[]
  caption: string
  /** ms to linger on this beat before auto-advancing; 0 = final. */
  hold: number
  /** True only on the winning beat (green styling, answer badge). */
  result: boolean
}

export interface NumberVennStoryboard {
  answer: number
  /** The kept digits, in order, for the answer badge ("2 + 4 + 9"). */
  keepers: number[]
  /** The digits thrown out (also inside the square). */
  dropped: number[]
  steps: NumberVennStep[]
  finalIndex: number
}

export function buildNumberVenn22G1Steps(lang: Lang): NumberVennStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const keepList = KEEPERS.join(', ') // "2, 4, 9"
  const dropList = DROPPED.join(t(' and ', ' dan ')) // "5 and 7" / "5 dan 7"
  const sumLine = `${KEEPERS.join(' + ')} = ${ANSWER}` // "2 + 4 + 9 = 15"

  const steps: NumberVennStep[] = [
    {
      // 1. State the goal — show the plain figure.
      highlight: [],
      hold: 2600,
      result: false,
      caption: t(
        'We want the digits INSIDE the circle but OUTSIDE the square. Let us hunt for them.',
        'Kita mau angka yang ADA di dalam lingkaran tapi DI LUAR persegi. Ayo kita cari.',
      ),
    },
    {
      // 2. Light up everything inside the circle.
      highlight: [...CIRCLE],
      hold: 2600,
      result: false,
      caption: t(
        'First, ring every digit inside the circle: 2, 4, 5, 7, 9. That is five of them.',
        'Pertama, lingkari semua angka di dalam lingkaran: 2, 4, 5, 7, 9. Ada lima angka.',
      ),
    },
    {
      // 3. Reject the ones also in the square (the elimination beat — lingers).
      highlight: [...KEEPERS],
      hold: 2400,
      result: false,
      caption: t(
        `But ${dropList} sit inside the square too, so they do NOT count. Drop them!`,
        `Tapi ${dropList} juga ada di dalam persegi, jadi tidak dihitung. Buang keduanya!`,
      ),
    },
    {
      // 4. Name the keepers.
      highlight: [...KEEPERS],
      hold: 2200,
      result: false,
      caption: t(
        `The keepers are ${keepList} — in the circle, but not in the square.`,
        `Yang tinggal adalah ${keepList} — di dalam lingkaran, tapi bukan di persegi.`,
      ),
    },
    {
      // 5. Winning beat: add them up.
      highlight: [...KEEPERS],
      hold: 0,
      result: true,
      caption: t(`Add them up: ${sumLine}.`, `Jumlahkan: ${sumLine}.`),
    },
  ]

  return {
    answer: ANSWER,
    keepers: [...KEEPERS],
    dropped: [...DROPPED],
    steps,
    finalIndex: steps.length - 1,
  }
}
