import { useState, useRef, useEffect } from 'react'

const QUICK_QUESTIONS = [
  'Bagaimana kondisi Limboto sekarang?',
  'Ada kemacetan di Tibawa?',
  'Jalur Bongomeme aman?',
  'Kecamatan mana yang paling padat?',
]

export default function ChatPanel({ reports }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '🚦 Halo! Saya asisten lalu lintas Kabupaten Gorontalo. Tanya kondisi di kecamatan mana yang ingin kamu ketahui?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const buildContext = () => {
    if (!reports || reports.length === 0) return 'Belum ada laporan lapangan.'
    const latestPerKec = {}
    reports.forEach((r) => {
      if (!latestPerKec[r.kecamatan_id]) latestPerKec[r.kecamatan_id] = r
    })
    return Object.values(latestPerKec)
      .map((r) => `${r.kecamatan_nama}: ${r.status}${r.deskripsi ? ` (${r.deskripsi})` : ''}`)
      .join('\n')
  }

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    setMessages((prev) => [...prev, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, context: buildContext() }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: '⚠️ Maaf, terjadi error. Coba lagi ya!' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="mx-4 mb-4">
      <div className="rounded-2xl border border-asphalt-600 bg-asphalt-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-asphalt-600">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-signal-red pulse-red" />
            <span className="w-2 h-2 rounded-full bg-signal-yellow" />
            <span className="w-2 h-2 rounded-full bg-signal-green" />
          </div>
          <span className="font-display text-xs font-600 text-gray-400 uppercase tracking-wider">
            Tanya Asisten Lalu Lintas
          </span>
        </div>

        {/* Messages */}
        <div className="h-72 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} slide-in-up`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-asphalt-600 text-gray-200 rounded-br-sm'
                    : 'bg-asphalt-700 border border-asphalt-600 text-gray-300 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-asphalt-700 border border-asphalt-600 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        <div className="px-4 pb-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="flex-shrink-0 text-xs bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 hover:border-asphalt-500 text-gray-400 hover:text-gray-200 rounded-full px-3 py-1.5 transition-all whitespace-nowrap disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex gap-2 items-center bg-asphalt-700 border border-asphalt-600 focus-within:border-asphalt-500 rounded-xl px-3 py-2 transition-colors">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Tanya kondisi lalu lintas..."
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none font-body"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-7 h-7 rounded-lg bg-asphalt-600 hover:bg-asphalt-500 disabled:opacity-30 flex items-center justify-center transition-all flex-shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 6h10M6 1l5 5-5 5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
