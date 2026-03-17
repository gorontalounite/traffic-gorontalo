import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const isConfigured = supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey && supabaseAnonKey.length > 10
const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

async function fetchKnowledge() {
  if (!supabase) return ''
  try {
    const { data } = await supabase.from('rag_knowledge').select('category, title, content').order('created_at', { ascending: false }).limit(20)
    if (!data || data.length === 0) return ''
    return data.map(k => `[${k.title}]: ${k.content}`).join('\n\n')
  } catch (e) { return '' }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { message, context } = req.body
  if (!message) return res.status(400).json({ error: 'Message is required' })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'YOUR_ANTHROPIC_API_KEY_HERE') {
    return res.status(200).json({ reply: getFallbackResponse(message), fallback: true })
  }
  const knowledge = await fetchKnowledge()
  try {
    const systemPrompt = `Kamu adalah asisten pemantauan lalu lintas untuk Kabupaten Gorontalo, area Kampung Jawa dan sekitarnya, mencakup 6 kecamatan: Limboto, Limboto Barat, Tibawa, Bongomeme, Dungaliyo, dan Pulubala.\n\n${knowledge ? `KNOWLEDGE BASE:\n${knowledge}\n\n` : ''}${context ? `LAPORAN LAPANGAN TERKINI:\n${context}\n\n` : ''}PANDUAN: Jawab Bahasa Indonesia ramah dan singkat (max 4-5 kalimat). UTAMAKAN info dari Knowledge Base. Gunakan emoji 🟢🟡🔴🚗.`
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 500, system: systemPrompt, messages: [{ role: 'user', content: message }] }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'API error')
    return res.status(200).json({ reply: data.content[0].text, fallback: false })
  } catch (error) {
    return res.status(200).json({ reply: getFallbackResponse(message), fallback: true })
  }
}

function getFallbackResponse(message) {
  const msg = message.toLowerCase()
  if (msg.includes('limboto')) return '📍 Kec. Limboto adalah pusat Kabupaten Gorontalo. Biasanya padat di jam pagi (07-09) dan sore (16-18).'
  if (msg.includes('macet') || msg.includes('padat')) return '🔴 Cek traffic layer di peta untuk info kemacetan terkini.'
  return '🚦 Halo! Tanyakan kondisi di kecamatan mana? Limboto, Limboto Barat, Tibawa, Bongomeme, Dungaliyo, atau Pulubala?'
}
