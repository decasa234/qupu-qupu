import type { Breakdown, BreakdownHighlight } from '../types.js'
import { finalIndex, type Params } from './index.js'

const DIRS = ['North', 'East', 'South', 'West'] as const
const DIRS_ID = ['Utara', 'Timur', 'Selatan', 'Barat'] as const
const LABELS = ['A', 'B', 'C', 'D'] as const

// Authored decomposition of a direction-orientation problem: you start facing one
// compass direction and make several clockwise quarter-turns; find where you end
// up facing. The trick is that 4 quarter-turns is a full circle, so only the
// leftover turns (turns mod 4) change your facing. Each highlight phrase MUST be
// an exact substring of the DISPLAY body (after stripSectionLabels removes the
// "Find:" / "Cari:" markers and collapses spaces).
export function buildDirectionOrientationBreakdown(params: Params): Breakdown {
  const { start, turns } = params
  const startEN = DIRS[start]
  const startID = DIRS_ID[start]
  const fi = finalIndex(params)
  const answerEN = DIRS[fi]
  const answerID = DIRS_ID[fi]
  const answerLabel = LABELS[fi]

  const net = turns % 4
  const fullCircles = Math.floor(turns / 4)
  const plural = turns > 1

  // EN/ID phrases for the turns, matching the body's singular/plural wording.
  const turnsEN = `${turns} quarter-turn${plural ? 's' : ''}`
  const turnsID = `berputar ${turns} kali seperempat putaran`

  const highlights: BreakdownHighlight[] = [
    // fact — the direction you begin facing
    {
      category: 'fact',
      phrase_en: `facing ${startEN}`,
      phrase_id: `menghadap ke ${startID}`,
      note_en: `You begin by looking toward ${startEN}.`,
      note_id: `Kamu mulai dengan menghadap ke ${startID}.`,
    },
    // fact — how many quarter-turns you make
    {
      category: 'fact',
      phrase_en: turnsEN,
      phrase_id: turnsID,
      note_en:
        net === 0
          ? `${turns} quarter-turns make ${fullCircles} full circle${fullCircles > 1 ? 's' : ''}.`
          : `Each quarter-turn moves you one step: North → East → South → West.`,
      note_id:
        net === 0
          ? `${turns} putaran sama dengan ${fullCircles} lingkaran penuh.`
          : `Tiap seperempat putaran maju satu langkah: Utara → Timur → Selatan → Barat.`,
    },
    // condition — the turns are clockwise, so they go in compass order
    {
      category: 'condition',
      phrase_en: 'clockwise',
      phrase_id: 'searah jarum jam',
      note_en: 'Turn in the order North → East → South → West, then back to North.',
      note_id: 'Berputar urut Utara → Timur → Selatan → Barat, lalu kembali ke Utara.',
    },
    // condition — each turn is exactly 90°, and 4 of them is a full circle
    {
      category: 'condition',
      phrase_en: '90°',
      phrase_id: '90°',
      note_en: 'One quarter-turn is 90°; four of them (360°) bring you back to start.',
      note_id: 'Satu seperempat putaran 90°; empat kali (360°) kembali ke arah awal.',
    },
    // question — the final direction you face
    {
      category: 'question',
      phrase_en: 'Which direction are you facing now?',
      phrase_id: 'Sekarang kamu menghadap ke arah mana?',
      note_en: `After all the turns you face ${answerEN} (choice ${answerLabel}).`,
      note_id: `Setelah semua putaran kamu menghadap ke ${answerID} (pilihan ${answerLabel}).`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Start direction', label_id: 'Arah awal', value: startEN },
      { label_en: 'Quarter-turns', label_id: 'Seperempat putaran', value: String(turns) },
      { label_en: 'Leftover turns (mod 4)', label_id: 'Sisa putaran (mod 4)', value: String(net) },
      { label_en: 'End direction', label_id: 'Arah akhir', value: answerEN },
      { label_en: 'Answer (choice)', label_id: 'Jawaban (pilihan)', value: answerLabel },
    ],

    strategy: {
      conceptSlug: 'direction-orientation',
      name_en: 'Drop full circles, then step the leftover turns clockwise',
      name_id: 'Buang lingkaran penuh, lalu langkahkan sisa putaran searah jarum jam',
    },

    // No single stable tempting wrong answer: the common slip is turning the wrong
    // way or an off-by-one in the leftover count, and the resulting wrong direction
    // changes with the parameters, so there is no one fixed trap value.
    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: answerLabel,
    },

    vocab: [],
  }
}
