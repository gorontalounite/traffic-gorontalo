import { useState } from 'react'
import { KECAMATAN_LIST } from '../lib/supabase'

const MAP_CENTER = { lat: 0.5660, lng: 122.9987 }
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export default function MapView({ reports, selectedKec, onSelectKec }) {
  const [mapType, setMapType] = useState('roadmap')
  const hasApiKey = API_KEY && API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE'

  const getKecStatus = (kecId) => {
    if (!reports || reports.length === 0) return null
    const found = reports.find((r) => r.kecamatan_id === kecId)
    return found ? found.status : null
  }

  const statusColor = { lancar: '#00e676', padat: '#ffea00', macet: '#ff1744' }

  // Build Google Maps embed URL with traffic layer
  const buildMapUrl = () => {
    const center = selectedKec
      ? KECAMATAN_LIST.find((k) => k.id === selectedKec)
      : null
    const lat = center?.lat || MAP_CENTER.lat
    const lng = center?.lng || MAP_CENTER.lng
    const zoom = selectedKec ? 15 : 13

    if (hasApiKey) {
      return `https://www.google.com/maps/embed/v1/view?key=${API_KEY}&center=${lat},${lng}&zoom=${zoom}&maptype=${mapType}`
    }

    // Fallback: OpenStreetMap via iframe (no key needed)
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.08}%2C${lat - 0.06}%2C${lng + 0.08}%2C${lat + 0.06}&layer=mapnik&marker=${lat}%2C${lng}`
  }

  const openFullMap = () => {
    const center = selectedKec
      ? KECAMATAN_LIST.find((k) => k.id === selectedKec)
      : null
    const lat = center?.lat || MAP_CENTER.lat
    const lng = center?.lng || MAP_CENTER.lng
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&layer=transit`,
      '_blank'
    )
  }

  return (
    <div className="mx-4 mb-4">
      {/* Section label */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
          Peta Lalu Lintas
        </p>
        {!hasApiKey && (
          <span className="text-xs bg-signal-yellow/10 text-signal-yellow border border-signal-yellow/20 rounded-full px-2.5 py-0.5 font-mono">
            OpenStreetMap Mode
          </span>
        )}
      </div>

      {/* Kecamatan selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
        <button
          onClick={() => onSelectKec(null)}
          className={`flex-shrink-0 text-xs rounded-full px-3 py-1.5 border transition-all font-mono ${
            !selectedKec
              ? 'bg-asphalt-600 border-asphalt-500 text-gray-200'
              : 'bg-asphalt-800 border-asphalt-600 text-gray-500 hover:text-gray-300'
          }`}
        >
          Semua
        </button>
        {KECAMATAN_LIST.map((kec) => {
          const status = getKecStatus(kec.id)
          const color = status ? statusColor[status] : null

          return (
            <button
              key={kec.id}
              onClick={() => onSelectKec(kec.id === selectedKec ? null : kec.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border transition-all font-mono whitespace-nowrap ${
                selectedKec === kec.id
                  ? 'bg-asphalt-600 border-asphalt-500 text-gray-200'
                  : 'bg-asphalt-800 border-asphalt-600 text-gray-500 hover:text-gray-300'
              }`}
            >
              {color && (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
              )}
              {kec.name.replace('Kec. ', '')}
            </button>
          )
        })}
      </div>

      {/* Map container */}
      <div className="rounded-2xl overflow-hidden border border-asphalt-600 relative">
        <iframe
          src={buildMapUrl()}
          width="100%"
          height="300"
          style={{ border: 0, display: 'block' }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Peta Lalu Lintas Kabupaten Gorontalo"
        />

        {/* Map overlay controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
          {hasApiKey && (
            <button
              onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
              className="bg-asphalt-800/90 backdrop-blur border border-asphalt-600 text-gray-300 text-xs rounded-lg px-2.5 py-1.5 hover:bg-asphalt-700 transition-all font-mono"
            >
              {mapType === 'roadmap' ? '🛰️ Satelit' : '🗺️ Jalan'}
            </button>
          )}
          <button
            onClick={openFullMap}
            className="bg-asphalt-800/90 backdrop-blur border border-asphalt-600 text-gray-300 text-xs rounded-lg px-2.5 py-1.5 hover:bg-asphalt-700 transition-all font-mono"
          >
            📍 Buka Maps
          </button>
        </div>

        {/* Traffic layer note (only when Google Maps) */}
        {hasApiKey && (
          <div className="absolute top-3 left-3">
            <div className="bg-asphalt-800/90 backdrop-blur border border-asphalt-600 rounded-lg px-2.5 py-1.5">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-1 rounded bg-signal-green inline-block" />
                  Lancar
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-1 rounded bg-signal-yellow inline-block" />
                  Padat
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-1 rounded bg-signal-red inline-block" />
                  Macet
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!hasApiKey && (
        <p className="text-xs text-gray-600 mt-2 text-center font-mono">
          Tambahkan Google Maps API key untuk traffic layer real-time
        </p>
      )}
    </div>
  )
}
