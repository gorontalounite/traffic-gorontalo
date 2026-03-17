export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { password } = req.body
  const adminPassword = process.env.DASHBOARD_PASSWORD
  if (!adminPassword) return res.status(500).json({ ok: false, error: 'DASHBOARD_PASSWORD not configured' })
  if (password === adminPassword) return res.status(200).json({ ok: true })
  return res.status(401).json({ ok: false })
}
