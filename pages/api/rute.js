export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { asal, tujuan } = req.body
  if (!asal || !tujuan) return res.status(400).json({ error: 'Asal dan tujuan diperlukan' })

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key tidak tersedia' })

  try {
    const origin = `${asal.lat},${asal.lng}`
    const destination = `${tujuan.lat},${tujuan.lng}`

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&language=id&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK') throw new Error(`Directions API: ${data.status}`)

    const route = data.routes[0]
    const leg = route.legs[0]

    // Ringkasan langkah-langkah rute
    const langkah = leg.steps.slice(0, 6).map((s, i) => {
      const instruksi = s.html_instructions.replace(/<[^>]+>/g, '')
      return `${i + 1}. ${instruksi} (${s.distance.text})`
    }).join('\n')

    return res.status(200).json({
      ringkasan: langkah,
      durasi: leg.duration.text,
      jarak: leg.distance.text,
      polyline: route.overview_polyline.points,
      origin: { lat: leg.start_location.lat, lng: leg.start_location.lng },
      destination: { lat: leg.end_location.lat, lng: leg.end_location.lng },
    })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}