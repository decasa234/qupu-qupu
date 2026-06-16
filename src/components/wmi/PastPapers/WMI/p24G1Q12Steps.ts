import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { FULL_COUNT, TALLY } from './P24G1Q12Illustration'

export interface DigitTallyStep {
  /** Digit currently being ringed/tallied, or null for the framing/result beats. */
  ringDigit: string | null
  /** Dim the non-target glyphs. */
  focus: boolean
  caption: string
  hold: number
  result: boolean
}

export interface DigitTallyStoryboard {
  fullCount: number
  steps: DigitTallyStep[]
  finalIndex: number
}

export function buildP24G1Q12Steps(lang: Lang): DigitTallyStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DigitTallyStep[] = [
    {
      ringDigit: null,
      focus: false,
      hold: 1700,
      result: false,
      caption: t(
        'Each digit should appear the same number of times. Count them one digit at a time.',
        'Tiap angka seharusnya muncul sama banyak. Hitung satu jenis angka sekaligus.',
      ),
    },
    {
      ringDigit: '0',
      focus: true,
      hold: 1700,
      result: false,
      caption: t(`Ring every 0: there are ${TALLY['0']}.`, `Lingkari semua 0: ada ${TALLY['0']}.`),
    },
    {
      ringDigit: '3',
      focus: true,
      hold: 1700,
      result: false,
      caption: t(`Every 3: also ${TALLY['3']}.`, `Semua 3: juga ${TALLY['3']}.`),
    },
    {
      ringDigit: '7',
      focus: true,
      hold: 1700,
      result: false,
      caption: t(
        `Every 7: ${TALLY['7']} again. So the full count is ${FULL_COUNT} each.`,
        `Semua 7: ${TALLY['7']} lagi. Jadi jumlah lengkapnya ${FULL_COUNT} masing-masing.`,
      ),
    },
    {
      ringDigit: '2',
      focus: true,
      hold: 1900,
      result: false,
      caption: t(
        `Every 2: only ${TALLY['2']} — one short of ${FULL_COUNT}.`,
        `Semua 2: hanya ${TALLY['2']} — kurang satu dari ${FULL_COUNT}.`,
      ),
    },
    {
      ringDigit: '8',
      focus: true,
      hold: 1900,
      result: false,
      caption: t(
        `Every 8: only ${TALLY['8']} too — also short by one.`,
        `Semua 8: hanya ${TALLY['8']} juga — juga kurang satu.`,
      ),
    },
    {
      ringDigit: null,
      focus: false,
      hold: 0,
      result: true,
      caption: t('Short by one: 8 and 2 — answer C.', 'Kurang satu: 8 dan 2 — jawaban C.'),
    },
  ]

  return { fullCount: FULL_COUNT, steps, finalIndex: steps.length - 1 }
}
