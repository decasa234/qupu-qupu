import { Fragment, useEffect, useMemo, useState } from 'react'
import { segmentSections } from '../../lib/wmiBreakdown'
import type { BreakdownCategory, SectionKind } from '../../lib/wmiBreakdown'
import WmiGlossaryTerm from './WmiGlossaryTerm'

const TOKEN_STYLE: Record<BreakdownCategory, string> = {
  number: 'align-baseline text-[1.45em] font-extrabold leading-none text-qupu-brand-orange',
  'question-word': 'text-xl font-bold text-qupu-purple',
  operator: 'align-baseline text-[1.35em] font-extrabold leading-none text-qupu-brand-blue',
  glossary: '',
  plain: '',
}

const SECTION_STYLE: Record<SectionKind, { tint: string; tab: string; ink: string }> = {
  start: { tint: 'bg-qupu-sky', tab: 'bg-qupu-brand-blue', ink: 'text-white' },
  mystery: { tint: 'bg-purple-50', tab: 'bg-qupu-purple', ink: 'text-white' },
  add: { tint: 'bg-emerald-50', tab: 'bg-emerald-500', ink: 'text-white' },
  'take-away': { tint: 'bg-rose-50', tab: 'bg-rose-500', ink: 'text-white' },
  give: { tint: 'bg-orange-50', tab: 'bg-qupu-brand-orange', ink: 'text-white' },
  compare: { tint: 'bg-indigo-50', tab: 'bg-indigo-500', ink: 'text-white' },
  clue: { tint: 'bg-yellow-50', tab: 'bg-qupu-brand-yellow', ink: 'text-qupu-ink' },
  share: { tint: 'bg-pink-50', tab: 'bg-pink-500', ink: 'text-white' },
  now: { tint: 'bg-qupu-peach/60', tab: 'bg-qupu-orange-dark', ink: 'text-white' },
  find: { tint: 'bg-qupu-purple/15', tab: 'bg-qupu-purple', ink: 'text-white' },
  extra: { tint: 'bg-gray-100', tab: 'bg-gray-500', ink: 'text-white' },
  example: { tint: 'bg-qupu-cream', tab: 'bg-qupu-brand-orange', ink: 'text-white' },
  plain: { tint: 'bg-gray-100', tab: 'bg-gray-400', ink: 'text-white' },
}

const SECTION_EMOJI: Record<SectionKind, string> = {
  start: '📖',
  mystery: '🔮',
  add: '➕',
  'take-away': '➖',
  give: '🎁',
  compare: '⚖️',
  clue: '🔍',
  share: '🍰',
  now: '👉',
  find: '🎯',
  extra: '📎',
  example: '💡',
  plain: '',
}

const SECTION_WORD: Record<'en' | 'id', Record<SectionKind, string>> = {
  en: {
    start: 'Start',
    mystery: 'Mystery',
    add: 'Add',
    'take-away': 'Take Away',
    give: 'Give',
    compare: 'Compare',
    clue: 'Clue',
    share: 'Share',
    now: 'Now',
    find: 'Find',
    extra: 'Extra',
    example: 'Example',
    plain: '',
  },
  id: {
    start: 'Mulai',
    mystery: 'Misteri',
    add: 'Tambah',
    'take-away': 'Kurang',
    give: 'Beri',
    compare: 'Bandingkan',
    clue: 'Petunjuk',
    share: 'Bagi',
    now: 'Sekarang',
    find: 'Cari',
    extra: 'Tambahan',
    example: 'Contoh',
    plain: '',
  },
}

interface Props {
  text: string
  lang: 'en' | 'id'
  onLookup: (slug: string) => void
}

function Tokens({
  tokens,
  onLookup,
}: {
  tokens: ReturnType<typeof segmentSections>[number]['clauses'][number]['tokens']
  onLookup: (slug: string) => void
}) {
  return (
    <>
      {tokens.map((token, tokenIndex) => (
        <Fragment key={`${token.text}-${tokenIndex}`}>
          {tokenIndex > 0 && ' '}
          {token.category === 'glossary' && token.slug ? (
            <WmiGlossaryTerm slug={token.slug} onLookup={onLookup}>
              {token.text}
            </WmiGlossaryTerm>
          ) : (
            <span className={TOKEN_STYLE[token.category]}>{token.text}</span>
          )}
        </Fragment>
      ))}
    </>
  )
}

export default function WmiBreakdownView({ text, lang, onLookup }: Props) {
  const sections = useMemo(() => segmentSections(text, lang), [text, lang])
  const [shown, setShown] = useState(0)

  useEffect(() => {
    setShown(0)
    if (sections.length === 0) return
    const timers = sections.map((_, index) =>
      window.setTimeout(() => setShown((current) => Math.max(current, index + 1)), 120 + index * 380),
    )
    return () => timers.forEach(window.clearTimeout)
  }, [sections])

  return (
    <div className="mt-5 flex flex-col gap-5 leading-snug">
      {sections.slice(0, shown).map((section, sectionIndex) => {
        const style = SECTION_STYLE[section.kind]
        const label = SECTION_WORD[lang][section.kind]
        return (
          <div key={`${section.kind}-${sectionIndex}`} className="relative animate-rise">
            {label && (
              <span
                className={`absolute -top-4 left-3 z-10 rounded-t-lg border border-black/5 px-3 py-1 font-display text-xs font-extrabold shadow-sm ${style.tab} ${style.ink}`}
              >
                {SECTION_EMOJI[section.kind]} {label}
              </span>
            )}
            <div className={`rounded-xl border border-black/5 px-3.5 pb-3 pt-4 shadow-sm ${style.tint}`}>
              {section.clauses.map((clause, clauseIndex) => (
                <Fragment key={clauseIndex}>
                  {clauseIndex > 0 && <span className="mx-1 text-gray-400">·</span>}
                  <Tokens tokens={clause.tokens} onLookup={onLookup} />
                </Fragment>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
