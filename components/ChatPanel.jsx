import { useState, useRef, useEffect } from 'react'

const LOKASI = [
  { id: 'tugu_ketupat',    nama: 'Tugu Ketupat Yosonegoro',     lat: 0.6381, lng: 122.9266 },
  { id: 'patung_tani',     nama: 'Patung Tani Isimu',           lat: 0.6422, lng: 122.8456 },
  { id: 'menara_limboto',  nama: 'Menara Limboto',              lat: 0.6270, lng: 122.9799 },
  { id: 'patung_berdoa',   nama: 'Simpang 4 Patung Berdoa',     lat: 0.6201, lng: 122.9765 },
  { id: 'habibie',         nama: 'Monumen B.J. Habibie',        lat: 0.6497, lng: 122.8449 },
  { id: 'pasar_bongomeme', nama: 'Pasar Bongomeme',             lat: 0.6041, lng: 122.8861 },
  { id: 'polsek_tibawa',   nama: 'Polsek Tibawa',               lat: 0.6435, lng: 122.8617 },
  { id: 'bandara',         nama: 'Bandara Djalaludin',          lat: 0.6373, lng: 122.8481 },
  { id: 'pelabuhan',       nama: 'Pelabuhan Kota Gorontalo',    lat: 0.5093, lng: 123.0633 },
]

const DESA = {
  'batu loreng': { kec: 'Bongomeme', lat: 0.5949, lng: 122.8659 },
  'batulayar': { kec: 'Bongomeme', lat: 0.5960, lng: 122.8700 },
  'bongohulawa': { kec: 'Bongomeme', lat: 0.5980, lng: 122.8720 },
  'dulamayo': { kec: 'Bongomeme', lat: 0.5930, lng: 122.8600 },
  'huntulohulawa': { kec: 'Bongomeme', lat: 0.5970, lng: 122.8680 },
  'kayumerah': { kec: 'Bongomeme', lat: 0.5940, lng: 122.8640 },
  'liyodu': { kec: 'Bongomeme', lat: 0.5910, lng: 122.8620 },
  'liyoto': { kec: 'Bongomeme', lat: 0.5920, lng: 122.8630 },
  'molanihu': { kec: 'Bongomeme', lat: 0.5990, lng: 122.8740 },
  'molas': { kec: 'Bongomeme', lat: 0.5900, lng: 122.8610 },
  'molopatodu': { kec: 'Bongomeme', lat: 0.5950, lng: 122.8670 },
  'otopade': { kec: 'Bongomeme', lat: 0.5935, lng: 122.8645 },
  'owalanga': { kec: 'Bongomeme', lat: 0.5925, lng: 122.8635 },
  'tohupo': { kec: 'Bongomeme', lat: 0.5915, lng: 122.8625 },
  'upomela': { kec: 'Bongomeme', lat: 0.5905, lng: 122.8615 },
  'ambara': { kec: 'Dungaliyo', lat: 0.6050, lng: 122.8863 },
  'ayuhula': { kec: 'Dungaliyo', lat: 0.6060, lng: 122.8880 },
  'bongomeme': { kec: 'Dungaliyo', lat: 0.6041, lng: 122.8861 },
  'botubulowe': { kec: 'Dungaliyo', lat: 0.6070, lng: 122.8890 },
  'dungaliyo': { kec: 'Dungaliyo', lat: 0.6055, lng: 122.8870 },
  'duwanga': { kec: 'Dungaliyo', lat: 0.6045, lng: 122.8855 },
  'kaliyoso': { kec: 'Dungaliyo', lat: 0.6035, lng: 122.8845 },
  'momala': { kec: 'Dungaliyo', lat: 0.6065, lng: 122.8885 },
  'pangadaa': { kec: 'Dungaliyo', lat: 0.6075, lng: 122.8895 },
  'pilolalenga': { kec: 'Dungaliyo', lat: 0.6080, lng: 122.8900 },
  'balahu': { kec: 'Tibawa', lat: 0.6450, lng: 122.8620 },
  'botumoputi': { kec: 'Tibawa', lat: 0.6460, lng: 122.8630 },
  'buhu': { kec: 'Tibawa', lat: 0.6470, lng: 122.8640 },
  'datahu': { kec: 'Tibawa', lat: 0.6480, lng: 122.8650 },
  'dunggala': { kec: 'Tibawa', lat: 0.6435, lng: 122.8617 },
  'ilomata': { kec: 'Tibawa', lat: 0.6490, lng: 122.8660 },
  'iloponu': { kec: 'Tibawa', lat: 0.6500, lng: 122.8670 },
  'isimu raya': { kec: 'Tibawa', lat: 0.6422, lng: 122.8456 },
  'isimu selatan': { kec: 'Tibawa', lat: 0.6410, lng: 122.8440 },
  'isimu utara': { kec: 'Tibawa', lat: 0.6440, lng: 122.8470 },
  'labanu': { kec: 'Tibawa', lat: 0.6510, lng: 122.8680 },
  'molowahu': { kec: 'Tibawa', lat: 0.6520, lng: 122.8690 },
  'motilango': { kec: 'Tibawa', lat: 0.6530, lng: 122.8700 },
  'reksonegoro': { kec: 'Tibawa', lat: 0.6540, lng: 122.8710 },
  'tolotio': { kec: 'Tibawa', lat: 0.6497, lng: 122.8449 },
  'ulobua': { kec: 'Tibawa', lat: 0.6550, lng: 122.8720 },
  'ayumolingo': { kec: 'Pulubala', lat: 0.6520, lng: 122.8030 },
  'bakti': { kec: 'Pulubala', lat: 0.6510, lng: 122.8020 },
  'molalahu': { kec: 'Pulubala', lat: 0.6530, lng: 122.8040 },
  'molamahu': { kec: 'Pulubala', lat: 0.6540, lng: 122.8050 },
  'mulyonegoro': { kec: 'Pulubala', lat: 0.6550, lng: 122.8060 },
  'pongongaila': { kec: 'Pulubala', lat: 0.6500, lng: 122.8010 },
  'pulubala': { kec: 'Pulubala', lat: 0.6513, lng: 122.8015 },
  'puncak': { kec: 'Pulubala', lat: 0.6560, lng: 122.8070 },
  'toyidito': { kec: 'Pulubala', lat: 0.6490, lng: 122.8000 },
  'tridharma': { kec: 'Pulubala', lat: 0.6570, lng: 122.8080 },
  'bukit aren': { kec: 'Pulubala', lat: 0.6480, lng: 122.7990 },
  'daenaa': { kec: 'Limboto Barat', lat: 0.6390, lng: 122.9265 },
  'haya-haya': { kec: 'Limboto Barat', lat: 0.6400, lng: 122.9280 },
  'huidu': { kec: 'Limboto Barat', lat: 0.6380, lng: 122.9250 },
  'huidu utara': { kec: 'Limboto Barat', lat: 0.6370, lng: 122.9240 },
  'hutabohu': { kec: 'Limboto Barat', lat: 0.6410, lng: 122.9290 },
  'ombulo': { kec: 'Limboto Barat', lat: 0.6360, lng: 122.9230 },
  'padengo': { kec: 'Limboto Barat', lat: 0.6350, lng: 122.9220 },
  'pone': { kec: 'Limboto Barat', lat: 0.6340, lng: 122.9210 },
  'tunggulo': { kec: 'Limboto Barat', lat: 0.6420, lng: 122.9300 },
  'yosonegoro': { kec: 'Limboto Barat', lat: 0.6381, lng: 122.9266 },
  'biyonga': { kec: 'Limboto', lat: 0.6310, lng: 122.9810 },
  'bolihuangga': { kec: 'Limboto', lat: 0.6320, lng: 122.9820 },
  'bulota': { kec: 'Limboto', lat: 0.6280, lng: 122.9780 },
  'dutulanaa': { kec: 'Limboto', lat: 0.6260, lng: 122.9760 },
  'hepuhulawa': { kec: 'Limboto', lat: 0.6250, lng: 122.9750 },
  'hunggaluwa': { kec: 'Limboto', lat: 0.6201, lng: 122.9765 },
  'hutuo': { kec: 'Limboto', lat: 0.6240, lng: 122.9740 },
  'kayubulan': { kec: 'Limboto', lat: 0.6293, lng: 122.9800 },
  'malahu': { kec: 'Limboto', lat: 0.6330, lng: 122.9830 },
  'polohungo': { kec: 'Limboto', lat: 0.6340, lng: 122.9840 },
  'tenilo': { kec: 'Limboto', lat: 0.6350, lng: 122.9850 },
  'tilihuwa': { kec: 'Limboto', lat: 0.6360, lng: 122.9860 },
  'barakati': { kec: 'Batudaa', lat: 0.5960, lng: 122.9100 },
  'bua': { kec: 'Batudaa', lat: 0.5970, lng: 122.9110 },
  'huntu': { kec: 'Batudaa', lat: 0.5980, lng: 122.9120 },
  'ilohungayo': { kec: 'Batudaa', lat: 0.5950, lng: 122.9090 },
  'iluta': { kec: 'Batudaa', lat: 0.5940, lng: 122.9080 },
  'payunga': { kec: 'Batudaa', lat: 0.5930, lng: 122.9070 },
  'pilobuhuta': { kec: 'Batudaa', lat: 0.5920, lng: 122.9060 },
}

const ARUS = {
  menuju: {
    label: '🔴 Menuju Kampung Jawa',
    alternatif: [
      {
        id: 'menuju_1',
        label: 'Alternatif 1',
        deskripsi: 'Dari Kota Gorontalo → Jl. A.A. Wahab (Telaga) → belok kanan Jl. Pilohayanga (depan Muraa Supermarket) → belok kiri Jl. GORR → lurus ke Lokasi Ketupat (Kampung Jawa)',
        asal: { id: 'pelabuhan', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
        tujuan: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
      },
      {
        id: 'menuju_2',
        label: 'Alternatif 2',
        deskripsi: 'Dari Kota Gorontalo → Jl. A.A. Wahab (Telaga–Limboto) → belok kiri Jl. Reformasi (arah Danau Limboto) → lurus Simpang 4 Patung Berdoa (Hunggaluwa) → Jl. Trans Sulawesi → Tugu Ketupat (Kampung Jawa)',
        asal: { id: 'pelabuhan', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
        tujuan: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
      },
      {
        id: 'menuju_3',
        label: 'Alternatif 3',
        deskripsi: 'Dari Kota Gorontalo → Dembe–Lekobalo → Jl. Batudaa → belok kanan Simpang 3 Pasar Bongomeme → lurus sampai Tugu Tani Isimu',
        asal: { id: 'pelabuhan', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
        tujuan: { id: 'patung_tani', nama: 'Patung Tani Isimu', lat: 0.6422, lng: 122.8456 },
      },
    ],
  },
  balik: {
    label: '🔵 Arus Balik',
    alternatif: [
      {
        id: 'balik_1',
        label: 'Alternatif 1',
        deskripsi: 'Dari Tugu Tani Isimu → Jl. Trans Sulawesi → Tugu Ketupat Yosonegoro → belok kiri Jl. Amal Modjo (Daenaa) → belok kanan Jl. GORR → Kota Gorontalo',
        asal: { id: 'patung_tani', nama: 'Patung Tani Isimu', lat: 0.6422, lng: 122.8456 },
        tujuan: { id: 'pelabuhan', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
      },
      {
        id: 'balik_2',
        label: 'Alternatif 2',
        deskripsi: 'Dari Tugu Ketupat → lurus Jl. Pulubuhu → lurus ke Limboto → Kota Gorontalo',
        asal: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
        tujuan: { id: 'pelabuhan', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
      },
      {
        id: 'balik_3',
        label: 'Alternatif 3 (berlaku pukul 16.00 WITA)',
        deskripsi: 'Dari Lokasi Ketupat → Jl. Trans Sulawesi (Yosonegoro–Hutabohu–Tenilo–Bolihuangga) → Jl. Reformasi → belok kanan Jl. A.A. Wahab → Kota Gorontalo',
        asal: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
        tujuan: { id: 'pelabuhan', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
      },
      {
        id: 'balik_4',
        label: 'Alternatif 4',
        deskripsi: 'Dari Tugu Tani Isimu → arah Bongomeme → belok kiri Simpang 3 Pasar Bongomeme → Jl. Batudaa → Kota Gorontalo',
        asal: { id: 'patung_tani', nama: 'Patung Tani Isimu', lat: 0.6422, lng: 122.8456 },
        tujuan: { id: 'pelabuhan', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
      },
    ],
  },
  prioritas: {
    label: '🚑 Jalur Prioritas (Ambulance & Bandara)',
    alternatif: [
      {
        id: 'prioritas_1',
        label: 'Menuju Bandara via Jl. GORR',
        deskripsi: 'Jalur prioritas ambulance & masyarakat menuju Bandara Djalaludin → diarahkan lewat Jl. GORR',
        asal: { id: 'pelabuhan', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
        tujuan: { id: 'bandara', nama: 'Bandara Djalaludin', lat: 0.6373, lng: 122.8481 },
      },
    ],
  },
}

const KONTEKS_LAIN = ['medis','kesehatan','rumah sakit','polisi','pengamanan','event','acara','info','berita','wisata','hotel','makan','restoran']
const STEP = { ARAH: 'arah', ALTERNATIF: 'alternatif', RUTE: 'rute' }

export default function ChatPanel({ reports, onZoomLocation, onRouteFound }) {
  const [step, setStep] = useState(STEP.ARAH)
  const [selectedArus, setSelectedArus] = useState(null)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '🗺️ Halo! Selamat datang di Info Lalu Lintas Kab. Gorontalo.\n\nHari ini mau kemana?' }
  ])
  const [input, setInput] = useState('')
  const [loadingRute, setLoadingRute] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages])

  const addMessage = (role, text) => setMessages(prev => [...prev, { role, text }])

  const reset = () => {
    setStep(STEP.ARAH)
    setSelectedArus(null)
    addMessage('assistant', '↩️ Oke, mulai ulang ya.\n\nHari ini mau kemana?')
  }

  const handlePilihArah = (arusKey) => {
    setSelectedArus(arusKey)
    setStep(STEP.ALTERNATIF)
    addMessage('user', ARUS[arusKey].label)
    addMessage('assistant', 'Pilih alternatif rute:')
  }

  const handlePilihAlternatif = async (alt) => {
    setStep(STEP.RUTE)
    addMessage('user', alt.label)
    addMessage('assistant', '⏳ Memuat rute...')
    setLoadingRute(true)

    if (onZoomLocation) onZoomLocation(alt.tujuan)
    if (onRouteFound) onRouteFound({ asal: alt.asal, tujuan: alt.tujuan })

    try {
      const res = await fetch('/api/rute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asal: alt.asal, tujuan: alt.tujuan }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          text: `🛣️ *${alt.label}*\n\n📋 ${alt.deskripsi}\n\n⏱️ Estimasi: ${data.durasi} | 📏 Jarak: ${data.jarak}`,
        }
        return updated
      })
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          text: `🛣️ *${alt.label}*\n\n📋 ${alt.deskripsi}`,
        }
        return updated
      })
    } finally {
      setLoadingRute(false)
      addMessage('assistant', '❓ Ada yang ingin ditanyakan?\nAtau ketik *ulang* untuk pilih rute lain.')
    }
  }

  const handleInputSend = () => {
    const msg = input.trim()
    if (!msg) return
    setInput('')
    addMessage('user', msg)
    const msgLower = msg.toLowerCase()

    if (msgLower.includes('ulang') || msgLower.includes('kembali') || msgLower.includes('reset')) {
      reset(); return
    }

    if (KONTEKS_LAIN.some(k => msgLower.includes(k))) {
      addMessage('assistant', '📲 Untuk informasi medis, pengamanan, event, dan info lainnya,\nsilakan kunjungi:\n\n👉 Instagram: @gorontalo.unite')
      return
    }

    // Cek nama desa dulu
    const desaKey = Object.keys(DESA).find(d => msgLower.includes(d))
    if (desaKey) {
      const desa = DESA[desaKey]
      if (onZoomLocation) onZoomLocation({ lat: desa.lat, lng: desa.lng })
      addMessage('assistant', `🗺️ Peta sudah di-zoom ke Desa *${desaKey.charAt(0).toUpperCase() + desaKey.slice(1)}*, Kec. ${desa.kec}.\n\nCek kondisi lalu lintas di peta di bawah ya! 👇`)
      return
    }

    // Cek lokasi utama
    const lokasiDisebut = LOKASI.find(l =>
      msgLower.includes(l.nama.toLowerCase().split(' ')[1] || l.nama.toLowerCase().split(' ')[0])
    )
    if (lokasiDisebut && onZoomLocation) {
      onZoomLocation(lokasiDisebut)
      addMessage('assistant', `🗺️ Peta sudah di-zoom ke *${lokasiDisebut.nama}*.\nCek kondisi di peta di bawah ya! 👇`)
      return
    }

    addMessage('assistant', '🚦 Maaf, saya hanya bisa bantu info rute lalu lintas.\n\nMau pilih rute baru?')
    setTimeout(() => reset(), 1500)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleInputSend() }
  }

  return (
    <div className="mx-4 mb-4">
      <div className="rounded-2xl border border-asphalt-600 bg-asphalt-800 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-asphalt-600">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-signal-red" />
              <span className="w-2 h-2 rounded-full bg-signal-yellow" />
              <span className="w-2 h-2 rounded-full bg-signal-green" />
            </div>
            <span className="font-display text-xs font-600 text-gray-400 uppercase tracking-wider">
              Info Rute Lalu Lintas
            </span>
          </div>
          {step !== STEP.ARAH && (
            <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-300 font-mono border border-asphalt-600 rounded-full px-2.5 py-1 transition-colors">
              ↩️ Ulang
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto px-4 py-3 space-y-3">
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

        {/* Step: Pilih Arah */}
        {step === STEP.ARAH && (
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-600 font-mono mb-2">🧭 Pilih arah perjalanan:</p>
            <div className="flex flex-col gap-2">
              {Object.entries(ARUS).map(([key, arus]) => (
                <button
                  key={key}
                  onClick={() => handlePilihArah(key)}
                  className="text-left text-sm bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 hover:border-asphalt-500 text-gray-200 rounded-xl px-4 py-3 transition-all font-display font-600"
                >
                  {arus.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Pilih Alternatif */}
        {step === STEP.ALTERNATIF && selectedArus && (
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-600 font-mono mb-2">🛣️ Pilih alternatif rute:</p>
            <div className="flex flex-col gap-2">
              {ARUS[selectedArus].alternatif.map(alt => (
                <button
                  key={alt.id}
                  onClick={() => handlePilihAlternatif(alt)}
                  className="text-left bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 hover:border-asphalt-500 text-gray-300 rounded-xl px-4 py-3 transition-all"
                >
                  <p className="text-xs font-display font-600 text-gray-200 mb-1">{alt.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{alt.deskripsi}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Input teks setelah rute */}
        {step === STEP.RUTE && !loadingRute && (
          <div className="px-4 pb-4 pt-2">
            <div className="flex gap-2 items-center bg-asphalt-700 border border-asphalt-600 focus-within:border-asphalt-500 rounded-xl px-3 py-2 transition-colors">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Tanya kondisi titik tertentu, atau ketik 'ulang'..."
                className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
              <button
                onClick={handleInputSend}
                disabled={!input.trim()}
                className="w-7 h-7 rounded-lg bg-asphalt-600 hover:bg-asphalt-500 disabled:opacity-30 flex items-center justify-center transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 6h10M6 1l5 5-5 5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}