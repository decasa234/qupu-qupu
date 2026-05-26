// src/pages/Shop.tsx
//
// Stub for Phase A. Real catalog + bottom-sheet purchase flow ships in
// Phase C. Lives in AppShell so navigating to /shop already shows the
// correct chrome and confirms routing works.
export default function ShopPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[2rem] border-[3px] border-dashed border-qupu-brand-blue/30 bg-white p-8 text-center shadow-[5px_6px_0_0_#FFD3B1]">
      <i className="fa-solid fa-bag-shopping text-4xl text-qupu-brand-orange" aria-hidden="true" />
      <h2 className="font-display text-2xl font-extrabold text-qupu-brand-blue">Toko segera hadir</h2>
      <p className="text-sm font-medium text-qupu-muted">Kami sedang menyiapkan paket worksheet & e-book pertama untukmu.</p>
    </div>
  )
}
