import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { FOLD_LABELS, type FoldLabel } from './Folding25G3Illustration'

// WMI-25F3A-Q10 (2025 Grade-3 Final). A rectangle of paper may be rotated
// freely, then folded ONCE. We test the five candidate shapes A-E one beat at a
// time, asking "can a single straight fold of the rectangle make this?". Every
// one succeeds, so the running counter climbs 1 → 2 → 3 → 4 → 5 and lands on
// choice A (= 5).
//
// The fold reasoning per shape (this is the *method* the animation teaches):
//   A  square with one corner folded over  → fold ONE corner across → pentagon
//   B  wide banner with a V-notch bottom    → fold so a triangular flap tucks
//                                             up behind, biting a V out
//   C  block with a stepped/clipped corner  → fold a slanted strip off a corner
//   D  upward-pointing house pentagon        → fold both top corners to a peak
//                                             (one diagonal fold tilts a corner)
//   E  small rectangle/square                → fold the rectangle in half → a
//                                             smaller rectangle
// All five are reachable with one fold, hence 5.

export interface FoldStep {
  /** The shape under test this beat (null on the intro / summary beats). */
  label: FoldLabel | null
  /** Running count of shapes proven foldable up to and including this beat. */
  count: number
  /** Whether the shape on this beat folds successfully (always true here). */
  fits: boolean
  caption: string
  /** ms to linger on this beat (the final A-reveal holds 0 per the contract). */
  hold: number
  /** True only on the final winning beat. */
  result: boolean
}

export interface FoldStoryboard {
  answer: string // 'A'
  total: number // 5
  steps: FoldStep[]
  finalIndex: number
}

// Short, kid-voice reason for why one fold makes each shape, bilingual.
const FOLD_REASON: Record<FoldLabel, { en: string; id: string }> = {
  A: {
    en: 'fold one corner across → a 5-sided shape',
    id: 'lipat satu sudut menyilang → bentuk 5 sisi',
  },
  B: {
    en: 'fold a flap up behind → bites a V out of the bottom',
    id: 'lipat sirip ke belakang → menggigit V di bawah',
  },
  C: {
    en: 'fold a slanted strip off a corner → a stepped edge',
    id: 'lipat jalur miring dari sudut → tepi bertingkat',
  },
  D: {
    en: 'fold a corner over to tilt the top → a peaked house',
    id: 'lipat sudut agar atas miring → rumah berpuncak',
  },
  E: {
    en: 'fold the rectangle in half → a smaller rectangle',
    id: 'lipat persegi panjang jadi dua → persegi lebih kecil',
  },
}

export function buildFolding25G3Steps(lang: Lang): FoldStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const total = FOLD_LABELS.length // 5

  const steps: FoldStep[] = [
    {
      label: null,
      count: 0,
      fits: false,
      caption: t(
        'One fold of the rectangle. Test each shape A–E: can a single fold make it?',
        'Satu lipatan persegi panjang. Uji tiap bentuk A–E: bisakah dibuat satu lipatan?',
      ),
      hold: 2600,
      result: false,
    },
  ]

  // Walk the five shapes one per beat, ticking the counter up each time one works.
  let count = 0
  FOLD_LABELS.forEach((label) => {
    count += 1
    const reason = FOLD_REASON[label]
    steps.push({
      label,
      count,
      fits: true,
      caption: t(
        `${label}: ${reason.en} ✓ — that makes ${count}.`,
        `${label}: ${reason.id} ✓ — jadi ${count}.`,
      ),
      // Each successful try lingers so the ✓ and counter bump read; the final
      // reveal (below) is the winner and holds 0 per the house contract.
      hold: 2000,
      result: false,
    })
  })

  // Winning beat: all five worked → count 5 → choice A.
  steps.push({
    label: null,
    count: total,
    fits: true,
    caption: t(
      `Every shape works! 5 of 5 can be folded → the answer is 5 (A).`,
      `Semua bentuk bisa! 5 dari 5 dapat dilipat → jawabannya 5 (A).`,
    ),
    hold: 0,
    result: true,
  })

  return {
    answer: 'A',
    total,
    steps,
    finalIndex: steps.length - 1,
  }
}
