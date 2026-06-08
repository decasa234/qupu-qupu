import type { Lang } from './makeTenSteps'

export type AngleCategory = 'acute' | 'right' | 'obtuse'

export interface AngleTypeStep {
  showSquare: boolean
  caption: string
  hold: number
  result: boolean
}

export interface AngleTypeStoryboard {
  degrees: number
  category: AngleCategory
  steps: AngleTypeStep[]
  finalIndex: number
}

export function buildAngleTypeSteps(degreesRaw: number, lang: Lang): AngleTypeStoryboard {
  // Defensive: non-finite degrees -> 90
  const degrees = Number.isFinite(degreesRaw) ? degreesRaw : 90

  const category: AngleCategory = degrees < 90 ? 'acute' : degrees === 90 ? 'right' : 'obtuse'

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Step captions
  const captionShow = t(
    `This angle measures ${degrees}°.`,
    `Sudut ini berukuran ${degrees}°.`,
  )

  const captionCompare = t(
    'Compare to a square corner (90°)',
    'Bandingkan dengan pojok persegi (90°)',
  )

  let captionResult: string
  if (degrees < 90) {
    captionResult = t(
      `${degrees}° is less than 90°, so it is acute.`,
      `${degrees}° kurang dari 90°, jadi sudutnya lancip.`,
    )
  } else if (degrees === 90) {
    captionResult = t(
      `${degrees}° equals 90°, so it is a right angle.`,
      `${degrees}° sama dengan 90°, jadi sudutnya siku-siku.`,
    )
  } else {
    captionResult = t(
      `${degrees}° is greater than 90°, so it is obtuse.`,
      `${degrees}° lebih dari 90°, jadi sudutnya tumpul.`,
    )
  }

  const steps: AngleTypeStep[] = [
    {
      showSquare: false,
      caption: captionShow,
      hold: 1800,
      result: false,
    },
    {
      showSquare: true,
      caption: captionCompare,
      hold: 2000,
      result: false,
    },
    {
      showSquare: true,
      caption: captionResult,
      hold: 0,
      result: true,
    },
  ]

  return {
    degrees,
    category,
    steps,
    finalIndex: steps.length - 1,
  }
}
