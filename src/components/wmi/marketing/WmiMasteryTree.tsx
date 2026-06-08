import { MASTERY_BRANCHES, MASTERY_TIERS } from '@/data/wmiMarketing'

// Illustrative current position on the level ladder.
const CURRENT_TIER = 2

function Ring({ pct, icon }: { pct: number; icon: string }) {
  const r = 26
  const circumference = 2 * Math.PI * r
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#FFE3C7" strokeWidth="7" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#f0853a"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg text-qupu-brand-blue">
        <i className={icon} aria-hidden="true" />
      </span>
    </div>
  )
}

/**
 * Carousel slide 3 (polished placeholder): an illustrative concept mastery
 * tree. Branches mirror the real concept taxonomy; the level spine mirrors the
 * real level_tiers ladder. Values are illustrative (the public visitor has no
 * account yet), so it shows the journey a child climbs.
 */
export default function WmiMasteryTree() {
  return (
    <div>
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Naik level</div>
        <h3 className="mt-1 font-display text-2xl font-extrabold text-qupu-brand-blue">Pohon penguasaan konsep</h3>
        <p className="mx-auto mt-1 max-w-lg text-sm font-semibold text-qupu-muted">
          Tiap cabang tumbuh saat anak makin paham. Kumpulkan XP, naik dari Pemula sampai Master Cilik.
        </p>
      </div>

      {/* level spine */}
      <div className="relative mx-auto mt-7 flex max-w-xl items-start justify-between">
        <div className="absolute inset-x-3 top-4 h-1.5 rounded-full bg-qupu-peach" aria-hidden="true" />
        <div
          className="absolute left-3 top-4 h-1.5 rounded-full bg-qupu-brand-orange"
          style={{ width: `calc(${(CURRENT_TIER / (MASTERY_TIERS.length - 1)) * 100}% - 0.75rem)` }}
          aria-hidden="true"
        />
        {MASTERY_TIERS.map((tier, i) => (
          <div key={tier} className="relative z-10 flex w-12 flex-col items-center sm:w-16">
            <span
              className={
                i <= CURRENT_TIER
                  ? 'flex h-8 w-8 items-center justify-center rounded-full bg-qupu-brand-orange font-display text-xs font-extrabold text-white shadow-[0_2px_0_0_#B8541A]'
                  : 'flex h-8 w-8 items-center justify-center rounded-full border-2 border-qupu-peach bg-white font-display text-xs font-extrabold text-qupu-muted'
              }
            >
              {i < CURRENT_TIER ? <i className="fa-solid fa-check" aria-hidden="true" /> : i + 1}
            </span>
            <span className="mt-1.5 text-center text-[8px] font-bold leading-tight text-qupu-brand-blue/80 sm:text-[10px]">{tier}</span>
          </div>
        ))}
      </div>

      {/* branches */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MASTERY_BRANCHES.map((b) => (
          <div
            key={b.name}
            className="flex items-center gap-4 rounded-[1.5rem] border-[3px] border-qupu-brand-blue/15 bg-white p-4 shadow-[3px_4px_0_0_#FFD3B1]"
          >
            <Ring pct={b.progress} icon={b.icon} />
            <div className="min-w-0">
              <div className="font-display text-sm font-extrabold text-qupu-brand-blue">{b.name}</div>
              <div className="truncate text-xs font-semibold text-qupu-muted">{b.skill}</div>
              <div className="mt-1 text-[11px] font-extrabold text-qupu-brand-orange">{b.progress}% dikuasai</div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 text-center text-[11px] font-medium text-qupu-muted/70">
        Ilustrasi perjalanan belajar. Anak melihat progres aslinya setelah masuk.
      </p>
    </div>
  )
}
