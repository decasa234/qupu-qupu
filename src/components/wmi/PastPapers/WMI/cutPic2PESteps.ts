/**
 * IKMC-22-PE-Q2 — step data for CutPic2PEExplainer.
 *
 * The question: Arek cuts a mushroom picture vertically in half.
 * Which option shows the two correct pieces? Answer: E.
 *
 * Animation strategy:
 *   Beat 0 — show the original mushroom with the dashed cut line.
 *              "Study the mushroom: note the wide brown cap and the short grey stem."
 *   Beat 1 — indicate the vertical cut: "A straight vertical cut splits the picture
 *              into a LEFT half and a RIGHT half."
 *   Beat 2 — check A: both sub-panels are right halves → "Option A shows two right
 *              halves — the left piece is missing → eliminated."
 *   Beat 3 — check B: sub-panels mismatched → "Option B pieces don't join into the
 *              original → eliminated."
 *   Beat 4 — check C: scrambled pieces → "Option C pieces are scrambled → eliminated."
 *   Beat 5 — check D: inverted pieces → "Option D shows inverted pieces → eliminated."
 *   Beat 6 — confirm E: left half + right half → "Option E: the left half and the
 *              right half fit together perfectly → ✓"
 *   Beat 7 — result: answer is E.
 */

export type Lang = 'en' | 'id'

export interface CutPic2PEStep {
  /** Which beat is currently shown. */
  beat: number
  /** Option label being checked ('A'–'E' or ''). */
  option: string
  /** True when this beat is the final correct result. */
  result: boolean
  /** True when the current option is being eliminated. */
  eliminated: boolean
  /** Whether to show the cut line on the stem illustration. */
  showCut: boolean
  /** The caption text for this beat. */
  caption: string
  /** Auto-advance hold time in ms (0 = last beat, hold forever). */
  hold: number
}

export interface CutPic2PEStoryboard {
  steps: CutPic2PEStep[]
  finalIndex: number
}

export function buildCutPic2PESteps(lang: Lang): CutPic2PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CutPic2PEStep[] = []

  // Beat 0 — intro: show original mushroom
  steps.push({
    beat: 0,
    option: '',
    result: false,
    eliminated: false,
    showCut: false,
    hold: 2200,
    caption: t(
      'Look carefully at the original mushroom picture — note its wide brown cap and short grey stem.',
      'Perhatikan gambar jamur aslinya — perhatikan topi coklat yang lebar dan tangkai abu-abu yang pendek.',
    ),
  })

  // Beat 1 — show the cut
  steps.push({
    beat: 1,
    option: '',
    result: false,
    eliminated: false,
    showCut: true,
    hold: 2200,
    caption: t(
      'Arek makes ONE straight vertical cut. This gives a LEFT piece and a RIGHT piece.',
      'Arek membuat SATU potongan lurus vertikal. Ini menghasilkan potongan KIRI dan potongan KANAN.',
    ),
  })

  // Beat 2 — check A (both right halves — wrong)
  steps.push({
    beat: 2,
    option: 'A',
    result: false,
    eliminated: true,
    showCut: true,
    hold: 2200,
    caption: t(
      'Option A: both panels show the right half — the left piece is missing → eliminated ✗',
      'Pilihan A: kedua panel menunjukkan setengah kanan — setengah kiri tidak ada → gugur ✗',
    ),
  })

  // Beat 3 — check B (mismatched)
  steps.push({
    beat: 3,
    option: 'B',
    result: false,
    eliminated: true,
    showCut: false,
    hold: 2200,
    caption: t(
      'Option B: the two pieces do not join into the original mushroom → eliminated ✗',
      'Pilihan B: dua potongan tidak menyatu menjadi jamur asli → gugur ✗',
    ),
  })

  // Beat 4 — check C (scrambled)
  steps.push({
    beat: 4,
    option: 'C',
    result: false,
    eliminated: true,
    showCut: false,
    hold: 2200,
    caption: t(
      'Option C: the pieces are scrambled — the cap and stem don\'t line up → eliminated ✗',
      'Pilihan C: potongannya berantakan — topi dan tangkai tidak sejajar → gugur ✗',
    ),
  })

  // Beat 5 — check D (inverted)
  steps.push({
    beat: 5,
    option: 'D',
    result: false,
    eliminated: true,
    showCut: false,
    hold: 2200,
    caption: t(
      'Option D: the pieces are inverted — the stem is on top, the cap below → eliminated ✗',
      'Pilihan D: potongan terbalik — tangkai di atas, topi di bawah → gugur ✗',
    ),
  })

  // Beat 6 — confirm E
  steps.push({
    beat: 6,
    option: 'E',
    result: false,
    eliminated: false,
    showCut: false,
    hold: 2200,
    caption: t(
      'Option E: LEFT piece (left cap half + left stem half) + RIGHT piece (right cap half + right stem half) — they join perfectly! ✓',
      'Pilihan E: potongan KIRI (setengah kiri topi + setengah kiri tangkai) + potongan KANAN (setengah kanan topi + setengah kanan tangkai) — keduanya cocok sempurna! ✓',
    ),
  })

  // Beat 7 — result
  steps.push({
    beat: 7,
    option: 'E',
    result: true,
    eliminated: false,
    showCut: false,
    hold: 0,
    caption: t(
      'The two pieces in option E rejoin into the original mushroom. Answer: E.',
      'Dua potongan pada pilihan E menyatu kembali menjadi gambar jamur asli. Jawaban: E.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
