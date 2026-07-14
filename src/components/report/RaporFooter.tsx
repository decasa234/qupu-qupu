function today(): string {
  return new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function RaporFooter() {
  return (
    <footer className="mt-5 flex items-end justify-between gap-3">
      <div className="text-[0.5625rem] text-qupu-muted">Dicetak {today()} · qupu.id/dashboard</div>
      <div className="text-center">
        <div className="w-32 border-t border-qupu-brand-blue pt-0.5 text-[0.625rem] text-qupu-muted">
          Tanda tangan orang tua
        </div>
      </div>
    </footer>
  )
}
