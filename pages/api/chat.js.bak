export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, context } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey || apiKey === 'YOUR_ANTHROPIC_API_KEY_HERE') {
    // Fallback response when API key not configured
    return res.status(200).json({
      reply: getFallbackResponse(message, context),
      fallback: true,
    })
  }

  try {
    const systemPrompt = `Kamu adalah asisten pemantauan lalu lintas untuk Kabupaten Gorontalo, khususnya 6 kecamatan: Limboto, Limboto Barat, Tibawa, Bongomeme, Dungaliyo, dan Pulubala.

Tugasmu adalah membantu pengguna mendapatkan informasi kondisi lalu lintas di kecamatan-kecamatan tersebut.

Data laporan lapangan terkini:
${context || 'Belum ada laporan lapangan masuk.'}

Panduan menjawab:
- Jawab dalam Bahasa Indonesia yang ramah dan informatif
- Jika ada laporan, rangkum kondisi per kecamatan
- Sarankan alternatif rute jika ada kemacetan
- Jika tidak ada data, ingatkan pengguna untuk cek traffic layer di peta
- Jawaban singkat dan to the point (max 3-4 kalimat)
- Gunakan emoji lalu lintas untuk memperindah respon (🟢🟡🔴🚗)`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Anthropic API error')
    }

    return res.status(200).json({
      reply: data.content[0].text,
      fallback: false,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return res.status(200).json({
      reply: getFallbackResponse(message, context),
      fallback: true,
    })
  }
}

function getFallbackResponse(message, context) {
  const msg = message.toLowerCase()

  if (msg.includes('limboto barat')) {
    return '📍 Untuk kondisi Kec. Limboto Barat, silakan cek traffic layer di peta bawah atau lihat riwayat laporan lapangan terbaru. Kamu juga bisa submit laporan jika sedang berada di lokasi.'
  }
  if (msg.includes('limboto')) {
    return '📍 Kec. Limboto adalah pusat Kabupaten Gorontalo. Biasanya padat di jam pagi (07-09) dan sore (16-18). Cek peta untuk kondisi real-time.'
  }
  if (msg.includes('tibawa')) {
    return '📍 Kec. Tibawa umumnya lancar. Pantau peta untuk update terkini, terutama di jalur menuju Gorontalo Kota.'
  }
  if (msg.includes('bongomeme')) {
    return '📍 Kec. Bongomeme biasanya kondisi normal. Laporan lapangan bisa membantu jika ada insiden mendadak.'
  }
  if (msg.includes('dungaliyo')) {
    return '📍 Kec. Dungaliyo — cek traffic layer di peta untuk kondisi terkini ya!'
  }
  if (msg.includes('pulubala')) {
    return '📍 Kec. Pulubala — area ini relatif jarang macet. Pantau peta untuk memastikan.'
  }
  if (msg.includes('macet') || msg.includes('padat')) {
    return '🔴 Untuk info kemacetan terkini, cek: 1) Traffic layer di peta (warna merah = macet), 2) Riwayat laporan di bawah. Kamu bisa bantu komunitas dengan submit laporan dari lokasi!'
  }
  if (msg.includes('lancar')) {
    return '🟢 Untuk memastikan kondisi lancar, lihat traffic layer di peta — area hijau menandakan kondisi lancar. Laporan lapangan juga membantu!'
  }

  return '🚦 Halo! Saya asisten lalu lintas Kabupaten Gorontalo. Tanyakan kondisi di kecamatan mana yang ingin kamu ketahui: Limboto, Limboto Barat, Tibawa, Bongomeme, Dungaliyo, atau Pulubala? Untuk akurasi terbaik, aktifkan API key di pengaturan.'
}
