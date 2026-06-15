// In-card SVG illustration for WMI-25F2A-Q23 (2025 Grade-2 Final).
//
// Problem: 7 football players stand in a row wearing jerseys numbered 1–7.
// Four reporters photograph subsets of the row but lighting hides some numbers:
//
//   Photo A: 7  ?  5    (3 consecutive players)
//   Photo B: 6  4        (2 consecutive players)
//   Photo C: 1  ?  ?  7 (4 consecutive players)
//   Photo D: 7  3        (2 consecutive players)
//
// The static figure draws ONLY the four photo panels with their given/hidden
// jersey numbers.  It NEVER reveals the full left-to-right order (6 1 2 4 7 3 5)
// — that is the animator/explainer's job after the learner has answered.
//
// Export shape:
//   default export  → Jerseys25G2Illustration()          — in-card problem figure
//   JERSEY_PHOTOS   → typed description of each photo    — for the explainer
//   JERSEYS_SOLUTION→ full order left-to-right           — for the explainer
//   JerseyPhotoFigure → primitive that can show a photo  — for step-by-step reveal
//
// Pure render: no Math.random, no Date, SSR-safe, deterministic.

const JERSEY_CREAM = '#FFF8F0'        // qupu-cream approximate
const JERSEY_STROKE = '#E07320'       // qupu-brand-orange approximate
const JERSEY_HIDDEN_FILL = '#D1D5DB'  // grey for hidden number cell
const JERSEY_HIDDEN_STROKE = '#9CA3AF'
const LABEL_FILL = '#2563EB'          // qupu-brand-blue approximate for given numbers
const PHOTO_BG = '#F0F4FF'
const PHOTO_BORDER = '#93C5FD'
const PHOTO_LABEL_FILL = '#1E40AF'

// ── Data ─────────────────────────────────────────────────────────────────────

/** Each slot is either a known jersey number or null (hidden / question-mark). */
export interface JerseySlot {
  number: number | null
}

export interface JerseyPhoto {
  label: string   // 'A' | 'B' | 'C' | 'D'
  slots: JerseySlot[]
}

/**
 * The four partial photos as given in the problem.
 * null = hidden (shown as "?").  The static figure shows exactly these.
 */
export const JERSEY_PHOTOS: readonly JerseyPhoto[] = [
  { label: 'A', slots: [{ number: 7 }, { number: null }, { number: 5 }] },
  { label: 'B', slots: [{ number: 6 }, { number: 4 }] },
  { label: 'C', slots: [{ number: 1 }, { number: null }, { number: null }, { number: 7 }] },
  { label: 'D', slots: [{ number: 7 }, { number: 3 }] },
] as const

/**
 * Full left-to-right jersey order — for the explainer / reveal animation.
 * Never rendered by the static in-card figure.
 */
export const JERSEYS_SOLUTION: readonly number[] = [6, 1, 2, 4, 7, 3, 5] as const

// ── Jersey glyph ─────────────────────────────────────────────────────────────

const JW = 36   // jersey width
const JH = 42   // jersey height
const J_GAP = 8 // gap between jerseys in one photo

/**
 * A single jersey shape centred at (cx, cy).
 *
 * The shape is a simplified football shirt:
 *   - rectangular body
 *   - small V-neck cut at top centre
 *   - two short sleeve stubs on the sides
 * If `revealed` is provided it overrides the problem slot (used by the explainer).
 */
export function JerseyGlyph({
  cx,
  cy,
  value,
  revealed,
}: {
  cx: number
  cy: number
  value: number | null
  revealed?: number | null
}) {
  const displayValue = revealed !== undefined ? revealed : value
  const isHidden = displayValue === null

  // Body rectangle (the shirt torso)
  const bx = cx - JW / 2
  const by = cy - JH / 2
  const bw = JW
  const bh = JH

  // Sleeve stubs
  const sleeveW = 9
  const sleeveH = 11
  const sleeveY = by + 4

  // V-neck: a small triangle cut from the top-centre
  const neckDepth = 8
  const neckHalfW = 7
  const neckPath = `M ${cx - neckHalfW} ${by} L ${cx} ${by + neckDepth} L ${cx + neckHalfW} ${by} Z`

  const bodyFill = isHidden ? JERSEY_HIDDEN_FILL : JERSEY_CREAM
  const bodyStroke = isHidden ? JERSEY_HIDDEN_STROKE : JERSEY_STROKE

  return (
    <g>
      {/* Left sleeve */}
      <rect
        x={bx - sleeveW + 2}
        y={sleeveY}
        width={sleeveW}
        height={sleeveH}
        rx={2}
        fill={bodyFill}
        stroke={bodyStroke}
        strokeWidth={1.8}
      />
      {/* Right sleeve */}
      <rect
        x={bx + bw - 2}
        y={sleeveY}
        width={sleeveW}
        height={sleeveH}
        rx={2}
        fill={bodyFill}
        stroke={bodyStroke}
        strokeWidth={1.8}
      />
      {/* Shirt body */}
      <rect
        x={bx}
        y={by}
        width={bw}
        height={bh}
        rx={4}
        fill={bodyFill}
        stroke={bodyStroke}
        strokeWidth={2}
      />
      {/* V-neck cutout (white) */}
      <path d={neckPath} fill="white" />
      {/* Jersey number or question mark */}
      {isHidden ? (
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
          fontWeight={900}
          fill={JERSEY_HIDDEN_STROKE}
        >
          ?
        </text>
      ) : (
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={displayValue !== null && displayValue >= 10 ? 13 : 16}
          fontWeight={900}
          fill={LABEL_FILL}
        >
          {displayValue}
        </text>
      )}
    </g>
  )
}

// ── Photo panel ──────────────────────────────────────────────────────────────

const PHOTO_PAD_X = 10
const PHOTO_PAD_TOP = 24   // room for the "Photo X" label
const PHOTO_PAD_BOT = 8
const PHOTO_CORNER = 6

/** Width of a single photo panel given the number of jerseys. */
function photoPanelWidth(slotCount: number): number {
  return PHOTO_PAD_X * 2 + slotCount * JW + (slotCount - 1) * J_GAP
}

/** Height of a photo panel. */
const PHOTO_PANEL_H = PHOTO_PAD_TOP + JH + PHOTO_PAD_BOT

/**
 * One photo panel (label + jersey row).
 * Translated to its correct position by the caller.
 *
 * Pass `revealedSlots` to override specific slots (for explainer animations).
 * Each entry in `revealedSlots` maps a slot index to a number or null.
 */
export function JerseyPhotoFigure({
  photo,
  revealedSlots,
}: {
  photo: JerseyPhoto
  revealedSlots?: Partial<Record<number, number | null>>
}) {
  const panelW = photoPanelWidth(photo.slots.length)

  return (
    <g>
      {/* Panel background */}
      <rect
        x={0}
        y={0}
        width={panelW}
        height={PHOTO_PANEL_H}
        rx={PHOTO_CORNER}
        fill={PHOTO_BG}
        stroke={PHOTO_BORDER}
        strokeWidth={1.8}
      />
      {/* "Foto X" label */}
      <text
        x={panelW / 2}
        y={11}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fill={PHOTO_LABEL_FILL}
      >
        {`Foto ${photo.label}`}
      </text>
      {/* Jersey row */}
      {photo.slots.map((slot, i) => {
        const jcx = PHOTO_PAD_X + i * (JW + J_GAP) + JW / 2
        const jcy = PHOTO_PAD_TOP + JH / 2
        const revealed = revealedSlots?.[i]
        return (
          <JerseyGlyph
            key={i}
            cx={jcx}
            cy={jcy}
            value={slot.number}
            revealed={revealed}
          />
        )
      })}
    </g>
  )
}

// ── Main illustration ─────────────────────────────────────────────────────────

// Layout: two rows of two panels, centred.
//   Row 0: Photo A (3 jerseys)   Photo B (2 jerseys)
//   Row 1: Photo C (4 jerseys)   Photo D (2 jerseys)

const ROW_GAP = 14   // vertical gap between panel rows
const COL_GAP = 14   // horizontal gap between panels in the same row

// Photo A: 3 jerseys, Photo B: 2 jerseys, Photo C: 4 jerseys, Photo D: 2 jerseys
const panelWidths = JERSEY_PHOTOS.map((p) => photoPanelWidth(p.slots.length))
// [0]=A(3), [1]=B(2), [2]=C(4), [3]=D(2)

// Row widths
const row0W = panelWidths[0] + COL_GAP + panelWidths[1]  // A + gap + B
const row1W = panelWidths[2] + COL_GAP + panelWidths[3]  // C + gap + D
const SVG_W_INNER = Math.max(row0W, row1W)

const SIDE_PAD = 12
const TOP_PAD = 10
const BOT_PAD = 10

const SVG_W = SIDE_PAD * 2 + SVG_W_INNER
const SVG_H = TOP_PAD + PHOTO_PANEL_H + ROW_GAP + PHOTO_PANEL_H + BOT_PAD

// Centre each row within SVG_W_INNER
const row0OffsetX = SIDE_PAD + (SVG_W_INNER - row0W) / 2
const row1OffsetX = SIDE_PAD + (SVG_W_INNER - row1W) / 2

export default function Jerseys25G2Illustration() {
  const ariaLabel =
    'Empat foto pemain sepak bola berderet. Foto A: jersey 7, tanda tanya, 5. Foto B: jersey 6, 4. Foto C: jersey 1, tanda tanya, tanda tanya, 7. Foto D: jersey 7, 3. Tentukan urutan tujuh nomor jersey dari kiri ke kanan.'

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* Row 0 — Photo A and Photo B */}
        <g transform={`translate(${row0OffsetX}, ${TOP_PAD})`}>
          {/* Photo A */}
          <JerseyPhotoFigure photo={JERSEY_PHOTOS[0]} />
          {/* Photo B */}
          <g transform={`translate(${panelWidths[0] + COL_GAP}, 0)`}>
            <JerseyPhotoFigure photo={JERSEY_PHOTOS[1]} />
          </g>
        </g>

        {/* Row 1 — Photo C and Photo D */}
        <g transform={`translate(${row1OffsetX}, ${TOP_PAD + PHOTO_PANEL_H + ROW_GAP})`}>
          {/* Photo C */}
          <JerseyPhotoFigure photo={JERSEY_PHOTOS[2]} />
          {/* Photo D */}
          <g transform={`translate(${panelWidths[2] + COL_GAP}, 0)`}>
            <JerseyPhotoFigure photo={JERSEY_PHOTOS[3]} />
          </g>
        </g>
      </svg>
    </div>
  )
}
