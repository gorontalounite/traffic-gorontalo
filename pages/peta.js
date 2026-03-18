import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import MapView from '../components/MapView'

export default function Peta() {
  const [reports, setReports] = useState([])
  const [selectedKec, setSelectedKec] = useState(null)
  const [zoomTarget, setZoomTarget] = useState(null)
  const [routeData, setRouteData] = useState(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('peta_rute')
    if (saved) {
      try {
        setRouteData(JSON.parse(saved))
        sessionStorage.removeItem('peta_rute')
      } catch (e) {}
    }

    if (!supabase) return
    supabase
      .from('laporan_lalu_lintas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => { if (data) setReports(data) })
  }, [])

  return (
    <>
      <Head>
        <title>Peta Lalu Lintas · Kab. Gorontalo</title>
      </Head>

      <div className="min-h-screen bg-asphalt-900 flex flex-col">
        <header className="sticky top-0 z-50 bg-asphalt-900/95 backdrop-blur border-b border-asphalt-700">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <p className="text-xs font-display font-700 text-gray-300 uppercase tracking-widest">
              🗺️ Peta Lalu Lintas
            </p>
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 font-mono border border-asphalt-600 rounded-full px-3 py-1.5 transition-colors">
              ← Kembali
            </Link>
          </div>
          <div className="road-divider" />
        </header>

        <main className="flex-1 max-w-lg mx-auto w-full pt-4 pb-4">
          <MapView
            reports={reports}
            selectedKec={selectedKec}
            onSelectKec={setSelectedKec}
            zoomTarget={zoomTarget}
            routeData={routeData}
            fullscreen={true}
          />
        </main>
      </div>
    </>
  )
}