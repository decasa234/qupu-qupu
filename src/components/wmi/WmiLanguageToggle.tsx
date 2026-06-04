interface Props {
  lang: 'en' | 'id'
  onToggle: () => void
}

// Swaps the question between English and Indonesian in place. The label shows
// the language it will switch TO, so a kid always sees the "other" option.
export default function WmiLanguageToggle({ lang, onToggle }: Props) {
  const target = lang === 'en' ? 'ID' : 'EN'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={lang === 'en' ? 'Terjemahkan ke Bahasa Indonesia' : 'Terjemahkan ke Bahasa Inggris'}
      title={lang === 'en' ? 'Ke Bahasa Indonesia' : 'Ke Bahasa Inggris'}
      className="flex h-9 items-center justify-center gap-1 rounded-full border-2 border-qupu-brand-blue bg-white px-3 font-display text-sm font-bold text-qupu-brand-blue transition-colors hover:bg-qupu-sky"
    >
      <i className="fa-solid fa-globe" aria-hidden="true" />
      {target}
    </button>
  )
}
