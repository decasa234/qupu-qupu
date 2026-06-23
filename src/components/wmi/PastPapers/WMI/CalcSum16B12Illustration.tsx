// CalcSum16B12Illustration.tsx
//
// Stem illustration for SEAMO-16-B-Q12:
//   "Emma adds up the sum of 1 + 2 + 3 + 4 + ··· on a calculator.
//    When she reaches the sum of 305, she realizes that she had forgotten
//    to add one number. What is the number?"
//   Answer: E (20)  →  1+2+…+25 = 325, and 325 − 305 = 20
//
// The figure shows:
//   • A calculator body with the display reading "305" (Emma's erroneous total)
//   • A partial sum strip: 1 + 2 + 3 + … + 25 showing the expected total (325)
//     with the gap labelled "?" to represent the skipped number
//   • A small annotation indicating the correct sum vs. Emma's sum
//
// Pure render — no framer-motion, no hooks. SSR-safe.

// ── Layout constants ──────────────────────────────────────────────────────────

export const SVG_W = 340
export const SVG_H = 240

// Colours (all bound to seed quantities)
const CALC_BODY   = '#374151'   // dark grey body
const CALC_FACE   = '#1F2937'   // bezel
const DISPLAY_BG  = '#BBF7D0'   // green LCD background
const DISPLAY_INK = '#064E3B'   // dark green digit ink
const KEY_FILL    = '#6B7280'
const KEY_INK     = '#F9FAFB'
const KEY_OPER    = '#F97316'
const ORANGE      = '#EA580C'
const ORANGE_BG   = '#FFF7ED'
const GREEN       = '#065F46'
const GREEN_BG    = '#D1FAE5'
const GREEN_BORDER = '#10B981'
const BLUE        = '#2563EB'
const BLUE_BG     = '#EFF6FF'
const INK         = '#1F2937'
const MUTED       = '#9CA3AF'
const RED         = '#DC2626'

// ── Calculator body ───────────────────────────────────────────────────────────

/** The left-hand calculator: body + display + basic key grid */
export function Calculator() {
  const bx = 18   // body left
  const by = 14   // body top
  const bw = 118  // body width
  const bh = 200  // body height
  const br = 10   // corner radius

  // Display region
  const dx = bx + 8
  const dy = by + 10
  const dw = bw - 16
  const dh = 42

  // Key grid: 4 cols × 4 rows of small buttons
  const kStartX = bx + 8
  const kStartY = dy + dh + 12
  const kW = 22
  const kH = 16
  const kGapX = 5
  const kGapY = 6

  // Key labels (decorative only)
  const keyRows = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '−'],
    ['0', '.', '=', '+'],
  ]

  return (
    <g>
      {/* Calculator body */}
      <rect x={bx} y={by} width={bw} height={bh} rx={br} fill={CALC_BODY} />

      {/* Inner bezel */}
      <rect x={bx + 4} y={by + 4} width={bw - 8} height={bh - 8} rx={br - 2} fill={CALC_FACE} />

      {/* Display */}
      <rect x={dx} y={dy} width={dw} height={dh} rx={4} fill={DISPLAY_BG} />

      {/* Expression line: 1 + 2 + … (small, top of display) */}
      <text
        x={dx + dw - 4}
        y={dy + 14}
        textAnchor="end"
        fontFamily="'Courier New', Courier, monospace"
        fontWeight={400}
        fontSize={9}
        fill={DISPLAY_INK}
        opacity={0.7}
      >
        1 + 2 + 3 + … (skipped one)
      </text>

      {/* Main display number: 305 */}
      <text
        x={dx + dw - 5}
        y={dy + dh - 7}
        textAnchor="end"
        fontFamily="'Courier New', Courier, monospace"
        fontWeight={700}
        fontSize={24}
        fill={DISPLAY_INK}
        letterSpacing={2}
      >
        305
      </text>

      {/* Key grid */}
      {keyRows.map((row, ri) =>
        row.map((label, ci) => {
          const kx = kStartX + ci * (kW + kGapX)
          const ky = kStartY + ri * (kH + kGapY)
          const isOper = ['÷', '×', '−', '+', '='].includes(label)
          return (
            <g key={`${ri}-${ci}`}>
              <rect
                x={kx} y={ky} width={kW} height={kH} rx={3}
                fill={isOper ? KEY_OPER : KEY_FILL}
              />
              <text
                x={kx + kW / 2}
                y={ky + kH / 2 + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="system-ui, sans-serif"
                fontWeight={700}
                fontSize={9}
                fill={KEY_INK}
              >
                {label}
              </text>
            </g>
          )
        })
      )}

      {/* Brand label */}
      <text
        x={bx + bw / 2}
        y={by + bh - 10}
        textAnchor="middle"
        dominantBaseline="auto"
        fontFamily="system-ui, sans-serif"
        fontWeight={700}
        fontSize={8}
        fill={MUTED}
        letterSpacing={2}
      >
        CALC
      </text>
    </g>
  )
}

// ── Right-side annotation panel ───────────────────────────────────────────────

/** Shows:
 *    Expected: 1 + 2 + … + 25 = 325
 *    Emma got:              305
 *    Missing:             ? = 20
 */
export function SumAnnotation() {
  const panelX = 156
  const panelY = 16

  // Row 1: correct triangular sum
  const row1Y = panelY + 20
  // Row 2: Emma's actual sum
  const row2Y = row1Y + 44
  // Row 3: the missing number
  const row3Y = row2Y + 44

  return (
    <g>
      {/* ── Row 1: Correct sum ──────────────────────── */}
      <rect
        x={panelX} y={panelY}
        width={SVG_W - panelX - 10}
        height={38}
        rx={6}
        fill={GREEN_BG}
        stroke={GREEN_BORDER}
        strokeWidth={1.5}
      />
      <text
        x={panelX + 8}
        y={panelY + 11}
        dominantBaseline="auto"
        fontFamily="system-ui, sans-serif"
        fontWeight={800}
        fontSize={9}
        fill={GREEN}
      >
        Seharusnya (n=25):
      </text>
      <text
        x={panelX + 8}
        y={panelY + 28}
        dominantBaseline="auto"
        fontFamily="'Courier New', Courier, monospace"
        fontWeight={700}
        fontSize={13}
        fill={GREEN}
      >
        1+…+25 = 325
      </text>

      {/* ── Row 2: Emma's sum ──────────────────────── */}
      <rect
        x={panelX} y={row2Y - 10}
        width={SVG_W - panelX - 10}
        height={38}
        rx={6}
        fill={ORANGE_BG}
        stroke={ORANGE}
        strokeWidth={1.5}
      />
      <text
        x={panelX + 8}
        y={row2Y}
        dominantBaseline="auto"
        fontFamily="system-ui, sans-serif"
        fontWeight={800}
        fontSize={9}
        fill={ORANGE}
      >
        Hasil Emma (ada yang terlewat):
      </text>
      <text
        x={panelX + 8}
        y={row2Y + 17}
        dominantBaseline="auto"
        fontFamily="'Courier New', Courier, monospace"
        fontWeight={700}
        fontSize={13}
        fill={ORANGE}
      >
        305
      </text>

      {/* Arrow down between row1 and row2 */}
      <text
        x={panelX + (SVG_W - panelX - 10) / 2}
        y={row2Y - 14}
        textAnchor="middle"
        dominantBaseline="auto"
        fontFamily="system-ui, sans-serif"
        fontSize={11}
        fill={MUTED}
      >
        ↕
      </text>

      {/* ── Row 3: Missing number ──────────────────── */}
      <rect
        x={panelX} y={row3Y - 8}
        width={SVG_W - panelX - 10}
        height={38}
        rx={6}
        fill={BLUE_BG}
        stroke={BLUE}
        strokeWidth={1.5}
      />
      <text
        x={panelX + 8}
        y={row3Y + 2}
        dominantBaseline="auto"
        fontFamily="system-ui, sans-serif"
        fontWeight={800}
        fontSize={9}
        fill={BLUE}
      >
        Bilangan terlewat:
      </text>
      <text
        x={panelX + 8}
        y={row3Y + 19}
        dominantBaseline="auto"
        fontFamily="'Courier New', Courier, monospace"
        fontWeight={700}
        fontSize={13}
        fill={BLUE}
      >
        325 − 305 = ?
      </text>

      {/* ── Number line strip: 1 2 3 … ? … 25 ──── */}
      {(() => {
        const stripY = row3Y + 52
        const stripX = panelX
        const stripW = SVG_W - panelX - 10
        const boxW = 20
        const boxH = 16
        const gap = 2
        const leftNums  = ['1', '2', '3']
        const rightNums = ['24', '25']

        // left boxes
        const leftBoxes = leftNums.map((n, i) => {
          const bx2 = stripX + i * (boxW + gap)
          return (
            <g key={`L${n}`}>
              <rect x={bx2} y={stripY} width={boxW} height={boxH} rx={3}
                fill={BLUE_BG} stroke={BLUE} strokeWidth={1} />
              <text
                x={bx2 + boxW / 2} y={stripY + boxH / 2 + 1}
                textAnchor="middle" dominantBaseline="central"
                fontFamily="system-ui, sans-serif" fontWeight={700} fontSize={9} fill={BLUE}
              >{n}</text>
            </g>
          )
        })

        // ellipsis
        const ellX = stripX + leftNums.length * (boxW + gap) + 2
        const ellipsis = (
          <text
            key="ell"
            x={ellX + 5} y={stripY + boxH / 2 + 1}
            textAnchor="start" dominantBaseline="central"
            fontFamily="system-ui, sans-serif" fontWeight={700} fontSize={12} fill={MUTED}
          >…</text>
        )

        // ? box
        const qX = ellX + 14
        const qBox = (
          <g key="Q">
            <rect x={qX} y={stripY} width={boxW} height={boxH} rx={3}
              fill={RED + '22'} stroke={RED} strokeWidth={1.5} strokeDasharray="3 2" />
            <text
              x={qX + boxW / 2} y={stripY + boxH / 2 + 1}
              textAnchor="middle" dominantBaseline="central"
              fontFamily="system-ui, sans-serif" fontWeight={700} fontSize={11} fill={RED}
            >?</text>
          </g>
        )

        // ellipsis 2
        const ell2X = qX + boxW + 2
        const ell2 = (
          <text
            key="ell2"
            x={ell2X + 3} y={stripY + boxH / 2 + 1}
            textAnchor="start" dominantBaseline="central"
            fontFamily="system-ui, sans-serif" fontWeight={700} fontSize={12} fill={MUTED}
          >…</text>
        )

        // right boxes
        const rightStart = ell2X + 12
        const rightBoxes = rightNums.map((n, i) => {
          const bx2 = rightStart + i * (boxW + gap + 4)
          return (
            <g key={`R${n}`}>
              <rect x={bx2} y={stripY} width={boxW + 4} height={boxH} rx={3}
                fill={BLUE_BG} stroke={BLUE} strokeWidth={1} />
              <text
                x={bx2 + (boxW + 4) / 2} y={stripY + boxH / 2 + 1}
                textAnchor="middle" dominantBaseline="central"
                fontFamily="system-ui, sans-serif" fontWeight={700} fontSize={9} fill={BLUE}
              >{n}</text>
            </g>
          )
        })

        return (
          <g key="strip">
            {leftBoxes}
            {ellipsis}
            {qBox}
            {ell2}
            {rightBoxes}
            {/* strip label */}
            <text
              x={stripX}
              y={stripY - 5}
              dominantBaseline="auto"
              fontFamily="system-ui, sans-serif"
              fontWeight={700}
              fontSize={8}
              fill={BLUE}
            >
              Urutan Emma (ada 1 kotak terlewat):
            </text>
          </g>
        )
      })()}
    </g>
  )
}

// ── Main illustration ─────────────────────────────────────────────────────────

/** Exported params for the explainer to bind to */
export const PARAMS = {
  emmaSum:      305,
  correctN:     25,
  correctSum:   325,   // 25 × 26 / 2
  skippedNum:   20,    // 325 − 305
} as const

/**
 * CalcSum16B12Illustration
 *
 * Static stem figure for SEAMO-16-B-Q12.
 * Shows a calculator displaying Emma's wrong total (305), with an annotation
 * panel explaining: correct n=25 sum is 325; Emma got 305; missing = 325−305 = ?
 */
export default function CalcSum16B12Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Kalkulator menampilkan angka 305. Emma menjumlahkan 1+2+3+…+25 yang seharusnya menghasilkan 325, ' +
        'tetapi dia melewati satu bilangan sehingga mendapat 305. Bilangan yang terlewat adalah 325−305 = 20.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* White canvas */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* Left: Calculator */}
        <Calculator />

        {/* Right: Annotation panel */}
        <SumAnnotation />
      </svg>
    </div>
  )
}
