import { useState } from 'react'
import { supabase, KECAMATAN_LIST } from '../lib/supabase'

export default function ReportForm({ onReportSubmitted }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    kecamatan_id: '',
    status: 'macet',
    deskripsi: '',
    nama_pelapor: '',
    email_pelapor: '',
  })
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [lokasi, setLokasi] = useState(null)
  const [lokasiLoading, setLokasiLoading] = useState(false)
  const [lokasiError, setLokasiError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const STATUS_OPTIONS = [
    { value: 'macet', label: 'Macet', color: 'bg-signal-red/20 border-signal-red/30 text-signal-red' },
    { value: 'padat', label: 'Padat', color: 'bg-signal-yellow/20 border-signal-yellow/30 text-signal-yellow' },
    { value: 'lancar', label: 'Lancar', color: 'bg-signal-green/20 border-signal-green/30 text-signal-green' },
  ]

  const handleFoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Foto maksimal 5MB'); return }
    setFoto(file)
    setFotoPreview(URL.createObjectURL(file))
    setError('')
  }

  const handleGetLokasi = () => {
    if (!navigator.geolocation) { setLokasiError('Browser tidak mendukung GPS'); return }
    setLokasiLoading(true)
    setLokasiError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLokasi({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLokasiLoading(false)
      },
      (err) => {
        setLokasiError('Gagal mendapatkan lokasi. Pastikan izin GPS diberikan.')
        setLokasiLoading(false)
      },
      { timeout: 10000 }
    )
  }

  const uploadFoto = async () => {
    if (!foto || !supabase) return null
    setUploading(true)
    try {
      const ext = foto.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('foto-laporan')
        .upload(fileName, foto, { cacheControl: '3600', upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from('foto-laporan').getPublicUrl(fileName)
      return data.publicUrl
    } catch (e) {
      console.error('Upload foto gagal:', e)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.kecamatan_id) { setError('Pilih kecamatan terlebih dahulu'); return }
    if (!form.email_pelapor || !form.email_pelapor.includes('@')) { setError('Email tidak valid'); return }
    setSubmitting(true)
    setError('')

    try {
      const kec = KECAMATAN_LIST.find(k => k.id === form.kecamatan_id)
      let foto_url = null
      if (foto) foto_url = await uploadFoto()

      const payload = {
        kecamatan_id: form.kecamatan_id,
        kecamatan_nama: kec?.name || form.kecamatan_id,
        status: form.status,
        deskripsi: form.deskripsi,
        nama_pelapor: form.nama_pelapor || 'Anonim',
        email_pelapor: form.email_pelapor,
        foto_url,
        latitude: lokasi?.lat || null,
        longitude: lokasi?.lng || null,
        moderasi: 'pending',
      }

      let savedReport = payload

      if (supabase) {
        const { data, error: dbError } = await supabase
          .from('laporan_lalu_lintas')
          .insert([payload])
          .select()
          .single()
        if (dbError) throw dbError
        savedReport = data
      }

      // Kirim notifikasi ke admin
      try {
        await fetch('/api/notif-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ laporan: savedReport }),
        })
      } catch (e) { console.error('Notif admin gagal:', e) }

      onReportSubmitted?.(savedReport)
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setOpen(false)
        setForm({ kecamatan_id: '', status: 'macet', deskripsi: '', nama_pelapor: '', email_pelapor: '' })
        setFoto(null)
        setFotoPreview(null)
        setLokasi(null)
      }, 3000)
    } catch (e) {
      setError('Gagal mengirim laporan. Coba lagi.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-asphalt-800 border border-asphalt-600 rounded-2xl px-4 py-3.5 text-left transition-all hover:border-asphalt-500"
      >
        <div>
          <p className="text-sm font-display font-600 text-gray-200">📝 Laporkan Kondisi Lapangan</p>
          <p className="text-xs text-gray-500 font-mono mt-0.5">Bantu pengguna lain dengan info terkini</p>
        </div>
        <span className="text-gray-500 text-lg">{open ? '∧' : '∨'}</span>
      </button>

      {open && (
        <div className="bg-asphalt-800 border border-asphalt-600 border-t-0 rounded-b-2xl px-4 pb-4 pt-3 space-y-3">

          {submitted ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-sm text-signal-green font-display font-600">Laporan Terkirim!</p>
              <p className="text-xs text-gray-500 font-mono mt-1">Laporan Anda sedang ditinjau oleh admin.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Kecamatan */}
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">Kecamatan *</label>
                <select
                  value={form.kecamatan_id}
                  onChange={e => setForm({ ...form, kecamatan_id: e.target.value })}
                  className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-asphalt-500"
                  required
                >
                  <option value="">Pilih kecamatan...</option>
                  {KECAMATAN_LIST.map(k => (
                    <option key={k.id} value={k.id}>{k.name}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">Kondisi *</label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setForm({ ...form, status: s.value })}
                      className={`flex-1 text-xs rounded-xl border py-2.5 font-mono transition-all ${form.status === s.value ? s.color : 'bg-asphalt-700 border-asphalt-600 text-gray-500'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Contoh: Kemacetan parah di depan pasar, panjang antrian ±500m..."
                  rows={3}
                  className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-asphalt-500 resize-none placeholder-gray-600"
                />
              </div>

              {/* Foto */}
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">Foto Kondisi</label>
                <div className="flex gap-3 items-start">
                  {fotoPreview && (
                    <div className="relative flex-shrink-0">
                      <img src={fotoPreview} alt="preview" className="w-16 h-16 object-cover rounded-xl border border-asphalt-500" />
                      <button type="button" onClick={() => { setFoto(null); setFotoPreview(null) }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-signal-red rounded-full text-white text-xs flex items-center justify-center">×</button>
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className={`border-2 border-dashed rounded-xl px-3 py-3 text-center transition-all ${foto ? 'border-asphalt-500 bg-asphalt-700' : 'border-asphalt-600 hover:border-asphalt-500 bg-asphalt-700/50'}`}>
                      <p className="text-xs text-gray-400 font-mono">{foto ? `✓ ${foto.name}` : '📷 Ambil / pilih foto'}</p>
                      <p className="text-xs text-gray-600 font-mono mt-0.5">JPG, PNG · maks 5MB</p>
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFoto} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Lokasi GPS */}
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">Lokasi GPS</label>
                {lokasi ? (
                  <div className="flex items-center gap-2 bg-signal-green/10 border border-signal-green/20 rounded-xl px-3 py-2.5">
                    <span className="text-signal-green text-xs font-mono">📍 {lokasi.lat.toFixed(5)}, {lokasi.lng.toFixed(5)}</span>
                    <button type="button" onClick={() => setLokasi(null)} className="ml-auto text-gray-500 hover:text-gray-300 text-xs">Hapus</button>
                  </div>
                ) : (
                  <button type="button" onClick={handleGetLokasi} disabled={lokasiLoading}
                    className="w-full bg-asphalt-700 border border-asphalt-600 hover:border-asphalt-500 text-gray-400 text-xs rounded-xl py-2.5 font-mono transition-all disabled:opacity-50">
                    {lokasiLoading ? '⏳ Mendapatkan lokasi...' : '📍 Gunakan Lokasi Saya'}
                  </button>
                )}
                {lokasiError && <p className="text-xs text-signal-red font-mono mt-1">{lokasiError}</p>}
              </div>

              {/* Nama */}
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">Nama (opsional)</label>
                <input
                  value={form.nama_pelapor}
                  onChange={e => setForm({ ...form, nama_pelapor: e.target.value })}
                  placeholder="Nama Anda atau biarkan kosong"
                  className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-asphalt-500 placeholder-gray-600"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email_pelapor}
                  onChange={e => setForm({ ...form, email_pelapor: e.target.value })}
                  placeholder="email@example.com"
                  required
                  className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-asphalt-500 placeholder-gray-600"
                />
                <p className="text-xs text-gray-600 font-mono mt-1">Untuk konfirmasi status laporan Anda</p>
              </div>

              {error && <p className="text-xs text-signal-red font-mono">{error}</p>}

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full bg-asphalt-600 hover:bg-asphalt-500 border border-asphalt-500 text-gray-200 rounded-xl py-3 text-sm font-display font-600 transition-all disabled:opacity-40"
              >
                {uploading ? '⏳ Upload foto...' : submitting ? 'Mengirim...' : 'Kirim Laporan'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}