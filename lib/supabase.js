import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-not-configured'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const KECAMATAN_LIST = [
  { id: 'limboto', name: 'Kec. Limboto', lat: -0.6134, lng: 122.9992 },
  { id: 'limboto_barat', name: 'Kec. Limboto Barat', lat: -0.6400, lng: 122.9650 },
  { id: 'tibawa', name: 'Kec. Tibawa', lat: -0.6200, lng: 123.0400 },
  { id: 'bongomeme', name: 'Kec. Bongomeme', lat: -0.5800, lng: 123.0800 },
  { id: 'dungaliyo', name: 'Kec. Dungaliyo', lat: -0.6500, lng: 123.0200 },
  { id: 'pulubala', name: 'Kec. Pulubala', lat: -0.7000, lng: 122.9800 },
]

export const STATUS_CONFIG = {
  lancar: {
    label: 'Lancar',
    color: 'signal-green',
    bg: 'bg-signal-green/10',
    border: 'border-signal-green/30',
    text: 'text-signal-green',
    dot: '#00e676',
    emoji: '🟢',
  },
  padat: {
    label: 'Padat',
    color: 'signal-yellow',
    bg: 'bg-signal-yellow/10',
    border: 'border-signal-yellow/30',
    text: 'text-signal-yellow',
    dot: '#ffea00',
    emoji: '🟡',
  },
  macet: {
    label: 'Macet Total',
    color: 'signal-red',
    bg: 'bg-signal-red/10',
    border: 'border-signal-red/30',
    text: 'text-signal-red',
    dot: '#ff1744',
    emoji: '🔴',
  },
}
