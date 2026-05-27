// src/components/LoadingOverlay.tsx
//
// Fullscreen branded loader. Driven by useLoadingState; visible whenever
// any request is in flight or within the 500ms tail of the last one.
// Sits at z-[60] so it covers the AppShell chrome (z-30).
//
// Visually identical to the inline boot splash in index.html (same
// mascot bob, sparkles, dots, palette) so the post-boot loader feels
// like the boot splash continuing — one consistent loading UI.
// The keyframes (`qupu-bob`, `qupu-twinkle`, `qupu-dot`) are defined
// globally in index.html's <style> block; they survive after the boot
// splash element is removed because they're @keyframes rules, not
// scoped declarations.
import { useLoadingState } from '../hooks/useLoadingState'

const BOB = 'qupu-bob 1.5s ease-in-out infinite'
const DOT = 'qupu-dot 1.1s ease-in-out infinite'
const TWINKLE = 'qupu-twinkle 1.9s ease-in-out infinite'

export default function LoadingOverlay() {
  const visible = useLoadingState((s) => s.visible)
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat QUPU"
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-[#fff2df] transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <i
        aria-hidden="true"
        className="fa-solid fa-star absolute text-[#ffdd55]"
        style={{ top: '30%', left: '32%', fontSize: '1rem', animation: TWINKLE }}
      />
      <i
        aria-hidden="true"
        className="fa-solid fa-star absolute text-[#ffdd55]"
        style={{ top: '33%', right: '31%', fontSize: '1.4rem', animation: TWINKLE, animationDelay: '0.5s' }}
      />
      <i
        aria-hidden="true"
        className="fa-solid fa-star absolute text-[#ffdd55]"
        style={{ bottom: '31%', left: '40%', fontSize: '0.8rem', animation: TWINKLE, animationDelay: '0.9s' }}
      />

      <img
        src="/hero-mascot.png"
        alt=""
        draggable={false}
        className="h-auto w-[140px] select-none drop-shadow-[0_12px_24px_rgba(120,60,0,0.22)]"
        style={{ animation: BOB }}
      />

      <div
        className="font-display font-extrabold tracking-[0.05em] text-[#30598a]"
        style={{ fontSize: '1.05rem' }}
      >
        Memuat QUPU...
      </div>

      <div className="flex gap-2">
        <span
          className="h-[0.6rem] w-[0.6rem] rounded-full bg-[#f0853a]"
          style={{ animation: DOT }}
        />
        <span
          className="h-[0.6rem] w-[0.6rem] rounded-full bg-[#f0853a]"
          style={{ animation: DOT, animationDelay: '0.18s' }}
        />
        <span
          className="h-[0.6rem] w-[0.6rem] rounded-full bg-[#f0853a]"
          style={{ animation: DOT, animationDelay: '0.36s' }}
        />
      </div>
    </div>
  )
}
