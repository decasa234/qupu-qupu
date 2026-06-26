// TIMO-22-P3H-Q20 — beat storyboard for counting rectangles.
//
// Figure: irregular grid — 1 cell top-left, 4-cell middle row, 3-cell bottom row (right).
// Teaching walk (5 beats):
//   0  intro   — orient: a rectangle = 2 horizontal + 2 vertical lines (all cells filled)
//   1  top     — spans touching row 0 (col 0 only): (r0,r1)+(r0,r2) → 1+1 = 2
//   2  mid     — row 1 alone (4 cols, 5 V-lines): C(5,2) = 10
//   3  bot     — spans crossing into row 2 (cols 1–3): (r1,r3)+(r2,r3) → 6+6 = 12
//   4  result  — 2 + 10 + 12 = 24

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'top' | 'mid' | 'bot' | 'result'

export interface RectBeat {
  phase: PhaseId
  caption: string
  equation: string
  hold: number
  result: boolean
}

export interface RectStoryboard {
  steps: RectBeat[]
  finalIndex: number
}

export function buildCountRectsTIMO22P3Q20Steps(lang: Lang): RectStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RectBeat[] = [
    {
      phase: 'intro',
      caption: t(
        'A rectangle = choose 2 horizontal lines + 2 vertical lines. All cells between them must be filled.',
        'Persegi panjang = pilih 2 garis horizontal + 2 garis vertikal. Semua sel di antaranya harus terisi.',
      ),
      equation: '',
      hold: 2400,
      result: false,
    },
    {
      phase: 'top',
      caption: t(
        'Spans that include the top row: only column 0 is filled. Each pair of H-lines gives 1 rectangle → 1 + 1 = 2.',
        'Rentang yang mencakup baris teratas: hanya kolom 0 yang terisi. Setiap pasang garis H menghasilkan 1 persegi panjang → 1 + 1 = 2.',
      ),
      equation: t('Top spans: 2', 'Rentang atas: 2'),
      hold: 2400,
      result: false,
    },
    {
      phase: 'mid',
      caption: t(
        'Middle row alone: 4 columns → 5 vertical lines. Pairs: C(5,2) = 10 rectangles.',
        'Baris tengah saja: 4 kolom → 5 garis vertikal. Pasangan: C(5,2) = 10 persegi panjang.',
      ),
      equation: 'C(5,2) = 10',
      hold: 2400,
      result: false,
    },
    {
      phase: 'bot',
      caption: t(
        'Spans crossing into the bottom row: only columns 1–3 align. C(4,2) = 6 each → 6 + 6 = 12.',
        'Rentang yang melewati baris bawah: hanya kolom 1–3 yang sejajar. C(4,2) = 6 tiap rentang → 6 + 6 = 12.',
      ),
      equation: t('Bottom spans: 12', 'Rentang bawah: 12'),
      hold: 2400,
      result: false,
    },
    {
      phase: 'result',
      caption: t(
        'Total rectangles: 2 + 10 + 12 = 24.',
        'Total persegi panjang: 2 + 10 + 12 = 24.',
      ),
      equation: '2 + 10 + 12 = 24',
      hold: 0,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
