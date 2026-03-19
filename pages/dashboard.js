import { useState } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  { id: 'kondisi_jalan', label: 'Kondisi Jalan per Ruas', emoji: '🛣️' },
  { id: 'titik_rawan', label: 'Titik Rawan & Jam Sibuk', emoji: '⚠️' },
  { id: 'kontak_petugas', label: 'Kontak Petugas Lapangan', emoji: '👮' },
  { id: 'pengumuman', label: 'Pengumuman & Info Resmi', emoji: '📢' },
]

const STATUS_COLOR = { lancar: 'text-signal-green bg-signal-green/10 border-signal-green/20', padat: 'text-signal-yellow bg-signal-yellow/10 border-signal-yellow/20', macet: 'text-signal-red bg-signal-red/10 border-signal-red/20' }
const MODERASI_COLOR = { pending: 'text-signal-yellow bg-signal-yellow/10 border-signal-yellow/20', diterima: 'text-signal-green bg-signal-green/10 border-signal-green/20', ditolak: 'text-signal-red bg-signal-red/10 border-signal-red/20' }

export default function Dashboard() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('laporan')

  // Knowledge state
  const [knowledge, setKnowledge] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ category: 'kondisi_jalan', title: '', content: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editId, setEditId] = useState(null)
  const [filterCat, setFilterCat] = useState('all')
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importMode, setImportMode] = useState('manual')
  const [bulkUrls, setBulkUrls] = useState('')
  const [bulkResults, setBulkResults] = useState([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 })

  // Embed state
  const [embedForm, setEmbedForm] = useState({ url: '', caption: '', platform: 'instagram' })
  const [embedSaving, setEmbedSaving] = useState(false)
  const [embedSaved, setEmbedSaved] = useState(false)
  const [embedPosts, setEmbedPosts] = useState([])
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [thumbnailUploading, setThumbnailUploading] = useState(false)

  // Laporan / moderasi state
  const [laporan, setLaporan] = useState([])
  const [laporanLoading, setLaporanLoading] = useState(false)
  const [filterModerasi, setFilterModerasi] = useState('pending')
  const [moderasiLoading, setModerasiLoading] = useState({})
  const [catatanMap, setCatatanMap] = useState({})
  const [laporanDetail, setLaporanDetail] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    const data = await res.json()
    if (data.ok) {
      setAuthed(true); setAuthError('')
      fetchKnowledge(); fetchEmbedPosts(); fetchLaporan()
    } else setAuthError('Password salah. Coba lagi.')
  }

  const fetchKnowledge = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      const { data } = await supabase.from('rag_knowledge').select('*').order('created_at', { ascending: false })
      if (data) setKnowledge(data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const fetchEmbedPosts = async () => {
    if (!supabase) return
    const { data } = await supabase.from('embed_posts').select('*').order('created_at', { ascending: false })
    if (data) setEmbedPosts(data)
  }

  const fetchLaporan = async () => {
    if (!supabase) return
    setLaporanLoading(true)
    try {
      const { data } = await supabase
        .from('laporan_lalu_lintas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (data) setLaporan(data)
    } catch (e) { console.error(e) } finally { setLaporanLoading(false) }
  }

  const handleModerasi = async (id, aksi) => {
    setModerasiLoading(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch('/api/moderasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id, aksi, catatan: catatanMap[id] || '' }),
      })
      const data = await res.json()
      if (data.ok) {
        setLaporan(prev => prev.map(l => l.id === id ? { ...l, moderasi: aksi, catatan_admin: catatanMap[id] || l.catatan_admin } : l))
        setLaporanDetail(null)
      }
    } catch (e) { console.error(e) } finally {
      setModerasiLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setThumbnailFile(file)
    setThumbnailPreview(URL.createObjectURL(file))
  }

  const uploadThumbnail = async () => {
    if (!thumbnailFile || !supabase) return null
    setThumbnailUploading(true)
    try {
      const ext = thumbnailFile.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('embed-thumbnails').upload(fileName, thumbnailFile, { cacheControl: '3600', upsert: false })
      if (error) throw error
      const { data: urlData } = supabase.storage.from('embed-thumbnails').getPublicUrl(fileName)
      return urlData.publicUrl
    } catch (e) { console.error('Upload thumbnail gagal:', e); return null }
    finally { setThumbnailUploading(false) }
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      if (editId) {
        await supabase.from('rag_knowledge').update({ kategori: form.category, judul: form.title, konten: form.content }).eq('id', editId)
        setEditId(null)
      } else {
        await supabase.from('rag_knowledge').insert([{ kategori: form.category, judul: form.title, konten: form.content, aktif: true }])
      }
      setForm({ category: 'kondisi_jalan', title: '', content: '' })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      fetchKnowledge()
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  const handleImportUrl = async () => {
    if (!importUrl.trim()) return
    setImporting(true); setImportError('')
    try {
      const res = await fetch('/api/import-url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: importUrl }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil konten')
      setForm(f => ({ ...f, title: data.title || '', content: data.content || '' }))
      setImportUrl(''); setImportMode('manual')
    } catch (e) { setImportError(e.message) } finally { setImporting(false) }
  }

  const handleBulkImport = async () => {
    const urls = bulkUrls.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'))
    if (urls.length === 0) return
    setBulkLoading(true); setBulkResults([]); setBulkProgress({ done: 0, total: urls.length })
    let allResults = []
    for (let i = 0; i < urls.length; i += 10) {
      const batch = urls.slice(i, i + 10)
      try {
        const res = await fetch('/api/import-bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ urls: batch }) })
        const data = await res.json()
        allResults = [...allResults, ...data.results]
      } catch (e) {
        allResults = [...allResults, ...batch.map(u => ({ url: u, status: 'error', error: 'Request gagal' }))]
      }
      setBulkProgress({ done: Math.min(i + 10, urls.length), total: urls.length })
      setBulkResults([...allResults])
    }
    const successful = allResults.filter(r => r.status === 'ok')
    if (successful.length > 0 && supabase) {
      await supabase.from('rag_knowledge').insert(successful.map(r => ({ kategori: 'Pengumuman', judul: r.title, konten: r.content, aktif: true })))
      fetchKnowledge()
    }
    setBulkLoading(false)
  }

  const handleEdit = (item) => {
    setForm({ category: item.kategori, title: item.judul, content: item.konten })
    setEditId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus data ini?')) return
    await supabase.from('rag_knowledge').delete().eq('id', id)
    fetchKnowledge()
  }

  const handleEmbedSave = async () => {
    if (!embedForm.url.trim()) return
    setEmbedSaving(true)
    try {
      let thumbnailUrl = null
      if (thumbnailFile) thumbnailUrl = await uploadThumbnail()
      await supabase.from('embed_posts').insert([{ url: embedForm.url, caption: embedForm.caption, platform: embedForm.platform, aktif: true, thumbnail_url: thumbnailUrl }])
      setEmbedForm({ url: '', caption: '', platform: 'instagram' })
      setThumbnailFile(null); setThumbnailPreview(null)
      setEmbedSaved(true)
      setTimeout(() => setEmbedSaved(false), 2000)
      fetchEmbedPosts()
    } catch (e) { console.error(e) } finally { setEmbedSaving(false) }
  }

  const handleEmbedDelete = async (id, thumbnailUrl) => {
    if (!confirm('Hapus post ini?')) return
    if (thumbnailUrl && supabase) {
      const fileName = thumbnailUrl.split('/').pop()
      await supabase.storage.from('embed-thumbnails').remove([fileName])
    }
    await supabase.from('embed_posts').delete().eq('id', id)
    fetchEmbedPosts()
  }

  const filtered = knowledge.filter(k => filterCat === 'all' || k.kategori === filterCat)
  const laporanFiltered = laporan.filter(l => filterModerasi === 'all' || l.moderasi === filterModerasi)
  const pendingCount = laporan.filter(l => l.moderasi === 'pending').length

  if (!authed) {
    return (
      <>
        <Head><title>Dashboard · Lalu Lintas Kab. Gorontalo</title></Head>
        <div className="min-h-screen bg-asphalt-900 flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🔐</div>
              <h1 className="font-display font-800 text-xl text-gray-100">Dashboard Admin</h1>
              <p className="text-xs text-gray-500 font-mono mt-1">Lalu Lintas Kab. Gorontalo</p>
            </div>
            <form onSubmit={handleLogin} className="bg-asphalt-800 border border-asphalt-600 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password..." className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-200 text-sm rounded-xl px-4 py-3 outline-none focus:border-asphalt-500 transition-colors" autoFocus />
              </div>
              {authError && <p className="text-xs text-signal-red font-mono">{authError}</p>}
              <button type="submit" className="w-full bg-asphalt-600 hover:bg-asphalt-500 border border-asphalt-500 text-gray-200 rounded-xl py-3 text-sm font-display font-600 transition-all">Masuk →</button>
            </form>
            <p className="text-center mt-4"><a href="/" className="text-xs text-gray-600 hover:text-gray-400 font-mono transition-colors">← Kembali ke website</a></p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>Dashboard · Lalu Lintas Kab. Gorontalo</title></Head>
      <div className="min-h-screen bg-asphalt-900">
        <header className="sticky top-0 z-50 bg-asphalt-900/95 backdrop-blur border-b border-asphalt-700">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="font-display font-700 text-sm text-gray-100">Dashboard Admin</h1>
              <p className="text-xs text-gray-600 font-mono">RAG · {knowledge.length} data · {pendingCount > 0 ? `${pendingCount} laporan pending` : `${laporan.length} laporan`}</p>
            </div>
            <a href="/" className="text-xs text-gray-500 hover:text-gray-300 font-mono border border-asphalt-600 rounded-full px-3 py-1.5 transition-colors">← Website</a>
          </div>
          {/* Tab navigation */}
          <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-1">
            {[
              { id: 'laporan', label: '📋 Laporan', badge: pendingCount },
              { id: 'embed', label: '📱 Media Sosial' },
              { id: 'knowledge', label: '🧠 Knowledge Base' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative text-xs px-3 py-1.5 rounded-full font-mono transition-all ${activeTab === tab.id ? 'bg-asphalt-600 border border-asphalt-500 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}>
                {tab.label}
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-signal-red rounded-full text-white text-xs flex items-center justify-center leading-none">{tab.badge}</span>
                )}
              </button>
            ))}
          </div>
          <div className="road-divider" />
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

          {/* ── TAB: LAPORAN ── */}
          {activeTab === 'laporan' && (
            <div className="space-y-4">
              {/* Filter moderasi */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'pending', label: 'Pending', count: laporan.filter(l => l.moderasi === 'pending').length },
                  { id: 'diterima', label: 'Diterima', count: laporan.filter(l => l.moderasi === 'diterima').length },
                  { id: 'ditolak', label: 'Ditolak', count: laporan.filter(l => l.moderasi === 'ditolak').length },
                  { id: 'all', label: 'Semua', count: laporan.length },
                ].map(f => (
                  <button key={f.id} onClick={() => setFilterModerasi(f.id)}
                    className={`flex-shrink-0 text-xs rounded-full px-3 py-1.5 border font-mono transition-all ${filterModerasi === f.id ? 'bg-asphalt-600 border-asphalt-500 text-gray-200' : 'bg-asphalt-800 border-asphalt-600 text-gray-500'}`}>
                    {f.label} ({f.count})
                  </button>
                ))}
                <button onClick={fetchLaporan} className="flex-shrink-0 text-xs text-gray-500 hover:text-gray-300 font-mono px-2">↻ Refresh</button>
              </div>

              {laporanLoading ? (
                <div className="text-center py-10 text-gray-600 font-mono text-sm">Memuat laporan...</div>
              ) : laporanFiltered.length === 0 ? (
                <div className="text-center py-10 text-gray-600"><div className="text-3xl mb-2">📭</div><p className="font-mono text-sm">Tidak ada laporan.</p></div>
              ) : (
                <div className="space-y-3">
                  {laporanFiltered.map(lap => (
                    <div key={lap.id} className="bg-asphalt-800 border border-asphalt-600 rounded-2xl p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${STATUS_COLOR[lap.status] || ''}`}>{lap.status}</span>
                            <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${MODERASI_COLOR[lap.moderasi] || ''}`}>{lap.moderasi}</span>
                          </div>
                          <p className="font-display font-600 text-sm text-gray-200 mt-1">{lap.kecamatan_nama}</p>
                          <p className="text-xs text-gray-500 font-mono">{new Date(lap.created_at).toLocaleString('id-ID')}</p>
                        </div>
                        {lap.foto_url && (
                          <a href={lap.foto_url} target="_blank" rel="noopener noreferrer">
                            <img src={lap.foto_url} alt="foto" className="w-16 h-16 object-cover rounded-xl border border-asphalt-500 flex-shrink-0" />
                          </a>
                        )}
                      </div>

                      {/* Detail */}
                      {lap.deskripsi && <p className="text-xs text-gray-400 leading-relaxed">{lap.deskripsi}</p>}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-gray-500">
                        {lap.nama_pelapor && <span>👤 {lap.nama_pelapor}</span>}
                        {lap.email_pelapor && <span>✉️ {lap.email_pelapor}</span>}
                        {lap.latitude && (
                          <a href={`https://maps.google.com/?q=${lap.latitude},${lap.longitude}`} target="_blank" rel="noopener noreferrer" className="text-asphalt-400 hover:text-gray-300">
                            📍 Lihat lokasi
                          </a>
                        )}
                      </div>

                      {/* Catatan admin */}
                      <textarea
                        value={catatanMap[lap.id] ?? (lap.catatan_admin || '')}
                        onChange={e => setCatatanMap(prev => ({ ...prev, [lap.id]: e.target.value }))}
                        placeholder="Catatan admin (opsional, dikirim ke pelapor)..."
                        rows={2}
                        className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-asphalt-500 resize-none placeholder-gray-600 font-mono"
                      />

                      {/* Tombol aksi */}
                      {lap.moderasi !== 'diterima' && lap.moderasi !== 'ditolak' ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleModerasi(lap.id, 'diterima')} disabled={moderasiLoading[lap.id]}
                            className="flex-1 text-xs bg-signal-green/10 hover:bg-signal-green/20 border border-signal-green/20 text-signal-green rounded-xl py-2 font-mono transition-all disabled:opacity-40">
                            {moderasiLoading[lap.id] ? '...' : '✓ Terima'}
                          </button>
                          <button onClick={() => handleModerasi(lap.id, 'ditolak')} disabled={moderasiLoading[lap.id]}
                            className="flex-1 text-xs bg-signal-red/10 hover:bg-signal-red/20 border border-signal-red/20 text-signal-red rounded-xl py-2 font-mono transition-all disabled:opacity-40">
                            {moderasiLoading[lap.id] ? '...' : '✗ Tolak'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <span className={`flex-1 text-center text-xs py-2 rounded-xl border font-mono ${MODERASI_COLOR[lap.moderasi]}`}>
                            {lap.moderasi === 'diterima' ? '✓ Sudah diterima' : '✗ Sudah ditolak'}
                          </span>
                          <button onClick={() => handleModerasi(lap.id, 'pending')} disabled={moderasiLoading[lap.id]}
                            className="text-xs bg-asphalt-700 border border-asphalt-600 text-gray-500 hover:text-gray-300 rounded-xl px-3 py-2 font-mono transition-all">
                            Reset
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: EMBED ── */}
          {activeTab === 'embed' && (
            <div className="bg-asphalt-800 border border-asphalt-600 rounded-2xl p-5 space-y-4">
              <h2 className="font-display font-600 text-sm text-gray-200">📱 Tambah Post Media Sosial / Berita</h2>
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Platform</label>
                <div className="flex gap-2 flex-wrap">
                  {['instagram','tiktok','berita','lainnya'].map(p => (
                    <button key={p} onClick={() => setEmbedForm({ ...embedForm, platform: p })}
                      className={`text-xs px-3 py-1.5 rounded-full border font-mono transition-all ${embedForm.platform === p ? 'bg-asphalt-600 border-asphalt-500 text-gray-200' : 'bg-asphalt-700 border-asphalt-600 text-gray-500'}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">URL</label>
                <input value={embedForm.url} onChange={e => setEmbedForm({ ...embedForm, url: e.target.value })} placeholder="https://www.instagram.com/p/..." className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-asphalt-500 transition-colors placeholder-gray-600" />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Caption (opsional)</label>
                <input value={embedForm.caption} onChange={e => setEmbedForm({ ...embedForm, caption: e.target.value })} placeholder="Contoh: Kondisi Jl. Trans Sulawesi pagi ini..." className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-asphalt-500 transition-colors placeholder-gray-600" />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Thumbnail (opsional)</label>
                <div className="flex gap-3 items-start">
                  {thumbnailPreview && (
                    <div className="relative flex-shrink-0">
                      <img src={thumbnailPreview} alt="preview" className="w-16 h-16 object-cover rounded-xl border border-asphalt-500" />
                      <button onClick={() => { setThumbnailFile(null); setThumbnailPreview(null) }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-signal-red rounded-full text-white text-xs flex items-center justify-center leading-none">×</button>
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className={`w-full border-2 border-dashed rounded-xl px-3 py-3 text-center transition-all ${thumbnailFile ? 'border-asphalt-500 bg-asphalt-700' : 'border-asphalt-600 hover:border-asphalt-500 bg-asphalt-700/50'}`}>
                      <p className="text-xs text-gray-400 font-mono">{thumbnailFile ? `✓ ${thumbnailFile.name}` : '🖼️ Pilih gambar...'}</p>
                      <p className="text-xs text-gray-600 font-mono mt-0.5">JPG, PNG, WebP · maks 2MB</p>
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleThumbnailChange} className="hidden" />
                  </label>
                </div>
              </div>
              <button onClick={handleEmbedSave} disabled={embedSaving || embedSaved || !embedForm.url.trim() || thumbnailUploading}
                className={`w-full rounded-xl py-3 text-sm font-display font-600 transition-all ${embedSaved ? 'bg-signal-green/20 border border-signal-green/30 text-signal-green' : 'bg-asphalt-600 hover:bg-asphalt-500 border border-asphalt-500 text-gray-200 disabled:opacity-40'}`}>
                {thumbnailUploading ? '⏳ Upload thumbnail...' : embedSaved ? '✓ Tersimpan!' : embedSaving ? 'Menyimpan...' : 'Simpan Post'}
              </button>
              {embedPosts.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-gray-600 font-mono">{embedPosts.length} post tersimpan</p>
                  {embedPosts.map(post => (
                    <div key={post.id} className="flex items-center gap-3 bg-asphalt-700 border border-asphalt-600 rounded-xl px-3 py-2.5">
                      {post.thumbnail_url ? (
                        <img src={post.thumbnail_url} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-asphalt-600 rounded-lg flex-shrink-0 flex items-center justify-center text-lg">
                          {post.platform === 'instagram' ? '📸' : post.platform === 'tiktok' ? '🎵' : post.platform === 'berita' ? '📰' : '🔗'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-mono text-gray-500">{post.platform}</span>
                        <p className="text-xs text-gray-300 truncate">{post.caption || post.url}</p>
                      </div>
                      <button onClick={() => handleEmbedDelete(post.id, post.thumbnail_url)} className="text-xs bg-signal-red/10 hover:bg-signal-red/20 border border-signal-red/20 text-signal-red rounded-lg px-2.5 py-1 transition-all flex-shrink-0">Hapus</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: KNOWLEDGE BASE ── */}
          {activeTab === 'knowledge' && (
            <>
              <div className="bg-asphalt-800 border border-asphalt-600 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="font-display font-600 text-sm text-gray-200">{editId ? '✏️ Edit Data' : '➕ Tambah Knowledge Base'}</h2>
                  <div className="flex gap-1 bg-asphalt-700 rounded-lg p-1">
                    <button onClick={() => setImportMode('manual')} className={`text-xs px-3 py-1 rounded-md transition-all font-mono ${importMode === 'manual' ? 'bg-asphalt-500 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}>✏️ Manual</button>
                    <button onClick={() => setImportMode('url')} className={`text-xs px-3 py-1 rounded-md transition-all font-mono ${importMode === 'url' ? 'bg-asphalt-500 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}>🔗 Import URL</button>
                    <button onClick={() => setImportMode('bulk')} className={`text-xs px-3 py-1 rounded-md transition-all font-mono ${importMode === 'bulk' ? 'bg-asphalt-500 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}>📋 Bulk</button>
                  </div>
                </div>
                {importMode === 'url' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 font-mono">Paste link berita/artikel — konten akan otomatis diekstrak ke form.</p>
                    <div className="flex gap-2">
                      <input value={importUrl} onChange={e => setImportUrl(e.target.value)} placeholder="https://example.com/berita..." className="flex-1 bg-asphalt-700 border border-asphalt-600 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-asphalt-500 transition-colors placeholder-gray-600" />
                      <button onClick={handleImportUrl} disabled={importing || !importUrl.trim()} className="flex-shrink-0 bg-asphalt-600 hover:bg-asphalt-500 border border-asphalt-500 text-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono transition-all disabled:opacity-40">{importing ? '⏳' : '→ Ambil'}</button>
                    </div>
                    {importError && <p className="text-xs text-signal-red font-mono">⚠️ {importError}</p>}
                  </div>
                )}
                {importMode === 'bulk' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 font-mono">Paste banyak URL sekaligus (1 URL per baris).</p>
                    <textarea value={bulkUrls} onChange={e => setBulkUrls(e.target.value)} rows={7} className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-asphalt-500 transition-colors resize-none placeholder-gray-600 font-mono" placeholder="https://berita.gorontaloprov.go.id/..." />
                    <button onClick={handleBulkImport} disabled={bulkLoading || !bulkUrls.trim()} className="w-full bg-asphalt-600 hover:bg-asphalt-500 border border-asphalt-500 text-gray-200 rounded-xl py-3 text-sm font-mono transition-all disabled:opacity-40">
                      {bulkLoading ? `⏳ Memproses... (${bulkProgress.done}/${bulkProgress.total})` : `🚀 Import ${bulkUrls.split('\n').filter(u => u.trim().startsWith('http')).length} URL`}
                    </button>
                    {bulkResults.length > 0 && (
                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        <p className="text-xs font-mono text-gray-500">✓ {bulkResults.filter(r => r.status === 'ok').length} berhasil · ✗ {bulkResults.filter(r => r.status === 'error').length} gagal</p>
                        {bulkResults.map((r, i) => (
                          <div key={i} className={`flex items-start gap-2 text-xs font-mono rounded-lg px-3 py-2 ${r.status === 'ok' ? 'bg-signal-green/10 text-signal-green' : 'bg-signal-red/10 text-signal-red'}`}>
                            <span className="flex-shrink-0">{r.status === 'ok' ? '✓' : '✗'}</span>
                            <span className="truncate flex-1">{r.status === 'ok' ? r.title : `${r.error} — ${r.url}`}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {importMode !== 'bulk' && (
                  <>
                    <div>
                      <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Kategori</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.map(cat => (
                          <button key={cat.id} onClick={() => setForm({ ...form, category: cat.id })} className={`text-left rounded-xl border px-3 py-2.5 text-xs transition-all ${form.category === cat.id ? 'bg-asphalt-600 border-asphalt-500 text-gray-200' : 'bg-asphalt-700 border-asphalt-600 text-gray-500 hover:text-gray-300'}`}>
                            <span className="mr-1.5">{cat.emoji}</span>{cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Judul</label>
                      <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Contoh: Jalan Yosonegoro - Titik Macet Pagi" className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-asphalt-500 transition-colors placeholder-gray-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Informasi</label>
                      <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Tuliskan informasi detail..." rows={4} className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-asphalt-500 transition-colors resize-none placeholder-gray-600 font-body leading-relaxed" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSave} disabled={saving || saved || !form.title.trim() || !form.content.trim()} className={`flex-1 rounded-xl py-3 text-sm font-display font-600 transition-all ${saved ? 'bg-signal-green/20 border border-signal-green/30 text-signal-green' : 'bg-asphalt-600 hover:bg-asphalt-500 border border-asphalt-500 text-gray-200 disabled:opacity-40'}`}>
                        {saved ? '✓ Tersimpan!' : saving ? 'Menyimpan...' : editId ? 'Update Data' : 'Simpan Data'}
                      </button>
                      {editId && <button onClick={() => { setEditId(null); setForm({ category: 'kondisi_jalan', title: '', content: '' }) }} className="px-4 rounded-xl border border-asphalt-600 text-gray-500 hover:text-gray-300 text-sm transition-all">Batal</button>}
                    </div>
                  </>
                )}
              </div>
              <div>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                  <button onClick={() => setFilterCat('all')} className={`flex-shrink-0 text-xs rounded-full px-3 py-1.5 border font-mono transition-all ${filterCat === 'all' ? 'bg-asphalt-600 border-asphalt-500 text-gray-200' : 'bg-asphalt-800 border-asphalt-600 text-gray-500'}`}>Semua ({knowledge.length})</button>
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setFilterCat(cat.id)} className={`flex-shrink-0 text-xs rounded-full px-3 py-1.5 border font-mono whitespace-nowrap transition-all ${filterCat === cat.id ? 'bg-asphalt-600 border-asphalt-500 text-gray-200' : 'bg-asphalt-800 border-asphalt-600 text-gray-500'}`}>
                      {cat.emoji} ({knowledge.filter(k => k.kategori === cat.id).length})
                    </button>
                  ))}
                </div>
                {loading ? <div className="text-center py-10 text-gray-600 font-mono text-sm">Memuat data...</div>
                  : filtered.length === 0 ? <div className="text-center py-10 text-gray-600"><div className="text-3xl mb-2">📭</div><p className="font-mono text-sm">Belum ada data.</p></div>
                  : <div className="space-y-3">
                    {filtered.map(item => {
                      const cat = CATEGORIES.find(c => c.id === item.kategori)
                      return (
                        <div key={item.id} className="bg-asphalt-800 border border-asphalt-600 rounded-2xl p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-mono text-gray-500">{cat?.emoji} {cat?.label}</span>
                              <h3 className="font-display font-600 text-sm text-gray-200 mt-0.5">{item.judul}</h3>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              <button onClick={() => handleEdit(item)} className="text-xs bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 text-gray-400 rounded-lg px-2.5 py-1 transition-all">Edit</button>
                              <button onClick={() => handleDelete(item.id)} className="text-xs bg-signal-red/10 hover:bg-signal-red/20 border border-signal-red/20 text-signal-red rounded-lg px-2.5 py-1 transition-all">Hapus</button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">{item.konten}</p>
                        </div>
                      )
                    })}
                  </div>
                }
              </div>
            </>
          )}

        </main>
      </div>
    </>
  )
}