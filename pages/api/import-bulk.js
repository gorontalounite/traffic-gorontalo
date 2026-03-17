export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { urls } = req.body
  if (!urls || !Array.isArray(urls)) return res.status(400).json({ error: 'URLs diperlukan' })

  const results = []

  for (const url of urls.slice(0, 50)) { // max 50 sekaligus
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'id-ID,id;q=0.9',
        },
        signal: AbortSignal.timeout(8000), // timeout 8 detik per URL
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const html = await response.text()

      const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1]
      const tagTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
      const h1Title = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]
      const title = (ogTitle || h1Title || tagTitle || url).replace(/\s*[-|].*$/, '').trim()

      let clean = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<aside[\s\S]*?<\/aside>/gi, '')

      const candidates = [
        clean.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1],
        clean.match(/<div[^>]*class="[^"]*(?:content|artikel|berita|post|entry|body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1],
        clean.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1],
        clean,
      ]

      let content = ''
      for (const c of candidates) {
        if (!c) continue
        const text = c.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
        if (text.length > 100) { content = text.substring(0, 1500); break }
      }

      if (!content) throw new Error('Konten kosong')
      results.push({ url, title, content, status: 'ok' })
    } catch (e) {
      results.push({ url, title: '', content: '', status: 'error', error: e.message })
    }
  }

  return res.status(200).json({ results })
}