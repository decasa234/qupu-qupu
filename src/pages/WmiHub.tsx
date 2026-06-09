import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import WmiGradeChips from '../components/wmi/WmiGradeChips'
import ChapterGarden from '../components/wmi/ChapterGarden'
import ConceptInfoModal from '../components/wmi/ConceptInfoModal'
import DailyQuestsPanel from '../components/me/DailyQuestsPanel'
import { fetchGarden } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { WmiGarden, WmiGardenChapter, WmiGardenConcept, WmiGrade } from '../types/wmi'

// The single top recommendation: which chapter should the dominant
// "Lanjutkan" hero point at? Priority:
//   1. the last-started subject (per-child, persisted) — if it exists in the
//      current grade's garden, is unlocked and not fully grown;
//   2. the chapter containing the garden's nextConceptSlug;
//   3. the first unlocked chapter that isn't fully grown;
//   4. null — every unlocked chapter is fully grown (campur variant).
function pickResumeChapter(
  garden: WmiGarden,
  lastSubjectKey: string | null,
): WmiGardenChapter | null {
  const resumable = (ch: WmiGardenChapter | undefined) =>
    ch && ch.unlocked && ch.grownCount < ch.total ? ch : null

  const last = resumable(garden.chapters.find((ch) => ch.subjectKey === lastSubjectKey))
  if (last) return last

  if (garden.nextConceptSlug) {
    const next = resumable(
      garden.chapters.find((ch) => ch.concepts.some((c) => c.slug === garden.nextConceptSlug)),
    )
    if (next) return next
  }

  return garden.chapters.find((ch) => ch.unlocked && ch.grownCount < ch.total) ?? null
}

export default function WmiHub() {
  const { activeChildId } = useAuthStore()
  const { selectedGrade, setSelectedGrade, lastSubjectKey, loadGlossary } = useWmiStore()
  const navigate = useNavigate()
  const [garden, setGarden] = useState<WmiGarden | null>(null)
  const [loading, setLoading] = useState(true)
  const [infoConcept, setInfoConcept] = useState<WmiGardenConcept | null>(null)

  useEffect(() => { loadGlossary().catch(() => {}) }, [loadGlossary])

  useEffect(() => {
    if (!activeChildId) { setGarden(null); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    fetchGarden(activeChildId, selectedGrade)
      .then((d) => !cancelled && setGarden(d))
      .catch(() => !cancelled && setGarden(null))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [activeChildId, selectedGrade])

  if (!activeChildId) {
    return (
      <div className="w-full max-w-[460px] self-center p-6 text-center text-sm font-semibold text-qupu-muted">
        Pilih profil anak dulu.
      </div>
    )
  }

  const grownTotal = garden?.chapters.reduce((s, c) => s + c.grownCount, 0) ?? 0
  const conceptTotal = garden?.chapters.reduce((s, c) => s + c.total, 0) ?? 0

  const hasUnlocked = !!garden && garden.chapters.some((ch) => ch.unlocked)
  const resumeChapter = garden ? pickResumeChapter(garden, lastSubjectKey) : null

  return (
    <div className="w-full max-w-[460px] self-center pb-6">
      <div className="mb-3">
        <Link
          to="/latihan"
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" /> Kembali
        </Link>
      </div>

      <section className="relative overflow-hidden rounded-[2rem] bg-qupu-brand-orange p-5 text-white shadow-[0_6px_0_0_#C46123]">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-qupu-brand-yellow/35" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.35rem] bg-[#FFF8F0] text-2xl text-qupu-brand-orange shadow-[inset_0_-4px_0_#FFD3B1]">
            <i className="fa-solid fa-brain" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/75">Kursus</p>
            <h1 className="font-display text-2xl font-black leading-none">Latihan WMI</h1>
            <p className="mt-0.5 text-[11px] font-bold text-white/80">Tumbuhkan kebunmu, kuasai tiap konsep.</p>
          </div>
        </div>
      </section>

      <div className="mt-4 rounded-[1.5rem] bg-[#FFF8F0] p-3 ring-2 ring-[#FFE3CC]">
        <p className="px-1 pb-2 text-[10px] font-black uppercase tracking-[0.16em] text-qupu-brand-orange">Pilih kelas</p>
        <WmiGradeChips selected={selectedGrade} onSelect={(g: WmiGrade) => setSelectedGrade(g)} />
      </div>

      {/* Resume hero — the single dominant "1 tap to a session" recommendation.
          ChapterGarden keeps its contextual per-chapter buttons; this is the
          top-of-page pick (last subject → nextConceptSlug → first unlocked). */}
      {!loading && hasUnlocked && (
        resumeChapter ? (
          <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-[0_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-qupu-brand-orange">
              Lanjutkan belajar
            </p>
            <h2 className="mt-1 font-display text-xl font-black leading-tight text-qupu-brand-blue">
              {resumeChapter.nameId}
            </h2>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F1E4CC]">
              <div
                className="h-full rounded-full bg-[#58A700]"
                style={{ width: `${resumeChapter.meanPct}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => navigate(`/latihan/wmi/sesi/${resumeChapter.subjectKey}`)}
              className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange p-3.5 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs text-qupu-brand-orange">
                <i className="fa-solid fa-play" aria-hidden="true" />
              </span>
              {resumeChapter.grownCount === 0 ? 'Mulai' : 'Lanjutkan'}
            </button>
          </section>
        ) : (
          <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-[0_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-qupu-brand-orange">
              Kebun penuh
            </p>
            <h2 className="mt-1 font-display text-xl font-black leading-tight text-qupu-brand-blue">
              Semua tumbuh! Latihan campur?
            </h2>
            <Link
              to="/latihan/wmi/konsep"
              className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange p-3.5 font-display text-base font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs text-qupu-brand-orange">
                <i className="fa-solid fa-shuffle" aria-hidden="true" />
              </span>
              Latihan Campur
            </Link>
          </section>
        )
      )}

      {/* "Misi Hari Ini" — daily quest goals. Fetches independently and
          renders nothing on failure, so the garden never looks broken
          because quests failed. */}
      <DailyQuestsPanel childId={activeChildId} variant="garden" />

      <div className="mt-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-lg font-black text-qupu-brand-blue">Kebun Konsep</h2>
          {garden && (
            <span className="rounded-full bg-qupu-cream px-2.5 py-1 text-[11px] font-black text-qupu-brand-blue">
              {grownTotal}/{conceptTotal} tumbuh
            </span>
          )}
        </div>
        <div className="mt-3">
          {loading ? (
            <div className="space-y-3" aria-hidden="true">
              {[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-[1.5rem] bg-qupu-cream" />)}
            </div>
          ) : garden && garden.chapters.length > 0 ? (
            garden.chapters.map((ch, i) => (
              <ChapterGarden
                key={ch.subjectKey}
                chapter={ch}
                index={i}
                onConceptInfo={(c) => setInfoConcept(c)}
                onStartSession={(subjectKey) => navigate(`/latihan/wmi/sesi/${subjectKey}`)}
                onStartTest={(subjectKey) => navigate(`/latihan/wmi/tes/${subjectKey}`)}
              />
            ))
          ) : (
            <p className="rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-xs font-semibold text-qupu-muted">
              Belum ada konsep untuk kelas ini.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/latihan/wmi/konsep" className="flex flex-col gap-1 rounded-[1.5rem] bg-white p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5">
          <i className="fa-solid fa-shuffle text-xl text-qupu-orange" aria-hidden="true" />
          <span className="font-display text-base font-black leading-tight text-qupu-brand-blue">Latihan Campur</span>
          <span className="text-[11px] font-bold text-qupu-brand-blue/65">Soal acak semua konsep</span>
        </Link>
        <Link to="/latihan/wmi/ujian" className="flex flex-col gap-1 rounded-[1.5rem] bg-white p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5">
          <i className="fa-solid fa-file-pen text-xl text-qupu-brand-blue" aria-hidden="true" />
          <span className="font-display text-base font-black leading-tight text-qupu-brand-blue">Soal Ujian</span>
          <span className="text-[11px] font-bold text-qupu-brand-blue/65">Paper WMI asli per kelas</span>
        </Link>
      </div>

      {infoConcept && (
        <ConceptInfoModal
          childId={activeChildId}
          grade={selectedGrade}
          concept={infoConcept}
          onClose={() => setInfoConcept(null)}
        />
      )}
    </div>
  )
}
