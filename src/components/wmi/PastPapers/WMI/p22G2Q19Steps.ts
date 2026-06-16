import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Storyboard for WMI-22P2A-Q19 — five overlapping circles, every circle totals 30.
// Each beat reveals ONE idea, landing on ★ = 11, ◆ = 14 (answer D).
export interface CirclesStep {
  showStar: boolean
  showDiamond: boolean
  highlight: Array<'tl' | 'tm' | 'tr' | 'bl' | 'br'>
  showTotal: boolean
  caption: string
  hold: number
  result: boolean
}

export interface CirclesStoryboard {
  star: number
  diamond: number
  total: number
  steps: CirclesStep[]
  finalIndex: number
}

export function buildP22G2Q19Steps(lang: Lang): CirclesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const TOTAL = 30
  const STAR = 11
  const DIAMOND = 14

  const steps: CirclesStep[] = [
    {
      showStar: false,
      showDiamond: false,
      highlight: [],
      showTotal: false,
      hold: 1900,
      result: false,
      caption: t(
        'Each circle adds up all the numbers inside it. Every circle has the SAME total.',
        'Tiap lingkaran menjumlahkan semua angka di dalamnya. Setiap lingkaran punya total yang SAMA.',
      ),
    },
    {
      showStar: false,
      showDiamond: false,
      highlight: ['tl'],
      showTotal: true,
      hold: 2000,
      result: false,
      caption: t('Top-left circle: 13 + 17 = 30. So the shared total is 30.', 'Lingkaran kiri-atas: 13 + 17 = 30. Jadi total bersama = 30.'),
    },
    {
      showStar: false,
      showDiamond: false,
      highlight: ['tr', 'bl'],
      showTotal: true,
      hold: 2200,
      result: false,
      caption: t(
        'Check: top-right 25 + 5 = 30, bottom-left 6 + 17 + 7 = 30. Both 30. ✓',
        'Cek: kanan-atas 25 + 5 = 30, kiri-bawah 6 + 17 + 7 = 30. Sama-sama 30. ✓',
      ),
    },
    {
      showStar: true,
      showDiamond: false,
      highlight: ['tm'],
      showTotal: false,
      hold: 2200,
      result: false,
      caption: t('Top-middle: 12 + 7 + ★ = 30, so ★ = 30 − 19 = 11.', 'Tengah-atas: 12 + 7 + ★ = 30, jadi ★ = 30 − 19 = 11.'),
    },
    {
      showStar: true,
      showDiamond: true,
      highlight: ['br'],
      showTotal: false,
      hold: 2200,
      result: false,
      caption: t('Bottom-right: ◆ + ★ + 5 = 30, so ◆ = 30 − 11 − 5 = 14.', 'Kanan-bawah: ◆ + ★ + 5 = 30, jadi ◆ = 30 − 11 − 5 = 14.'),
    },
    {
      showStar: true,
      showDiamond: true,
      highlight: [],
      showTotal: false,
      hold: 0,
      result: true,
      caption: t(`★ = ${STAR}, ◆ = ${DIAMOND} — answer D.`, `★ = ${STAR}, ◆ = ${DIAMOND} — jawaban D.`),
    },
  ]

  return { star: STAR, diamond: DIAMOND, total: TOTAL, steps, finalIndex: steps.length - 1 }
}
