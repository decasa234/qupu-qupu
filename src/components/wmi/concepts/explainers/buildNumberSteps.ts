import type { Lang } from './makeTenSteps'

export type BuildNumberPhase = 'clues' | 'number' | 'op' | 'result'

export interface BuildNumberStep {
  phase: BuildNumberPhase
  caption: string
  result: boolean
}

export interface BuildNumberStoryboard {
  tens: number
  units: number
  number: number
  k: number
  dir: 'more' | 'less'
  answer: number
  steps: BuildNumberStep[]
  finalIndex: number
}

export function buildBuildNumberSteps(
  tens: number,
  units: number,
  k: number,
  dir: 'more' | 'less',
  lang: Lang,
): BuildNumberStoryboard {
  const number = 10 * tens + units
  const answer = dir === 'more' ? number + k : number - k

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const moreWord = t('more than', 'lebih dari')
  const lessWord = t('less than', 'kurang dari')
  const dirWord = dir === 'more' ? moreWord : lessWord
  const opSymbol = dir === 'more' ? '+' : '−'

  const steps: BuildNumberStep[] = [
    {
      phase: 'clues',
      caption: t(
        `Tens digit ${tens}, ones digit ${units}.`,
        `Angka puluhan ${tens}, angka satuan ${units}.`,
      ),
      result: false,
    },
    {
      phase: 'number',
      caption: t(`That makes the number ${number}.`, `Itu membentuk bilangan ${number}.`),
      result: false,
    },
    {
      phase: 'op',
      caption: t(`${k} ${dirWord} ${number}.`, `${k} ${dirWord} ${number}.`),
      result: false,
    },
    {
      phase: 'result',
      caption: t(
        `${number} ${opSymbol} ${k} = ${answer}.`,
        `${number} ${opSymbol} ${k} = ${answer}.`,
      ),
      result: true,
    },
  ]

  return { tens, units, number, k, dir, answer, steps, finalIndex: steps.length - 1 }
}
