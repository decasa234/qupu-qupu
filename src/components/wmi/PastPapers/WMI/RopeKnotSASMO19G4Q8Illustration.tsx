// SASMO-19-G4-Q8 — "Manakah yang akan membentuk simpul ketika kedua ujungnya ditarik?"
// All five choices are rope figures (A–E); no separate stem figure.
// Answer: E — the overhand / trefoil knot (3 alternating crossings lock together).
//
// Pattern: CubeShapes14Illustration (choices-only question).
// Default export = stem overview showing all 5 options.
// Named export RopeKnotSASMO19G4Q8Option = per-choice renderer for CHOICE_RENDERERS.
// No embedded VISUALS / CHOICE_RENDERERS const.
//
// No existing primitive covers rope-knot topology → fresh SVG.
// Crossing technique: painter-algorithm with white-gap masking.
// SSR-safe: no hooks, no framer-motion, no Math.random.

import type { WmiChoice } from '../../../../types/wmi'

// ── Style ────────────────────────────────────────────────────────────────────
const ROPE_CLR   = '#F97316'
const ROPE_DARK  = '#C2410C'  // second layer (slightly darker for depth)
const OUTLINE    = '#78350F'
const VB         = 160
const RW         = 11   // rope stroke-width
const OW         = 16   // outline stroke-width
const GW         = 22   // white-gap stroke-width (erases under-strand)

// ── Rendering helpers ────────────────────────────────────────────────────────

function Strand({ d }: { d: string }) {
  return (
    <>
      <path d={d} fill="none" stroke={OUTLINE}  strokeWidth={OW} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={ROPE_DARK} strokeWidth={RW + 2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={ROPE_CLR}  strokeWidth={RW} strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
}

function Gap({ d }: { d: string }) {
  return <path d={d} fill="none" stroke="white" strokeWidth={GW} strokeLinecap="square" />
}

// ── Rope configurations ───────────────────────────────────────────────────────
// Each config: `path` = full rope from one tail to other; `crossings` = array
// of {gap, over} where gap erases the under-strand and over redraws on top.
// crossings in order (topological depth order).

interface Crossing { gap: string; over: string }
interface RopeCfg  { path: string; crossings: Crossing[] }

// ── Option A  ─────────────────────────────────────────────────────────────────
// Complex spiral unknot: ~3 crossings, all "outer over inner" → slips free.
// Entry bottom-left (22,128), exit top-right (128,22).
const CFG_A: RopeCfg = {
  path: [
    'M 22 128',
    'C 12 108 14 82 28 68',
    'C 42 54 62 48 82 52',
    'C 102 56 118 72 122 92',
    'C 126 112 116 130 98 134',
    'C 80 138 58 130 48 116',
    'C 38 102 42 84 56 76',
    'C 70 68 88 68 100 78',
    'C 112 88 116 106 108 118',
    'C 100 130 84 136 70 130',
    'C 56 124 48 110 54 98',
    'C 60 86 74 82 86 88',
    'C 98 94 106 108 102 120',
    'C 98 132 84 140 68 136',
    'C 52 132 42 120 46 108',
    'C 50 96 64 90 78 94',
    'C 92 98 104 112 108 128',
    'C 112 144 118 148 128 22',
  ].join(' '),
  crossings: [
    {
      gap:  'M 56 76 C 50 74 46 78 44 84',
      over: 'M 66 68 C 62 70 58 72 54 76',
    },
    {
      gap:  'M 100 78 C 104 82 106 88 104 94',
      over: 'M 94 70 C 98 72 100 74 100 78',
    },
    {
      gap:  'M 78 94 C 74 98 72 104 74 110',
      over: 'M 84 88 C 82 90 80 92 78 94',
    },
  ],
}

// ── Option B  ─────────────────────────────────────────────────────────────────
// Double-loop unknot: 2 same-direction crossings → unravels when pulled.
// Entry top-right (128,22), exit bottom-left (22,128).
const CFG_B: RopeCfg = {
  path: [
    'M 128 22',
    'C 138 50 128 90 105 108',
    'C 82 126 52 126 35 110',
    'C 18 94 18 68 34 54',
    'C 50 40 74 40 88 54',
    'C 102 68 100 90 84 100',
    'C 68 110 48 106 40 94',
    'C 32 82 36 66 50 58',
    'C 64 50 82 54 90 68',
    'C 98 82 92 100 76 108',
    'C 60 116 40 112 30 98',
    'C 20 84 24 62 40 50',
    'C 56 38 78 40 92 56',
    'C 106 72 102 96 84 106',
    'C 68 116 48 112 38 96',
    'C 28 80 34 56 52 44',
    'C 70 32 92 38 100 56',
    'C 108 74 100 98 80 106',
    'C 60 114 36 106 30 86',
    'C 24 66 36 44 58 38',
    'C 80 32 102 44 110 64',
    'C 118 84 108 106 88 114',
    'C 68 122 44 114 34 94',
    'C 24 74 32 48 52 36',
    'C 72 24 94 30 104 48',
    'C 114 66 106 92 84 100',
    'C 62 108 38 96 32 72',
    'C 26 48 44 28 68 26',
    'C 92 24 112 40 118 62',
    'C 124 84 110 108 86 116',
    'C 62 124 34 112 26 86',
    'C 18 60 36 34 62 28',
    'C 88 22 112 36 120 60',
    'C 128 84 22 128 22 128',
  ].join(' '),
  crossings: [
    {
      gap:  'M 88 54 C 92 58 96 64 96 70',
      over: 'M 80 46 C 84 50 88 52 88 54',
    },
    {
      gap:  'M 50 58 C 46 62 44 68 46 74',
      over: 'M 58 52 C 54 54 52 56 50 58',
    },
  ],
}

// ── Option C  ─────────────────────────────────────────────────────────────────
// Figure-8 / pretzel unknot: 2 opposite-direction crossings that cancel.
// Entry bottom-center (78,128), exit top-right (128,22).
const CFG_C: RopeCfg = {
  path: [
    'M 78 130',
    'C 52 130 28 112 26 86',
    'C 24 60 46 42 68 44',
    'C 90 46 110 64 108 88',
    'C 106 112 86 126 68 118',
    'C 50 110 42 94 50 80',
    'C 58 66 76 62 90 70',
    'C 104 78 112 96 106 112',
    'C 100 128 82 138 65 132',
    'C 48 126 36 110 40 94',
    'C 44 78 62 68 78 72',
    'C 94 76 108 92 108 110',
    'C 108 128 94 142 76 138',
    'C 58 134 44 118 48 100',
    'C 52 82 70 72 86 76',
    'C 102 80 114 96 112 114',
    'C 110 132 96 144 78 138',
    'C 60 132 48 116 52 98',
    'C 56 80 74 70 90 74',
    'C 106 78 120 96 128 22',
  ].join(' '),
  crossings: [
    {
      gap:  'M 108 88 C 110 94 110 100 107 106',
      over: 'M 104 80 C 106 84 108 86 108 88',
    },
    {
      gap:  'M 50 80 C 48 86 48 92 50 98',
      over: 'M 56 74 C 54 76 51 78 50 80',
    },
  ],
}

// ── Option D  ─────────────────────────────────────────────────────────────────
// Simple single-loop unknot: 1 crossing → loop slides off when pulled.
// Entry top-right (128,22), exit bottom-left (22,128).
const CFG_D: RopeCfg = {
  path: [
    'M 128 22',
    'C 138 56 122 110 92 124',
    'C 62 138 26 136 12 112',
    'C -2 88 6 58 28 44',
    'C 50 30 78 28 98 40',
    'C 118 52 130 80 124 104',
    'C 118 128 100 140 79 134',
    'C 58 128 47 112 44 100',  // loop arc — the OVER strand at crossing
    'C 40 90 28 106 22 128',   // exit tail — the UNDER strand at crossing
  ].join(' '),
  crossings: [
    {
      // crossing at ~(44, 100): loop arc (OVER) crosses exit tail (UNDER)
      gap:  'M 41 102 C 37 100 33 104 30 110',  // erase exit tail
      over: 'M 57 124 C 52 116 47 108 41 102',  // redraw loop arc on top
    },
  ],
}

// ── Option E  ─────────────────────────────────────────────────────────────────
// Overhand / trefoil knot: 3 ALTERNATING crossings — OVER, UNDER, OVER.
// This locking pattern means the knot tightens when ends are pulled.
// Entry bottom-left (22,128), exit top-right (128,28).
//
// The path makes a large clockwise oval loop, then the strand passes through
// the interior of the loop once, creating 3 crossing points.
//
// Crossing layout (approximate 2D positions):
//   C1 at (55, 95): entry strand goes OVER the left side of the loop return
//   C2 at (104, 85): strand goes UNDER the right arc of the loop
//   C3 at (82, 118): strand goes OVER the base-closure of the loop
const CFG_E: RopeCfg = {
  path: [
    'M 22 128',
    // entry approach
    'C 32 120 46 112 56 100',  // approaches C1 from below-left
    // C1 crossing (OVER): redrawn in crossings[0].over
    'C 66 88 78 82 92 82',     // across interior toward C2
    // C2 crossing (UNDER): the right arc goes over this strand here
    'C 106 82 120 76 128 62',  // going up-right
    'C 136 48 132 32 120 26',  // upper-right arc going left
    'C 108 20 92 18 78 25',    // top going left
    'C 64 32 50 44 44 60',     // left side going down
    'C 38 76 40 92 50 100',    // left-bottom arc, approaching C1 area from above
    // loop closure goes over exit toward C3
    'C 60 108 72 112 82 112',  // bottom-left of loop, going right toward C3
    // C3 crossing (OVER): redrawn in crossings[2].over
    'C 92 112 104 106 112 96', // going up-right after C3
    'C 120 86 126 68 128 28',  // exit to top-right
  ].join(' '),
  crossings: [
    {
      // C1 at ~(55, 95): entry strand (going up-right) goes OVER the left loop arc
      // The left loop arc (from (50,100) going right) is the under-strand here
      gap:  'M 52 100 C 48 98 45 96 44 94',    // erase left arc near C1
      over: 'M 60 100 C 57 98 55 96 52 95',    // redraw entry strand over it
    },
    {
      // C2 at ~(104, 84): right arc (going up from loop top) goes OVER this strand
      // The through-strand going right (from C1 toward C2) is UNDER here
      gap:  'M 98 82 C 101 82 104 83 106 84',  // erase through-strand near C2
      over: 'M 116 76 C 114 78 110 80 106 82', // redraw right arc over it
    },
    {
      // C3 at ~(82, 113): loop-base closure strand goes OVER the approach strand
      // The approach from bottom (entry from 22,128) passes UNDER the loop closure
      gap:  'M 80 128 C 78 124 77 120 78 116', // erase the approach near C3
      over: 'M 74 114 C 76 113 79 113 82 113', // redraw loop-base over it
    },
  ],
}

// ── Option map ───────────────────────────────────────────────────────────────
const OPTION_CFG: Record<string, RopeCfg> = {
  A: CFG_A,
  B: CFG_B,
  C: CFG_C,
  D: CFG_D,
  E: CFG_E,
}

const ARIA_ID: Record<string, string> = {
  A: 'Pilihan A: tali dengan tiga putaran spiral yang saling tumpang tindih — terlepas saat ditarik',
  B: 'Pilihan B: tali dengan dua putaran melingkar yang bertumpuk — terlepas saat ditarik',
  C: 'Pilihan C: tali membentuk angka 8 dengan dua lingkaran berlawanan arah — terlepas saat ditarik',
  D: 'Pilihan D: tali dengan satu putaran lingkaran sederhana — terlepas saat ditarik',
  E: 'Pilihan E: tali dengan simpul nyata — tiga persilangan berselang-seling mengencang saat ditarik',
}

const ARIA_EN: Record<string, string> = {
  A: 'Option A: rope with three overlapping spiral loops — slips free when pulled',
  B: 'Option B: rope with two stacked oval loops — slips free when pulled',
  C: 'Option C: rope in a figure-8 with two opposite loops — slips free when pulled',
  D: 'Option D: rope with one simple circular loop — slips free when pulled',
  E: 'Option E: rope with a true overhand knot — three alternating crossings tighten when pulled',
}

// ── RopeSvg ──────────────────────────────────────────────────────────────────

function RopeSvg({ cfg, ariaLabel }: { cfg: RopeCfg; ariaLabel: string }) {
  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      width={120}
      height={120}
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'block' }}
    >
      <rect x={0} y={0} width={VB} height={VB} fill="white" />
      {/* 1. Full rope — outline + fill */}
      <Strand d={cfg.path} />
      {/* 2. Crossing corrections (white gap then over-strand redraw) */}
      {cfg.crossings.map((c, i) => (
        <g key={i}>
          <Gap    d={c.gap} />
          <Strand d={c.over} />
        </g>
      ))}
    </svg>
  )
}

// ── Named export: per-choice renderer ────────────────────────────────────────

/**
 * RopeKnotSASMO19G4Q8Option
 * Renders one A–E choice as its rope SVG figure.
 * Registered in CHOICE_RENDERERS for 'SASMO-19-G4-Q8'.
 */
export function RopeKnotSASMO19G4Q8Option({ choice }: { choice: WmiChoice }) {
  const k = choice.label as string
  const cfg = OPTION_CFG[k]
  if (!cfg) return <span>{choice.text}</span>
  return (
    <span
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <RopeSvg cfg={cfg} ariaLabel={ARIA_EN[k] ?? choice.text} />
    </span>
  )
}

// ── Default export: stem overview (all 5 options) ─────────────────────────────

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

/**
 * RopeKnotSASMO19G4Q8Illustration
 * Shows all five rope options in a row — used as the question's stem figure.
 * Does NOT show the answer (which rope is the knot).
 */
export default function RopeKnotSASMO19G4Q8Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Lima gambar tali (A sampai E). Manakah yang akan membentuk simpul ' +
        'ketika kedua ujungnya ditarik bersamaan?'
      }
    >
      <div
        className="flex flex-wrap items-center justify-center gap-3"
        aria-hidden="true"
      >
        {LABELS.map((label) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <RopeSvg
              cfg={OPTION_CFG[label]}
              ariaLabel={ARIA_ID[label]}
            />
            <span
              className="font-display text-xs font-bold"
              style={{ color: '#1F2937' }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
