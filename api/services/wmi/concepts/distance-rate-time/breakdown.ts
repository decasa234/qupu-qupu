import type { Breakdown, BreakdownHighlight } from '../types.js'
import { answerValue, type Params } from './index.js'

// Authored decomposition of a distance-rate-time problem: a car moves at a
// constant speed. Given two of {speed, time, distance}, find the third using
// distance = speed × time (or time = distance ÷ speed).
// Each highlight phrase MUST be an exact substring of the DISPLAY body (after
// stripSectionLabels removes "Find:" / "Cari:" and [[speed|...]] resolves to its
// label), so highlight "speed of 60 km/h", never "[[speed|speed]] of 60 km/h".
export function buildDistanceRateTimeBreakdown(params: Params): Breakdown {
  const distance = params.rate * params.t
  const answer = answerValue(params)

  let highlights: BreakdownHighlight[]
  let quantities: Breakdown['quantities']

  if (params.mode === 'distance') {
    highlights = [
      // facts — the two given quantities: speed (the rate) and time.
      {
        category: 'fact',
        phrase_en: `speed of ${params.rate} km/h`,
        phrase_id: `kecepatan tetap ${params.rate} km/jam`,
        note_en: `Speed: the car goes ${params.rate} km every hour.`,
        note_id: `Kecepatan: mobil menempuh ${params.rate} km tiap jam.`,
      },
      {
        category: 'fact',
        phrase_en: `in ${params.t} hours`,
        phrase_id: `dalam ${params.t} jam`,
        note_en: `Time: the car drives for ${params.t} hours.`,
        note_id: `Waktu: mobil berjalan selama ${params.t} jam.`,
      },
      // question — the quantity to find: the distance.
      {
        category: 'question',
        phrase_en: 'How far does it travel',
        phrase_id: 'Berapa jarak yang ditempuh',
        note_en: `Find the distance: speed × time = ${params.rate} × ${params.t}.`,
        note_id: `Cari jarak: kecepatan × waktu = ${params.rate} × ${params.t}.`,
      },
    ]
    quantities = [
      { label_en: 'Speed', label_id: 'Kecepatan', value: `${params.rate} km/h` },
      { label_en: 'Time', label_id: 'Waktu', value: `${params.t} h` },
      { label_en: 'Distance', label_id: 'Jarak', value: `${distance} km` },
    ]
  } else {
    highlights = [
      // facts — the two given quantities: speed (the rate) and distance.
      {
        category: 'fact',
        phrase_en: `speed of ${params.rate} km/h`,
        phrase_id: `kecepatan tetap ${params.rate} km/jam`,
        note_en: `Speed: the car goes ${params.rate} km every hour.`,
        note_id: `Kecepatan: mobil menempuh ${params.rate} km tiap jam.`,
      },
      {
        category: 'fact',
        phrase_en: `covers ${distance} km`,
        phrase_id: `menempuh jarak ${distance} km`,
        note_en: `Distance: the whole trip is ${distance} km.`,
        note_id: `Jarak: seluruh perjalanan ${distance} km.`,
      },
      // question — the quantity to find: the time.
      {
        category: 'question',
        phrase_en: 'How many hours does the trip take?',
        phrase_id: 'Berapa jam waktu yang dibutuhkan untuk perjalanan itu?',
        note_en: `Find the time: distance ÷ speed = ${distance} ÷ ${params.rate}.`,
        note_id: `Cari waktu: jarak ÷ kecepatan = ${distance} ÷ ${params.rate}.`,
      },
    ]
    quantities = [
      { label_en: 'Speed', label_id: 'Kecepatan', value: `${params.rate} km/h` },
      { label_en: 'Distance', label_id: 'Jarak', value: `${distance} km` },
      { label_en: 'Time', label_id: 'Waktu', value: `${params.t} h` },
    ]
  }

  return {
    needsVisual: false,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'distance-rate-time',
      name_en: 'distance = rate × time',
      name_id: 'jarak = kecepatan × waktu',
    },
    trap: null,
    answer: {
      form: 'number',
      unit: params.mode === 'distance' ? 'km' : 'jam',
      value: String(answer),
    },
    vocab: [],
  }
}
