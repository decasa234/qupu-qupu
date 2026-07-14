import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getCachedPublic } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import AuthCard from '../components/AuthCard'
import BackButton from '../components/BackButton'
import Skeleton from '../components/Skeleton'
import RaporHeader from '../components/report/RaporHeader'
import RaporSummary from '../components/report/RaporSummary'
import RaporSubjectTable from '../components/report/RaporSubjectTable'
import RaporVideoBreakdown from '../components/report/RaporVideoBreakdown'
import RaporNote from '../components/report/RaporNote'
import RaporLatihan from '../components/report/RaporLatihan'
import RaporFooter from '../components/report/RaporFooter'
import PrintButton from '../components/report/PrintButton'
import { fetchConceptProgress } from '../lib/wmiApi'
import { useWmiStore } from '../store/wmiStore'
import type { MemberProgress } from '../types'
import type { WmiConceptProgressSummary } from '../types/wmi'

// `embedded` — rendered inside the PIN-locked /parent shell (ParentDashboard):
// hides the standalone "Kembali → /profil" row, which would otherwise eject
// the parent into the kid app and burn the PIN unlock. PrintButton stays —
// printing the rapor is a parent feature either way.
export default function ReportPage({ embedded = false }: { embedded?: boolean }) {
  const { children, activeChildId } = useAuthStore()
  const { selectedGrade } = useWmiStore()
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
    fetchConceptProgress(activeChildId, selectedGrade)
      .then((data) => !cancelled && setLatihan(data))
      .catch(() => !cancelled && setLatihan(null))
    return () => {
      cancelled = true
    }
  }, [activeChildId, selectedGrade])

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
          getCachedPublic<{ data?: { ageGroups?: Array<{ id: string; name: string }> } }>('/public/meta'),
        ])
        const data = progressRes.data.data as MemberProgress
        setProgress(data)
        const ageGroups: Array<{ id: string; name: string }> = metaRes.data?.ageGroups ?? []
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
        subtitle="Rapor dibuat per anak. Ganti profil anak di halaman Profil."
      >
        <Link
          to="/onboard/child"
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
        <Skeleton className="h-96" />
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
      <div
        className={`flex items-center gap-3 ${embedded ? 'justify-end' : 'justify-between'}`}
        data-print-hide
      >
        {!embedded && (
          <BackButton variant="back" to="/profil" label="Kembali" />
        )}
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

        <h3 className="mt-4 text-[0.625rem] font-extrabold uppercase tracking-[0.1em] text-qupu-brand-blue">
          Penilaian per mata pelajaran
        </h3>
        <RaporSubjectTable stats={progress.subjectStats} />

        <h3 className="mt-4 text-[0.625rem] font-extrabold uppercase tracking-[0.1em] text-qupu-brand-blue">
          Rincian video per subject
        </h3>
        <RaporVideoBreakdown stats={progress.subjectStats} />

        {latihan && latihan.totalConcepts > 0 && (
          <>
            <h3 className="mt-4 text-[0.625rem] font-extrabold uppercase tracking-[0.1em] text-qupu-brand-blue">
              Latihan Konsep
            </h3>
            <RaporLatihan summary={latihan} />
          </>
        )}

        <h3 className="mt-4 text-[0.625rem] font-extrabold uppercase tracking-[0.1em] text-qupu-brand-blue">
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
