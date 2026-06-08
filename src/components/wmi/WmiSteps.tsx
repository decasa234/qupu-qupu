export default function WmiSteps({ steps, lang }: { steps: string[]; lang: 'en' | 'id' }) {
  return (
    <div className="mt-4 rounded-xl border-2 border-qupu-cream-dark bg-qupu-cream/30 p-4">
      <div className="mb-2 text-sm font-bold text-qupu-brand-blue">
        {lang === 'id' ? 'Langkah-langkah' : 'Step-by-step'}
      </div>
      <ol className="list-decimal space-y-1 pl-5 text-sm font-semibold text-gray-800">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  )
}
