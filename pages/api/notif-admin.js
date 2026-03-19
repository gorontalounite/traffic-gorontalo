// pages/api/notif-admin.js
// Dipanggil setelah laporan baru masuk — kirim notifikasi ke admin

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { laporan } = req.body
  if (!laporan) return res.status(400).json({ error: 'Data laporan diperlukan' })

  const resendKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL

  if (!resendKey || !adminEmail) {
    return res.status(200).json({ ok: true, skipped: true })
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lalu Lintas Gorontalo <noreply@traffic-gorontalo.vercel.app>',
        to: adminEmail,
        subject: `🚦 Laporan Baru — ${laporan.kecamatan_nama} (${laporan.status})`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="color:#111">📋 Laporan Baru Masuk</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:6px 0;color:#888;width:120px">Kecamatan</td><td style="color:#111">${laporan.kecamatan_nama}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Status</td><td style="color:#111">${laporan.status}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Pelapor</td><td style="color:#111">${laporan.nama_pelapor || 'Anonim'}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Email</td><td style="color:#111">${laporan.email_pelapor || '-'}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Deskripsi</td><td style="color:#111">${laporan.deskripsi || '-'}</td></tr>
              ${laporan.foto_url ? `<tr><td style="padding:6px 0;color:#888">Foto</td><td><a href="${laporan.foto_url}" style="color:#0070f3">Lihat foto</a></td></tr>` : ''}
              ${laporan.latitude ? `<tr><td style="padding:6px 0;color:#888">Lokasi</td><td><a href="https://maps.google.com/?q=${laporan.latitude},${laporan.longitude}" style="color:#0070f3">Buka di Maps</a></td></tr>` : ''}
            </table>
            <a href="https://traffic-gorontalo.vercel.app/dashboard" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#333;color:#fff;border-radius:8px;text-decoration:none;font-size:14px">
              Moderasi di Dashboard →
            </a>
          </div>
        `,
      }),
    })
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Gagal kirim notif admin:', e)
    return res.status(500).json({ error: e.message })
  }
}