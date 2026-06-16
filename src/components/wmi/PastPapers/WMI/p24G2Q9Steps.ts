import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Storyboard for the WMI-24P2A-Q9 explainer (Jimmy & Nancy face to face).
//
// Method, one idea per beat:
//   1. show the setup (Jimmy's back faces North).
//   2. back faces North => Jimmy FACES South.
//   3. face to face => Nancy FACES the opposite way, North.
//   4. facing North, your LEFT hand points West.
//   5. result: Nancy's left is West -> answer B.

export type FacePhase = 'show' | 'jimmy' | 'nancy' | 'left' | 'result'

export interface FaceStep {
  phase: FacePhase
  showJimmyFace: boolean
  showNancyFace: boolean
  showNancyLeft: boolean
  caption: string
  hold: number
  result: boolean
}

export interface FaceStoryboard {
  answer: string
  steps: FaceStep[]
  finalIndex: number
}

export function buildP24G2Q9Steps(lang: Lang, answer: string): FaceStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FaceStep[] = [
    {
      phase: 'show',
      showJimmyFace: false,
      showNancyFace: false,
      showNancyLeft: false,
      hold: 1700,
      result: false,
      caption: t(
        "Given: Jimmy's BACK faces North.",
        'Diketahui: PUNGGUNG Jimmy menghadap Utara.',
      ),
    },
    {
      phase: 'jimmy',
      showJimmyFace: true,
      showNancyFace: false,
      showNancyLeft: false,
      hold: 2000,
      result: false,
      caption: t(
        'Back faces North, so Jimmy FACES the opposite way — South.',
        'Punggung ke Utara, jadi Jimmy MENGHADAP arah sebaliknya — Selatan.',
      ),
    },
    {
      phase: 'nancy',
      showJimmyFace: true,
      showNancyFace: true,
      showNancyLeft: false,
      hold: 2100,
      result: false,
      caption: t(
        'They are face to face, so Nancy faces the other way — North.',
        'Mereka berhadapan, jadi Nancy menghadap arah sebaliknya — Utara.',
      ),
    },
    {
      phase: 'left',
      showJimmyFace: true,
      showNancyFace: true,
      showNancyLeft: true,
      hold: 2100,
      result: false,
      caption: t(
        'Facing North, your LEFT hand points West.',
        'Menghadap Utara, tangan KIRImu menunjuk ke Barat.',
      ),
    },
    {
      phase: 'result',
      showJimmyFace: true,
      showNancyFace: true,
      showNancyLeft: true,
      hold: 0,
      result: true,
      caption: t(
        `So Nancy's left is West — answer ${answer}.`,
        `Jadi kiri Nancy adalah Barat — jawaban ${answer}.`,
      ),
    },
  ]

  return { answer, steps, finalIndex: steps.length - 1 }
}
