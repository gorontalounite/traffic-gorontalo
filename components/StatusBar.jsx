import { KECAMATAN_LIST, STATUS_CONFIG } from '../lib/supabase'

export default function StatusBar({ reports, onSelectKec }) {
  const getLatestStatus = (kecId) => {
    if (!reports || reports.length === 0) return null
    const found = reports.find((r) => r.kecamatan_id === kecId)
    return found ? found.status : null
  }

  return (
    <div className="px-4 mb-4">
      <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-2">
        Status Lapangan
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {KECAMATAN_LIST.map((kec) => {
          const status = getLatestStatus(kec.id)
          const cfg = status ? STATUS_CONFIG[status] : null

          return (
            <button
              key={kec.id}
              onClick={() => onSelectKec && onSelectKec(kec)}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-xs font-mono transition-all cursor-pointer hover:opacity-80 active:scale-95 ${
                cfg
                  ? `${cfg.bg} ${cfg.border} ${cfg.text}`
                  : 'bg-asphalt-700 border-asphalt-600 text-gray-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  cfg
                    ? status === 'macet'
                      ? 'pulse-red bg-signal-red'
                      : status === 'padat'
                      ? 'pulse-yellow bg-signal-yellow'
                      : 'bg-signal-green'
                    : 'bg-gray-600'
                }`}
              />
              <span className="whitespace-nowrap">
                {kec.name.replace('Kec. ', '')}
              </span>
              {cfg && (
                <span className="opacity-70">· {cfg.label}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}