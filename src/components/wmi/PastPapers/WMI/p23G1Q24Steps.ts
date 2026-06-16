import type { Lang } from '../concepts/explainers/makeTenSteps'
import { TRIANGLE } from './P23G1Q24Illustration'

export type PascalPhase = 'show' | 'rule' | 'parent' | 'children' | 'sum' | 'result'

export interface PascalStep {
  phase: PascalPhase
  /** Shaded cell keys whose value is now revealed. */
  reveal: string[]
  /** Cell keys ringed this beat (e.g. the pair that sums to a revealed cell). */
  ring: string[]
  caption: string
  hold: number
  result: boolean
}

export interface PascalStoryboard {
  parent: number
  child1: number
  child2: number
  answer: number
  steps: PascalStep[]
  finalIndex: number
}

export function buildP23G1Q24Steps(lang: Lang): PascalStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Shaded cells: parent row6[3], children row7[3] & row7[4].
  const parent = TRIANGLE[5][3] // 10
  const child1 = TRIANGLE[6][3] // 20
  const child2 = TRIANGLE[6][4] // 15
  const answer = parent + child1 + child2 // 45

  const steps: PascalStep[] = [
    {
      phase: 'show',
      reveal: [],
      ring: [],
      hold: 1900,
      result: false,
      caption: t(
        "Pascal's triangle: edges are 1, and each cell is the SUM of the two above it.",
        'Segitiga Pascal: tepinya 1, dan setiap sel adalah JUMLAH dua sel di atasnya.',
      ),
    },
    {
      phase: 'rule',
      reveal: [],
      ring: ['4,1', '4,2'],
      hold: 2100,
      result: false,
      caption: t(
        'Fill down: row 5 middle = 4 + 6 = 10, and so on, until the shaded cells.',
        'Isi ke bawah: tengah baris 5 = 4 + 6 = 10, dan seterusnya, sampai sel-sel arsiran.',
      ),
    },
    {
      phase: 'parent',
      reveal: ['5,3'],
      ring: ['4,2', '4,3'],
      hold: 2000,
      result: false,
      caption: t(
        `Top shaded cell = ${TRIANGLE[4][2]} + ${TRIANGLE[4][3]} = ${parent}.`,
        `Sel arsiran atas = ${TRIANGLE[4][2]} + ${TRIANGLE[4][3]} = ${parent}.`,
      ),
    },
    {
      phase: 'children',
      reveal: ['5,3', '6,3', '6,4'],
      ring: ['5,2', '5,3', '5,4'],
      hold: 2200,
      result: false,
      caption: t(
        `Lower two: ${TRIANGLE[5][2]} + ${TRIANGLE[5][3]} = ${child1}, and ${TRIANGLE[5][3]} + ${TRIANGLE[5][4]} = ${child2}.`,
        `Dua di bawah: ${TRIANGLE[5][2]} + ${TRIANGLE[5][3]} = ${child1}, dan ${TRIANGLE[5][3]} + ${TRIANGLE[5][4]} = ${child2}.`,
      ),
    },
    {
      phase: 'sum',
      reveal: ['5,3', '6,3', '6,4'],
      ring: ['5,3', '6,3', '6,4'],
      hold: 2000,
      result: false,
      caption: t(
        `Add the three shaded numbers: ${parent} + ${child1} + ${child2}.`,
        `Jumlahkan tiga bilangan arsiran: ${parent} + ${child1} + ${child2}.`,
      ),
    },
    {
      phase: 'result',
      reveal: ['5,3', '6,3', '6,4'],
      ring: [],
      hold: 0,
      result: true,
      caption: t(
        `${parent} + ${child1} + ${child2} = ${answer} — answer A.`,
        `${parent} + ${child1} + ${child2} = ${answer} — jawaban A.`,
      ),
    },
  ]

  return { parent, child1, child2, answer, steps, finalIndex: steps.length - 1 }
}
