import { useState, useEffect, useRef } from 'react'
import { KECAMATAN_LIST } from '../lib/supabase'

const MAP_CENTER = { lat: 0.6284, lng: 122.8918 }
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export default function MapView({ reports, selectedKec, onSelectKec, zoomTarget, routeData, fullscreen = false }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const directionsRendererRef = useRef(null)
  const [mapType, setMapType] = useState('roadmap')
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const hasApiKey = API_KEY && API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE'

  const statusColor = { lancar: '#00e676', padat: '#ffea00', macet: '#ff1744' }

  const getKecStatus = (kecId) => {
    if (!reports || reports.length === 0) return null
    const found = reports.find((r) => r.kecamatan_id === kecId)
    return found ? found.status : null
  }

  // Load Google Maps JS API sekali
  useEffect(() => {
    if (!hasApiKey) return
    if (window.google?.maps) { setMapsLoaded(true); return }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=geometry`
    script.async = true
    script.onload = () => setMapsLoaded(true)
    document.head.appendChild(script)
  }, [])

  // Init peta setelah API loaded
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstanceRef.current) return

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: MAP_CENTER,
      zoom: 13,
      mapTypeId: mapType,
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
    })

    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#00e676',
        strokeWeight: 5,
        strokeOpacity: 0.9,
      },
    })
    directionsRendererRef.current.setMap(mapInstanceRef.current)
  }, [mapsLoaded])

  // Update mapType
  useEffect(() => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.setMapTypeId(mapType)
  }, [mapType])

  // Zoom ke target kalau ada
  useEffect(() => {
    if (!mapInstanceRef.current || !zoomTarget) return
    mapInstanceRef.current.panTo({ lat: zoomTarget.lat, lng: zoomTarget.lng })
    mapInstanceRef.current.setZoom(16)
  }, [zoomTarget])

  // Tampilkan rute kalau ada routeData
  useEffect(() => {
    if (!mapInstanceRef.current || !directionsRendererRef.current || !routeData) return

    const directionsService = new window.google.maps.DirectionsService()
    directionsService.route({
      origin: { lat: routeData.asal.lat, lng: routeData.asal.lng },
      destination: { lat: routeData.tujuan.lat, lng: routeData.tujuan.lng },
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(result)
      }
    })
  }, [routeData])

  const openFullMap = () => {
    const target = zoomTarget || (selectedKec ? KECAMATAN_LIST.find((k) => k.id === selectedKec) : null)
    const lat = target?.lat || MAP_CENTER.lat
    const lng = target?.lng || MAP_CENTER.lng
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
  }

  return (
    <div className="mx-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Peta Lalu Lintas</p>
        {!hasApiKey && (
          <span className="text-xs bg-signal-yellow/10 text-signal-yellow border border-signal-yellow/20 rounded-full px-2.5 py-0.5 font-mono">
            No API Key
          </span>
        )}
      </div>

      {/* Kecamatan selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
        <button
          onClick={() => onSelectKec(null)}
          className={`flex-shrink-0 text-xs rounded-full px-3 py-1.5 border transition-all font-mono ${
            !selectedKec ? 'bg-asphalt-600 border-asphalt-500 text-gray-200' : 'bg-asphalt-800 border-asphalt-600 text-gray-500 hover:text-gray-300'
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
              onClick={() => {
                onSelectKec(kec.id === selectedKec ? null : kec.id)
                if (mapInstanceRef.current && kec.lat) {
                  mapInstanceRef.current.panTo({ lat: kec.lat, lng: kec.lng })
                  mapInstanceRef.current.setZoom(14)
                }
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border transition-all font-mono whitespace-nowrap ${
                selectedKec === kec.id ? 'bg-asphalt-600 border-asphalt-500 text-gray-200' : 'bg-asphalt-800 border-asphalt-600 text-gray-500 hover:text-gray-300'
              }`}
            >
              {color && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />}
              {kec.name.replace('Kec. ', '')}
            </button>
          )
        })}
      </div>

      {/* Map container */}
      <div className="rounded-2xl overflow-hidden border border-asphalt-600 relative">
        {hasApiKey ? (
          <div ref={mapRef} style={{ width: '100%', height: fullscreen ? 'calc(100vh - 140px)' : '300px' }} />
        ) : (
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${MAP_CENTER.lng - 0.08}%2C${MAP_CENTER.lat - 0.06}%2C${MAP_CENTER.lng + 0.08}%2C${MAP_CENTER.lat + 0.06}&layer=mapnik`}
            width="100%" height="300"
            style={{ border: 0, display: 'block' }}
            title="Peta Lalu Lintas"
          />
        )}

        {/* Controls */}
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

        {/* Legend */}
        {hasApiKey && (
          <div className="absolute top-3 left-3">
            <div className="bg-asphalt-800/90 backdrop-blur border border-asphalt-600 rounded-lg px-2.5 py-1.5">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-1 rounded bg-signal-green inline-block" />Lancar</span>
                <span className="flex items-center gap-1"><span className="w-2 h-1 rounded bg-signal-yellow inline-block" />Padat</span>
                <span className="flex items-center gap-1"><span className="w-2 h-1 rounded bg-signal-red inline-block" />Macet</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}