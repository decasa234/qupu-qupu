interface Props {
  isCorrect: boolean
  correctAnswer: string
  hintEn: string | null
  hintId: string | null
  onNext: () => void
}

export default function WmiFeedbackPanel({ isCorrect, correctAnswer, hintEn, hintId, onNext }: Props) {
  return (
    <div className={`mt-5 rounded-xl p-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
      <strong className={isCorrect ? 'text-green-700' : 'text-red-700'}>
        {isCorrect ? 'Hebat!' : 'Belum tepat'}
      </strong>
      {!isCorrect && (
        <p className="mt-2 text-sm text-gray-700">
          Jawaban benar: <strong>{correctAnswer}</strong>
        </p>
      )}
      {hintEn && <p className="mt-2 text-sm text-gray-700">{hintEn}</p>}
      {hintId && <p className="mt-1 text-sm italic text-gray-600">{hintId}</p>}
      <button
        type="button"
        onClick={onNext}
        className="mt-3 rounded-full bg-qupu-brand-blue px-4 py-2 text-sm font-bold text-white"
      >
        Next
      </button>
    </div>
  )
}
