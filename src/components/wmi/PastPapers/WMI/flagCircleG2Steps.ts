import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-19F2A-Q19 — flags around a circular bed (circumference 100 m).
// Red every 5 m -> 100/5 = 20 red. One yellow per gap; on a circle gaps = flags
// -> 20 yellow. Total 20 + 20 = 40.
export const RED = 20
export const YELLOW = 20
export const TOTAL = 40

export interface FlagStep {
  showRed: boolean
  showYellow: boolean
  showTotal: boolean
  caption: string
  hold: number
  result: boolean
}
export interface FlagStoryboard {
  steps: FlagStep[]
  finalIndex: number
}

export function buildFlagCircleG2Steps(lang: Lang): FlagStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: FlagStep[] = [
    {
      showRed: false,
      showYellow: false,
      showTotal: false,
      hold: 1700,
      result: false,
      caption: t('A round flower bed, 100 m all the way around.', 'Taman bunga bundar, kelilingnya 100 m.'),
    },
    {
      showRed: true,
      showYellow: false,
      showTotal: false,
      hold: 2100,
      result: false,
      caption: t('A red flag every 5 m: 100 ÷ 5 = 20 red flags.', 'Bendera merah tiap 5 m: 100 ÷ 5 = 20 bendera merah.'),
    },
    {
      showRed: true,
      showYellow: true,
      showTotal: false,
      hold: 2400,
      result: false,
      caption: t(
        'One yellow flag in each gap. Around a circle the gaps equal the flags — 20 gaps, so 20 yellow.',
        'Satu bendera kuning di tiap celah. Di lingkaran, celah sama dengan bendera — 20 celah, jadi 20 kuning.',
      ),
    },
    {
      showRed: true,
      showYellow: true,
      showTotal: true,
      hold: 0,
      result: true,
      caption: t('20 + 20 = 40 flags in total.', '20 + 20 = 40 bendera seluruhnya.'),
    },
  ]
  return { steps, finalIndex: steps.length - 1 }
}
