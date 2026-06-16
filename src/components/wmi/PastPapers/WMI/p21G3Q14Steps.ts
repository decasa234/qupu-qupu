import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { Cell } from './P21G3Q14Illustration'
import { OPTIONS, NEXT_FRAME, ANSWER } from './P21G3Q14Illustration'

export type SeqPhase = 'show' | 'rotate' | 'predict' | 'options' | 'result'

export interface SeqStep {
  phase: SeqPhase
  /** Cells to light on the single working grid (the rotating domino). */
  shaded: Cell[]
  /** When true, show the 2×2 board of options A–D. */
  showOptions: boolean
  /** Option letter to ring as the answer (options phase / result). */
  pick: 'A' | 'B' | 'C' | 'D' | null
  caption: string
  hold: number
  result: boolean
}

export interface SeqStoryboard {
  answer: 'A' | 'B' | 'C' | 'D'
  steps: SeqStep[]
  finalIndex: number
}

export function buildP21G3Q14Steps(lang: Lang): SeqStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SeqStep[] = [
    {
      phase: 'show',
      shaded: [
        [0, 0],
        [1, 0],
      ],
      showOptions: false,
      pick: null,
      hold: 1700,
      result: false,
      caption: t(
        'Two shaded cells sit on the LEFT edge. Watch where they go.',
        'Dua sel berwarna ada di tepi KIRI. Perhatikan ke mana perginya.',
      ),
    },
    {
      phase: 'rotate',
      shaded: [
        [0, 1],
        [0, 2],
      ],
      showOptions: false,
      pick: null,
      hold: 1900,
      result: false,
      caption: t(
        'Next frame: the pair has turned a quarter-turn clockwise to the TOP edge.',
        'Bingkai berikutnya: pasangan berputar seperempat searah jarum jam ke tepi ATAS.',
      ),
    },
    {
      phase: 'rotate',
      shaded: [
        [1, 2],
        [2, 2],
      ],
      showOptions: false,
      pick: null,
      hold: 1900,
      result: false,
      caption: t(
        'Again a quarter-turn clockwise — now on the RIGHT edge. The rule is clear.',
        'Sekali lagi seperempat searah jarum jam — sekarang di tepi KANAN. Aturannya jelas.',
      ),
    },
    {
      phase: 'predict',
      shaded: NEXT_FRAME,
      showOptions: false,
      pick: null,
      hold: 2000,
      result: false,
      caption: t(
        'One more quarter-turn clockwise lands the pair on the BOTTOM edge.',
        'Seperempat putaran lagi searah jarum jam membawa pasangan ke tepi BAWAH.',
      ),
    },
    {
      phase: 'options',
      shaded: NEXT_FRAME,
      showOptions: true,
      pick: ANSWER,
      hold: 2000,
      result: false,
      caption: t(
        'Only one option shows that bottom-edge pair: option D.',
        'Hanya satu pilihan yang menunjukkan pasangan di tepi bawah itu: pilihan D.',
      ),
    },
    {
      phase: 'result',
      shaded: NEXT_FRAME,
      showOptions: true,
      pick: ANSWER,
      hold: 0,
      result: true,
      caption: t('The next figure is D — answer D.', 'Bangun berikutnya adalah D — jawaban D.'),
    },
  ]

  return { answer: ANSWER, steps, finalIndex: steps.length - 1 }
}

export { OPTIONS }
