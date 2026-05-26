// src/pages/Me.tsx
//
// Profil tab destination. Phase A: child switcher + settings shortcut +
// inventory placeholder. Phase D wires the real InventoryGrid into
// the #koleksi section.
import { useAuthStore } from '../store/authStore'
import InventoryGrid from '../components/me/InventoryGrid'

export default function MePage() {
  const { user, activeChildId } = useAuthStore()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 sm:max-w-lg">
      <section className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Akun</div>
        <h2 className="mt-1 font-display text-xl font-extrabold text-qupu-brand-blue">{user?.name ?? 'Profil'}</h2>
        <p className="mt-1 text-xs font-medium text-qupu-muted">{user?.email}</p>
      </section>

      <section id="koleksi" className="rounded-[2rem] border-[3px] border-qupu-brand-orange/40 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Koleksi saya</div>
        <h2 className="mt-1 font-display text-lg font-extrabold text-qupu-brand-blue">Item yang sudah dimiliki</h2>
        <div className="mt-3">
          {activeChildId ? (
            <InventoryGrid childId={activeChildId} />
          ) : (
            <p className="text-sm font-medium text-qupu-muted">Pilih profil anak dulu untuk melihat koleksi.</p>
          )}
        </div>
      </section>
    </div>
  )
}
