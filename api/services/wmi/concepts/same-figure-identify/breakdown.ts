import type { Breakdown, BreakdownHighlight } from '../types.js'
import { type Params } from './index.js'

const LABELS = ['A', 'B', 'C', 'D'] as const

// Authored decomposition of a same-figure-identify problem: among four options,
// pick the one that is the SAME figure as the target — rotations count as the
// same, but a mirror flip never does. Figure-heavy: the shapes live in the
// in-card illustration, so the highlights spotlight only the stem words the kid
// reads (the matching rule + the question), color-coded by category.
//
// Display body (after stripSectionLabels removes "Find:" / "Cari:" and the
// glossary markup resolves to its label — di[[rotation|putar]] -> diputar,
// di[[reflection|balik]] -> dibalik):
//   EN: "The figure shown can be rotated to any angle, but must NOT be flipped
//        (mirrored). Which option — A, B, C, or D — is the SAME figure as the
//        one shown?"
//   ID: "Bangun yang ditampilkan boleh diputar ke sudut mana pun, tetapi TIDAK
//        boleh dibalik (dicerminkan). Pilihan manakah — A, B, C, atau D — yang
//        merupakan bangun SAMA dengan yang ditampilkan?"
// Each highlight phrase MUST be an exact substring of that display body.
export function buildSameFigureIdentifyBreakdown(params: Params): Breakdown {
  const label = LABELS[params.validIndex]

  const highlights: BreakdownHighlight[] = [
    // condition — turning is allowed, so a rotated copy is still "the same"
    {
      category: 'condition',
      phrase_en: 'rotated to any angle',
      phrase_id: 'diputar ke sudut mana pun',
      note_en: 'Turning the figure does not change it — a spun copy still counts as the same.',
      note_id: 'Memutar bangun tidak mengubahnya — salinan yang diputar tetap dihitung sama.',
    },
    // condition — flipping is NOT allowed, so a mirror image is a different figure
    {
      category: 'condition',
      phrase_en: 'must NOT be flipped',
      phrase_id: 'TIDAK boleh dibalik',
      note_en: 'A mirror image is a different figure — you can never reach it by turning.',
      note_id: 'Bayangan cermin adalah bangun berbeda — tidak akan didapat hanya dengan memutar.',
    },
    // question — which option is the same figure
    {
      category: 'question',
      phrase_en: 'is the SAME figure',
      phrase_id: 'merupakan bangun SAMA',
      note_en: 'Find the one option that matches the shown figure after turning it.',
      note_id: 'Cari satu pilihan yang cocok dengan bangun yang ditampilkan setelah diputar.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Options', label_id: 'Pilihan', value: LABELS.join(', ') },
      { label_en: 'Answer', label_id: 'Jawaban', value: label },
    ],

    strategy: {
      conceptSlug: 'same-figure-identify',
      name_en: 'Turn, never flip',
      name_id: 'Putar, jangan dibalik',
    },

    // The mirror images are the tempting wrong picks, but there are three of
    // them and they are not a single labelled answer — no one trap to name.
    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: String(label),
    },

    vocab: [],
  }
}
