import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { ASKED_COL, ASKED_ROW } from './SymbolGrid19P1Illustration'

export interface SymbolGridStep {
  highlightRow: number | null
  highlightCol: number | null
  pickCell: boolean
  caption: string
  hold: number
  result: boolean
}

export interface SymbolGridStoryboard {
  askedRow: number
  askedCol: number
  steps: SymbolGridStep[]
  finalIndex: number
}

export function buildSymbolGrid19P1Steps(lang: Lang): SymbolGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  // 1-based labels for the caption text.
  const rowN = ASKED_ROW + 1
  const colN = ASKED_COL + 1

  const steps: SymbolGridStep[] = [
    {
      highlightRow: null,
      highlightCol: null,
      pickCell: false,
      hold: 1700,
      result: false,
      caption: t(
        'Each symbol is named by its row header and its column header.',
        'Setiap simbol dinamai oleh penanda baris dan penanda kolomnya.',
      ),
    },
    {
      highlightRow: ASKED_ROW,
      highlightCol: null,
      pickCell: false,
      hold: 1900,
      result: false,
      caption: t(`First find the asked row — row ${rowN}.`, `Cari dulu barisnya — baris ${rowN}.`),
    },
    {
      highlightRow: ASKED_ROW,
      highlightCol: ASKED_COL,
      pickCell: false,
      hold: 1900,
      result: false,
      caption: t(`Then the asked column — column ${colN}.`, `Lalu kolomnya — kolom ${colN}.`),
    },
    {
      highlightRow: ASKED_ROW,
      highlightCol: ASKED_COL,
      pickCell: true,
      hold: 1800,
      result: false,
      caption: t(
        'Where the row and column cross is the one symbol they ask for.',
        'Tempat baris dan kolom berpotongan adalah simbol yang ditanyakan.',
      ),
    },
    {
      highlightRow: ASKED_ROW,
      highlightCol: ASKED_COL,
      pickCell: true,
      hold: 0,
      result: true,
      caption: t('That highlighted symbol is option D.', 'Simbol yang ditandai itu adalah pilihan D.'),
    },
  ]

  return {
    askedRow: ASKED_ROW,
    askedCol: ASKED_COL,
    steps,
    finalIndex: steps.length - 1,
  }
}
