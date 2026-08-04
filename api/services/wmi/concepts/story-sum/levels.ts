// Level ladder for story-sum. Same param schema (start 5..12, two give-aways,
// one distractor pile; start must exceed what is given away). Difficulty climbs
// on how much is taken away in the two steps — the more that leaves the basket,
// the smaller the remainder and the less a child can just "see" the answer —
// and on how loud the distractor pile is:
//   L1: give 1 + 1 from a start of 5–7; distractor is tiny (1–2)
//   L2: give 1–2 + 1–2 from 7–9
//   L3: give 2–3 + 2–3 from 9–11 — both subtractions now cross a five
//   L4: give 3–4 + 3–4 from 11–12; distractor 3–5 competes with the real pile
//   L5: give 4 + 4–5 from 11–12 — the biggest take-aways the schema allows,
//       leaving only 2–4, next to the largest distractor (5)
// Difficulty proxy: TOTAL GIVEN AWAY (giveMorning + giveLunch).
//
// The name / fruit / distractor-fruit strings come straight from the concept's
// own generate(), so the story vocabulary can never drift from index.ts.
import type { Rng } from '../types.js'
import { generate, type Params } from './index.js'

export function storySumLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const base = generate(rng) // reuse the concept's name + fruit + distractor-fruit picks
  switch (level) {
    case 1:
      return { ...base, start: rng.int(5, 7), giveMorning: 1, giveLunch: 1, distractor: rng.int(1, 2) }
    case 2:
      return { ...base, start: rng.int(7, 9), giveMorning: rng.int(1, 2), giveLunch: rng.int(1, 2), distractor: rng.int(1, 3) }
    case 3:
      return { ...base, start: rng.int(9, 11), giveMorning: rng.int(2, 3), giveLunch: rng.int(2, 3), distractor: rng.int(2, 4) }
    case 4:
      return { ...base, start: rng.int(11, 12), giveMorning: rng.int(3, 4), giveLunch: rng.int(3, 4), distractor: rng.int(3, 5) }
    case 5:
      return { ...base, start: rng.int(11, 12), giveMorning: 4, giveLunch: rng.int(4, 5), distractor: 5 }
  }
}
