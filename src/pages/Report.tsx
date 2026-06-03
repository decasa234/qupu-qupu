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
import RaporLatihan from '../components/report/RaporLatihan'
import RaporFooter from '../components/report/RaporFooter'
import PrintButton from '../components/report/PrintButton'
import { fetchConceptProgress } from '../lib/wmiApi'
import type { MemberProgress } from '../types'
import type { WmiConceptProgressSummary } from '../types/wmi'

export default function ReportPage() {
  const { children, activeChildId } = useAuthStore()
  const activeChild = children.find((c) => c.id === activeChildId) ?? null
  const [progress, setProgress] = useState<MemberProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ageGroupName, setAgeGroupName] = useState<string | null>(null)
  const [latihan, setLatihan] = useState<WmiConceptProgressSummary | null>(null)

  // WMI concept progress loads independently — a failure here must not break
  // the core video-quiz rapor.
  useEffect(() => {
    if (!activeChildId) {
      setLatihan(null)
      return
    }
    let cancelled = false
    fetchConceptProgress(activeChildId)
      .then((data) => !cancelled && setLatihan(data))
      .catch(() => !cancelled && setLatihan(null))
    return () => {
      cancelled = true
    }
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

  if (loading) {
    return (
      <div className="mx-auto w-full">
        <SkeletonCard />
      </div>
    )
  }
  if (error || !progress) {
    return (
      <div className="mx-auto w-full">
        <div className="rounded-3xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
          {error || 'Gagal memuat rapor.'}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <div className="flex items-center justify-between gap-3" data-print-hide>
        <Link
          to="/me"
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
          Kembali
        </Link>
        <PrintButton />
      </div>

      <article className="rounded-[1.5rem] bg-white p-4 shadow-[5px_6px_0_0_#FFD3B1] sm:p-6 print:p-0 print:shadow-none">
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

        {latihan && latihan.totalConcepts > 0 && (
          <>
            <h3 className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-qupu-brand-blue">
              Latihan WMI (konsep)
            </h3>
            <RaporLatihan summary={latihan} />
          </>
        )}

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
    </div>
  )
}
