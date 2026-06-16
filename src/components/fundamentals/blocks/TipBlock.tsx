import { bi, Paragraphs, type Lang } from './textUtil'

interface TipBlockData {
  variant?: 'tip' | 'warning'
  title_en?: string
  title_id?: string
  body_en: string
  body_id: string
}

const STYLES = {
  tip: {
    wrap: 'border-qupu-brand-blue/25 bg-qupu-brand-blue/5',
    chip: 'bg-qupu-brand-blue text-white',
    icon: 'fa-solid fa-lightbulb',
    fallback: { id: 'Tips', en: 'Tip' },
  },
  warning: {
    wrap: 'border-amber-300 bg-amber-50',
    chip: 'bg-amber-500 text-white',
    icon: 'fa-solid fa-triangle-exclamation',
    fallback: { id: 'Hati-hati', en: 'Watch out' },
  },
} as const

export default function TipBlock({ block, lang }: { block: TipBlockData; lang: Lang }) {
  const variant = block.variant ?? 'tip'
  const s = STYLES[variant]
  const title = bi(lang, block.title_en, block.title_id) || s.fallback[lang]
  return (
    <aside className={`rounded-2xl border-2 ${s.wrap} p-4`}>
      <div className="mb-1.5 flex items-center gap-2">
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${s.chip}`}>
          <i className={s.icon} aria-hidden="true" />
        </span>
        <span className="font-display text-sm font-black text-qupu-brand-blue">{title}</span>
      </div>
      <div className="space-y-1.5 text-sm font-semibold leading-relaxed text-qupu-brand-blue/85">
        <Paragraphs text={bi(lang, block.body_en, block.body_id)} />
      </div>
    </aside>
  )
}
