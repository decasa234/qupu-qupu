// Sweets22A16Explainer.tsx
//
// Post-answer explainer for SEAMO-22-A-Q16:
//   "The teacher has a bag of sweets. If she gives each student 7 sweets,
//    3 sweets remain. If she gives each student 8 sweets, she needs 5 more.
//    How many sweets does the teacher have?"
//   Answer: B (59)
//
// Delegates to TryEliminateExplainer (the reusable try-and-eliminate template),
// binding the params already specified in the seed's visual.params.
//
// VISUALS entry (return as text — do NOT add to registry.ts here):
//   'SEAMO-22-A-Q16': {
//     illustration: () => import('./Sweets22A16Illustration'),
//     explainer:    () => import('./Sweets22A16Explainer'),
//   }

import type { ExplainerProps } from '../../concepts/explainers/registry'
import { TryEliminateExplainer } from './templates/TryEliminateTemplate'

/** Params mirror the seed's visual.params exactly (anti-drift). */
const PARAMS = {
  intro_en: 'Check which sweet count satisfies both conditions (remainder 3 when ÷7, and short 5 when ÷8).',
  intro_id: 'Periksa jumlah permen mana yang memenuhi kedua kondisi (sisa 3 saat ÷7, dan kurang 5 saat ÷8).',
  items: [
    {
      text_en: 'A: 58 — 58÷7=8r2 (need r3) ✗',
      text_id: 'A: 58 — 58÷7=8 sisa 2 (butuh sisa 3) ✗',
      ok: false,
    },
    {
      text_en: 'B: 59 — 59÷7=8r3 ✓ and 59+5=64=8×8 ✓',
      text_id: 'B: 59 — 59÷7=8 sisa 3 ✓ dan 59+5=64=8×8 ✓',
      ok: true,
    },
    {
      text_en: 'C: 60 — 60÷7=8r4 (need r3) ✗',
      text_id: 'C: 60 — 60÷7=8 sisa 4 (butuh sisa 3) ✗',
      ok: false,
    },
    {
      text_en: 'D: 61 — 61÷7=8r5 (need r3) ✗',
      text_id: 'D: 61 — 61÷7=8 sisa 5 (butuh sisa 3) ✗',
      ok: false,
    },
    {
      text_en: 'E: 62 — 62÷7=8r6 (need r3) ✗',
      text_id: 'E: 62 — 62÷7=8 sisa 6 (butuh sisa 3) ✗',
      ok: false,
    },
  ],
  final_en: '59 satisfies both: 7×8+3=59 and 8×8−5=59 — answer B.',
  final_id: '59 memenuhi keduanya: 7×8+3=59 dan 8×8−5=59 — jawaban B.',
  aria_en:  'Only 59 leaves a remainder of 3 when distributed 7 each and falls short by exactly 5 when distributed 8 each.',
  aria_id:  'Hanya 59 yang menyisakan 3 ketika dibagikan 7 per orang dan kurang tepat 5 ketika dibagikan 8 per orang.',
}

export default function Sweets22A16Explainer(props: ExplainerProps) {
  return <TryEliminateExplainer {...props} params={PARAMS} />
}
