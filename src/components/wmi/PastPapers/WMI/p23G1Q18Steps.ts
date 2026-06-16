import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { NEEDED, TOTAL_LEFT, TOTAL_RIGHT } from './P23G1Q18Illustration'

// WMI-23P1A-Q18 (2023 Grade 1 Semifinal): how many MORE blocks turn the LEFT solid
// into the RIGHT solid?
//
//   LEFT  = 5 cubes   (count them, including the one hidden behind the front step)
//   RIGHT = 10 cubes
//   needed = 10 − 5 = 5  (answer D).
//
// One idea per beat:
//   beat 0 — read the ask: how many more cubes from left to right.
//   beat 1 — count the LEFT solid → 5 (mind the hidden cube).
//   beat 2 — count the RIGHT solid → 10.
//   beat 3 — result: 10 − 5 = 5 → answer D.

export type P23G1Q18Phase = 'ask' | 'countLeft' | 'countRight' | 'result'

export interface P23G1Q18Step {
  phase: P23G1Q18Phase
  /** Cubes glowing on the LEFT solid (paint order); 0 = none. */
  leftLit: number
  /** Cubes glowing on the RIGHT solid (paint order); 0 = none. */
  rightLit: number
  /** Running total shown for the left/right solids ('' until counted). */
  leftLabel: string
  rightLabel: string
  caption: string
  hold: number
  result: boolean
}

export interface P23G1Q18Storyboard {
  totalLeft: number
  totalRight: number
  needed: number
  answer: number
  steps: P23G1Q18Step[]
  finalIndex: number
}

export function buildP23G1Q18Steps(lang: Lang): P23G1Q18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const L = TOTAL_LEFT // 5
  const R = TOTAL_RIGHT // 10
  const need = NEEDED // 5

  const steps: P23G1Q18Step[] = [
    {
      phase: 'ask',
      leftLit: 0,
      rightLit: 0,
      leftLabel: '',
      rightLabel: '',
      hold: 1900,
      result: false,
      caption: t(
        'How many more cubes turn the left solid into the right one? Count each, then subtract.',
        'Berapa kubus lagi untuk mengubah bangun kiri menjadi bangun kanan? Hitung masing-masing, lalu kurangkan.',
      ),
    },
    {
      phase: 'countLeft',
      leftLit: L,
      rightLit: 0,
      leftLabel: String(L),
      rightLabel: '',
      hold: 2100,
      result: false,
      caption: t(
        `Left solid: count every cube — don't forget the hidden one. That's ${L}.`,
        `Bangun kiri: hitung semua kubus — jangan lupa yang tersembunyi. Ada ${L}.`,
      ),
    },
    {
      phase: 'countRight',
      leftLit: L,
      rightLit: R,
      leftLabel: String(L),
      rightLabel: String(R),
      hold: 2100,
      result: false,
      caption: t(`Right solid: counting the same way gives ${R}.`, `Bangun kanan: dengan cara yang sama ada ${R}.`),
    },
    {
      phase: 'result',
      leftLit: L,
      rightLit: R,
      leftLabel: String(L),
      rightLabel: String(R),
      hold: 0,
      result: true,
      caption: t(`${R} − ${L} = ${need} more cubes — answer D.`, `${R} − ${L} = ${need} kubus lagi — jawaban D.`),
    },
  ]

  return { totalLeft: L, totalRight: R, needed: need, answer: need, steps, finalIndex: steps.length - 1 }
}
