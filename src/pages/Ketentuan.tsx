import { Link } from 'react-router-dom'
import LegalPage, { LegalList, LegalSection, LegalText } from '@/components/LegalPage'
import useDocumentTitle from '@/hooks/useDocumentTitle'

// Kontak resmi — TODO: konfirmasi alamat email ini aktif sebelum dipublikasikan
// luas; ganti di satu tempat ini jika alamatnya berbeda.
const CONTACT_EMAIL = 'halo@qupu.id'

export default function KetentuanPage() {
  useDocumentTitle('Syarat & Ketentuan')
  return (
    <LegalPage
      eyebrow="Legal"
      title="Syarat & Ketentuan"
      updatedAt="9 Juni 2026"
      intro="Syarat dan ketentuan ini mengatur penggunaan layanan QUPU. Dengan membuat akun atau menggunakan layanan, kamu menyetujui ketentuan di bawah ini."
    >
      <LegalSection title="1. Layanan Kami">
        <LegalText>
          QUPU menyediakan latihan matematika dan video edukatif untuk anak, termasuk Latihan WMI
          dengan penjelasan langkah demi langkah, kuis, lencana, dan pencatatan kemajuan belajar.
          Akun dibuat dan dikelola oleh orang tua; anak menggunakan layanan melalui profil anak di
          bawah akun orang tuanya.
        </LegalText>
      </LegalSection>

      <LegalSection title="2. Akun & Tanggung Jawab Orang Tua">
        <LegalList
          items={[
            'Pendaftaran akun hanya untuk orang dewasa (orang tua atau wali sah).',
            'Kamu bertanggung jawab menjaga kerahasiaan kata sandi dan seluruh aktivitas yang terjadi di akun kamu.',
            'Data yang kamu berikan saat mendaftar harus benar dan terkini.',
            'Penggunaan layanan oleh anak berada di bawah pengawasan dan persetujuan orang tua.',
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Penggunaan Wajar">
        <LegalText>
          Layanan hanya boleh dipakai untuk keperluan belajar pribadi dan non-komersial. Kamu
          setuju untuk tidak menyalahgunakan layanan — termasuk membagikan akun kepada pihak lain,
          mencoba mengakses sistem atau data tanpa izin, mengganggu kelancaran layanan, atau
          menyalin konten secara massal (scraping).
        </LegalText>
      </LegalSection>

      <LegalSection title="4. Konten & Kekayaan Intelektual">
        <LegalText>
          Seluruh materi di QUPU — soal latihan, penjelasan, animasi, ilustrasi, video, dan elemen
          tampilan — adalah milik QUPU atau pemberi lisensinya. Kamu mendapatkan lisensi terbatas,
          tidak eksklusif, dan tidak dapat dipindahtangankan untuk menggunakan materi tersebut
          dalam rangka belajar pribadi. Dilarang memperbanyak atau memakai materi untuk tujuan
          komersial tanpa izin tertulis dari QUPU.
        </LegalText>
      </LegalSection>

      <LegalSection title="5. Langganan & Pembayaran">
        <LegalText>
          Saat ini fitur inti QUPU tersedia gratis. Apabila di kemudian hari tersedia fitur
          berbayar, ketentuan harga, pembayaran, dan pembatalannya akan diatur dan diumumkan saat
          fitur tersebut tersedia — sebelum kamu dikenakan biaya apa pun.
        </LegalText>
      </LegalSection>

      <LegalSection title="6. Batasan Tanggung Jawab">
        <LegalText>
          Layanan disediakan sebagaimana adanya. Kami berupaya menjaga layanan tetap akurat dan
          tersedia, namun tidak menjamin layanan bebas dari gangguan atau kesalahan, dan tidak
          menjamin hasil belajar tertentu. Sepanjang diizinkan hukum yang berlaku, tanggung jawab
          QUPU terbatas pada kerugian langsung yang wajar akibat kelalaian kami.
        </LegalText>
      </LegalSection>

      <LegalSection title="7. Penghentian">
        <LegalText>
          Kamu dapat berhenti menggunakan layanan dan meminta penghapusan akun kapan saja. Kami
          dapat menangguhkan atau menghentikan akun yang melanggar ketentuan ini, dengan
          pemberitahuan yang wajar bila memungkinkan. Penghapusan akun mengikuti ketentuan pada{' '}
          <Link to="/privasi" className="font-bold text-qupu-brand-orange hover:underline">
            Kebijakan Privasi
          </Link>
          .
        </LegalText>
      </LegalSection>

      <LegalSection title="8. Hukum yang Berlaku">
        <LegalText>
          Syarat dan ketentuan ini diatur oleh hukum Negara Republik Indonesia. Perselisihan akan
          diupayakan diselesaikan secara musyawarah terlebih dahulu.
        </LegalText>
      </LegalSection>

      <LegalSection title="9. Kontak">
        <LegalText>
          Pertanyaan tentang syarat dan ketentuan ini dapat dikirim ke{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-bold text-qupu-brand-orange hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </LegalText>
      </LegalSection>
    </LegalPage>
  )
}
