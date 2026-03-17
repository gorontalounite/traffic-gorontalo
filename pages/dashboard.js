import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  { id: 'kondisi_jalan', label: 'Kondisi Jalan per Ruas', emoji: '🛣️' },
  { id: 'titik_rawan', label: 'Titik Rawan & Jam Sibuk', emoji: '⚠️' },
  { id: 'kontak_petugas', label: 'Kontak Petugas Lapangan', emoji: '👮' },
  { id: 'pengumuman', label: 'Pengumuman & Info Resmi', emoji: '📢' },
]

export default function Dashboard() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [knowledge, setKnowledge] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ category: 'kondisi_jalan', title: '', content: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editId, setEditId] = useState(null)
  const [filterCat, setFilterCat] = useState('all')

  const handleLogin = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    const data = await res.json()
    if (data.ok) { setAuthed(true); setAuthError(''); fetchKnowledge() }
    else setAuthError('Password salah. Coba lagi.')
  }

  const fetchKnowledge = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      const { data } = await supabase.from('rag_knowledge').select('*').order('created_at', { ascending: false })
      if (data) setKnowledge(data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      if (editId) {
        await supabase.from('rag_knowledge').update({ category: form.category, title: form.title, content: form.content }).eq('id', editId)
        setEditId(null)
      } else {
        await supabase.from('rag_knowledge').insert([{ category: form.category, title: form.title, content: form.content }])
      }
      setForm({ category: 'kondisi_jalan', title: '', content: '' })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      fetchKnowledge()
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  const handleEdit = (item) => {
    setForm({ category: item.category, title: item.title, content: item.content })
    setEditId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus data ini?')) return
    await supabase.from('rag_knowledge').delete().eq('id', id)
    fetchKnowledge()
  }

  const filtered = knowledge.filter(k => filterCat === 'all' || k.category === filterCat)

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
              <h1 className="font-display font-700 text-sm text-gray-100">Knowledge Base</h1>
              <p className="text-xs text-gray-600 font-mono">RAG · {knowledge.length} data tersimpan</p>
            </div>
            <a href="/" className="text-xs text-gray-500 hover:text-gray-300 font-mono border border-asphalt-600 rounded-full px-3 py-1.5 transition-colors">← Website</a>
          </div>
          <div className="road-divider" />
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <div className="bg-asphalt-800 border border-asphalt-600 rounded-2xl p-5 space-y-4">
            <h2 className="font-display font-600 text-sm text-gray-200">{editId ? '✏️ Edit Data' : '➕ Tambah Data Baru'}</h2>
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
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Tuliskan informasi detail. Contoh: Jalan Yosonegoro sering macet pukul 07.00-08.30 karena ada SDN 1 Limboto di dekat persimpangan. Alternatif: lewat Jl. Mangga." rows={4} className="w-full bg-asphalt-700 border border-asphalt-600 text-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-asphalt-500 transition-colors resize-none placeholder-gray-600 font-body leading-relaxed" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving || saved || !form.title.trim() || !form.content.trim()} className={`flex-1 rounded-xl py-3 text-sm font-display font-600 transition-all ${saved ? 'bg-signal-green/20 border border-signal-green/30 text-signal-green' : 'bg-asphalt-600 hover:bg-asphalt-500 border border-asphalt-500 text-gray-200 disabled:opacity-40'}`}>
                {saved ? '✓ Tersimpan!' : saving ? 'Menyimpan...' : editId ? 'Update Data' : 'Simpan Data'}
              </button>
              {editId && <button onClick={() => { setEditId(null); setForm({ category: 'kondisi_jalan', title: '', content: '' }) }} className="px-4 rounded-xl border border-asphalt-600 text-gray-500 hover:text-gray-300 text-sm transition-all">Batal</button>}
            </div>
          </div>
          <div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
              <button onClick={() => setFilterCat('all')} className={`flex-shrink-0 text-xs rounded-full px-3 py-1.5 border font-mono transition-all ${filterCat === 'all' ? 'bg-asphalt-600 border-asphalt-500 text-gray-200' : 'bg-asphalt-800 border-asphalt-600 text-gray-500'}`}>Semua ({knowledge.length})</button>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setFilterCat(cat.id)} className={`flex-shrink-0 text-xs rounded-full px-3 py-1.5 border font-mono whitespace-nowrap transition-all ${filterCat === cat.id ? 'bg-asphalt-600 border-asphalt-500 text-gray-200' : 'bg-asphalt-800 border-asphalt-600 text-gray-500'}`}>
                  {cat.emoji} ({knowledge.filter(k => k.category === cat.id).length})
                </button>
              ))}
            </div>
            {loading ? <div className="text-center py-10 text-gray-600 font-mono text-sm">Memuat data...</div>
            : filtered.length === 0 ? <div className="text-center py-10 text-gray-600"><div className="text-3xl mb-2">📭</div><p className="font-mono text-sm">Belum ada data.</p></div>
            : <div className="space-y-3">{filtered.map(item => {
              const cat = CATEGORIES.find(c => c.id === item.category)
              return (
                <div key={item.id} className="bg-asphalt-800 border border-asphalt-600 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-mono text-gray-500">{cat?.emoji} {cat?.label}</span>
                      <h3 className="font-display font-600 text-sm text-gray-200 mt-0.5">{item.title}</h3>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => handleEdit(item)} className="text-xs bg-asphalt-700 hover:bg-asphalt-600 border border-asphalt-600 text-gray-400 rounded-lg px-2.5 py-1 transition-all">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-xs bg-signal-red/10 hover:bg-signal-red/20 border border-signal-red/20 text-signal-red rounded-lg px-2.5 py-1 transition-all">Hapus</button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.content}</p>
                </div>
              )
            })}</div>}
          </div>
        </main>
      </div>
    </>
  )
}
