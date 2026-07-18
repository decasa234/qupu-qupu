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
  {
    to: '/wmi-arena',
    mode: 'wmi' as const,
    icon: 'fa-solid fa-trophy',
    title: 'Arena WMI',
    desc: 'Lomba soal seru!',
    accent: '#4A90D9',
  },
  {
    to: '/video',
    mode: 'video' as const,
    icon: 'fa-solid fa-clapperboard',
    title: 'Video Seru',
    desc: 'Belajar lewat video',
    accent: '#8A5BF0',
  },
]

export default function MainCatalog() {
  useDocumentTitle('Main')
  const setLearnMode = useWmiStore((s) => s.setLearnMode)

  return (
    <div className="flex w-full max-w-[28.75rem] flex-1 flex-col self-center pb-6">
      <header className="px-1 pt-1">
        <p className="text-[0.625rem] font-black uppercase tracking-[0.22em] text-qupu-brand-orange">
          Ayo main
        </p>
        <h1 className="mt-0.5 font-display text-2xl font-black text-qupu-brand-blue">
          Pilih dunia mainmu!
        </h1>
      </header>

      <div className="mt-4 flex flex-col gap-3.5">
        {WORLDS.map((world) => (
          <Link
            key={world.to}
            to={world.to}
            className="flex items-center gap-3.5 rounded-[1.5rem] bg-white p-4 ring-2 ring-[#FFE3CC] [box-shadow:0_5px_0_#FFD3B1] transition-transform hover:-translate-y-1 active:translate-y-0.5 active:[box-shadow:0_2px_0_#FFD3B1]"
            onClick={() => setLearnMode(world.mode)}
          >
            <span
              className="flex h-[3.625rem] w-[3.625rem] flex-shrink-0 items-center justify-center rounded-[1.125rem] text-2xl text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.15)]"
              style={{ backgroundColor: world.accent }}
            >
              <i className={world.icon} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg font-black leading-tight text-qupu-brand-blue">
                {world.title}
              </span>
              <span className="mt-0.5 block text-xs font-bold text-qupu-muted">{world.desc}</span>
            </span>
            <span className="flex h-[2.125rem] w-[2.125rem] flex-shrink-0 items-center justify-center rounded-full bg-qupu-cream text-xs text-qupu-brand-orange">
              <i className="fa-solid fa-play" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
