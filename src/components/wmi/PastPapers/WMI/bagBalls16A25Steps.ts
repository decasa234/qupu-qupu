/**
 * bagBalls16A25Steps.ts
 *
 * Beat storyboard for SEAMO-16-A-Q25:
 *   "5 blue, 4 orange, 2 yellow in a bag. Blindfolded, draw one at a time.
 *    At least how many balls must she draw to guarantee 4 of the same colour?"
 *
 * Key quantities (bound to breakdown.quantities):
 *   Blue: 5, Orange: 4, Yellow: 2 | Target: 4 same colour | Answer: 9
 *
 * Worst-case (pigeonhole) strategy:
 *   Draw 3 blue + 3 orange + 2 yellow = 8 → still no colour has 4.
 *   The 9th ball must be blue or orange (yellow exhausted) → 4 of that colour.
 *
 * Teaching beats (one idea per beat):
 *   0. setup     — show full bag; state the goal.
 *   1. target    — explain "4 of same colour" means we need a worst case.
 *   2. worstcase — worst draw: 3 blue + 3 orange + 2 yellow = 8 balls; no colour has 4.
 *   3. ball9     — the 9th ball must be blue or orange → guaranteed 4 of one colour.
 *   4. result    — answer = 9 (green).
 */

export type Lang = 'en' | 'id'

export interface BagBeat {
  /** Which phase this beat is in */
  phase: 'setup' | 'target' | 'worstcase' | 'ball9' | 'result'
  /**
   * How many balls of each colour are "drawn" in the worst-case display.
   * undefined = show full bag untouched.
   */
  drawn?: { blue: number; orange: number; yellow: number }
  /** Chip text; '' = hidden */
  chip: string
  /** Caption text */
  caption: string
  /** Auto-hold ms (0 = final / manual) */
  hold: number
  /** True only on result beat */
  result: boolean
}

export interface BagBalls16A25Storyboard {
  steps: BagBeat[]
  finalIndex: number
  answer: string
}

export function buildBagBalls16A25Steps(lang: Lang): BagBalls16A25Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BagBeat[] = [
    // Beat 0 — setup
    {
      phase: 'setup',
      chip: '',
      hold: 2000,
      result: false,
      caption: t(
        'The bag has 5 blue, 4 orange, and 2 yellow balls — 11 in total. Sheila is blindfolded and draws one at a time.',
        'Tas berisi 5 bola biru, 4 bola oranye, dan 2 bola kuning — 11 bola total. Sheila ditutup matanya dan mengambil satu per satu.',
      ),
    },

    // Beat 1 — target
    {
      phase: 'target',
      chip: t('Goal: 4 same colour', 'Tujuan: 4 warna sama'),
      hold: 2000,
      result: false,
      caption: t(
        'We need to GUARANTEE she has 4 balls of the same colour. Worst-case thinking: what is the most unlucky sequence of draws before we hit 4 of one colour?',
        'Kita perlu MENJAMIN ia memiliki 4 bola warna yang sama. Berpikir kasus terburuk: apa urutan paling sial sebelum mendapatkan 4 dari satu warna?',
      ),
    },

    // Beat 2 — worst case 8 balls
    {
      phase: 'worstcase',
      drawn: { blue: 3, orange: 3, yellow: 2 },
      chip: t('8 balls drawn — still no colour has 4', '8 bola diambil — belum ada warna yang mencapai 4'),
      hold: 2800,
      result: false,
      caption: t(
        'Worst case after 8 draws: 3 blue + 3 orange + 2 yellow = 8. Yellow is exhausted (only 2 exist). Blue and orange each have only 3 — not 4 yet!',
        'Kasus terburuk setelah 8 kali ambil: 3 biru + 3 oranye + 2 kuning = 8. Kuning habis (hanya ada 2). Biru dan oranye masing-masing baru 3 — belum 4!',
      ),
    },

    // Beat 3 — ball 9 forces 4
    {
      phase: 'ball9',
      drawn: { blue: 3, orange: 3, yellow: 2 },
      chip: t('Ball 9 must be blue or orange → 4 of that colour!', 'Bola ke-9 pasti biru atau oranye → 4 bola warna itu!'),
      hold: 2800,
      result: false,
      caption: t(
        'Yellow is gone. The 9th ball can only be blue or orange. Either way, that colour reaches 4. So after drawing 9 balls, she is CERTAIN to have 4 of one colour.',
        'Kuning sudah habis. Bola ke-9 hanya bisa biru atau oranye. Bagaimanapun, warna itu mencapai 4. Jadi setelah mengambil 9 bola, ia PASTI memiliki 4 bola satu warna.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      drawn: { blue: 4, orange: 3, yellow: 2 },
      chip: t('Answer = 9', 'Jawaban = 9'),
      hold: 0,
      result: true,
      caption: t(
        'Minimum balls = 9. (Worst case: 3 blue + 3 orange + 2 yellow = 8, then the 9th ball gives 4 blue or 4 orange for certain.)',
        'Minimum bola = 9. (Kasus terburuk: 3 biru + 3 oranye + 2 kuning = 8, lalu bola ke-9 pasti memberikan 4 biru atau 4 oranye.)',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: '9' }
}
