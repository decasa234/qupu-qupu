// Level ladder for money-shopping-change. Same param schema ({cost, pay, name,
// item}); difficulty climbs by amount size and by how much regrouping the
// subtraction pay − cost needs:
//   L1: round tens only            L2: price ends in 5/0, change a round ten
//   L3: any two-digit, no borrow   L4: two-digit, ones digit forces a borrow
//   L5: pays with a 100+ note over a 50-90 price, borrow across the hundred
import type { Rng } from '../types.js'
import type { Params } from './index.js'

const NAMES = ['Sari', 'Budi', 'Ani', 'Tono', 'Maya'] as const
const ITEMS = [
  { item_en: 'book', item_id: 'buku' },
  { item_en: 'toy', item_id: 'mainan' },
  { item_en: 'cake', item_id: 'kue' },
  { item_en: 'pencil', item_id: 'pensil' },
  { item_en: 'ball', item_id: 'bola' },
] as const

function dress(rng: Rng, cost: number, pay: number): Params {
  return { cost, pay, name: rng.pick(NAMES), ...rng.pick(ITEMS) }
}

export function moneyShoppingChangeLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: {
      // Both amounts are whole tens, so the change is a whole ten too.
      const cost = 10 * rng.int(1, 5)
      return dress(rng, cost, cost + 10 * rng.int(1, 4))
    }
    case 2: {
      // Price may end in 5, but the gap is still a whole ten — no regrouping.
      const cost = 5 * rng.int(2, 15)
      return dress(rng, cost, cost + 10 * rng.int(1, 4))
    }
    case 3: {
      // Any two-digit price and payment, digits chosen so no borrow is needed.
      const costTens = rng.int(1, 6)
      const costOnes = rng.int(0, 8)
      const cost = costTens * 10 + costOnes
      const payTens = rng.int(costTens + 1, 9)
      const payOnes = rng.int(costOnes, 9)
      return dress(rng, cost, payTens * 10 + payOnes)
    }
    case 4: {
      // The payment's ones digit is smaller than the price's: must regroup.
      const costTens = rng.int(2, 7)
      const costOnes = rng.int(1, 9)
      const cost = costTens * 10 + costOnes
      const payTens = rng.int(costTens + 1, 9)
      const payOnes = rng.int(0, costOnes - 1)
      return dress(rng, cost, payTens * 10 + payOnes)
    }
    case 5: {
      // Big price paid with a 100+ note, and the ones digit still forces a
      // borrow — the change crosses back down through the hundred.
      const costOnes = rng.int(1, 9)
      const cost = rng.int(5, 8) * 10 + costOnes
      const pay = 100 + 10 * rng.int(0, 4) + rng.int(0, costOnes - 1)
      return dress(rng, cost, pay)
    }
  }
}
