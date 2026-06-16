import { bi, Paragraphs, type Lang } from './textUtil'

interface ProseBlockData {
  title_en?: string
  title_id?: string
  body_en: string
  body_id: string
}

export default function ProseBlock({ block, lang }: { block: ProseBlockData; lang: Lang }) {
  const title = bi(lang, block.title_en, block.title_id)
  return (
    <section>
      {title && (
        <h3 className="mb-2 font-display text-lg font-black text-qupu-brand-blue">{title}</h3>
      )}
      <div className="space-y-2 text-sm font-semibold leading-relaxed text-qupu-muted">
        <Paragraphs text={bi(lang, block.body_en, block.body_id)} />
      </div>
    </section>
  )
}
