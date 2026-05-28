import { breakdownQuestion } from '../../lib/wmiBreakdown'
import type { BreakdownCategory } from '../../lib/wmiBreakdown'
import WmiGlossaryTerm from './WmiGlossaryTerm'

const TOKEN_STYLE: Record<BreakdownCategory, string> = {
  number: 'text-2xl font-extrabold text-qupu-brand-orange',
  'question-word': 'text-xl font-bold text-qupu-purple',
  glossary: '',
  plain: 'text-gray-900',
}

interface Props {
  text: string
  lang: 'en' | 'id'
  onLookup: (slug: string) => void
}

export default function WmiBreakdownView({ text, lang, onLookup }: Props) {
  const clauses = breakdownQuestion(text, lang)
  return (
    <div className="space-y-1">
      {clauses.map((clause, clauseIndex) => (
        <div key={clauseIndex} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {clause.tokens.map((token, tokenIndex) =>
            token.category === 'glossary' && token.slug ? (
              <WmiGlossaryTerm key={tokenIndex} slug={token.slug} onLookup={onLookup}>
                {token.text}
              </WmiGlossaryTerm>
            ) : (
              <span key={tokenIndex} className={TOKEN_STYLE[token.category]}>
                {token.text}
              </span>
            ),
          )}
        </div>
      ))}
    </div>
  )
}
