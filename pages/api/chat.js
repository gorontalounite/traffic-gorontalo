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

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return res.status(200).json({ reply: getFallbackResponse(message), fallback: true })
  }

  const knowledge = await fetchKnowledge()

  try {
    const systemPrompt = `Kamu adalah asisten pemantauan lalu lintas untuk Kabupaten Gorontalo, area Kampung Jawa dan sekitarnya, mencakup 6 kecamatan: Limboto, Limboto Barat, Tibawa, Bongomeme, Dungaliyo, dan Pulubala.
    ${knowledge ? `KNOWLEDGE BASE:\n${knowledge}\n\n` : ''}${context ? `LAPORAN LAPANGAN TERKINI:\n${context}\n\n` : ''}PANDUAN: Jawab seperti orang asli Gorontalo yang ramah dan santai — pakai bahasa sehari-hari, boleh campur sedikit logat lokal. Singkat dan to the point (2-3 kalimat), jangan bertele-tele. Kalau ada info dari Knowledge Base, sampaikan dengan natural seolah kamu tahu sendiri. Gunakan emoji 🟢🟡🔴🚗 secukupnya, jangan berlebihan.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
        }),
      }
    )

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'Gemini API error')

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!reply) throw new Error('Empty response from Gemini')

    return res.status(200).json({ reply, fallback: false })
  } catch (error) {
    console.error('Chat API error:', error.message)
    return res.status(200).json({ reply: getFallbackResponse(message), fallback: true })
  }
}

function getFallbackResponse(message) {
  const msg = message.toLowerCase()
  if (msg.includes('limboto')) return '📍 Kec. Limboto adalah pusat Kabupaten Gorontalo. Biasanya padat di jam pagi (07-09) dan sore (16-18).'
  if (msg.includes('macet') || msg.includes('padat')) return '🔴 Cek traffic layer di peta untuk info kemacetan terkini.'
  return '🚦 Halo! Tanyakan kondisi di kecamatan mana? Limboto, Limboto Barat, Tibawa, Bongomeme, Dungaliyo, atau Pulubala?'
}