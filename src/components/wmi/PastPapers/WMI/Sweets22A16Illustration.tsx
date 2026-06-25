// Sweets22A16Illustration.tsx
//
// Stem illustration for SEAMO-22-A-Q16:
//   "The teacher has a bag of sweets. If she gives each student 7 sweets,
//    3 sweets remain. If she gives each student 8 sweets, she needs 5 more."
//
// Shows a bag of sweets and two scenarios side-by-side:
//   Left  — 7 per student, 3 leftover (green ✓)
//   Right — 8 per student, 5 short   (red  ✗)
//
// No geometric primitive applies. Pure SVG, SSR-safe (no hooks, no framer-motion).
//
// VISUALS entry (return as text — do NOT add to registry.ts here):
//   'SEAMO-22-A-Q16': {
//     illustration: () => import('./Sweets22A16Illustration'),
//     explainer:    () => import('./Sweets22A16Explainer'),
//   }

// ── Sweet glyph (candy icon) ──────────────────────────────────────────────────

function Sweet({ cx = 0, cy = 0, size = 16, color = '#F472B6' }: {
  cx?: number; cy?: number; size?: number; color?: string
}) {
  const r = size / 2
  return (
    <g transform={`translate(${cx},${cy})`}>
      {/* wrapper twists */}
      <ellipse cx={-r - 3} cy={0} rx={4} ry={r * 0.45} fill={color} opacity={0.7} transform="rotate(-20)" />
      <ellipse cx={r + 3}  cy={0} rx={4} ry={r * 0.45} fill={color} opacity={0.7} transform="rotate(20)" />
      {/* body */}
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.65} fill={color} />
      {/* stripe */}
      <ellipse cx={0} cy={0} rx={r * 0.5} ry={r * 0.25} fill="white" opacity={0.4} />
    </g>
  )
}

// ── Bag glyph ─────────────────────────────────────────────────────────────────

function Bag({ cx = 0, cy = 0, w = 54, h = 64 }: {
  cx?: number; cy?: number; w?: number; h?: number
}) {
  const x = cx - w / 2
  const y = cy - h / 2
  return (
    <g>
      {/* body */}
      <rect x={x} y={y + 14} width={w} height={h - 14} rx={8} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2} />
      {/* neck */}
      <rect x={cx - w * 0.25} y={y + 6} width={w * 0.5} height={12} rx={3} fill="#FDE68A" stroke="#F59E0B" strokeWidth={1.5} />
      {/* knot / tie */}
      <ellipse cx={cx} cy={y + 6} rx={w * 0.2} ry={5} fill="#F59E0B" />
      {/* ribbon bow left */}
      <ellipse cx={cx - 10} cy={y + 3} rx={8} ry={5} fill="#F59E0B" opacity={0.8} transform={`rotate(-20 ${cx - 10} ${y + 3})`} />
      {/* ribbon bow right */}
      <ellipse cx={cx + 10} cy={y + 3} rx={8} ry={5} fill="#F59E0B" opacity={0.8} transform={`rotate(20 ${cx + 10} ${y + 3})`} />
      {/* sweets inside (decorative) */}
      <Sweet cx={cx - 10} cy={cy + 8}  size={12} color="#FB7185" />
      <Sweet cx={cx + 10} cy={cy + 2}  size={12} color="#A78BFA" />
      <Sweet cx={cx}      cy={cy + 18} size={12} color="#34D399" />
    </g>
  )
}

// ── Student figure ────────────────────────────────────────────────────────────

function Student({ cx = 0, cy = 0, size = 32 }: { cx?: number; cy?: number; size?: number }) {
  const s = size / 32
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      {/* head */}
      <circle cx={0} cy={-22} r={9} fill="#FDBA74" />
      {/* hair */}
      <ellipse cx={0} cy={-29} rx={9} ry={4} fill="#92400E" />
      {/* body */}
      <rect x={-10} y={-13} width={20} height={20} rx={4} fill="#60A5FA" />
      {/* legs */}
      <rect x={-8} y={7} width={6} height={14} rx={3} fill="#1E40AF" />
      <rect x={2}  y={7} width={6} height={14} rx={3} fill="#1E40AF" />
      {/* arms */}
      <rect x={-18} y={-12} width={8} height={5} rx={2.5} fill="#FDBA74" />
      <rect x={10}  y={-12} width={8} height={5} rx={2.5} fill="#FDBA74" />
    </g>
  )
}

// ── Section panel ─────────────────────────────────────────────────────────────

function Panel({
  x, y, w, h, label, sublabel, ok,
}: {
  x: number; y: number; w: number; h: number
  label: string; sublabel: string; ok: boolean
}) {
  const bg   = ok ? '#F0FDF4' : '#FFF1F2'
  const bdr  = ok ? '#86EFAC' : '#FCA5A5'
  const icon = ok ? '✓' : '✗'
  const ic   = ok ? '#16A34A' : '#DC2626'
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={bg} stroke={bdr} strokeWidth={2} />
      {/* icon badge */}
      <circle cx={x + w - 18} cy={y + 18} r={12} fill={ic} />
      <text x={x + w - 18} y={y + 23} textAnchor="middle" fontSize={13} fontWeight={800} fill="white" fontFamily="inherit">
        {icon}
      </text>
      {/* label */}
      <text x={x + w / 2} y={y + 20} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1C1917" fontFamily="inherit">
        {label}
      </text>
      {/* sublabel */}
      <text x={x + w / 2} y={y + 36} textAnchor="middle" fontSize={11} fill="#57534E" fontFamily="inherit">
        {sublabel}
      </text>
    </g>
  )
}

// ── Main illustration ─────────────────────────────────────────────────────────

const W = 380
const H = 180

/**
 * Stem illustration for SEAMO-22-A-Q16.
 *
 * Left panel:  7 per student, 3 remain  (green)
 * Right panel: 8 per student, 5 short   (red)
 * Centre: teacher's bag of sweets.
 */
export default function Sweets22A16Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Dua skenario pembagian permen: 7 per siswa (sisa 3) vs 8 per siswa (kurang 5)"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        aria-hidden="true"
        style={{ maxWidth: '100%' }}
      >
        {/* ── Left panel: 7 per student, 3 remain ── */}
        <Panel x={8} y={8} w={158} h={164} label="7 per siswa" sublabel="sisa 3 permen" ok={true} />

        {/* 3 student figures */}
        <Student cx={40}  cy={95} size={30} />
        <Student cx={85}  cy={95} size={30} />
        <Student cx={130} cy={95} size={30} />

        {/* sweets per student: 7 mini dots */}
        {[40, 85, 130].map((sx, i) => (
          <g key={i}>
            {Array.from({ length: 7 }, (_, j) => (
              <Sweet
                key={j}
                cx={sx - 18 + j * 6}
                cy={116}
                size={6}
                color={j < 3 ? '#86EFAC' : '#6EE7B7'}
              />
            ))}
          </g>
        ))}

        {/* leftover sweets */}
        <text x={87} y={155} textAnchor="middle" fontSize={10} fill="#166534" fontWeight={600} fontFamily="inherit">
          sisa:
        </text>
        {Array.from({ length: 3 }, (_, j) => (
          <Sweet key={j} cx={100 + j * 10} cy={151} size={8} color="#4ADE80" />
        ))}

        {/* ── Centre bag ── */}
        <Bag cx={W / 2} cy={80} w={54} h={70} />
        <text x={W / 2} y={160} textAnchor="middle" fontSize={11} fill="#92400E" fontWeight={700} fontFamily="inherit">
          Kantong Permen
        </text>

        {/* ── Right panel: 8 per student, 5 short ── */}
        <Panel x={214} y={8} w={158} h={164} label="8 per siswa" sublabel="kurang 5 permen" ok={false} />

        {/* 3 student figures */}
        <Student cx={244} cy={95} size={30} />
        <Student cx={290} cy={95} size={30} />
        <Student cx={336} cy={95} size={30} />

        {/* sweets per student: 8 per student, last student only gets 3 (5 short) */}
        {[244, 290].map((sx, i) => (
          <g key={i}>
            {Array.from({ length: 8 }, (_, j) => (
              <Sweet key={j} cx={sx - 21 + j * 6} cy={116} size={6} color="#FCA5A5" />
            ))}
          </g>
        ))}
        {/* last student short */}
        {Array.from({ length: 3 }, (_, j) => (
          <Sweet key={j} cx={315 + j * 6} cy={116} size={6} color="#FCA5A5" />
        ))}
        {Array.from({ length: 5 }, (_, j) => (
          <g key={j}>
            <circle cx={333 + j * 6} cy={116} r={3} fill="none" stroke="#FCA5A5" strokeWidth={1.2} strokeDasharray="2,1" />
          </g>
        ))}

        {/* shortage label */}
        <text x={290} y={152} textAnchor="middle" fontSize={10} fill="#991B1B" fontWeight={600} fontFamily="inherit">
          butuh 5 lagi
        </text>
        {Array.from({ length: 5 }, (_, j) => (
          <g key={j}>
            <text x={271 + j * 11} y={162} fontSize={10} fill="#DC2626" fontFamily="inherit">?</text>
          </g>
        ))}
      </svg>
    </div>
  )
}
