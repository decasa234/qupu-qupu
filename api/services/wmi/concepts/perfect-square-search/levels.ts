// Level ladder for perfect-square-search. Same param schema ({n} ∈ 10..400);
// difficulty climbs on the ROOT of the answer — how far into the square numbers
// a child has to count before clearing n:
//   L1: n 10..30  → answer 16/25/36 (roots 4–6), squares kids already recite
//   L2: n 31..80  → roots 6–9, still inside the times tables
//   L3: n 81..170 → roots 10–13, past the memorised squares
//   L4: n 171..280 → roots 14–17, needs deliberate estimation of √n
//   L5: n 281..400 → roots 17–20, the largest the schema allows (up to 21×21)
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function perfectSquareSearchLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: return { n: rng.int(10, 30) }
    case 2: return { n: rng.int(31, 80) }
    case 3: return { n: rng.int(81, 170) }
    case 4: return { n: rng.int(171, 280) }
    case 5: return { n: rng.int(281, 400) }
  }
}
