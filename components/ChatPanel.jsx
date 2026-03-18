import { useState, useRef, useEffect } from 'react'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

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
        label: 'Lewat GORR',
        deskripsi: 'Dari Kota Gorontalo → Jl. A.A. Wahab (Telaga) → belok kanan Jl. Pilohayanga (depan Muraa Supermarket) → belok kiri Jl. GORR → lurus ke Lokasi Ketupat (Kampung Jawa)',
        asal: { id: 'pelabuhan', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
        tujuan: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
      },
      {
        id: 'menuju_2',
        label: 'Lewat Jl. Reformasi',
        deskripsi: 'Dari Kota Gorontalo → Jl. A.A. Wahab (Telaga–Limboto) → belok kiri Jl. Reformasi (arah Danau Limboto) → lurus Simpang 4 Patung Berdoa (Hunggaluwa) → Jl. Trans Sulawesi → Tugu Ketupat (Kampung Jawa)',
        asal: { id: 'pelabuhan', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
        tujuan: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
      },
      {
        id: 'menuju_3',
        label: 'Lewat Batudaa–Bongomeme',
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
        label: 'Isimu → Kota via GORR',
        deskripsi: 'Dari Tugu Tani Isimu → Jl. Trans Sulawesi → Tugu Ketupat Yosonegoro → belok kiri Jl. Amal Modjo (Daenaa) → belok kanan Jl. GORR → Kota Gorontalo',
        asal: { id: 'patung_tani', nama: 'Patung Tani Isimu', lat: 0.6422, lng: 122.8456 },
        tujuan: { id: 'pelabuhan', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
      },
      {
        id: 'balik_2',
        label: 'Kampung Jawa → Kota via Pulubuhu',
        deskripsi: 'Dari Tugu Ketupat → lurus Jl. Pulubuhu → lurus ke Limboto → Kota Gorontalo',
        asal: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
        tujuan: { id: 'pelabuhan', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
      },
      {
        id: 'balik_3',
        label: 'Kampung Jawa → Kota via Reformasi (16.00 WITA)',
        deskripsi: 'Dari Lokasi Ketupat → Jl. Trans Sulawesi (Yosonegoro–Hutabohu–Tenilo–Bolihuangga) → Jl. Reformasi → belok kanan Jl. A.A. Wahab → Kota Gorontalo. Berlaku mulai pukul 16.00 WITA.',
        asal: { id: 'tugu_ketupat', nama: 'Tugu Ketupat Yosonegoro', lat: 0.6381, lng: 122.9266 },
        tujuan: { id: 'pelabuhan', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
      },
      {
        id: 'balik_4',
        label: 'Isimu → Kota via Batudaa',
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
        label: 'Ambulance & Bandara via Jl. GORR',
        deskripsi: 'Jalur prioritas ambulance & masyarakat menuju Bandara Djalaludin → diarahkan lewat Jl. GORR',
        asal: { id: 'pelabuhan', nama: 'Kota Gorontalo', lat: 0.5480, lng: 123.0580 },
        tujuan: { id: 'bandara', nama: 'Bandara Djalaludin', lat: 0.6373, lng: 122.8481 },
      },
    ],
  },
}

const STEP = { ARAH: 'arah', ALTERNATIF: 'alternatif', RUTE: 'rute' }

export default function ChatPanel({ reports, onZoomLocation, onRouteFound }) {
  const [step, setStep] = useState(STEP.ARAH)
  const [selectedArus, setSelectedArus] = useState(null)
  const [selectedAltId, setSelectedAltId] = useState(null)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '🗺️ Halo! Selamat datang di Info Lalu Lintas Kab. Gorontalo.\n\nHari ini mau kemana?' }
  ])
  const [loadingRute, setLoadingRute] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages])

  const addMessage = (role, text, mapUrl = null) =>
    setMessages(prev => [...prev, { role, text, mapUrl }])

  const reset = () => {
    setStep(STEP.ARAH)
    setSelectedArus(null)
    setSelectedAltId(null)
    addMessage('assistant', '↩️ Oke, mulai ulang ya.\n\nHari ini mau kemana?')
  }

  const handlePilihArah = (arusKey) => {
    setSelectedArus(arusKey)
    setStep(STEP.ALTERNATIF)
    addMessage('user', ARUS[arusKey].label)
    addMessage('assistant', 'Silakan pilih alternatif rute:')
  }

  const handlePilihAlternatif = async (alt) => {
    setStep(STEP.RUTE)
    setSelectedAltId(alt.id)
    addMessage('user', alt.label)
    addMessage('assistant', '⏳ Memuat rute...')
    setLoadingRute(true)

    if (onZoomLocation) onZoomLocation(alt.tujuan)
    if (onRouteFound) onRouteFound({ asal: alt.asal, tujuan: alt.tujuan })

    const mapUrl = API_KEY
      ? `https://www.google.com/maps/embed/v1/directions?key=${API_KEY}&origin=${alt.asal.lat},${alt.asal.lng}&destination=${alt.tujuan.lat},${alt.tujuan.lng}&mode=driving&language=id`
      : null

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
          mapUrl,
        }
        return updated
      })
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          text: `🛣️ *${alt.label}*\n\n📋 ${alt.deskripsi}`,
          mapUrl,
        }
        return updated
      })
    } finally {
      setLoadingRute(false)
    }
  }

  const handleBukaMaps = () => {
    if (!selectedArus || !selectedAltId) return
    const alt = ARUS[selectedArus]?.alternatif.find(a => a.id === selectedAltId)
    if (alt?.tujuan) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${alt.tujuan.lat},${alt.tujuan.lng}`, '_blank')
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
          {step !== STEP.ARAH && (
            <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-300 font-mono border border-asphalt-600 rounded-full px-2.5 py-1 transition-colors">
              ↩️ Ulang
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="h-[60vh] overflow-y-auto px-4 py-3 space-y-3">
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
            <p className="text-xs text-gray-600 font-mono mb-2">🛣️ Pilih rute:</p>
            <div className="flex flex-wrap gap-2">
              {ARUS[selectedArus].alternatif.map(alt => (
                <button
                  key={alt.id}
                  onClick={() => handlePilihAlternatif(alt)}
                  className="text-xs bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 hover:border-asphalt-500 text-gray-300 hover:text-gray-100 rounded-full px-3 py-1.5 transition-all font-mono whitespace-nowrap"
                >
                  {alt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Setelah rute — 3 tombol aksi */}
        {step === STEP.RUTE && !loadingRute && (
          <div className="px-4 pb-4 pt-2">
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="flex-1 text-xs bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 text-gray-300 rounded-xl py-2.5 transition-all font-mono"
              >
                🔄 Pilih Rute Lain
              </button>
              <a
                href="/peta"
                className="flex-1 text-xs bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 text-gray-300 rounded-xl py-2.5 transition-all font-mono text-center"
              >
                🗺️ Peta Penuh
              </a>
                
              <button
                onClick={handleBukaMaps}
                className="flex-1 text-xs bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 text-gray-300 rounded-xl py-2.5 transition-all font-mono"
              >
                ↗️ Buka Maps
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}