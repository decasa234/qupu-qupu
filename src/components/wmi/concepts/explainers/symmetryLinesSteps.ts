export type Lang = 'en' | 'id'

const LINES: Record<string, number> = {
  'equilateral-triangle': 3,
  'isosceles-triangle': 1,
  rectangle: 2,
  square: 4,
  'regular-pentagon': 5,
  'regular-hexagon': 6,
}

export interface SymmetryLinesStep {
  /** How many symmetry lines are currently shown (0 = shape only). */
  linesShown: number
  caption: string
  /** Hold duration in ms (0 = final/result beat, pauses). */
  hold: number
  result: boolean
}

export interface SymmetryLinesStoryboard {
  kind: string
  count: number
  steps: SymmetryLinesStep[]
  /** Index of the final (result) beat — always steps.length − 1. */
  finalIndex: number
}

/**
 * Builds the symmetry-line reveal animation storyboard for a given shape kind.
 *
 * Beats:
 *   0          – shape with no lines (intro)
 *   1..count   – reveal one line per beat, running count caption
 *   count+1    – result beat: all lines shown, final answer caption
 *
 * Defensive: unknown kind → count 0, single result beat.
 */
export function buildSymmetryLinesSteps(kind: string, lang: Lang): SymmetryLinesStoryboard {
  const count = LINES[kind] ?? 0

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SymmetryLinesStep[] = []

  if (count === 0) {
    // Defensive fallback: unknown kind — single result beat
    steps.push({
      linesShown: 0,
      caption: t('0 lines of symmetry', '0 garis simetri'),
      hold: 0,
      result: true,
    })
    return { kind, count: 0, steps, finalIndex: 0 }
  }

  // Intro beat — shape alone, no lines
  steps.push({
    linesShown: 0,
    caption: t(
      'Find every line that folds the shape so both halves match.',
      'Temukan setiap garis yang melipat bangun sehingga kedua bagian cocok.',
    ),
    hold: 1600,
    result: false,
  })

  // One beat per symmetry line
  for (let n = 1; n <= count; n++) {
    const isLast = n === count
    steps.push({
      linesShown: n,
      caption: isLast
        ? t(
            `Line ${n} — that's all ${count}!`,
            `Garis ${n} — semua ${count} sudah ditemukan!`,
          )
        : t(`Line ${n} of symmetry`, `Garis simetri ke-${n}`),
      hold: isLast ? 1200 : 1000,
      result: false,
    })
  }

  // Result beat
  steps.push({
    linesShown: count,
    caption:
      count === 1
        ? t('1 line of symmetry', '1 garis simetri')
        : t(`${count} lines of symmetry`, `${count} garis simetri`),
    hold: 0,
    result: true,
  })

  return { kind, count, steps, finalIndex: steps.length - 1 }
}
