// src/pages/WmiArena.tsx
//
// The WMI world inside the Main tab. Two modes only — Latihan Campur
// (endless mixed drill) and Ujian WMI (past papers). Icon + ≤3 words per
// card; no paragraph copy.
import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

const MODES = [
  { to: '/wmi-arena/campur', icon: 'fa-solid fa-shuffle', title: 'Latihan Campur', accent: '#F59E0B' },
  { to: '/latihan/wmi/ujian', icon: 'fa-solid fa-medal', title: 'Ujian WMI', accent: '#8A5BF0' },
]

export default function WmiArena() {
  useDocumentTitle('WMI')

  return (
    <div className="flex w-full max-w-[460px] flex-1 flex-col self-center pb-6">
      <div className="mb-3">
        <Link
          to="/main"
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
          Kembali
        </Link>
      </div>

      <header className="px-1 pt-1">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-qupu-brand-orange">
          Pilih tantanganmu
        </p>
        <h1 className="mt-0.5 font-display text-2xl font-black text-qupu-brand-blue">WMI</h1>
      </header>

      <div className="mt-4 flex flex-col gap-4">
        {MODES.map((mode) => (
          <Link
            key={mode.to}
            to={mode.to}
            className="flex items-center gap-4 rounded-[2rem] bg-white p-6 ring-2 ring-[#FFE3CC] [box-shadow:0_6px_0_#FFD3B1] transition-transform hover:-translate-y-1 active:translate-y-0.5 active:[box-shadow:0_2px_0_#FFD3B1]"
          >
            <span
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-2xl"
              style={{ backgroundColor: `${mode.accent}1F`, color: mode.accent }}
            >
              <i className={mode.icon} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 font-display text-xl font-black leading-tight text-qupu-brand-blue">
              {mode.title}
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
