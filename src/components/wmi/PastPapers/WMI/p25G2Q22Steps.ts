import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { DEGREE, ODD_CORNERS, PERIMETER_EDGES, INTERIOR_EDGES } from './P25G2Q22Illustration'
import type { Corner } from './P25G2Q22Illustration'

export type GardenPhase = 'show' | 'count' | 'odd' | 'result'

export interface GardenStep {
  phase: GardenPhase
  flags: Partial<Record<Corner, 'odd' | 'even'>>
  showDegrees: boolean
  litEdges: Array<[Corner, Corner]>
  caption: string
  hold: number
  result: boolean
}

export interface GardenStoryboard {
  oddCorners: Corner[]
  answer: string
  steps: GardenStep[]
  finalIndex: number
}

const ALL_EDGES: Array<[Corner, Corner]> = [...PERIMETER_EDGES, ...INTERIOR_EDGES]

/** Answer letter for "A, C" in the 5-option list (option C). */
const ANSWER_LETTER = 'C'

export function buildP25G2Q22Steps(lang: Lang): GardenStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const oddFlags: Partial<Record<Corner, 'odd' | 'even'>> = {}
  for (const c of Object.keys(DEGREE) as Corner[]) oddFlags[c] = DEGREE[c] % 2 === 1 ? 'odd' : 'even'

  const oddOnly: Partial<Record<Corner, 'odd' | 'even'>> = {}
  for (const c of ODD_CORNERS) oddOnly[c] = 'odd'

  const dA = DEGREE.A
  const dB = DEGREE.B
  const dC = DEGREE.C
  const dD = DEGREE.D
  const oddList = ODD_CORNERS.join(' and ')

  const steps: GardenStep[] = [
    {
      phase: 'show',
      flags: {},
      showDegrees: false,
      litEdges: [],
      hold: 1800,
      result: false,
      caption: t(
        'Every path — the road around AND the paths across — must be walked exactly once.',
        'Setiap jalur — jalan keliling DAN jalur menyilang — harus dilalui tepat sekali.',
      ),
    },
    {
      phase: 'count',
      flags: {},
      showDegrees: true,
      litEdges: ALL_EDGES,
      hold: 2300,
      result: false,
      caption: t(
        `Count the paths meeting at each corner: A=${dA}, B=${dB}, C=${dC}, D=${dD}.`,
        `Hitung jalur yang bertemu di tiap sudut: A=${dA}, B=${dB}, C=${dC}, D=${dD}.`,
      ),
    },
    {
      phase: 'odd',
      flags: oddFlags,
      showDegrees: true,
      litEdges: [],
      hold: 2300,
      result: false,
      caption: t(
        `B and D are even — a once-only walk can't start or end there. Only ${oddList} are odd.`,
        `B dan D genap — jalan sekali-lewat tak bisa mulai/berakhir di situ. Hanya ${oddList} yang ganjil.`,
      ),
    },
    {
      phase: 'result',
      flags: oddOnly,
      showDegrees: true,
      litEdges: [],
      hold: 0,
      result: true,
      caption: t(
        `The trail must start and end at the two odd corners: ${oddList} — answer ${ANSWER_LETTER}.`,
        `Jejak harus mulai dan berakhir di dua sudut ganjil: ${oddList} — jawaban ${ANSWER_LETTER}.`,
      ),
    },
  ]

  return {
    oddCorners: ODD_CORNERS,
    answer: ANSWER_LETTER,
    steps,
    finalIndex: steps.length - 1,
  }
}
