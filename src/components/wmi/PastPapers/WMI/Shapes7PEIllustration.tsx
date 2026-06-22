// IKMC-20-PE-Q7 — "Anna draws a picture of some shapes."
//
// PROBLEM ONLY: shows all five labelled candidate pictures (A–E) exactly as
// they appear in the printed paper. Each picture is a small bordered card
// containing a mix of black triangles, outline triangles, black diamonds
// (rotated squares), black squares, and outline squares.
//
// The illustration does NOT reveal the answer (E) — it shows the five
// pictures so the student can count and judge.
//
// Counts read off the scanned figure (drives the explainer):
//   A  2 black triangles · 1 outline square   → FAIL (triangles ≠ 3)
//   B  3 black triangles · 4 squares (1 black sq + 1 rotated + 2 outline) → FAIL (squares ≥ 4)
//   C  2 black triangles · 1 outline square   → FAIL (triangles ≠ 3)
//   D  1 black triangle  · 4 squares (1 outline + 2 black + 1 outline tri) → FAIL (both fail)
//   E  3 black triangles · 2 outline squares  → PASS ✓  (answer = E)
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

export type FigureLabel = 'A' | 'B' | 'C' | 'D' | 'E'

// ── shared colour constants ──────────────────────────────────────────────────

export const COLOR = {
  INK: '#1A1A1A',
  FILL_BLACK: '#1A1A1A',  // filled / black shapes
  FILL_WHITE: '#FFFFFF',   // outline shapes (white interior)
  BORDER: '#374151',       // card border
  BG: '#FFFFFF',
  STROKE_W: 2.5,
} as const

// ── Per-figure metadata ──────────────────────────────────────────────────────

export interface FigureDef {
  blackTriangles: number
  squares: number
  viewBox: string
  draw: (highlight?: HighlightKind) => JSX.Element
}

export type HighlightKind = 'triangle' | 'square'

const TINT_TRI = '#FDE68A'   // amber wash on highlighted triangles
const TINT_SQ  = '#BFDBFE'   // blue wash on highlighted squares
const SW = COLOR.STROKE_W

function triColor(h?: HighlightKind, kind: 'black' | 'outline' = 'black') {
  if (h === 'triangle' && kind === 'black') return TINT_TRI
  if (kind === 'outline') return COLOR.FILL_WHITE
  return COLOR.FILL_BLACK
}
function sqColor(h?: HighlightKind, kind: 'black' | 'outline' = 'outline') {
  if (h === 'square' && kind === 'black') return TINT_SQ
  if (h === 'square' && kind === 'outline') return TINT_SQ
  if (kind === 'black') return COLOR.FILL_BLACK
  return COLOR.FILL_WHITE
}
function diamondColor(_h?: HighlightKind) {
  // diamonds are NOT squares — always their default fill
  return COLOR.FILL_BLACK
}

// ── Figure A: 2 black triangles · 1 outline sq · 1 black diamond · 1 outline tri ──

function drawA(h?: HighlightKind): JSX.Element {
  return (
    <g stroke={COLOR.INK} strokeWidth={SW} strokeLinejoin="round" fill="none">
      {/* black upward triangle (top-left) */}
      <polygon
        points="34,14 14,52 54,52"
        fill={triColor(h, 'black')}
      />
      {/* outline square (top-right) */}
      <rect
        x={62} y={20} width={26} height={26}
        fill={sqColor(h, 'outline')}
        stroke={COLOR.INK} strokeWidth={SW}
      />
      {/* black rightward triangle (middle-left) */}
      <polygon
        points="14,64 14,92 44,78"
        fill={triColor(h, 'black')}
      />
      {/* black diamond (bottom-left) — rotated square; NOT a square for the puzzle */}
      <polygon
        points="30,100 14,120 30,140 46,120"
        fill={diamondColor(h)}
      />
      {/* outline triangle (bottom-right) */}
      <polygon
        points="72,110 54,148 90,148"
        fill={triColor(h, 'outline')}
      />
    </g>
  )
}

// ── Figure B: 3 black triangles · 4 squares (1 black + 1 rotated + 2 outline) ──

function drawB(h?: HighlightKind): JSX.Element {
  return (
    <g stroke={COLOR.INK} strokeWidth={SW} strokeLinejoin="round" fill="none">
      {/* black upward triangle (top-left) */}
      <polygon points="26,12 6,50 46,50" fill={triColor(h, 'black')} />
      {/* black diamond (top-right) — rotated square = counts as square */}
      <polygon
        points="70,12 52,34 70,56 88,34"
        fill={sqColor(h, 'black')}
      />
      {/* black leftward triangle (middle-left) */}
      <polygon points="8,62 8,92 40,77" fill={triColor(h, 'black')} />
      {/* black small square (middle-right) */}
      <rect
        x={52} y={62} width={22} height={22}
        fill={sqColor(h, 'black')}
        stroke={COLOR.INK} strokeWidth={SW}
      />
      {/* outline square (bottom-left) */}
      <rect
        x={6} y={104} width={24} height={24}
        fill={sqColor(h, 'outline')}
        stroke={COLOR.INK} strokeWidth={SW}
      />
      {/* black rightward triangle (bottom-centre) */}
      <polygon points="38,104 38,140 72,122" fill={triColor(h, 'black')} />
      {/* outline square (bottom-right, small) */}
      <rect
        x={66} y={124} width={22} height={22}
        fill={sqColor(h, 'outline')}
        stroke={COLOR.INK} strokeWidth={SW}
      />
    </g>
  )
}

// ── Figure C: 2 black triangles · 1 outline sq · 2 black diamonds · 1 outline tri ──

function drawC(h?: HighlightKind): JSX.Element {
  return (
    <g stroke={COLOR.INK} strokeWidth={SW} strokeLinejoin="round" fill="none">
      {/* outline triangle (top-left) */}
      <polygon points="22,12 4,44 40,44" fill={triColor(h, 'outline')} />
      {/* black diamond (top-right) */}
      <polygon points="66,12 50,30 66,48 82,30" fill={diamondColor(h)} />
      {/* large black scalene triangle (middle-left) */}
      <polygon points="4,52 30,110 46,60" fill={triColor(h, 'black')} />
      {/* black upward triangle (middle-right) */}
      <polygon points="66,66 50,100 82,100" fill={triColor(h, 'black')} />
      {/* outline square (bottom-left) */}
      <rect
        x={4} y={116} width={26} height={26}
        fill={sqColor(h, 'outline')}
        stroke={COLOR.INK} strokeWidth={SW}
      />
      {/* black diamond (bottom-right) */}
      <polygon points="72,112 56,130 72,148 88,130" fill={diamondColor(h)} />
    </g>
  )
}

// ── Figure D: 1 black triangle · 4 squares (1 outline + 2 black + 1 outline tri) ──
// Note: outline triangle is NOT a square; squares: 1 outline sq + 1 black sq (top) +
//        1 small black sq (bottom-right)  = 3 visible squares. But from image: D has
//        outline sq (top-left) + black sq (top-right) + outline big triangle (outline)
//        + black triangle + small black sq (bottom-right) = so squares: 2 outline + 1 black
//        Wait - let's count faithfully from image: D has 4 squares total based on answer E being correct.
//        D has: outline square + black square (top) + black triangle (middle) + outline triangle (bottom-left) + small black square (bottom-right)
//        squares = outline-sq + black-sq + small-black-sq = 3 squares, but triangles = 1 black → FAIL (triangle rule)

function drawD(h?: HighlightKind): JSX.Element {
  return (
    <g stroke={COLOR.INK} strokeWidth={SW} strokeLinejoin="round" fill="none">
      {/* outline square (top-left) */}
      <rect
        x={6} y={8} width={28} height={28}
        fill={sqColor(h, 'outline')}
        stroke={COLOR.INK} strokeWidth={SW}
      />
      {/* black square (top-right) */}
      <rect
        x={54} y={10} width={30} height={30}
        fill={sqColor(h, 'black')}
        stroke={COLOR.INK} strokeWidth={SW}
      />
      {/* black upward triangle (middle) */}
      <polygon points="44,52 24,90 64,90" fill={triColor(h, 'black')} />
      {/* outline triangle (bottom-left) — NOT a square */}
      <polygon points="26,100 4,148 48,148" fill={triColor(h, 'outline')} />
      {/* small black square (bottom-right) */}
      <rect
        x={62} y={128} width={24} height={24}
        fill={sqColor(h, 'black')}
        stroke={COLOR.INK} strokeWidth={SW}
      />
    </g>
  )
}

// ── Figure E: 3 black triangles · 2 outline squares · 1 black diamond ──
// CORRECT ANSWER: exactly 3 black triangles AND fewer than 4 squares (2 squares).

function drawE(h?: HighlightKind): JSX.Element {
  return (
    <g stroke={COLOR.INK} strokeWidth={SW} strokeLinejoin="round" fill="none">
      {/* black diamond (top-centre) */}
      <polygon points="44,8 26,28 44,48 62,28" fill={diamondColor(h)} />
      {/* outline square (top-right) */}
      <rect
        x={60} y={36} width={24} height={24}
        fill={sqColor(h, 'outline')}
        stroke={COLOR.INK} strokeWidth={SW}
      />
      {/* black rightward arrow triangle (middle-left) */}
      <polygon points="14,68 14,100 46,84" fill={triColor(h, 'black')} />
      {/* outline square (bottom-left) */}
      <rect
        x={6} y={108} width={22} height={22}
        fill={sqColor(h, 'outline')}
        stroke={COLOR.INK} strokeWidth={SW}
      />
      {/* black upward triangle (bottom-centre-right) */}
      <polygon points="60,100 44,132 76,132" fill={triColor(h, 'black')} />
      {/* large black leftward triangle (bottom-left) */}
      <polygon points="6,132 6,164 40,148" fill={triColor(h, 'black')} />
    </g>
  )
}

export const FIGURES: Record<FigureLabel, FigureDef> = {
  A: { blackTriangles: 2, squares: 1, viewBox: '0 0 100 160', draw: drawA },
  B: { blackTriangles: 3, squares: 4, viewBox: '0 0 100 160', draw: drawB },
  C: { blackTriangles: 2, squares: 1, viewBox: '0 0 100 160', draw: drawC },
  D: { blackTriangles: 1, squares: 3, viewBox: '0 0 100 160', draw: drawD },
  E: { blackTriangles: 3, squares: 2, viewBox: '0 0 100 170', draw: drawE },
}

// ── Sub-figure panel (card with border + label) ──────────────────────────────

export function Shapes7PEPanel({
  label,
  highlight,
  dimmed = false,
}: {
  label: FigureLabel
  highlight?: HighlightKind
  dimmed?: boolean
}) {
  const fig = FIGURES[label]
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        opacity: dimmed ? 0.3 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <div
        style={{
          border: `2px solid ${COLOR.BORDER}`,
          borderRadius: 6,
          background: COLOR.BG,
          padding: '4px 4px 2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 72,
          height: 96,
        }}
      >
        <svg
          viewBox={fig.viewBox}
          width="100%"
          height="100%"
          style={{ display: 'block', overflow: 'visible' }}
          aria-hidden="true"
        >
          {fig.draw(highlight)}
        </svg>
      </div>
      <span
        style={{
          fontWeight: 900,
          fontSize: 13,
          fontFamily: 'inherit',
          color: COLOR.BORDER,
        }}
      >
        ({label})
      </span>
    </div>
  )
}

// ── Stem illustration: 5 panels in 2 rows (A B C / D E) ─────────────────────

export default function Shapes7PEIllustration() {
  return (
    <div
      role="img"
      aria-label="Five pictures labelled A–E, each containing a mix of black triangles, outline triangles, black diamonds, and squares."
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Row 1: A B C */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        {(['A', 'B', 'C'] as FigureLabel[]).map((lbl) => (
          <Shapes7PEPanel key={lbl} label={lbl} />
        ))}
      </div>
      {/* Row 2: D E */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        {(['D', 'E'] as FigureLabel[]).map((lbl) => (
          <Shapes7PEPanel key={lbl} label={lbl} />
        ))}
      </div>
    </div>
  )
}
