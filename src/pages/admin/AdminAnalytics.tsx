import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import { formatDateLabel } from '../../lib/youtube'
import AdminPageHeader from '../../components/admin/AdminPageHeader'

interface AnalyticsOverview {
  rangeDays: number
  counts: {
    visitors: number
    pageViews: number
    registrations: number
    logins: number
    scoreAttempts: number
  }
  funnel: {
    anonScoreSessions: number
    anonScoreThenRegistered: number
    registerClicks: number
    registerClicksThenRegistered: number
  }
  eventBreakdown: Array<{ eventName: string; total: number }>
  recentEvents: Array<{
    id: string
    eventName: string
    sessionId: string | null
    userId: string | null
    path: string | null
    metadata: unknown
    createdAt: string
  }>
  traffic: Array<{ day: string; visitors: number; pageViews: number }>
}

const PANEL = 'rounded-xl border border-slate-200 bg-white p-4'

const RANGES = [
  { value: 1, label: '24 jam' },
  { value: 7, label: '7 hari' },
  { value: 30, label: '30 hari' },
]

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const response = await api.get('/admin/analytics', { params: { days } })
        setOverview(response.data.data)
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [days])

  const conversionRate = useMemo(() => {
    if (!overview) return 0
    const { anonScoreSessions, anonScoreThenRegistered } = overview.funnel
    if (anonScoreSessions === 0) return 0
    return Math.round((anonScoreThenRegistered / anonScoreSessions) * 100)
  }, [overview])

  const dropOffCount = overview
    ? overview.funnel.anonScoreSessions - overview.funnel.anonScoreThenRegistered
    : 0

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Admin · Analytics"
        title="Funnel & traffic"
        description="Visitor unik, conversion ke daftar, dan event tracking."
        actions={
          <div className="flex gap-1 rounded-md border border-slate-200 bg-white p-0.5">
            {RANGES.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => setDays(range.value)}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                  days === range.value
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        }
      />

      {loading || !overview ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Memuat...</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Stat icon="fa-solid fa-eye" title="Unique visitors" value={overview.counts.visitors} hint={`${overview.counts.pageViews} page views`} />
            <Stat icon="fa-solid fa-user-plus" title="Registrations" value={overview.counts.registrations} hint="Email + Google" />
            <Stat icon="fa-solid fa-arrow-right-to-bracket" title="Logins" value={overview.counts.logins} hint="Returning users" />
            <Stat icon="fa-solid fa-sliders" title="Score submits" value={overview.counts.scoreAttempts} hint="Anon + authed" />
            <Stat icon="fa-solid fa-percent" title="Conversion" value={conversionRate} suffix="%" hint="Anon score → register" />
          </div>

          <div>
            <div className={PANEL}>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Funnel</div>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-qupu-brand-blue">
                Anon score → register
              </h2>
              <p className="mt-1 text-sm font-semibold text-qupu-muted">
                Session yang ngeklik save score tanpa login lalu ujungnya daftar.
              </p>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <FunnelStep
                  step={1}
                  label="Klik save score (anon)"
                  value={overview.funnel.anonScoreSessions}
                  color="#FB923C"
                />
                <FunnelStep
                  step={2}
                  label="Lanjut daftar"
                  value={overview.funnel.anonScoreThenRegistered}
                  color="#3B82F6"
                />
                <FunnelStep
                  step={3}
                  label="Drop-off"
                  value={dropOffCount}
                  color="#EF4444"
                  isDropOff
                />
              </div>

              <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-qupu-shell p-4 sm:grid-cols-2">
                <Mini label="Klik 'Buat akun' button" value={overview.funnel.registerClicks} />
                <Mini label="...lalu daftar beneran" value={overview.funnel.registerClicksThenRegistered} />
              </div>
            </div>
          </div>

          <div>
            <div className={PANEL}>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Event Breakdown</div>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-qupu-brand-blue">Total per event</h2>
              {overview.eventBreakdown.length === 0 ? (
                <p className="mt-5 text-sm font-medium text-qupu-muted">Belum ada event di rentang ini.</p>
              ) : (
                <div className="mt-5 grid gap-2">
                  {overview.eventBreakdown.map((event) => {
                    const max = overview.eventBreakdown[0]?.total ?? 1
                    const width = Math.max(4, Math.round((event.total / max) * 100))
                    return (
                      <div key={event.eventName} className="grid items-center gap-3 sm:grid-cols-[200px_1fr_auto]">
                        <div className="font-mono text-xs font-bold text-qupu-brand-blue">{event.eventName}</div>
                        <div className="h-3 overflow-hidden rounded-full bg-qupu-cream">
                          <div className="h-full rounded-full bg-qupu-brand-blue" style={{ width: `${width}%` }} />
                        </div>
                        <div className="text-right font-display text-sm font-extrabold text-qupu-brand-orange">{event.total}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className={PANEL}>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Traffic harian</div>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-qupu-brand-blue">Visitors per hari</h2>
              {overview.traffic.length === 0 ? (
                <p className="mt-5 text-sm font-medium text-qupu-muted">Belum ada traffic di rentang ini.</p>
              ) : (
                <div className="mt-5 flex h-40 items-end gap-2 overflow-x-auto pb-2">
                  {overview.traffic.map((day) => {
                    const max = Math.max(...overview.traffic.map((d) => d.pageViews), 1)
                    const heightPct = Math.max(4, Math.round((day.pageViews / max) * 100))
                    return (
                      <div key={day.day} className="flex min-w-[40px] flex-1 flex-col items-center gap-2">
                        <div className="text-[10px] font-bold text-qupu-brand-orange">{day.pageViews}</div>
                        <div
                          className="w-full rounded-t-[0.75rem] bg-qupu-brand-blue"
                          style={{ height: `${heightPct}%` }}
                          title={`${day.visitors} visitors · ${day.pageViews} page views`}
                        />
                        <div className="text-[10px] font-semibold text-qupu-muted">
                          {new Date(day.day).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className={PANEL}>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Recent events</div>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-qupu-brand-blue">Latest 25</h2>
              {overview.recentEvents.length === 0 ? (
                <p className="mt-5 text-sm font-medium text-qupu-muted">Belum ada event di rentang ini.</p>
              ) : (
                <div className="mt-5 grid gap-2">
                  {overview.recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between gap-3 rounded-[1.25rem] bg-qupu-shell px-4 py-2.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="rounded-full bg-qupu-brand-blue px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                          {event.eventName}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium text-qupu-brand-blue">
                            {event.path ?? '—'}
                          </div>
                          <div className="text-[10px] font-semibold text-qupu-muted">
                            {event.sessionId ? `s:${event.sessionId.slice(0, 8)}` : 'no session'}
                            {event.userId ? ` · u:${event.userId.slice(0, 8)}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-[10px] font-semibold text-qupu-muted">
                        {formatDateLabel(event.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({
  icon,
  title,
  value,
  hint,
  suffix,
}: {
  icon: string
  title: string
  value: number
  hint?: string
  suffix?: string
}) {
  return (
    <div className="rounded-[1.75rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
          <i className={`${icon} text-base`} aria-hidden="true" />
        </span>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">{title}</div>
      </div>
      <div className="mt-3 font-display text-3xl font-extrabold text-qupu-brand-blue">
        {value}
        {suffix && <span className="text-xl">{suffix}</span>}
      </div>
      {hint && <div className="mt-1 text-xs font-semibold text-qupu-muted">{hint}</div>}
    </div>
  )
}

function FunnelStep({
  step,
  label,
  value,
  color,
  isDropOff,
}: {
  step: number
  label: string
  value: number
  color: string
  isDropOff?: boolean
}) {
  return (
    <div
      className="relative rounded-[1.5rem] px-4 py-5"
      style={{ backgroundColor: `${color}1F` }}
    >
      <span
        className="absolute -top-3 left-4 rounded-full px-3 py-1 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] text-white"
        style={{ backgroundColor: color }}
      >
        {isDropOff ? 'Drop' : `Step ${step}`}
      </span>
      <div className="mt-2 font-display text-3xl font-extrabold" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-xs font-semibold text-qupu-brand-blue">{label}</div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1rem] bg-white px-4 py-2">
      <div className="text-xs font-semibold text-qupu-muted">{label}</div>
      <div className="font-display text-lg font-extrabold text-qupu-brand-blue">{value}</div>
    </div>
  )
}
