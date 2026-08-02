import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { askClause, routeText, solve, trapRoute, type Params } from './index.js'

// Authored decomposition of a weighted-map route problem. One idea carries all
// four ask forms: the picture is EVIDENCE, not an answer — the length of a route
// is the numbers on its roads added together, and with only a handful of routes
// the honest move is to write every one of them down and compare the totals.
//
// Every phrase below is lifted from the very same sentences `render` builds the
// body from, so each `phrase_*` is an exact substring of the DISPLAY body (the
// body after `stripSectionLabels` drops the "Find:" / "Cari:" markers). Nothing
// here spans that marker, and no two phrases overlap.
export function buildMapRouteDistanceBreakdown(params: Params): Breakdown {
  const s = solve(params)
  const trap = trapRoute(params, s)
  const nameOf = (id: string): string => params.towns.find((t) => t.id === id)?.name ?? id
  const fromName = nameOf(params.from)
  const toName = nameOf(params.to)
  const viaName = params.via === '' ? '' : nameOf(params.via)

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: 'This map',
      phrase_id: 'Peta ini',
      note_en: `Find it in the picture first: each circle is a town and each line between two circles is a road you may walk.`,
      note_id: `Temukan dulu di gambar: setiap lingkaran adalah satu kota dan setiap garis antara dua lingkaran adalah jalan yang boleh kamu lewati.`,
    },
    {
      category: 'fact',
      phrase_en: 'The number on each road is how long that road is, in km',
      phrase_id: 'Angka pada setiap jalan adalah panjang jalan itu dalam km',
      note_en: `So a route is worth the numbers on its roads added together — not how straight or how short the line looks on the page.`,
      note_id: `Jadi panjang sebuah rute adalah jumlah angka pada jalan-jalannya — bukan seberapa lurus atau seberapa pendek garisnya terlihat di gambar.`,
    },
    {
      category: 'condition',
      phrase_en: 'only walk along the roads drawn',
      phrase_id: 'hanya boleh berjalan lewat jalan yang tergambar',
      note_en: `Two towns with no line between them are not joined, however close together they are drawn.`,
      note_id: `Dua kota yang tidak dihubungkan garis berarti tidak ada jalannya, sedekat apa pun letaknya di gambar.`,
    },
    {
      category: 'condition',
      phrase_en: 'may not pass through the same town twice',
      phrase_id: 'tidak boleh melewati kota yang sama dua kali',
      note_en: `That is what keeps the list of routes short enough to write out in full — and for the longest-route question it is the rule that stops the walk going on forever.`,
      note_id: `Aturan inilah yang membuat daftar rutenya pendek sehingga bisa ditulis semua — dan untuk pertanyaan rute terpanjang, aturan ini yang membuat jalannya tidak bisa berputar terus.`,
    },
  ]

  if (params.ask === 'who-arrives-last') {
    highlights.push({
      category: 'fact',
      phrase_en: 'at the same speed',
      phrase_id: 'berjalan sama cepat',
      note_en: `Same speed means the only thing that can make somebody late is distance, so the last to arrive is whoever walks the most km.`,
      note_id: `Karena kecepatannya sama, yang membuat seseorang telat hanyalah jaraknya, jadi yang sampai paling akhir adalah yang menempuh km paling banyak.`,
    })
  }

  highlights.push({
    category: 'question',
    phrase_en: askClause(params, 'en'),
    phrase_id: askClause(params, 'id'),
    note_en:
      params.ask === 'shortest'
        ? `Add up every route from ${fromName} to ${toName} and take the smallest total. Fewest roads does not mean fewest km.`
        : params.ask === 'shortest-via-C'
          ? `${viaName} is compulsory: first throw away every route that misses it, and only then look for the smallest total among the ones that are left.`
          : params.ask === 'longest-no-repeat'
            ? `Add up every route from ${fromName} to ${toName} and take the biggest total. More towns on the way does not mean more km.`
            : `Work out how far each of the three walks, then name the one with the biggest total.`,
    note_id:
      params.ask === 'shortest'
        ? `Jumlahkan semua rute dari ${fromName} ke ${toName}, lalu ambil total terkecil. Jalan paling sedikit belum tentu km paling sedikit.`
        : params.ask === 'shortest-via-C'
          ? `${viaName} wajib dilewati: buang dulu semua rute yang tidak melewatinya, baru cari total terkecil di antara yang tersisa.`
          : params.ask === 'longest-no-repeat'
            ? `Jumlahkan semua rute dari ${fromName} ke ${toName}, lalu ambil total terbesar. Lewat lebih banyak kota belum tentu lebih banyak km.`
            : `Hitung dulu jarak yang ditempuh masing-masing, lalu sebut yang totalnya paling besar.`,
  })

  const roadList = params.roads
    .map((r) => `${nameOf(r.a)}–${nameOf(r.b)} ${r.km} km`)
    .join(', ')
  const totalList = s.routes
    .map((r) => `${r.walker === '' ? routeText(params, r) : r.walker} ${r.total} km`)
    .join(', ')

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Towns', label_id: 'Kota', value: params.towns.map((t) => t.name).join(', ') },
    { label_en: 'Roads and their lengths', label_id: 'Jalan dan panjangnya', value: roadList },
    { label_en: 'Walk from → to', label_id: 'Berjalan dari → ke', value: `${fromName} → ${toName}` },
    {
      label_en: 'Town that must be on the route',
      label_id: 'Kota yang wajib dilewati',
      value: viaName === '' ? '—' : viaName,
    },
    {
      label_en: 'Routes to compare',
      label_id: 'Rute yang dibandingkan',
      value: String(s.eligible.length),
    },
    { label_en: 'Total of each route', label_id: 'Total tiap rute', value: totalList },
    {
      label_en: 'Best route',
      label_id: 'Rute terbaik',
      value: `${routeText(params, s.best)} = ${s.best.total} km`,
    },
    { label_en: 'Answer', label_id: 'Jawaban', value: s.answer },
  ]

  const trapValue =
    trap === null ? null : trap.walker === '' ? String(trap.total) : trap.walker

  return {
    // The towns, the roads and every printed km live only in the picture; the
    // stem states the rule and the figure carries the numbers — exactly how the
    // WMI papers this concept is mined from present it.
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'map-route-distance',
      name_en: 'List every route, add each one up, then compare the totals',
      name_id: 'Tulis semua rute, jumlahkan satu per satu, lalu bandingkan totalnya',
    },
    // The trap is always the route you get by looking instead of adding.
    trap:
      trap === null || trapValue === null
        ? null
        : {
            wrong: trapValue,
            why_en:
              params.ask === 'shortest-via-C'
                ? `${routeText(params, trap)} really is the shortest way from ${fromName} to ${toName}, at ${trap.total} km — but it never touches ${viaName}, so it is not allowed. The shortest route that does go through ${viaName} is ${routeText(params, s.best)} at ${s.best.total} km.`
                : params.ask === 'who-arrives-last'
                  ? `${trap.walker} walks through the most towns, so it looks like the longest trip, but ${trap.walker}'s roads add up to only ${trap.total} km. ${s.best.walker} covers ${s.best.total} km, which is more.`
                  : params.ask === 'shortest'
                    ? `${routeText(params, trap)} uses the fewest roads, so it looks like the quick way, but those roads add up to ${trap.total} km. ${routeText(params, s.best)} uses more roads and still comes to only ${s.best.total} km.`
                    : `${routeText(params, trap)} passes the most towns, so it looks like the long way round, but it adds up to just ${trap.total} km. ${routeText(params, s.best)} adds up to ${s.best.total} km, which is more.`,
            why_id:
              params.ask === 'shortest-via-C'
                ? `${routeText(params, trap)} memang rute terpendek dari ${fromName} ke ${toName}, yaitu ${trap.total} km — tapi rute itu tidak lewat ${viaName}, jadi tidak boleh dipakai. Rute terpendek yang lewat ${viaName} adalah ${routeText(params, s.best)} dengan ${s.best.total} km.`
                : params.ask === 'who-arrives-last'
                  ? `${trap.walker} melewati paling banyak kota sehingga terlihat paling jauh, padahal jalan-jalan ${trap.walker} hanya berjumlah ${trap.total} km. ${s.best.walker} menempuh ${s.best.total} km, dan itu lebih banyak.`
                  : params.ask === 'shortest'
                    ? `${routeText(params, trap)} memakai jalan paling sedikit sehingga terlihat paling cepat, padahal jalan-jalannya berjumlah ${trap.total} km. ${routeText(params, s.best)} memakai lebih banyak jalan tapi totalnya hanya ${s.best.total} km.`
                    : `${routeText(params, trap)} melewati paling banyak kota sehingga terlihat paling jauh, padahal totalnya hanya ${trap.total} km. ${routeText(params, s.best)} berjumlah ${s.best.total} km, dan itu lebih banyak.`,
          },
    answer:
      params.ask === 'who-arrives-last'
        ? { form: 'choice', unit: null, value: s.answer }
        : { form: 'number', unit: 'km', value: s.answer },
    vocab: [],
  }
}
