import { useState, useEffect } from 'react'
import { STATUS_CONFIG } from '../lib/supabase'

export default function AlertBanner({ reports }) {
  const [visible, setVisible] = useState(false)
  const [macetAreas, setMacetAreas] = useState([])

  useEffect(() => {
    if (!reports || reports.length === 0) return

    // Get latest report per kecamatan
    const latestPerKec = {}
    reports.forEach((r) => {
      if (!latestPerKec[r.kecamatan_id]) {
        latestPerKec[r.kecamatan_id] = r
      }
    })

    const macet = Object.values(latestPerKec).filter((r) => r.status === 'macet')
    setMacetAreas(macet)
    setVisible(macet.length > 0)
  }, [reports])

  if (!visible) return null

  return (
    <div className="slide-in-up mx-4 mb-3">
      <div className="relative rounded-xl border border-signal-red/40 bg-signal-red/10 px-4 py-3 overflow-hidden">
        {/* Animated left bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-signal-red pulse-red rounded-l-xl" />

        <div className="flex items-start gap-3 pl-2">
          <span className="text-xl mt-0.5 flex-shrink-0">🚨</span>
          <div className="flex-1 min-w-0">
            <p className="font-display font-700 text-signal-red text-sm tracking-wide uppercase mb-1">
              Alert Kemacetan
            </p>
            <div className="flex flex-wrap gap-2">
              {macetAreas.map((area) => (
                <span
                  key={area.kecamatan_id}
                  className="text-xs bg-signal-red/20 text-signal-red border border-signal-red/30 rounded-full px-2.5 py-0.5 font-mono"
                >
                  {area.kecamatan_nama}
                </span>
              ))}
            </div>
            <p className="text-xs text-red-300/70 mt-1.5">
              Berdasarkan laporan lapangan terbaru
            </p>
          </div>

          <button
            onClick={() => setVisible(false)}
            className="text-signal-red/60 hover:text-signal-red transition-colors flex-shrink-0 text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
