import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type JoinStage = 'pieces' | 'count' | 'reject' | 'fit1' | 'fit2' | 'answer'

export interface JoinPiecesStep {
  stage: JoinStage
  caption: string
  hold: number
  result: boolean
}

export interface JoinPiecesStoryboard {
  steps: JoinPiecesStep[]
  finalIndex: number
}

export function buildJoinPieces20Steps(lang: Lang): JoinPiecesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: JoinPiecesStep[] = [
    {
      stage: 'pieces',
      hold: 1700,
      result: false,
      caption: t(
        'Two Z-pieces. We may slide and turn them, but not break them.',
        'Dua potongan Z. Boleh digeser dan diputar, tapi tidak boleh dipotong.',
      ),
    },
    {
      stage: 'count',
      hold: 1900,
      result: false,
      caption: t(
        'Count first: each piece has 4 squares, so together 4 + 4 = 8 squares.',
        'Hitung dulu: tiap potongan punya 4 persegi, jadi bersama 4 + 4 = 8 persegi.',
      ),
    },
    {
      stage: 'reject',
      hold: 2000,
      result: false,
      caption: t(
        'Shape B has only 6 squares — squares cannot disappear, so B is out.',
        'Bentuk B hanya punya 6 persegi — persegi tidak bisa hilang, jadi B salah.',
      ),
    },
    {
      stage: 'fit1',
      hold: 2100,
      result: false,
      caption: t(
        'Slide piece 1 into the plus: it fills the top bump and the right arm.',
        'Geser potongan 1 ke tanda tambah: ia mengisi tonjolan atas dan lengan kanan.',
      ),
    },
    {
      stage: 'fit2',
      hold: 2100,
      result: false,
      caption: t(
        'Turn piece 2 around and slide it in: it fills the left arm and the bottom bump — no gaps, no overlaps!',
        'Putar potongan 2 lalu geser masuk: ia mengisi lengan kiri dan tonjolan bawah — tanpa celah, tanpa tumpukan!',
      ),
    },
    {
      stage: 'answer',
      hold: 0,
      result: true,
      caption: t(
        'Together they make the plus shape — Shape C!',
        'Bersama-sama keduanya membentuk tanda tambah — Bentuk C!',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
