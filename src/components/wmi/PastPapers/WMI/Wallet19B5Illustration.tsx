// SEAMO-19-B-Q5 — "Sam has 63 $2 and $5 notes; total $171. How many $5?"
//
// Reconstructed from OCR img 003.jpg: a brown wallet with banknotes sticking out.
// The stem illustration shows the PROBLEM ONLY (no answer). Two note types are
// labelled $2 and $5 inside the wallet, with 63-note and $171 constraints shown
// in a banner below the wallet.
//
// No primitive matches "wallet + mixed banknotes" — fresh SVG.
// SSR-safe: no hooks, no framer-motion, no Math.random/Date.now.

export const TOTAL_NOTES = 63
export const TOTAL_VALUE = 171
export const FIVE_NOTES = 15   // the answer (for the explainer to bind to)
export const TWO_NOTES = TOTAL_NOTES - FIVE_NOTES  // 48

// Colour tokens
const WALLET_BODY = '#C0622A'
const WALLET_DARK = '#8B3D10'
const WALLET_HIGHLIGHT = '#E07840'
const NOTE_GREEN = '#4CAF50'
const NOTE_DARK = '#2E7D32'
const NOTE_BLUE = '#1565C0'
const NOTE_BLUE_DARK = '#0D47A1'
const INK = '#1F2937'
const LABEL_BG = '#FFF8E7'
const LABEL_BORDER = '#C0622A'

interface WalletNoteProps {
  x: number; y: number; w: number; h: number; tilt: number; color: string; colorDark: string; label: string
}
function WalletNote({ x, y, w, h, tilt, color, colorDark, label }: WalletNoteProps) {
  return (
    <g transform={`rotate(${tilt} ${x + w / 2} ${y + h})`}>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={color} stroke={colorDark} strokeWidth={1.5} />
      {/* inner border lines */}
      <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} rx={2} fill="none" stroke={colorDark} strokeWidth={0.8} opacity={0.5} />
      {/* centre portrait oval */}
      <ellipse cx={x + w / 2} cy={y + h / 2} rx={9} ry={11} fill={colorDark} opacity={0.18} />
      {/* denomination label */}
      <text
        x={x + w / 2} y={y + h / 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize={13} fontWeight={900} fill={colorDark}
      >{label}</text>
    </g>
  )
}

export const VIEW_W = 340
export const VIEW_H = 230

export interface WalletDiagramProps {
  /** Show answer annotation (15 × $5, 48 × $2). Default false (stem). */
  showAnswer?: boolean
  /** Highlight note row: 'fives' | 'twos' | null */
  highlight?: 'fives' | 'twos' | null
}

export function WalletDiagram({ showAnswer = false, highlight = null }: WalletDiagramProps) {
  // Wallet body occupies the upper ~60% of the viewBox
  const wX = 50, wY = 20, wW = 240, wH = 110

  // Notes sticking up from the wallet — 4 notes, alternating $2/$5
  const noteW = 52, noteH = 70
  const notes = [
    { x: wX + 14,  y: wY - 44, w: noteW, h: noteH, tilt: -6,  color: NOTE_BLUE,  colorDark: NOTE_BLUE_DARK,  label: '$2' },
    { x: wX + 62,  y: wY - 52, w: noteW, h: noteH, tilt: -2,  color: NOTE_GREEN, colorDark: NOTE_DARK, label: '$5' },
    { x: wX + 114, y: wY - 56, w: noteW, h: noteH, tilt:  2,  color: NOTE_GREEN, colorDark: NOTE_DARK, label: '$5' },
    { x: wX + 162, y: wY - 46, w: noteW, h: noteH, tilt:  6,  color: NOTE_BLUE,  colorDark: NOTE_BLUE_DARK,  label: '$2' },
  ]

  const fiveHighlight = highlight === 'fives'
  const twoHighlight  = highlight === 'twos'

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── notes (drawn BEHIND wallet body) ──────────────────── */}
      {notes.map((n, i) => (
        <WalletNote
          key={i}
          {...n}
          color={
            (n.label === '$5' && fiveHighlight) ? '#A5D6A7' :
            (n.label === '$2' && twoHighlight)  ? '#90CAF9' :
            n.color
          }
        />
      ))}

      {/* ── wallet body ───────────────────────────────────────── */}
      {/* shadow */}
      <rect x={wX + 4} y={wY + 4} width={wW} height={wH} rx={14} fill={WALLET_DARK} opacity={0.22} />
      {/* body */}
      <rect x={wX} y={wY} width={wW} height={wH} rx={14} fill={WALLET_BODY} />
      {/* texture quilting lines */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t}
          x1={wX + 14} y1={wY + wH * t}
          x2={wX + wW - 14} y2={wY + wH * t}
          stroke={WALLET_DARK} strokeWidth={0.8} opacity={0.25}
        />
      ))}
      {[0.2, 0.4, 0.6, 0.8].map((t) => (
        <line key={t}
          x1={wX + wW * t} y1={wY + 10}
          x2={wX + wW * t} y2={wY + wH - 10}
          stroke={WALLET_DARK} strokeWidth={0.8} opacity={0.22}
        />
      ))}
      {/* top highlight strip */}
      <rect x={wX + 10} y={wY + 8} width={wW - 20} height={8} rx={4} fill={WALLET_HIGHLIGHT} opacity={0.5} />
      {/* clasp button */}
      <rect x={wX + wW / 2 - 16} y={wY - 6} width={32} height={14} rx={7} fill={WALLET_DARK} />
      <rect x={wX + wW / 2 - 10} y={wY - 3} width={20} height={8} rx={4} fill={WALLET_HIGHLIGHT} opacity={0.6} />

      {/* ── constraints banner ────────────────────────────────── */}
      <rect x={30} y={wY + wH + 12} width={VIEW_W - 60} height={42} rx={10}
        fill={LABEL_BG} stroke={LABEL_BORDER} strokeWidth={2} />
      <text x={VIEW_W / 2} y={wY + wH + 24}
        textAnchor="middle" dominantBaseline="hanging"
        fontSize={13} fontWeight={700} fill={INK}>
        {`63 notes  ($2 + $5)`}
      </text>
      <text x={VIEW_W / 2} y={wY + wH + 40}
        textAnchor="middle" dominantBaseline="hanging"
        fontSize={13} fontWeight={700} fill={INK}>
        {`Total value = $171`}
      </text>

      {/* ── answer annotations (explainer only) ───────────────── */}
      {showAnswer && (
        <>
          {/* $5 badge */}
          <rect x={wX - 40} y={wY + 10} width={30} height={42} rx={6}
            fill="#E8F5E9" stroke={NOTE_DARK} strokeWidth={2} />
          <text x={wX - 25} y={wY + 20}
            textAnchor="middle" dominantBaseline="hanging"
            fontSize={9} fontWeight={700} fill={NOTE_DARK}>$5</text>
          <text x={wX - 25} y={wY + 33}
            textAnchor="middle" dominantBaseline="hanging"
            fontSize={14} fontWeight={900} fill={NOTE_DARK}>{FIVE_NOTES}</text>

          {/* $2 badge */}
          <rect x={wX + wW + 10} y={wY + 10} width={30} height={42} rx={6}
            fill="#E3F2FD" stroke={NOTE_BLUE_DARK} strokeWidth={2} />
          <text x={wX + wW + 25} y={wY + 20}
            textAnchor="middle" dominantBaseline="hanging"
            fontSize={9} fontWeight={700} fill={NOTE_BLUE_DARK}>$2</text>
          <text x={wX + wW + 25} y={wY + 33}
            textAnchor="middle" dominantBaseline="hanging"
            fontSize={14} fontWeight={900} fill={NOTE_BLUE_DARK}>{TWO_NOTES}</text>
        </>
      )}
    </svg>
  )
}

export default function Wallet19B5Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="A wallet containing $2 and $5 notes. Total 63 notes worth $171."
    >
      <WalletDiagram />
    </div>
  )
}
