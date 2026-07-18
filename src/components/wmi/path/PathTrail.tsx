// src/components/wmi/path/PathTrail.tsx
//
// The winding Duolingo-style trail for /belajar. Per chapter: a banner row
// (the ONLY text on the canvas — chapter name + grown fraction), then one
// node per concept laid out on the nodeOffsets S-curve, then the chapter's
// Tes Bab boss node. An SVG path behind the nodes connects their centers;
// locked chapters get a dashed stroke.

import type { ReactNode, Ref } from 'react'
import PathNode, { type PathNodeState } from './PathNode'
import { nodeOffsets } from './pathLayout'
import { bossState } from './pathState'
import type { WmiGarden, WmiGardenChapter, WmiGardenConcept } from '../../../types/wmi'

export const ROW_H = 104
// Breathing room inside each chapter's trail canvas: the first node clears the
// banner, the last node's "Tes Bab" chip stays inside the tinted section.
const PAD_TOP = 10
const PAD_BOT = 28
// Backend's PROFICIENT_TIER: a concept counts as "grown" at tier >= 3 (Mahir).
const GROWN_TIER = 3

// The single "you are here" stop. Ported from WmiHub's pickResumeChapter:
//   1. last-started subject (per-child, persisted) if unlocked + not full;
//   2. the chapter containing the garden's nextConceptSlug;
//   3. the first unlocked chapter that isn't fully grown;
//   4. null — everything unlocked is fully grown.
// Within the picked chapter: nextConceptSlug when it lives there, else the
// first not-yet-grown concept, else the first concept.
export function pickCurrentNode(
  garden: WmiGarden,
  lastSubjectKey: string | null,
): { chapter: WmiGardenChapter; concept: WmiGardenConcept } | null {
  const resumable = (ch: WmiGardenChapter | undefined) =>
    ch && ch.unlocked && ch.grownCount < ch.total ? ch : null

  let chapter = resumable(garden.chapters.find((ch) => ch.subjectKey === lastSubjectKey))
  if (!chapter && garden.nextConceptSlug) {
    chapter = resumable(
      garden.chapters.find((ch) => ch.concepts.some((c) => c.slug === garden.nextConceptSlug)),
    )
  }
  if (!chapter) {
    chapter = garden.chapters.find((ch) => ch.unlocked && ch.grownCount < ch.total) ?? null
  }
  if (!chapter) return null

  const concept =
    chapter.concepts.find((c) => c.slug === garden.nextConceptSlug) ??
    chapter.concepts.find((c) => c.tier < GROWN_TIER) ??
    chapter.concepts[0]
  if (!concept) return null
  return { chapter, concept }
}

interface Props {
  garden: WmiGarden
  lastSubjectKey: string | null
  onNode: (concept: WmiGardenConcept, chapter: WmiGardenChapter) => void
  onBoss: (chapter: WmiGardenChapter) => void
  /** Tap the chapter banner → open the curriculum-breakdown sheet. */
  onChapter: (chapter: WmiGardenChapter) => void
  currentRef: Ref<HTMLButtonElement>
  /** Slug of the concept whose sheet is open — spotlight that node. */
  selectedSlug?: string | null
  /** subjectKey of the chapter whose Tes Bab sheet is open — spotlight its boss. */
  selectedBossKey?: string | null
  /** One-shot onboarding bubble, rendered just above the current node's chapter. */
  coachMark?: ReactNode
}

export default function PathTrail({
  garden,
  lastSubjectKey,
  onNode,
  onBoss,
  onChapter,
  currentRef,
  selectedSlug,
  selectedBossKey,
  coachMark,
}: Props) {
  const current = pickCurrentNode(garden, lastSubjectKey)

  return (
    <div>
      {garden.chapters.map((chapter, chapterIndex) => {
        const count = chapter.concepts.length + 1 // +1 boss
        const offsets = nodeOffsets(count)
        const height = count * ROW_H + PAD_TOP + PAD_BOT
        const centers = offsets.map((p) => ({
          x: p.x * 100,
          y: p.y * ROW_H + ROW_H / 2 + PAD_TOP,
        }))
        const d = centers
          .map((p, i) => {
            if (i === 0) return `M ${p.x} ${p.y}`
            const prev = centers[i - 1]
            const midY = (prev.y + p.y) / 2
            return `C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`
          })
          .join(' ')
        const isCurrentChapter = current?.chapter.subjectKey === chapter.subjectKey

        return (
          <section
            key={chapter.subjectKey}
            className="mb-2 rounded-[1.625rem] p-2 pb-1"
            style={{ background: `${chapter.colorHex}12` }}
          >
            {/* Banner row — tappable: opens the chapter's curriculum breakdown. */}
            <button
              type="button"
              onClick={() => onChapter(chapter)}
              aria-label={`Rincian Bab ${chapterIndex + 1} — ${chapter.nameId}, ${chapter.grownCount} dari ${chapter.total} tumbuh`}
              className={`tap-press flex w-full items-center gap-3 rounded-[1.25rem] px-3.5 py-3 text-left ring-2 active:translate-y-0.5 ${
                chapter.unlocked
                  ? 'bg-white shadow-[0_5px_0_0_#FFD3B1] ring-[#FFE3CC]'
                  : 'bg-[#FBF4E7] shadow-[0_5px_0_0_#EFE2CC] ring-[#EFE2CC]'
              }`}
            >
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[0.75rem] text-[0.9375rem] text-white"
                style={{ background: chapter.unlocked ? chapter.colorHex : '#C3CAD6' }}
              >
                <i
                  className={`fa-solid ${chapter.unlocked ? `fa-${chapter.iconKey}` : 'fa-lock'}`}
                  aria-hidden="true"
                />
              </span>
              <span className="min-w-0 flex-1">
                <h2
                  className={`truncate font-display text-base font-black leading-tight ${
                    chapter.unlocked ? 'text-qupu-brand-blue' : 'text-[#7C8597]'
                  }`}
                >
                  Bab {chapterIndex + 1} · {chapter.nameId}
                </h2>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      background: chapter.unlocked ? chapter.colorHex : '#C3CAD6',
                      width: `${chapter.total ? Math.round((chapter.grownCount / chapter.total) * 100) : 0}%`,
                    }}
                  />
                </span>
              </span>
              <span
                className={`flex-shrink-0 font-display text-sm font-black ${
                  chapter.unlocked ? 'text-[#58A700]' : 'text-[#AAB2BF]'
                }`}
              >
                {chapter.grownCount}/{chapter.total}
              </span>
              <i
                className="fa-solid fa-chevron-right flex-shrink-0 text-xs text-qupu-muted/60"
                aria-hidden="true"
              />
            </button>

            {isCurrentChapter && coachMark}

            {/* Trail canvas */}
            <div className="relative" style={{ height }}>
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox={`0 0 100 ${height}`}
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d={d}
                  fill="none"
                  stroke="#FFD3B1"
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={chapter.unlocked ? undefined : '4 14'}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {chapter.concepts.map((concept, i) => {
                const isCurrent = isCurrentChapter && current?.concept.slug === concept.slug
                // Exactly one spotlit node (orange ring + pulse + Mulai chip +
                // checkpoint flag): the selected one while a sheet is open,
                // otherwise the default "you are here" stop.
                const sheetTaken = !!selectedSlug || !!selectedBossKey
                const spotlit = selectedSlug
                  ? selectedSlug === concept.slug
                  : !sheetTaken && isCurrent
                const state: PathNodeState = !chapter.unlocked
                  ? 'locked'
                  : spotlit
                    ? 'current'
                    : 'open'
                return (
                  <div
                    key={concept.slug}
                    data-node-slug={concept.slug}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `calc(${offsets[i].x * 100}%)`, top: centers[i].y }}
                  >
                    <PathNode
                      state={state}
                      tier={concept.tier}
                      isBoss={false}
                      selected={selectedSlug === concept.slug}
                      checkpoint={isCurrent}
                      label={`${concept.nameId} — ${state === 'locked' ? 'terkunci' : 'latihan'}`}
                      onClick={() => onNode(concept, chapter)}
                      anchorRef={isCurrent ? currentRef : undefined}
                    />
                  </div>
                )
              })}

              {/* Boss — Tes Bab */}
              <div
                data-node-slug={`boss-${chapter.subjectKey}`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `calc(${offsets[count - 1].x * 100}%)`,
                  top: centers[count - 1].y,
                }}
              >
                <PathNode
                  state={bossState(chapter, isCurrentChapter)}
                  tier={0}
                  isBoss
                  selected={selectedBossKey === chapter.subjectKey}
                  label={`Tes Bab — ${chapter.nameId}`}
                  onClick={() => onBoss(chapter)}
                />
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
