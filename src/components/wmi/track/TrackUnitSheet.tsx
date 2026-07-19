// src/components/wmi/track/TrackUnitSheet.tsx
//
// Curriculum-breakdown sheet — opened by tapping a unit banner on the track
// map, the track twin of src/components/wmi/path/ChapterSheet.tsx. Lists
// every concept with its ladder level plus the unit's Tes Bab gate row.
// Picking an unlocked concept hands back to the map (onPick) which focuses
// the node + opens its TrackConceptSheet; the gate row hands off to
// TrackGateSheet the same way. Tap outside or drag down to dismiss.

import { createPortal } from 'react-dom'
import { useSheetDrag } from '../path/useSheetDrag'
import type { TrackThemePack } from './themes'
import type {
  TrackConceptNodeState,
  TrackGateNodeState,
  TrackUnitState,
} from '../../../types/wmi'

interface Props {
  unit: TrackUnitState
  theme: TrackThemePack
  onPick: (node: TrackConceptNodeState) => void
  onGate: (node: TrackGateNodeState) => void
  onClose: () => void
}

export default function TrackUnitSheet({ unit, theme, onPick, onGate, onClose }: Props) {
  const { panelRef, dragHandlers, sheetStyle } = useSheetDrag(onClose)

  const concepts = unit.nodes.filter(
    (n): n is TrackConceptNodeState => n.kind === 'concept',
  )
  const gate = unit.nodes.find((n): n is TrackGateNodeState => n.kind === 'gate')
  const goldCount = concepts.filter((n) => n.gold).length
  const gateState: 'open' | 'current' | 'locked' = gate?.cleared
    ? 'open'
    : gate?.unlocked
      ? 'current'
      : 'locked'

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-transparent"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Rincian ${unit.nameId}`}
        style={sheetStyle}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[78vh] w-full max-w-[28.75rem] flex-col animate-rise rounded-t-[2rem] bg-white pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-[0_-6px_28px_rgba(0,0,0,0.16)] ring-1 ring-black/5"
      >
        <div {...dragHandlers} className="cursor-grab touch-none select-none active:cursor-grabbing">
          <span className="mx-auto mt-3 block h-1.5 w-12 rounded-full bg-[#EFE2CC]" aria-hidden="true" />

          {/* Header */}
          <div className="flex items-center gap-3 px-5 pb-4 pt-3">
            <span
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[0.875rem] text-lg text-white"
              style={{ background: unit.unlocked ? unit.colorHex : '#C3CAD6' }}
            >
              <i className={`fa-solid fa-${unit.unlocked ? unit.iconKey : 'lock'}`} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-lg font-black leading-tight text-qupu-brand-blue">
                {unit.nameId}
              </h2>
              <p className="text-xs font-bold text-qupu-muted">
                {unit.unlocked
                  ? `${goldCount}/${concepts.length} emas`
                  : 'Terkunci — lulus Tes Bab sebelumnya untuk membuka'}
              </p>
            </div>
          </div>

          {/* Gold-progress bar */}
          <div className="mx-5 mb-1 h-2 overflow-hidden rounded-full bg-[#EDE4D4]">
            <div
              className="h-full rounded-full bg-[#58A700] transition-[width] duration-700 ease-out"
              style={{
                width: `${concepts.length ? Math.round((goldCount / concepts.length) * 100) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Concept list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-2">
            {concepts.map((node) => {
              const stage = theme.stages[Math.min(node.level, 5)]
              const row = (
                <>
                  <span
                    className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[0.875rem] text-[1.25rem]"
                    style={{ background: stage.bg, color: stage.fg }}
                  >
                    <i className={`${stage.iconPrefix} ${stage.icon}`} aria-hidden="true" />
                    {node.gold && (
                      <i
                        className="fa-solid fa-crown absolute -right-1 -top-1.5 text-[0.6875rem] text-qupu-orange"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-black text-qupu-brand-blue">
                      {node.nameId}
                    </span>
                    <span className="text-[0.6875rem] font-bold text-qupu-muted">
                      {stage.labelId} · Level {node.level}/5
                    </span>
                  </span>
                </>
              )
              if (!unit.unlocked) {
                return (
                  <li
                    key={node.slug}
                    className="flex items-center gap-3 rounded-[1.25rem] bg-qupu-shell px-3 py-2.5 opacity-60"
                  >
                    {row}
                    <i className="fa-solid fa-lock flex-shrink-0 text-xs text-qupu-muted" aria-hidden="true" />
                  </li>
                )
              }
              return (
                <li key={node.slug}>
                  <button
                    type="button"
                    onClick={() => onPick(node)}
                    className="flex w-full items-center gap-3 rounded-[1.25rem] bg-qupu-shell px-3 py-2.5 text-left transition-transform active:translate-y-0.5"
                  >
                    {row}
                    <i className="fa-solid fa-chevron-right flex-shrink-0 text-xs text-qupu-muted/70" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Tes Bab row */}
          {gate && (
            <button
              type="button"
              onClick={() => onGate(gate)}
              disabled={gateState === 'locked'}
              className={`mt-3 flex w-full items-center gap-3 rounded-[1.25rem] px-3 py-3 text-left transition-transform active:translate-y-0.5 disabled:active:translate-y-0 ${
                gateState === 'open'
                  ? 'bg-qupu-brand-yellow/30 ring-2 ring-[#E8B400]'
                  : gateState === 'current'
                    ? 'bg-qupu-brand-orange/10 ring-2 ring-qupu-brand-orange'
                    : 'bg-qupu-shell opacity-70'
              }`}
            >
              <span
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[0.875rem] text-lg ${
                  gateState === 'open'
                    ? 'bg-qupu-brand-yellow text-[#8A6400]'
                    : gateState === 'current'
                      ? 'bg-white text-qupu-brand-orange ring-2 ring-qupu-brand-orange'
                      : 'bg-[#E7E2D6] text-[#9AA0AC]'
                }`}
              >
                <i
                  className={`fa-solid ${gateState === 'open' ? 'fa-crown' : 'fa-flag-checkered'}`}
                  aria-hidden="true"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-sm font-black text-qupu-brand-blue">Tes Bab</span>
                <span className="text-[0.6875rem] font-bold text-qupu-muted">
                  {gateState === 'open'
                    ? 'Sudah lulus'
                    : gateState === 'current'
                      ? 'Siap diuji — lulus untuk membuka bab berikutnya'
                      : 'Buka bab ini dulu'}
                </span>
              </span>
              {gateState !== 'locked' && (
                <i className="fa-solid fa-chevron-right flex-shrink-0 text-xs text-qupu-muted/70" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
