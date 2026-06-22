// IKMC-20-PE-Q9 — "Which piece completes the picture?" (answer C)
//
// METHOD (deduction, one idea per beat):
//   1. Identify the pattern in the 3×3 grid: every tile shows four suit symbols,
//      one in each quadrant — spade TL, heart TR, diamond BL, club BR.
//   2. Option D and E show a large diamond/cross shape — the wrong type of image.
//   3. Option A has the suits but facing outward (rotated 180°) — wrong orientation.
//   4. Option B has the suits in a shifted order (rotated layout) — wrong.
//   5. Option C has spade TL, heart TR, diamond BL, club BR — exactly matching
//      the surrounding tiles. It slots in perfectly → answer C.
//
// Pure builder: (lang) => storyboard. No Math.random / no Date. SSR-safe.

export type Lang = 'en' | 'id'

export interface MissingPiece9Step {
  /** Which option labels are being judged on this beat. */
  examining: string[]
  /** Verdict for each examined option ('reject' | 'accept'). */
  verdict: 'reject' | 'accept'
  /** Show the answer tile in the grid (only on the winning beat). */
  showAnswer: boolean
  /** Beat caption text (bilingual). */
  caption: string
  /** Hold duration in ms (0 = final beat, stays). */
  hold: number
}

export interface MissingPiece9Storyboard {
  answer: string
  steps: MissingPiece9Step[]
  finalIndex: number
}

export function buildMissingPiece9PESteps(lang: Lang): MissingPiece9Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MissingPiece9Step[] = [
    // Beat 1 — read the pattern in the surrounding tiles.
    {
      examining: [],
      verdict: 'reject',
      showAnswer: false,
      hold: 2800,
      caption: t(
        'Every surrounding tile has the SAME pattern: spade top-left, heart top-right, diamond bottom-left, club bottom-right. The missing piece must match.',
        'Setiap ubin di sekitarnya punya POLA SAMA: sekop kiri-atas, hati kanan-atas, berlian kiri-bawah, keriting kanan-bawah. Potongan yang hilang harus cocok.',
      ),
    },
    // Beat 2 — reject D and E (large cross shape, wrong type).
    {
      examining: ['D', 'E'],
      verdict: 'reject',
      showAnswer: false,
      hold: 2200,
      caption: t(
        'Options D and E show a large diamond/cross filling the whole tile — completely different from the suit-symbol pattern ✗.',
        'Pilihan D dan E menampilkan berlian/silang besar yang memenuhi seluruh kotak — sama sekali berbeda dengan pola simbol kartu ✗.',
      ),
    },
    // Beat 3 — reject A (suits rotated 180°, pointing outward).
    {
      examining: ['A'],
      verdict: 'reject',
      showAnswer: false,
      hold: 2200,
      caption: t(
        'Option A has suit symbols but they face outward (rotated 180°) — the wrong orientation ✗.',
        'Pilihan A punya simbol kartu tapi menghadap ke luar (diputar 180°) — orientasi salah ✗.',
      ),
    },
    // Beat 4 — reject B (suits in shifted order).
    {
      examining: ['B'],
      verdict: 'reject',
      showAnswer: false,
      hold: 2200,
      caption: t(
        'Option B has the suits in the wrong quadrant order (shifted one step) — doesn\'t match the grid pattern ✗.',
        'Pilihan B punya simbol kartu dengan urutan kuadran yang salah (bergeser satu langkah) — tidak cocok dengan pola kisi ✗.',
      ),
    },
    // Beat 5 (result) — C matches exactly, slot it in.
    {
      examining: ['C'],
      verdict: 'accept',
      showAnswer: true,
      hold: 0,
      caption: t(
        'Option C: spade TL, heart TR, diamond BL, club BR — exactly the same as the surrounding tiles. It fits perfectly → answer is C.',
        'Pilihan C: sekop kiri-atas, hati kanan-atas, berlian kiri-bawah, keriting kanan-bawah — sama persis dengan ubin di sekitarnya. Cocok sempurna → jawaban C.',
      ),
    },
  ]

  return { answer: 'C', steps, finalIndex: steps.length - 1 }
}
