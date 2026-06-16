// Storyboard for WMI-21P1A-Q24 — the animal-substitution explainer.
//
// Facts:  🦛 + 🦁 = 20            (the pair)
//         🦛 + 🦁 + 🦁 + 🦁 + 🐨 = 51   (the long line)
// Method: the long line STARTS with 🦛 + 🦁, which is 20. Swap it in:
//         20 + 🦁 + 🦁 + 🐨 = 51  →  🦁 + 🦁 + 🐨 = 31
//         🦁 = 8, 🐨 = 15:  8 + 8 + 15 = 31 ✓
//         🦛 = 20 − 🦁 = 20 − 8 = 12  → answer C.
import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  HIPPO_VALUE,
  KOALA_VALUE,
  LION_VALUE,
  LONG_ROW,
  LONG_TOTAL,
  PAIR_ROW,
  PAIR_TOTAL,
  type Token,
} from './P21G1Q24Illustration'

export type Q24Phase = 'show' | 'pair' | 'substitute' | 'lionKoala' | 'result'

export interface Q24Step {
  phase: Q24Phase
  /** Which row to display: the pair (🦛+🦁=20) or the long line. */
  row: Token[]
  highlightFirstThree: boolean
  valueChips: Record<number, string> | null
  caption: string
  hold: number
  result: boolean
}

export interface Q24Storyboard {
  hippo: number
  answer: number
  steps: Q24Step[]
  finalIndex: number
}

export function buildP21G1Q24Steps(lang: Lang): Q24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const lion = LION_VALUE // 8
  const koala = KOALA_VALUE // 15
  const hippo = HIPPO_VALUE // 12
  const rest = LONG_TOTAL - PAIR_TOTAL // 31

  const steps: Q24Step[] = [
    {
      phase: 'show',
      row: LONG_ROW,
      highlightFirstThree: false,
      valueChips: null,
      hold: 1700,
      result: false,
      caption: t(
        'Each animal is a number. The long line adds to 51.',
        'Tiap hewan adalah bilangan. Baris panjang berjumlah 51.',
      ),
    },
    {
      phase: 'pair',
      row: LONG_ROW,
      highlightFirstThree: true,
      valueChips: null,
      hold: 2000,
      result: false,
      caption: t(
        `The line STARTS with 🦛 + 🦁 — and we know that pair = ${PAIR_TOTAL}.`,
        `Baris ini DIAWALI 🦛 + 🦁 — dan kita tahu pasangan itu = ${PAIR_TOTAL}.`,
      ),
    },
    {
      phase: 'substitute',
      row: LONG_ROW,
      highlightFirstThree: true,
      valueChips: null,
      hold: 2100,
      result: false,
      caption: t(
        `Swap it in: ${PAIR_TOTAL} + 🦁 + 🦁 + 🐨 = 51, so 🦁 + 🦁 + 🐨 = ${rest}.`,
        `Ganti: ${PAIR_TOTAL} + 🦁 + 🦁 + 🐨 = 51, jadi 🦁 + 🦁 + 🐨 = ${rest}.`,
      ),
    },
    {
      phase: 'lionKoala',
      row: LONG_ROW,
      highlightFirstThree: false,
      valueChips: { 2: String(lion), 4: String(lion), 6: String(lion), 8: String(koala) },
      hold: 2100,
      result: false,
      caption: t(
        `From the picture 🦁 = ${lion}, 🐨 = ${koala}: ${lion} + ${lion} + ${koala} = ${rest}. ✓`,
        `Dari gambar 🦁 = ${lion}, 🐨 = ${koala}: ${lion} + ${lion} + ${koala} = ${rest}. ✓`,
      ),
    },
    {
      phase: 'result',
      row: PAIR_ROW,
      highlightFirstThree: true,
      valueChips: { 0: String(hippo), 2: String(lion) },
      hold: 0,
      result: true,
      caption: t(
        `So 🦛 = ${PAIR_TOTAL} − 🦁 = ${PAIR_TOTAL} − ${lion} = ${hippo} — answer C.`,
        `Maka 🦛 = ${PAIR_TOTAL} − 🦁 = ${PAIR_TOTAL} − ${lion} = ${hippo} — jawaban C.`,
      ),
    },
  ]

  return { hippo, answer: hippo, steps, finalIndex: steps.length - 1 }
}
