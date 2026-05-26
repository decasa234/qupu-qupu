// src/components/LoadingOverlay.tsx
//
// Fullscreen branded loader. Driven by useLoadingState; visible whenever
// any request is in flight or within the 500ms tail of the last one.
// Sits at z-[60] so it covers the AppShell chrome (z-30).
import { useLoadingState } from '../hooks/useLoadingState'

export default function LoadingOverlay() {
  const visible = useLoadingState((s) => s.visible)
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-qupu-brand-yellow transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <i
        className="fa-solid fa-coins animate-spin text-5xl text-qupu-brand-blue"
        aria-hidden="true"
      />
      <span className="font-display text-base font-extrabold text-qupu-brand-blue">
        Memuat…
      </span>
    </div>
  )
}
