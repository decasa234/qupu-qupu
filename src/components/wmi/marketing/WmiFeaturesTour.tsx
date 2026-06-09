import Reveal from '@/components/Reveal'
import WmiAssistedHighlight from '@/components/wmi/marketing/WmiAssistedHighlight'

interface FeatureRow {
  icon: string
  title: string
  desc: string
}

const FEATURES: FeatureRow[] = [
  { icon: 'fa-solid fa-highlighter', title: 'Sorotan terbantu', desc: 'Bagian penting soal disorot otomatis.' },
  { icon: 'fa-solid fa-language', title: 'Dwibahasa', desc: 'Soal & penjelasan dalam Indonesia dan Inggris.' },
  { icon: 'fa-solid fa-list-ol', title: 'Hint bertahap', desc: 'Petunjuk muncul selangkah demi selangkah.' },
  { icon: 'fa-solid fa-circle-play', title: 'Putar & ulang', desc: 'Animasi solusi bisa diputar ulang kapan saja.' },
]

/**
 * "Features tour" section: a centered header, a vertical list of four real
 * explainer features on the left, and the live real product card
 * (`WmiAssistedHighlight`) on the right. On mobile they stack, card below.
 */
export default function WmiFeaturesTour() {
  return (
    <section>
      {/* Centered header */}
      <Reveal className="mx-auto max-w-2xl text-center">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Tur fitur</div>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
          Yang bikin anak paham
        </h2>
        <p className="mt-2 text-sm font-semibold text-qupu-muted sm:text-base">
          Fitur nyata yang menuntun anak sampai paham.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
        {/* LEFT: feature list */}
        <Reveal>
          <ul className="space-y-4">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-qupu-cream text-xl text-qupu-brand-orange">
                  <i className={f.icon} aria-hidden="true" />
                </span>
                <div>
                  <div className="font-display text-base font-extrabold text-qupu-brand-blue">{f.title}</div>
                  <p className="mt-0.5 text-sm font-semibold leading-relaxed text-qupu-muted">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* RIGHT: live real product card */}
        <Reveal delay={0.1}>
          <WmiAssistedHighlight />
        </Reveal>
      </div>
    </section>
  )
}
