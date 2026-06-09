import { motion, useReducedMotion, type Transition, type Variants } from 'framer-motion'
import { MASTERY_BRANCHES, MASTERY_TIERS } from '@/data/wmiMarketing'

// Illustrative current position on the level ladder (0-based: 'Jago Muda').
const CURRENT_TIER = 2

// ---- palette ----
const TRUNK = '#8a5a33'
const TRUNK_DARK = '#6f4527'
const BRANCH = '#2f7d4f' // leafy green-blue
const LEAF = '#3f9a63'
const FRUIT = '#f0853a'
const FRUIT_HI = '#ffdd55'
const RING_TRACK = '#FFE3C7'
const RING = '#f0853a'

// ---- geometry (viewBox 0 0 420 520) ----
const GROUND_Y = 470
const TRUNK_BOTTOM = 466
const TRUNK_TOP = 96
const CX = 210 // trunk centre x

interface BranchGeo {
  side: -1 | 1
  ax: number // trunk attach x
  ay: number // trunk attach y
  fx: number // fruit centre x
  fy: number // fruit centre y
}

// 6 branches: 3 left, 3 right, fanning from low/wide to high/narrow.
const GEO: BranchGeo[] = [
  { side: -1, ax: CX - 6, ay: 372, fx: 70, fy: 360 },
  { side: -1, ax: CX - 4, ay: 288, fx: 56, fy: 250 },
  { side: -1, ax: CX - 2, ay: 206, fx: 92, fy: 150 },
  { side: 1, ax: CX + 6, ay: 330, fx: 350, fy: 318 },
  { side: 1, ax: CX + 4, ay: 244, fx: 364, fy: 206 },
  { side: 1, ax: CX + 2, ay: 168, fx: 330, fy: 120 },
]

// Cubic branch from trunk attach point to just before the fruit, bowing out then up.
function branchPath(g: BranchGeo): string {
  const endX = g.fx - g.side * 30
  const endY = g.fy + 6
  const midX = g.ax + (endX - g.ax) * 0.55
  const c1x = g.ax + g.side * 26
  const c1y = g.ay - 6
  const c2y = (g.ay + endY) / 2 - 22
  return `M ${g.ax} ${g.ay} C ${c1x} ${c1y} ${midX} ${c2y} ${endX} ${endY}`
}

// Level node y along the trunk (bottom = Pemula, top = Master Cilik).
function tierY(i: number): number {
  const t = i / (MASTERY_TIERS.length - 1)
  return TRUNK_BOTTOM - t * (TRUNK_BOTTOM - TRUNK_TOP)
}

const FRUIT_R = 30
const RING_R = 36
const RING_C = 2 * Math.PI * RING_R

const draw: Transition = { duration: 0.9, ease: 'easeInOut' }
// Anchor SVG transforms (scale) to the element's own box, not the viewport origin.
const fillBox = { transformBox: 'fill-box', transformOrigin: 'center' } as const

export default function WmiMasteryTree() {
  const reduce = useReducedMotion()

  // Pop variant for fruits, crown, and level nodes.
  const pop = (delay: number): Variants => ({
    hidden: { scale: 0, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: { delay, type: 'spring', stiffness: 220, damping: 13 },
    },
  })

  // When reduced motion: skip the staged growth — render the tree fully grown.
  // We do this by NOT mounting the parent's `whileInView` orchestration and
  // forcing every animated child to its final attribute values via `initial`.
  const parentMotion = reduce
    ? {}
    : ({ initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.3 } } as const)

  return (
    <div>
      {/* header */}
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Naik level</div>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-qupu-brand-blue sm:text-3xl">
          Pohon penguasaan konsep
        </h2>
        <p className="mx-auto mt-1 max-w-lg text-sm font-semibold text-qupu-muted">
          Tiap cabang tumbuh saat anak makin paham. Kumpulkan XP, naik dari Pemula sampai Master Cilik.
        </p>
      </div>

      {/* the tree */}
      <div className="mx-auto mt-6 max-w-2xl rounded-[2.5rem] border-[3px] border-qupu-brand-blue/15 bg-qupu-cream p-4 shadow-[6px_8px_0_0_#FFD3B1] sm:p-6">
        <motion.svg
          viewBox="0 0 420 520"
          className="h-auto w-full"
          role="img"
          aria-label="Pohon penguasaan konsep: enam cabang konsep dan lima level dari Pemula sampai Master Cilik."
          {...parentMotion}
        >
          <defs>
            <radialGradient id="wmt-fruit" cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor={FRUIT_HI} />
              <stop offset="55%" stopColor={FRUIT} />
              <stop offset="100%" stopColor="#d96a22" />
            </radialGradient>
            <linearGradient id="wmt-trunk" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={TRUNK_DARK} />
              <stop offset="50%" stopColor={TRUNK} />
              <stop offset="100%" stopColor={TRUNK_DARK} />
            </linearGradient>
          </defs>

          {/* ground mound */}
          <ellipse cx={CX} cy={GROUND_Y} rx="150" ry="20" fill="#FFE3C7" />
          <ellipse cx={CX} cy={GROUND_Y - 3} rx="120" ry="14" fill="#FFD3B1" />

          {/* roots flaring into the ground */}
          <path
            d={`M ${CX - 14} ${TRUNK_BOTTOM} C ${CX - 30} ${GROUND_Y - 4} ${CX - 50} ${GROUND_Y} ${CX - 70} ${GROUND_Y + 6}`}
            fill="none"
            stroke={TRUNK_DARK}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d={`M ${CX + 14} ${TRUNK_BOTTOM} C ${CX + 30} ${GROUND_Y - 4} ${CX + 50} ${GROUND_Y} ${CX + 70} ${GROUND_Y + 6}`}
            fill="none"
            stroke={TRUNK_DARK}
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* trunk — draws upward from the ground */}
          <motion.path
            d={`M ${CX} ${TRUNK_BOTTOM} C ${CX - 8} ${(TRUNK_BOTTOM + TRUNK_TOP) / 2} ${CX + 8} ${(TRUNK_BOTTOM + TRUNK_TOP) / 2} ${CX} ${TRUNK_TOP}`}
            fill="none"
            stroke="url(#wmt-trunk)"
            strokeWidth="22"
            strokeLinecap="round"
            initial={reduce ? { pathLength: 1 } : undefined}
            variants={{
              hidden: { pathLength: 0 },
              show: { pathLength: 1, transition: { ...draw, duration: 1.1 } },
            }}
          />

          {/* crown tuft at the very top */}
          <motion.g
            initial={reduce ? { scale: 1, opacity: 1 } : undefined}
            variants={pop(1.0)}
            style={fillBox}
          >
            <circle cx={CX} cy={TRUNK_TOP - 12} r="30" fill={LEAF} />
            <circle cx={CX - 22} cy={TRUNK_TOP + 2} r="20" fill={BRANCH} />
            <circle cx={CX + 22} cy={TRUNK_TOP + 2} r="20" fill={BRANCH} />
            <circle cx={CX} cy={TRUNK_TOP - 26} r="18" fill={LEAF} />
          </motion.g>

          {/* branches — draw out, staggered, after the trunk */}
          {GEO.map((g, i) => (
            <motion.path
              key={`br-${i}`}
              d={branchPath(g)}
              fill="none"
              stroke={BRANCH}
              strokeWidth="9"
              strokeLinecap="round"
              initial={reduce ? { pathLength: 1 } : undefined}
              variants={{
                hidden: { pathLength: 0 },
                show: { pathLength: 1, transition: { ...draw, delay: 0.9 + i * 0.12 } },
              }}
            />
          ))}

          {/* fruits — pop in, then progress rings fill */}
          {GEO.map((g, i) => {
            const b = MASTERY_BRANCHES[i]
            if (!b) return null
            const ringTarget = RING_C * (1 - b.progress / 100)
            return (
              <motion.g
                key={`fr-${i}`}
                initial={reduce ? { scale: 1, opacity: 1 } : undefined}
                variants={pop(1.5 + i * 0.1)}
                style={fillBox}
              >
                {/* leaf cluster behind the fruit */}
                <circle cx={g.fx - g.side * 18} cy={g.fy - 16} r="15" fill={LEAF} />
                <circle cx={g.fx + g.side * 16} cy={g.fy - 12} r="13" fill={BRANCH} />

                {/* progress ring: track + animated value */}
                <circle cx={g.fx} cy={g.fy} r={RING_R} fill="none" stroke={RING_TRACK} strokeWidth="6" />
                <motion.circle
                  cx={g.fx}
                  cy={g.fy}
                  r={RING_R}
                  fill="none"
                  stroke={RING}
                  strokeWidth="6"
                  strokeLinecap="round"
                  transform={`rotate(-90 ${g.fx} ${g.fy})`}
                  strokeDasharray={RING_C}
                  initial={reduce ? { strokeDashoffset: ringTarget } : undefined}
                  variants={{
                    hidden: { strokeDashoffset: RING_C },
                    show: {
                      strokeDashoffset: ringTarget,
                      transition: { duration: 0.9, ease: 'easeOut', delay: 1.9 + i * 0.1 },
                    },
                  }}
                />

                {/* fruit body + highlight */}
                <circle cx={g.fx} cy={g.fy} r={FRUIT_R} fill="url(#wmt-fruit)" />
                <ellipse cx={g.fx - 8} cy={g.fy - 9} rx="8" ry="5" fill="#ffffff" opacity="0.35" />

                {/* domain icon */}
                <foreignObject x={g.fx - 16} y={g.fy - 16} width="32" height="32">
                  <div className="flex h-8 w-8 items-center justify-center text-base text-white">
                    <i className={b.icon} aria-hidden="true" />
                  </div>
                </foreignObject>

                {/* percentage badge */}
                <rect
                  x={g.fx - 22}
                  y={g.fy + FRUIT_R - 4}
                  width="44"
                  height="18"
                  rx="9"
                  fill="#ffffff"
                  stroke={FRUIT}
                  strokeWidth="2"
                />
                <text
                  x={g.fx}
                  y={g.fy + FRUIT_R + 9}
                  textAnchor="middle"
                  className="font-display"
                  fontSize="11"
                  fontWeight="800"
                  fill="#30598A"
                >
                  {b.progress}%
                </text>
              </motion.g>
            )
          })}

          {/* level nodes along the trunk (bottom -> top) */}
          {MASTERY_TIERS.map((tier, i) => {
            const y = tierY(i)
            const isCurrent = i === CURRENT_TIER
            const isDone = i < CURRENT_TIER
            const reached = i <= CURRENT_TIER
            const r = isCurrent ? 15 : 11
            const labelLeft = i % 2 === 0
            const lx = labelLeft ? CX - 24 : CX + 24
            return (
              <motion.g
                key={`lvl-${i}`}
                initial={reduce ? { scale: 1, opacity: 1 } : undefined}
                variants={pop(0.4 + i * 0.16)}
                style={fillBox}
              >
                {isCurrent && !reduce && (
                  <motion.circle
                    cx={CX}
                    cy={y}
                    r={r + 6}
                    fill="none"
                    stroke={FRUIT}
                    strokeWidth="2.5"
                    opacity="0.5"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 2.4 }}
                    style={fillBox}
                  />
                )}
                <circle
                  cx={CX}
                  cy={y}
                  r={r}
                  fill={reached ? FRUIT : '#ffffff'}
                  stroke={reached ? '#d96a22' : RING_TRACK}
                  strokeWidth={isCurrent ? 4 : 3}
                />
                {isDone ? (
                  <foreignObject x={CX - 8} y={y - 8} width="16" height="16">
                    <div className="flex h-4 w-4 items-center justify-center text-[9px] text-white">
                      <i className="fa-solid fa-check" aria-hidden="true" />
                    </div>
                  </foreignObject>
                ) : (
                  <text
                    x={CX}
                    y={y + 4}
                    textAnchor="middle"
                    className="font-display"
                    fontSize={isCurrent ? 13 : 11}
                    fontWeight="800"
                    fill={reached ? '#ffffff' : '#475569'}
                  >
                    {i + 1}
                  </text>
                )}
                {/* tier label connector + text */}
                <line
                  x1={CX + (labelLeft ? -r : r)}
                  y1={y}
                  x2={labelLeft ? lx + 2 : lx - 2}
                  y2={y}
                  stroke={reached ? FRUIT : RING_TRACK}
                  strokeWidth="2"
                />
                <text
                  x={lx}
                  y={y + 4}
                  textAnchor={labelLeft ? 'end' : 'start'}
                  className="font-display"
                  fontSize={isCurrent ? 13 : 11}
                  fontWeight={isCurrent ? 800 : 700}
                  fill={isCurrent ? '#f0853a' : reached ? '#30598A' : '#94a3b8'}
                >
                  {tier}
                </text>
              </motion.g>
            )
          })}
        </motion.svg>
      </div>

      {/* branch legend — keeps every domain label legible on every width */}
      <ul className="mx-auto mt-5 grid max-w-2xl gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {MASTERY_BRANCHES.map((b) => (
          <li
            key={b.name}
            className="flex items-center gap-3 rounded-[1.25rem] border-[3px] border-qupu-brand-blue/15 bg-white px-3.5 py-2.5 shadow-[3px_4px_0_0_#FFD3B1]"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm text-white shadow-[0_2px_0_0_#d96a22]"
              style={{ backgroundColor: FRUIT }}
            >
              <i className={b.icon} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="truncate font-display text-[13px] font-extrabold leading-tight text-qupu-brand-blue">
                {b.name}
              </div>
              <div className="text-[11px] font-extrabold text-qupu-brand-orange">{b.progress}% dikuasai</div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-center text-[11px] font-medium text-qupu-muted/70">Ilustrasi perjalanan belajar.</p>
    </div>
  )
}
