/**
 * Storyboard builder for WMI-22F3A-Q23 — Soldier Road explainer.
 *
 * The road has TWO deep holes; each needs TWO stacked soldiers.
 * Soldiers 1–5 enter from the right. Final order left→right: 5, 2, 1, 4, 3 = 52143.
 *
 * Pure function — no Math.random, no Date. SSR-safe.
 */

import type { Lang } from '../concepts/explainers/makeTenSteps'
import type { SoldierPosition, HoleFillState } from './SoldierRoad22G3Illustration'

/** Mirrors the private layout constants in SoldierRoad22G3Illustration.tsx. */
const SOLDIERS_START_X = 340
const SOLDIER_SPACING = 44

export interface SoldierRoadStep {
  /** Soldier positions for this beat. */
  soldiers: SoldierPosition[]
  /** Hole fill level for this beat. */
  holeFill: HoleFillState
  /** Show the blue direction arrow. */
  showArrow: boolean
  /** Caption text (bilingual, chosen by builder). */
  caption: string
  /** Hold duration in ms before auto-advancing (0 = final beat, lingers). */
  hold: number
  /** True on the final answer beat — triggers the green result style. */
  result: boolean
}

export interface SoldierRoadStoryboard {
  steps: SoldierRoadStep[]
  finalIndex: number
  answer: string
}

// ─── helpers ─────────────────────────────────────────────────────────────────

/** All 5 soldiers on road-right at their default spacing. */
function allRight(): SoldierPosition[] {
  return [1, 2, 3, 4, 5].map((label, idx) => ({
    label,
    location: 'road-right' as const,
    overrideX: SOLDIERS_START_X + idx * SOLDIER_SPACING,
  }))
}

/** Build road-right soldiers for a subset of labels, evenly spaced from the front. */
function rightGroup(labels: number[]): SoldierPosition[] {
  return labels.map((label, idx) => ({
    label,
    location: 'road-right' as const,
    overrideX: SOLDIERS_START_X + idx * SOLDIER_SPACING,
  }))
}

/** Build road-left soldiers for a subset of labels (front first = lowest x). */
function leftGroup(labels: number[]): SoldierPosition[] {
  return labels.map((label, idx) => ({
    label,
    location: 'road-left' as const,
    overrideX: 28 + idx * (SOLDIER_SPACING - 4),
  }))
}

// ─── builder ─────────────────────────────────────────────────────────────────

export function buildSoldierRoad22G3Steps(lang: Lang): SoldierRoadStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SoldierRoadStep[] = [
    // ── Beat 0: shallow-hole example ─────────────────────────────────────────
    {
      soldiers: allRight(),
      holeFill: { holeA: 0, holeB: 0 },
      showArrow: true,
      hold: 2400,
      result: false,
      caption: t(
        'Soldiers 1–5 march right→left. Normally a SHALLOW hole: soldier 1 fills it, 2 & 3 cross, then 1 climbs out at the back → order becomes 2, 3, 1.',
        'Tentara 1–5 berbaris kanan→kiri. Biasanya lubang DANGKAL: tentara 1 mengisi, 2 & 3 lewat, lalu 1 naik ke belakang → urutan jadi 2, 3, 1.',
      ),
    },

    // ── Beat 1: holes are DEEP ────────────────────────────────────────────────
    {
      soldiers: allRight(),
      holeFill: { holeA: 0, holeB: 0 },
      showArrow: true,
      hold: 2200,
      result: false,
      caption: t(
        'BUT these holes are DEEP — the red dashed line shows the halfway mark. Each hole needs TWO soldiers stacked to reach road level!',
        'TAPI lubang ini DALAM — garis merah putus-putus menunjukkan titik tengah. Setiap lubang butuh DUA tentara bertumpuk untuk mencapai permukaan jalan!',
      ),
    },

    // ── Beat 2: soldier 1 drops into Hole A (bottom, stack level 0) ──────────
    {
      soldiers: [
        { label: 1, location: 'holeA', stackLevel: 0 },
        ...rightGroup([2, 3, 4, 5]),
      ],
      holeFill: { holeA: 1, holeB: 0 },
      showArrow: true,
      hold: 2000,
      result: false,
      caption: t(
        'Soldier 1 drops into the right hole and goes to the bottom.',
        'Tentara 1 turun ke lubang kanan dan berada di bagian bawah.',
      ),
    },

    // ── Beat 3: soldier 2 stacks on top of 1 in Hole A — 3, 4, 5 march across ─
    {
      soldiers: [
        { label: 1, location: 'holeA', stackLevel: 0 },
        { label: 2, location: 'holeA', stackLevel: 1 },
        ...rightGroup([3, 4, 5]),
      ],
      holeFill: { holeA: 2, holeB: 0 },
      showArrow: true,
      hold: 2200,
      result: false,
      caption: t(
        'Soldier 2 climbs on top — right hole is now FULL! Soldiers 3, 4, 5 step across and keep walking.',
        'Tentara 2 naik di atas — lubang kanan sekarang PENUH! Tentara 3, 4, 5 melangkah melewati lubang.',
      ),
    },

    // ── Beat 4: soldier 3 drops into Hole B (bottom) ─────────────────────────
    {
      soldiers: [
        { label: 1, location: 'holeA', stackLevel: 0 },
        { label: 2, location: 'holeA', stackLevel: 1 },
        { label: 3, location: 'holeB', stackLevel: 0 },
        ...rightGroup([4, 5]),
      ],
      holeFill: { holeA: 2, holeB: 1 },
      showArrow: true,
      hold: 2000,
      result: false,
      caption: t(
        'Soldier 3 drops into the LEFT hole and goes to the bottom. Soldiers 4 and 5 keep marching.',
        'Tentara 3 turun ke lubang KIRI dan berada di bawah. Tentara 4 dan 5 terus berjalan.',
      ),
    },

    // ── Beat 5: soldier 4 stacks in Hole B; soldier 5 crosses to road-left ────
    {
      soldiers: [
        { label: 1, location: 'holeA', stackLevel: 0 },
        { label: 2, location: 'holeA', stackLevel: 1 },
        { label: 3, location: 'holeB', stackLevel: 0 },
        { label: 4, location: 'holeB', stackLevel: 1 },
        { label: 5, location: 'road-left', overrideX: 28 },
      ],
      holeFill: { holeA: 2, holeB: 2 },
      showArrow: false,
      hold: 2200,
      result: false,
      caption: t(
        'Soldier 4 stacks in the left hole — FULL! Soldier 5 has already crossed to the front.',
        'Tentara 4 menumpuk di lubang kiri — PENUH! Tentara 5 sudah menyeberang ke depan.',
      ),
    },

    // ── Beat 6: climb out — top first, right hole first ──────────────────────
    {
      soldiers: [
        ...leftGroup([5, 2, 1, 4, 3]),
      ],
      holeFill: { holeA: 0, holeB: 0 },
      showArrow: false,
      hold: 2400,
      result: false,
      caption: t(
        'Now climb out — TOP soldier first! Right hole: 2 out, then 1. Left hole: 4 out, then 3. Final order behind soldier 5: 2, 1, 4, 3.',
        'Sekarang naik — tentara PALING ATAS dulu! Lubang kanan: 2 keluar, lalu 1. Lubang kiri: 4 keluar, lalu 3. Urutan di belakang tentara 5: 2, 1, 4, 3.',
      ),
    },

    // ── Beat 7: result ────────────────────────────────────────────────────────
    {
      soldiers: [
        ...leftGroup([5, 2, 1, 4, 3]),
      ],
      holeFill: { holeA: 0, holeB: 0 },
      showArrow: false,
      hold: 0,
      result: true,
      caption: t(
        'Front → back: 5, 2, 1, 4, 3 = 52143.',
        'Depan → belakang: 5, 2, 1, 4, 3 = 52143.',
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
    answer: '52143',
  }
}
