// src/pages/MainCatalog.tsx
//
// "Main" tab landing — the world chooser. Two big tappable cards (WMI arena
// and Video library), each a full-card Link. Deliberately decluttered:
// icon medallion + one-word title + chevron, no copy, no stat chips (none
// are cheaply available without an extra fetch).
import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { useWmiStore } from '../store/wmiStore'

const WORLDS = [
  { to: '/wmi-arena', mode: 'wmi' as const, icon: 'fa-solid fa-trophy', title: 'WMI', accent: '#F59E0B' },
  { to: '/video', mode: 'video' as const, icon: 'fa-solid fa-clapperboard', title: 'Video', accent: '#6366F1' },
]

export default function MainCatalog() {
  useDocumentTitle('Main')
  const setLearnMode = useWmiStore((s) => s.setLearnMode)

  return (
    <div className="flex w-full max-w-[460px] flex-1 flex-col self-center pb-6">
      <header className="px-1 pt-1">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-qupu-brand-orange">
          Ayo main
        </p>
        <h1 className="mt-0.5 font-display text-2xl font-black text-qupu-brand-blue">
          Pilih Dunia
        </h1>
      </header>

      <div className="mt-4 flex flex-1 flex-col justify-start gap-4">
        {WORLDS.map((world) => (
          <Link
            key={world.to}
            to={world.to}
            className="flex flex-1 items-center gap-4 rounded-[2rem] bg-white p-6 ring-2 ring-[#FFE3CC] [box-shadow:0_6px_0_#FFD3B1] transition-transform hover:-translate-y-1 active:translate-y-0.5 active:[box-shadow:0_2px_0_#FFD3B1]"
            onClick={() => setLearnMode(world.mode)}
          >
            <span
              className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full text-3xl"
              style={{ backgroundColor: `${world.accent}1F`, color: world.accent }}
            >
              <i className={world.icon} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 font-display text-3xl font-black text-qupu-brand-blue">
              {world.title}
            </span>
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-qupu-shell text-sm text-qupu-brand-orange">
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
