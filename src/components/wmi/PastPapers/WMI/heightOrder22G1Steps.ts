// Storyboard for WMI-22F1A-Q14 (Grade 1) — name the children in the picture.
//
// Restored 2026-07-30 to the official problem. The previous storyboard narrated
// a re-authored version ("Dan tallest, Pan > Ken, Ken > Ann", asked tallest ->
// shortest), which reached the same key B but is a different, easier question:
// it needed no picture at all.
//
// The paper's clues:
//   Ann: "Ken is shorter than I."   -> Ann > Ken
//   Dan: "I am the tallest."        -> Dan on top
//   Ken: "I am taller than Pan."    -> Ken > Pan
// giving the HEIGHT ranking Dan > Ann > Ken > Pan. But the question asks for the
// LEFT-TO-RIGHT order, so the ranking has to be mapped onto the positions the
// picture prints (tallest, shortest, third, second) -> Dan, Pan, Ken, Ann = B.
//
// So the figure never changes across the beats: the heights are GIVEN evidence.
// What advances is which name has been pinned to which child, which is why each
// step carries `reveal` rather than a new height map.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { PRINTED_HEIGHTS } from './HeightOrder22G1Illustration'

export const HEIGHT_ORDER_ANSWER = 'Dan - Pan - Ken - Ann'
export const HEIGHT_ORDER_CHOICE = 'B'

export type ChildName = 'Dan' | 'Pan' | 'Ken' | 'Ann'
export type HeightMap = Record<ChildName, number>

export type HeightOrderPhase =
  | 'given'
  | 'dan'
  | 'ann'
  | 'ken'
  | 'place'
  | 'result'

export interface HeightOrderStep {
  phase: HeightOrderPhase
  /** Always the printed heights — the picture is given data, not a variable. */
  heights: HeightMap
  /** Name tags pinned so far, fed to <HeightBars revealNames/>. */
  reveal: ChildName[]
  /** Children this beat is arguing about (so the explainer can ring them). */
  focus: ChildName[]
  caption: string
  hold: number
  result: boolean
}

export interface HeightOrderStoryboard {
  answer: string
  /** Left-to-right order — what the question actually asks for. */
  order: ChildName[]
  /** Tallest-to-shortest ranking, the intermediate result. */
  ranking: ChildName[]
  steps: HeightOrderStep[]
  finalIndex: number
}

const ALL: ChildName[] = ['Dan', 'Pan', 'Ken', 'Ann']

export function buildHeightOrder22G1Steps(lang: Lang): HeightOrderStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const h = PRINTED_HEIGHTS

  const steps: HeightOrderStep[] = [
    {
      phase: 'given',
      heights: h,
      reveal: [],
      focus: [],
      hold: 2400,
      result: false,
      caption: t(
        'The picture already tells us the heights: the star end has the TALLEST child, next to it the SHORTEST, then the third tallest, then the second tallest. What we do not know is which name belongs to which child.',
        'Gambarnya sudah memberi tahu tingginya: di ujung berbintang ada anak PALING TINGGI, di sebelahnya yang PALING PENDEK, lalu tertinggi ketiga, lalu tertinggi kedua. Yang belum kita tahu: nama siapa untuk anak yang mana.',
      ),
    },
    {
      phase: 'dan',
      heights: h,
      reveal: ['Dan'],
      focus: ['Dan'],
      hold: 2300,
      result: false,
      caption: t(
        'Dan says he is the TALLEST. Only one child is tallest, and the picture puts that child at the star end — so the first child is Dan.',
        'Dan berkata dia PALING TINGGI. Hanya satu anak yang paling tinggi, dan gambar menaruhnya di ujung berbintang — jadi anak pertama adalah Dan.',
      ),
    },
    {
      phase: 'ann',
      heights: h,
      reveal: ['Dan'],
      focus: ['Ann', 'Ken'],
      hold: 2300,
      result: false,
      caption: t(
        'Ann says Ken is shorter than her, so Ann is taller than Ken. Three children are left, and neither of these two is the tallest.',
        'Ann berkata Ken lebih pendek darinya, jadi Ann lebih tinggi daripada Ken. Tersisa tiga anak, dan keduanya bukan yang paling tinggi.',
      ),
    },
    {
      phase: 'ken',
      heights: h,
      reveal: ['Dan'],
      focus: ['Ken', 'Pan'],
      hold: 2300,
      result: false,
      caption: t(
        'Ken says he is taller than Pan. Chain the two clues together: Ann is taller than Ken, and Ken is taller than Pan — so among the three it goes Ann, then Ken, then Pan.',
        'Ken berkata dia lebih tinggi daripada Pan. Rangkai kedua petunjuk: Ann lebih tinggi dari Ken, dan Ken lebih tinggi dari Pan — jadi di antara ketiganya urutannya Ann, lalu Ken, lalu Pan.',
      ),
    },
    {
      phase: 'place',
      heights: h,
      reveal: ALL,
      focus: ['Ann', 'Ken', 'Pan'],
      hold: 2500,
      result: false,
      caption: t(
        'Now match that to the three spots left in the picture: Ann is the tallest of the three, so she is the second-tallest child; Ken is next; Pan is the shortest, standing right beside Dan.',
        'Sekarang cocokkan dengan tiga tempat yang tersisa di gambar: Ann paling tinggi di antara ketiganya, jadi dia anak tertinggi kedua; Ken berikutnya; Pan paling pendek, berdiri tepat di samping Dan.',
      ),
    },
    {
      phase: 'result',
      heights: h,
      reveal: ALL,
      focus: ALL,
      hold: 0,
      result: true,
      caption: t(
        `Read the names from left to right, starting at the star: Dan, Pan, Ken, Ann. The answer is ${HEIGHT_ORDER_CHOICE}.`,
        `Baca namanya dari kiri ke kanan, mulai dari bintang: Dan, Pan, Ken, Ann. Jawabannya ${HEIGHT_ORDER_CHOICE}.`,
      ),
    },
  ]

  return {
    answer: HEIGHT_ORDER_ANSWER,
    order: ['Dan', 'Pan', 'Ken', 'Ann'],
    ranking: ['Dan', 'Ann', 'Ken', 'Pan'],
    steps,
    finalIndex: steps.length - 1,
  }
}
