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

  useEffect(() => {
    if (!hasApiKey) return
    if (window.google?.maps) { setMapsLoaded(true); return }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=geometry`
    script.async = true
    script.onload = () => setMapsLoaded(true)
    document.head.appendChild(script)
  }, [])

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

  useEffect(() => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.setMapTypeId(mapType)
  }, [mapType])

  useEffect(() => {
    if (!mapInstanceRef.current || !zoomTarget) return
    mapInstanceRef.current.panTo({ lat: zoomTarget.lat, lng: zoomTarget.lng })
    mapInstanceRef.current.setZoom(16)
  }, [zoomTarget])

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
  }, [routeData, mapsLoaded])

  return (
    <div className="mx-4 mb-4">
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
        </div>
      </div>
    </div>
  )
}