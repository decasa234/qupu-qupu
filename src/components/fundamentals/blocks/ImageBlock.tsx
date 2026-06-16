import { bi, type Lang } from './textUtil'

interface ImageBlockData {
  src: string
  alt_en: string
  alt_id: string
  caption_en?: string
  caption_id?: string
}

export default function ImageBlock({ block, lang }: { block: ImageBlockData; lang: Lang }) {
  const caption = bi(lang, block.caption_en, block.caption_id)
  return (
    <figure className="overflow-hidden rounded-2xl border-2 border-qupu-brand-blue/10 bg-white">
      <img
        src={block.src}
        alt={bi(lang, block.alt_en, block.alt_id)}
        loading="lazy"
        className="mx-auto block max-h-[360px] w-full object-contain bg-qupu-shell"
      />
      {caption && (
        <figcaption className="px-3 py-2 text-center text-xs font-semibold text-qupu-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
