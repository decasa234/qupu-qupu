// SIMOC-19-G2-Q8 — net-folding storyboard.
//
// Strategy: count faces → identify wide vs end faces → fold mentally → match option B.
//
// Beat 0 — net:      Show the flat net. "6 sisi rectangular."
// Beat 1 — wide:     Highlight the 4 wide landscape faces (blue tint).
// Beat 2 — ends:     Highlight the 2 square end faces.
// Beat 3 — fold:     "Lipat → kotak memanjang dengan ujung persegi."
// Beat 4 — result:   Show option B box. "Jawaban B."

export type Lang = 'en' | 'id'

export type NetFoldPhase = 'net' | 'wide-faces' | 'end-faces' | 'fold' | 'result'

export interface NetFoldBeat {
  phase: NetFoldPhase
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface NetFoldStoryboard {
  steps: NetFoldBeat[]
  finalIndex: number
}

export function buildNetFoldSIMOC19G2Q8Steps(lang: Lang): NetFoldStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: NetFoldBeat[] = [
    {
      phase: 'net',
      equation: t('6 rectangular faces', '6 sisi persegi panjang'),
      hold: 2200,
      result: false,
      caption: t(
        'This is a net — a flat pattern that folds into a 3-D solid. Count the faces: there are 6 rectangles arranged in a cross.',
        'Ini adalah jaring-jaring — pola datar yang dilipat menjadi benda ruang. Hitung sisinya: ada 6 persegi panjang yang disusun seperti salib.',
      ),
    },
    {
      phase: 'wide-faces',
      equation: t('4 wide faces (4:1)', '4 sisi lebar (4:1)'),
      hold: 2400,
      result: false,
      caption: t(
        'Four faces in the column are wide and narrow — they will become the front, back, top, and bottom of a long box.',
        'Empat sisi di kolom tengah berukuran lebar dan tipis — ini akan menjadi sisi depan, belakang, atas, dan bawah kotak panjang.',
      ),
    },
    {
      phase: 'end-faces',
      equation: t('2 square end faces (1:1)', '2 sisi ujung persegi (1:1)'),
      hold: 2400,
      result: false,
      caption: t(
        'The two side flaps are square — they fold up to become the left and right ends that close the box.',
        'Dua flap samping berbentuk persegi — dilipat menjadi tutup kiri dan kanan yang menutup kotak.',
      ),
    },
    {
      phase: 'fold',
      equation: t('Fold → long rectangular prism', 'Lipat → balok panjang'),
      hold: 2600,
      result: false,
      caption: t(
        'Folding all six faces produces a long rectangular prism with a square cross-section — much longer than it is wide or tall.',
        'Melipat keenam sisi menghasilkan balok panjang dengan penampang persegi — jauh lebih panjang dari lebar atau tingginya.',
      ),
    },
    {
      phase: 'result',
      equation: t('Answer: B', 'Jawaban: B'),
      hold: 0,
      result: true,
      caption: t(
        'This matches option B — the long rectangular prism. Options A (cube), C (tall slab), and D (flat panel) have different face proportions and do not fold from this net.',
        'Ini sesuai dengan pilihan B — balok panjang. Pilihan A (kubus), C (balok tinggi tipis), dan D (papan datar) memiliki proporsi sisi yang berbeda dan tidak cocok dengan jaring-jaring ini.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
