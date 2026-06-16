import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { PATH_CELLS, PG_START, PG_STEP, STAR_INDEX, STAR_VALUE, pathValue } from './PathGridIllustration'

export type PathGridPhase = 'show' | 'rule' | 'walk' | 'result'

export interface PathGridStep {
  phase: PathGridPhase
  /** Number of path cells lit (walked) on this beat. */
  progress: number
  /** Running value carried at this point of the walk (null on show). */
  running: number | null
  /** Show 33 in the ★ cell. */
  revealStar: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PathGridStoryboard {
  star: number
  steps: PathGridStep[]
  finalIndex: number
}

export function buildPathGridSteps(lang: Lang): PathGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const drop = Math.abs(PG_STEP) // 6

  const steps: PathGridStep[] = [
    {
      phase: 'show',
      progress: 0,
      running: null,
      revealStar: false,
      caption: t('Follow the path and find ★ at the end.', 'Ikuti jalurnya dan temukan ★ di ujungnya.'),
      hold: 1600,
      result: false,
    },
    {
      phase: 'rule',
      progress: 1,
      running: PG_START,
      revealStar: false,
      caption: t(
        `Start at ${PG_START}. From 99 to 93 to 87 the number drops by ${drop} each step.`,
        `Mulai dari ${PG_START}. Dari 99 ke 93 ke 87, angkanya turun ${drop} tiap langkah.`,
      ),
      hold: 2300,
      result: false,
    },
  ]

  // Walk the rest of the path, lighting one more cell per beat, value -6 each step.
  // Pause a beat longer on the labelled checkpoints so the running value is easy to follow.
  for (let i = 1; i <= STAR_INDEX; i++) {
    const value = pathValue(i)
    const atStar = i === STAR_INDEX
    const labelled = [1, 2, 5, 7, STAR_INDEX].includes(i)
    steps.push({
      phase: 'walk',
      progress: i + 1,
      running: value,
      revealStar: false,
      caption: atStar
        ? t(`Keep subtracting ${drop} … the path reaches ★.`, `Terus kurangi ${drop} … jalur sampai ke ★.`)
        : t(`${value + drop} − ${drop} = ${value}.`, `${value + drop} − ${drop} = ${value}.`),
      hold: labelled ? 1700 : 900,
      result: false,
    })
  }

  steps.push({
    phase: 'result',
    progress: PATH_CELLS.length,
    running: STAR_VALUE,
    revealStar: true,
    caption: t(`★ = ${STAR_VALUE}.`, `★ = ${STAR_VALUE}.`),
    hold: 0,
    result: true,
  })

  return { star: STAR_VALUE, steps, finalIndex: steps.length - 1 }
}
