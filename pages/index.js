import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import AlertBanner from '../components/AlertBanner'
import StatusBar from '../components/StatusBar'
import ChatPanel from '../components/ChatPanel'
import MapView from '../components/MapView'
import ReportForm from '../components/ReportForm'
import ReportHistory from '../components/ReportHistory'

export default function Home() {
  const [reports, setReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [selectedKec, setSelectedKec] = useState(null)
  const [localReports, setLocalReports] = useState([])

  const fetchReports = async () => {
    if (!supabase) {
      setLoadingReports(false)
      return
    }
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
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'laporan_lalu_lintas' },
        (payload) => {
          setReports((prev) => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const handleReportSubmitted = (report) => {
    if (!supabase) {
      const demoReport = {
        ...report,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      }
      setLocalReports((prev) => [demoReport, ...prev])
    } else {
      fetchReports()
    }
  }

  const allReports = [...localReports, ...reports]

  return (
    <>
      <Head>
        <title>Lalu Lintas Kabupaten Gorontalo</title>
      </Head>

      <div className="min-h-screen bg-asphalt-900">
        <header className="sticky top-0 z-50 bg-asphalt-900/95 backdrop-blur border-b border-asphalt-700">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-asphalt-700 border border-asphalt-600 flex items-center justify-center text-base">
                  🚦
                </div>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-signal-green rounded-full border-2 border-asphalt-900 pulse-green" />
              </div>
              <div>
                <h1 className="font-display font-700 text-sm text-gray-100 leading-tight">
                  Lalu Lintas
                </h1>
                <p className="text-xs text-gray-600 font-mono leading-tight">
                  Kab. Gorontalo · Live
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-asphalt-800 border border-asphalt-600 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-green pulse-green" />
                <span className="text-xs font-mono text-gray-400">
                  {allReports.length} laporan
                </span>
              </div>
            </div>
          </div>

          <div className="road-divider" />
        </header>

        <main className="max-w-lg mx-auto pt-4">
          <AlertBanner reports={allReports} />
          <StatusBar reports={allReports} />
          <ChatPanel reports={allReports} />
          <MapView
            reports={allReports}
            selectedKec={selectedKec}
            onSelectKec={setSelectedKec}
          />
          <ReportForm onReportSubmitted={handleReportSubmitted} />
          <ReportHistory reports={allReports} loading={loadingReports} />

          <footer className="px-4 pb-8 text-center">
            <div className="road-divider mb-4" />
            <p className="text-xs text-gray-700 font-mono">
              Lalu Lintas Kab. Gorontalo · Data crowd-sourced
            </p>
            <p className="text-xs text-gray-800 font-mono mt-1">
              Limboto · Limboto Barat · Tibawa · Bongomeme · Dungaliyo · Pulubala
            </p>
          </footer>
        </main>
      </div>
    </>
  )
}
