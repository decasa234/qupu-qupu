export type Lang = 'en' | 'id'

/** What the board shows on a beat: the assembled cube, or its n sliced layers. */
export type PaintedCubeMode = 'solid' | 'layers'

/**
 * Painted-face classes in teaching order: corners (3), edges (2), face centres
 * (1), interior (0). Nothing here is hardcoded per cube size — every count is
 * derived from n so the storyboard is correct for any n the generator emits.
 */
export const PAINTED_CLASS_FACES = [3, 2, 1, 0] as const

/**
 * How many unit cubes of an n×n×n painted cube carry exactly `faces` painted
 * faces. m = n − 2 is the count of "inner" positions along one axis.
 *   3 → 8 corners            (always 8, whatever n is)
 *   2 → 12 edges × m
 *   1 → 6 faces × m²
 *   0 → m³ hidden interior
 */
export function paintedClassCount(n: number, faces: number): number {
  const m = n - 2
  if (m < 0) return 0
  switch (faces) {
    case 3:
      return 8
    case 2:
      return 12 * m
    case 1:
      return 6 * m * m
    case 0:
      return m * m * m
    default:
      return 0
  }
}

/**
 * Painted-face count of the unit cube at grid position (x, y, z) inside an
 * n×n×n cube: one painted face per coordinate that sits on the outer boundary.
 * Used by the board to colour each sliced cell, and as an independent check
 * that the class formulas above are right.
 */
export function paintedFacesAt(n: number, x: number, y: number, z: number): number {
  const onSkin = (v: number) => (v === 0 || v === n - 1 ? 1 : 0)
  return onSkin(x) + onSkin(y) + onSkin(z)
}

export interface PaintedCubeClassInfo {
  /** Painted faces shared by every cube in this class: 3, 2, 1 or 0. */
  faces: number
  /** How many unit cubes fall in this class (derived from n). */
  count: number
  /** Localized position name — Sudut / Rusuk / Tengah sisi / Dalam. */
  label: string
  /** Localized derivation, e.g. "12 × 3". */
  formula: string
}

export interface PaintedCubeStep {
  kind: 'intro' | 'cut' | 'class' | 'answer'
  mode: PaintedCubeMode
  /** Index into `classes` of the class lit on this beat (−1 on intro/cut). */
  activeIndex: number
  /** Classes already introduced on the board (their cells carry colour). */
  walked: boolean[]
  /** Counts shown in the tally; null = still withheld from the learner. */
  counts: (number | null)[]
  caption: string
  /** True only on the final beat — the one beat that states the answer. */
  result: boolean
  /** How long to hold this beat, in ms (0 = final beat, holds indefinitely). */
  hold: number
}

export interface PaintedCubeStoryboard {
  n: number
  k: number
  /** n³ — every unit cube after the big cube is cut apart. */
  total: number
  answer: number
  /** Ordered corners → edges → face centres → interior. */
  classes: PaintedCubeClassInfo[]
  /** Index in `classes` of the class the question asks about. */
  targetIndex: number
  /** "8 + 24 + 24 + 8 = 64" — the four classes account for every small cube. */
  checkText: string
  steps: PaintedCubeStep[]
  finalIndex: number
}

const LABELS: Record<number, [string, string]> = {
  3: ['Corner', 'Sudut'],
  2: ['Edge', 'Rusuk'],
  1: ['Face centre', 'Tengah sisi'],
  0: ['Inside', 'Dalam'],
}

function toInt(raw: unknown, fallback: number, lo: number, hi: number): number {
  const v = Number(raw)
  if (!Number.isFinite(v)) return fallback
  return Math.max(lo, Math.min(hi, Math.round(v)))
}

function formulaFor(faces: number, m: number): string {
  switch (faces) {
    case 3:
      return '8'
    case 2:
      return `12 × ${m}`
    case 1:
      return `6 × ${m} × ${m}`
    default:
      return `${m} × ${m} × ${m}`
  }
}

function classCaption(faces: number, m: number, count: number, isTarget: boolean, lang: Lang): string {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  if (isTarget) {
    switch (faces) {
      case 3:
        return t('A corner cube meets 3 painted sides. That is our class.', 'Kubus di sudut kena 3 sisi cat. Ini kelas yang dicari.')
      case 2:
        return t('An edge cube meets 2 painted sides. That is our class.', 'Kubus di rusuk kena 2 sisi cat. Ini kelas yang dicari.')
      case 1:
        return t('A face-centre cube meets 1 painted side. That is our class.', 'Kubus tengah sisi kena 1 sisi cat. Ini kelas yang dicari.')
      default:
        return t('An inside cube meets no paint at all. That is our class.', 'Kubus di dalam tidak kena cat. Ini kelas yang dicari.')
    }
  }
  switch (faces) {
    case 3:
      return t(
        `A corner cube meets 3 painted sides. A cube has 8 corners → ${count}.`,
        `Kubus di sudut kena 3 sisi cat. Kubus punya 8 sudut → ${count}.`,
      )
    case 2:
      return t(
        `An edge cube meets 2 painted sides. 12 edges × ${m} = ${count}.`,
        `Kubus di rusuk kena 2 sisi cat. 12 rusuk × ${m} = ${count}.`,
      )
    case 1:
      return t(
        `A face-centre cube meets 1 painted side. 6 × ${m} × ${m} = ${count}.`,
        `Kubus tengah sisi kena 1 sisi cat. 6 × ${m} × ${m} = ${count}.`,
      )
    default:
      return t(
        `An inside cube meets no paint. ${m} × ${m} × ${m} = ${count}.`,
        `Kubus di dalam tidak kena cat. ${m} × ${m} × ${m} = ${count}.`,
      )
  }
}

function answerCaption(faces: number, m: number, answer: number, lang: Lang): string {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  switch (faces) {
    case 3:
      return t(
        `Exactly 3 painted faces = a corner. 8 corners → ${answer} cubes.`,
        `Tepat 3 sisi tercat = di sudut. 8 sudut → ${answer} kubus.`,
      )
    case 2:
      return t(
        `Exactly 2 painted faces = an edge. 12 × ${m} = ${answer} cubes.`,
        `Tepat 2 sisi tercat = di rusuk. 12 × ${m} = ${answer} kubus.`,
      )
    case 1:
      return t(
        `Exactly 1 painted face = a face centre. 6 × ${m} × ${m} = ${answer} cubes.`,
        `Tepat 1 sisi tercat = tengah sisi. 6 × ${m} × ${m} = ${answer} kubus.`,
      )
    default:
      return t(
        `Exactly 0 painted faces = inside. ${m} × ${m} × ${m} = ${answer} cubes.`,
        `Tepat 0 sisi tercat = di dalam. ${m} × ${m} × ${m} = ${answer} kubus.`,
      )
  }
}

/**
 * G15 painted cube. A big n×n×n cube is painted all over, then cut into n³ unit
 * cubes; count the ones with exactly k painted faces.
 *
 * The storyboard shows the solid cube, slices it into n layers so the hidden
 * inner cubes become visible, then walks the four position classes in order
 * (corners → edges → face centres → interior), counting each class as a group.
 * The class the question asks about is lit but its count is deliberately
 * withheld ("?") until the last beat, so the answer is deduced there — from its
 * own formula and from the fact that the four classes must add up to n³.
 */
export function buildPaintedCubeSteps(nRaw: unknown, kRaw: unknown, lang: Lang): PaintedCubeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const n = toInt(nRaw, 3, 3, 8)
  const k = toInt(kRaw, 1, 0, 3)
  const m = n - 2
  const total = n ** 3

  const classes: PaintedCubeClassInfo[] = PAINTED_CLASS_FACES.map((faces) => ({
    faces,
    count: paintedClassCount(n, faces),
    label: t(LABELS[faces][0], LABELS[faces][1]),
    formula: formulaFor(faces, m),
  }))
  const targetIndex = classes.findIndex((c) => c.faces === k)
  const answer = classes[targetIndex].count

  const hiddenCounts = (upTo: number): (number | null)[] =>
    classes.map((c, j) => (j <= upTo && j !== targetIndex ? c.count : null))
  const walkedUpTo = (upTo: number): boolean[] => classes.map((_, j) => j <= upTo)

  const steps: PaintedCubeStep[] = [
    {
      kind: 'intro',
      mode: 'solid',
      activeIndex: -1,
      walked: classes.map(() => false),
      counts: classes.map(() => null),
      caption: t(
        `A ${n}×${n}×${n} cube gets paint on every outside face.`,
        `Kubus ${n}×${n}×${n} dicat pada semua sisi luarnya.`,
      ),
      result: false,
      hold: 2200,
    },
    {
      kind: 'cut',
      mode: 'layers',
      activeIndex: -1,
      walked: classes.map(() => false),
      counts: classes.map(() => null),
      caption: t(
        `Cut it into ${total} small cubes — ${n} layers, so the hidden ones show.`,
        `Potong jadi ${total} kubus kecil — ${n} lapis, agar yang tersembunyi terlihat.`,
      ),
      result: false,
      hold: 2400,
    },
  ]

  classes.forEach((cls, j) => {
    const isTarget = j === targetIndex
    steps.push({
      kind: 'class',
      mode: 'layers',
      activeIndex: j,
      walked: walkedUpTo(j),
      counts: hiddenCounts(j),
      caption: classCaption(cls.faces, m, cls.count, isTarget, lang),
      result: false,
      hold: isTarget ? 2500 : 2200,
    })
  })

  const checkText = `${classes.map((c) => c.count).join(' + ')} = ${total}`

  steps.push({
    kind: 'answer',
    mode: 'layers',
    activeIndex: targetIndex,
    walked: classes.map(() => true),
    counts: classes.map((c) => c.count),
    caption: answerCaption(classes[targetIndex].faces, m, answer, lang),
    result: true,
    hold: 0,
  })

  return {
    n,
    k,
    total,
    answer,
    classes,
    targetIndex,
    checkText,
    steps,
    finalIndex: steps.length - 1,
  }
}
