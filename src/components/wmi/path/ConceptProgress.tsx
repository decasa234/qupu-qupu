// src/components/wmi/path/ConceptProgress.tsx
//
// Polished, animated proficiency display shown inside ConceptSheet when a
// concept node is tapped. Communicates "how well does this kid know this
// topic" at a glance:
//   • a circular ring that sweeps from 0 → pct on open (CSS transition; the
//     global prefers-reduced-motion rule snaps it instantly),
//   • the tier plant growing in the centre,
//   • a count-up percentage,
//   • a 5-stage plant ladder (Belum dimulai → Dikuasai) marking the tier,
//   • a small benar/latihan tally.
// Pure presentation — all data comes from the WmiGardenConcept row.

import { useEffect, useRef, useState } from 'react'
import PlantIcon from '../PlantIcon'
import { plantForTier } from '../plantTier'
import { PLANT_STAGES } from '../plantStages'
import type { WmiComprehensionTier, WmiGardenConcept } from '../../../types/wmi'

const TIERS: WmiComprehensionTier[] = [0, 1, 2, 3, 4]

// Ring geometry (viewBox units).
const R = 52
const C = 2 * Math.PI * R

function prefersReducedMotion(): boolean {
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export default function ConceptProgress({ concept }: { concept: WmiGardenConcept }) {
  const plant = plantForTier(concept.tier)
  const pct = Math.max(0, Math.min(100, Math.round(concept.pct)))
  // Tier 4 (Dikuasai) earns the gold ring; everything growing toward it is
  // green. Track is a soft soil tone.
  const ringColor = concept.tier >= 4 ? '#E8B400' : '#58A700'

  // Ring sweep: start empty, then animate to the real offset after first
  // paint so the CSS transition runs. Reduced-motion users get the global
  // 0.01ms transition override — it just snaps.
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setArmed(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Count-up percentage, rAF-driven, reduced-motion aware.
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? pct : 0))
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(pct)
      return
    }
    let start: number | null = null
    const DURATION = 900
    const step = (t: number) => {
      if (start === null) start = t
      const k = Math.min(1, (t - start) / DURATION)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - k, 3)
      setDisplay(Math.round(eased * pct))
      if (k < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [pct])

  const offset = armed ? C * (1 - pct / 100) : C

  return (
    <div className="flex flex-col items-center">
      {/* Ring + plant */}
      <div className="relative h-[124px] w-[124px]">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label={`${plant.label}, ${pct}% paham`}
        >
          <circle cx="60" cy="60" r={R} fill="none" stroke="#EDE4D4" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-[900ms] ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="relative flex h-[74px] w-[74px] items-center justify-center rounded-full text-[36px] motion-safe:animate-plant-bob"
            style={{ background: plant.bg, color: plant.color }}
          >
            <PlantIcon tier={concept.tier} />
            {plant.crown && (
              <i
                className="fa-solid fa-crown absolute -top-2.5 text-[16px] text-qupu-orange"
                aria-hidden="true"
              />
            )}
          </span>
        </div>
      </div>

      {/* Tier label + count-up percentage */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black"
          style={{ background: plant.bg, color: plant.color }}
        >
          <i className={plant.icon} aria-hidden="true" />
          {plant.label}
        </span>
        <span className="font-display text-sm font-black text-qupu-brand-blue">
          {display}% paham
        </span>
      </div>

      {/* Plant-growth ladder */}
      <div className="mt-4 flex items-end gap-2" aria-hidden="true">
        {TIERS.map((t) => {
          const reached = t <= concept.tier
          const isCurrent = t === concept.tier
          const stage = PLANT_STAGES[t]
          return (
            <span
              key={t}
              className={`flex items-center justify-center rounded-full transition-transform ${
                isCurrent ? 'h-9 w-9 text-[16px] ring-2 ring-qupu-brand-orange' : 'h-7 w-7 text-[12px]'
              } ${reached ? '' : 'opacity-35 grayscale'}`}
              style={{ background: stage.bg, color: stage.fg }}
            >
              <i className={`${stage.iconPrefix} ${stage.icon}`} />
            </span>
          )
        })}
      </div>

      {/* Tally */}
      <p className="mt-3 text-xs font-bold text-qupu-muted">
        {concept.attempts > 0
          ? `${concept.correct} dari ${concept.attempts} benar`
          : 'Belum ada latihan'}
      </p>
    </div>
  )
}
