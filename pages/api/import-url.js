export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'URL diperlukan' })

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TrafficGorontaloBot/1.0)' },
    })
    if (!response.ok) throw new Error('Gagal mengambil halaman')
    const html = await response.text()

    // Extract judul
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const ogTitleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)
    const title = (ogTitleMatch?.[1] || titleMatch?.[1] || 'Artikel').replace(/\s*[-|].*$/, '').trim()

    // Extract konten utama — bersihkan HTML tags
    const bodyMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
      || html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
      || html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)

    let content = bodyMatch?.[1] || html
    // Hapus script, style, nav, header, footer
    content = content
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000) // Batasi 2000 karakter

    if (!content || content.length < 50) throw new Error('Konten terlalu pendek atau tidak bisa diekstrak')

    return res.status(200).json({ title, content })
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}