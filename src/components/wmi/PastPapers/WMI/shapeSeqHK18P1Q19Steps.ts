// HKIMO-18-P1H-Q19 — beat steps for the animated explainer.
// Adapted from pattern4PESteps.ts (IKMC-20-PE-Q4).

export interface ShapeSeqHK18P1Q19Beat {
  caption: string
  showCycleBracket: boolean
  highlightCycleSlots: number[]   // 0-based indices to highlight in the sequence row
  showModLabel: boolean            // show "14 ÷ 5 = 2 remainder 4"
  fillBlank: boolean               // reveal the blank as □
  hold: number                     // ms for auto-advance
}

export interface ShapeSeqHK18P1Q19Story {
  steps: ShapeSeqHK18P1Q19Beat[]
  finalIndex: number
}

const EN: ShapeSeqHK18P1Q19Beat[] = [
  {
    caption: 'The shapes repeat in a cycle: ○ □ □ □ △',
    showCycleBracket: false,
    highlightCycleSlots: [0, 1, 2, 3, 4],
    showModLabel: false,
    fillBlank: false,
    hold: 2000,
  },
  {
    caption: 'The cycle length is 5. Bracket shows one full cycle.',
    showCycleBracket: true,
    highlightCycleSlots: [0, 1, 2, 3, 4],
    showModLabel: false,
    fillBlank: false,
    hold: 2200,
  },
  {
    caption: 'The blank is at position 14.  14 ÷ 5 = 2 remainder 4.',
    showCycleBracket: true,
    highlightCycleSlots: [],
    showModLabel: true,
    fillBlank: false,
    hold: 2400,
  },
  {
    caption: 'Remainder 4 → the 4th shape in the cycle is □ (square).',
    showCycleBracket: true,
    highlightCycleSlots: [3],
    showModLabel: true,
    fillBlank: false,
    hold: 2200,
  },
  {
    caption: 'Answer: □',
    showCycleBracket: true,
    highlightCycleSlots: [3],
    showModLabel: true,
    fillBlank: true,
    hold: 2800,
  },
]

const ID: ShapeSeqHK18P1Q19Beat[] = [
  {
    caption: 'Bentuk-bentuk berulang dalam siklus: ○ □ □ □ △',
    showCycleBracket: false,
    highlightCycleSlots: [0, 1, 2, 3, 4],
    showModLabel: false,
    fillBlank: false,
    hold: 2000,
  },
  {
    caption: 'Panjang siklus adalah 5. Kurung menunjukkan satu siklus penuh.',
    showCycleBracket: true,
    highlightCycleSlots: [0, 1, 2, 3, 4],
    showModLabel: false,
    fillBlank: false,
    hold: 2200,
  },
  {
    caption: 'Tempat kosong ada di posisi ke-14.  14 ÷ 5 = 2 sisa 4.',
    showCycleBracket: true,
    highlightCycleSlots: [],
    showModLabel: true,
    fillBlank: false,
    hold: 2400,
  },
  {
    caption: 'Sisa 4 → bentuk ke-4 dalam siklus adalah □ (persegi).',
    showCycleBracket: true,
    highlightCycleSlots: [3],
    showModLabel: true,
    fillBlank: false,
    hold: 2200,
  },
  {
    caption: 'Jawaban: □',
    showCycleBracket: true,
    highlightCycleSlots: [3],
    showModLabel: true,
    fillBlank: true,
    hold: 2800,
  },
]

export function buildShapeSeqHK18P1Q19Steps(lang: 'en' | 'id'): ShapeSeqHK18P1Q19Story {
  const steps = lang === 'id' ? ID : EN
  return { steps, finalIndex: steps.length - 1 }
}
