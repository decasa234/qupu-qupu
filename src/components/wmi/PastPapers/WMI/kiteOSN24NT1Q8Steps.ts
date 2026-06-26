// OSN-24-SD-NAS-TEORI1-Q8 — Kite ABFC area decomposition storyboard.
//
// Problem: kite ABFC, area = 100 cm², BC:AF = 1:2, D = midpoint of AF (= diagonal intersection),
// DE:EF = 1:1 (E = midpoint of DF). Find the white triangle B-E-C area.
//
// Strategy: express regions as fractions of kite area via the diagonal ratios.
//   0. intro   — static coloured figure, read the given conditions.
//   1. ratio   — BC:AF = 1:2 → d₁×d₂ = 200; D = midpoint → AD = DF = AF/2.
//   2. orange  — upper kite (triangle ABC) = ½×BC×AD = ¼×BC×AF = 50 cm².
//   3. point-e — E = midpoint of DF → DE = AF/4.
//   4. white   — triangle B-E-C: base=BC, height=DE = AF/4 → ½×BC×AF/4 = 25 cm².
//   5. result  — 25 cm².
//
// Pure: no random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type KitePhaseId = 'intro' | 'ratio' | 'orange' | 'point-e' | 'white' | 'result'

export interface KiteBeat {
  phase: KitePhaseId
  /** Highlight the full diagonal AF in the figure. */
  showDiagAF: boolean
  /** Highlight the full diagonal BC. */
  showDiagBC: boolean
  /** Shade the orange upper-kite region. */
  showOrange: boolean
  /** Shade the blue B-E-F and C-E-F triangles. */
  showBlue: boolean
  /** Highlight point E and the DE segment. */
  showDE: boolean
  /** Shade the white triangle B-E-C with a green tint to reveal it. */
  showWhite: boolean
  /** Equation / maths line; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final beat). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface KiteStoryboard {
  steps: KiteBeat[]
  finalIndex: number
}

export function buildKiteOSN24NT1Q8Steps(lang: Lang): KiteStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: KiteBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showDiagAF: false,
      showDiagBC: false,
      showOrange: true,
      showBlue: true,
      showDE: false,
      showWhite: false,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Kite ABFC has area 100 cm². BC : AF = 1 : 2, D is the midpoint of AF, and E is the midpoint of DF. Find the white area.',
        'Layang-layang ABFC luasnya 100 cm². BC : AF = 1 : 2, D titik tengah AF, E titik tengah DF. Temukan luas daerah putih.',
      ),
    },

    // Beat 1 — diagonal ratios
    {
      phase: 'ratio',
      showDiagAF: true,
      showDiagBC: true,
      showOrange: false,
      showBlue: false,
      showDE: false,
      showWhite: false,
      equation: t('BC : AF = 1 : 2  →  BC × AF = 200', 'BC : AF = 1 : 2  →  BC × AF = 200'),
      hold: 2200,
      result: false,
      caption: t(
        'The diagonals are BC (shorter) and AF (longer). Kite area = ½ × BC × AF = 100, so BC × AF = 200. D is their intersection AND the midpoint of AF → AD = DF = AF/2.',
        'Diagonal layang-layang adalah BC (pendek) dan AF (panjang). Luas = ½ × BC × AF = 100, sehingga BC × AF = 200. D adalah perpotongan diagonal sekaligus titik tengah AF → AD = DF = AF/2.',
      ),
    },

    // Beat 2 — orange upper region
    {
      phase: 'orange',
      showDiagAF: true,
      showDiagBC: false,
      showOrange: true,
      showBlue: false,
      showDE: false,
      showWhite: false,
      equation: t('½ × BC × AD = ½ × BC × AF/2 = ¼ × 200 = 50 cm²', '½ × BC × AD = ½ × BC × AF/2 = ¼ × 200 = 50 cm²'),
      hold: 2400,
      result: false,
      caption: t(
        'Upper triangle ABC has base BC and height AD = AF/2. Area = ½ × BC × AF/2 = 200/4 = 50 cm².',
        'Segitiga ABC atas memiliki alas BC dan tinggi AD = AF/2. Luas = ½ × BC × AF/2 = 200/4 = 50 cm².',
      ),
    },

    // Beat 3 — locate E
    {
      phase: 'point-e',
      showDiagAF: true,
      showDiagBC: false,
      showOrange: false,
      showBlue: false,
      showDE: true,
      showWhite: false,
      equation: t('DE = EF = DF/2 = AF/4', 'DE = EF = DF/2 = AF/4'),
      hold: 2200,
      result: false,
      caption: t(
        'E is the midpoint of DF. Since DF = AF/2, DE = AF/4. The height of white triangle B-E-C (from E up to BC) equals DE = AF/4.',
        'E adalah titik tengah DF. Karena DF = AF/2, maka DE = AF/4. Tinggi segitiga putih B-E-C (dari E ke BC) = DE = AF/4.',
      ),
    },

    // Beat 4 — white region
    {
      phase: 'white',
      showDiagAF: false,
      showDiagBC: false,
      showOrange: true,
      showBlue: true,
      showDE: false,
      showWhite: true,
      equation: t('½ × BC × DE = ½ × BC × AF/4 = 200/8 = 25 cm²', '½ × BC × DE = ½ × BC × AF/4 = 200/8 = 25 cm²'),
      hold: 2400,
      result: false,
      caption: t(
        'White triangle B-E-C: base = BC, height = DE = AF/4. Area = ½ × BC × AF/4 = 200/8 = 25 cm².',
        'Segitiga putih B-E-C: alas = BC, tinggi = DE = AF/4. Luas = ½ × BC × AF/4 = 200/8 = 25 cm².',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      showDiagAF: false,
      showDiagBC: false,
      showOrange: true,
      showBlue: true,
      showDE: false,
      showWhite: true,
      equation: '25 cm²',
      hold: 0,
      result: true,
      caption: t(
        'The white region has area 25 cm².',
        'Luas daerah berwarna putih adalah 25 cm².',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
