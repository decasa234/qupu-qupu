export type Lang = 'en' | 'id'

export type ShapeGlyph = '▲' | '▶' | '■'
export type Transform = 'turn' | 'flip'

export interface ShapeTransformParams {
  shape: ShapeGlyph
  transform: Transform
}

// ─── transform lookup tables ─────────────────────────────────────────────────

const TURN: Record<string, string> = { '▲': '▶', '▶': '▼', '■': '■' }
const FLIP: Record<string, string> = { '▲': '▼', '▶': '◀', '■': '■' }

// ─── step types ──────────────────────────────────────────────────────────────

export interface ShapeTransformStep {
  /** Which beat phase this is. */
  phase: 'show' | 'transform' | 'result'
  /** The glyph being shown on screen (source or result). */
  displayGlyph: string
  /** CSS rotate to apply to the glyph (degrees, for 'turn' transform beat). */
  rotateDeg: number
  /** Whether to apply scaleX: -1 (mirror, for 'flip' transform beat). */
  mirrored: boolean
  caption: string
  /** Hold duration in ms. 0 = final (paused). */
  hold: number
  result: boolean
}

export interface ShapeTransformStoryboard {
  shape: string
  transform: string
  resultGlyph: string
  steps: ShapeTransformStep[]
  finalIndex: number
}

// ─── builder ─────────────────────────────────────────────────────────────────

const SHAPE_NAME_EN: Record<string, string> = {
  '▲': 'up-triangle',
  '▶': 'right-triangle',
  '■': 'square',
}
const SHAPE_NAME_ID: Record<string, string> = {
  '▲': 'segitiga atas',
  '▶': 'segitiga kanan',
  '■': 'kotak',
}

/**
 * Builds the shape-transformation animation storyboard.
 *
 * Beats:
 *   0 – show source shape + name the rule
 *   1 – animate the turn (rotate) or flip (mirror) operation
 *   2 – result beat: resulting shape highlighted green
 *
 * Defensive: unknown shape/transform → single result beat with glyph '?'.
 */
export function buildShapeTransformSteps(
  shape: string,
  transform: string,
  lang: Lang,
): ShapeTransformStoryboard {
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)

  // Defensive: resolve result glyph
  const table = transform === 'turn' ? TURN : transform === 'flip' ? FLIP : {}
  const resultGlyph: string = table[shape] ?? '?'
  const shapeName = lang === 'id' ? (SHAPE_NAME_ID[shape] ?? shape) : (SHAPE_NAME_EN[shape] ?? shape)

  // Defensive fallback: unknown shape or transform
  if (!(shape in SHAPE_NAME_EN) || (transform !== 'turn' && transform !== 'flip')) {
    const fallback: ShapeTransformStep = {
      phase: 'result',
      displayGlyph: resultGlyph,
      rotateDeg: 0,
      mirrored: false,
      caption: t(`Result: ${resultGlyph}`, `Hasil: ${resultGlyph}`),
      hold: 0,
      result: true,
    }
    return { shape, transform, resultGlyph, steps: [fallback], finalIndex: 0 }
  }

  const ruleLabel =
    transform === 'turn'
      ? t('turn one step clockwise', 'putar satu langkah searah jarum jam')
      : t('flip to the opposite direction', 'balik ke arah berlawanan')

  const steps: ShapeTransformStep[] = []

  // Beat 0 – show source shape
  steps.push({
    phase: 'show',
    displayGlyph: shape,
    rotateDeg: 0,
    mirrored: false,
    caption: t(
      `Rule: ${ruleLabel}. Start with ${shapeName}.`,
      `Aturan: ${ruleLabel}. Mulai dengan ${shapeName}.`,
    ),
    hold: 1800,
    result: false,
  })

  // Beat 1 – animate the transform
  steps.push({
    phase: 'transform',
    displayGlyph: shape,
    rotateDeg: transform === 'turn' ? 90 : 0,
    mirrored: transform === 'flip',
    caption:
      transform === 'turn'
        ? t('Turning 90° clockwise...', 'Memutar 90° searah jarum jam...')
        : t('Flipping to opposite side...', 'Membalik ke sisi berlawanan...'),
    hold: 1400,
    result: false,
  })

  // Beat 2 – result
  steps.push({
    phase: 'result',
    displayGlyph: resultGlyph,
    rotateDeg: 0,
    mirrored: false,
    caption: t(`Result: ${shape} becomes ${resultGlyph}`, `Hasil: ${shape} menjadi ${resultGlyph}`),
    hold: 0,
    result: true,
  })

  return { shape, transform, resultGlyph, steps, finalIndex: steps.length - 1 }
}
