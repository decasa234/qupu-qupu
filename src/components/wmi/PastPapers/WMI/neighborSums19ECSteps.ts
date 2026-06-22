// IKMC-21-EC-Q19 — storyboard for the neighbour-sum strip animation.
//
// Nine cells in a row (positions 0–8).  Numbers 1–9, each used once.
// Adjacent pair sums alternate above (even gaps) and below (odd gaps):
//   Above: gap 0 = 7, gap 2 = 9, gap 4 = 11, gap 6 = 9
//   Below: gap 1 = 15, gap 3 = 3, gap 5 = 15, gap 7 = 8
// Shaded cell: position 4.  Answer: 7 (choice D).
//
// SOLUTION DERIVATION:
//   Let b = cell[1]. Then:
//     cell[0] = a = 7 + b  (but a+b = 7, so a = 7 - b ... wait)
//   Correct derivation (cell pairs at even gaps = sums ABOVE):
//     cell[1]+cell[2] = 15, cell[3]+cell[4] = 3, cell[5]+cell[6] = 15, cell[7]+cell[8] = 8 (below)
//     cell[0]+cell[1] = 7, cell[2]+cell[3] = 9, cell[4]+cell[5] = 11, cell[6]+cell[7] = 9 (above)
//   Setting cell[1]=b:
//     cell[0] = 7 - b (a+b=7... no, cell[0]+cell[1]=7 means cell[0]=7-b, above pair at gap 0)
//
//   Actually the above/below assignment:
//     Even gaps (0,2,4,6) show ABOVE sums 7,9,11,9.
//     Odd gaps (1,3,5,7) show BELOW sums 15,3,15,8.
//   Let b = cell[1]:
//     cell[0]+cell[1] = 7 → cell[0] = 7 - b            [above, gap 0]
//     cell[1]+cell[2] = 15 → cell[2] = 15 - b           [below, gap 1]
//     cell[2]+cell[3] = 9 → cell[3] = 9 - (15-b) = b-6  [above, gap 2]
//     cell[3]+cell[4] = 3 → cell[4] = 3 - (b-6) = 9-b   [below, gap 3]  ← SHADED
//     cell[4]+cell[5] = 11 → cell[5] = 11 - (9-b) = b+2 [above, gap 4]
//     cell[5]+cell[6] = 15 → cell[6] = 15 - (b+2) = 13-b[below, gap 5]
//     cell[6]+cell[7] = 9 → cell[7] = 9 - (13-b) = b-4  [above, gap 6]
//     cell[7]+cell[8] = 8 → cell[8] = 8 - (b-4) = 12-b  [below, gap 7]
//   Sum = 45:  (7-b)+b+(15-b)+(b-6)+(9-b)+(b+2)+(13-b)+(b-4)+(12-b) = 48-b = 45 → b = 3
//   WAIT: that gave cell[2]=15-3=12 (invalid). Let me recheck the above/below assignment.
//
//   Correct assignment from the figure:
//     ABOVE sums: pairs at gaps 0,2,4,6: 7,9,11,9
//     BELOW sums: pairs at gaps 1,3,5,7: 15,3,15,8
//   Let b = cell[1]:
//     [gap 0, above] cell[0]+cell[1]=7 → cell[0]=7-b
//     [gap 1, below] cell[1]+cell[2]=15 → cell[2]=15-b
//     [gap 2, above] cell[2]+cell[3]=9 → cell[3]=9-(15-b)=b-6
//     [gap 3, below] cell[3]+cell[4]=3 → cell[4]=3-(b-6)=9-b  ← SHADED
//     [gap 4, above] cell[4]+cell[5]=11 → cell[5]=11-(9-b)=b+2
//     [gap 5, below] cell[5]+cell[6]=15 → cell[6]=15-(b+2)=13-b
//     [gap 6, above] cell[6]+cell[7]=9 → cell[7]=9-(13-b)=b-4
//     [gap 7, below] cell[7]+cell[8]=8 → cell[8]=8-(b-4)=12-b
//   Sum: (7-b)+b+(15-b)+(b-6)+(9-b)+(b+2)+(13-b)+(b-4)+(12-b) = 48-b = 45 → b=3
//   cell[2]=15-3=12 → INVALID!
//
//   The BELOW sums could instead be: 15,3,15,8 with different assignment.
//   Try: ABOVE at gaps 1,3,5,7 → 7,9,11,9 and BELOW at gaps 0,2,4,6 → 15,3,15,8.
//   Let b = cell[0]:
//     [gap 0, below] cell[0]+cell[1]=15 → cell[1]=15-b
//     [gap 1, above] cell[1]+cell[2]=7 → cell[2]=7-(15-b)=b-8
//   cell[2] = b-8; needs ≥1 so b ≥ 9, but also b ≤ 9, so b=9, cell[2]=1.
//   Continue with b=9:
//     cell[0]=9, cell[1]=6, cell[2]=1
//     [gap 2, below] cell[2]+cell[3]=3 → cell[3]=3-1=2
//     [gap 3, above] cell[3]+cell[4]=9 → cell[4]=9-2=7 ← SHADED ✓
//     [gap 4, below] cell[4]+cell[5]=15 → cell[5]=15-7=8
//     [gap 5, above] cell[5]+cell[6]=11 → cell[6]=11-8=3
//     [gap 6, below] cell[6]+cell[7]=8 → cell[7]=8-3=5
//     [gap 7, above] cell[7]+cell[8]=9 → cell[8]=9-5=4
//   Values: {9,6,1,2,7,8,3,5,4} = {1..9} ✓, shaded=7 ✓
//
//   CONCLUSION: the figure's "above" labels (7,9,11,9) sit at ODD gaps (1,3,5,7)
//   and "below" labels (15,3,15,8) sit at EVEN gaps (0,2,4,6).
//   (In the image the bracket direction visually matches the text description,
//   but the mapping is: below=gap[0,2,4,6], above=gap[1,3,5,7].)
//
// TEACHING METHOD (one idea per beat, never reveal the answer early):
//   beat 0 (intro)   — show the blank strip; announce the strategy.
//   beat 1 (chain-a) — use gap-0-below (sum 15) to chain: cell[0]+cell[1]=15.
//   beat 2 (chain-b) — use gap-1-above (sum 7) to get cell[2]: b+c=7.
//   beat 3 (chain-c) — gap-2-below sum 3 → d: c+d=3.
//   beat 4 (chain-d) — gap-3-above sum 9 → shaded: d+SHADED=9 → reveal 7.
//   beat 5 (result)  — all cells filled, answer D = 7.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type NeighborPhase = 'intro' | 'chain-a' | 'chain-b' | 'chain-c' | 'chain-d' | 'result'

// The solved values for all 9 cells (0-indexed), matching the figure.
export const SOLVED: ReadonlyArray<number> = [9, 6, 1, 2, 7, 8, 3, 5, 4]
export const SHADED_IDX = 4
export const SHADED_VALUE = SOLVED[SHADED_IDX]  // 7

export interface NeighborBeat {
  phase: NeighborPhase
  /** Which cell values to reveal (null = still blank). */
  revealed: Array<number | null>
  /** True on the result beat so the shaded cell renders in the answer colour. */
  highlightShaded: boolean
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface NeighborStoryboard {
  steps: NeighborBeat[]
  finalIndex: number
  shadedValue: number
}

export function buildNeighborSums19ECSteps(lang: Lang): NeighborStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Helper: build a revealed array showing only cells at indices in `show`.
  const show = (indices: readonly number[]): Array<number | null> =>
    SOLVED.map((v, i) => (indices.includes(i) ? v : null))

  const steps: NeighborBeat[] = [
    // Beat 0 — intro: empty strip, explain the sum clue rule.
    {
      phase: 'intro',
      revealed: Array(9).fill(null),
      highlightShaded: false,
      hold: 2200,
      result: false,
      caption: t(
        'Numbers 1–9 fill the 9 cells. The label between two cells tells you their sum. Find the shaded cell.',
        'Angka 1–9 mengisi 9 kotak. Label antara dua kotak menunjukkan jumlah keduanya. Temukan kotak yang diarsir.',
      ),
    },

    // Beat 1 — use the leftmost below-sum (15) to anchor cell[0]+cell[1]=15.
    // Both cells revealed together since we can't isolate either alone yet —
    // we pin them as a pair to start the chain.
    {
      phase: 'chain-a',
      revealed: show([0, 1]),
      highlightShaded: false,
      hold: 2200,
      result: false,
      caption: t(
        'Below sum at gap 0: cell ① + cell ② = 15. Only 9 + 6 from {1–9} works here.',
        'Jumlah bawah di celah 0: kotak ① + kotak ② = 15. Hanya 9 + 6 dari {1–9} yang cocok di sini.',
      ),
    },

    // Beat 2 — above sum at gap 1: cell[1]+cell[2]=7 → cell[2]=7-6=1.
    {
      phase: 'chain-b',
      revealed: show([0, 1, 2]),
      highlightShaded: false,
      hold: 2200,
      result: false,
      caption: t(
        'Above sum at gap 1: 6 + cell ③ = 7, so cell ③ = 1.',
        'Jumlah atas di celah 1: 6 + kotak ③ = 7, jadi kotak ③ = 1.',
      ),
    },

    // Beat 3 — below sum at gap 2: cell[2]+cell[3]=3 → cell[3]=3-1=2.
    {
      phase: 'chain-c',
      revealed: show([0, 1, 2, 3]),
      highlightShaded: false,
      hold: 2200,
      result: false,
      caption: t(
        'Below sum at gap 2: 1 + cell ④ = 3, so cell ④ = 2.',
        'Jumlah bawah di celah 2: 1 + kotak ④ = 3, jadi kotak ④ = 2.',
      ),
    },

    // Beat 4 — above sum at gap 3: cell[3]+cell[4]=9 → cell[4]=9-2=7. Reveal shaded.
    {
      phase: 'chain-d',
      revealed: show([0, 1, 2, 3, 4]),
      highlightShaded: true,
      hold: 2200,
      result: false,
      caption: t(
        'Above sum at gap 3: 2 + shaded = 9, so the shaded cell = 7.',
        'Jumlah atas di celah 3: 2 + diarsir = 9, jadi kotak yang diarsir = 7.',
      ),
    },

    // Beat 5 — result: all 9 cells filled, answer confirmed.
    {
      phase: 'result',
      revealed: SOLVED.map((v) => v),
      highlightShaded: true,
      hold: 0,
      result: true,
      caption: t(
        'The shaded cell holds 7 — answer D.',
        'Kotak yang diarsir berisi 7 — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, shadedValue: SHADED_VALUE }
}
