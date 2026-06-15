// verticalMult22G3Steps.ts
// Storyboard builder for WMI-22F3A-Q19 — 256 × 79 = 20224, box-digit sum = 51.
//
// Row indices (mirrors VerticalMult22G3Illustration rows):
//   0 = top number  □5□  (256)
//   1 = multiplier  □□   (79)
//   2 = P1          23□□ (2304)
//   3 = P2          □□□□ (1792, shifted left)
//   4 = product     2022□ (20224)

export interface VerticalMult22G3Step {
  /** Row indices to reveal (show green solved digit). */
  reveal: number[]
  /** Row index to highlight with amber focus band, or null. */
  focus: number | null
  /** Auto-advance hold time in ms (0 = final beat, never auto-advances away). */
  hold: number
  /** When true, style the caption box as the answer/result card. */
  result: boolean
  caption: string
}

export interface VerticalMult22G3Story {
  steps: VerticalMult22G3Step[]
  /** Index of the final (winning) beat. */
  finalIndex: number
}

export function buildVerticalMult22G3Story(lang: 'en' | 'id'): VerticalMult22G3Story {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: VerticalMult22G3Step[] = [
    // Beat 0 — introduce the puzzle
    {
      reveal: [],
      focus: null,
      hold: 2400,
      result: false,
      caption: t(
        'We need to find the hidden digits. Start with the first partial product row: 23□□.',
        'Kita cari angka-angka yang tersembunyi. Mulai dari baris hasil kali pertama: 23□□.',
      ),
    },
    // Beat 1 — zoom in on P1, estimate the top number
    {
      reveal: [],
      focus: 2,
      hold: 2600,
      result: false,
      caption: t(
        '23□□ is a 4-digit number near 2300. The top number has 5 in the middle: □5□. So □5□ × (units digit) ≈ 2300.',
        '23□□ adalah 4 angka sekitar 2300. Bilangan atas punya 5 di tengah: □5□. Jadi □5□ × (angka satuan) ≈ 2300.',
      ),
    },
    // Beat 2 — try units digit 9: 250 × 9 = 2250 ballpark
    {
      reveal: [],
      focus: 2,
      hold: 2600,
      result: false,
      caption: t(
        'Try units digit = 9: 250 × 9 = 2250 and 260 × 9 = 2340 — both near 2300. A number like 256 fits: 256 × 9 = 2304.',
        'Coba angka satuan = 9: 250 × 9 = 2250 dan 260 × 9 = 2340 — keduanya dekat 2300. Misal 256: 256 × 9 = 2304.',
      ),
    },
    // Beat 3 — 2304 matches 23□□ — reveal P1 row
    {
      reveal: [2],
      focus: 2,
      hold: 2400,
      result: false,
      caption: t(
        '2304 matches 23□□ perfectly (□=0, □=4). So the units digit is 9 and the top number starts with 2 and ends with 6: 256.',
        '2304 pas dengan 23□□ (□=0, □=4). Jadi angka satuan adalah 9 dan bilangan atas adalah 256.',
      ),
    },
    // Beat 4 — reveal top (row 0) and multiplier units digit; determine multiplier
    {
      reveal: [0, 1, 2],
      focus: 0,
      hold: 2600,
      result: false,
      caption: t(
        'The product is 2022□, a 5-digit number starting with 2. 20224 ÷ 256 = 79, so the multiplier is 79.',
        'Hasil kali adalah 2022□, bilangan 5 angka diawali 2. 20224 ÷ 256 = 79, jadi pengali adalah 79.',
      ),
    },
    // Beat 5 — compute P2 = 256 × 7 = 1792, reveal row 3
    {
      reveal: [0, 1, 2, 3],
      focus: 3,
      hold: 2600,
      result: false,
      caption: t(
        'Second partial product: 256 × 7 = 1792 (written one place to the left: 1792_).',
        'Hasil kali kedua: 256 × 7 = 1792 (ditulis geser satu ke kiri: 1792_).',
      ),
    },
    // Beat 6 — final product: 2304 + 17920 = 20224, reveal row 4
    {
      reveal: [0, 1, 2, 3, 4],
      focus: 4,
      hold: 2600,
      result: false,
      caption: t(
        '2304 + 17920 = 20224. The last hidden digit in the answer row is 4.',
        '2304 + 17920 = 20224. Angka tersembunyi terakhir di baris jawaban adalah 4.',
      ),
    },
    // Beat 7 — final: add all box digits
    {
      reveal: [0, 1, 2, 3, 4],
      focus: null,
      hold: 0,
      result: true,
      caption: t(
        'Add every boxed digit: 2+6 + 7+9 + 0+4 + 1+7+9+2 + 4 = 51.',
        'Jumlahkan semua angka di kotak: 2+6 + 7+9 + 0+4 + 1+7+9+2 + 4 = 51.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
