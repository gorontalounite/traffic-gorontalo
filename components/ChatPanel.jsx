import { useState, useRef, useEffect } from 'react'

const LOKASI = [
  { id: 'tugu_ketupat',    nama: 'Tugu Ketupat Yosonegoro',  lat: 0.6381, lng: 122.9266 },
  { id: 'tugu_tani',       nama: 'Patung Saronde Isimu',      lat: 0.6422, lng: 122.8456 },
  { id: 'menara_limboto',  nama: 'Menara Limboto',            lat: 0.6270, lng: 122.9799 },
  { id: 'patung_berdoa',   nama: 'Simpang 4 Patung Berdoa',   lat: 0.6201, lng: 122.9765 },
  { id: 'habibie',         nama: 'Monumen B.J. Habibie',      lat: 0.6497, lng: 122.8449 },
  { id: 'pasar_bongomeme', nama: 'Pasar Bongomeme',           lat: 0.6041, lng: 122.8861 },
  { id: 'polsek_tibawa',   nama: 'Polsek Tibawa',             lat: 0.6435, lng: 122.8617 },
  { id: 'bandara',         nama: 'Bandara Djalaludin',        lat: 0.6373, lng: 122.8481 },
  { id: 'pelabuhan',       nama: 'Pelabuhan Kota Gorontalo',  lat: 0.5093, lng: 123.0633 },
  { id: 'kantor_bupati',   nama: 'Kantor Bupati Kab. Gorontalo', lat: 0.6293, lng: 122.9800 },
]

const KONTEKS_LAIN = ['medis','kesehatan','rumah sakit','polisi','pengamanan','event','acara','info','berita','wisata','hotel','makan','restoran']

const STEP = { TUJUAN: 'tujuan', ASAL: 'asal', RUTE: 'rute' }

export default function ChatPanel({ reports, onZoomLocation }) {
  const [step, setStep] = useState(STEP.TUJUAN)
  const [tujuan, setTujuan] = useState(null)
  const [asal, setAsal] = useState(null)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '🗺️ Halo! Selamat datang di Info Lalu Lintas Kab. Gorontalo.\n\nHari ini mau kemana?' }
  ])
  const [input, setInput] = useState('')
  const [loadingRute, setLoadingRute] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages])

  const addMessage = (role, text) => {
    setMessages(prev => [...prev, { role, text }])
  }

  const reset = () => {
    setStep(STEP.TUJUAN)
    setTujuan(null)
    setAsal(null)
    addMessage('assistant', '↩️ Oke, mulai ulang ya.\n\nHari ini mau kemana?')
  }

  const handlePilihTujuan = (lokasi) => {
    setTujuan(lokasi)
    setStep(STEP.ASAL)
    addMessage('user', lokasi.nama)
    addMessage('assistant', `📍 Oke, mau ke *${lokasi.nama}*.\n\nBerangkat dari mana?`)
  }

  const handlePilihAsal = async (lokasi) => {
    if (lokasi.id === tujuan?.id) {
      addMessage('assistant', '⚠️ Asal dan tujuan tidak boleh sama. Pilih lokasi lain.')
      return
    }
    setAsal(lokasi)
    setStep(STEP.RUTE)
    addMessage('user', lokasi.nama)
    addMessage('assistant', `⏳ Mencari rute dari *${lokasi.nama}* ke *${tujuan.nama}*...`)
    setLoadingRute(true)

    // Zoom Maps ke titik tujuan
    if (onZoomLocation) onZoomLocation(tujuan)

    try {
      const res = await fetch('/api/rute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asal: lokasi, tujuan }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Update pesan loading dengan hasil rute
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          text: `🛣️ *Rute: ${lokasi.nama} → ${tujuan.nama}*\n\n${data.ringkasan}\n\n⏱️ Estimasi: ${data.durasi} | 📏 Jarak: ${data.jarak}`,
          rute: data,
        }
        return updated
      })
    } catch (e) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          text: `⚠️ Gagal mengambil rute. Coba lagi ya.`,
        }
        return updated
      })
    } finally {
      setLoadingRute(false)
      addMessage('assistant', '❓ Ada yang ingin ditanyakan tentang rute ini?\nAtau ketik *ulang* untuk pilih rute lain.')
    }
  }

  const handleInputSend = () => {
    const msg = input.trim()
    if (!msg) return
    setInput('')
    addMessage('user', msg)

    const msgLower = msg.toLowerCase()

    // Cek apakah minta ulang
    if (msgLower.includes('ulang') || msgLower.includes('kembali') || msgLower.includes('reset')) {
      reset()
      return
    }

    // Cek konteks lain (medis, event, dll)
    if (KONTEKS_LAIN.some(k => msgLower.includes(k))) {
      addMessage('assistant', '📲 Untuk informasi medis, pengamanan, event, dan info lainnya,\nsilakan hubungi atau kunjungi:\n\n👉 Instagram: @gorontalo.unite')
      return
    }

    // Cek apakah tanya kondisi titik tertentu
    const lokasiDisebut = LOKASI.find(l => msgLower.includes(l.nama.toLowerCase().split(' ')[1] || l.nama.toLowerCase().split(' ')[0]))
    if (lokasiDisebut && onZoomLocation) {
      onZoomLocation(lokasiDisebut)
      addMessage('assistant', `🗺️ Peta sudah di-zoom ke *${lokasiDisebut.nama}*.\nCek kondisi lalu lintas di peta di bawah ya! 👇`)
      return
    }

    // Default: kembali ke pilihan
    addMessage('assistant', '🚦 Maaf, saya hanya bisa bantu info rute lalu lintas.\n\nMau pilih rute baru?')
    setTimeout(() => {
      reset()
    }, 1500)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleInputSend()
    }
  }

  // Lokasi untuk pilihan asal (exclude tujuan yang sudah dipilih)
  const lokasiAsal = LOKASI.filter(l => l.id !== tujuan?.id)

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
          {step !== STEP.TUJUAN && (
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
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Pilihan lokasi */}
        {(step === STEP.TUJUAN || step === STEP.ASAL) && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-600 font-mono mb-2">
              {step === STEP.TUJUAN ? '🎯 Pilih tujuan:' : '📍 Pilih asal:'}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {(step === STEP.TUJUAN ? LOKASI : lokasiAsal).map(l => (
                <button
                  key={l.id}
                  onClick={() => step === STEP.TUJUAN ? handlePilihTujuan(l) : handlePilihAsal(l)}
                  className="text-left text-xs bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 hover:border-asphalt-500 text-gray-300 hover:text-gray-100 rounded-xl px-3 py-2 transition-all"
                >
                  {l.nama}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input teks (setelah rute ditampilkan) */}
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