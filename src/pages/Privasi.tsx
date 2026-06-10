import LegalPage, { LegalList, LegalSection, LegalText } from '@/components/LegalPage'
import useDocumentTitle from '@/hooks/useDocumentTitle'

// Kontak resmi — TODO: konfirmasi alamat email ini aktif sebelum dipublikasikan
// luas; ganti di satu tempat ini jika alamatnya berbeda.
const CONTACT_EMAIL = 'halo@qupu.id'

export default function PrivasiPage() {
  useDocumentTitle('Kebijakan Privasi')
  return (
    <LegalPage
      eyebrow="Legal"
      title="Kebijakan Privasi"
      updatedAt="9 Juni 2026"
      intro="QUPU adalah layanan belajar matematika dan video edukatif untuk anak, dengan akun yang dibuat dan dikelola oleh orang tua. Kebijakan ini menjelaskan data apa yang kami kumpulkan, untuk apa data itu dipakai, dan apa hak kamu — sesuai UU Pelindungan Data Pribadi (UU No. 27 Tahun 2022)."
    >
      <LegalSection title="1. Data yang Kami Kumpulkan">
        <LegalList
          items={[
            <>
              <strong>Akun orang tua:</strong> nama, alamat email, nomor HP, dan kata sandi
              (disimpan dalam bentuk hash, bukan teks asli). Jika kamu masuk dengan Google, kami
              menyimpan pengenal akun Google kamu.
            </>,
            <>
              <strong>Profil anak:</strong> nama panggilan, kelompok usia, pilihan avatar (warna
              dan ikon), serta target latihan harian. Kami tidak meminta data kontak anak.
            </>,
            <>
              <strong>Aktivitas belajar:</strong> riwayat latihan dan kuis, skor, lencana (badge),
              XP, dan runtunan (streak) belajar — dipakai untuk menampilkan kemajuan anak.
            </>,
            <>
              <strong>Cookie &amp; penyimpanan lokal:</strong> token sesi login, preferensi,
              pilihan persetujuan cookie, dan ID sesi acak untuk analitik penggunaan — analitik
              hanya aktif jika kamu menyetujuinya lewat banner cookie.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Tujuan Penggunaan Data">
        <LegalList
          items={[
            'Menjalankan layanan: login, profil anak, latihan, dan penyimpanan kemajuan belajar.',
            'Menampilkan kemajuan belajar anak kepada orang tua (skor, lencana, runtunan).',
            'Komunikasi akun, misalnya mengirim kode OTP verifikasi email saat pendaftaran.',
            'Menjaga keamanan layanan dan mencegah penyalahgunaan.',
            'Analitik penggunaan secara agregat untuk memperbaiki produk — hanya dengan persetujuan kamu.',
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Persetujuan Orang Tua untuk Data Anak">
        <LegalText>
          Akun QUPU dibuat dan dikelola oleh orang tua. Data anak yang kami proses terbatas pada
          profil belajar (nama panggilan, kelompok usia, avatar) dan aktivitas belajarnya, dan
          pemrosesan tersebut dilakukan berdasarkan persetujuan orang tua sebagai pemegang akun —
          sesuai ketentuan UU Pelindungan Data Pribadi mengenai data pribadi anak. Orang tua dapat
          mengubah atau menghapus profil anak kapan saja dari dalam akun.
        </LegalText>
      </LegalSection>

      <LegalSection title="4. Penyimpanan & Keamanan">
        <LegalText>
          Kata sandi disimpan dalam bentuk hash dan tidak pernah disimpan sebagai teks asli. Akses
          ke data dibatasi hanya untuk keperluan operasional layanan, dan lalu lintas data
          menggunakan koneksi terenkripsi (HTTPS). Data disimpan selama akun kamu aktif; jika akun
          dihapus, data profil anak yang terkait ikut terhapus.
        </LegalText>
      </LegalSection>

      <LegalSection title="5. Berbagi Data">
        <LegalText>
          Kami tidak menjual data pribadi kamu maupun data anak kepada pihak mana pun. Data hanya
          dibagikan kepada penyedia infrastruktur yang membantu kami menjalankan layanan — seperti
          layanan pengiriman email untuk kode OTP serta penyedia hosting dan basis data — dan
          mereka hanya memproses data sebatas yang diperlukan untuk layanan tersebut.
        </LegalText>
      </LegalSection>

      <LegalSection title="6. Hak Kamu">
        <LegalText>
          Kamu berhak mengakses, memperbaiki, dan meminta penghapusan data pribadi kamu maupun data
          anak yang kamu kelola. Untuk menggunakan hak-hak ini, hubungi kami di{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-bold text-qupu-brand-orange hover:underline"
          >
            {CONTACT_EMAIL}
          </a>{' '}
          dan kami akan menindaklanjutinya sesuai ketentuan yang berlaku.
        </LegalText>
      </LegalSection>

      <LegalSection title="7. Perubahan Kebijakan">
        <LegalText>
          Kebijakan ini dapat kami perbarui dari waktu ke waktu. Versi terbaru selalu tersedia di
          halaman ini beserta tanggal pembaruannya. Untuk perubahan yang berarti, kami akan
          memberitahukannya lewat layanan atau email.
        </LegalText>
      </LegalSection>

      <LegalSection title="8. Kontak">
        <LegalText>
          Pertanyaan tentang privasi dan pelindungan data dapat dikirim ke{' '}
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
