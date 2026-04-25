import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Mascot from '../components/Mascot'
import ChildModal from '../components/ChildModal'
import { useAuthStore } from '../store/authStore'
import type { Child } from '../types'

export default function OnboardingChild() {
  const navigate = useNavigate()
  const { children, activeChildId, addChild, setActiveChild } = useAuthStore()
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (children.length > 0 && activeChildId) {
      navigate('/dashboard', { replace: true })
    }
  }, [children, activeChildId, navigate])

  const handleCreated = (child: Child) => {
    addChild(child)
    setActiveChild(child.id)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-[2.5rem] border border-qupu-peach bg-white p-8 text-center shadow-soft sm:p-10">
        <div className="mx-auto w-32">
          <Mascot variant="holding-book" />
        </div>
        <div className="mt-4 text-sm font-bold uppercase tracking-[0.24em] text-qupu-orange">Sebelum mulai</div>
        <h1 className="mt-2 font-display text-3xl font-bold text-qupu-purple">
          Tambah profil anak pertama
        </h1>
        <p className="mt-3 text-qupu-muted">
          Setiap anak punya progres dan koleksi badge sendiri. Kamu bisa tambah lebih banyak profil
          kapan saja dari navbar.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-full bg-qupu-orange px-6 py-3 text-base font-bold text-white transition-colors hover:bg-qupu-orange-dark"
          >
            Tambah profil anak
          </button>
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-qupu-muted hover:text-qupu-brand-blue"
          >
            Lewati untuk sekarang
          </Link>
        </div>
      </div>

      <ChildModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={handleCreated}
        title="Profil anak pertama"
        submitLabel="Simpan dan mulai"
      />
    </div>
  )
}
