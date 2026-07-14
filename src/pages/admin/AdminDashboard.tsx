import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { formatDateLabel } from '../../lib/youtube'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import BadgeCurve from '../../components/BadgeCurve'
import { Panel, SectionHeading, Skeleton, StatCard, Tag } from '../../components/admin/ui'

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

const PANEL_LINK = 'text-xs font-semibold text-admin-muted transition-colors hover:text-qupu-brand-blue'

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

      <Link
        to="/admin/wmi-concepts"
        className="group flex items-center gap-3 rounded-2xl border border-admin-line bg-admin-card p-4 shadow-admin-soft transition-colors hover:border-qupu-brand-blue/40 hover:bg-admin-sunk sm:p-5"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-qupu-brand-blue/10 text-qupu-brand-blue">
          <i className="fa-solid fa-flask text-base" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm font-extrabold text-admin-ink">Math Olympiad Concept Proofreading</div>
          <div className="text-xs text-admin-muted">
            Preview every concept generator and save a verdict &amp; notes per concept.
          </div>
        </div>
        <i
          className="fa-solid fa-arrow-right text-admin-faint transition-transform group-hover:translate-x-0.5 group-hover:text-qupu-brand-blue"
          aria-hidden="true"
        />
      </Link>

      {loading ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <Skeleton className="h-52 rounded-2xl" />
            <Skeleton className="h-52 rounded-2xl" />
          </div>
        </div>
      ) : error || !stats ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon="fa-solid fa-users"
              label="Total Users"
              value={stats.counts.usersTotal}
              hint={`${stats.counts.parentsTotal} parent · ${stats.counts.adminsTotal} admin`}
            />
            <StatCard
              icon="fa-solid fa-film"
              label="Videos"
              value={stats.counts.videosTotal}
              hint={`${stats.counts.videosPublished} published`}
            />
            <StatCard
              icon="fa-solid fa-list-check"
              label="Attempts"
              value={stats.counts.attemptsTotal}
              hint={`${stats.counts.childrenTotal} children`}
            />
            <StatCard icon="fa-solid fa-medal" label="Badges Awarded" value={stats.counts.badgesTotal} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel>
              <SectionHeading
                right={
                  <Link to="/admin/videos" className={PANEL_LINK}>
                    Videos →
                  </Link>
                }
              >
                Recent attempts
              </SectionHeading>
              {stats.recentAttempts.length === 0 ? (
                <p className="mt-3 text-sm text-admin-muted">Belum ada attempt.</p>
              ) : (
                <ul className="mt-3 divide-y divide-admin-line">
                  {stats.recentAttempts.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-admin-ink">{a.videoTitle}</div>
                        <div className="truncate text-xs text-admin-muted">
                          {a.childName} · {a.correctAnswers}/{a.totalQuestions} · {formatDateLabel(a.createdAt)}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Tag color={a.subjectColorHex}>{a.subjectName}</Tag>
                        <span className="rounded bg-admin-sunk px-1.5 py-0.5 font-mono text-[0.6875rem] font-bold text-admin-ink">
                          {a.scorePercentage}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel>
              <SectionHeading
                right={
                  <Link to="/admin/users" className={PANEL_LINK}>
                    Users →
                  </Link>
                }
              >
                Recent signups
              </SectionHeading>
              {stats.recentSignups.length === 0 ? (
                <p className="mt-3 text-sm text-admin-muted">Belum ada user baru.</p>
              ) : (
                <ul className="mt-3 divide-y divide-admin-line">
                  {stats.recentSignups.map((u) => (
                    <li key={u.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-admin-ink">{u.name}</div>
                        <div className="truncate text-xs text-admin-muted">{u.email}</div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Tag tone={u.role === 'admin' ? 'ink' : 'neutral'}>{u.role}</Tag>
                        <span className="text-[0.6875rem] text-admin-muted">{formatDateLabel(u.createdAt)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel>
            <SectionHeading
              right={
                <Link to="/admin/subjects" className={PANEL_LINK}>
                  Subjects →
                </Link>
              }
            >
              Top subjects
            </SectionHeading>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {stats.topSubjects.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-admin-line bg-admin-sunk px-3 py-2"
                >
                  <BadgeCurve color={s.colorHex} size={32} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-admin-ink">{s.name}</div>
                    <div className="text-[0.6875rem] text-admin-muted">
                      {s.totalBadges} badge · {s.totalVideos} video
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  )
}
