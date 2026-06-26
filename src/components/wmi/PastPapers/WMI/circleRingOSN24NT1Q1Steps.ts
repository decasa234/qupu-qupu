// OSN 2024 SD Nasional Teori1 Q1 — ring-of-circles constraint puzzle.
// Ring CW from top: 1(n0)–3(n1)–8(n2)–5(n3)–6/x(n4)–2(n5)–9(n6)–4(n7)–7(n8).
// Adjacent sums must not be divisible by 3, 5, or 7. Unique solution: x = 6.

export interface RingStep {
  /** n0–n8 to show in focus (amber) fill. */
  highlight: string[]
  /** n0–n8 to show their true value in green fill. */
  reveal: string[]
  /** True on final beat; x-node switches label from 'x' to '6'. */
  xSolved: boolean
  caption: string
  hold: number
  result: boolean
}

export const ANSWER_ID = '6'
export const ANSWER_EN = '6'

function t(lang: 'en' | 'id', en: string, id: string) {
  return lang === 'id' ? id : en
}

export function buildCircleRingOSN24NT1Q1Steps(lang: 'en' | 'id'): RingStep[] {
  return [
    {
      highlight: [],
      reveal: [],
      xSolved: false,
      hold: 2600,
      result: false,
      caption: t(
        lang,
        'Place 1–9 in 9 circles. 1, 4, 5 are anchors. Every adjacent sum must NOT be divisible by 3, 5, or 7. Find x.',
        'Tempatkan 1–9 di 9 lingkaran. 1, 4, 5 sudah tetap. Setiap jumlah bertetangga tidak boleh habis dibagi 3, 5, atau 7. Cari x.',
      ),
    },
    {
      highlight: ['n0', 'n1', 'n8'],
      reveal: [],
      xSolved: false,
      hold: 2600,
      result: false,
      caption: t(
        lang,
        '1 can only neighbor 3 (1+3=4 ✓) and 7 (1+7=8 ✓). All other numbers give forbidden sums.',
        '1 hanya bisa bertetangga 3 (1+3=4 ✓) dan 7 (1+7=8 ✓). Bilangan lain menghasilkan jumlah terlarang.',
      ),
    },
    {
      highlight: ['n6', 'n7', 'n8'],
      reveal: ['n1', 'n8', 'n6'],
      xSolved: false,
      hold: 2600,
      result: false,
      caption: t(
        lang,
        '4 can only neighbor 7 (4+7=11 ✓) and 9 (4+9=13 ✓). Chain set: 3–1–7–4–9.',
        '4 hanya bisa bertetangga 7 (4+7=11 ✓) dan 9 (4+9=13 ✓). Rantai terbentuk: 3–1–7–4–9.',
      ),
    },
    {
      highlight: ['n3', 'n4', 'n5'],
      reveal: ['n1', 'n5', 'n6', 'n8'],
      xSolved: false,
      hold: 2600,
      result: false,
      caption: t(
        lang,
        "9's next neighbor is 2 (9+2=11 ✓). x is between 5 and 2. Only x=6 works: 6+5=11 ✓, 6+2=8 ✓.",
        'Tetangga berikutnya dari 9 adalah 2 (9+2=11 ✓). x berada di antara 5 dan 2. Hanya x=6 yang cocok: 6+5=11 ✓, 6+2=8 ✓.',
      ),
    },
    {
      highlight: [],
      reveal: ['n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8'],
      xSolved: true,
      hold: 0,
      result: true,
      caption: t(lang, 'x = 6', 'x = 6'),
    },
  ]
}
