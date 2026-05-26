// src/pages/Me.tsx
//
// Profil tab destination. Phase A: child switcher + settings shortcut +
// inventory placeholder. Phase D wires the real InventoryGrid into
// the #koleksi section.
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function MePage() {
  const { user } = useAuthStore()

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Akun</div>
        <h2 className="mt-1 font-display text-xl font-extrabold text-qupu-brand-blue">{user?.name ?? 'Profil'}</h2>
        <p className="mt-1 text-xs font-medium text-qupu-muted">{user?.email}</p>
      </section>

      <section id="koleksi" className="rounded-[2rem] border-[3px] border-qupu-brand-orange/40 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Koleksi saya</div>
        <p className="mt-2 text-sm font-medium text-qupu-muted">
          Belum ada item. Selesaikan misi dan tukar koinmu di toko.
        </p>
        <Link
          to="/shop"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-4 py-2 font-display text-sm font-extrabold text-white shadow-subscribe"
        >
          <i className="fa-solid fa-bag-shopping" aria-hidden="true" /> Buka toko
        </Link>
      </section>
    </div>
  )
}
