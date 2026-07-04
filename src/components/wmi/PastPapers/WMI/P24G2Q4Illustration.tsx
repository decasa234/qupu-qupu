// WMI-24P2A-Q4 (2024 Grade 2 Semifinal, Paper A) — animals stand in a row.
//
// The stem figure (db/seed/wmi/figures/2024-semifinal-g2-a-q4.jpg) is the SAME
// figure as the Grade-1 sibling question WMI-24P1A-Q4: a single row of 14
// animals, left → right:
//   1 lion  2 owl  3 frog  4 penguin  5 cow  6 turtle  7 mouse  8 snake
//   9 dinosaur  10 koala  11 bird  12 crab  13 chick  14 dog
//
// "The 10th animal from the left is the leader. The 7th animal from the right
//  is the vice leader. Which option has both of them?"
// With 14 animals: 10th from the left = the koala (leader) and 7th from the
// right = animal 14 − 7 + 1 = 8 = the snake (vice leader). The picture option
// containing both is C.
//
// REUSE, don't redraw: this module re-exports the scan-verified 14-animal row
// primitive built for the Grade-1 question (`AnimalRow` in
// P24G1Q4Illustration.tsx) so both papers render the identical figure. The
// static default export shows ONLY the bare row — it never marks the leader or
// vice leader and never reveals the option letter; counting in from each end is
// the explainer's job via `litLeft` / `litRight`.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

import {
  ANIMALS,
  ANIMAL_COUNT,
  AnimalRow,
  LEADER_INDEX,
  VICE_INDEX,
} from './P24G1Q4Illustration'

export { ANIMALS, ANIMAL_COUNT, AnimalRow, LEADER_INDEX, VICE_INDEX }

export const ROW_LENGTH = ANIMAL_COUNT // 14
/** 1-based positions from the left. Leader = 10th; vice = 7th from right = 8th. */
export const LEADER_POS = LEADER_INDEX + 1 // 10 (koala)
export const VICE_POS = VICE_INDEX + 1 // 8 (snake)

/** Default export — the bare row of 14 animals (no highlights, no ordinals). */
export default function P24G2Q4Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Sebaris 14 hewan: ' +
        ANIMALS.map((a) => a.id).join(', ') +
        '. Gambar belum menandai pemimpin (ke-10 dari kiri) maupun wakil (ke-7 dari kanan).'
      }
    >
      <AnimalRow />
    </div>
  )
}
