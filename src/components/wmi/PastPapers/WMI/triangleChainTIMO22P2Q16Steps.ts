// TIMO-22-P2H-Q16 — storyboard for the line-segment counting animation.
//
// Problem: 9 labeled dots form two upward triangles on a horizontal row with
// two hanging ends. Count ALL distinct line segments between any two dots that
// lie on the same straight line in the figure.
//
// Answer: 18  (see beat equations below)
//
// Teaching walk — one idea per beat:
//   0. intro   — show static figure; ask "how do we count all segments?"
//   1. horiz   — highlight horizontal row B,D,E,F,H → C(5,2) = 10 segments
//   2. left    — highlight left diagonal A,B,C → C(3,2) = 3 segments
//   3. right   — highlight right diagonal G,H,I → C(3,2) = 3 segments
//   4. inner   — highlight inner edges C–D and F–G → 2 segments
//   5. result  — 10 + 3 + 3 + 2 = 18

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'horiz' | 'left' | 'right' | 'inner' | 'result'

export interface ChainBeat {
  phase: PhaseId
  highlightHoriz: boolean   // highlight B,D,E,F,H row in orange
  highlightLeft:  boolean   // highlight A,B,C diagonal in blue
  highlightRight: boolean   // highlight G,H,I diagonal in blue
  highlightInner: boolean   // highlight C–D and F–G in purple
  equation: string
  caption: string
  hold: number              // auto-advance delay ms (0 = manual / final)
  result: boolean
}

export interface ChainStoryboard {
  steps: ChainBeat[]
  finalIndex: number
}

export function buildTriangleChainTIMO22P2Q16Steps(lang: Lang): ChainStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ChainBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightHoriz: false,
      highlightLeft:  false,
      highlightRight: false,
      highlightInner: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Label every dot A–I. A "line segment" counts every pair of dots on the same straight line — not just adjacent ones.',
        'Beri label setiap titik A–I. "Ruas garis" adalah setiap pasang titik yang terletak pada satu garis lurus — bukan hanya yang bersebelahan.',
      ),
    },

    // Beat 1 — horizontal row B,D,E,F,H (5 collinear points)
    {
      phase: 'horiz',
      highlightHoriz: true,
      highlightLeft:  false,
      highlightRight: false,
      highlightInner: false,
      equation: 'C(5,2) = 10',
      hold: 2400,
      result: false,
      caption: t(
        'B, D, E, F, H lie on the same horizontal line — 5 points give C(5,2) = 10 segments.',
        'B, D, E, F, H terletak pada satu garis mendatar — 5 titik menghasilkan C(5,2) = 10 ruas.',
      ),
    },

    // Beat 2 — left diagonal A,B,C
    {
      phase: 'left',
      highlightHoriz: true,
      highlightLeft:  true,
      highlightRight: false,
      highlightInner: false,
      equation: 'C(3,2) = 3',
      hold: 2400,
      result: false,
      caption: t(
        'A, B, C are collinear along the left arm — 3 more segments (A–B, B–C, A–C).',
        'A, B, C sejajar sepanjang lengan kiri — 3 ruas lagi (A–B, B–C, A–C).',
      ),
    },

    // Beat 3 — right diagonal G,H,I
    {
      phase: 'right',
      highlightHoriz: true,
      highlightLeft:  true,
      highlightRight: true,
      highlightInner: false,
      equation: 'C(3,2) = 3',
      hold: 2400,
      result: false,
      caption: t(
        'G, H, I are collinear along the right arm — 3 more segments (G–H, H–I, G–I).',
        'G, H, I sejajar sepanjang lengan kanan — 3 ruas lagi (G–H, H–I, G–I).',
      ),
    },

    // Beat 4 — inner edges C–D and F–G
    {
      phase: 'inner',
      highlightHoriz: true,
      highlightLeft:  true,
      highlightRight: true,
      highlightInner: true,
      equation: '+ 2',
      hold: 2400,
      result: false,
      caption: t(
        'C–D and F–G are not part of any collinear group — add 2 more segments.',
        'C–D dan F–G tidak termasuk dalam kelompok sejajar mana pun — tambah 2 ruas lagi.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      highlightHoriz: true,
      highlightLeft:  true,
      highlightRight: true,
      highlightInner: true,
      equation: '10 + 3 + 3 + 2 = 18',
      hold: 0,
      result: true,
      caption: t(
        'Total: 10 + 3 + 3 + 2 = 18 line segments.',
        'Total: 10 + 3 + 3 + 2 = 18 ruas garis.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
