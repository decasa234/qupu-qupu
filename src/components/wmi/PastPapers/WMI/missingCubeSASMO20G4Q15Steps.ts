// SASMO-20-G4-Q15 — storyboard for the missing-cube-piece explainer.
//
// Question: which option (A–E) is the missing corner piece of the cube?
// Answer: B
//
// Solution insight:
//   The missing piece sits at the top-front-right corner of the large cube.
//   Each of the three visible faces of the hole requires a specific triangular
//   pattern (dark half on each face).
//   • Top face:   dark = back half
//   • Left face:  dark = lower-left half
//   • Right face: dark = lower-right half
//   Only B has all three matching; E has them swapped (wrong orientation).
//
// Teaching walk, one idea per beat:
//   0. identify — locate the missing corner; note which 3 faces are exposed.
//   1. faces    — each face of the hole has a required dark-triangle direction.
//   2. match    — B and E both carry correct face types; E's L/R are swapped.
//   3. answer   — B fits perfectly; answer is B.

export type Lang = 'en' | 'id'

export type MissingCubePhaseId = 'identify' | 'faces' | 'match' | 'answer'

export interface MissingCubeBeat {
  id:           MissingCubePhaseId
  headline_en:  string
  headline_id:  string
  detail_en:    string
  detail_id:    string
  /** Which option labels to highlight (others are dimmed). Empty = highlight all. */
  highlight:    string[]
}

export interface MissingCubeStoryboard {
  beats:         MissingCubeBeat[]
  answer_label:  string
}

export function buildMissingCubeSASMO20G4Q15Steps(_lang: Lang): MissingCubeStoryboard {
  return {
    answer_label: 'B',
    beats: [
      {
        id: 'identify',
        headline_en: 'Find the missing corner',
        headline_id: 'Temukan sudut yang hilang',
        detail_en:
          'The large cube is missing one piece at its top-front-right corner. ' +
          'Three faces of the hole are visible.',
        detail_id:
          'Kubus besar kehilangan satu potongan di sudut atas-depan-kanan. ' +
          'Tiga permukaan lubang terlihat.',
        highlight: [],
      },
      {
        id: 'faces',
        headline_en: 'Read each required face pattern',
        headline_id: 'Baca pola tiap permukaan yang diperlukan',
        detail_en:
          'Top face: dark triangle at the back. ' +
          'Front-left face: dark triangle at the lower-left. ' +
          'Right face: dark triangle at the lower-right.',
        detail_id:
          'Permukaan atas: segitiga gelap di belakang. ' +
          'Permukaan kiri: segitiga gelap di kiri-bawah. ' +
          'Permukaan kanan: segitiga gelap di kanan-bawah.',
        highlight: ['B', 'E'],
      },
      {
        id: 'match',
        headline_en: 'B and E both have the right faces — but E is mirrored',
        headline_id: 'B dan E sama-sama punya permukaan yang benar — tapi E tercermin',
        detail_en:
          'Options A, C, D each have at least one face with the wrong triangle direction. ' +
          'B and E both have the correct pattern on every face, but E\'s left and right ' +
          'face patterns are swapped — the piece cannot fit without flipping.',
        detail_id:
          'Pilihan A, C, D masing-masing memiliki setidaknya satu permukaan yang arah ' +
          'segitiganya salah. B dan E memiliki pola yang benar di setiap permukaan, ' +
          'namun pola permukaan kiri dan kanan E tertukar — potongan tidak bisa dipasang ' +
          'tanpa membaliknya.',
        highlight: ['B'],
      },
      {
        id: 'answer',
        headline_en: 'Answer: B',
        headline_id: 'Jawaban: B',
        detail_en:
          'Option B has the correct dark-triangle direction on all three faces and ' +
          'fits exactly into the missing corner. Answer: B.',
        detail_id:
          'Pilihan B memiliki arah segitiga gelap yang benar di ketiga permukaan dan ' +
          'tepat mengisi sudut yang hilang. Jawaban: B.',
        highlight: ['B'],
      },
    ],
  }
}
