import type { Lang } from '../concepts/explainers/makeTenSteps'
import {
  ANSWER_SUM,
  BOT_GAP,
  BOT_LEN,
  LONG_LEN,
  RIGHT_GAP,
  TOP_GAP,
  TOP_LEN,
  TOTAL_W,
} from './P24G2Q14Illustration'

// Storyboard for the WMI-24P2A-Q14 explainer (three pencils, fixed width).
//
// Method, one idea per beat:
//   1. show the figure: all three pencils stretch between the SAME two dashed
//      lines, so the full width is fixed.
//   2. the longest pencil (18) plus its 5 cm gap spans the whole width:
//      width = 18 + 5 = 23.
//   3. top pencil leaves 10 cm empty, so it is 23 − 10 = 13 cm.
//   4. bottom pencil leaves 12 cm empty, so it is 23 − 12 = 11 cm.
//   5. result: the other two together = 13 + 11 = 24 cm -> answer B.

export type PencilPhase = 'show' | 'width' | 'top' | 'bottom' | 'result'

export interface PencilStep {
  phase: PencilPhase
  showWidth: boolean
  showTopLen: boolean
  showBotLen: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PencilStoryboard {
  totalW: number
  topLen: number
  botLen: number
  answerSum: number
  answer: string
  steps: PencilStep[]
  finalIndex: number
}

export function buildP24G2Q14Steps(lang: Lang, answer: string): PencilStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PencilStep[] = [
    {
      phase: 'show',
      showWidth: false,
      showTopLen: false,
      showBotLen: false,
      hold: 1800,
      result: false,
      caption: t(
        'All three pencils stretch between the same two dashed lines, so the full width is fixed.',
        'Ketiga pensil membentang di antara dua garis putus-putus yang sama, jadi lebar totalnya tetap.',
      ),
    },
    {
      phase: 'width',
      showWidth: true,
      showTopLen: false,
      showBotLen: false,
      hold: 2100,
      result: false,
      caption: t(
        `The longest pencil ${LONG_LEN} cm + its ${RIGHT_GAP} cm gap spans the whole width: ${LONG_LEN} + ${RIGHT_GAP} = ${TOTAL_W} cm.`,
        `Pensil terpanjang ${LONG_LEN} cm + celah ${RIGHT_GAP} cm = lebar penuh: ${LONG_LEN} + ${RIGHT_GAP} = ${TOTAL_W} cm.`,
      ),
    },
    {
      phase: 'top',
      showWidth: true,
      showTopLen: true,
      showBotLen: false,
      hold: 2100,
      result: false,
      caption: t(
        `Top pencil leaves ${TOP_GAP} cm empty, so it is ${TOTAL_W} − ${TOP_GAP} = ${TOP_LEN} cm.`,
        `Pensil atas menyisakan ${TOP_GAP} cm kosong, jadi ${TOTAL_W} − ${TOP_GAP} = ${TOP_LEN} cm.`,
      ),
    },
    {
      phase: 'bottom',
      showWidth: true,
      showTopLen: true,
      showBotLen: true,
      hold: 2100,
      result: false,
      caption: t(
        `Bottom pencil leaves ${BOT_GAP} cm empty, so it is ${TOTAL_W} − ${BOT_GAP} = ${BOT_LEN} cm.`,
        `Pensil bawah menyisakan ${BOT_GAP} cm kosong, jadi ${TOTAL_W} − ${BOT_GAP} = ${BOT_LEN} cm.`,
      ),
    },
    {
      phase: 'result',
      showWidth: true,
      showTopLen: true,
      showBotLen: true,
      hold: 0,
      result: true,
      caption: t(
        `The other two together: ${TOP_LEN} + ${BOT_LEN} = ${ANSWER_SUM} cm — answer ${answer}.`,
        `Dua pensil lainnya: ${TOP_LEN} + ${BOT_LEN} = ${ANSWER_SUM} cm — jawaban ${answer}.`,
      ),
    },
  ]

  return {
    totalW: TOTAL_W,
    topLen: TOP_LEN,
    botLen: BOT_LEN,
    answerSum: ANSWER_SUM,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
