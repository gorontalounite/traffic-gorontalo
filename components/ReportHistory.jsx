import { useState } from 'react'
import { STATUS_CONFIG, KECAMATAN_LIST } from '../lib/supabase'

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return `${diff}d lalu`
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`
  return `${Math.floor(diff / 86400)}h lalu`
}

export default function ReportHistory({ reports, loading }) {
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [fotoModal, setFotoModal] = useState(null)

  const filtered = (reports || []).filter((r) =>
    filter === 'all' ? true : r.kecamatan_id === filter
  )

  return (
    <div className="mx-4 mb-6">
      {/* Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-2xl border border-asphalt-600 bg-asphalt-800 hover:bg-asphalt-700 px-4 py-3.5 transition-all"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📋</span>
          <div className="text-left">
            <p className="font-display font-600 text-sm text-gray-200">Riwayat Laporan</p>
            <p className="text-xs text-gray-500">{reports?.length || 0} laporan masuk</p>
          </div>
        </div>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="slide-in-up mt-2 rounded-2xl border border-asphalt-600 bg-asphalt-800 overflow-hidden">
          {/* Filter */}
          <div className="px-4 pt-3 pb-2 border-b border-asphalt-700">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button onClick={() => setFilter('all')}
                className={`flex-shrink-0 text-xs rounded-full px-3 py-1 border transition-all font-mono ${filter === 'all' ? 'bg-asphalt-600 border-asphalt-500 text-gray-200' : 'bg-transparent border-asphalt-700 text-gray-500 hover:text-gray-300'}`}>
                Semua
              </button>
              {KECAMATAN_LIST.map((kec) => (
                <button key={kec.id} onClick={() => setFilter(kec.id)}
                  className={`flex-shrink-0 text-xs rounded-full px-3 py-1 border transition-all font-mono whitespace-nowrap ${filter === kec.id ? 'bg-asphalt-600 border-asphalt-500 text-gray-200' : 'bg-transparent border-asphalt-700 text-gray-500 hover:text-gray-300'}`}>
                  {kec.name.replace('Kec. ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-gray-600 text-sm font-mono">Memuat laporan...</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                <span className="text-3xl mb-2">📭</span>
                <p className="text-sm font-mono">Belum ada laporan</p>
              </div>
            ) : (
              <div className="divide-y divide-asphalt-700">
                {filtered.map((report, i) => {
                  const cfg = STATUS_CONFIG[report.status]
                  return (
                    <div key={report.id || i} className="px-4 py-3 flex items-start gap-3">
                      {/* Status dot */}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                        report.status === 'macet' ? 'bg-signal-red pulse-red' :
                        report.status === 'padat' ? 'bg-signal-yellow' :
                        'bg-signal-green'
                      }`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-mono font-500 text-gray-300">{report.kecamatan_nama}</span>
                            <span className={`ml-2 text-xs ${cfg?.text} font-mono`}>· {cfg?.label}</span>
                          </div>
                          <span className="text-xs text-gray-600 font-mono flex-shrink-0">
                            {report.created_at ? timeAgo(report.created_at) : 'baru'}
                          </span>
                        </div>

                        {report.deskripsi && (
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{report.deskripsi}</p>
                        )}

                        {/* Foto */}
                        {report.foto_url && (
                          <button onClick={() => setFotoModal(report.foto_url)}
                            className="mt-2 block">
                            <img
                              src={report.foto_url}
                              alt="Foto laporan"
                              className="w-full max-h-40 object-cover rounded-xl border border-asphalt-600"
                            />
                          </button>
                        )}

                        {/* Lokasi & pelapor */}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <p className="text-xs text-gray-700 font-mono">
                            oleh {report.nama_pelapor || 'Anonim'}
                          </p>
                          {report.latitude && report.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-600 hover:text-gray-400 font-mono flex items-center gap-1 transition-colors"
                            >
                              📍 Lihat lokasi
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal foto fullscreen */}
      {fotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setFotoModal(null)}
        >
          <img
            src={fotoModal}
            alt="Foto laporan"
            className="max-w-full max-h-full rounded-2xl object-contain"
          />
          <button
            onClick={() => setFotoModal(null)}
            className="absolute top-4 right-4 w-9 h-9 bg-asphalt-800 border border-asphalt-600 rounded-full text-gray-300 flex items-center justify-center text-lg"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}