import { useState, useRef, useEffect } from 'react'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

// ── DATA WILAYAH ─────────────────────────────────────────────────────────────

const KEL_KOTA_GORONTALO = [
  'botu','bugis','leato selatan','leato utara','talumolo',
  'huangobotu','libuo','tomulabutao','tomulabutao selatan','tuladenggi',
  'donggala','pohe','siendeng','tanjung kramat','tenda',
  'buladu','buliide','dembe i','lekobalo','molosifat','pilolodaa','tenilo',
  'biawao','biawu','limba b','limba u i','limba u ii',
  'dulalowo','dulalowo timur','liluwo','paguyaman','wumialo',
  'heledulaa selatan','heledulaa utara','ipilo','moodu','padebuolo','tamalate',
  'dembe ii','dembe jaya','dulomo selatan','dulomo utara','wangkaditi barat','wangkaditi timur',
  'bulotadaa','bulotadaa timur','molosipat u','tanggikiki','tapa',
]
const KEC_KOTA_GORONTALO = [
  'dumbo raya','dungingi','hulonthalangi','kota barat','kota selatan',
  'kota tengah','kota timur','kota utara','sipatana',
]

const KEL_BONE_BOLANGO = [
  'bilonlantunga','cendana putih','ilohuuwa','inogaluma','masiaga','molamahu','monano','moodulio','muara bone','sogitia','taludaa','tumbuh mekar','waluhu',
  'alo','bunga','inomata','laut biru','moopiya','mootawa','mootayu','mootinelo','pelita jaya','tombulilato',
  'batu hijau','bilungala','bilungala utara','kemiri','lembah hijau','ombulo hijau','pelita hijau','tihu','tolotio','tongo','tunas jaya','uabanga',
  'buata','luwohu','panggulo','panggulo barat','sukma','tanah putih','timbuolo','timbuolo tengah','timbuolo timur',
  'ayula selatan','ayula tilango','ayula timur','ayula utara','huntu barat','huntu selatan','huntu utara','lamahu','sejahtera','tinelo ayula',
  'bulotalangi','bulotalangi barat','bulotalangi timur','popodu','toluwaya',
  'ilomata','mongiilo','mongiilo utara','owata','pilolaheya','suka makmur',
  'bandungan','boidu','bunuo','kopi','lomaya','longalo','suka damai','tuloa','tupa',
  'bukit hijau','dunggilata','kaidundu','kaidundu barat','mamungaa','mamungaa timur','mopuya','patoa','pinomotiga',
  'dutohe','dutohe barat','poowo','poowo barat','talango','tanggilingo','toto selatan',
  'oluhuta','oluhuta utara','padengo','pauwo','tumbihe',
  'biluango','bintalahe','botubarani','botutonuo','modelomo','molutabu','olele',
  'bangio','dataran hijau','pinogu','pinogu permai','tilonggibila',
  'boludawa','bube','bube baru','bubeya','helumo','huluduotamo','tingkohubu','tingkohubu timur','ulanta',
  'bondaraya','bondawuna','bonedaa','bulontala','bulontala timur','libungo','molintogupo','pancuran',
  'alale','duano','lombongo','lompotoo','tapadaa','tolomato',
  'dumbaya bulan','pangi','poduwoma','tilangobula','tinemba','tulabolo','tulabolo barat','tulabolo timur',
  'dunggala','kramat','langge','meranti','talulobutu','talulobutu selatan','talumopatu',
  'berlian','bongohulawa','bongoime','bongopini','butu','iloheluma','lonuo','motilango','moutong','toto utara','tunggulo','tunggulo selatan',
]
const KEC_BONE_BOLANGO = [
  'bone','bone raya','bonepantai','botupingge','bulango selatan','bulango timur',
  'bulango ulu','bulango utara','bulawa','kabila','kabila bone','pinogu',
  'suwawa','suwawa selatan','suwawa tengah','suwawa timur','tapa','tilongkabila',
]

const KEC_GORONTALO_3ALT = ['telaga jaya','tilango']
const KEC_GORONTALO_REFORMASI = ['telaga biru','limboto','limboto barat']
const KEC_GORONTALO_BATUDAA = ['batudaa','batudaa pantai','tabongo']
const KEC_GORONTALO_ISIMU = ['bongomeme','dungaliyo','pulubala','tibawa','asparaga','bilato','boliyohuto','mootilango','tolangohula']

const KAB_TRANS_SULAWESI = [
  'gorontalo utara','gorut','boalemo','pohuwato',
  // kec gorut
  'anggrek','atinggola','biau','kwandang','monano','molabuoh','nuangan','sumalata','sumalata timur','tomilito','tolinggula','gentuma raya','ponelo kepulauan',
  // kec boalemo
  'botumoito','dulupi','mananggu','paguyaman pantai','tilamuta','wonosari',
  // kec pohuwato
  'buntulia','dengilo','duhiadaa','lemito','marisa','paguat','patilanggio','popayato','popayato barat','popayato timur','randangan','taluditi','wanggarasi',
]

// Kata kunci tujuan = Kampung Jawa
const KATA_KAMPUNG_JAWA = ['kampung jawa','ketupat','yosonegoro','isimu','tugu tani','lokasi ketupat','lebaran ketupat']
// Kata kunci arus balik
const KATA_BALIK = ['balik','pulang','kembali','balik ke','pulang ke','kembali ke']

// ── RUTE ─────────────────────────────────────────────────────────────────────

const RUTE_MENUJU = {
  tiga_alternatif: [
    {
      id: 'alt_gorr',
      label: 'Alternatif 1 — Lewat Jl. GORR',
      deskripsi: 'Dari Kota Gorontalo → Jl. A.A. Wahab (Telaga) → belok kanan Jl. Pilohayanga (depan Muraa Supermarket) → belok kiri Jl. GORR → lurus ke Lokasi Ketupat (Kampung Jawa)',
      asal: { id: 'kota_gto', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
      tujuan: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
    },
    {
      id: 'alt_reformasi',
      label: 'Alternatif 2 — Lewat Jl. Reformasi',
      deskripsi: 'Dari Kota Gorontalo → Jl. A.A. Wahab (Telaga–Limboto) → belok kiri Jl. Reformasi (arah Danau Limboto) → lurus Simpang 4 Patung Berdoa (Hunggaluwa) → Jl. Trans Sulawesi → Tugu Ketupat (Kampung Jawa)',
      asal: { id: 'kota_gto', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
      tujuan: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
    },
    {
      id: 'alt_batudaa',
      label: 'Alternatif 3 — Lewat Batudaa–Bongomeme',
      deskripsi: 'Dari Kota Gorontalo → Dembe–Lekobalo → Jl. Batudaa → belok kanan Simpang 3 Pasar Bongomeme → lurus sampai Tugu Tani Isimu',
      asal: { id: 'kota_gto', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
      tujuan: { id: 'patung_tani', nama: 'Patung Tani Isimu', lat: 0.6422, lng: 122.8456 },
    },
  ],
  reformasi_saja: [
    {
      id: 'alt_reformasi',
      label: 'Lewat Jl. Reformasi',
      deskripsi: 'Dari Limboto/Telaga Biru → Jl. A.A. Wahab → belok kiri Jl. Reformasi (arah Danau Limboto) → lurus Simpang 4 Patung Berdoa (Hunggaluwa) → Jl. Trans Sulawesi → Tugu Ketupat (Kampung Jawa)',
      asal: { id: 'limboto', nama: 'Limboto', lat: 0.6270, lng: 122.9799 },
      tujuan: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
    },
  ],
  batudaa_tabongo: [
    {
      id: 'alt_ilomangga',
      label: 'Alternatif 1 — Lewat Desa Ilomangga',
      deskripsi: 'Dari Batudaa/Tabongo → lewat pertigaan Desa Ilomangga → terus sampai Tunggulo → menuju Kampung Jawa',
      asal: { id: 'batudaa', nama: 'Batudaa', lat: 0.5960, lng: 122.9100 },
      tujuan: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
    },
    {
      id: 'alt_limehe',
      label: 'Alternatif 2 — Lewat Desa Limehe Barat',
      deskripsi: 'Dari Batudaa/Tabongo → lewat pertigaan Desa Limehe Barat → terus sampai Pasar Hutabohu → menuju Kampung Jawa',
      asal: { id: 'batudaa', nama: 'Batudaa', lat: 0.5960, lng: 122.9100 },
      tujuan: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
    },
  ],
  isimu_saja: [
    {
      id: 'alt_isimu',
      label: 'Langsung ke Tugu Tani Isimu',
      deskripsi: 'Dari lokasi Anda → lurus menuju Tugu Tani Isimu → Kampung Jawa (pusat perayaan Lebaran Ketupat)',
      asal: { id: 'isimu', nama: 'Tugu Tani Isimu', lat: 0.6422, lng: 122.8456 },
      tujuan: { id: 'patung_tani', nama: 'Patung Tani Isimu', lat: 0.6422, lng: 122.8456 },
    },
  ],
  trans_sulawesi: [
    {
      id: 'alt_trans',
      label: 'Lewat Jl. Trans Sulawesi → Tugu Tani Isimu',
      deskripsi: 'Dari arah timur/barat → lurus Jl. Trans Sulawesi → langsung menuju Tugu Tani Isimu sebagai pintu masuk Kampung Jawa',
      asal: { id: 'trans', nama: 'Jl. Trans Sulawesi', lat: 0.6422, lng: 122.8456 },
      tujuan: { id: 'patung_tani', nama: 'Patung Tani Isimu', lat: 0.6422, lng: 122.8456 },
    },
  ],
}

const RUTE_BALIK = [
  {
    id: 'balik_1',
    label: 'Alternatif 1 — via Jl. GORR',
    deskripsi: 'Dari Tugu Tani Isimu → Jl. Trans Sulawesi → Tugu Ketupat Yosonegoro → belok kiri Jl. Amal Modjo (Daenaa) → belok kanan Jl. GORR → Kota Gorontalo',
    asal: { id: 'patung_tani', nama: 'Patung Tani Isimu', lat: 0.6422, lng: 122.8456 },
    tujuan: { id: 'kota_gto', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
  },
  {
    id: 'balik_2',
    label: 'Alternatif 2 — via Jl. Pulubuhu',
    deskripsi: 'Dari Tugu Ketupat → lurus Jl. Pulubuhu → lurus ke Limboto → Kota Gorontalo',
    asal: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
    tujuan: { id: 'kota_gto', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
  },
  {
    id: 'balik_3',
    label: 'Alternatif 3 — via Jl. Reformasi (16.00 WITA)',
    deskripsi: 'Dari Lokasi Ketupat → Jl. Trans Sulawesi (Yosonegoro–Hutabohu–Tenilo–Bolihuangga) → Jl. Reformasi → belok kanan Jl. A.A. Wahab → Kota Gorontalo. Berlaku mulai pukul 16.00 WITA.',
    asal: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
    tujuan: { id: 'kota_gto', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
  },
  {
    id: 'balik_4',
    label: 'Alternatif 4 — via Batudaa',
    deskripsi: 'Dari Tugu Tani Isimu → arah Bongomeme → belok kiri Simpang 3 Pasar Bongomeme → Jl. Batudaa → Kota Gorontalo',
    asal: { id: 'patung_tani', nama: 'Patung Tani Isimu', lat: 0.6422, lng: 122.8456 },
    tujuan: { id: 'kota_gto', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
  },
]

const RUTE_BALIK_TRANS = [
  {
    id: 'balik_trans',
    label: 'Lewat Jl. Trans Sulawesi',
    deskripsi: 'Dari Tugu Tani Isimu → Jl. Trans Sulawesi langsung menuju tujuan arah timur/barat',
    asal: { id: 'patung_tani', nama: 'Patung Tani Isimu', lat: 0.6422, lng: 122.8456 },
    tujuan: { id: 'trans', nama: 'Jl. Trans Sulawesi', lat: 0.6422, lng: 122.8456 },
  },
]

const RUTE_PRIORITAS = {
  id: 'prioritas',
  label: '🚑 Jalur Prioritas — Ambulance & Bandara',
  deskripsi: 'Jalur prioritas ambulance & masyarakat menuju Bandara Djalaludin → diarahkan lewat Jl. GORR (Gorontalo Outer Ring Road)',
  asal: { id: 'kota_gto', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
  tujuan: { id: 'bandara', nama: 'Bandara Djalaludin', lat: 0.6373, lng: 122.8481 },
}

// ── PARSER ────────────────────────────────────────────────────────────────────

function isWilayahTrans(q) {
  return KAB_TRANS_SULAWESI.some(w => q.includes(w))
}

function detectAsal(q) {
  if (isWilayahTrans(q)) return 'trans'
  if (KEC_GORONTALO_ISIMU.some(w => q.includes(w))) return 'isimu'
  if (KEC_GORONTALO_BATUDAA.some(w => q.includes(w))) return 'batudaa'
  if (KEC_GORONTALO_REFORMASI.some(w => q.includes(w))) return 'reformasi'
  if (KEC_GORONTALO_3ALT.some(w => q.includes(w))) return '3alt'
  if (q.includes('bone bolango') || KEC_BONE_BOLANGO.some(w => q.includes(w)) || KEL_BONE_BOLANGO.some(w => q.includes(w))) return '3alt'
  if (q.includes('kota gorontalo') || KEC_KOTA_GORONTALO.some(w => q.includes(w)) || KEL_KOTA_GORONTALO.some(w => q.includes(w))) return '3alt'
  return null
}

function parseInput(raw) {
  const q = raw.toLowerCase().trim()

  // Cek prioritas
  if (q.includes('ambulance') || q.includes('bandara') || q.includes('prioritas')) {
    return { mode: 'prioritas' }
  }

  // Pisah input dengan kata pemisah
  const pemisah = [' ke ', ' menuju ', ' ke kampung', ' balik ke ', ' pulang ke ', ' kembali ke ']
  let bagian = [q]
  for (const p of pemisah) {
    if (q.includes(p)) {
      const idx = q.indexOf(p)
      bagian = [q.slice(0, idx).trim(), q.slice(idx + p.length).trim()]
      break
    }
  }

  const asal = bagian[0] || ''
  const tujuan = bagian[1] || ''

  // Deteksi arus balik: tujuan bukan kampung jawa, atau ada kata balik
  const isBalik = KATA_BALIK.some(k => q.includes(k)) ||
    (tujuan && !KATA_KAMPUNG_JAWA.some(k => tujuan.includes(k)) && !KATA_KAMPUNG_JAWA.some(k => asal.includes(k)))

  const isMenuju = KATA_KAMPUNG_JAWA.some(k => q.includes(k)) && !isBalik

  // Arus balik
  if (isBalik && !isMenuju) {
    const tujuanTrans = isWilayahTrans(tujuan || q)
    return { mode: 'balik', tujuanLabel: tujuan || asal, tujuanTrans }
  }

  // Menuju kampung jawa — deteksi dari asal
  const asalType = detectAsal(asal || q)
  if (!asalType) {
    // Tidak dikenal — tanya konfirmasi
    return { mode: 'tanya', input: raw }
  }

  return { mode: 'menuju', asalType, asalLabel: asal || raw }
}

function getRuteMenuju(asalType) {
  switch (asalType) {
    case 'trans': return RUTE_MENUJU.trans_sulawesi
    case 'isimu': return RUTE_MENUJU.isimu_saja
    case 'batudaa': return RUTE_MENUJU.batudaa_tabongo
    case 'reformasi': return RUTE_MENUJU.reformasi_saja
    case '3alt': return RUTE_MENUJU.tiga_alternatif
    default: return null
  }
}

// ── STEP ──────────────────────────────────────────────────────────────────────

const STEP = { AWAL: 'awal', INPUT: 'input', ALTERNATIF: 'alternatif', RUTE: 'rute' }

export default function ChatPanel({ reports, onZoomLocation, onRouteFound }) {
  const [step, setStep] = useState(STEP.AWAL)
  const [inputVal, setInputVal] = useState('')
  const [rutePilihan, setRutePilihan] = useState([])
  const [loadingRute, setLoadingRute] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hari ini mau kemana? 🗺️' }
  ])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages])

  const addMsg = (role, text, mapUrl = null) =>
    setMessages(prev => [...prev, { role, text, mapUrl }])

  const reset = () => {
    setStep(STEP.AWAL)
    setInputVal('')
    setRutePilihan([])
    setMessages([{ role: 'assistant', text: 'Hari ini mau kemana? 🗺️' }])
  }

  const handlePilihArah = (mode) => {
    setStep(STEP.INPUT)
    if (mode === 'prioritas') {
      addMsg('user', '🚑 Jalur Prioritas')
      addMsg('assistant', `🚑 *${RUTE_PRIORITAS.label}*\n\n📋 ${RUTE_PRIORITAS.deskripsi}`)
      setStep(STEP.RUTE)
      sessionStorage.setItem('peta_rute', JSON.stringify({ asal: RUTE_PRIORITAS.asal, tujuan: RUTE_PRIORITAS.tujuan }))
      if (onRouteFound) onRouteFound({ asal: RUTE_PRIORITAS.asal, tujuan: RUTE_PRIORITAS.tujuan })
    } else {
      addMsg('assistant', 'Ketik perjalananmu.\nContoh: "Dari Dembe ke Kampung Jawa" atau "Balik ke Tomilito"')
    }
  }

  const handleSubmitInput = () => {
    const val = inputVal.trim()
    if (!val) return
    addMsg('user', val)
    setInputVal('')

    const parsed = parseInput(val)

    if (parsed.mode === 'prioritas') {
      addMsg('assistant', `🚑 *${RUTE_PRIORITAS.label}*\n\n📋 ${RUTE_PRIORITAS.deskripsi}`)
      setStep(STEP.RUTE)
      sessionStorage.setItem('peta_rute', JSON.stringify({ asal: RUTE_PRIORITAS.asal, tujuan: RUTE_PRIORITAS.tujuan }))
      if (onRouteFound) onRouteFound({ asal: RUTE_PRIORITAS.asal, tujuan: RUTE_PRIORITAS.tujuan })
      return
    }

    if (parsed.mode === 'tanya') {
      addMsg('assistant', `"${parsed.input}" ada di kabupaten/kota mana?\n\nContoh: Kota Gorontalo, Bone Bolango, Kab. Gorontalo, Gorontalo Utara, Boalemo, atau Pohuwato.`)
      return
    }

    if (parsed.mode === 'balik') {
      const rute = parsed.tujuanTrans ? RUTE_BALIK_TRANS : RUTE_BALIK
      addMsg('assistant', parsed.tujuanTrans
        ? `📍 Tujuan *${parsed.tujuanLabel}* lewat jalur Trans Sulawesi:`
        : `📍 Berikut alternatif arus balik menuju *${parsed.tujuanLabel}*:`)
      setRutePilihan(rute)
      setStep(STEP.ALTERNATIF)
      return
    }

    if (parsed.mode === 'menuju') {
      const rute = getRuteMenuju(parsed.asalType)
      if (!rute) {
        addMsg('assistant', `Maaf, belum ada panduan rute dari "${parsed.asalLabel}".\n\nCoba sebutkan nama kecamatan atau kabupaten/kota kamu.`)
        return
      }
      addMsg('assistant', rute.length === 1
        ? `📍 Rute dari *${parsed.asalLabel}* menuju Kampung Jawa:`
        : `📍 Ada ${rute.length} alternatif dari *${parsed.asalLabel}*. Pilih salah satu:`)
      setRutePilihan(rute)
      setStep(STEP.ALTERNATIF)
    }
  }

  const handlePilihRute = async (rute) => {
    setStep(STEP.RUTE)
    addMsg('user', rute.label)
    addMsg('assistant', '⏳ Memuat rute...')
    setLoadingRute(true)

    if (onZoomLocation) onZoomLocation(rute.tujuan)
    if (onRouteFound) onRouteFound({ asal: rute.asal, tujuan: rute.tujuan })
    sessionStorage.setItem('peta_rute', JSON.stringify({ asal: rute.asal, tujuan: rute.tujuan }))

    const mapUrl = API_KEY
      ? `https://www.google.com/maps/embed/v1/directions?key=${API_KEY}&origin=${rute.asal.lat},${rute.asal.lng}&destination=${rute.tujuan.lat},${rute.tujuan.lng}&mode=driving&language=id`
      : null

    try {
      const res = await fetch('/api/rute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asal: rute.asal, tujuan: rute.tujuan }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          text: `🛣️ *${rute.label}*\n\n📋 ${rute.deskripsi}\n\n⏱️ Estimasi: ${data.durasi} | 📏 Jarak: ${data.jarak}`,
          mapUrl,
        }
        return updated
      })
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          text: `🛣️ *${rute.label}*\n\n📋 ${rute.deskripsi}`,
          mapUrl,
        }
        return updated
      })
    } finally {
      setLoadingRute(false)
    }
  }

  return (
    <div className="mx-4 mb-4">
      <div className="rounded-2xl border border-asphalt-600 bg-asphalt-800 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-asphalt-600">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-signal-red" />
            <span className="w-2 h-2 rounded-full bg-signal-yellow" />
            <span className="w-2 h-2 rounded-full bg-signal-green" />
          </div>
          {step !== STEP.AWAL && (
            <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-300 font-mono border border-asphalt-600 rounded-full px-2.5 py-1 transition-colors">
              ↩️ Ulang
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="h-[40vh] overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-asphalt-600 text-gray-200 rounded-br-sm'
                  : 'bg-asphalt-700 border border-asphalt-600 text-gray-300 rounded-bl-sm'
              }`}>
                {msg.text}
                {msg.mapUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-asphalt-500">
                    <iframe
                      src={msg.mapUrl}
                      width="100%"
                      height="220"
                      style={{ border: 0, display: 'block' }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Rute Maps"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          {loadingRute && (
            <div className="flex justify-start">
              <div className="bg-asphalt-700 border border-asphalt-600 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  {[0,150,300].map(d => (
                    <div key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Step: Awal — hanya jalur prioritas + input */}
        {step === STEP.AWAL && (
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-600 font-mono mb-2">🧭 Masukan kecamatan:</p>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmitInput()}
                placeholder="Contoh: Dari Dembe ke Kampung Jawa"
                className="flex-1 text-xs bg-asphalt-700 border border-asphalt-600 text-gray-200 rounded-xl px-3 py-2.5 font-mono placeholder-gray-600 focus:outline-none focus:border-asphalt-400"
                autoFocus
              />
              <button onClick={handleSubmitInput}
                className="text-xs bg-asphalt-600 hover:bg-asphalt-500 border border-asphalt-500 text-gray-200 rounded-xl px-3 py-2.5 font-mono transition-all">
                →
              </button>
            </div>
            <button onClick={() => handlePilihArah('prioritas')}
              className="w-full text-left text-sm bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 hover:border-asphalt-500 text-gray-200 rounded-xl px-4 py-3 transition-all font-display font-600">
              🚑 Jalur Prioritas (Ambulance & Bandara)
            </button>
          </div>
        )}

        {/* Step: Input lanjutan */}
        {step === STEP.INPUT && (
          <div className="px-4 pb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmitInput()}
                placeholder="Contoh: Dari Dembe ke Kampung Jawa"
                className="flex-1 text-xs bg-asphalt-700 border border-asphalt-600 text-gray-200 rounded-xl px-3 py-2.5 font-mono placeholder-gray-600 focus:outline-none focus:border-asphalt-400"
                autoFocus
              />
              <button onClick={handleSubmitInput}
                className="text-xs bg-asphalt-600 hover:bg-asphalt-500 border border-asphalt-500 text-gray-200 rounded-xl px-3 py-2.5 font-mono transition-all">
                →
              </button>
            </div>
          </div>
        )}

        {/* Step: Pilih Alternatif */}
        {step === STEP.ALTERNATIF && (
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-600 font-mono mb-2">🛣️ Pilih rute:</p>
            <div className="flex flex-wrap gap-2">
              {rutePilihan.map(rute => (
                <button key={rute.id} onClick={() => handlePilihRute(rute)}
                  className="text-xs bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 hover:border-asphalt-500 text-gray-300 hover:text-gray-100 rounded-full px-3 py-1.5 transition-all font-mono whitespace-nowrap">
                  {rute.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Setelah rute */}
        {step === STEP.RUTE && !loadingRute && (
          <div className="px-4 pb-4 pt-2">
            <div className="flex gap-2">
              <button onClick={reset}
                className="flex-1 text-xs bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 text-gray-300 rounded-xl py-2.5 transition-all font-mono">
                🔄 Pilih Rute Lain
              </button>
              <button onClick={() => { window.location.href = '/peta' }}
                className="flex-1 text-xs bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 text-gray-300 rounded-xl py-2.5 transition-all font-mono">
                🗺️ Peta Penuh
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}