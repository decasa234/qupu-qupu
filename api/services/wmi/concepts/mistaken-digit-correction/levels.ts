// Level ladder for mistaken-digit-correction. The whole task is "how much too
// big was the sum, and take that off", so the rungs climb on the two things
// that make that harder: the size of the overshoot (a misread tens digit is
// worth ten times a misread units digit) and the size of the sum it comes off.
// Difficulty proxy: delta + correct / 100, where delta = (wrong − right) × place value.
//   L1: units digit, off by 1–3, two-digit sum, and the take-away never regroups
//   L2: units digit, off by up to 9, three-digit sum
//   L3: tens digit, off by 1–3 → the overshoot is 10–30
//   L4: tens digit, off by 4–9 → the overshoot is 40–90
//   L5: tens digit, off by 5–9, sum in the 500s–800s, and the take-away crosses a hundred
import type { Rng } from '../types.js'
import type { Params } from './index.js'

const NAMES = ['Zoey', 'Maya', 'Budi', 'Sari', 'Tono'] as const

export function mistakenDigitCorrectionLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const name = rng.pick(NAMES)
  switch (level) {
    case 1: {
      const right = rng.int(0, 6)
      const wrong = rng.int(right + 1, Math.min(9, right + 3))
      const diff = wrong - right
      // ones digit + diff ≤ 9, so taking the overshoot back off never regroups
      return { name, right, wrong, place: 'units', correct: rng.int(2, 9) * 10 + rng.int(0, 9 - diff) }
    }
    case 2: {
      const right = rng.int(0, 8)
      const wrong = rng.int(right + 1, 9)
      return { name, right, wrong, place: 'units', correct: rng.int(100, 300) }
    }
    case 3: {
      const right = rng.int(0, 6)
      const wrong = rng.int(right + 1, Math.min(9, right + 3))
      return { name, right, wrong, place: 'tens', correct: rng.int(100, 400) }
    }
    case 4: {
      const right = rng.int(0, 5)
      const wrong = rng.int(right + 4, 9)
      return { name, right, wrong, place: 'tens', correct: rng.int(200, 600) }
    }
    case 5: {
      const right = rng.int(0, 4)
      const wrong = rng.int(right + 5, 9)
      const diff = wrong - right
      // tens digit + diff ≥ 10, so the wrong sum sits in the NEXT hundred and
      // taking the overshoot off has to come back down across it
      const tens = rng.int(10 - diff, 9)
      return { name, right, wrong, place: 'tens', correct: rng.int(5, 8) * 100 + tens * 10 + rng.int(0, 9) }
    }
  }
}
