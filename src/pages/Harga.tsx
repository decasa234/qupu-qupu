import Reveal from '@/components/Reveal'
import WmiPricingSection from '@/components/wmi/marketing/WmiPricingSection'
import useDocumentTitle from '@/hooks/useDocumentTitle'

export default function HargaPage() {
  useDocumentTitle('Harga')
  return (
    <div className="space-y-12 py-4 sm:space-y-16">
      <Reveal delay={0.05}>
        <WmiPricingSection />
      </Reveal>
    </div>
  )
}
