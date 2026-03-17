import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isConfigured =
  supabaseUrl &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey &&
  supabaseAnonKey.length > 10

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const KECAMATAN_LIST = [
  { id: 'limboto',       name: 'Kec. Limboto',       lat: 0.5773, lng: 122.9861 },
  { id: 'limboto_barat', name: 'Kec. Limboto Barat', lat: 0.5614, lng: 122.9497 },
  { id: 'tibawa',        name: 'Kec. Tibawa',         lat: 0.5948, lng: 122.9403 },
  { id: 'bongomeme',     name: 'Kec. Bongomeme',      lat: 0.6177, lng: 122.9208 },
  { id: 'dungaliyo',     name: 'Kec. Dungaliyo',      lat: 0.5500, lng: 122.9700 },
  { id: 'pulubala',      name: 'Kec. Pulubala',       lat: 0.5333, lng: 122.8833 },
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