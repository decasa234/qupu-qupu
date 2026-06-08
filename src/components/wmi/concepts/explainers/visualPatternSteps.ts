export type ShapeName = 'circle' | 'triangle' | 'square' | 'star'

export type VisualPatternPhase = 'question' | 'cycle' | 'answer'

export interface VisualPatternStep {
  phase: VisualPatternPhase
  caption: string
  hold: number
  result: boolean
}

export interface VisualPatternStoryboard {
  cycle: ShapeName[]
  shown: number
  /** The full sequence of shapes displayed (length === shown). */
  sequence: ShapeName[]
  /** The answer: the shape that fills the "?" box. */
  next: ShapeName
  steps: VisualPatternStep[]
  finalIndex: number
}

const ALL_SHAPES: ShapeName[] = ['circle', 'triangle', 'square', 'star']
const FALLBACK_CYCLE: ShapeName[] = ['circle', 'triangle']

function isShapeName(x: unknown): x is ShapeName {
  return typeof x === 'string' && ALL_SHAPES.includes(x as ShapeName)
}

export function buildVisualPatternSteps(
  rawCycle: unknown,
  rawShown: unknown,
  lang: 'en' | 'id' = 'en',
): VisualPatternStoryboard {
  const parsed: ShapeName[] = Array.isArray(rawCycle)
    ? (rawCycle as unknown[]).filter(isShapeName)
    : []
  const safeCycle: ShapeName[] = parsed.length >= 2 ? parsed : FALLBACK_CYCLE

  const shown =
    typeof rawShown === 'number' && Number.isInteger(rawShown) && rawShown >= 1
      ? rawShown
      : 5

  const sequence: ShapeName[] = Array.from(
    { length: shown },
    (_, i): ShapeName => safeCycle[i % safeCycle.length] as ShapeName,
  )
  const next: ShapeName = safeCycle[shown % safeCycle.length] as ShapeName

  const t = (en: string, id: string): string => (lang === 'id' ? id : en)

  const cycleLabel = safeCycle.join(', ')

  const steps: VisualPatternStep[] = [
    {
      phase: 'question',
      caption: t('Which shape comes next?', 'Bentuk apa yang berikutnya?'),
      hold: 1600,
      result: false,
    },
    {
      phase: 'cycle',
      caption: t(
        `The repeating unit is: ${cycleLabel}.`,
        `Pola berulangnya: ${cycleLabel}.`,
      ),
      hold: 2000,
      result: false,
    },
    {
      phase: 'answer',
      caption: t(
        `Position ${shown + 1} lands on ${next}!`,
        `Posisi ke-${shown + 1} jatuh pada ${next}!`,
      ),
      hold: 0,
      result: true,
    },
  ]

  return {
    cycle: safeCycle,
    shown,
    sequence,
    next,
    steps,
    finalIndex: steps.length - 1,
  }
}
