import { useMemo, useState } from 'react'
import {
  computeScore,
  getBrand,
  listBrands,
  type Brand,
  type SectionCount,
} from '../../../../api/services/wmi/olympiads/registry'
import { bi, Paragraphs, type Lang } from './textUtil'

interface ScoringBlockData {
  brands?: string[]
  intro_en?: string
  intro_id?: string
}

function resolveBrands(slugs?: string[]): Brand[] {
  if (!slugs || slugs.length === 0) return listBrands()
  const out: Brand[] = []
  for (const slug of slugs) {
    try {
      out.push(getBrand(slug))
    } catch {
      // Unknown slug in authored content — skip rather than break the lesson.
    }
  }
  return out.length > 0 ? out : listBrands()
}

const zeros = (n: number): SectionCount[] =>
  Array.from({ length: n }, () => ({ correct: 0, wrong: 0, blank: 0 }))

export default function ScoringBlock({ block, lang }: { block: ScoringBlockData; lang: Lang }) {
  const brands = useMemo(() => resolveBrands(block.brands), [block.brands])
  const [activeSlug, setActiveSlug] = useState(brands[0]?.slug ?? '')
  const [counts, setCounts] = useState<Record<string, SectionCount[]>>({})

  const brand = brands.find((b) => b.slug === activeSlug) ?? brands[0]
  if (!brand) return null

  const current = counts[brand.slug] ?? zeros(brand.scoring.sections.length)
  const score = computeScore(brand.scoring, current)

  function setCount(sectionIdx: number, field: keyof SectionCount, value: number) {
    setCounts((prev) => {
      const base = prev[brand.slug] ?? zeros(brand.scoring.sections.length)
      const next = base.map((c, i) => (i === sectionIdx ? { ...c, [field]: Math.max(0, value) } : c))
      return { ...prev, [brand.slug]: next }
    })
  }

  const intro = bi(lang, block.intro_en, block.intro_id)
  const notes = bi(lang, brand.scoring.notesEn, brand.scoring.notesId)

  return (
    <section className="rounded-2xl border-2 border-qupu-brand-blue/20 bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-qupu-brand-blue text-[11px] text-white">
          <i className="fa-solid fa-calculator" aria-hidden="true" />
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-qupu-brand-blue">
          {lang === 'en' ? 'Scoring & penalties' : 'Skor & penalti'}
        </span>
      </div>

      {intro && (
        <div className="mb-3 space-y-1.5 text-sm font-semibold leading-relaxed text-qupu-muted">
          <Paragraphs text={intro} />
        </div>
      )}

      {/* Brand tabs (only when more than one) */}
      {brands.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {brands.map((b) => (
            <button
              key={b.slug}
              type="button"
              onClick={() => setActiveSlug(b.slug)}
              className={`rounded-full px-3 py-1.5 text-xs font-black transition-colors ${
                b.slug === brand.slug
                  ? 'bg-qupu-brand-blue text-white'
                  : 'bg-qupu-cream text-qupu-brand-blue/70'
              }`}
            >
              {b.nameId}
            </button>
          ))}
        </div>
      )}

      {/* Rules table */}
      <div className="overflow-hidden rounded-xl border border-qupu-brand-blue/15">
        <table className="w-full text-left text-xs">
          <thead className="bg-qupu-shell text-qupu-brand-blue">
            <tr>
              <th className="px-2 py-1.5 font-black">{lang === 'en' ? 'Section' : 'Bagian'}</th>
              <th className="px-2 py-1.5 text-center font-black">{lang === 'en' ? 'Correct' : 'Benar'}</th>
              <th className="px-2 py-1.5 text-center font-black">{lang === 'en' ? 'Wrong' : 'Salah'}</th>
              <th className="px-2 py-1.5 text-center font-black">{lang === 'en' ? 'Blank' : 'Kosong'}</th>
            </tr>
          </thead>
          <tbody className="font-bold text-qupu-brand-blue/85">
            {brand.scoring.sections.map((s) => (
              <tr key={s.key} className="border-t border-qupu-brand-blue/10">
                <td className="px-2 py-1.5">{bi(lang, s.labelEn, s.labelId)}</td>
                <td className="px-2 py-1.5 text-center text-[#3B6E00]">+{s.pointsPerCorrect}</td>
                <td className={`px-2 py-1.5 text-center ${s.penaltyPerWrong < 0 ? 'text-red-600' : ''}`}>
                  {s.penaltyPerWrong > 0 ? `+${s.penaltyPerWrong}` : s.penaltyPerWrong}
                </td>
                <td className="px-2 py-1.5 text-center">
                  {s.pointsPerBlank > 0 ? `+${s.pointsPerBlank}` : s.pointsPerBlank}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interactive calculator */}
      <div className="mt-3 rounded-xl bg-qupu-cream/60 p-3">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-qupu-brand-orange">
          {lang === 'en' ? 'Try it' : 'Coba hitung'}
        </p>
        <div className="space-y-2.5">
          {brand.scoring.sections.map((s, i) => (
            <div key={s.key}>
              {brand.scoring.sections.length > 1 && (
                <div className="mb-1 text-[11px] font-black text-qupu-brand-blue">{bi(lang, s.labelEn, s.labelId)}</div>
              )}
              <div className="grid grid-cols-3 gap-2">
                {(['correct', 'wrong', 'blank'] as const).map((field) => (
                  <label key={field} className="block">
                    <span className="mb-0.5 block text-[10px] font-bold uppercase text-qupu-muted">
                      {field === 'correct'
                        ? lang === 'en' ? 'Correct' : 'Benar'
                        : field === 'wrong'
                          ? lang === 'en' ? 'Wrong' : 'Salah'
                          : lang === 'en' ? 'Blank' : 'Kosong'}
                    </span>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={current[i]?.[field] ?? 0}
                      onChange={(e) => setCount(i, field, Math.trunc(Number(e.target.value) || 0))}
                      className="w-full rounded-lg border-2 border-qupu-brand-blue/15 bg-white px-2 py-1.5 text-center text-sm font-black text-qupu-brand-blue focus:border-qupu-brand-orange focus:outline-none"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-qupu-brand-blue px-4 py-2.5 text-white">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-qupu-brand-yellow">
            {lang === 'en' ? 'Your score' : 'Skormu'}
          </span>
          <span className="font-display text-2xl font-black tabular-nums">{score}</span>
        </div>
      </div>

      {notes && (
        <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold leading-relaxed text-amber-800">
          <i className="fa-solid fa-lightbulb mr-1.5" aria-hidden="true" />
          {notes}
        </div>
      )}
    </section>
  )
}
