// Storyboard for WMI-20F1A Q1: 9 + 2 + 6 = ? (answer A = 17).
//
// Strategy from the seed hint steps (db/seed/wmi/papers/2020-final-g1.json):
//   "Make a ten first: 9 + 2 = 9 + 1 + 1 = 11." → "Now add the 6: 11 + 6 = 17."
// Visualised with counters: a 2×5 ten-frame holding 9 blue dots (one empty
// cell), 2 amber dots, 6 green dots. One amber dot slides into the empty cell
// to complete the ten; the leftover 1 then makes 11; the 6 joins for 17.
import type { Lang } from '../../concepts/explainers/makeTenSteps'

export interface MakeTenVisual20Step {
  /** One amber dot has moved into the ten-frame's empty cell (frame is full). */
  moved: boolean
  /** The green 6-dot group has joined the running total. */
  joined: boolean
  /** Which running-total label to show under the counters. */
  showTotal: 'none' | 'eleven' | 'seventeen'
  caption: string
  /** How long to hold this beat on screen, in ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface MakeTenVisual20Storyboard {
  answer: number
  steps: MakeTenVisual20Step[]
  finalIndex: number
}

export function buildMakeTenVisual20Steps(lang: Lang): MakeTenVisual20Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MakeTenVisual20Step[] = [
    {
      moved: false,
      joined: false,
      showTotal: 'none',
      hold: 1800,
      result: false,
      caption: t('We add 9, 2 and 6.', 'Kita menjumlahkan 9, 2, dan 6.'),
    },
    {
      moved: true,
      joined: false,
      showTotal: 'none',
      hold: 2200,
      result: false,
      caption: t(
        'Make a ten first: take 1 from the 2, so 9 + 1 = 10 — a full ten! 1 left over.',
        'Buat sepuluh dulu: ambil 1 dari angka 2, jadi 9 + 1 = 10 — sepuluh penuh! Sisa 1.',
      ),
    },
    {
      moved: true,
      joined: false,
      showTotal: 'eleven',
      hold: 1900,
      result: false,
      caption: t('10 + 1 = 11.', '10 + 1 = 11.'),
    },
    {
      moved: true,
      joined: true,
      showTotal: 'seventeen',
      hold: 2000,
      result: false,
      caption: t('Now add the 6: 11 + 6 = 17.', 'Sekarang tambahkan 6: 11 + 6 = 17.'),
    },
    {
      moved: true,
      joined: true,
      showTotal: 'seventeen',
      hold: 0,
      result: true,
      caption: t(
        '9 + 2 + 6 = 17 (A). The trap: forgetting the leftover 1 gives 16.',
        '9 + 2 + 6 = 17 (A). Jebakannya: lupa sisa 1 menghasilkan 16.',
      ),
    },
  ]

  return { answer: 17, steps, finalIndex: steps.length - 1 }
}
