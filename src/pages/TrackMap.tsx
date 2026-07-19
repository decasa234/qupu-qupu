// src/pages/TrackMap.tsx
//
// /belajar/track/:trackId — Plan 2's track map: the theme-driven QUPU track
// engine (units/nodes/gates) rendered via TrackTrail. Deliberately lean
// (no sheets/FABs/celebrations — those return in later Plan 2 tasks). A
// node tap navigates straight to the lesson or gate session; locked taps
// are a no-op (TrackNode already disables the underlying button).

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TrackTrail, { pickCheckpoint } from '../components/wmi/track/TrackTrail'
import { getThemePack } from '../components/wmi/track/themes'
import { fetchTrackState } from '../lib/wmiApi'
import { useAuthStore } from '../store/authStore'
import useDocumentTitle from '../hooks/useDocumentTitle'
import type { TrackState } from '../types/wmi'

export default function TrackMap({ trackId: trackIdProp }: { trackId?: string } = {}) {
  useDocumentTitle('Belajar')
  // Always call useParams (hook-order safety) even when a caller (e.g.
  // MemberHome's dark-cutover branch) already knows the track id.
  const params = useParams()
  const trackId = trackIdProp ?? params.trackId
  const { activeChildId } = useAuthStore()
  const navigate = useNavigate()
  const [state, setState] = useState<TrackState | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [fetchTick, setFetchTick] = useState(0)

  useEffect(() => {
    if (!activeChildId || !trackId) { setState(null); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    fetchTrackState(activeChildId, trackId)
      .then((d) => {
        if (cancelled) return
        setState(d)
      })
      .catch(() => {
        if (cancelled) return
        setState(null)
        setLoadError(true)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [activeChildId, trackId, fetchTick])

  if (!activeChildId) {
    return (
      <div className="w-full max-w-[28.75rem] self-center p-6 text-center text-sm font-semibold text-qupu-muted">
        Pilih profil anak dulu.
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-[28.75rem] self-center pb-6">
      {/* Draft/review tracks stay testable without misleading anyone that
          they're the live curriculum. */}
      {state && state.status !== 'published' && (
        <div className="mb-3 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-qupu-cream px-3 py-1 text-xs font-black text-qupu-brand-blue">
            <i className="fa-solid fa-flask" aria-hidden="true" />
            {state.status}
          </span>
        </div>
      )}

      <div className="mt-1">
        {loading ? (
          // Skeleton mirrors the real trail: a banner bar + node circles on
          // the same zigzag lanes (pathLayout LANE) and 96px row rhythm.
          // bg-qupu-peach/40 (house skeleton tint) — the page itself is
          // qupu-cream, so a cream skeleton would be invisible.
          <div aria-hidden="true">
            <div className="h-[3.75rem] animate-pulse rounded-[1.5rem] bg-qupu-peach/40" />
            <div className="relative" style={{ height: 5 * 104 }}>
              {[0.5, 0.22, 0.5, 0.78, 0.5].map((x, i) => (
                <div
                  key={i}
                  className="absolute h-16 w-16 -translate-x-1/2 animate-pulse rounded-full bg-qupu-peach/40"
                  style={{ left: `${x * 100}%`, top: i * 104 + 16 }}
                />
              ))}
            </div>
          </div>
        ) : loadError ? (
          <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
            <p className="text-sm font-bold text-qupu-brand-blue">
              Gagal memuat jalur belajar. Periksa koneksimu.
            </p>
            <button
              type="button"
              onClick={() => setFetchTick((t) => t + 1)}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2.5 font-display text-sm font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5"
            >
              <i className="fa-solid fa-rotate-right" aria-hidden="true" />
              Coba lagi
            </button>
          </div>
        ) : state && state.units.length > 0 ? (
          <TrackTrail
            units={state.units}
            theme={getThemePack(state.theme)}
            selectedKey={null}
            checkpointSlug={pickCheckpoint(state.units)}
            onConcept={(node, unit) => {
              if (!unit.unlocked) return
              navigate(`/latihan/track/${trackId}/sesi/${node.slug}`, { state: { theme: state.theme } })
            }}
            onGate={(node) => {
              if (node.unlocked || node.cleared) {
                navigate(`/latihan/track/${trackId}/gerbang/${node.key}`, { state: { theme: state.theme } })
              }
            }}
          />
        ) : (
          <p className="rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-xs font-semibold text-qupu-muted">
            Belum ada konsep untuk track ini.
          </p>
        )}
      </div>
    </div>
  )
}
