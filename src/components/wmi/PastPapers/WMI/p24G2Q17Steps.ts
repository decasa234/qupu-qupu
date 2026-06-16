import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { Q17_HALF, Q17_NUMBERS, Q17_TOTAL } from './P24G2Q17Illustration'

// Storyboard for WMI-24P2A-Q17 (answer E).
//
// Add every number on the cake (8 + 22 + 16 + 9 + 5 = 60); a fair cut gives each
// piece half = 30. The cut that puts {22, 8} = 30 on one side and {16, 9, 5} = 30
// on the other is the correct one — option E.
//
// Trap: option (A) just looks even by area but splits the numbers unequally.

export type Q17Phase = 'show' | 'total' | 'half' | 'groupA' | 'groupB' | 'result'

export interface Q17Step {
  phase: Q17Phase
  shade: 'none' | 'a' | 'b'
  showCut: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q17Storyboard {
  total: number
  half: number
  answerLabel: string
  steps: Q17Step[]
  finalIndex: number
}

export function buildP24G2Q17Steps(lang: Lang): Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const { tl, tr, bl, br, mid } = Q17_NUMBERS // 8, 22, 16, 9, 5

  const steps: Q17Step[] = [
    {
      phase: 'show',
      shade: 'none',
      showCut: false,
      hold: 1700,
      result: false,
      caption: t('Each piece must hold the SAME number total.', 'Tiap bagian harus berjumlah angka SAMA.'),
    },
    {
      phase: 'total',
      shade: 'none',
      showCut: false,
      hold: 2100,
      result: false,
      caption: t(
        `Add them all: ${tl} + ${tr} + ${bl} + ${br} + ${mid} = ${Q17_TOTAL}.`,
        `Jumlahkan semua: ${tl} + ${tr} + ${bl} + ${br} + ${mid} = ${Q17_TOTAL}.`,
      ),
    },
    {
      phase: 'half',
      shade: 'none',
      showCut: false,
      hold: 1900,
      result: false,
      caption: t(`Half of ${Q17_TOTAL} is ${Q17_HALF}, so each piece needs ${Q17_HALF}.`, `Setengah ${Q17_TOTAL} adalah ${Q17_HALF}, jadi tiap bagian butuh ${Q17_HALF}.`),
    },
    {
      phase: 'groupA',
      shade: 'a',
      showCut: false,
      hold: 2000,
      result: false,
      caption: t(`One piece: ${tr} + ${tl} = ${Q17_HALF}.`, `Satu bagian: ${tr} + ${tl} = ${Q17_HALF}.`),
    },
    {
      phase: 'groupB',
      shade: 'b',
      showCut: false,
      hold: 2000,
      result: false,
      caption: t(`Other piece: ${bl} + ${br} + ${mid} = ${Q17_HALF}.`, `Bagian lain: ${bl} + ${br} + ${mid} = ${Q17_HALF}.`),
    },
    {
      phase: 'result',
      shade: 'none',
      showCut: true,
      hold: 0,
      result: true,
      caption: t(
        `${Q17_HALF} on each side — the cut that does this is option E.`,
        `${Q17_HALF} di tiap sisi — potongan yang begini adalah pilihan E.`,
      ),
    },
  ]

  return { total: Q17_TOTAL, half: Q17_HALF, answerLabel: 'E', steps, finalIndex: steps.length - 1 }
}
