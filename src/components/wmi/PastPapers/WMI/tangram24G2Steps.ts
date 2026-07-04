import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { TANGRAM24_GLYPH, type Tangram24Label } from './Tangram24G2Illustration'

// WMI-24F2A-Q13 (2024 Grade-2 Final, HARD). The five answer figures spell
// "WMI24"; the question asks which has the MOST right angles (square corners,
// like the corner of a book). The deduction visits each figure in turn, counts
// its square corners, and keeps a running "most so far" leader. After all five
// are checked it crowns M (choice B), built almost entirely from upright
// rectangular bars, on the final beat.

export type Tangram24Step = {
  /** The option being examined this beat (null on intro/reveal beats). */
  label: Tangram24Label | null
  /** Number of right (square) corners counted in this figure. */
  rightAngles: number | null
  /** The current "most so far" leader label, for the running scoreboard. */
  leader: Tangram24Label | null
  /** True on the final beat — crowns the figure with the most right angles. */
  result: boolean
  /** How long to hold this beat on screen, in ms (winner = 0, others linger). */
  hold: number
  caption: string
}

export interface Tangram24Storyboard {
  answer: Tangram24Label
  /** Right-angle counts per option, in WMI24 order. */
  counts: Record<Tangram24Label, number>
  steps: Tangram24Step[]
  finalIndex: number
}

// Square-corner (right-angle) tally per figure, read off the tangram glyphs
// (these counts MATCH the geometry in TANGRAM24_PIECES — keep them in sync).
//   W  — four slanted bars meeting at peaks: no square corners at all.
//   M  — two upright rectangular posts (4 corners each) + a centre V: 8. ← most
//   I  — slant-tipped top/bottom bars (0) + a rectangular stem (4): 4.
//   2  — slant-tipped top bar (2, at its right end) + diagonal (0) + base bar (4): 6.
//   4  — slanted stroke (0) + rectangular stem (4) + slant-tipped crossbar (0): 4.
const RIGHT_ANGLES: Record<Tangram24Label, number> = {
  A: 0, // W
  B: 8, // M  ← the most
  C: 4, // I
  D: 6, // 2
  E: 4, // 4
}

// Visit order spells WMI24: W, M, I, 2, 4 → labels A, B, C, D, E.
const VISIT_ORDER: Tangram24Label[] = ['A', 'B', 'C', 'D', 'E']

export function buildTangram24Steps(lang: Lang): Tangram24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // The winner is the figure with the strictly-most right angles.
  let answer: Tangram24Label = VISIT_ORDER[0]
  for (const lbl of VISIT_ORDER) {
    if (RIGHT_ANGLES[lbl] > RIGHT_ANGLES[answer]) answer = lbl
  }

  const steps: Tangram24Step[] = [
    {
      label: null,
      rightAngles: null,
      leader: null,
      result: false,
      hold: 2600,
      caption: t(
        'A right angle is a square corner — like the corner of a book. Check each figure and count its square corners!',
        'Sudut siku-siku adalah sudut persegi — seperti sudut buku. Periksa tiap gambar dan hitung sudut persegi-nya!',
      ),
    },
  ]

  // Walk every figure, tracking the running "most so far" leader.
  let leader: Tangram24Label | null = null
  let bestSoFar = -1
  for (const lbl of VISIT_ORDER) {
    const n = RIGHT_ANGLES[lbl]
    const glyph = TANGRAM24_GLYPH[lbl]
    const beatsBest = n > bestSoFar
    if (beatsBest) {
      leader = lbl
      bestSoFar = n
    }

    let caption: string
    if (n === 0) {
      caption = t(
        `${glyph} is all slanted bars — no square corners at all ✗`,
        `${glyph} semuanya batang miring — tidak ada sudut persegi sama sekali ✗`,
      )
    } else if (beatsBest) {
      caption = t(
        `${glyph} has ${n} square corners — the most so far!`,
        `${glyph} punya ${n} sudut persegi — terbanyak sejauh ini!`,
      )
    } else {
      caption = t(
        `${glyph} has only ${n} square corners — fewer than ${TANGRAM24_GLYPH[leader as Tangram24Label]}'s ${bestSoFar} ✗`,
        `${glyph} hanya punya ${n} sudut persegi — kurang dari ${TANGRAM24_GLYPH[leader as Tangram24Label]} (${bestSoFar}) ✗`,
      )
    }

    steps.push({
      label: lbl,
      rightAngles: n,
      leader,
      result: false,
      // Each checked figure lingers so the count + comparison reads clearly.
      hold: 2100,
      caption,
    })
  }

  // Final beat: crown the leader (M = choice B). hold 0 — this is the winner.
  steps.push({
    label: answer,
    rightAngles: RIGHT_ANGLES[answer],
    leader: answer,
    result: true,
    hold: 0,
    caption: t(
      `${TANGRAM24_GLYPH[answer]} wins with ${RIGHT_ANGLES[answer]} square corners — the most right angles. Answer: ${answer}.`,
      `${TANGRAM24_GLYPH[answer]} menang dengan ${RIGHT_ANGLES[answer]} sudut persegi — sudut siku-siku terbanyak. Jawaban: ${answer}.`,
    ),
  })

  return {
    answer,
    counts: RIGHT_ANGLES,
    steps,
    finalIndex: steps.length - 1,
  }
}
