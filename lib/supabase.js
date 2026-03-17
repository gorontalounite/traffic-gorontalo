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
  { id: 'limboto',       name: 'Kec. Limboto',       lat: 0.6301657009314829,  lng: 122.97928492479973 },
  { id: 'limboto_barat', name: 'Kec. Limboto Barat', lat: 0.6389398227435965,  lng: 122.92649724314322 },
  { id: 'tibawa',        name: 'Kec. Tibawa',         lat: 0.6497620963875474,  lng: 122.85773179073381 },
  { id: 'bongomeme',     name: 'Kec. Bongomeme',      lat: 0.5949341085735593,  lng: 122.86589916947791 },
  { id: 'dungaliyo',     name: 'Kec. Dungaliyo',      lat: 0.6050097357065691,  lng: 122.88633397793987 },
  { id: 'pulubala',      name: 'Kec. Pulubala',       lat: 0.6513612898641359,  lng: 122.80153088295974 },
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