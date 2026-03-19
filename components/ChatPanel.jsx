import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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
const BOALEMO = [
  'boalemo',
  'botumoito','bolihutuo','dulangeya','hutamonu','patoameme','potanga','rumbia','tutulo',
  'dulupi','kotaraja','pangi','polohungo','tangga barito','tangga jaya',
  'mananggu','bendungan','buti','kaaruyan','kramat','salilama','tabulo','tabulo selatan',
  'paguyaman','balate jaya','batu kramat','bongo iv','bongo nol','bongo tua','bualo','diloato','girisa','huwongo','karya murni','kuala lumpur','molombulahe','mustika','mutiara','rejonegoro','saripi','sosial','tangkobu','tenilo','wonggahu',
  'paguyaman pantai','apitalawu','bangga','bubaa','bukit karya','limbatihu','lito','olibu','towayu',
  'tilamuta','ayuhulalo','hungayonaa','lahumbo','lamu','limbato','modelomo','mohungo','pentadu barat','pentadu timur','piloliyanga',
  'wonosari','bongo ii','bongo iii','dimito','dulohupa','harapan','jatimulya','mekarjaya','pangea','raharja','sari tani','suka mulya','sukamaju','tanjung harapan','tri rukun',
]
const KAB_TRANS_SULAWESI = [...GORUT, ...POHUWATO, ...BOALEMO]

const KATA_KAMPUNG_JAWA = ['kampung jawa','ketupat','yosonegoro','isimu','tugu tani','lokasi ketupat','lebaran ketupat']
const KATA_BALIK = ['balik','pulang','kembali']

// ── RUTE ─────────────────────────────────────────────────────────────────────

const RUTE_MENUJU = {
  tiga_alternatif: [
    { id: 'alt_gorr', label: 'Alternatif 1 — Lewat Jl. GORR', deskripsi: 'Dari Kota Gorontalo → Jl. A.A. Wahab (Telaga) → belok kanan Jl. Pilohayanga (depan Muraa Supermarket) → belok kiri Jl. GORR → lurus ke Lokasi Ketupat (Kampung Jawa)', asal: { lat: 0.5480, lng: 123.0580 }, tujuan: { lat: 0.6381, lng: 122.9266 } },
    { id: 'alt_reformasi', label: 'Alternatif 2 — Lewat Jl. Reformasi', deskripsi: 'Dari Kota Gorontalo → Jl. A.A. Wahab (Telaga–Limboto) → belok kiri Jl. Reformasi → lurus Simpang 4 Patung Berdoa → Jl. Trans Sulawesi → Tugu Ketupat (Kampung Jawa)', asal: { lat: 0.5480, lng: 123.0580 }, tujuan: { lat: 0.6381, lng: 122.9266 } },
    { id: 'alt_batudaa', label: 'Alternatif 3 — Lewat Batudaa–Bongomeme', deskripsi: 'Dari Kota Gorontalo → Dembe–Lekobalo → Jl. Batudaa → belok kanan Simpang 3 Pasar Bongomeme → lurus sampai Tugu Tani Isimu', asal: { lat: 0.5480, lng: 123.0580 }, tujuan: { lat: 0.6422, lng: 122.8456 } },
  ],
  reformasi_saja: [
    { id: 'alt_reformasi', label: 'Lewat Jl. Reformasi', deskripsi: 'Dari Limboto/Telaga Biru → Jl. Reformasi → lurus Simpang 4 Patung Berdoa → Jl. Trans Sulawesi → Tugu Ketupat (Kampung Jawa)', asal: { lat: 0.6270, lng: 122.9799 }, tujuan: { lat: 0.6381, lng: 122.9266 } },
  ],
  batudaa_tabongo: [
    { id: 'alt_ilomangga', label: 'Alternatif 1 — Lewat Desa Ilomangga', deskripsi: 'Dari Batudaa/Tabongo → pertigaan Desa Ilomangga → terus sampai Tunggulo → Kampung Jawa', asal: { lat: 0.5960, lng: 122.9100 }, tujuan: { lat: 0.6381, lng: 122.9266 } },
    { id: 'alt_limehe', label: 'Alternatif 2 — Lewat Desa Limehe Barat', deskripsi: 'Dari Batudaa/Tabongo → pertigaan Desa Limehe Barat → Pasar Hutabohu → Kampung Jawa', asal: { lat: 0.5960, lng: 122.9100 }, tujuan: { lat: 0.6381, lng: 122.9266 } },
  ],
  isimu_saja: [
    { id: 'alt_isimu', label: 'Langsung ke Tugu Tani Isimu', deskripsi: 'Dari lokasi Anda → lurus menuju Tugu Tani Isimu → Kampung Jawa (pusat perayaan Lebaran Ketupat)', asal: { lat: 0.6041, lng: 122.8861 }, tujuan: { lat: 0.6422, lng: 122.8456 } },
  ],
  trans_sulawesi: [
    { id: 'alt_trans', label: 'Lewat Jl. Trans Sulawesi → Tugu Tani Isimu', deskripsi: 'Dari arah timur/barat → lurus Jl. Trans Sulawesi → langsung menuju Tugu Tani Isimu sebagai pintu masuk Kampung Jawa', asal: { lat: 0.8567, lng: 122.9071 }, tujuan: { lat: 0.6422, lng: 122.8456 } },
  ],
}

const RUTE_BALIK = [
  { id: 'balik_1', label: 'Alternatif 1 — via Jl. GORR', deskripsi: 'Dari Tugu Tani Isimu → Tugu Ketupat Yosonegoro → Jl. Amal Modjo (Daenaa) → belok kanan Jl. GORR → Kota Gorontalo', asal: { lat: 0.6422, lng: 122.8456 }, tujuan: { lat: 0.5480, lng: 123.0580 } },
  { id: 'balik_2', label: 'Alternatif 2 — via Jl. Pulubuhu', deskripsi: 'Dari Tugu Ketupat → lurus Jl. Pulubuhu → Limboto → Kota Gorontalo', asal: { lat: 0.6381, lng: 122.9266 }, tujuan: { lat: 0.5480, lng: 123.0580 } },
  { id: 'balik_3', label: 'Alternatif 3 — via Jl. Reformasi (16.00 WITA)', deskripsi: 'Dari Lokasi Ketupat → Jl. Trans Sulawesi → Jl. Reformasi → Jl. A.A. Wahab → Kota Gorontalo. Berlaku mulai pukul 16.00 WITA.', asal: { lat: 0.6381, lng: 122.9266 }, tujuan: { lat: 0.5480, lng: 123.0580 } },
  { id: 'balik_4', label: 'Alternatif 4 — via Batudaa', deskripsi: 'Dari Tugu Tani Isimu → Simpang 3 Pasar Bongomeme → Jl. Batudaa → Kota Gorontalo', asal: { lat: 0.6422, lng: 122.8456 }, tujuan: { lat: 0.5480, lng: 123.0580 } },
]

const RUTE_PRIORITAS = {
  label: '🚑 Jalur Prioritas — Ambulance & Bandara',
  deskripsi: 'Jalur prioritas ambulance & masyarakat menuju Bandara Djalaludin → diarahkan lewat Jl. GORR (Gorontalo Outer Ring Road)',
  asal: { lat: 0.5480, lng: 123.0580 },
  tujuan: { lat: 0.6373, lng: 122.8481 },
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

function getRuteMenuju(asalType) {
  switch (asalType) {
    case 'trans': return RUTE_MENUJU.trans_sulawesi
    case 'isimu': return RUTE_MENUJU.isimu_saja
    case 'batudaa': return RUTE_MENUJU.batudaa_tabongo
    case 'reformasi': return RUTE_MENUJU.reformasi_saja
    case '3alt': return RUTE_MENUJU.tiga_alternatif
    default: return RUTE_MENUJU.tiga_alternatif
  }
}

async function getKoordinatAsal(asalLabel) {
  if (!supabase) return null
  const q = asalLabel.toLowerCase().trim()
  const { data } = await supabase
    .from('kecamatan_koordinat')
    .select('latitude,longitude,kecamatan')
    .ilike('kecamatan', `%${q}%`)
    .limit(1)
  if (data && data.length > 0) return { lat: parseFloat(data[0].latitude), lng: parseFloat(data[0].longitude) }
  return null
}

function parseInput(raw) {
  const q = raw.toLowerCase().trim()
  if (q.includes('ambulance') || q.includes('bandara') || q.includes('prioritas')) return { mode: 'prioritas' }
  const pemisah = [' ke ', ' menuju ', ' balik ke ', ' pulang ke ', ' kembali ke ']
  let asal = q, tujuan = ''
  for (const p of pemisah) {
    if (q.includes(p)) {
      const idx = q.indexOf(p)
      asal = q.slice(0, idx).trim()
      tujuan = q.slice(idx + p.length).trim()
      break
    }
  }
  const isBalik = KATA_BALIK.some(k => q.includes(k)) && !KATA_KAMPUNG_JAWA.some(k => q.includes(k))
  const isMenuju = KATA_KAMPUNG_JAWA.some(k => tujuan.includes(k) || (!tujuan && q.includes(k)))
  if (isBalik) return { mode: 'balik', tujuanLabel: tujuan || asal, tujuanTrans: isWilayahTrans(tujuan || q) }
  if (isMenuju) return { mode: 'tanya', asalRaw: asal || raw }
  if (tujuan) {
    const asalType = detectAsalType(asal)
    return { mode: 'directions', asalRaw: asal, tujuanRaw: tujuan, asalType }
  }
  // Tidak dikenali sebagai rute → fallback ke RAG
  return { mode: 'rag', query: raw }
}

// ── STEP ──────────────────────────────────────────────────────────────────────

const STEP = { AWAL: 'awal', TANYA_TUJUAN: 'tanya_tujuan', ALTERNATIF: 'alternatif', RUTE: 'rute' }

export default function ChatPanel({ reports, onZoomLocation, onRouteFound }) {
  const [step, setStep] = useState(STEP.AWAL)
  const [inputVal, setInputVal] = useState('')
  const [rutePilihan, setRutePilihan] = useState([])
  const [loadingRute, setLoadingRute] = useState(false)
  const [asalSimpan, setAsalSimpan] = useState(null)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hari ini mau kemana? 🗺️\n\nKetik nama asal & tujuan, atau tanyakan info lalu lintas Gorontalo.' }
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
    setAsalSimpan(null)
    setMessages([{ role: 'assistant', text: 'Hari ini mau kemana? 🗺️\n\nKetik nama asal & tujuan, atau tanyakan info lalu lintas Gorontalo.' }])
  }

  const handlePilihPrioritas = () => {
    addMsg('user', '🚑 Jalur Prioritas')
    addMsg('assistant', `🚑 *${RUTE_PRIORITAS.label}*\n\n📋 ${RUTE_PRIORITAS.deskripsi}`)
    setStep(STEP.RUTE)
    if (onRouteFound) onRouteFound({ asal: RUTE_PRIORITAS.asal, tujuan: RUTE_PRIORITAS.tujuan })
  }

  // ── Fallback ke RAG ──
  const handleRagQuery = async (val) => {
    setStep(STEP.RUTE)
    addMsg('assistant', '⏳ Mencari informasi...')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: val }),
      })
      const data = await res.json()
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', text: data.reply }
        return updated
      })
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          text: '🚦 Maaf, saya hanya bisa membantu informasi seputar rute dan lalu lintas di Kabupaten Gorontalo.',
        }
        return updated
      })
    }
  }

  const handleSubmitInput = async () => {
    const val = inputVal.trim()
    if (!val) return
    addMsg('user', val)
    setInputVal('')

    const parsed = parseInput(val)

    if (parsed.mode === 'prioritas') { handlePilihPrioritas(); return }

    if (parsed.mode === 'balik') {
      const rute = parsed.tujuanTrans
        ? [{ id: 'balik_trans', label: 'Lewat Jl. Trans Sulawesi', deskripsi: 'Dari Tugu Tani Isimu → Jl. Trans Sulawesi langsung menuju tujuan arah timur/barat', asal: { lat: 0.6422, lng: 122.8456 }, tujuan: { lat: 0.8567, lng: 122.9071 } }]
        : RUTE_BALIK
      addMsg('assistant', `📍 Alternatif arus balik menuju *${parsed.tujuanLabel}*:`)
      setRutePilihan(rute)
      setStep(STEP.ALTERNATIF)
      return
    }

    if (parsed.mode === 'tanya') {
      const asalType = detectAsalType(parsed.asalRaw)
      const koordinat = await getKoordinatAsal(parsed.asalRaw)
      setAsalSimpan({ label: parsed.asalRaw, type: asalType, koordinat })
      if (!asalType) {
        addMsg('assistant', `"${parsed.asalRaw}" ada di kabupaten/kota mana?\n\nContoh: Kota Gorontalo, Bone Bolango, Gorontalo Utara, Boalemo, atau Pohuwato.`)
      } else {
        addMsg('assistant', `Dari *${parsed.asalRaw}* — mau ke mana tujuannya?\n\nKetik nama tujuan, atau ketik "Kampung Jawa" untuk info rute Lebaran Ketupat.`)
        setStep(STEP.TANYA_TUJUAN)
      }
      return
    }

    if (parsed.mode === 'directions') {
      const isKampungJawa = KATA_KAMPUNG_JAWA.some(k => parsed.tujuanRaw.includes(k))
      if (isKampungJawa) {
        const rute = getRuteMenuju(parsed.asalType || '3alt')
        addMsg('assistant', rute.length === 1
          ? `📍 Rute dari *${parsed.asalRaw}* menuju Kampung Jawa:`
          : `📍 Ada ${rute.length} alternatif dari *${parsed.asalRaw}*. Pilih salah satu:`)
        setRutePilihan(rute)
        setStep(STEP.ALTERNATIF)
      } else {
        const koordinat = await getKoordinatAsal(parsed.asalRaw)
        if (koordinat) {
          const dest = encodeURIComponent(parsed.tujuanRaw + ', Gorontalo, Indonesia')
          const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${koordinat.lat},${koordinat.lng}&destination=${dest}&travelmode=driving`
          addMsg('assistant', `🗺️ Rute dari *${parsed.asalRaw}* ke *${parsed.tujuanRaw}* siap.\n\nKlik tombol di bawah untuk buka di Google Maps.`, mapsUrl)
        } else {
          addMsg('assistant', `Koordinat *${parsed.asalRaw}* belum tersedia. Coba sebutkan nama kecamatannya lebih spesifik.`)
        }
        setStep(STEP.RUTE)
      }
      return
    }

    // Mode RAG — pertanyaan bebas
    if (parsed.mode === 'rag') {
      await handleRagQuery(val)
    }
  }

  const handleSubmitTujuan = async () => {
    const val = inputVal.trim()
    if (!val) return
    addMsg('user', val)
    setInputVal('')

    const isKampungJawa = KATA_KAMPUNG_JAWA.some(k => val.toLowerCase().includes(k))

    if (isKampungJawa && asalSimpan) {
      const rute = getRuteMenuju(asalSimpan.type || '3alt')
      addMsg('assistant', rute.length === 1
        ? `📍 Rute dari *${asalSimpan.label}* menuju Kampung Jawa:`
        : `📍 Ada ${rute.length} alternatif dari *${asalSimpan.label}*. Pilih salah satu:`)
      setRutePilihan(rute)
      setStep(STEP.ALTERNATIF)
    } else {
      const koordinat = asalSimpan?.koordinat || await getKoordinatAsal(asalSimpan?.label || '')
      if (koordinat) {
        const dest = encodeURIComponent(val + ', Gorontalo, Indonesia')
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${koordinat.lat},${koordinat.lng}&destination=${dest}&travelmode=driving`
        addMsg('assistant', `🗺️ Rute dari *${asalSimpan?.label}* ke *${val}* siap.\n\nKlik tombol di bawah untuk buka di Google Maps.`, mapsUrl)
      } else {
        addMsg('assistant', `Koordinat asal tidak ditemukan. Coba ulangi dengan nama kecamatan yang lebih spesifik.`)
      }
      setStep(STEP.RUTE)
    }
  }

  const handlePilihRute = async (rute) => {
    setStep(STEP.RUTE)
    addMsg('user', rute.label)
    addMsg('assistant', '⏳ Memuat rute...')
    setLoadingRute(true)

    const asalKoord = asalSimpan?.koordinat || rute.asal
    const ruteData = { asal: asalKoord, tujuan: rute.tujuan }

    if (onZoomLocation) onZoomLocation(rute.tujuan)
    if (onRouteFound) onRouteFound(ruteData)

    const mapUrl = API_KEY
      ? `https://www.google.com/maps/embed/v1/directions?key=${API_KEY}&origin=${asalKoord.lat},${asalKoord.lng}&destination=${rute.tujuan.lat},${rute.tujuan.lng}&mode=driving&language=id`
      : null

    try {
      const res = await fetch('/api/rute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asal: asalKoord, tujuan: rute.tujuan }),
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
                {msg.mapUrl && msg.mapUrl.includes('dir/?') && (
                  <a href={msg.mapUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 bg-asphalt-600 hover:bg-asphalt-500 border border-asphalt-500 text-gray-200 text-xs rounded-xl py-2.5 px-4 transition-all font-mono">
                    🗺️ Buka di Google Maps
                  </a>
                )}
                {msg.mapUrl && msg.mapUrl.includes('embed') && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-asphalt-500">
                    <iframe src={msg.mapUrl} width="100%" height="220"
                      style={{ border: 0, display: 'block' }}
                      allowFullScreen loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Rute Maps" />
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

        {/* Input Awal */}
        {step === STEP.AWAL && (
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-600 font-mono mb-2">🧭 Ketik asal, tujuan, atau pertanyaan:</p>
            <div className="flex gap-2 mb-2">
              <input type="text" value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmitInput()}
                placeholder="Contoh: Dari Telaga ke Kampung Jawa..."
                className="flex-1 text-xs bg-asphalt-700 border border-asphalt-600 text-gray-200 rounded-xl px-3 py-2.5 font-mono placeholder-gray-600 focus:outline-none focus:border-asphalt-400"
                autoFocus />
              <button onClick={handleSubmitInput}
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
            <p className="text-xs text-gray-600 font-mono mb-2">📍 Ketik tujuan:</p>
            <div className="flex gap-2">
              <input type="text" value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmitTujuan()}
                placeholder="Contoh: Kampung Jawa, Limboto, Marisa..."
                className="flex-1 text-xs bg-asphalt-700 border border-asphalt-600 text-gray-200 rounded-xl px-3 py-2.5 font-mono placeholder-gray-600 focus:outline-none focus:border-asphalt-400"
                autoFocus />
              <button onClick={handleSubmitTujuan}
                className="text-xs bg-asphalt-600 hover:bg-asphalt-500 border border-asphalt-500 text-gray-200 rounded-xl px-3 py-2.5 font-mono transition-all">
                →
              </button>
            </div>
          </div>
        )}

        {/* Pilih Alternatif */}
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

        {/* Setelah rute / RAG */}
        {step === STEP.RUTE && !loadingRute && (
          <div className="px-4 pb-4 pt-2">
            <div className="flex gap-2">
              <button onClick={reset}
                className="flex-1 text-xs bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 text-gray-300 rounded-xl py-2.5 transition-all font-mono">
                🔄 Tanya Lagi
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