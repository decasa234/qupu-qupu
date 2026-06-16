// Storyboard for WMI-24F2A-Q14 (2024 Grade-2 Final) — the toy-train arrows.
//
// METHOD the animation teaches (deduce, don't assert):
//   The train runs FORWARD along a curving rail. As it rounds each bend every
//   car spins the SAME way the rail turns, so all the signal arrows rotate by a
//   fixed quarter-turn from one car to the next. Read the four KNOWN arrows in
//   forward order and the spin reveals itself:
//
//       ▼ down → → right → ▲ up → ◁ left → (light) → ? → ? → engine
//        180     90        0      270                 ?    ?
//
//   Each step drops 90° clockwise-value, i.e. a 90° COUNTER-CLOCKWISE turn.
//   Keep spinning past the plain light car (it carries no arrow but sits on the
//   same curve) and the two hidden arrows fall out:
//
//       left(270) → ↓ down(180) → → right(90)
//
//   In forward order the first hidden car points DOWN, the second points RIGHT,
//   which is option E = (down, right). No other option matches a consistent
//   quarter-turn spin, so the eliminations are honest.
//
// This builder is a pure (lang) => storyboard function: deterministic, SSR-safe,
// no Math.random / Date. The component drives it with useBeatControl.

import type { Dir, ArrowPair } from './TrainArrows24G2Illustration'
import { OPTIONS24Q14 } from './TrainArrows24G2Illustration'

export type Lang = 'en' | 'id'

// Direction as a clockwise angle measured from UP (matches DIR_ROT in the
// illustration). Spinning −90 (subtract, modulo 360) is one CCW quarter-turn.
const ANGLE: Record<Dir, number> = { up: 0, right: 90, down: 180, left: 270 }
const FROM_ANGLE: Record<number, Dir> = { 0: 'up', 90: 'right', 180: 'down', 270: 'left' }
const spinCCW = (d: Dir): Dir => FROM_ANGLE[(ANGLE[d] + 270) % 360]

const DIR_EN: Record<Dir, string> = { up: 'up', down: 'down', left: 'left', right: 'right' }
const DIR_ID: Record<Dir, string> = { up: 'atas', down: 'bawah', left: 'kiri', right: 'kanan' }
// Little glyph so kids see the turn, not just read it.
const DIR_GLYPH: Record<Dir, string> = { up: '↑', down: '↓', left: '←', right: '→' }

export type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E'

export interface TrainStep {
  /** Which option labels stay lit this beat (others dim). Empty = none highlighted. */
  litOptions: OptionLabel[]
  /** Arrow to reveal in the first hidden (lower) car, or null if still hidden. */
  q1: Dir | null
  /** Arrow to reveal in the second hidden (upper) car, or null if still hidden. */
  q2: Dir | null
  /** How many of the four KNOWN arrows to spotlight as the "spin guide" (0..4). */
  knownLit: number
  result: boolean
  caption: string
  /** Hold time in ms; the winning beat holds 0, tries linger a touch longer. */
  hold: number
}

export interface TrainStoryboard {
  /** The four known arrows in FORWARD order (rear → front), used as the spin guide. */
  known: Dir[]
  /** The two recovered hidden arrows in forward order: [lower ?, upper ?]. */
  answerPair: ArrowPair
  /** The winning option label. */
  answerLabel: OptionLabel
  steps: TrainStep[]
  finalIndex: number
}

export function buildTrainArrowsSteps(lang: Lang): TrainStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const dir = (d: Dir) => `${DIR_GLYPH[d]} ${lang === 'id' ? DIR_ID[d] : DIR_EN[d]}`

  // Four known arrows in forward order (rear tail → toward the hidden cars).
  const known: Dir[] = ['down', 'right', 'up', 'left']
  // Continue the same CCW quarter-turn past the plain light car.
  const q1: Dir = spinCCW(known[known.length - 1]) // left → down
  const q2: Dir = spinCCW(q1) // down → right
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
        `Read the 4 known arrows in order: ${dir('down')}, ${dir('right')}, ${dir('up')}, ${dir('left')} — each is a quarter-turn left (counter-clockwise).`,
        `Baca 4 panah yang diketahui berurutan: ${dir('down')}, ${dir('right')}, ${dir('up')}, ${dir('left')} — tiap kali berputar seperempat ke kiri (berlawanan jarum jam).`,
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
        `Keep spinning past the light car: ${dir('left')} turns a quarter to ${dir(q1)}. First ? = ${dir(q1)}.`,
        `Lanjut berputar lewat gerbong lampu: ${dir('left')} berputar seperempat jadi ${dir(q1)}. ? pertama = ${dir(q1)}.`,
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
        `One more quarter-turn: ${dir(q1)} becomes ${dir(q2)}. Second ? = ${dir(q2)}.`,
        `Seperempat putaran lagi: ${dir(q1)} jadi ${dir(q2)}. ? kedua = ${dir(q2)}.`,
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
