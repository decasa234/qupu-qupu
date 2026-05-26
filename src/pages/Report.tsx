import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import AuthCard from '../components/AuthCard'
import SkeletonCard from '../components/SkeletonCard'
import RaporHeader from '../components/report/RaporHeader'
import RaporSummary from '../components/report/RaporSummary'
import RaporSubjectTable from '../components/report/RaporSubjectTable'
import RaporVideoBreakdown from '../components/report/RaporVideoBreakdown'
import RaporNote from '../components/report/RaporNote'
import RaporFooter from '../components/report/RaporFooter'
import PrintButton from '../components/report/PrintButton'
import DashboardKpis from '../components/dashboard/DashboardKpis'
import DashboardActivity from '../components/dashboard/DashboardActivity'
import DashboardSubjects from '../components/dashboard/DashboardSubjects'
import DashboardRecommended from '../components/dashboard/DashboardRecommended'
import DashboardAttempts from '../components/dashboard/DashboardAttempts'
import {
  dashboardFromApi,
  type DashboardApiResponse,
  type DashboardViewModel,
} from '../lib/dashboardData'
import type { MemberProgress } from '../types'

export default function ReportPage() {
  const { children, activeChildId } = useAuthStore()
  const activeChild = children.find((c) => c.id === activeChildId) ?? null
  const [progress, setProgress] = useState<MemberProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ageGroupName, setAgeGroupName] = useState<string | null>(null)
  const [vm, setVm] = useState<DashboardViewModel | null>(null)

  useEffect(() => {
    if (!activeChildId) return
    let cancelled = false
    ;(async () => {
      try {
        const response = await api.get('/me/dashboard', { params: { childId: activeChildId } })
        if (cancelled) return
        setVm(dashboardFromApi(response.data.data as DashboardApiResponse))
      } catch (err) {
        console.error('Failed to load dashboard sections for report:', err)
      }
    })()
    return () => { cancelled = true }
  }, [activeChildId])

  useEffect(() => {
    if (!activeChildId) {
      setProgress(null)
      setLoading(false)
      return
    }
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [progressRes, metaRes] = await Promise.all([
          api.get('/me/progress', { params: { childId: activeChildId } }),
          api.get('/public/meta'),
        ])
        const data = progressRes.data.data as MemberProgress
        setProgress(data)
        const ageGroups: Array<{ id: string; name: string }> = metaRes.data.data?.ageGroups ?? []
        setAgeGroupName(
          ageGroups.find((g) => g.id === data.child?.ageGroupId)?.name ?? null,
        )
      } catch (loadError) {
        console.error('Failed to load report:', loadError)
        setError('Gagal memuat rapor.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [activeChildId])

  if (!activeChildId || !activeChild) {
    return (
      <AuthCard
        mascotSrc="/hero-mascot.png"
        eyebrow="Rapor"
        title="Pilih profil anak dulu"
        subtitle="Rapor dibuat per anak. Pilih profil dari switcher di navbar."
      >
        <Link
          to="/onboarding/child"
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe"
        >
          Tambah profil anak
        </Link>
      </AuthCard>
    )
  }

  if (loading) return <SkeletonCard />
  if (error || !progress) {
    return (
      <div className="rounded-3xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
        {error || 'Gagal memuat rapor.'}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3" data-print-hide>
        <Link to="/dashboard" className="text-sm font-bold text-qupu-brand-blue underline">
          ← Kembali ke dashboard
        </Link>
        <PrintButton />
      </div>

      <article className="rounded-2xl bg-white p-6 shadow-soft print:p-0 print:shadow-none">
        <RaporHeader
          childName={activeChild.name}
          ageGroupName={ageGroupName}
          periodStart={progress.periodStart}
          periodEnd={progress.periodEnd}
          avatarColor={activeChild.avatarColor}
        />
        <RaporSummary summary={progress.summary} />

        <h3 className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-qupu-brand-blue">
          Penilaian per mata pelajaran
        </h3>
        <RaporSubjectTable stats={progress.subjectStats} />

        <h3 className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-qupu-brand-blue">
          Rincian video per subject
        </h3>
        <RaporVideoBreakdown stats={progress.subjectStats} />

        <h3 className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-qupu-brand-blue">
          Catatan QUPU
        </h3>
        <RaporNote
          stats={progress.subjectStats}
          summary={progress.summary}
          childName={activeChild.name}
        />

        <RaporFooter />
      </article>

      {vm && (
        <>
          <DashboardKpis tiles={vm.kpis} />
          <section className="grid gap-6 lg:grid-cols-2">
            <DashboardActivity vm={vm} />
            <DashboardSubjects subjects={vm.subjects} childName={vm.child.name} />
          </section>
          <DashboardRecommended items={vm.recommended} childName={vm.child.name} />
          <DashboardAttempts attempts={vm.attempts} childName={vm.child.name} />
        </>
      )}
    </div>
  )
}
