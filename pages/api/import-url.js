export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'URL diperlukan' })

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
      },
    })
    if (!response.ok) throw new Error(`Gagal mengambil halaman (${response.status})`)
    const html = await response.text()

    // Extract judul
    const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1]
    const tagTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
    const h1Title = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]
    const title = (ogTitle || h1Title || tagTitle || 'Artikel').replace(/\s*[-|].*$/, '').trim()

    // Bersihkan HTML
    let clean = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[\s\S]*?<\/aside>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')

    // Coba extract bagian konten utama
    const candidates = [
      clean.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1],
      clean.match(/<div[^>]*class="[^"]*(?:content|artikel|berita|post|entry|body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1],
      clean.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1],
      clean.match(/<div[^>]*id="[^"]*(?:content|artikel|berita|post)[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1],
      clean,
    ]

    let content = ''
    for (const candidate of candidates) {
      if (!candidate) continue
      const text = candidate
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim()
      if (text.length > 100) { // threshold diturunkan dari 50 → 100 tapi lebih permisif
        content = text.substring(0, 2000)
        break
      }
    }

    if (!content) throw new Error('Konten tidak bisa diekstrak dari halaman ini. Coba copy-paste manual.')

    return res.status(200).json({ title, content })
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}