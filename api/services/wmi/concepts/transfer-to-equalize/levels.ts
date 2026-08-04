// Level ladder for transfer-to-equalize. Same param schema; difficulty climbs
// first by which ask the child faces (each is a harder door into "one item that
// moves changes the gap by 2"), then by the size of the counts inside each ask:
//   L1: after-transfer, tiny counts, only 1 item moves — walk the story forward
//   L2: after-transfer, counts up to 20 and 2–4 items move
//   L3: equalize, small counts — needs the extra step of halving the gap
//   L4: equalize, counts up to 20 and 3–4 items move
//   L5: find-original, big counts — the move already happened, rewind it
import type { Rng } from '../types.js'
import { SUBJECTS, type Params } from './index.js'

// Same casts and props the concept's own generator draws from; only the schema's
// "two different names, non-empty strings" rule is load-bearing here.
const NAMES = ['Budi', 'Siti', 'Ayu', 'Rian', 'Dewi', 'Tono', 'Nadia', 'Fajar'] as const

const ITEMS = [
  { item_en: 'marbles', item_one_en: 'marble', item_id: 'kelereng' },
  { item_en: 'stickers', item_one_en: 'sticker', item_id: 'stiker' },
  { item_en: 'candies', item_one_en: 'candy', item_id: 'permen' },
  { item_en: 'pencils', item_one_en: 'pencil', item_id: 'pensil' },
] as const

function cast(rng: Rng) {
  const names = rng.shuffle(NAMES)
  return { nameA: names[0], nameB: names[1], subject: rng.pick(SUBJECTS), ...rng.pick(ITEMS) }
}

export function transferToEqualizeLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const base = cast(rng)
  switch (level) {
    case 1: {
      // gap ≥ 2 × transfer + 1 keeps the giver ahead after the move.
      const startB = rng.int(1, 4)
      return { ...base, ask: 'after-transfer', startA: startB + rng.int(3, 4), startB, transfer: 1 }
    }
    case 2: {
      const transfer = rng.int(2, 4)
      const startB = rng.int(4, 19 - 2 * transfer)
      const gap = rng.int(2 * transfer + 1, 20 - startB)
      return { ...base, ask: 'after-transfer', startA: startB + gap, startB, transfer }
    }
    case 3: {
      // built backwards from the answer so the two counts are always evenly split.
      const transfer = rng.int(1, 2)
      const startB = rng.int(2, 6)
      return { ...base, ask: 'equalize', startA: startB + 2 * transfer, startB, transfer }
    }
    case 4: {
      const transfer = rng.int(3, 4)
      const startB = rng.int(6, 12)
      return { ...base, ask: 'equalize', startA: startB + 2 * transfer, startB, transfer }
    }
    case 5: {
      // startA > 2 × transfer and startB + 2 × transfer ≤ 20 keep both the answer
      // and its tempting wrong answer inside 1…20.
      const transfer = rng.int(3, 5)
      const startA = rng.int(Math.max(2 * transfer + 1, 10), 20)
      const startB = rng.int(4, 20 - 2 * transfer)
      return { ...base, ask: 'find-original', startA, startB, transfer }
    }
  }
}
