import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { PartKey } from './P22G2Q20Illustration'
import { DARK_PARTS, PART_EXPR, PART_VALUE } from './P22G2Q20Illustration'

// Storyboard for WMI-22P2A-Q20 — evaluate each part, shade those with value > 8.
// Lands on: only 6×7=42 and 72÷8=9 are dark → answer C.
export interface FaceStep {
  shaded: PartKey[]
  showValues: boolean
  caption: string
  hold: number
  result: boolean
}

export interface FaceStoryboard {
  darkParts: PartKey[]
  steps: FaceStep[]
  finalIndex: number
}

export function buildP22G2Q20Steps(lang: Lang): FaceStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Pretty list of the dark expressions, e.g. "6×7=42 and 72÷8=9".
  const darkList = DARK_PARTS.map((k) => `${PART_EXPR[k]}=${PART_VALUE[k]}`)
  const darkJoined = (sep: string) => darkList.join(sep)

  const steps: FaceStep[] = [
    {
      shaded: [],
      showValues: false,
      hold: 1800,
      result: false,
      caption: t(
        'First work out the value inside every part — colour comes later.',
        'Hitung dulu nilai di tiap bagian — pewarnaan belakangan.',
      ),
    },
    {
      shaded: [],
      showValues: true,
      hold: 2400,
      result: false,
      caption: t(
        '2×3=6, 28÷7=4, 64÷8=8, 35÷5=7, 12÷2=6, 40÷5=8, 6×7=42, 72÷8=9.',
        '2×3=6, 28÷7=4, 64÷8=8, 35÷5=7, 12÷2=6, 40÷5=8, 6×7=42, 72÷8=9.',
      ),
    },
    {
      shaded: [],
      showValues: true,
      hold: 2400,
      result: false,
      caption: t(
        'Trap: 64÷8=8 and 40÷5=8 — exactly 8 is NOT greater than 8, so they stay light.',
        'Jebakan: 64÷8=8 dan 40÷5=8 — tepat 8 BUKAN lebih dari 8, jadi tetap terang.',
      ),
    },
    {
      shaded: DARK_PARTS,
      showValues: true,
      hold: 2300,
      result: false,
      caption: t(
        `Greater than 8 only: ${darkJoined(' and ')}. Shade just those two dark.`,
        `Lebih dari 8 hanya: ${darkJoined(' dan ')}. Warnai gelap hanya dua itu.`,
      ),
    },
    {
      shaded: DARK_PARTS,
      showValues: false,
      hold: 0,
      result: true,
      caption: t('Exactly these two parts are dark — that matches option C.', 'Tepat dua bagian ini yang gelap — cocok dengan pilihan C.'),
    },
  ]

  return { darkParts: DARK_PARTS, steps, finalIndex: steps.length - 1 }
}
