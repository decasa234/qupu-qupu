// SASMO-19-G2-Q6 — "Which snowflake below is the same as the snowflake on the right?"
//
// Stem illustration: shows the REFERENCE snowflake (the one the student must match).
// Co-exports SnowflakeSASMO19G2Q6Option for CHOICE_RENDERERS (renders one A/B/C/D choice).
//
// Reference snowflake design (= Option C, the answer):
//   8-fold symmetry. Each arm: central spine + two perpendicular side branches at mid-
//   length + two diagonal tip-fork spikes. Between adjacent arms: small 4-point diamond
//   at mid-radius. Centre hub: filled circle with 8 small triangular points.
//
// Option A — 6-fold, smooth wide blades, no tip forks, no between-arm diamonds.
// Option B — 8-fold but side branches are shorter and between-arm diamonds are absent.
// Option C — identical to reference (CORRECT ANSWER).
// Option D — 6-fold with rectangular barbell arms and a plain centre (no hub spikes).
//
// Pure SVG, no hooks, no framer-motion, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const FILL = '#6FA8DC'
const DARK = '#4A82B8'

// ---------------------------------------------------------------------------
// REFERENCE / OPTION C — 8-fold spiky snowflake
// ---------------------------------------------------------------------------

/** One arm of the reference snowflake, drawn pointing along the +Y axis.
 *  Caller applies rotate transform for each of the 8 arms. */
function RefArm() {
  return (
    <g fill={FILL}>
      {/* spine */}
      <rect x={-3} y={12} width={6} height={36} rx={1.5} />
      {/* left side branch */}
      <rect x={-14} y={26} width={11} height={4} rx={1} />
      {/* right side branch */}
      <rect x={3} y={26} width={11} height={4} rx={1} />
      {/* left tip spike */}
      <polygon points="0,48 -7,37 -1,37" />
      {/* right tip spike */}
      <polygon points="0,48 7,37 1,37" />
    </g>
  )
}

/** Small 4-point diamond placed between two adjacent arms at mid-radius.
 *  Caller applies rotate transform. */
function BetweenDiamond() {
  return <polygon fill={FILL} points="0,-30 4,-26 0,-22 -4,-26" />
}

/** Centre hub: filled circle + 8 small triangular spikes. */
function CentreHub() {
  return (
    <g fill={FILL}>
      <circle cx={0} cy={0} r={10} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <polygon
          key={deg}
          points="0,-10 -3,-14 3,-14"
          transform={`rotate(${deg})`}
        />
      ))}
    </g>
  )
}

function ReferenceSnowflake({ size = 110 }: { size?: number }) {
  return (
    <svg
      viewBox="-60 -60 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* 8 arms */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <g key={deg} transform={`rotate(${deg})`}>
          <RefArm />
        </g>
      ))}
      {/* between-arm diamonds — at 22.5° offset from each arm */}
      {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => (
        <g key={deg} transform={`rotate(${deg})`}>
          <BetweenDiamond />
        </g>
      ))}
      <CentreHub />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// OPTION A — 6-fold smooth snowflake (clearly different)
// ---------------------------------------------------------------------------

function OptionASnowflake({ size = 90 }: { size?: number }) {
  return (
    <svg
      viewBox="-60 -60 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* 6 smooth wide arms — no tip forks, no between-arm diamonds */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <g key={deg} transform={`rotate(${deg})`} fill={FILL}>
          {/* wider spine */}
          <rect x={-5} y={12} width={10} height={36} rx={2} />
          {/* single wide side branch */}
          <rect x={-16} y={28} width={13} height={5} rx={1.5} />
          <rect x={3} y={28} width={13} height={5} rx={1.5} />
        </g>
      ))}
      {/* plain centre */}
      <circle cx={0} cy={0} r={11} fill={FILL} />
      <circle cx={0} cy={0} r={7} fill="white" />
      <circle cx={0} cy={0} r={4} fill={FILL} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// OPTION B — 8-fold, similar to reference but shorter branches + no between-arm diamonds
// ---------------------------------------------------------------------------

function OptionBArm() {
  return (
    <g fill={FILL}>
      {/* spine — same length as reference */}
      <rect x={-3} y={12} width={6} height={36} rx={1.5} />
      {/* SHORTER side branches (7px vs 11px) */}
      <rect x={-10} y={26} width={7} height={4} rx={1} />
      <rect x={3} y={26} width={7} height={4} rx={1} />
      {/* same tip fork as reference */}
      <polygon points="0,48 -7,37 -1,37" />
      <polygon points="0,48 7,37 1,37" />
    </g>
  )
}

function OptionBSnowflake({ size = 90 }: { size?: number }) {
  return (
    <svg
      viewBox="-60 -60 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* 8 arms with shorter branches */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <g key={deg} transform={`rotate(${deg})`}>
          <OptionBArm />
        </g>
      ))}
      {/* NO between-arm diamonds — this is the key visible difference from the reference */}
      <CentreHub />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// OPTION D — 6-fold barbell-arm snowflake with plain centre
// ---------------------------------------------------------------------------

function OptionDSnowflake({ size = 90 }: { size?: number }) {
  return (
    <svg
      viewBox="-60 -60 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* 6 rectangular barbell arms */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <g key={deg} transform={`rotate(${deg})`} fill={FILL}>
          {/* narrow spine */}
          <rect x={-3} y={14} width={6} height={32} rx={1} />
          {/* cross-bar near top */}
          <rect x={-12} y={20} width={24} height={5} rx={1.5} />
          {/* small square end cap */}
          <rect x={-5} y={44} width={10} height={8} rx={1.5} />
        </g>
      ))}
      {/* concentric ring centre (no spikes) */}
      <circle cx={0} cy={0} r={12} fill={FILL} />
      <circle cx={0} cy={0} r={8} fill="white" />
      <circle cx={0} cy={0} r={5} fill={FILL} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// OPTION E — "None of the above" (no picture; text fallback only)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Snowflake map keyed by choice label
// ---------------------------------------------------------------------------

const OPTION_RENDERERS: Record<string, (size?: number) => JSX.Element> = {
  A: (s) => <OptionASnowflake size={s} />,
  B: (s) => <OptionBSnowflake size={s} />,
  C: (s) => <ReferenceSnowflake size={s} />,
  D: (s) => <OptionDSnowflake size={s} />,
}

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: 6-fold snowflake with smooth wide arms and a ringed centre.',
    id: 'Pilihan A: kepingan 6-lengan dengan lengan lebar halus dan pusat berbentuk cincin.',
  },
  B: {
    en: 'Option B: 8-fold snowflake with shorter side branches and no between-arm diamonds.',
    id: 'Pilihan B: kepingan 8-lengan dengan cabang samping lebih pendek tanpa berlian antara lengan.',
  },
  C: {
    en: 'Option C: 8-fold snowflake — matches the reference exactly.',
    id: 'Pilihan C: kepingan 8-lengan — cocok persis dengan referensi.',
  },
  D: {
    en: 'Option D: 6-fold snowflake with rectangular barbell arms and a plain ringed centre.',
    id: 'Pilihan D: kepingan 6-lengan dengan lengan barbel persegi panjang dan pusat polos berbentuk cincin.',
  },
}

// ---------------------------------------------------------------------------
// Stem illustration — shows ONLY the reference snowflake
// ---------------------------------------------------------------------------

/**
 * SnowflakeSASMO19G2Q6Illustration — displays the reference snowflake that
 * the student must match among options A–D.
 */
export default function SnowflakeSASMO19G2Q6Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Reference snowflake: 8 arms with side branches, fork tips, and small diamonds between arms."
    >
      <div aria-hidden="true">
        <ReferenceSnowflake size={130} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Option renderer — renders ONE A/B/C/D choice as its snowflake SVG
// ---------------------------------------------------------------------------

/**
 * SnowflakeSASMO19G2Q6Option — renders a single picture-choice snowflake
 * for SASMO-19-G2-Q6. Registered in CHOICE_RENDERERS.
 */
export function SnowflakeSASMO19G2Q6Option({ choice }: { choice: WmiChoice }) {
  const render = OPTION_RENDERERS[choice.label]
  const aria = OPTION_ARIA[choice.label]

  if (!render) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      {render(80)}
    </span>
  )
}
