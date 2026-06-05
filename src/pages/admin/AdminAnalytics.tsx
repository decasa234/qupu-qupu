import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import { formatDateLabel } from '../../lib/youtube'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { Panel, SegmentedControl, Skeleton, StatCard } from '../../components/admin/ui'

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

const RANGES = [
  { value: 1, label: '24 jam' },
  { value: 7, label: '7 hari' },
  { value: 30, label: '30 hari' },
]

/* Panel title block — brand-orange eyebrow + brand-blue heading, the same
   identity rhythm as AdminPageHeader, applied to each analytics section. */
function PanelTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-qupu-brand-orange">{eyebrow}</div>
      <h2 className="mt-1 font-display text-xl font-extrabold text-qupu-brand-blue">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-admin-muted">{subtitle}</p>}
    </div>
  )
}

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
          <SegmentedControl<string>
            value={String(days)}
            onChange={(value) => setDays(Number(value))}
            options={RANGES.map((range) => ({ value: String(range.value), label: range.label }))}
          />
        }
      />

      {loading || !overview ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard
              icon="fa-solid fa-eye"
              label="Unique visitors"
              value={overview.counts.visitors}
              hint={`${overview.counts.pageViews} page views`}
            />
            <StatCard
              icon="fa-solid fa-user-plus"
              label="Registrations"
              value={overview.counts.registrations}
              hint="Email + Google"
            />
            <StatCard
              icon="fa-solid fa-arrow-right-to-bracket"
              label="Logins"
              value={overview.counts.logins}
              hint="Returning users"
            />
            <StatCard
              icon="fa-solid fa-sliders"
              label="Score submits"
              value={overview.counts.scoreAttempts}
              hint="Anon + authed"
            />
            <StatCard
              icon="fa-solid fa-percent"
              label="Conversion"
              value={conversionRate}
              suffix="%"
              hint="Anon score → register"
            />
          </div>

          <Panel>
            <PanelTitle
              eyebrow="Funnel"
              title="Anon score → register"
              subtitle="Session yang ngeklik save score tanpa login lalu ujungnya daftar."
            />

            <div className="grid gap-4 lg:grid-cols-3">
              <FunnelStep step={1} label="Klik save score (anon)" value={overview.funnel.anonScoreSessions} color="#FB923C" />
              <FunnelStep step={2} label="Lanjut daftar" value={overview.funnel.anonScoreThenRegistered} color="#3B82F6" />
              <FunnelStep step={3} label="Drop-off" value={dropOffCount} color="#EF4444" isDropOff />
            </div>

            <div className="mt-4 grid gap-3 rounded-xl bg-admin-sunk p-4 sm:grid-cols-2">
              <Mini label="Klik 'Buat akun' button" value={overview.funnel.registerClicks} />
              <Mini label="...lalu daftar beneran" value={overview.funnel.registerClicksThenRegistered} />
            </div>
          </Panel>

          <Panel>
            <PanelTitle eyebrow="Event breakdown" title="Total per event" />
            {overview.eventBreakdown.length === 0 ? (
              <p className="text-sm text-admin-muted">Belum ada event di rentang ini.</p>
            ) : (
              <div className="grid gap-2">
                {overview.eventBreakdown.map((event) => {
                  const max = overview.eventBreakdown[0]?.total ?? 1
                  const width = Math.max(4, Math.round((event.total / max) * 100))
                  return (
                    <div key={event.eventName} className="grid items-center gap-3 sm:grid-cols-[200px_1fr_auto]">
                      <div className="font-mono text-xs font-bold text-qupu-brand-blue">{event.eventName}</div>
                      <div className="h-3 overflow-hidden rounded-full bg-admin-sunk">
                        <div className="h-full rounded-full bg-qupu-brand-blue" style={{ width: `${width}%` }} />
                      </div>
                      <div className="text-right font-display text-sm font-extrabold text-qupu-brand-orange">
                        {event.total}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>

          <Panel>
            <PanelTitle eyebrow="Traffic harian" title="Visitors per hari" />
            {overview.traffic.length === 0 ? (
              <p className="text-sm text-admin-muted">Belum ada traffic di rentang ini.</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-semibold text-admin-faint">
                  <span>Maks {Math.max(...overview.traffic.map((d) => d.pageViews), 0)} page views/hari</span>
                  <span>{overview.traffic.length} hari</span>
                </div>
                <div className="rounded-lg bg-admin-sunk/60 p-3">
                  <div className="flex h-40 items-end gap-2 overflow-x-auto">
                    {overview.traffic.map((day) => {
                      const max = Math.max(...overview.traffic.map((d) => d.pageViews), 1)
                      const heightPct = day.pageViews === 0 ? 3 : Math.max(10, Math.round((day.pageViews / max) * 85))
                      return (
                        <div key={day.day} className="flex h-full min-w-[40px] flex-1 flex-col items-center justify-end gap-1">
                          <span className="text-[10px] font-bold text-qupu-brand-orange">{day.pageViews}</span>
                          <div
                            className="w-full rounded-t-md bg-qupu-brand-blue"
                            style={{ height: `${heightPct}%` }}
                            title={`${day.visitors} visitors · ${day.pageViews} page views`}
                          />
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-1 flex gap-2">
                    {overview.traffic.map((day) => (
                      <div key={day.day} className="min-w-[40px] flex-1 text-center text-[10px] font-semibold text-admin-muted">
                        {new Date(day.day).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Panel>

          <Panel>
            <PanelTitle eyebrow="Recent events" title="Latest 25" />
            {overview.recentEvents.length === 0 ? (
              <p className="text-sm text-admin-muted">Belum ada event di rentang ini.</p>
            ) : (
              <div className="grid gap-2">
                {overview.recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-admin-sunk px-4 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="shrink-0 rounded bg-qupu-brand-blue px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                        {event.eventName}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium text-admin-ink">{event.path ?? '—'}</div>
                        <div className="text-[10px] font-semibold text-admin-faint">
                          {event.sessionId ? `s:${event.sessionId.slice(0, 8)}` : 'no session'}
                          {event.userId ? ` · u:${event.userId.slice(0, 8)}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-[10px] font-semibold text-admin-muted">
                      {formatDateLabel(event.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}
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
    <div className="relative rounded-xl px-4 py-5" style={{ backgroundColor: `${color}1F` }}>
      <span
        className="absolute -top-3 left-4 rounded-full px-3 py-1 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] text-white"
        style={{ backgroundColor: color }}
      >
        {isDropOff ? 'Drop' : `Step ${step}`}
      </span>
      <div className="mt-2 font-display text-3xl font-extrabold" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-xs font-semibold text-admin-ink">{label}</div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-admin-line bg-white px-4 py-2">
      <div className="text-xs font-semibold text-admin-muted">{label}</div>
      <div className="font-display text-lg font-extrabold text-qupu-brand-blue">{value}</div>
    </div>
  )
}
