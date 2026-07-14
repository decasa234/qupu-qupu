import { useState } from 'react'
import { motion } from 'framer-motion'
import { stripSectionLabels } from '../../lib/wmiBreakdown'
import { parseWmiMarkup } from '../../lib/wmiMarkup'
import type { Breakdown, BreakdownCategory } from '../../types/wmi'

type Lang = 'en' | 'id'

const INK = '#1E3A8A'

// Per-category colours + labels. `soft` (rgba) is the lit-up highlight; `text`
// is the word colour once lit. Kept as literals so framer-motion can tween them.
const CAT: Record<BreakdownCategory, {
  soft: string
  text: string
  ring: string
  panel: string
  icon: string
  label_en: string
  label_id: string
}> = {
  fact: {
    soft: 'rgba(48,89,138,0.16)',
    text: '#30598A',
    ring: 'ring-qupu-brand-blue',
    panel: 'border-qupu-brand-blue/30 bg-qupu-sky/50',
    icon: 'fa-solid fa-circle-info',
    label_en: 'Fact',
    label_id: 'Fakta',
  },
  condition: {
    soft: 'rgba(255,221,85,0.55)',
    text: INK,
    ring: 'ring-qupu-brand-yellow',
    panel: 'border-qupu-brand-yellow/50 bg-yellow-50',
    icon: 'fa-solid fa-list-check',
    label_en: 'Rule',
    label_id: 'Aturan',
  },
  question: {
    soft: 'rgba(124,58,237,0.16)',
    text: '#7C3AED',
    ring: 'ring-qupu-purple',
    panel: 'border-qupu-purple/30 bg-qupu-purple/10',
    icon: 'fa-solid fa-bullseye',
    label_en: 'Find',
    label_id: 'Cari',
  },
  // A concrete object/landmark in the problem to locate first (e.g. "the toucan").
  // Green keeps it distinct from the fact (blue) and find (purple) spans.
  object: {
    soft: 'rgba(16,185,129,0.18)',
    text: '#047857',
    ring: 'ring-emerald-500',
    panel: 'border-emerald-500/30 bg-emerald-50',
    icon: 'fa-solid fa-location-dot',
    label_en: 'Object',
    label_id: 'Objek',
  },
}

// Legacy authoring used a wider category vocabulary before it was narrowed to
// the four in CAT. Alias the old names so old data still colours correctly, and
// fall back to `fact` for anything unknown — an unmapped category must never
// crash the Q breakdown (CAT[bad] is undefined → reading .soft throws).
const CATEGORY_ALIAS: Record<string, BreakdownCategory> = {
  given: 'fact',
  goal: 'question',
  operation: 'condition',
  trap: 'condition',
}
function catOf(category: string) {
  return CAT[category as BreakdownCategory] ?? CAT[CATEGORY_ALIAS[category]] ?? CAT.fact
}

// Split `text` into plain / highlighted runs, tagging each highlighted run with
// the index of its highlight. Longest phrase wins so "30" inside "130" can't
// steal the match.
function segment(text: string, phrases: string[]): Array<{ text: string; hi: number | null }> {
  const items = phrases
    .map((phrase, i) => ({ i, phrase }))
    .filter((x) => x.phrase)
    .sort((a, b) => b.phrase.length - a.phrase.length)
  const out: Array<{ text: string; hi: number | null }> = []
  let i = 0
  while (i < text.length) {
    const m = items.find((it) => text.startsWith(it.phrase, i))
    if (m) {
      out.push({ text: m.phrase, hi: m.i })
      i += m.phrase.length
    } else {
      const last = out[out.length - 1]
      if (last && last.hi === null) last.text += text[i]
      else out.push({ text: text[i], hi: null })
      i += 1
    }
  }
  return out
}

// The "Q" breakdown: the problem text fades in fully, then each important span
// lights up one-by-one in its category colour (fact / rule / find). Lit spans
// carry a dashed underline to show they're tappable; tapping shows a short note.
export default function WmiAuthoredBreakdown({
  breakdown,
  text,
  lang,
  pulseHint = false,
}: {
  breakdown: Breakdown
  text: string
  lang: Lang
  /** When true, the highlighted spans gently pop to hint that they're tappable. */
  pulseHint?: boolean
}) {
  const isId = lang === 'id'
  const highlights = breakdown.highlights
  const [selected, setSelected] = useState<number | null>(null)

  // Display text = body with section labels removed AND glossary [[...]] markup
  // resolved to its display label, so highlight phrases match what the kid sees.
  const clean = parseWmiMarkup(stripSectionLabels(text))
    .map((seg) => seg.text)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
  const phrases = highlights.map((hl) => (isId ? hl.phrase_id : hl.phrase_en))
  const segments = segment(clean, phrases)

  const sel = selected != null ? highlights[selected] : null
  const selCat = sel ? catOf(sel.category) : null

  return (
    <div className="mt-4">
      {pulseHint && (
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-qupu-brand-orange/10 px-2.5 py-1 text-xs font-extrabold text-qupu-brand-orange">
          <i className="fa-solid fa-hand-pointer" aria-hidden="true" />
          Ketuk bagian berwarna untuk lihat artinya
        </div>
      )}
      <motion.p
        initial="hidden"
        animate="shown"
        variants={{
          hidden: { opacity: 0 },
          shown: {
            opacity: 1,
            transition: { duration: 0.3, when: 'beforeChildren', delayChildren: 0.2, staggerChildren: 0.13 },
          },
        }}
        className="rounded-xl border border-black/5 bg-qupu-cream/60 px-4 py-3 text-lg leading-relaxed text-qupu-ink"
      >
        {segments.map((s, i) => {
          if (s.hi === null) return <span key={i}>{s.text}</span>
          const hl = highlights[s.hi]
          const cat = catOf(hl.category)
          const isSel = s.hi === selected
          const toggle = () => setSelected((cur) => (cur === s.hi ? null : s.hi))
          return (
            <motion.span
              key={i}
              role="button"
              tabIndex={0}
              onClick={toggle}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggle()
                }
              }}
              variants={{
                hidden: { backgroundColor: 'rgba(255,255,255,0)', color: INK },
                shown: { backgroundColor: cat.soft, color: cat.text },
              }}
              style={pulseHint && !isSel ? { animationDelay: `${0.4 + s.hi * 0.45}s` } : undefined}
              className={`cursor-pointer rounded-md px-1.5 font-extrabold ${
                isSel ? `ring-2 ring-offset-1 ${cat.ring}` : ''
              }${pulseHint ? ' inline-block underline decoration-dashed decoration-2 underline-offset-[0.1875rem]' : ''}${pulseHint && !isSel ? ' motion-safe:animate-tapPop' : ''}`}
            >
              {s.text}
            </motion.span>
          )
        })}
      </motion.p>

      {sel && selCat && (
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`mt-2 flex items-start gap-2 rounded-xl border px-3 py-2 text-base ${selCat.panel}`}
        >
          <i className={`${selCat.icon} mt-0.5`} aria-hidden="true" />
          <div>
            <span className="font-display font-extrabold">{isId ? selCat.label_id : selCat.label_en}: </span>
            <span className="text-qupu-ink">{isId ? sel.note_id : sel.note_en}</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
