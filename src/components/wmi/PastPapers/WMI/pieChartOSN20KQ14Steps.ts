// OSN-20-SD-KAB-Q14 steps — diagram lingkaran ukuran baju, cari x+y+z

type Lang = 'en' | 'id'

export interface PieChartStep {
  highlightIds?: string[]
  dimOthers?: boolean
  showSum?: boolean
  showAnswer?: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PieChartStoryboard {
  steps: PieChartStep[]
  finalIndex: number
}

// Quantities from seed
const TOTAL = 30
const PCT_S = '20'
const PCT_L = '23.3'
const PCT_XXL = '6.7'
const KNOWN_SUM = 50
const ANSWER = 50

export function buildPieChartOSN20KQ14Steps(lang: Lang): PieChartStoryboard {
  const t = (en: string, id: string) => lang === 'id' ? id : en

  const steps: PieChartStep[] = [
    {
      hold: 1800,
      result: false,
      caption: t(
        `Grade 5 SDN Cipali has ${TOTAL} students. The pie shows shirt sizes; three sectors are labeled x%, y%, z%.`,
        `Kelas V SDN Cipali memiliki ${TOTAL} siswa. Diagram menunjukkan ukuran baju; tiga sektor berlabel x%, y%, z%.`,
      ),
    },
    {
      highlightIds: ['S', 'L', 'XXL'],
      dimOthers: true,
      hold: 2200,
      result: false,
      caption: t(
        `Three sectors show their actual percentages: S = ${PCT_S}%, L = ${PCT_L}%, XXL = ${PCT_XXL}%.`,
        `Tiga sektor menampilkan persentase asli: S = ${PCT_S}%, L = ${PCT_L}%, XXL = ${PCT_XXL}%.`,
      ),
    },
    {
      highlightIds: ['S', 'L', 'XXL'],
      dimOthers: true,
      showSum: true,
      hold: 2400,
      result: false,
      caption: t(
        `Sum of known sectors: ${PCT_S} + ${PCT_L} + ${PCT_XXL} = ${KNOWN_SUM}%. All sectors together = 100%.`,
        `Jumlah sektor yang diketahui: ${PCT_S} + ${PCT_L} + ${PCT_XXL} = ${KNOWN_SUM}%. Semua sektor = 100%.`,
      ),
    },
    {
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `Therefore x + y + z = 100 − ${KNOWN_SUM} = ${ANSWER}.`,
        `Maka x + y + z = 100 − ${KNOWN_SUM} = ${ANSWER}.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
