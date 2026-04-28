export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      data-print-hide
      className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-blue px-5 py-2 font-display text-sm font-extrabold text-white shadow-subscribe transition-transform hover:-translate-y-0.5"
    >
      <i className="fa-solid fa-print" aria-hidden="true" />
      Cetak / Simpan PDF
    </button>
  )
}
