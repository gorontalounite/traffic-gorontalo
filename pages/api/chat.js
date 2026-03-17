import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const isSupabaseConfigured = supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey && supabaseAnonKey.length > 10
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

async function fetchKnowledge(question) {
  if (!supabase) return ''
  try {
    const stopWords = ['apa','siapa','berapa','bagaimana','dimana','kapan','kenapa','yang','di','ke','dari','dan','atau','ini','itu','ada','untuk','dengan','adalah','pada','juga','sudah','akan','bisa','kami','kita','saya','mereka','nya']
    const keywords = question.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(w => w.length > 3 && !stopWords.includes(w))
      .slice(0, 5)

    if (keywords.length === 0) {
      const { data } = await supabase
        .from('rag_knowledge')
        .select('judul, konten')
        .eq('aktif', true)
        .order('created_at', { ascending: false })
        .limit(5) // ✅ limit 5
      return data?.map(k => `[${k.judul}]: ${k.konten.substring(0, 300)}`).join('\n\n') || ''
    }

    const searchQuery = keywords.join(' | ')
    const { data } = await supabase
      .from('rag_knowledge')
      .select('judul, konten')
      .eq('aktif', true)
      .textSearch('konten', searchQuery, { type: 'websearch', config: 'indonesian' })
      .limit(5) // ✅ limit 5

    if (!data || data.length === 0) {
      const likePromises = keywords.slice(0, 3).map(kw =>
        supabase.from('rag_knowledge').select('judul, konten').eq('aktif', true).ilike('konten', `%${kw}%`).limit(3) // ✅ limit 3
      )
      const results = await Promise.all(likePromises)
      const combined = results.flatMap(r => r.data || [])
      const unique = Array.from(new Map(combined.map(k => [k.judul, k])).values()).slice(0, 5) // ✅ slice 5
      return unique.map(k => `[${k.judul}]: ${k.konten.substring(0, 300)}`).join('\n\n') || ''
    }

    return data.map(k => `[${k.judul}]: ${k.konten.substring(0, 300)}`).join('\n\n')
  } catch (e) {
    console.error('fetchKnowledge error:', e)
    return ''
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { message, context } = req.body
  if (!message) return res.status(400).json({ error: 'Message is required' })

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return res.status(200).json({ reply: getFallbackResponse(message), fallback: true })

  const knowledge = await fetchKnowledge(message)

  const systemPrompt = `Kamu adalah asisten informasi KHUSUS untuk website Lalu Lintas Kabupaten Gorontalo. Kamu HANYA menjawab berdasarkan informasi yang ada di Knowledge Base di bawah ini.

${knowledge ? `KNOWLEDGE BASE:\n${knowledge}\n\n` : ''}${context ? `LAPORAN LAPANGAN TERKINI:\n${context}\n\n` : ''}ATURAN WAJIB:
- HANYA gunakan informasi dari Knowledge Base di atas untuk menjawab.
- Jika pertanyaan TIDAK ADA dalam Knowledge Base, jawab: "Maaf, saya tidak punya informasi tentang itu. Silakan tanya seputar lalu lintas atau info Kabupaten Gorontalo."
- DILARANG mengarang, mengira-ngira, atau menggunakan pengetahuan di luar Knowledge Base.
- Jawab singkat 2-3 kalimat, bahasa Indonesia santai.
- Gunakan emoji 🟢🟡🔴 secukupnya.`

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
        temperature: 0.5,
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