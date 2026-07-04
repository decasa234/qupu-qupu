// Storyboard for WMI-24F2A-Q14 (2024 Grade-2 Final) — the toy-train arrows.
//
// METHOD the animation teaches (deduce, don't assert):
//   The train runs FORWARD along a curving rail. As it rounds each bend every
//   car spins the SAME way the rail turns, so all the signal arrows rotate by a
//   fixed quarter-turn from one car to the next. Read the four KNOWN arrows on
//   the bottom row from the tail forward (scan order ▼ ◁ ▲ engine→):
//
//       ▼ down → ◁ left → ▲ up → → right (engine nose)
//        180      270      0/360   90
//
//   Each step adds 90°: a quarter-turn CLOCKWISE per car. Now anchor at the
//   FRONT engine, whose nose points left (270°) — the same rule must hold all
//   the way to the front. Stepping BACK one car at a time undoes the spin:
//
//       engine left(270) ← ? down(180) ← ? right(90) ← (light car)
//
//   So the ? beside the engine (upper) points DOWN and the ? beside the light
//   car (lower) points RIGHT. Read from the front that is (down, right) —
//   option E. No other option matches a consistent quarter-turn spin, so the
//   eliminations are honest.
//
// This builder is a pure (lang) => storyboard function: deterministic, SSR-safe,
// no Math.random / Date. The component drives it with useBeatControl.

import type { Dir, ArrowPair } from './TrainArrows24G2Illustration'
import { OPTIONS24Q14 } from './TrainArrows24G2Illustration'

export type Lang = 'en' | 'id'

// Direction as a clockwise angle measured from UP (matches DIR_ROT in the
// illustration). The forward spin is +90 (clockwise) per car; stepping BACK a
// car therefore subtracts 90 (adds 270 modulo 360).
const ANGLE: Record<Dir, number> = { up: 0, right: 90, down: 180, left: 270 }
const FROM_ANGLE: Record<number, Dir> = { 0: 'up', 90: 'right', 180: 'down', 270: 'left' }
const spinBack = (d: Dir): Dir => FROM_ANGLE[(ANGLE[d] + 270) % 360]

const DIR_EN: Record<Dir, string> = { up: 'up', down: 'down', left: 'left', right: 'right' }
const DIR_ID: Record<Dir, string> = { up: 'atas', down: 'bawah', left: 'kiri', right: 'kanan' }
// Little glyph so kids see the turn, not just read it.
const DIR_GLYPH: Record<Dir, string> = { up: '↑', down: '↓', left: '←', right: '→' }

export type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E'

export interface TrainStep {
  /** Which option labels stay lit this beat (others dim). Empty = none highlighted. */
  litOptions: OptionLabel[]
  /** Arrow to reveal in the FIRST hidden car (the upper ?, beside the front engine). */
  q1: Dir | null
  /** Arrow to reveal in the SECOND hidden car (the lower ?, beside the light car). */
  q2: Dir | null
  /** How many of the four KNOWN arrows to spotlight as the "spin guide" (0..4). */
  knownLit: number
  result: boolean
  caption: string
  /** Hold time in ms; the winning beat holds 0, tries linger a touch longer. */
  hold: number
}

export interface TrainStoryboard {
  /** The four known arrows in FORWARD order (tail → front), used as the spin guide. */
  known: Dir[]
  /** The two recovered hidden arrows in reading order: [upper ?, lower ?]. */
  answerPair: ArrowPair
  /** The winning option label. */
  answerLabel: OptionLabel
  steps: TrainStep[]
  finalIndex: number
}

export function buildTrainArrowsSteps(lang: Lang): TrainStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const dir = (d: Dir) => `${DIR_GLYPH[d]} ${lang === 'id' ? DIR_ID[d] : DIR_EN[d]}`

  // Four known arrows in forward order (tail ▼ → front-facing engine nose).
  const known: Dir[] = ['down', 'left', 'up', 'right']
  // Anchor on the front engine (nose = left) and step BACK one car at a time.
  const q1: Dir = spinBack('left') // upper ? (beside the engine) → down
  const q2: Dir = spinBack(q1) // lower ? (beside the light car) → right
  const answerPair: ArrowPair = [q1, q2]

  // Find the option whose pair matches; that is the honest winner.
  const all: OptionLabel[] = ['A', 'B', 'C', 'D', 'E']
  const answerLabel = (all.find(
    (l) => OPTIONS24Q14[l][0] === answerPair[0] && OPTIONS24Q14[l][1] === answerPair[1],
  ) ?? 'E') as OptionLabel

  const steps: TrainStep[] = [
    {
      litOptions: all,
      q1: null,
      q2: null,
      knownLit: 0,
      result: false,
      caption: t(
        'The train rolls FORWARD. Each car spins the same way the rail bends — find the two ? arrows.',
        'Kereta maju ke DEPAN. Tiap gerbong berputar searah belokan rel — cari dua panah ?.',
      ),
      hold: 2600,
    },
    {
      litOptions: all,
      q1: null,
      q2: null,
      knownLit: 4,
      result: false,
      caption: t(
        `Read the 4 known arrows from the tail: ${dir('down')}, ${dir('left')}, ${dir('up')}, ${dir('right')} — each is a quarter-turn right (clockwise).`,
        `Baca 4 panah yang diketahui dari ekor: ${dir('down')}, ${dir('left')}, ${dir('up')}, ${dir('right')} — tiap kali berputar seperempat ke kanan (searah jarum jam).`,
      ),
      hold: 3000,
    },
    {
      litOptions: all,
      q1,
      q2: null,
      knownLit: 4,
      result: false,
      caption: t(
        `Anchor at the front: the engine points ${dir('left')}. One quarter-turn back: the ? beside it = ${dir(q1)}. First ? = ${dir(q1)}.`,
        `Berpatokan di depan: lokomotif menghadap ${dir('left')}. Mundur seperempat putaran: ? di sebelahnya = ${dir(q1)}. ? pertama = ${dir(q1)}.`,
      ),
      hold: 2400,
    },
    {
      litOptions: all,
      q1,
      q2,
      knownLit: 4,
      result: false,
      caption: t(
        `One more quarter-turn back: ${dir(q1)} came from ${dir(q2)}. Second ? = ${dir(q2)}.`,
        `Mundur seperempat putaran lagi: ${dir(q1)} berasal dari ${dir(q2)}. ? kedua = ${dir(q2)}.`,
      ),
      hold: 2400,
    },
    {
      litOptions: all.filter((l) => l !== answerLabel),
      q1,
      q2,
      knownLit: 0,
      result: false,
      caption: t(
        `We need ${dir(q1)} then ${dir(q2)}. A, B, C, D each break the steady spin ✗.`,
        `Kita perlu ${dir(q1)} lalu ${dir(q2)}. A, B, C, D semua merusak putaran tetap ✗.`,
      ),
      hold: 2200,
    },
    {
      litOptions: [answerLabel],
      q1,
      q2,
      knownLit: 0,
      result: true,
      caption: t(
        `Only ${dir(q1)} then ${dir(q2)} keeps every quarter-turn — option ${answerLabel}.`,
        `Hanya ${dir(q1)} lalu ${dir(q2)} menjaga tiap seperempat putaran — pilihan ${answerLabel}.`,
      ),
      hold: 0,
    },
  ]

  return { known, answerPair, answerLabel, steps, finalIndex: steps.length - 1 }
}
