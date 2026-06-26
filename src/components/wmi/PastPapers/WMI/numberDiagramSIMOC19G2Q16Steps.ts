import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { DiagramArm } from './NumberDiagramSIMOC19G2Q16Illustration'
import {
  CENTRE, TOP_E, TOP_D, LEFT_E, LEFT_D, RIGHT_E, RIGHT_D, BOT_E, BOT_ANSWER,
} from './NumberDiagramSIMOC19G2Q16Illustration'

// ── Step types ────────────────────────────────────────────────────────────────

export interface DiagramStep {
  highlight: DiagramArm
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface DiagramStoryboard {
  steps: DiagramStep[]
  finalIndex: number
}

// ── Builder ───────────────────────────────────────────────────────────────────

export function buildNumberDiagramSIMOC19G2Q16Steps(lang: Lang): DiagramStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DiagramStep[] = [
    {
      highlight: '',
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        `The centre square is ${CENTRE}. Each arm circle feeds a corner diamond. Find the rule!`,
        `Kotak tengah berisi ${CENTRE}. Setiap lingkaran tepi menghasilkan belah ketupat di pojok. Temukan aturannya!`,
      ),
    },
    {
      highlight: 'top',
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Top arm = ${TOP_E}, top diamond = ${TOP_D}. Try: ${CENTRE} × (${CENTRE} − ${TOP_E}) + ${TOP_E} = ${CENTRE} × ${CENTRE - TOP_E} + ${TOP_E} = ${TOP_D} ✓`,
        `Lingkaran atas = ${TOP_E}, belah ketupat atas = ${TOP_D}. Coba: ${CENTRE} × (${CENTRE} − ${TOP_E}) + ${TOP_E} = ${CENTRE} × ${CENTRE - TOP_E} + ${TOP_E} = ${TOP_D} ✓`,
      ),
    },
    {
      highlight: 'left',
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Left arm = ${LEFT_E}, left diamond = ${LEFT_D}. Check: ${CENTRE} × (${CENTRE} − ${LEFT_E}) + ${LEFT_E} = ${CENTRE} × ${CENTRE - LEFT_E} + ${LEFT_E} = ${LEFT_D} ✓`,
        `Lingkaran kiri = ${LEFT_E}, belah ketupat kiri = ${LEFT_D}. Cek: ${CENTRE} × (${CENTRE} − ${LEFT_E}) + ${LEFT_E} = ${CENTRE} × ${CENTRE - LEFT_E} + ${LEFT_E} = ${LEFT_D} ✓`,
      ),
    },
    {
      highlight: 'right',
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Right arm = ${RIGHT_E}, right diamond = ${RIGHT_D}. Check: ${CENTRE} × (${CENTRE} − ${RIGHT_E}) + ${RIGHT_E} = ${CENTRE} × ${CENTRE - RIGHT_E} + ${RIGHT_E} = ${RIGHT_D} ✓`,
        `Lingkaran kanan = ${RIGHT_E}, belah ketupat kanan = ${RIGHT_D}. Cek: ${CENTRE} × (${CENTRE} − ${RIGHT_E}) + ${RIGHT_E} = ${CENTRE} × ${CENTRE - RIGHT_E} + ${RIGHT_E} = ${RIGHT_D} ✓`,
      ),
    },
    {
      highlight: 'bottom',
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Bottom arm = ${BOT_E}. Apply rule: ${CENTRE} × (${CENTRE} − ${BOT_E}) + ${BOT_E} = ${CENTRE} × ${CENTRE - BOT_E} + ${BOT_E} = …`,
        `Lingkaran bawah = ${BOT_E}. Terapkan aturan: ${CENTRE} × (${CENTRE} − ${BOT_E}) + ${BOT_E} = ${CENTRE} × ${CENTRE - BOT_E} + ${BOT_E} = …`,
      ),
    },
    {
      highlight: 'bottom',
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `${CENTRE} × ${CENTRE - BOT_E} + ${BOT_E} = ${CENTRE * (CENTRE - BOT_E)} + ${BOT_E} = ${BOT_ANSWER}. The missing number is ${BOT_ANSWER}!`,
        `${CENTRE} × ${CENTRE - BOT_E} + ${BOT_E} = ${CENTRE * (CENTRE - BOT_E)} + ${BOT_E} = ${BOT_ANSWER}. Bilangan yang hilang adalah ${BOT_ANSWER}!`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
