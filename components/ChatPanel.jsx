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
  'oluhuta','oluhuta utara','pauwo','tumbihe',
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

// Gorontalo Utara
const GORUT = [
  'gorontalo utara','gorut',
  'anggrek','datahu','dudepo','heluma','hiyalooile','ibarat','ilangata','ilodulunga','iloheluma','langge','mootilango','popalo','putiana','tolango','tolongio','tutuwoto',
  'atinggola','bintana','buata','ilomata','imana','kotajin','kotajin utara','monggupo','oluhuta','pinontoyonga','posono','sigaso','wapalo',
  'biau','bohulo','bualo','didingga','luhuto','omuto','potanga','sembihinga','topi','windu',
  'gentuma raya','bohusami','dumolodo','durian','gentuma','ipilo','ketapang','langke','molonggota','motomingo','nanati jaya','pasalae',
  'kwandang','alata karya','botungobungo','botuwombato','bualemo','bulalo','cisadane','katialada','leboto','masuru','molingkapoto','molingkapoto selatan','moluo','mootinelo','ombulodata','pontolo','pontolo atas','posso','titidu',
  'monano','dunu','garapia','mokonowu','monas','pilohulata','sogu','tolitehuyu','tudi','zuriyati',
  'ponelo kepulauan','malambe','otiola','ponelo','tihengo',
  'sumalata','buloila','bulontiyo barat','bulontiyo timur','hutakalo','kasia','kikia','lelato','mebongo','pulohenti','puncak mandiri','tumba',
  'sumalata timur','bubalango','buladu','buluwatu','deme dua','deme satu','dulukapa','hulawa','koluwoka','motiheluma','wubudu',
  'tolinggula','cempaka putih','ilomangga','ilotunggulo','limbato','molangga','papualangi','tolinggula pantai','tolinggula tengah','tolinggula ulu','tolite jaya',
  'tomilito','bubode','bulango raya','dambalo','huidu melito','jembatan merah','leyao','milango','molantadu','mutiara laut','tanjung karang',
]

// Pohuwato
const POHUWATO = [
  'pohuwato',
  'buntulia','buntulia tengah','buntulia utara','hulawa','karya indah','sipatana','taluduyunu','taluduyunu utara',
  'dengilo','hutamoputi','karangetang','karya baru','popaya',
  'duhiadaa','bulili','buntulia barat','buntulia jaya','buntulia selatan','mekar jaya',
  'lemito','babalonge','kenari','lemito utara','lomuli','wonggarasi barat','wonggarasi tengah',
  'marisa','botubilotahu','bulangita','marisa selatan','marisa utara','palopo','pohuwato timur','teratai',
  'paguat','buhu jaya','bumbulan','bunuyo','kemiri','maleo','molamahu','sipayo','soginti','pentadu','siduan',
  'patilanggio','balayo','dulomo','dudepo','manawa',
  'popayato','bumi bahari','bukit tingki','torosiaje','torosiaje jaya','trikora','tunas harapan',
  'popayato barat','butungale','dudewulo','molosifat','molosifat utara','persatuan','tunas jaya',
  'popayato timur','bunto','kelapa lima','londoun','milangodaa','tahele',
  'randangan','ayula','banuroja','huyula','imbodu','manunggal karya','motolohu','motolohu selatan','omayuwa','patuhu','pelambane','sari murni','sido rukun','sidowonge',
  'taluditi','kalimas','makarti jaya','malango','marisa iv','pancakarsa i','pancakarsa ii','tirto asri',
  'wanggarasi','bukit harapan','lembah permai','limbula','tuweya','wanggarasi timur','yipilo',
]

// Boalemo
const BOALEMO = [
  'boalemo',
  'botumoito','bolihutuo','dulangeya','hutamonu','patoameme','rumbia','tutulo',
  'dulupi','kotaraja','pangi','polohungo','tangga barito','tangga jaya',
  'mananggu','bendungan','buti','kaaruyan','kramat','salilama','tabulo','tabulo selatan',
  'paguyaman','balate jaya','batu kramat','bongo iv','bongo nol','bongo tua','bualo','diloato','girisa','huwongo','karya murni','kuala lumpur','molombulahe','mustika','mutiara','rejonegoro','saripi','sosial','tangkobu','wonggahu',
  'paguyaman pantai','apitalawu','bangga','bubaa','bukit karya','limbatihu','lito','olibu','towayu',
  'tilamuta','ayuhulalo','hungayonaa','lahumbo','lamu','limbato','modelomo','mohungo','pentadu barat','pentadu timur','piloliyanga',
  'wonosari','bongo ii','bongo iii','dimito','dulohupa','harapan','jatimulya','mekarjaya','pangea','raharja','sari tani','suka mulya','sukamaju','tanjung harapan','tri rukun',
]

const KAB_TRANS_SULAWESI = [...GORUT, ...POHUWATO, ...BOALEMO]

// ── KOORDINAT ASAL PER WILAYAH ────────────────────────────────────────────────

const KOORDINAT_ASAL = {
  '3alt':      { lat: 0.5480, lng: 123.0580, nama: 'Kota Gorontalo' },
  'reformasi': { lat: 0.6270, lng: 122.9799, nama: 'Limboto' },
  'batudaa':   { lat: 0.5960, lng: 122.9100, nama: 'Batudaa' },
  'isimu':     { lat: 0.6041, lng: 122.8861, nama: 'Bongomeme' },
  'trans':     { lat: 0.7200, lng: 122.4500, nama: 'Gorontalo Utara / Boalemo / Pohuwato' },
}

// ── RUTE PANDUAN (untuk ditampilkan sebagai info) ────────────────────────────

const PANDUAN_MENUJU = {
  tiga_alternatif: [
    'Alternatif 1 — Lewat Jl. GORR: Dari Kota Gorontalo → Jl. A.A. Wahab (Telaga) → belok kanan Jl. Pilohayanga → belok kiri Jl. GORR → Lokasi Ketupat (Kampung Jawa)',
    'Alternatif 2 — Lewat Jl. Reformasi: Dari Kota Gorontalo → Jl. A.A. Wahab → belok kiri Jl. Reformasi → Simpang 4 Patung Berdoa (Hunggaluwa) → Jl. Trans Sulawesi → Tugu Ketupat',
    'Alternatif 3 — Lewat Batudaa–Bongomeme: Dari Kota Gorontalo → Dembe–Lekobalo → Jl. Batudaa → Simpang 3 Pasar Bongomeme → Tugu Tani Isimu',
  ],
  reformasi_saja: [
    'Lewat Jl. Reformasi: Dari Limboto/Telaga Biru → Jl. Reformasi → Simpang 4 Patung Berdoa → Jl. Trans Sulawesi → Tugu Ketupat (Kampung Jawa)',
  ],
  batudaa_tabongo: [
    'Alternatif 1 — Lewat Desa Ilomangga: Dari Batudaa/Tabongo → pertigaan Desa Ilomangga → Tunggulo → Kampung Jawa',
    'Alternatif 2 — Lewat Desa Limehe Barat: Dari Batudaa/Tabongo → pertigaan Desa Limehe Barat → Pasar Hutabohu → Kampung Jawa',
  ],
  isimu_saja: [
    'Langsung ke Tugu Tani Isimu: Dari lokasi Anda → lurus menuju Tugu Tani Isimu → Kampung Jawa',
  ],
  trans_sulawesi: [
    'Lewat Jl. Trans Sulawesi: Dari arah timur/barat → lurus Jl. Trans Sulawesi → Tugu Tani Isimu sebagai pintu masuk Kampung Jawa',
  ],
}

const PANDUAN_BALIK = [
  'Alternatif 1 — via Jl. GORR: Tugu Tani Isimu → Tugu Ketupat Yosonegoro → Jl. Amal Modjo (Daenaa) → Jl. GORR → Kota Gorontalo',
  'Alternatif 2 — via Jl. Pulubuhu: Tugu Ketupat → Jl. Pulubuhu → Limboto → Kota Gorontalo',
  'Alternatif 3 — via Jl. Reformasi (16.00 WITA): Lokasi Ketupat → Jl. Trans Sulawesi → Jl. Reformasi → Jl. A.A. Wahab → Kota Gorontalo',
  'Alternatif 4 — via Batudaa: Tugu Tani Isimu → Simpang 3 Pasar Bongomeme → Jl. Batudaa → Kota Gorontalo',
]

const RUTE_PRIORITAS = {
  label: '🚑 Jalur Prioritas — Ambulance & Bandara',
  deskripsi: 'Jalur prioritas ambulance & masyarakat menuju Bandara Djalaludin → diarahkan lewat Jl. GORR (Gorontalo Outer Ring Road)',
  koordinat: { lat: 0.5480, lng: 123.0580 },
  tujuan: { lat: 0.6373, lng: 122.8481, nama: 'Bandara Djalaludin' },
}

// ── HELPER ────────────────────────────────────────────────────────────────────

function isWilayahTrans(q) { return KAB_TRANS_SULAWESI.some(w => q.includes(w)) }

function detectAsalType(q) {
  if (isWilayahTrans(q)) return 'trans'
  if (KEC_GORONTALO_ISIMU.some(w => q.includes(w))) return 'isimu'
  if (KEC_GORONTALO_BATUDAA.some(w => q.includes(w))) return 'batudaa'
  if (KEC_GORONTALO_REFORMASI.some(w => q.includes(w))) return 'reformasi'
  if (KEC_GORONTALO_3ALT.some(w => q.includes(w))) return '3alt'
  if (q.includes('bone bolango') || KEC_BONE_BOLANGO.some(w => q.includes(w)) || KEL_BONE_BOLANGO.some(w => q.includes(w))) return '3alt'
  if (q.includes('kota gorontalo') || KEC_KOTA_GORONTALO.some(w => q.includes(w)) || KEL_KOTA_GORONTALO.some(w => q.includes(w))) return '3alt'
  return null
}

function getPanduan(asalType) {
  switch (asalType) {
    case 'trans': return PANDUAN_MENUJU.trans_sulawesi
    case 'isimu': return PANDUAN_MENUJU.isimu_saja
    case 'batudaa': return PANDUAN_MENUJU.batudaa_tabongo
    case 'reformasi': return PANDUAN_MENUJU.reformasi_saja
    case '3alt': return PANDUAN_MENUJU.tiga_alternatif
    default: return []
  }
}

function bukaGoogleMaps(asalKoord, tujuanNama) {
  const origin = `${asalKoord.lat},${asalKoord.lng}`
  const destination = encodeURIComponent(tujuanNama + ', Gorontalo')
  window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`, '_blank')
}

// ── STEP ──────────────────────────────────────────────────────────────────────

const STEP = { AWAL: 'awal', TANYA_TUJUAN: 'tanya_tujuan', SELESAI: 'selesai' }

export default function ChatPanel({ reports, onZoomLocation, onRouteFound }) {
  const [step, setStep] = useState(STEP.AWAL)
  const [inputVal, setInputVal] = useState('')
  const [asalType, setAsalType] = useState(null)
  const [asalLabel, setAsalLabel] = useState('')
  const [loadingRute, setLoadingRute] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hari ini mau kemana? 🗺️' }
  ])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages])

  const addMsg = (role, text) =>
    setMessages(prev => [...prev, { role, text }])

  const reset = () => {
    setStep(STEP.AWAL)
    setInputVal('')
    setAsalType(null)
    setAsalLabel('')
    setMessages([{ role: 'assistant', text: 'Hari ini mau kemana? 🗺️' }])
  }

  // Step 1: user ketik asal
  const handleSubmitAsal = () => {
    const val = inputVal.trim()
    if (!val) return
    addMsg('user', val)
    setInputVal('')

    const q = val.toLowerCase()

    // Prioritas
    if (q.includes('ambulance') || q.includes('bandara') || q.includes('prioritas')) {
      addMsg('assistant', `🚑 *${RUTE_PRIORITAS.label}*\n\n📋 ${RUTE_PRIORITAS.deskripsi}`)
      setStep(STEP.SELESAI)
      sessionStorage.setItem('peta_rute', JSON.stringify({
        asal: { lat: RUTE_PRIORITAS.koordinat.lat, lng: RUTE_PRIORITAS.koordinat.lng },
        tujuan: { lat: RUTE_PRIORITAS.tujuan.lat, lng: RUTE_PRIORITAS.tujuan.lng },
      }))
      return
    }

    // Arus balik
    const isBalik = ['balik','pulang','kembali'].some(k => q.includes(k))
    if (isBalik) {
      addMsg('assistant', `📍 Berikut panduan arus balik:\n\n${PANDUAN_BALIK.map((r,i) => `${r}`).join('\n\n')}\n\nMau tujuan mana? Ketik nama tempat tujuan kamu.`)
      setAsalType('balik')
      setStep(STEP.TANYA_TUJUAN)
      return
    }

    // Deteksi asal
    const type = detectAsalType(q)
    if (!type) {
      addMsg('assistant', `"${val}" ada di kabupaten/kota mana?\n\nContoh: Kota Gorontalo, Bone Bolango, Kab. Gorontalo, Gorontalo Utara, Boalemo, atau Pohuwato.`)
      return
    }

    const panduan = getPanduan(type)
    const koordinat = KOORDINAT_ASAL[type]

    setAsalType(type)
    setAsalLabel(val)

    addMsg('assistant',
      `📍 Dari *${val}*\n\n` +
      `${panduan.join('\n\n')}\n\n` +
      `Mau ke mana tujuan kamu? Ketik nama tempat tujuan.`
    )
    setStep(STEP.TANYA_TUJUAN)
  }

  // Step 2: user ketik tujuan → buka Google Maps
  const handleSubmitTujuan = () => {
    const val = inputVal.trim()
    if (!val) return
    addMsg('user', val)
    setInputVal('')

    if (asalType === 'balik') {
      // Asal = Tugu Tani Isimu
      const asalKoord = { lat: 0.6422, lng: 122.8456 }
      addMsg('assistant', `🗺️ Membuka Google Maps dari Tugu Tani Isimu ke *${val}*...`)
      setTimeout(() => bukaGoogleMaps(asalKoord, val), 300)
    } else {
      const asalKoord = KOORDINAT_ASAL[asalType]
      addMsg('assistant', `🗺️ Membuka Google Maps dari *${asalKoord.nama}* ke *${val}*...`)
      setTimeout(() => bukaGoogleMaps(asalKoord, val), 300)
    }

    setStep(STEP.SELESAI)
  }

  const handlePilihPrioritas = () => {
    addMsg('user', '🚑 Jalur Prioritas')
    addMsg('assistant', `🚑 *${RUTE_PRIORITAS.label}*\n\n📋 ${RUTE_PRIORITAS.deskripsi}`)
    setStep(STEP.SELESAI)
    sessionStorage.setItem('peta_rute', JSON.stringify({
      asal: { lat: RUTE_PRIORITAS.koordinat.lat, lng: RUTE_PRIORITAS.koordinat.lng },
      tujuan: { lat: RUTE_PRIORITAS.tujuan.lat, lng: RUTE_PRIORITAS.tujuan.lng },
    }))
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

        {/* Input Asal */}
        {step === STEP.AWAL && (
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-600 font-mono mb-2">🧭 Masukan Tujuan Awal:</p>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmitAsal()}
                placeholder="Contoh: Atinggola, Dembe, Kabila..."
                className="flex-1 text-xs bg-asphalt-700 border border-asphalt-600 text-gray-200 rounded-xl px-3 py-2.5 font-mono placeholder-gray-600 focus:outline-none focus:border-asphalt-400"
                autoFocus
              />
              <button onClick={handleSubmitAsal}
                className="text-xs bg-asphalt-600 hover:bg-asphalt-500 border border-asphalt-500 text-gray-200 rounded-xl px-3 py-2.5 font-mono transition-all">
                →
              </button>
            </div>
            <button onClick={handlePilihPrioritas}
              className="w-full text-left text-sm bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 hover:border-asphalt-500 text-gray-200 rounded-xl px-4 py-3 transition-all font-display font-600">
              🚑 Jalur Prioritas (Ambulance & Bandara)
            </button>
          </div>
        )}

        {/* Input Tujuan */}
        {step === STEP.TANYA_TUJUAN && (
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-600 font-mono mb-2">📍 Ketik tujuan kamu:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmitTujuan()}
                placeholder="Contoh: Kampung Jawa, Limboto, Marisa..."
                className="flex-1 text-xs bg-asphalt-700 border border-asphalt-600 text-gray-200 rounded-xl px-3 py-2.5 font-mono placeholder-gray-600 focus:outline-none focus:border-asphalt-400"
                autoFocus
              />
              <button onClick={handleSubmitTujuan}
                className="text-xs bg-asphalt-600 hover:bg-asphalt-500 border border-asphalt-500 text-gray-200 rounded-xl px-3 py-2.5 font-mono transition-all">
                →
              </button>
            </div>
          </div>
        )}

        {/* Selesai */}
        {step === STEP.SELESAI && (
          <div className="px-4 pb-4 pt-2">
            <button onClick={reset}
              className="w-full text-xs bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 text-gray-300 rounded-xl py-2.5 transition-all font-mono">
              🔄 Cari Rute Lain
            </button>
          </div>
        )}

      </div>
    </div>
  )
}