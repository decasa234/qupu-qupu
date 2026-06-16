import type { Lang } from '../concepts/explainers/makeTenSteps'
import { VASE_COUNT } from './P22G1Q8Illustration'

// WMI-22P1A-Q8 (2022 Semifinal Grade 1): a field strewn with vases and a few
// bones. The scan holds EXACTLY 35 vases, and the seed answer is option C = 35,
// so the task that reconciles figure + key is "count the vases". Method, one
// idea per beat — sweep the field top → middle → bottom, building a running
// vase count and ignoring the bones:
//   1. show the scatter, say "count the vases, skip the bones";
//   2. top band counted  -> 12;
//   3. middle band counted -> 25;
//   4. bottom band counted -> 35;
//   result: 35 vases — option C.
//
// The boundary running totals (12, 25, 35) are taken from the fixed ITEMS layout
// (cumulative vase count after each band); VASE_COUNT is the single source for
// the final answer.

export type VasePhase = 'show' | 'count' | 'result'

export interface VaseStep {
  phase: VasePhase
  /** Vases numbered so far (in ITEMS reading order). */
  countedVases: number
  caption: string
  hold: number
  result: boolean
}

export interface VaseStoryboard {
  total: number
  answerLetter: string
  steps: VaseStep[]
  finalIndex: number
}

export function buildP22G1Q8Steps(lang: Lang, answerLetter: string): VaseStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const total = VASE_COUNT // 35

  const steps: VaseStep[] = [
    {
      phase: 'show',
      countedVases: 0,
      hold: 1900,
      result: false,
      caption: t(
        'Count the vases — skip the bones. Sweep top to bottom.',
        'Hitung vasnya — abaikan tulangnya. Sapu dari atas ke bawah.',
      ),
    },
    {
      phase: 'count',
      countedVases: 12,
      hold: 2000,
      result: false,
      caption: t('Top band: 12 vases so far.', 'Bagian atas: 12 vas sejauh ini.'),
    },
    {
      phase: 'count',
      countedVases: 25,
      hold: 2000,
      result: false,
      caption: t('Middle band: now 25 vases.', 'Bagian tengah: sekarang 25 vas.'),
    },
    {
      phase: 'count',
      countedVases: total,
      hold: 2000,
      result: false,
      caption: t(`Bottom band: ${total} vases in all.`, `Bagian bawah: ${total} vas seluruhnya.`),
    },
    {
      phase: 'result',
      countedVases: total,
      hold: 0,
      result: true,
      caption: t(
        `${total} vases — that is option ${answerLetter}.`,
        `${total} vas — itu pilihan ${answerLetter}.`,
      ),
    },
  ]

  return { total, answerLetter, steps, finalIndex: steps.length - 1 }
}
