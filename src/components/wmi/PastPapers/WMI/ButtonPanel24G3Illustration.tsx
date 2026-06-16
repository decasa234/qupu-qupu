// Button-panel illustration for WMI-24F3A-Q20 (2024 Grade-3 Final).
// Reconstructed from db/seed/wmi/figures/2024-final-g3-a-q20.jpg.
//
// NOTE: only the five button-RULE rows are captured in the scan. The problem's
// "initial figure" and "target figure" were NOT in the available image, so this
// component draws the button-rule chart only — it does not invent the start/end
// figures. Data constants are exported so the explainer/animator bind to the
// same rules (anti-drift).

const INK = '#1F2937'

// Shape palette transcribed from the scan (purple square, orange hexagon,
// red circle). These specific hues carry meaning in the rules, so literal
// values are used here as in the batch-2 puzzle figures.
const PURPLE = '#7C6FB0'
const PURPLE_EDGE = '#4B4378'
const ORANGE = '#E8821E'
const ORANGE_EDGE = '#A85A0C'
const RED = '#E02828'
const RED_EDGE = '#9E1414'

export type ShapeKind = 'square' | 'hexagon' | 'circle'

// The five button rules, read off the scan:
//   1: purple square        -> red circle, red circle
//   2: orange hexagon       -> purple square, purple square
//   3: purple square, red circle -> orange hexagon
//   4: orange hexagon, orange hexagon -> purple square, red circle, red circle
//   5: red circle, red circle, red circle -> (nothing / removed)
export const BUTTON_RULES24: Array<{
  id: number
  from: ShapeKind[]
  to: ShapeKind[] // empty = the shapes are removed (crossed out in the scan)
}> = [
  { id: 1, from: ['square'], to: ['circle', 'circle'] },
  { id: 2, from: ['hexagon'], to: ['square', 'square'] },
  { id: 3, from: ['square', 'circle'], to: ['hexagon'] },
  { id: 4, from: ['hexagon', 'hexagon'], to: ['square', 'circle', 'circle'] },
  { id: 5, from: ['circle', 'circle', 'circle'], to: [] },
]

/* ---------- primitive: a single transformation shape ---------- */
export function ButtonShape({ kind, x, y, r = 16 }: { kind: ShapeKind; x: number; y: number; r?: number }) {
  if (kind === 'circle') {
    return <circle cx={x} cy={y} r={r} fill={RED} stroke={RED_EDGE} strokeWidth={2} />
  }
  if (kind === 'hexagon') {
    // flat-top hexagon, matching the scan's orientation
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60) * (Math.PI / 180)
      return `${(x + Math.cos(a) * r).toFixed(2)},${(y + Math.sin(a) * r).toFixed(2)}`
    }).join(' ')
    return <polygon points={pts} fill={ORANGE} stroke={ORANGE_EDGE} strokeWidth={2} />
  }
  // rounded square
  return <rect x={x - r} y={y - r} width={2 * r} height={2 * r} rx={5} fill={PURPLE} stroke={PURPLE_EDGE} strokeWidth={2} />
}

/* ---------- the five-row button-rule chart ---------- */
export function ButtonPanel24Figure() {
  const ROW_H = 60
  const PAD_TOP = 14
  const LABEL_X = 26 // centre of the numbered label box
  const FROM_X0 = 78 // first "from" shape centre
  const ARROW_X = 196 // arrow centre
  const TO_X0 = 252 // first "to" shape centre
  const STEP = 40 // horizontal spacing between shapes in a group
  const R = 16
  const width = 440
  const height = PAD_TOP * 2 + BUTTON_RULES24.length * ROW_H

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {BUTTON_RULES24.map((rule, i) => {
        const cy = PAD_TOP + i * ROW_H + ROW_H / 2
        const removed = rule.to.length === 0
        return (
          <g key={rule.id}>
            {/* numbered label box */}
            <rect x={LABEL_X - 16} y={cy - 16} width={32} height={32} rx={4} fill="#FFF6CC" stroke="#D9B23A" strokeWidth={2} />
            <text x={LABEL_X} y={cy + 1} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={900} fill={INK} className="font-display">
              {rule.id}
            </text>
            <text x={LABEL_X + 24} y={cy + 1} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={900} fill={INK}>
              :
            </text>

            {/* "from" shapes */}
            {rule.from.map((k, j) => (
              <ButtonShape key={`f-${j}`} kind={k} x={FROM_X0 + j * STEP} y={cy} r={R} />
            ))}

            {/* arrow */}
            <g>
              <line x1={ARROW_X - 16} y1={cy} x2={ARROW_X + 8} y2={cy} stroke={INK} strokeWidth={6} strokeLinecap="round" />
              <polygon points={`${ARROW_X + 16},${cy} ${ARROW_X + 4},${cy - 9} ${ARROW_X + 4},${cy + 9}`} fill={INK} />
            </g>

            {/* "to" shapes (or the removed/crossed-out shapes for button 5) */}
            {removed
              ? rule.from.map((k, j) => (
                  <g key={`x-${j}`}>
                    <ButtonShape kind={k} x={TO_X0 + j * STEP} y={cy} r={R} />
                  </g>
                ))
              : rule.to.map((k, j) => <ButtonShape key={`t-${j}`} kind={k} x={TO_X0 + j * STEP} y={cy} r={R} />)}

            {/* single bold cross-out over the whole "to" group for button 5 */}
            {removed && (
              <g stroke="#3A3A3A" strokeWidth={6} strokeLinecap="round">
                <line x1={TO_X0 - R - 6} y1={cy - R - 6} x2={TO_X0 + (rule.from.length - 1) * STEP + R + 6} y2={cy + R + 6} />
                <line x1={TO_X0 - R - 6} y1={cy + R + 6} x2={TO_X0 + (rule.from.length - 1) * STEP + R + 6} y2={cy - R - 6} />
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function ButtonPanel24G3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Lima tombol berlabel 1 sampai 5 dengan aturan perubahan bentuk. Tombol 1: kotak ungu menjadi dua lingkaran merah. Tombol 2: segi enam oranye menjadi dua kotak ungu. Tombol 3: kotak ungu dan lingkaran merah menjadi satu segi enam oranye. Tombol 4: dua segi enam oranye menjadi satu kotak ungu dan dua lingkaran merah. Tombol 5: tiga lingkaran merah dihapus (dicoret). Gambar awal dan gambar target tidak tersedia pada pindaian."
    >
      <ButtonPanel24Figure />
    </div>
  )
}

export default ButtonPanel24G3Illustration
