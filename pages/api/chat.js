import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const isSupabaseConfigured = supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey && supabaseAnonKey.length > 10
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

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

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return res.status(200).json({ reply: getFallbackResponse(message), fallback: true })

  const knowledge = await fetchKnowledge()

  const systemPrompt = `Kamu adalah asisten pemantauan lalu lintas untuk Kabupaten Gorontalo, area Kampung Jawa dan sekitarnya, mencakup 6 kecamatan: Limboto, Limboto Barat, Tibawa, Bongomeme, Dungaliyo, dan Pulubala.

${knowledge ? `KNOWLEDGE BASE:\n${knowledge}\n\n` : ''}${context ? `LAPORAN LAPANGAN TERKINI:\n${context}\n\n` : ''}PANDUAN: Jawab seperti orang Gorontalo yang ramah dan santai, bahasa sehari-hari, singkat 2-3 kalimat. Kalau ada info dari Knowledge Base, sampaikan dengan natural. Gunakan emoji 🟢🟡🔴🚗 secukupnya.`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error')

    const reply = data.choices?.[0]?.message?.content
    if (!reply) throw new Error('Empty response')

    return res.status(200).json({ reply, fallback: false })
  } catch (error) {
    console.error('Chat error:', error.message)
    return res.status(200).json({ reply: getFallbackResponse(message), fallback: true })
  }
}

function getFallbackResponse(message) {
  const msg = message.toLowerCase()
  if (msg.includes('limboto')) return '📍 Kec. Limboto adalah pusat Kabupaten Gorontalo. Biasanya padat di jam pagi (07-09) dan sore (16-18).'
  if (msg.includes('macet') || msg.includes('padat')) return '🔴 Cek traffic layer di peta untuk info kemacetan terkini.'
  return '🚦 Halo! Tanyakan kondisi di kecamatan mana? Limboto, Limboto Barat, Tibawa, Bongomeme, Dungaliyo, atau Pulubala?'
}