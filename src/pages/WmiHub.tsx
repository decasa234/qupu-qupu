import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import WmiGradeChips from '../components/wmi/WmiGradeChips'
import WmiPaperCard from '../components/wmi/WmiPaperCard'
import { fetchPapers } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { WmiGrade, WmiPaperSummary } from '../types/wmi'

export default function WmiHub() {
  const { activeChildId } = useAuthStore()
  const { selectedGrade, setSelectedGrade, loadGlossary } = useWmiStore()
  const [papers, setPapers] = useState<WmiPaperSummary[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadGlossary().catch(() => {})
  }, [loadGlossary])

  useEffect(() => {
    if (!activeChildId) return
    setError(null)
    fetchPapers(activeChildId, selectedGrade)
      .then(setPapers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat'))
  }, [activeChildId, selectedGrade])

  if (!activeChildId) return <div className="p-6 text-center">Pilih profil anak dulu.</div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-qupu-brand-blue">Latihan WMI</h1>
      <p className="text-sm text-gray-600">Pikirkan seperti juara olimpiade.</p>

      <div className="mt-4">
        <WmiGradeChips selected={selectedGrade} onSelect={(grade: WmiGrade) => setSelectedGrade(grade)} />
      </div>

      <Link
        to={`/latihan/wmi/drill?grade=${selectedGrade}`}
        className="mt-5 block rounded-lg bg-qupu-brand-blue p-5 text-center text-lg font-bold text-white"
      >
        Mulai Drill
      </Link>

      <Link
        to="/latihan/wmi/konsep"
        className="mt-4 block rounded-xl border-2 border-qupu-cream-dark bg-white p-5 text-center font-bold text-qupu-brand-blue hover:bg-qupu-cream"
      >
        🧠 Latihan Konsep
        <p className="mt-1 text-sm font-normal text-gray-600">
          Soal latihan otomatis untuk anak Grade 0–3.
        </p>
      </Link>

      <h2 className="mt-6 text-lg font-semibold">Latihan Soal Ujian</h2>
      {error && <div className="mt-2 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {papers.length === 0 && !error && (
          <div className="rounded-lg border-2 border-dashed border-qupu-cream-dark p-6 text-center text-gray-500 sm:col-span-2">
            Belum ada soal untuk grade ini.
          </div>
        )}
        {papers.map((paper) => (
          <WmiPaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </div>
  )
}
