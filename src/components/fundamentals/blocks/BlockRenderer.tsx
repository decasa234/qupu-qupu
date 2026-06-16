import type { LessonBlock } from '../../../types/fundamentals'
import type { Lang } from './textUtil'
import ProseBlock from './ProseBlock'
import TipBlock from './TipBlock'
import CheckBlock from './CheckBlock'

export type { Lang }

export interface BlockRendererProps {
  blocks: LessonBlock[]
  lang: Lang
  /** Fired the first time a `check` block is answered (for lesson-level scoring). */
  onCheckAnswered?: (blockId: string, correct: boolean) => void
}

/** Renders one lesson body. Used by BOTH the member lesson page and the admin
 *  editor's live preview, so it must stay presentational + SSR-safe. */
export default function BlockRenderer({ blocks, lang, onCheckAnswered }: BlockRendererProps) {
  return (
    <div className="space-y-5">
      {blocks.map((block) => (
        <BlockSwitch key={block.id} block={block} lang={lang} onCheckAnswered={onCheckAnswered} />
      ))}
    </div>
  )
}

function BlockSwitch({
  block,
  lang,
  onCheckAnswered,
}: {
  block: LessonBlock
  lang: Lang
  onCheckAnswered?: (blockId: string, correct: boolean) => void
}) {
  switch (block.type) {
    case 'prose':
      return <ProseBlock block={block} lang={lang} />
    case 'tip':
      return <TipBlock block={block} lang={lang} />
    case 'check':
      return <CheckBlock block={block} lang={lang} onAnswered={onCheckAnswered} />
    default:
      // Interactive blocks (worked / glossary / image / scoring) are wired in
      // Phase 2; until then they render nothing rather than breaking a lesson.
      return null
  }
}
