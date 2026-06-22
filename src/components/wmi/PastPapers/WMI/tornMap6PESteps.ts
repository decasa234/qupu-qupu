/**
 * IKMC-22-PE-Q6 — step data for TornMap6PEExplainer.
 *
 * Problem: "A monkey has torn a piece from Captain Jack's map.
 * Which is the missing piece?" Answer: B.
 *
 * Strategy: shape + pattern matching — the piece must fill the torn-out hole
 * and continue the map's markings (lines, icons) seamlessly at every edge.
 *
 * Animation beats:
 *   Beat 0  — show the map with the hole; intro.
 *   Beat 1  — eliminate A: tall narrow shape — doesn't match the upper-right corner hole.
 *   Beat 2  — eliminate C: tall with wrong edge profile — edges don't align.
 *   Beat 3  — eliminate D: wide mid-section — wrong shape, too wide for the notch.
 *   Beat 4  — eliminate E: small strip — too small, wrong edges.
 *   Beat 5  — highlight B: corner piece with "X" mark — shape fits the hole exactly;
 *             the torn edges of B match the map's torn edges precisely.
 *   Beat 6  — answer reveal: B fills the hole (showAnswer=true).
 */

export type Lang = 'en' | 'id'

export interface TornMap6PEStep {
  /** Option being checked this beat ('' = none). */
  option: string
  /** True = option is eliminated (wrong). */
  eliminated: boolean
  /** True = this is the final correct answer beat. */
  result: boolean
  /** Whether to show the answer piece filling the hole. */
  showAnswer: boolean
  caption: string
  hold: number
}

export interface TornMap6PEStoryboard {
  steps: TornMap6PEStep[]
  finalIndex: number
}

export function buildTornMap6PESteps(lang: Lang): TornMap6PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TornMap6PEStep[] = []

  // Beat 0 — intro: show the map with hole.
  steps.push({
    option: '',
    eliminated: false,
    result: false,
    showAnswer: false,
    hold: 2000,
    caption: t(
      'A monkey tore a piece from the upper-right of the map. Look at the shape of the hole — the missing piece must fit it exactly.',
      'Seekor monyet merobek bagian kanan atas peta. Perhatikan bentuk lubangnya — potongan yang hilang harus pas persis.',
    ),
  })

  // Beat 1 — eliminate A: tall narrow strip, wrong shape.
  steps.push({
    option: 'A',
    eliminated: true,
    result: false,
    showAnswer: false,
    hold: 2200,
    caption: t(
      'A is a tall narrow strip — it does not match the wide corner-shaped hole in the upper-right → eliminated.',
      'A adalah potongan sempit tinggi — tidak cocok dengan lubang sudut lebar di kanan atas → gugur.',
    ),
  })

  // Beat 2 — eliminate C: tall wrong edge.
  steps.push({
    option: 'C',
    eliminated: true,
    result: false,
    showAnswer: false,
    hold: 2200,
    caption: t(
      'C is tall with a sea creature but its torn edges do not align with the hole — shape mismatch → eliminated.',
      'C tinggi dengan makhluk laut tapi tepi robeknya tidak sejajar dengan lubang — bentuk tidak cocok → gugur.',
    ),
  })

  // Beat 3 — eliminate D: wide mid-section.
  steps.push({
    option: 'D',
    eliminated: true,
    result: false,
    showAnswer: false,
    hold: 2200,
    caption: t(
      'D is a wide mid-section piece — too wide for the notch, and the mountain icons are already on the map → eliminated.',
      'D adalah potongan tengah yang lebar — terlalu lebar untuk lekukan, dan ikon gunung sudah ada di peta → gugur.',
    ),
  })

  // Beat 4 — eliminate E: small strip, too small.
  steps.push({
    option: 'E',
    eliminated: true,
    result: false,
    showAnswer: false,
    hold: 2200,
    caption: t(
      'E is a small strip with a skull — it is too small and the edges do not match the hole → eliminated.',
      'E adalah potongan kecil dengan tengkorak — terlalu kecil dan tepinya tidak cocok dengan lubang → gugur.',
    ),
  })

  // Beat 5 — spotlight B: corner piece fits the hole + has X mark.
  steps.push({
    option: 'B',
    eliminated: false,
    result: false,
    showAnswer: false,
    hold: 2400,
    caption: t(
      'B is a roughly triangular corner piece with an "X" mark — its shape matches the upper-right hole, and the torn edges align with the map.',
      'B adalah potongan sudut segitiga dengan tanda "X" — bentuknya cocok dengan lubang kanan atas, dan tepi robeknya sejajar dengan peta.',
    ),
  })

  // Beat 6 — answer reveal: B fills the hole.
  steps.push({
    option: 'B',
    eliminated: false,
    result: true,
    showAnswer: true,
    hold: 0,
    caption: t(
      'Piece B fills the hole exactly — the torn edges match and the "X" mark continues the treasure route. Answer: B.',
      'Potongan B mengisi lubang dengan tepat — tepi robek cocok dan tanda "X" melanjutkan jalur harta. Jawaban: B.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
