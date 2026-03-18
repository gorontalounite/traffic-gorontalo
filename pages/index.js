import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { supabase } from '../lib/supabase'
import AlertBanner from '../components/AlertBanner'
import ChatPanel from '../components/ChatPanel'
import MapView from '../components/MapView'
import ReportForm from '../components/ReportForm'
import ReportHistory from '../components/ReportHistory'
import ThemeToggle from '../components/ThemeToggle'

export default function Home() {
  const [reports, setReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [selectedKec, setSelectedKec] = useState(null)
  const [localReports, setLocalReports] = useState([])
  const [zoomTarget, setZoomTarget] = useState(null)
  const [routeData, setRouteData] = useState(null)

  const fetchReports = async () => {
    if (!supabase) { setLoadingReports(false); return }
    try {
      const { data, error } = await supabase
        .from('laporan_lalu_lintas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (!error && data) setReports(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => {
    fetchReports()
    if (!supabase) return
    const channel = supabase
      .channel('laporan-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'laporan_lalu_lintas' }, (payload) => {
        setReports((prev) => [payload.new, ...prev])
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const handleReportSubmitted = (report) => {
    if (!supabase) {
      const demoReport = { ...report, id: Date.now().toString(), created_at: new Date().toISOString() }
      setLocalReports((prev) => [demoReport, ...prev])
    } else {
      fetchReports()
    }
  }

  const allReports = [...localReports, ...reports]

  return (
    <>
      <Head>
        <title>Arus Lalu Lintas Kampung Jawa - Kab. Gorontalo</title>
      </Head>

      <div className="min-h-screen bg-asphalt-900">
        <header className="sticky top-0 z-50 bg-asphalt-900/95 backdrop-blur border-b border-asphalt-700">
          <div className="max-w-lg mx-auto px-4 py-2.5">
            <div className="flex items-center justify-between">
              {/* Logo kiri */}
              <div className="flex items-center gap-1.5">
                <Image src="/LogoPoldaGTO.png" alt="Polda Gorontalo" width={34} height={34} className="object-contain" />
                <Image src="/LogoSatlantas.png" alt="Satlantas" width={30} height={30} className="object-contain" />
              </div>
              {/* Logo kanan + toggle */}
              <div className="flex items-center gap-1.5">
                <Image src="/LogoGorontaloUnite.png" alt="Gorontalo Unite" width={34} height={34} className="object-contain rounded-full" />
                <ThemeToggle />
              </div>
            </div>
          </div>
          {/* Title di bawah logo, di atas divider */}
          <div className="max-w-lg mx-auto px-4 pb-2.5 text-center">
            <p className="text-xs font-display font-700 text-gray-300 uppercase tracking-widest">
              Info Rute Lalu Lintas di Kampung Jawa
            </p>
          </div>
          <div className="road-divider" />
        </header>

        <main className="max-w-lg mx-auto pt-4">
          <AlertBanner reports={allReports} />
          <ChatPanel
            reports={allReports}
            onZoomLocation={setZoomTarget}
            onRouteFound={setRouteData}
          />
          <MapView
            reports={allReports}
            selectedKec={selectedKec}
            onSelectKec={setSelectedKec}
            zoomTarget={zoomTarget}
            routeData={routeData}
          />
          <ReportForm onReportSubmitted={handleReportSubmitted} />
          <ReportHistory reports={allReports} loading={loadingReports} />

          <footer className="px-4 pb-8 text-center">
            <div className="road-divider mb-4" />
            <p className="text-xs text-gray-700 font-mono">Arus Lalu Lintas Kampung Jawa · Kab. Gorontalo</p>
            <p className="text-xs text-gray-800 font-mono mt-1">Limboto · Limboto Barat · Tibawa · Bongomeme · Dungaliyo · Pulubala</p>
          </footer>
        </main>
      </div>
    </>
  )
}