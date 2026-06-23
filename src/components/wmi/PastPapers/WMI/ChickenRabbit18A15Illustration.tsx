// SEAMO-18-A-Q15 — Chicken and rabbit legs puzzle.
//
// Stem: 26 chickens and rabbits on a farm; 80 legs total; find rabbits.
// Answer: A (14 rabbits)
//
// No geometric primitive applies. This is a simple decorative illustration
// showing a chicken (2 legs) and a rabbit (4 legs) with leg-count labels
// to anchor the word problem visually. SSR-safe: no hooks, no framer-motion.
//
// VISUALS entry (add to registry.ts):
//   'SEAMO-18-A-Q15': { illustration: () => import('./ChickenRabbit18A15Illustration') },

// ── Chicken glyph ─────────────────────────────────────────────────────────────

function Chicken({ cx = 0, cy = 0, size = 48 }: { cx?: number; cy?: number; size?: number }) {
  const s = size / 48
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      {/* body */}
      <ellipse cx={0} cy={4} rx={18} ry={16} fill="#D97706" />
      {/* head */}
      <circle cx={18} cy={-10} r={10} fill="#D97706" />
      {/* eye */}
      <circle cx={21} cy={-12} r={2.5} fill="#1C1917" />
      <circle cx={22} cy={-13} r={0.8} fill="#FFFFFF" />
      {/* beak */}
      <polygon points="27,-9 33,-10 27,-12" fill="#F59E0B" />
      {/* comb */}
      <ellipse cx={16} cy={-22} rx={3} ry={5} fill="#EF4444" />
      <ellipse cx={19} cy={-24} rx={2.5} ry={4} fill="#EF4444" />
      {/* wattle */}
      <ellipse cx={24} cy={-5} rx={3} ry={4} fill="#EF4444" />
      {/* wing */}
      <ellipse cx={-4} cy={2} rx={13} ry={9} fill="#B45309" transform="rotate(-10 -4 2)" />
      {/* legs */}
      <line x1={-5} y1={18} x2={-8} y2={30} stroke="#F59E0B" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={-8} y1={30} x2={-14} y2={32} stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" />
      <line x1={-8} y1={30} x2={-8} y2={34} stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" />
      <line x1={5} y1={18} x2={8} y2={30} stroke="#F59E0B" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={8} y1={30} x2={14} y2={32} stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" />
      <line x1={8} y1={30} x2={8} y2={34} stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

// ── Rabbit glyph ──────────────────────────────────────────────────────────────

function Rabbit({ cx = 0, cy = 0, size = 48 }: { cx?: number; cy?: number; size?: number }) {
  const s = size / 48
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      {/* body */}
      <ellipse cx={0} cy={6} rx={16} ry={18} fill="#D1D5DB" />
      {/* head */}
      <circle cx={0} cy={-16} r={12} fill="#D1D5DB" />
      {/* ears */}
      <ellipse cx={-6} cy={-34} rx={4} ry={12} fill="#D1D5DB" />
      <ellipse cx={-6} cy={-34} rx={2} ry={9} fill="#FCA5A5" />
      <ellipse cx={7} cy={-35} rx={4} ry={12} fill="#D1D5DB" transform="rotate(8 7 -35)" />
      <ellipse cx={7} cy={-35} rx={2} ry={9} fill="#FCA5A5" transform="rotate(8 7 -35)" />
      {/* eyes */}
      <circle cx={-4} cy={-18} r={2.5} fill="#1C1917" />
      <circle cx={-3} cy={-19} r={0.8} fill="#FFFFFF" />
      <circle cx={5} cy={-18} r={2.5} fill="#1C1917" />
      <circle cx={6} cy={-19} r={0.8} fill="#FFFFFF" />
      {/* nose */}
      <ellipse cx={0} cy={-13} rx={2} ry={1.2} fill="#FCA5A5" />
      {/* mouth */}
      <path d="M -3,-12 Q 0,-10 3,-12" fill="none" stroke="#9CA3AF" strokeWidth={1} />
      {/* tail */}
      <circle cx={-14} cy={8} r={5} fill="#F3F4F6" />
      {/* front paws */}
      <ellipse cx={7} cy={14} rx={5} ry={3} fill="#9CA3AF" />
      <ellipse cx={-7} cy={14} rx={5} ry={3} fill="#9CA3AF" />
      {/* hind legs */}
      <ellipse cx={10} cy={22} rx={7} ry={4} fill="#9CA3AF" transform="rotate(-20 10 22)" />
      <ellipse cx={-10} cy={22} rx={7} ry={4} fill="#9CA3AF" transform="rotate(20 -10 22)" />
    </g>
  )
}

// ── Main illustration ─────────────────────────────────────────────────────────

/**
 * Stem illustration for SEAMO-18-A-Q15.
 * Shows a chicken (2 legs) and a rabbit (4 legs) side-by-side with leg-count
 * badges anchoring the key facts of the word problem.
 */
export default function ChickenRabbit18A15Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Seekor ayam (2 kaki) dan seekor kelinci (4 kaki) di peternakan"
    >
      <svg
        viewBox="0 0 280 130"
        width="280"
        height="130"
        aria-hidden="true"
        style={{ maxWidth: '100%' }}
      >
        {/* ground strip */}
        <rect x={0} y={110} width={280} height={20} fill="#D1FAE5" rx={4} />
        <line x1={0} y1={110} x2={280} y2={110} stroke="#6EE7B7" strokeWidth={1.5} />

        {/* chicken at left */}
        <Chicken cx={80} cy={78} size={52} />

        {/* rabbit at right */}
        <Rabbit cx={200} cy={72} size={52} />

        {/* leg-count badge — chicken */}
        <rect x={50} y={4} width={60} height={22} rx={11} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={1.5} />
        <text
          x={80}
          y={19}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill="#92400E"
          fontFamily="inherit"
        >
          2 kaki
        </text>

        {/* leg-count badge — rabbit */}
        <rect x={170} y={4} width={60} height={22} rx={11} fill="#EDE9FE" stroke="#7C3AED" strokeWidth={1.5} />
        <text
          x={200}
          y={19}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill="#4C1D95"
          fontFamily="inherit"
        >
          4 kaki
        </text>

        {/* connector dots */}
        <line x1={80} y1={26} x2={80} y2={36} stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3,2" />
        <line x1={200} y1={26} x2={200} y2={36} stroke="#7C3AED" strokeWidth={1.5} strokeDasharray="3,2" />
      </svg>
    </div>
  )
}
