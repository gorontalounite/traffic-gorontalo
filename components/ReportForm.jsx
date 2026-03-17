import { useState } from 'react'
import { supabase, KECAMATAN_LIST, STATUS_CONFIG } from '../lib/supabase'

export default function ReportForm({ onReportSubmitted }) {
  const [form, setForm] = useState({
    kecamatan_id: '',
    status: '',
    deskripsi: '',
    nama_pelapor: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const isConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL_HERE'

  const handleSubmit = async () => {
    if (!form.kecamatan_id || !form.status) {
      setError('Pilih kecamatan dan status terlebih dahulu.')
      return
    }

    setLoading(true)
    setError('')

    const kec = KECAMATAN_LIST.find((k) => k.id === form.kecamatan_id)
    const payload = {
      kecamatan_id: form.kecamatan_id,
      kecamatan_nama: kec?.name || form.kecamatan_id,
      status: form.status,
      deskripsi: form.deskripsi || null,
      nama_pelapor: form.nama_pelapor || 'Anonim',
    }

    if (!isConfigured) {
      // Demo mode: just simulate
      await new Promise((r) => setTimeout(r, 800))
      onReportSubmitted && onReportSubmitted(payload)
      setSuccess(true)
      setForm({ kecamatan_id: '', status: '', deskripsi: '', nama_pelapor: '' })
      setTimeout(() => { setSuccess(false); setOpen(false) }, 2500)
      setLoading(false)
      return
    }

    try {
      const { error: sbError } = await supabase
        .from('laporan_lalu_lintas')
        .insert([payload])

      if (sbError) throw sbError

      onReportSubmitted && onReportSubmitted(payload)
      setSuccess(true)
      setForm({ kecamatan_id: '', status: '', deskripsi: '', nama_pelapor: '' })
      setTimeout(() => { setSuccess(false); setOpen(false) }, 2500)
    } catch (err) {
      setError('Gagal mengirim laporan. Cek koneksi dan Supabase config.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-4 mb-4">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-2xl border border-asphalt-600 bg-asphalt-800 hover:bg-asphalt-700 px-4 py-3.5 transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📝</span>
          <div className="text-left">
            <p className="font-display font-600 text-sm text-gray-200">
              Laporkan Kondisi Lapangan
            </p>
            <p className="text-xs text-gray-500">
              Bantu pengguna lain dengan info terkini
            </p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Form */}
      {open && (
        <div className="slide-in-up mt-2 rounded-2xl border border-asphalt-600 bg-asphalt-800 p-4 space-y-3">
          {!isConfigured && (
            <div className="bg-signal-yellow/5 border border-signal-yellow/20 rounded-xl px-3 py-2.5">
              <p className="text-xs text-signal-yellow/80 font-mono">
                ⚠️ Demo mode — Supabase belum dikonfigurasi. Laporan hanya tampil sementara.
              </p>
            </div>
          )}

          {/* Kecamatan */}
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">
              Kecamatan *
            </label>
            <select
              value={form.kecamatan_id}
              onChange={(e) => setForm({ ...form, kecamatan_id: e.target.value })}
              className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-asphalt-500 transition-colors"
            >
              <option value="">Pilih kecamatan...</option>
              {KECAMATAN_LIST.map((kec) => (
                <option key={kec.id} value={kec.id}>
                  {kec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">
              Kondisi Lalu Lintas *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setForm({ ...form, status: key })}
                  className={`rounded-xl border py-2.5 text-xs font-display font-600 transition-all ${
                    form.status === key
                      ? `${cfg.bg} ${cfg.border} ${cfg.text}`
                      : 'bg-asphalt-700 border-asphalt-600 text-gray-500 hover:border-asphalt-500'
                  }`}
                >
                  <div className="text-base mb-0.5">{cfg.emoji}</div>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">
              Keterangan (opsional)
            </label>
            <textarea
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              placeholder="Contoh: Antrian panjang di persimpangan Limboto..."
              rows={2}
              className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-asphalt-500 transition-colors resize-none placeholder-gray-600 font-body"
            />
          </div>

          {/* Nama */}
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">
              Nama Pelapor (opsional)
            </label>
            <input
              value={form.nama_pelapor}
              onChange={(e) => setForm({ ...form, nama_pelapor: e.target.value })}
              placeholder="Anonim"
              className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-asphalt-500 transition-colors placeholder-gray-600"
            />
          </div>

          {error && (
            <p className="text-xs text-signal-red font-mono">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className={`w-full rounded-xl py-3 text-sm font-display font-600 transition-all ${
              success
                ? 'bg-signal-green/20 border border-signal-green/30 text-signal-green'
                : 'bg-asphalt-600 hover:bg-asphalt-500 border border-asphalt-500 text-gray-200 disabled:opacity-50'
            }`}
          >
            {success ? '✓ Laporan terkirim!' : loading ? 'Mengirim...' : 'Kirim Laporan'}
          </button>
        </div>
      )}
    </div>
  )
}
