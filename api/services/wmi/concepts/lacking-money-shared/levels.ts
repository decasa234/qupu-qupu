// Level ladder for lacking-money-shared. Same param schema ({nameA, nameB,
// lackA, lackB}); the structure is fixed by the concept (price = lackA + lackB,
// answer = price − lackA = lackB), so the ladder climbs on the arithmetic:
//   L1: both shortfalls ≤ 5 and the price stays under ten — no bridging
//   L2: the two shortfalls bridge ten (price ≥ 11)
//   L3: the person asked about is short a two-digit amount
//   L4: the OTHER person is short the two-digit amount, so the subtraction bites
//   L5: both shortfalls two-digit and unequal — price in the twenties
import type { Rng } from '../types.js'
import type { Params } from './index.js'

const NAMES = ['Jessica', 'Cindy', 'Maya', 'Budi', 'Ann', 'Tono'] as const

export function lackingMoneySharedLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const [nameA, nameB] = rng.shuffle(NAMES).slice(0, 2)
  switch (level) {
    case 1: {
      const lackA = rng.int(2, 5)
      // price = lackA + lackB ≤ 9, so the child never carries a ten.
      return { nameA, nameB, lackA, lackB: rng.int(2, 9 - lackA) }
    }
    case 2: {
      const lackA = rng.int(3, 9)
      return { nameA, nameB, lackA, lackB: rng.int(Math.max(3, 11 - lackA), 9) }
    }
    case 3:
      return { nameA, nameB, lackA: rng.int(2, 6), lackB: rng.int(10, 15) }
    case 4:
      return { nameA, nameB, lackA: rng.int(10, 15), lackB: rng.int(5, 9) }
    case 5: {
      const lackA = rng.int(10, 15)
      // Draw lackB from 10..15 skipping lackA: equal shortfalls make the answer
      // readable off either number, which is not the hardest rung's job.
      const draw = rng.int(10, 14)
      return { nameA, nameB, lackA, lackB: draw >= lackA ? draw + 1 : draw }
    }
  }
}
