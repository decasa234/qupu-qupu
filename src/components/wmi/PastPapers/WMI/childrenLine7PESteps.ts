// IKMC-21-PE-Q7 — storyboard for "children in a line, right-hand count" animation.
//
// The question: 7 children stand in a line, alternating facing directions (→←→←→←→).
// They all hold hands with their neighbours. How many hold a neighbour's hand with
// their RIGHT hand? Answer: E = 6.
//
// Key insight:
//   - A child facing → (right): right hand points to the RIGHT neighbour → uses right hand ✓
//   - A child facing ← (left):  right hand points to the LEFT neighbour → uses right hand ✓
//   With alternating directions (→←→←→←→):
//     Connection (→←): BOTH children use right hand → 2 right-hand connections each.
//     Connection (←→): BOTH children use LEFT hand → 0 right-hand connections.
//   Pair pattern: (1→2←)=2, (2←3→)=0, (3→4←)=2, (4←5→)=0, (5→6←)=2, (6←7→)=0
//   Wait — that gives 6 right-hand connections but only from children 1,2,3,4,5,6 at pairs.
//   Let's recount by child:
//     Child 1 (→): holds child 2 with RIGHT hand ✓ → 1
//     Child 2 (←): holds child 1 with RIGHT hand ✓ → 1
//     Child 3 (→): holds child 4 with RIGHT hand ✓ → 1
//     Child 4 (←): holds child 3 with RIGHT hand ✓ → 1
//     Child 5 (→): holds child 6 with RIGHT hand ✓ → 1
//     Child 6 (←): holds child 5 with RIGHT hand ✓ → 1
//     Child 7 (→): only holds child 6 (no right neighbour); uses RIGHT hand but child 6
//                  is to the LEFT of child 7 → child 7 is at right end; their right hand
//                  points further right (into space) — so child 7 holds child 6 with LEFT hand ✗
//   Total = 6 children use their right hand. Answer E = 6. ✓
//
// Teaching walk:
//   0. intro      — show the scene; name the challenge.
//   1. rule       — explain what "right hand" means per facing direction.
//   2. fwd-check  — highlight children 1,3,5,7 (→): show which hand is right.
//   3. bwd-check  — highlight children 2,4,6 (←): show which hand is right.
//   4. count      — reveal the right-hand connections, running count 1→6.
//   5. result     — "6 children use their right hand → answer E".
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'rule' | 'fwd-check' | 'bwd-check' | 'count' | 'result'

export interface AnimBeat {
  phase: PhaseId
  /** Indices (0-based) of children to highlight (glow). */
  highlight: number[]
  /** Indices of connections (0-based, between child i and i+1) to mark as right-hand. */
  rightHandLinks: number[]
  /** Running right-hand count to display (or -1 to hide). */
  count: number
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface ChildrenLine7Storyboard {
  steps: AnimBeat[]
  finalIndex: number
}

export function buildChildrenLine7PESteps(lang: Lang): ChildrenLine7Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AnimBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlight: [],
      rightHandLinks: [],
      count: -1,
      hold: 2200,
      result: false,
      caption: t(
        '7 children hold hands in a line. Some face forwards (→), others face backwards (←). Who uses their RIGHT hand?',
        '7 anak berpegangan tangan dalam satu barisan. Sebagian menghadap ke depan (→), sebagian ke belakang (←). Siapa yang memakai tangan KANAN?',
      ),
    },

    // Beat 1 — rule
    {
      phase: 'rule',
      highlight: [],
      rightHandLinks: [],
      count: -1,
      hold: 2600,
      result: false,
      caption: t(
        'Key rule: a child facing → has their RIGHT hand on the right side of the image. A child facing ← has their RIGHT hand on the left side.',
        'Aturan kunci: anak yang menghadap → memiliki tangan KANAN di sisi kanan gambar. Anak yang menghadap ← memiliki tangan KANAN di sisi kiri.',
      ),
    },

    // Beat 2 — fwd-check (children 1, 3, 5, 7 = indices 0,2,4,6)
    {
      phase: 'fwd-check',
      highlight: [0, 2, 4, 6],
      rightHandLinks: [],
      count: -1,
      hold: 2600,
      result: false,
      caption: t(
        'Children 1, 3, 5, 7 face → (blue shirts). Their RIGHT hand reaches to the child on their RIGHT. Children 1, 3, 5 each connect to a neighbour on their right → right hand used ✓.',
        'Anak 1, 3, 5, 7 menghadap → (baju biru). Tangan KANAN mereka menjangkau anak di KANAN mereka. Anak 1, 3, 5 masing-masing terhubung ke tetangga di kanan → tangan kanan dipakai ✓.',
      ),
    },

    // Beat 3 — bwd-check (children 2, 4, 6 = indices 1,3,5)
    {
      phase: 'bwd-check',
      highlight: [1, 3, 5],
      rightHandLinks: [],
      count: -1,
      hold: 2600,
      result: false,
      caption: t(
        'Children 2, 4, 6 face ← (red shirts). Their RIGHT hand reaches to the child on their LEFT. They each connect to a neighbour on their left → right hand used ✓.',
        'Anak 2, 4, 6 menghadap ← (baju merah). Tangan KANAN mereka menjangkau anak di KIRI mereka. Masing-masing terhubung ke tetangga di kirinya → tangan kanan dipakai ✓.',
      ),
    },

    // Beat 4 — count (reveal all right-hand links one by one; we show all at once here
    //           and let the caption do the counting)
    {
      phase: 'count',
      highlight: [0, 1, 2, 3, 4, 5],   // children 1–6 all use right hand
      rightHandLinks: [0, 2, 4],        // connections 1↔2, 3↔4, 5↔6 are both right-hand
      count: 6,
      hold: 2800,
      result: false,
      caption: t(
        'Counting: children 1, 2, 3, 4, 5, 6 each use their right hand when holding hands. Child 7 (at the right end, facing →) has no right neighbour, so uses their LEFT hand for the only connection.',
        'Menghitung: anak 1, 2, 3, 4, 5, 6 masing-masing memakai tangan kanan saat berpegangan. Anak 7 (ujung kanan, menghadap →) tidak punya tetangga di kanan, sehingga memakai tangan KIRI untuk satu-satunya sambungan.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      highlight: [0, 1, 2, 3, 4, 5],
      rightHandLinks: [0, 2, 4],
      count: 6,
      hold: 0,
      result: true,
      caption: t(
        '6 children hold a neighbour\'s hand with their right hand. Answer: E (6).',
        '6 anak memegang tangan anak lain dengan tangan kanan mereka. Jawaban: E (6).',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
