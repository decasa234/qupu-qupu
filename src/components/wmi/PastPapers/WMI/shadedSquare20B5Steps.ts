// shadedSquare20B5Steps.ts — SEAMO-20-B-Q5
// Beat-by-beat solution: y − x = 5 cm², find CE = a.
// Answer: a = 7 cm (choice A).

export interface Step {
  id: string
  title_en: string
  title_id: string
  body_en: string
  body_id: string
  /** Which region to highlight in the figure: 'x' | 'y' | null */
  highlight: 'x' | 'y' | null
  /** Numeric value of a to display (null = show letter "a") */
  showAValue: number | null
}

const steps: Step[] = [
  {
    id: 'setup',
    title_en: 'Label the figure',
    title_id: 'Beri label pada gambar',
    body_en:
      'ABCD is a square with side 5 cm. ' +
      'The diagonal line runs from A (top-left) to E, ' +
      'exiting the square at P on edge DC. ' +
      'BCE is the horizontal base, CE = a.',
    body_id:
      'ABCD adalah persegi dengan sisi 5 cm. ' +
      'Garis diagonal dari A (kiri-atas) ke E ' +
      'memotong sisi CD di titik P. ' +
      'BCE adalah garis dasar horizontal, CE = a.',
    highlight: null,
    showAValue: null,
  },
  {
    id: 'height-p',
    title_en: 'Find height of P on edge DC',
    title_id: 'Temukan tinggi P pada sisi DC',
    body_en:
      'Line AE goes from A=(0,5) to E=(5+a, 0). ' +
      'At x=5 (right edge), height = 5a/(5+a). ' +
      'So DC = PC + PD, where PC = 5a/(5+a) and PD = 25/(5+a).',
    body_id:
      'Garis AE dari A=(0,5) ke E=(5+a, 0). ' +
      'Di x=5 (sisi kanan), tinggi = 5a/(5+a). ' +
      'Maka DC = PC + PD, dengan PC = 5a/(5+a) dan PD = 25/(5+a).',
    highlight: null,
    showAValue: null,
  },
  {
    id: 'area-x',
    title_en: 'Area of region x',
    title_id: 'Luas daerah x',
    body_en:
      'Region x is triangle A–D–P (upper-right inside the square). ' +
      'Base AD = 5 cm (horizontal). Height = PD = 25/(5+a). ' +
      'Area(x) = ½ × 5 × 25/(5+a) = 62.5/(5+a).',
    body_id:
      'Daerah x adalah segitiga A–D–P (kanan-atas dalam persegi). ' +
      'Alas AD = 5 cm (horizontal). Tinggi = PD = 25/(5+a). ' +
      'Luas(x) = ½ × 5 × 25/(5+a) = 62,5/(5+a).',
    highlight: 'x',
    showAValue: null,
  },
  {
    id: 'area-y',
    title_en: 'Area of region y',
    title_id: 'Luas daerah y',
    body_en:
      'Region y is triangle P–C–E (outside the square, right of C). ' +
      'Base CE = a (horizontal). Height = PC = 5a/(5+a). ' +
      'Area(y) = ½ × a × 5a/(5+a) = 2.5a²/(5+a).',
    body_id:
      'Daerah y adalah segitiga P–C–E (di luar persegi, kanan C). ' +
      'Alas CE = a (horizontal). Tinggi = PC = 5a/(5+a). ' +
      'Luas(y) = ½ × a × 5a/(5+a) = 2,5a²/(5+a).',
    highlight: 'y',
    showAValue: null,
  },
  {
    id: 'equation',
    title_en: 'Set up the equation',
    title_id: 'Buat persamaan',
    body_en:
      'y − x = 5 gives:\n' +
      '2.5a²/(5+a) − 62.5/(5+a) = 5\n' +
      '(2.5a² − 62.5) = 5(5+a)\n' +
      '2.5a² − 5a − 87.5 = 0\n' +
      'a² − 2a − 35 = 0',
    body_id:
      'y − x = 5 menghasilkan:\n' +
      '2,5a²/(5+a) − 62,5/(5+a) = 5\n' +
      '(2,5a² − 62,5) = 5(5+a)\n' +
      '2,5a² − 5a − 87,5 = 0\n' +
      'a² − 2a − 35 = 0',
    highlight: null,
    showAValue: null,
  },
  {
    id: 'solve',
    title_en: 'Solve the quadratic',
    title_id: 'Selesaikan persamaan kuadrat',
    body_en:
      'a² − 2a − 35 = (a − 7)(a + 5) = 0\n' +
      'Since a must be positive: a = 7 cm.\n' +
      'Answer: A (7 cm).',
    body_id:
      'a² − 2a − 35 = (a − 7)(a + 5) = 0\n' +
      'Karena a harus positif: a = 7 cm.\n' +
      'Jawaban: A (7 cm).',
    highlight: null,
    showAValue: 7,
  },
]

export default steps
