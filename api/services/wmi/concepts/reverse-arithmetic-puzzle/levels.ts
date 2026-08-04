// Level ladder for reverse-arithmetic-puzzle. Same param schema ({d, r}); the
// mystery number is 10 + r (d = 2) or 100 + r (d = 3), and the answer is its
// digit sum, so difficulty is the size of the number you have to rebuild:
//   L1: d = 2, number 13–39   — undo a subtraction, add two digits
//   L2: d = 2, number 40–99   — same shape, bigger digits
//   L3: d = 3, number 115–299 — the smallest three-digit number, three digits to add
//   L4: d = 3, number 300–649
//   L5: d = 3, number 650–999 — the largest mystery number and the biggest digit sum
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function reverseArithmeticPuzzleLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1:
      return { d: 2, r: rng.int(3, 29) }
    case 2:
      return { d: 2, r: rng.int(30, 89) }
    case 3:
      return { d: 3, r: rng.int(15, 199) }
    case 4:
      return { d: 3, r: rng.int(200, 549) }
    case 5:
      return { d: 3, r: rng.int(550, 899) }
  }
}
