import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Deterministic storyboard for WMI-24P2A-Q23 (XOR-circle grids, answer = C).
//
// The explainer mirrors the static figure (XorGridsScene). It first re-states
// the rule from the worked example, then applies it cell by cell to the second
// pair, landing on the reconstructed answer grid (option C).

export interface XorStep {
  /** Reveal the answer grid in the bottom row (else show the "?"). */
  revealResult: boolean
  /** Cell indices (0..8) to tint on the revealed answer grid. */
  highlightResult?: number[]
  caption: string
  hold: number
  result: boolean
}

export interface XorStoryboard {
  answer: string
  steps: XorStep[]
  finalIndex: number
}

export function buildP24G2Q23Steps(lang: Lang): XorStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: XorStep[] = [
    {
      revealResult: false,
      hold: 2000,
      result: false,
      caption: t(
        'Read the example: a circle in BOTH grids disappears.',
        'Baca contoh: lingkaran yang ada di KEDUA kisi menghilang.',
      ),
    },
    {
      revealResult: false,
      hold: 2000,
      result: false,
      caption: t(
        'A circle in only ONE grid stays — same colour. (Like pairs cancel.)',
        'Lingkaran yang ada di SATU kisi saja tetap — warnanya sama. (Pasangan saling meniadakan.)',
      ),
    },
    {
      revealResult: true,
      highlightResult: [4, 5, 8], // (1,1), (1,2) and (2,2): shared cells that cancel
      hold: 2200,
      result: false,
      caption: t(
        'Second pair: the middle-centre, middle-right and bottom-right cells have a circle in BOTH grids → they cancel (empty).',
        'Pasangan kedua: sel tengah-tengah, tengah-kanan, dan kanan-bawah berisi lingkaran di KEDUA kisi → saling meniadakan (kosong).',
      ),
    },
    {
      revealResult: true,
      highlightResult: [0, 2, 6, 7], // surviving lone circles: ●(0,0), ○(0,2), ○(2,0), ○(2,1)
      hold: 2200,
      result: false,
      caption: t(
        'Lone circles survive: ● top-left, and ○ top-right, bottom-left, bottom-middle.',
        'Lingkaran tunggal bertahan: ● kiri-atas, dan ○ kanan-atas, kiri-bawah, tengah-bawah.',
      ),
    },
    {
      revealResult: true,
      hold: 0,
      result: true,
      caption: t(
        'That grid — one ● and three ○ — is option C.',
        'Kisi itu — satu ● dan tiga ○ — adalah pilihan C.',
      ),
    },
  ]

  return {
    answer: 'C',
    steps,
    finalIndex: steps.length - 1,
  }
}
