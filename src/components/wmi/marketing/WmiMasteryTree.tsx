import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { MASTERY_BRANCHES, MASTERY_TIERS } from '@/data/wmiMarketing'

// Illustrative current position on the level ladder (0-based: 'Jago Muda').
const CURRENT_TIER = 2

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const FRUIT = '#f0853a'
const FRUIT_DARK = '#d96a22'
const TRACK = '#FFE3C7'
const GREEN = '#3f9a63'
const GREEN_DK = '#2f7d4f'

// Anchor SVG scale transforms to each element's own box, not the viewport origin.
const fillBox = { transformBox: 'fill-box', transformOrigin: 'center' } as const

/**
 * A clean vertical "level journey": one trunk, milestones climbing up a single
 * side with their tier names (no alternating labels, no fruit clutter, so
 * nothing overlaps). Done levels show a check, the current one glows.
 */
function LevelTree({ reduce }: { reduce: boolean }) {
  const W = 320
  const H = 440
  const TX = 64 // trunk x
  const TOP = 124 // top milestone y
  const BOT = 408 // bottom milestone y
  const TRUNK_TOP = 70

  const tierY = (i: number) => BOT - (i / (MASTERY_TIERS.length - 1)) * (BOT - TOP)

  const pop = (delay: number): Variants => ({
    hidden: { scale: 0, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { delay, type: 'spring', stiffness: 220, damping: 14 } },
  })

  const parent = reduce
    ? {}
    : ({ initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.4 } } as const)

  return (
    <motion.svg
      viewBox={`0 0 ${W} ${H}`}
      className="mx-auto h-auto w-full max-w-[340px]"
      role="img"
      aria-label="Perjalanan level: dari Pemula sampai Master Cilik, sekarang di Jago Muda."
      {...parent}
    >
      <defs>
        <linearGradient id="wmt-trunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6f4527" />
          <stop offset="50%" stopColor="#8a5a33" />
          <stop offset="100%" stopColor="#6f4527" />
        </linearGradient>
      </defs>

      {/* soft ground */}
      <ellipse cx={TX} cy={BOT + 18} rx={60} ry={11} fill={TRACK} />

      {/* trunk draws upward */}
      <motion.path
        d={`M ${TX} ${BOT + 6} C ${TX - 6} ${(BOT + TRUNK_TOP) / 2} ${TX + 6} ${(BOT + TRUNK_TOP) / 2} ${TX} ${TRUNK_TOP}`}
        fill="none"
        stroke="url(#wmt-trunk)"
        strokeWidth={20}
        strokeLinecap="round"
        initial={reduce ? { pathLength: 1 } : undefined}
        variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 1.1, ease: 'easeInOut' } } }}
      />

      {/* leafy crown = the goal */}
      <motion.g initial={reduce ? { scale: 1, opacity: 1 } : undefined} variants={pop(1.0)} style={fillBox}>
        <circle cx={TX} cy={TRUNK_TOP - 4} r={28} fill={GREEN} />
        <circle cx={TX - 20} cy={TRUNK_TOP + 10} r={18} fill={GREEN_DK} />
        <circle cx={TX + 20} cy={TRUNK_TOP + 10} r={18} fill={GREEN_DK} />
        <circle cx={TX} cy={TRUNK_TOP - 20} r={16} fill={GREEN} />
      </motion.g>

      {/* milestones climbing the trunk, labels on one side */}
      {MASTERY_TIERS.map((tier, i) => {
        const y = tierY(i)
        const cur = i === CURRENT_TIER
        const done = i < CURRENT_TIER
        const reached = i <= CURRENT_TIER
        const r = cur ? 16 : 13
        return (
          <motion.g key={tier} initial={reduce ? { scale: 1, opacity: 1 } : undefined} variants={pop(0.3 + i * 0.18)} style={fillBox}>
            {cur && !reduce && (
              <motion.circle
                cx={TX}
                cy={y}
                r={r + 7}
                fill="none"
                stroke={FRUIT}
                strokeWidth={2.5}
                animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
                style={fillBox}
              />
            )}
            <circle cx={TX} cy={y} r={r} fill={reached ? FRUIT : '#ffffff'} stroke={reached ? FRUIT_DARK : TRACK} strokeWidth={cur ? 4 : 3} />
            {done ? (
              <foreignObject x={TX - 8} y={y - 8} width={16} height={16}>
                <div className="flex h-4 w-4 items-center justify-center text-[9px] text-white">
                  <i className="fa-solid fa-check" aria-hidden="true" />
                </div>
              </foreignObject>
            ) : (
              <text x={TX} y={y + 4} textAnchor="middle" className="font-display" fontSize={cur ? 14 : 12} fontWeight="800" fill={reached ? '#ffffff' : '#94a3b8'}>
                {i + 1}
              </text>
            )}
            <line x1={TX + r} y1={y} x2={TX + r + 12} y2={y} stroke={reached ? FRUIT : TRACK} strokeWidth={2} />
            <text
              x={TX + r + 18}
              y={y + 5}
              textAnchor="start"
              className="font-display"
              fontSize={cur ? 16 : 14}
              fontWeight={cur ? 800 : 700}
              fill={cur ? '#f0853a' : reached ? '#30598A' : '#94a3b8'}
            >
              {tier}
            </text>
          </motion.g>
        )
      })}
    </motion.svg>
  )
}

/** Six domain concepts as clean rows with animated mastery bars. */
function ConceptList({ reduce }: { reduce: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-extrabold text-qupu-brand-blue">Penguasaan konsep</h3>
        <span className="shrink-0 rounded-full bg-qupu-brand-orange/10 px-3 py-1 text-xs font-extrabold text-qupu-brand-orange">
          Level {CURRENT_TIER + 1} · {MASTERY_TIERS[CURRENT_TIER]}
        </span>
      </div>

      <ul className="mt-4 space-y-2.5">
        {MASTERY_BRANCHES.map((b, i) => (
          <li
            key={b.name}
            className="flex items-center gap-3 rounded-[1.25rem] border-[3px] border-qupu-brand-blue/10 bg-white px-3.5 py-2.5 shadow-[3px_4px_0_0_#FFD3B1]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-qupu-cream text-base text-qupu-brand-orange">
              <i className={b.icon} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-display text-sm font-extrabold text-qupu-brand-blue">{b.name}</span>
                <span className="shrink-0 font-display text-sm font-extrabold text-qupu-brand-orange">{b.progress}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-qupu-brand-orange/15">
                <motion.div
                  className="h-full w-full origin-left rounded-full bg-qupu-brand-orange"
                  initial={reduce ? { scaleX: b.progress / 100 } : { scaleX: 0 }}
                  whileInView={{ scaleX: b.progress / 100 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.9, delay: i * 0.07, ease: EASE }}
                  style={{ transformOrigin: 'left' }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * "Pohon penguasaan konsep" — a clean two-part view: a vertical level journey
 * (left) and the six concept mastery bars (right). Replaces the cluttered
 * all-in-one tree where labels overlapped the trunk and fruits.
 */
export default function WmiMasteryTree() {
  const reduce = useReducedMotion() ?? false

  return (
    <div>
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Naik level</div>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-qupu-brand-blue sm:text-3xl">Pohon penguasaan konsep</h2>
        <p className="mx-auto mt-1 max-w-lg text-sm font-semibold text-qupu-muted">
          Tiap konsep tumbuh saat anak makin paham. Kumpulkan XP, naik dari Pemula sampai Master Cilik.
        </p>
      </div>

      <div className="mt-8 grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
        <LevelTree reduce={reduce} />
        <ConceptList reduce={reduce} />
      </div>

      <p className="mt-6 text-center text-[11px] font-medium text-qupu-muted/70">Ilustrasi perjalanan belajar.</p>
    </div>
  )
}
