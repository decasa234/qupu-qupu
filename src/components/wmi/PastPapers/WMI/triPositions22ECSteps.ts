// IKMC-19-EC-Q22 — storyboard for the triangle colouring animation.
//
// Problem: 9 small triangles forming a big equilateral triangle. 3 red, 3 yellow,
// 3 blue. Any two triangles sharing an edge must have different colours. Mary has
// pre-placed: top=R, pos4(r2l)=Y, bottom-L=B, pos5(r3dl)=R, bottom-R=B.
// Find the forced colours of positions 1, 2, 3 (and the inner r2d triangle).
//
// Answer E: positions 1 and 3 are yellow.
//
// Teaching walk (one idea per beat):
//   0. intro    — show the static scene; state the adjacency rule and colour budget.
//   1. r2d      — r2d (inner row-2 downward) is adjacent to top(R) and pos4(Y) → must be BLUE.
//   2. pos1     — pos1 adj pos5(R); budget has no B left → pos1 must be YELLOW.
//   3. pos2     — pos2 adj pos1(Y) and bottom-R(B) → pos2 must be RED.
//   4. pos3     — pos3 adj r2d(B) and pos2(R) → pos3 must be YELLOW.
//   5. result   — 1 and 3 are yellow → answer E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

/** Triangle IDs in the illustration, matching `buildTriangles` keys. */
export type TriId = 'top' | 'r2l' | 'r2d' | 'r2r' | 'r3fl' | 'r3dl' | 'r3c' | 'r3dr' | 'r3fr'

export type PhaseId = 'intro' | 'r2d' | 'pos1' | 'pos2' | 'pos3' | 'result'

export interface TriBeat {
  phase: PhaseId
  /** Fill map delta — triangles to colour in this beat (merged cumulatively). */
  newFills: Partial<Record<TriId, string>>
  /** Triangle IDs to highlight with an animated ring. */
  highlight: TriId[]
  /** Equation / maths line to display below the figure; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface TriStoryboard {
  steps: TriBeat[]
  finalIndex: number
}

const RED    = '#DC2626'
const YELLOW = '#F59E0B'
const BLUE   = '#2563EB'

export function buildTriPositions22ECSteps(lang: Lang): TriStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TriBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      newFills: {},
      highlight: [],
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'Rule: triangles sharing an edge must have different colours. Budget: 3 red, 3 yellow, 3 blue. ' +
        'Already placed: top=red, 4=yellow, two corners=blue, 5=red.',
        'Aturan: segitiga yang berbagi sisi harus berbeda warna. Anggaran: 3 merah, 3 kuning, 3 biru. ' +
        'Sudah diletakkan: atas=merah, 4=kuning, dua sudut=biru, 5=merah.',
      ),
    },

    // Beat 1 — r2d (inner row-2 downward): forced BLUE
    {
      phase: 'r2d',
      newFills: { r2d: BLUE },
      highlight: ['r2d', 'top', 'r2l'],
      equation: t('top=R  4=Y  →  ∎=B', 'atas=M  4=K  →  ∎=B'),
      hold: 2400,
      result: false,
      caption: t(
        'The inner ▽ triangle touches top (red) and position 4 (yellow) — both colours taken. It must be BLUE.',
        'Segitiga ▽ dalam bersentuhan dengan atas (merah) dan posisi 4 (kuning) — kedua warna terpakai. Harus BIRU.',
      ),
    },

    // Beat 2 — pos1 (r3c): forced YELLOW
    {
      phase: 'pos1',
      newFills: { r3c: YELLOW },
      highlight: ['r3c', 'r3dl', 'r3fl'],
      equation: t('5=R  corner=B  →  1=Y', '5=M  sudut=B  →  1=K'),
      hold: 2400,
      result: false,
      caption: t(
        'Position 1 is next to pos 5 (red) and the left corner (blue). Red and blue are taken. No blue is left in the budget either — position 1 must be YELLOW.',
        'Posisi 1 bersebelahan dengan posisi 5 (merah) dan sudut kiri (biru). Merah dan biru sudah terpakai. Anggaran biru pun habis — posisi 1 harus KUNING.',
      ),
    },

    // Beat 3 — pos2 (r3dr): forced RED
    {
      phase: 'pos2',
      newFills: { r3dr: RED },
      highlight: ['r3dr', 'r3c', 'r3fr'],
      equation: t('1=Y  corner=B  →  2=R', '1=K  sudut=B  →  2=M'),
      hold: 2400,
      result: false,
      caption: t(
        'Position 2 touches position 1 (yellow) and the right corner (blue). Yellow and blue are taken — position 2 must be RED.',
        'Posisi 2 menyentuh posisi 1 (kuning) dan sudut kanan (biru). Kuning dan biru terpakai — posisi 2 harus MERAH.',
      ),
    },

    // Beat 4 — pos3 (r2r): forced YELLOW
    {
      phase: 'pos3',
      newFills: { r2r: YELLOW },
      highlight: ['r2r', 'r2d', 'r3dr'],
      equation: t('∎=B  2=R  →  3=Y', '∎=B  2=M  →  3=K'),
      hold: 2400,
      result: false,
      caption: t(
        'Position 3 is adjacent to the inner blue ▽ and position 2 (red). Blue and red are taken — position 3 must be YELLOW.',
        'Posisi 3 bersebelahan dengan ▽ biru dalam dan posisi 2 (merah). Biru dan merah terpakai — posisi 3 harus KUNING.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      newFills: {},
      highlight: ['r3c', 'r2r'],
      equation: t('1 = yellow,  3 = yellow  →  E', '1 = kuning,  3 = kuning  →  E'),
      hold: 0,
      result: true,
      caption: t(
        'Both positions 1 and 3 are forced to yellow — answer E.',
        'Posisi 1 dan 3 dipaksa menjadi kuning — jawaban E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
