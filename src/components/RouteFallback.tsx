// Suspense fallback for lazily loaded route chunks. Small, on-brand, and
// centered — it renders inside the active layout's outlet, so the surrounding
// chrome (navbar / app shell / admin sidebar) stays visible while the chunk
// downloads.
export default function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center bg-qupu-cream">
      <div className="ld-worm text-qupu-brand-orange" aria-hidden="true" />
      <span className="sr-only">Memuat…</span>
    </div>
  )
}
