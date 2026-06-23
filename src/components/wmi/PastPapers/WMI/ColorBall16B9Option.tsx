// SEAMO-16-B-Q9 — "A bag contains 12 red, 10 white, 8 yellow, 3 blue and 2 black balls…"
//
// The A–E answer options are PICTURES of coloured smiley balls, one per option.
// The ball colours match the balls in the problem:
//   A → Yellow (rolling-eyes face)   — matches "8 yellow" balls in bag
//   B → White/cream (X-eyes face)    — matches "10 white" balls in bag
//   C → Red (angry face)             — matches "12 red" balls in bag
//   D → Black (plain 8-ball style)   — matches "2 black" balls in bag
//   E → Blue (happy face)            — matches "3 blue" balls in bag
//
// Pure SVG, SSR-safe, no hooks, no framer-motion.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Ball colour definitions (read from the OCR image crops 007–011)
// ---------------------------------------------------------------------------

interface BallSpec {
  fill: string          // main ball colour
  shade: string         // darker hemisphere shading
  highlight: string     // specular glint
  face: 'rolling' | 'xeyes' | 'angry' | 'plain' | 'happy'
  label_en: string
  label_id: string
}

const BALLS: Record<string, BallSpec> = {
  A: {
    fill: '#F5C518',
    shade: '#D4A017',
    highlight: '#FFFACD',
    face: 'rolling',
    label_en: 'Option A: yellow ball with rolling eyes.',
    label_id: 'Pilihan A: bola kuning dengan mata melirik.',
  },
  B: {
    fill: '#F0EAD6',
    shade: '#C8BFA8',
    highlight: '#FFFFFF',
    face: 'xeyes',
    label_en: 'Option B: white ball with crossed-out eyes.',
    label_id: 'Pilihan B: bola putih dengan mata bersilang.',
  },
  C: {
    fill: '#D32F2F',
    shade: '#A00000',
    highlight: '#FF8080',
    face: 'angry',
    label_en: 'Option C: red angry ball.',
    label_id: 'Pilihan C: bola merah marah.',
  },
  D: {
    fill: '#1A1A1A',
    shade: '#000000',
    highlight: '#555555',
    face: 'plain',
    label_en: 'Option D: black ball.',
    label_id: 'Pilihan D: bola hitam.',
  },
  E: {
    fill: '#2979FF',
    shade: '#0044CC',
    highlight: '#80BFFF',
    face: 'happy',
    label_en: 'Option E: blue happy ball.',
    label_id: 'Pilihan E: bola biru tersenyum.',
  },
}

// ---------------------------------------------------------------------------
// SmileyBall — draws one coloured ball with a face expression
// ---------------------------------------------------------------------------

const CX = 40
const CY = 40
const R = 34

function SmileyBall({ spec }: { spec: BallSpec }) {
  const { fill, shade, highlight, face } = spec

  // Face expressions as SVG sub-groups
  const EyeLeft  = { x: CX - 13, y: CY - 6 }
  const EyeRight = { x: CX + 13, y: CY - 6 }

  function RollingEyes() {
    // Whites of eyes, irises rolled up into whites
    return (
      <g>
        <ellipse cx={EyeLeft.x}  cy={EyeLeft.y}  rx={7} ry={8} fill="#fff" stroke="#333" strokeWidth={1.2} />
        <ellipse cx={EyeRight.x} cy={EyeRight.y} rx={7} ry={8} fill="#fff" stroke="#333" strokeWidth={1.2} />
        {/* Iris rolled upward */}
        <circle cx={EyeLeft.x}  cy={EyeLeft.y  - 3} r={4} fill="#4B3621" />
        <circle cx={EyeRight.x} cy={EyeRight.y - 3} r={4} fill="#4B3621" />
        {/* Cover bottom of iris (lid effect) */}
        <rect x={EyeLeft.x  - 7} y={EyeLeft.y  + 1} width={14} height={8} fill={fill} />
        <rect x={EyeRight.x - 7} y={EyeRight.y + 1} width={14} height={8} fill={fill} />
        {/* Eyelid line */}
        <line x1={EyeLeft.x  - 7} y1={EyeLeft.y  + 1} x2={EyeLeft.x  + 7} y2={EyeLeft.y  + 1} stroke="#333" strokeWidth={1.2} />
        <line x1={EyeRight.x - 7} y1={EyeRight.y + 1} x2={EyeRight.x + 7} y2={EyeRight.y + 1} stroke="#333" strokeWidth={1.2} />
        {/* Straight mouth */}
        <line x1={CX - 9} y1={CY + 10} x2={CX + 9} y2={CY + 10} stroke="#333" strokeWidth={2} strokeLinecap="round" />
      </g>
    )
  }

  function XEyes() {
    // X-shaped eyes (knocked out)
    function XMark({ cx: ex, cy: ey }: { cx: number; cy: number }) {
      const d = 5
      return (
        <g>
          <line x1={ex - d} y1={ey - d} x2={ex + d} y2={ey + d} stroke="#666" strokeWidth={2.2} strokeLinecap="round" />
          <line x1={ex + d} y1={ey - d} x2={ex - d} y2={ey + d} stroke="#666" strokeWidth={2.2} strokeLinecap="round" />
        </g>
      )
    }
    return (
      <g>
        <XMark cx={EyeLeft.x}  cy={EyeLeft.y} />
        <XMark cx={EyeRight.x} cy={EyeRight.y} />
        {/* Small open mouth */}
        <ellipse cx={CX} cy={CY + 12} rx={5} ry={4} fill="#fff" stroke="#666" strokeWidth={1} />
      </g>
    )
  }

  function AngryEyes() {
    return (
      <g>
        {/* Furrowed brows */}
        <line x1={EyeLeft.x  - 7} y1={EyeLeft.y  - 9} x2={EyeLeft.x  + 6} y2={EyeLeft.y  - 5} stroke="#700000" strokeWidth={2.4} strokeLinecap="round" />
        <line x1={EyeRight.x - 6} y1={EyeRight.y - 5} x2={EyeRight.x + 7} y2={EyeRight.y - 9} stroke="#700000" strokeWidth={2.4} strokeLinecap="round" />
        {/* Squinted eyes */}
        <ellipse cx={EyeLeft.x}  cy={EyeLeft.y}  rx={6} ry={5} fill="#fff" stroke="#700000" strokeWidth={1.4} />
        <ellipse cx={EyeRight.x} cy={EyeRight.y} rx={6} ry={5} fill="#fff" stroke="#700000" strokeWidth={1.4} />
        <circle cx={EyeLeft.x}  cy={EyeLeft.y}  r={2.5} fill="#700000" />
        <circle cx={EyeRight.x} cy={EyeRight.y} r={2.5} fill="#700000" />
        {/* Frown */}
        <path d={`M ${CX - 10} ${CY + 14} Q ${CX} ${CY + 7} ${CX + 10} ${CY + 14}`} fill="none" stroke="#700000" strokeWidth={2.2} strokeLinecap="round" />
      </g>
    )
  }

  function PlainFace() {
    // Minimal eyes + neutral mouth for the black 8-ball
    return (
      <g>
        <circle cx={EyeLeft.x}  cy={EyeLeft.y}  r={4} fill="#fff" />
        <circle cx={EyeRight.x} cy={EyeRight.y} r={4} fill="#fff" />
        <circle cx={EyeLeft.x}  cy={EyeLeft.y}  r={2} fill="#222" />
        <circle cx={EyeRight.x} cy={EyeRight.y} r={2} fill="#222" />
        {/* 8-ball circle */}
        <circle cx={CX} cy={CY + 10} r={9} fill="#fff" />
        <text x={CX} y={CY + 14} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#222">8</text>
      </g>
    )
  }

  function HappyFace() {
    return (
      <g>
        {/* Wide open eyes */}
        <ellipse cx={EyeLeft.x}  cy={EyeLeft.y}  rx={6} ry={7} fill="#fff" stroke="#1A3A8F" strokeWidth={1.2} />
        <ellipse cx={EyeRight.x} cy={EyeRight.y} rx={6} ry={7} fill="#fff" stroke="#1A3A8F" strokeWidth={1.2} />
        <circle cx={EyeLeft.x  + 1} cy={EyeLeft.y  + 1} r={3} fill="#1A3A8F" />
        <circle cx={EyeRight.x + 1} cy={EyeRight.y + 1} r={3} fill="#1A3A8F" />
        {/* Glints */}
        <circle cx={EyeLeft.x  + 2} cy={EyeLeft.y  - 1} r={1.2} fill="#fff" />
        <circle cx={EyeRight.x + 2} cy={EyeRight.y - 1} r={1.2} fill="#fff" />
        {/* Smile */}
        <path d={`M ${CX - 11} ${CY + 9} Q ${CX} ${CY + 20} ${CX + 11} ${CY + 9}`} fill="none" stroke="#1A3A8F" strokeWidth={2.4} strokeLinecap="round" />
      </g>
    )
  }

  const SIZE = 80
  return (
    <svg
      viewBox="0 0 80 80"
      width={SIZE}
      height={SIZE}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Ball shading hemisphere */}
      <defs>
        <radialGradient id={`bg-${face}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor={highlight} />
          <stop offset="55%"  stopColor={fill} />
          <stop offset="100%" stopColor={shade} />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r={R} fill={`url(#bg-${face})`} />
      {/* Face expression */}
      {face === 'rolling' && <RollingEyes />}
      {face === 'xeyes'   && <XEyes />}
      {face === 'angry'   && <AngryEyes />}
      {face === 'plain'   && <PlainFace />}
      {face === 'happy'   && <HappyFace />}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Option renderer — renders ONE choice as a coloured smiley ball
// ---------------------------------------------------------------------------

/**
 * ColorBall16B9Option — renders one A/B/C/D/E choice as a coloured smiley ball.
 * Registered in CHOICE_RENDERERS for SEAMO-16-B-Q9.
 */
export function ColorBall16B9Option({ choice }: { choice: WmiChoice }) {
  const k = (choice.label ?? '').trim().toUpperCase()
  const spec = BALLS[k]
  if (!spec) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={spec.label_en}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <SmileyBall spec={spec} />
    </span>
  )
}

export default ColorBall16B9Option
