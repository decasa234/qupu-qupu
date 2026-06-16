export type Lang = 'id' | 'en'

/** Pick the language variant; falls back to the other if one side is empty. */
export function bi(lang: Lang, en: string | undefined, id: string | undefined): string {
  const primary = lang === 'en' ? en : id
  return (primary ?? (lang === 'en' ? id : en) ?? '').trim()
}

/** Render plain text where blank lines / newlines become separate paragraphs. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  const parts = text
    .split(/\n{1,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  return (
    <>
      {parts.map((p, i) => (
        <p key={i} className={className}>
          {p}
        </p>
      ))}
    </>
  )
}
