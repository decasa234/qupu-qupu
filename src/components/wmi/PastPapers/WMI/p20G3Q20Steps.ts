import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { CUBE_SIDE, EXTRA_NEEDED, PILE, PILE_COUNT, TARGET_TOTAL, type Cell } from './P20G3Q20Illustration'

export interface Q20Step {
  /** Solid given cubes to draw. */
  cells: Cell[]
  /** Ghost (to-add) cubes to draw faintly. */
  ghosts: Cell[]
  caption: string
  hold: number
  result: boolean
}

export interface Q20Storyboard {
  answer: number
  steps: Q20Step[]
  finalIndex: number
}

/** Every cell of the full 3×3×3 frame. */
function fullCube(): Cell[] {
  const out: Cell[] = []
  for (let z = 0; z < CUBE_SIDE; z++)
    for (let y = 0; y < CUBE_SIDE; y++) for (let x = 0; x < CUBE_SIDE; x++) out.push([x, y, z])
  return out
}

const inPile = (x: number, y: number, z: number) =>
  PILE.some(([a, b, c]) => a === x && b === y && c === z)

export function buildP20G3Q20Steps(lang: Lang): Q20Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const missing: Cell[] = fullCube().filter(([x, y, z]) => !inPile(x, y, z))

  const steps: Q20Step[] = [
    {
      cells: PILE,
      ghosts: [],
      hold: 1900,
      result: false,
      caption: t(
        `Count the pile first: it has ${PILE_COUNT} cubes.`,
        `Hitung tumpukan dulu: ada ${PILE_COUNT} kubus.`,
      ),
    },
    {
      cells: PILE,
      ghosts: [],
      hold: 2000,
      result: false,
      caption: t(
        `The smallest solid cube that fits this pile is ${CUBE_SIDE}×${CUBE_SIDE}×${CUBE_SIDE} = ${TARGET_TOTAL}.`,
        `Kubus padat terkecil yang memuat tumpukan ini adalah ${CUBE_SIDE}×${CUBE_SIDE}×${CUBE_SIDE} = ${TARGET_TOTAL}.`,
      ),
    },
    {
      cells: PILE,
      ghosts: missing,
      hold: 2100,
      result: false,
      caption: t(
        `Fill the gaps (shown faint) to complete the ${CUBE_SIDE}×${CUBE_SIDE}×${CUBE_SIDE} cube.`,
        `Isi celah (yang samar) untuk melengkapi kubus ${CUBE_SIDE}×${CUBE_SIDE}×${CUBE_SIDE}.`,
      ),
    },
    {
      cells: PILE,
      ghosts: missing,
      hold: 0,
      result: true,
      caption: t(
        `${TARGET_TOTAL} − ${PILE_COUNT} = ${EXTRA_NEEDED} extra cubes — answer C.`,
        `${TARGET_TOTAL} − ${PILE_COUNT} = ${EXTRA_NEEDED} kubus tambahan — jawaban C.`,
      ),
    },
  ]

  return { answer: EXTRA_NEEDED, steps, finalIndex: steps.length - 1 }
}
