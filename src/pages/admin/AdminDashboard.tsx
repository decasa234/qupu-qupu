import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { formatDateLabel } from '../../lib/youtube'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import BadgeCurve from '../../components/BadgeCurve'

interface AdminStats {
  counts: {
    usersTotal: number
    parentsTotal: number
    adminsTotal: number
    videosTotal: number
    videosPublished: number
    attemptsTotal: number
    badgesTotal: number
    childrenTotal: number
  }
  recentSignups: Array<{
    id: string
    email: string
    name: string
    role: string
    createdAt: string
  }>
  recentAttempts: Array<{
    id: string
    scorePercentage: number
    correctAnswers: number
    totalQuestions: number
    createdAt: string
    childName: string
    videoTitle: string
    videoSlug: string
    subjectName: string
    subjectColorHex: string
  }>
  topSubjects: Array<{
    id: string
    name: string
    colorHex: string
    totalBadges: number
    totalVideos: number
  }>
}

const PANEL = 'rounded-xl border border-slate-200 bg-white p-4'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await api.get('/admin/stats')
        setStats(response.data.data)
      } catch (loadError) {
        console.error('Failed to load admin stats:', loadError)
        setError('Gagal memuat data dashboard.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Admin · Dashboard"
        title="Operasional QUPU"
        description="Snapshot user, video, attempt, dan badge."
      />

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Memuat...
        </div>
      ) : error || !stats ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon="fa-solid fa-users" label="Total Users" value={stats.counts.usersTotal} hint={`${stats.counts.parentsTotal} parent · ${stats.counts.adminsTotal} admin`} />
            <Stat icon="fa-solid fa-film" label="Videos" value={stats.counts.videosTotal} hint={`${stats.counts.videosPublished} published`} />
            <Stat icon="fa-solid fa-list-check" label="Attempts" value={stats.counts.attemptsTotal} hint={`${stats.counts.childrenTotal} children`} />
            <Stat icon="fa-solid fa-medal" label="Badges Awarded" value={stats.counts.badgesTotal} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className={PANEL}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-slate-700">Recent attempts</h2>
                <Link to="/admin/videos" className="text-xs font-semibold text-slate-600 hover:text-slate-900">Videos →</Link>
              </div>
              {stats.recentAttempts.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Belum ada attempt.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {stats.recentAttempts.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-slate-900">{a.videoTitle}</div>
                        <div className="truncate text-xs text-slate-500">
                          {a.childName} · {a.correctAnswers}/{a.totalQuestions} · {formatDateLabel(a.createdAt)}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                          style={{ backgroundColor: a.subjectColorHex }}
                        >
                          {a.subjectName}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                          {a.scorePercentage}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={PANEL}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-slate-700">Recent signups</h2>
                <Link to="/admin/users" className="text-xs font-semibold text-slate-600 hover:text-slate-900">Users →</Link>
              </div>
              {stats.recentSignups.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Belum ada user baru.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {stats.recentSignups.map((u) => (
                    <li key={u.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-slate-900">{u.name}</div>
                        <div className="truncate text-xs text-slate-500">{u.email}</div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          {u.role}
                        </span>
                        <span className="text-[11px] text-slate-500">{formatDateLabel(u.createdAt)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={PANEL}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-slate-700">Top subjects</h2>
              <Link to="/admin/subjects" className="text-xs font-semibold text-slate-600 hover:text-slate-900">Subjects →</Link>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {stats.topSubjects.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <BadgeCurve color={s.colorHex} size={32} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-900">{s.name}</div>
                    <div className="text-[11px] text-slate-500">{s.totalBadges} badge · {s.totalVideos} video</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: string
  label: string
  value: number
  hint?: string
}) {
  return (
    <div className={PANEL}>
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
        <i className={icon} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-extrabold text-slate-900">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-slate-500">{hint}</div>}
    </div>
  )
}
