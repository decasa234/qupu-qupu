import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { DashboardRecommendation } from '../../lib/dashboardData'

interface Props {
  streak: number
  // Streak shields owned (0..2) — auto-consume when a day is missed.
  streakShields: number
  recommended: DashboardRecommendation | null
  loginBonusReward: number
  loginBonusClaimed: boolean
  loginBonusClaiming: boolean
  onClaimLoginBonus: () => void
}

// Spark particles for the streak tap burst. Each gets a fixed outward vector.
const STREAK_SPARKS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2
  return {
    dx: `${Math.cos(angle) * 34}px`,
    dy: `${Math.sin(angle) * 34}px`,
    color: ['#FFDD55', '#FFB400', '#FFFFFF'][i % 3],
  }
})

export default function HomeActionCards({
  streak,
  streakShields,
  recommended,
  loginBonusReward,
  loginBonusClaimed,
  loginBonusClaiming,
  onClaimLoginBonus,
}: Props) {
  // Bump a key on each tap so the CSS animations restart from scratch.
  const [streakBurst, setStreakBurst] = useState(0)

  function handleStreakTap() {
    setStreakBurst((n) => n + 1)
  }
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-qupu-brand-orange">
            Aksi Hari Ini
          </p>
          <h2 className="font-display text-xl font-black leading-none text-qupu-brand-blue">
            Main sebentar, lanjut menang.
          </h2>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-qupu-brand-orange text-sm text-white shadow-[0_3px_0_0_#C46123]">
          <i className="fa-solid fa-bolt" aria-hidden="true" />
        </span>
      </div>

      {recommended ? (
        <Link
          to={recommended.href}
          className="block overflow-hidden rounded-[2rem] bg-qupu-brand-blue text-white shadow-[0_6px_0_0_#0E1430] transition-transform active:translate-y-0.5 active:shadow-[0_3px_0_0_#0E1430]"
        >
          {/* Real video thumbnail with overlaid chips + a play target. */}
          <div className="relative aspect-video w-full overflow-hidden bg-qupu-brand-blue">
            {recommended.thumbnailUrl ? (
              <img
                src={recommended.thumbnailUrl}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-qupu-brand-blue to-[#0E1430] text-4xl text-white/40">
                <i className="fa-solid fa-clapperboard" aria-hidden="true" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-qupu-brand-blue via-qupu-brand-blue/10 to-transparent" />
            <div className="absolute left-3 top-3 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-qupu-brand-orange px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-[0_2px_0_0_#B8541A]">
                <i className="fa-solid fa-wand-magic-sparkles text-[8px]" aria-hidden="true" />
                Rekomendasi
              </span>
              <span
                className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white shadow-sm"
                style={{ backgroundColor: recommended.subjectColorHex }}
              >
                {recommended.subjectName}
              </span>
            </div>
            <span className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-xl text-qupu-brand-blue shadow-[0_4px_0_0_rgba(14,20,48,0.5)]">
              <i className="fa-solid fa-play" aria-hidden="true" />
            </span>
          </div>

          <div className="p-4">
            <h3 className="line-clamp-2 font-display text-lg font-black leading-[1.05]">
              {recommended.title}
            </h3>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-qupu-brand-yellow px-2.5 py-1 text-[10px] font-black text-qupu-brand-blue">
                  <i className="fa-solid fa-bolt text-[9px]" aria-hidden="true" />
                  +25 XP
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black text-white">
                  <i className="fa-solid fa-award text-[9px]" aria-hidden="true" />
                  Badge
                </span>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-4 py-2 text-sm font-black text-white shadow-[0_3px_0_0_#B8541A]">
                Mulai
                <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
              </span>
            </div>
          </div>
        </Link>
      ) : (
        <Link
          to="/library"
          className="flex items-center gap-3 rounded-[2rem] bg-qupu-brand-blue p-4 text-white shadow-[0_6px_0_0_#0E1430] transition-transform active:translate-y-0.5 active:shadow-[0_3px_0_0_#0E1430]"
        >
          <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[1.35rem] bg-qupu-brand-orange text-2xl text-white shadow-[0_4px_0_0_#B8541A]">
            <i className="fa-solid fa-compass" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-black leading-[1.05]">
              Jelajahi video latihan
            </h3>
            <p className="mt-1 text-xs font-bold text-white/70">
              Pilih kuis pertamamu dan mulai kumpulkan XP.
            </p>
          </div>
          <i className="fa-solid fa-arrow-right text-sm text-white/70" aria-hidden="true" />
        </Link>
      )}

      {/* Latihan Konsep — mirrors the recommended-video card's footer (reward
          chip + "Mulai" pill) so the two primary actions read as an aligned pair. */}
      <Link
        to="/latihan/wmi/konsep"
        className="block rounded-[2rem] bg-[#FFF8F0] p-4 shadow-[0_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5 active:shadow-[0_3px_0_0_#FFD3B1]"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.25rem] bg-qupu-brand-orange text-2xl text-white shadow-[0_4px_0_0_#B8541A]">
            <i className="fa-solid fa-brain" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-black leading-[1.05] text-qupu-brand-blue">
              Latihan Konsep
            </h3>
            <p className="mt-1 text-xs font-bold leading-tight text-qupu-brand-blue/65">
              Soal matematika tak terbatas — kumpulkan XP tiap jawaban benar.
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-qupu-brand-yellow px-2.5 py-1 text-[10px] font-black text-qupu-brand-blue">
            <i className="fa-solid fa-bolt text-[9px]" aria-hidden="true" />
            +5 XP / soal
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-4 py-2 text-sm font-black text-white shadow-[0_3px_0_0_#B8541A]">
            Mulai
            <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
          </span>
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onClaimLoginBonus}
          disabled={loginBonusClaimed || loginBonusClaiming}
          aria-label={loginBonusClaimed ? 'Hadiah login sudah diambil hari ini' : 'Ambil hadiah login'}
          className="min-h-36 rounded-[1.75rem] bg-[#FFF8F0] p-3.5 text-left shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFD3B1] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_0_#FFD3B1] disabled:active:translate-y-0 disabled:active:shadow-[0_5px_0_0_#FFD3B1]"
        >
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-[1rem] text-xl ${
              loginBonusClaimed
                ? 'bg-[#E3F4D7] text-[#58A700]'
                : 'bg-[#FFE9C4] text-qupu-brand-orange'
            }`}
          >
            <i
              className={loginBonusClaimed ? 'fa-solid fa-circle-check' : 'fa-solid fa-gift'}
              aria-hidden="true"
            />
          </span>
          <h3 className="mt-3 font-display text-base font-black leading-none text-qupu-brand-blue">
            Hadiah Login
          </h3>
          <p className="mt-1 text-[11px] font-semibold leading-tight text-qupu-brand-blue/65">
            {loginBonusClaimed ? 'Sudah diambil. Sampai jumpa besok!' : 'Ambil koin harianmu.'}
          </p>
          {loginBonusClaimed ? (
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#58A700] px-2.5 py-1 text-[10px] font-black text-white">
              <i className="fa-solid fa-check" aria-hidden="true" />
              Diambil
            </span>
          ) : (
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-qupu-brand-orange px-2.5 py-1 text-[10px] font-black text-white">
              {loginBonusClaiming ? (
                <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
              ) : (
                <i className="fa-solid fa-coins" aria-hidden="true" />
              )}
              {loginBonusClaiming ? 'Mengambil...' : `Klaim +${loginBonusReward}`}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={handleStreakTap}
          aria-label={`${streak} hari streak — ketuk untuk semangat`}
          className="relative min-h-36 overflow-hidden rounded-[1.75rem] bg-qupu-brand-blue p-3.5 text-left text-white shadow-[0_5px_0_0_#0E1430] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_0_#0E1430]"
        >
          <span className="relative flex h-11 w-11 items-center justify-center rounded-[1rem] bg-qupu-brand-orange text-xl text-white">
            <i
              key={streakBurst}
              className={`fa-solid fa-fire ${streakBurst > 0 ? 'animate-flame-pop' : ''}`}
              aria-hidden="true"
            />
            {streakBurst > 0 && (
              <span key={`sparks-${streakBurst}`} className="pointer-events-none absolute inset-0">
                {STREAK_SPARKS.map((spark, i) => (
                  <span
                    key={i}
                    className="animate-spark absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: spark.color,
                      // @ts-expect-error — CSS custom props for the burst vector
                      '--dx': spark.dx,
                      '--dy': spark.dy,
                    }}
                  />
                ))}
              </span>
            )}
          </span>
          {streakShields > 0 && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-black text-qupu-brand-yellow">
              <i className="fa-solid fa-shield-halved text-[9px]" aria-hidden="true" />
              x{streakShields}
            </span>
          )}
          <h3 className="mt-3 font-display text-base font-black leading-none">
            {streak} Hari Streak
          </h3>
          <p className="mt-1 text-[11px] font-semibold leading-tight text-white/70">
            {streakShields > 0
              ? `Aman! ${streakShields} pelindung siap jaga streak-mu.`
              : streak > 0
                ? 'Jaga apinya tetap menyala!'
                : 'Mulai streak pertamamu!'}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-qupu-brand-blue">
            <i className="fa-solid fa-hand-pointer text-[9px]" aria-hidden="true" />
            Ketuk aku!
          </span>
        </button>
      </div>
    </section>
  )
}
