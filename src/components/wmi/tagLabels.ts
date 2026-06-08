export interface TagDisplay { name_id: string; color_hex: string }
export const TAG_LABELS: Record<string, TagDisplay> = {
  'arithmetic':    { name_id: 'Aritmetika',     color_hex: '#30598A' },
  'place-value':   { name_id: 'Nilai Tempat',   color_hex: '#3F6BA0' },
  'fractions':     { name_id: 'Pecahan',        color_hex: '#E0A000' },
  'decimals':      { name_id: 'Desimal',        color_hex: '#C9920A' },
  'number-theory': { name_id: 'Teori Bilangan', color_hex: '#6B4FAE' },
  'patterns':      { name_id: 'Pola',           color_hex: '#7C5CBF' },
  'geometry':      { name_id: 'Geometri',       color_hex: '#2E8B6B' },
  'measurement':   { name_id: 'Pengukuran',     color_hex: '#14746F' },
  'data':          { name_id: 'Data & Diagram', color_hex: '#C2575B' },
  'logic':         { name_id: 'Logika',         color_hex: '#B5497E' },
  'counting':      { name_id: 'Membilang',      color_hex: '#4C84C4' },
  'money':         { name_id: 'Uang',           color_hex: '#E8843C' },
  'spatial':       { name_id: 'Ruang & Jalur',  color_hex: '#3E8E7E' },
  'word-problem':  { name_id: 'Soal Cerita',    color_hex: '#5B8DEF' },
}
export function tagLabel(key: string): TagDisplay {
  return TAG_LABELS[key] ?? { name_id: key, color_hex: '#8a93a3' }
}
