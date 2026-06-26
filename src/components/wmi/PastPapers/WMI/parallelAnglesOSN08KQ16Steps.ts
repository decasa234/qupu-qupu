// Beat storyboard for OSN-08-SD-KAB-Q16 (parallel lines, co-interior angles).
//
// Seed answer: 60
// Seed quantities (anti-drift):
//   x (from parallel line angle properties) : 60

type Lang = 'en' | 'id'

export interface PAStep {
  /** Highlight the co-interior angles (x and lower 2x) in amber. */
  highlightCoInterior: boolean
  /** Fill the co-interior angles to visualise their sum. */
  fillCoInterior: boolean
  /** Show numeric answer labels instead of algebraic. */
  showAnswer: boolean
  /** Beat caption. */
  caption: string
  /** Equation badge (empty = hidden). */
  equation: string
  /** Is this the final beat? */
  result: boolean
  /** Auto-advance hold (ms). 0 = wait for user. */
  hold: number
}

export interface PAStory {
  steps: PAStep[]
  finalIndex: number
}

const EN: PAStep[] = [
  {
    highlightCoInterior: false,
    fillCoInterior:      false,
    showAnswer:          false,
    caption:  'Two horizontal parallel lines are cut by a transversal. Angles x and 2x are marked.',
    equation: '',
    result:   false,
    hold:     2000,
  },
  {
    highlightCoInterior: true,
    fillCoInterior:      false,
    showAnswer:          false,
    caption:  'x (interior at upper line) and 2x (interior at lower line) are co-interior (same-side interior) angles.',
    equation: '',
    result:   false,
    hold:     2500,
  },
  {
    highlightCoInterior: true,
    fillCoInterior:      true,
    showAnswer:          false,
    caption:  'Co-interior angles between parallel lines sum to 180°.',
    equation: 'x + 2x = 180°',
    result:   false,
    hold:     2500,
  },
  {
    highlightCoInterior: true,
    fillCoInterior:      true,
    showAnswer:          false,
    caption:  '3x = 180°, so x = 60°.',
    equation: '3x = 180° → x = 60°',
    result:   false,
    hold:     2000,
  },
  {
    highlightCoInterior: true,
    fillCoInterior:      false,
    showAnswer:          true,
    caption:  'x = 60°',
    equation: 'x = 60°',
    result:   true,
    hold:     0,
  },
]

const ID: PAStep[] = [
  {
    highlightCoInterior: false,
    fillCoInterior:      false,
    showAnswer:          false,
    caption:  'Dua garis horizontal sejajar dipotong transversal. Sudut x dan 2x ditandai.',
    equation: '',
    result:   false,
    hold:     2000,
  },
  {
    highlightCoInterior: true,
    fillCoInterior:      false,
    showAnswer:          false,
    caption:  'Sudut x (interior garis atas) dan 2x (interior garis bawah) adalah sudut dalam sepihak.',
    equation: '',
    result:   false,
    hold:     2500,
  },
  {
    highlightCoInterior: true,
    fillCoInterior:      true,
    showAnswer:          false,
    caption:  'Sudut dalam sepihak pada dua garis sejajar berjumlah 180°.',
    equation: 'x + 2x = 180°',
    result:   false,
    hold:     2500,
  },
  {
    highlightCoInterior: true,
    fillCoInterior:      true,
    showAnswer:          false,
    caption:  '3x = 180°, maka x = 60°.',
    equation: '3x = 180° → x = 60°',
    result:   false,
    hold:     2000,
  },
  {
    highlightCoInterior: true,
    fillCoInterior:      false,
    showAnswer:          true,
    caption:  'x = 60°',
    equation: 'x = 60°',
    result:   true,
    hold:     0,
  },
]

export function buildParallelAnglesOSN08KQ16Steps(lang: Lang): PAStory {
  const steps = lang === 'id' ? ID : EN
  return { steps, finalIndex: steps.length - 1 }
}
