export type Lang = 'en' | 'id'

/** What the board shows on a beat: the assembled cube, or the class's pieces laid out flat. */
export type PaintedCubeView = 'solid' | 'pieces'

export type PaintedCubeStepKind =
  | 'intro'
  | 'cut'
  | 'locate'
  | 'unfold'
  | 'peel'
  | 'gather'
  | 'answer'

/** Painted-face classes, most-painted first. Only the asked one is ever walked. */
export const PAINTED_CLASS_FACES = [3, 2, 1, 0] as const

/**
 * How many *pieces* of the big cube carry the class with `faces` painted sides:
 * 8 corners, 12 edges, 6 faces, or the single block hidden inside.
 */
export function pieceCount(faces: number): number {
  switch (faces) {
    case 3:
      return 8
    case 2:
      return 12
    case 1:
      return 6
    case 0:
      return 1
    default:
      return 0
  }
}

/**
 * Size of one piece, in dimensions. A unit cube with `faces` painted sides sits
 * on the skin in exactly `faces` directions and strictly inside in the other
 * 3 − faces, so one piece is n^(3−faces) cells big and keeps m^(3−faces) of
 * them once the painted border is peeled off (m = n − 2):
 *   corner (3) → 0-D, a single cube  ·  edge (2) → 1-D, a strip of n
 *   face   (1) → 2-D, an n×n square  ·  inside (0) → 3-D, the whole n×n×n block
 */
export function pieceDims(faces: number): number {
  return 3 - faces
}

/**
 * How many unit cubes of an n×n×n painted cube carry exactly `faces` painted
 * faces — pieces × what survives the peel, never hardcoded per cube size:
 *   3 → 8 × m⁰ = 8      2 → 12 × m
 *   1 → 6 × m²          0 → 1 × m³
 */
export function paintedClassCount(n: number, faces: number): number {
  if (faces < 0 || faces > 3) return 0
  const m = Math.max(0, n - 2)
  return pieceCount(faces) * m ** pieceDims(faces)
}

/**
 * Painted-face count of the unit cube at grid position (x, y, z) inside an
 * n×n×n cube: one painted face per coordinate that sits on the outer boundary.
 * Used to colour the board, and as an independent check of the formulas above.
 */
export function paintedFacesAt(n: number, x: number, y: number, z: number): number {
  const onSkin = (v: number) => (v === 0 || v === n - 1 ? 1 : 0)
  return onSkin(x) + onSkin(y) + onSkin(z)
}

/**
 * Is cell (col, row) of piece #`piece` part of the painted border that gets
 * peeled away? The rule is the same in every dimension — a cell is border as
 * soon as one of its coordinates sits at an end (0 or n − 1) — which is exactly
 * why n − 2 survives along every direction. Corners (dims 0) have no border.
 */
export function isPeelCell(n: number, dims: number, piece: number, col: number, row: number): boolean {
  const onSkin = (v: number) => v === 0 || v === n - 1
  if (dims >= 3) return onSkin(col) || onSkin(row) || onSkin(piece)
  if (dims === 2) return onSkin(col) || onSkin(row)
  if (dims === 1) return onSkin(col)
  return false
}

export interface PaintedCubeStep {
  kind: PaintedCubeStepKind
  view: PaintedCubeView
  /** pieces view: how many pieces are drawn side by side (solid view: 1). */
  groups: number
  /** pieces view: dimensions of one piece — see `pieceDims` (solid view: 3). */
  dims: number
  /** Draw the asked class in the target colour (both views). */
  lit: boolean
  /** How many of the `groups` pieces are lit — lets a beat light 4 of 8 corners. */
  litPieces: number
  /** 0 = pieces intact · 1 = painted border shrinking away · 2 = border gone. */
  peel: 0 | 1 | 2
  caption: string
  /** Short arithmetic line under the board; null = show the standing hint. */
  derivation: string | null
  /** True only on the final beat — the one beat that states the answer. */
  result: boolean
  /** How long to hold this beat, in ms (0 = final beat, holds indefinitely). */
  hold: number
}

export interface PaintedCubeStoryboard {
  n: number
  k: number
  /** n − 2 — what survives along one direction after the peel. */
  m: number
  /** n³ — every unit cube after the big cube is cut apart. */
  total: number
  answer: number
  /** How many pieces carry the asked class: 8 / 12 / 6 / 1. */
  groups: number
  /** Dimensions of one piece: 0 / 1 / 2 / 3. */
  dims: number
  /** Localized position name — Sudut / Rusuk / Tengah sisi / Dalam. */
  label: string
  /** Localized piece noun — sudut / rusuk / sisi / kubus. */
  pieceWord: string
  /** The answer's derivation without its result, e.g. "12 × 3" or "4 + 4". */
  formula: string
  steps: PaintedCubeStep[]
  finalIndex: number
}

const LABELS: Record<number, [string, string]> = {
  3: ['Corner', 'Sudut'],
  2: ['Edge', 'Rusuk'],
  1: ['Face centre', 'Tengah sisi'],
  0: ['Inside', 'Dalam'],
}

const PIECE_WORDS: Record<number, [string, string]> = {
  3: ['corners', 'sudut'],
  2: ['edges', 'rusuk'],
  1: ['faces', 'sisi'],
  0: ['cube', 'kubus'],
}

function toInt(raw: unknown, fallback: number, lo: number, hi: number): number {
  const v = Number(raw)
  if (!Number.isFinite(v)) return fallback
  return Math.max(lo, Math.min(hi, Math.round(v)))
}

/** The answer's derivation, result withheld: "4 + 4", "12 × 3", "6 × 3 × 3", "3 × 3 × 3". */
function formulaFor(k: number, m: number): string {
  switch (k) {
    case 3:
      return '4 + 4'
    case 2:
      return `12 × ${m}`
    case 1:
      return `6 × ${m} × ${m}`
    default:
      return `${m} × ${m} × ${m}`
  }
}

/** Beat 3 — where the asked class lives, in kid words. */
function locateCaption(k: number, lang: Lang): string {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  switch (k) {
    case 3:
      return t('3 painted sides? Only the cubes sitting at a corner.', 'Kena cat 3 sisi? Cuma kubus yang duduk di sudut.')
    case 2:
      return t(
        '2 painted sides? The cubes along an edge — but not the corner ones.',
        'Kena cat 2 sisi? Kubus di sepanjang rusuk — tapi bukan yang di sudut.',
      )
    case 1:
      return t(
        '1 painted side? The cubes in the middle patch of a face.',
        'Kena cat 1 sisi? Kubus di bagian tengah sebuah sisi.',
      )
    default:
      return t(
        'Paint only touches the outer skin. The cubes with no paint sit inside.',
        'Cat cuma kena kulit luarnya. Kubus yang tanpa cat ada di dalam.',
      )
  }
}

/** Beat 4 for edges and faces — the pieces laid out whole, before the peel. */
function unfoldCaption(k: number, n: number, lang: Lang): string {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  if (k === 2) {
    return t(`Open up the 12 edges. Each edge is ${n} cubes long.`, `Buka 12 rusuknya. Tiap rusuk panjangnya ${n} kubus.`)
  }
  return t(`Open up the 6 faces. Each face is ${n} × ${n} cubes.`, `Buka 6 sisinya. Tiap sisi ${n} × ${n} kubus.`)
}

/** Beat 5 — the peel that earns n − 2 (or, for corners, the 4 + 4 count). */
function peelCaption(k: number, n: number, m: number, lang: Lang): string {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const one = m === 1
  switch (k) {
    case 3:
      return t('Line the corners up. There are 4 on top.', 'Deretkan sudutnya. Di atas ada 4.')
    case 2:
      return one
        ? t(
            `Both ends are corner cubes — peel them off: ${n} − 2 = 1 cube left.`,
            `Kedua ujungnya kubus sudut — buang: ${n} − 2 = 1 kubus tersisa.`,
          )
        : t(
            `Both ends are corner cubes — peel them off: ${n} − 2 = ${m} left on each edge.`,
            `Kedua ujungnya kubus sudut — buang: ${n} − 2 = ${m} tersisa di tiap rusuk.`,
          )
    case 1:
      return one
        ? t(
            `The border got 2 or 3 coats — peel it off: ${n} − 2 = 1 cube left in each middle.`,
            `Pinggirnya kena cat 2 atau 3 sisi — buang: ${n} − 2 = 1 kubus tersisa di tengah.`,
          )
        : t(
            `The border got 2 or 3 coats — peel it off: ${n} − 2 = ${m}, leaving ${m} × ${m}.`,
            `Pinggirnya kena cat 2 atau 3 sisi — buang: ${n} − 2 = ${m}, sisa ${m} × ${m}.`,
          )
    default:
      return one
        ? t(
            `Peel the painted skin off every side: ${n} − 2 = 1 cube left along each direction.`,
            `Buang kulit bercatnya di semua sisi: ${n} − 2 = 1 kubus tersisa ke tiap arah.`,
          )
        : t(
            `Peel the painted skin off every side: ${n} − 2 = ${m} cubes left along each direction.`,
            `Buang kulit bercatnya di semua sisi: ${n} − 2 = ${m} kubus tersisa ke tiap arah.`,
          )
  }
}

/** The one beat that lands the answer. */
function answerCaption(k: number, m: number, answer: number, lang: Lang): string {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const one = m === 1
  switch (k) {
    case 3:
      return t(
        `4 more underneath, so 4 + 4 = ${answer} cubes have 3 painted sides.`,
        `Di bawah ada 4 lagi, jadi 4 + 4 = ${answer} kubus kena cat 3 sisi.`,
      )
    case 2:
      return one
        ? t(
            `12 edges × 1 = ${answer} cubes have 2 painted sides.`,
            `12 rusuk × 1 = ${answer} kubus kena cat 2 sisi.`,
          )
        : t(
            `12 edges × ${m} = ${answer} cubes have 2 painted sides.`,
            `12 rusuk × ${m} = ${answer} kubus kena cat 2 sisi.`,
          )
    case 1:
      return one
        ? t(
            `6 faces × 1 = ${answer} cubes have 1 painted side.`,
            `6 sisi × 1 = ${answer} kubus kena cat 1 sisi.`,
          )
        : t(
            `6 faces × ${m} × ${m} = ${answer} cubes have 1 painted side.`,
            `6 sisi × ${m} × ${m} = ${answer} kubus kena cat 1 sisi.`,
          )
    default:
      return one
        ? t(
            `Just ${answer} cube in the very middle has no paint.`,
            `Tinggal ${answer} kubus di tengah yang tanpa cat.`,
          )
        : t(
            `${m} × ${m} × ${m} = ${answer} cubes have no paint at all.`,
            `${m} × ${m} × ${m} = ${answer} kubus tanpa cat sama sekali.`,
          )
  }
}

/**
 * G15 painted cube. A big n×n×n cube is painted all over, then cut into n³ unit
 * cubes; count the ones with exactly k painted faces.
 *
 * The storyboard goes straight at the class the question asks about and never
 * costs a beat on the other three: paint the cube → cut it open so the hidden
 * cubes show → point at where the asked class lives (corners / edge strips /
 * face middles / deep inside) → peel the painted border off each of those
 * pieces, which is what turns n − 2 from a magic number into something the
 * child watched happen → land the answer. Edges and faces get one extra beat so
 * their pieces are seen whole before the peel; corners need no peel at all and
 * instead earn their 8 as 4 on top + 4 underneath.
 */
export function buildPaintedCubeSteps(nRaw: unknown, kRaw: unknown, lang: Lang): PaintedCubeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const n = toInt(nRaw, 3, 3, 8)
  const k = toInt(kRaw, 1, 0, 3)
  const m = n - 2
  const total = n ** 3
  const groups = pieceCount(k)
  const dims = pieceDims(k)
  const answer = paintedClassCount(n, k)
  const formula = formulaFor(k, m)

  const steps: PaintedCubeStep[] = [
    {
      kind: 'intro',
      view: 'solid',
      groups: 1,
      dims: 3,
      lit: false,
      litPieces: 0,
      peel: 0,
      caption: t(
        `A ${n}×${n}×${n} cube gets paint on every outside face.`,
        `Kubus ${n}×${n}×${n} dicat di semua sisi luarnya.`,
      ),
      derivation: null,
      result: false,
      hold: 2000,
    },
    {
      kind: 'cut',
      view: 'pieces',
      groups: 1,
      dims: 3,
      lit: false,
      litPieces: 0,
      peel: 0,
      caption: t(
        `Cut it into ${total} small cubes — ${n} layers, so the hidden ones show.`,
        `Potong jadi ${total} kubus kecil — ${n} lapis, yang di dalam ikut kelihatan.`,
      ),
      derivation: null,
      result: false,
      hold: 2400,
    },
    {
      // Straight to the asked class. Everything painted is visible from outside,
      // so classes 1–3 are pointed at on the assembled cube; class 0 hides, so
      // it is pointed at inside the cut-open layers.
      kind: 'locate',
      view: k === 0 ? 'pieces' : 'solid',
      groups: 1,
      dims: 3,
      lit: true,
      litPieces: 1,
      peel: 0,
      caption: locateCaption(k, lang),
      derivation: null,
      result: false,
      hold: 2400,
    },
  ]

  // Edges and faces: show the pieces whole first, so the peel can be watched.
  if (dims === 1 || dims === 2) {
    steps.push({
      kind: 'unfold',
      view: 'pieces',
      groups,
      dims,
      lit: false,
      litPieces: 0,
      peel: 0,
      caption: unfoldCaption(k, n, lang),
      derivation: null,
      result: false,
      hold: 2200,
    })
  }

  steps.push({
    kind: k === 3 ? 'gather' : 'peel',
    view: 'pieces',
    groups,
    dims,
    lit: true,
    // Corners are earned as 4 on top now, 4 underneath on the answer beat.
    litPieces: k === 3 ? 4 : groups,
    peel: k === 3 ? 0 : 1,
    caption: peelCaption(k, n, m, lang),
    derivation: k === 3 ? null : `${n} − 2 = ${m}`,
    result: false,
    hold: 2800,
  })

  steps.push({
    kind: 'answer',
    view: 'pieces',
    groups,
    dims,
    lit: true,
    litPieces: groups,
    peel: k === 3 ? 0 : 2,
    caption: answerCaption(k, m, answer, lang),
    derivation: `${formula} = ${answer}`,
    result: true,
    hold: 0,
  })

  return {
    n,
    k,
    m,
    total,
    answer,
    groups,
    dims,
    label: t(LABELS[k][0], LABELS[k][1]),
    pieceWord: t(PIECE_WORDS[k][0], PIECE_WORDS[k][1]),
    formula,
    steps,
    finalIndex: steps.length - 1,
  }
}
