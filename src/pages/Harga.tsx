import { Link } from 'react-router-dom'
import Reveal from '@/components/Reveal'
import WmiPricingSection from '@/components/wmi/marketing/WmiPricingSection'

export default function HargaPage() {
  return (
    <div className="space-y-12 py-4 sm:space-y-16">
      <Reveal delay={0.05}>
        <WmiPricingSection />
      </Reveal>

      <Reveal delay={0.05}>
        <section className="mx-auto max-w-2xl rounded-[2rem] border-[3px] border-qupu-peach bg-qupu-cream p-6 text-center sm:p-8">
          <p className="text-sm font-semibold text-qupu-brand-blue/90 sm:text-base">
            Belum yakin? Coba dulu demo Latihan WMI — gratis, tanpa perlu daftar.
          </p>
          <Link
            to="/wmi"
            className="mt-4 inline-flex items-center gap-2 rounded-full border-[3px] border-qupu-brand-blue bg-white px-6 py-2.5 font-display text-sm font-extrabold text-qupu-brand-blue transition-all hover:-translate-y-0.5 hover:bg-qupu-brand-blue hover:text-white"
          >
            <i className="fa-solid fa-play" aria-hidden="true" />
            Main Demo
          </Link>
        </section>
      </Reveal>
    </div>
  )
}
