import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { password, id, aksi, catatan } = req.body

  // Verifikasi password admin
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!id || !['diterima', 'ditolak', 'pending'].includes(aksi)) {
    return res.status(400).json({ error: 'Parameter tidak valid' })
  }

  // Update status moderasi
  const { data, error } = await supabaseAdmin
    .from('laporan_lalu_lintas')
    .update({
      moderasi: aksi,
      catatan_admin: catatan || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  // Kirim notifikasi email ke pelapor jika ada email
  if (data.email_pelapor && aksi !== 'pending') {
    try {
      await kirimNotifikasiPelapor(data, aksi)
    } catch (e) {
      console.error('Gagal kirim email pelapor:', e)
    }
  }

  return res.status(200).json({ ok: true, data })
}

async function kirimNotifikasiPelapor(laporan, aksi) {
  // Gunakan Resend atau SMTP — skip jika tidak ada API key
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return

  const statusLabel = aksi === 'diterima' ? 'diterima dan ditayangkan' : 'tidak dapat ditayangkan'
  const body = aksi === 'diterima'
    ? `Laporan Anda tentang kondisi lalu lintas di ${laporan.kecamatan_nama} telah ${statusLabel}. Terima kasih atas partisipasi Anda.`
    : `Laporan Anda tidak dapat ditayangkan. ${laporan.catatan_admin ? `Alasan: ${laporan.catatan_admin}` : 'Silakan coba laporkan kembali dengan informasi yang lebih lengkap.'}`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Lalu Lintas Gorontalo <noreply@traffic-gorontalo.vercel.app>',
      to: laporan.email_pelapor,
      subject: `Laporan Anda ${statusLabel === 'diterima dan ditayangkan' ? '✓ Diterima' : '✗ Ditolak'} — Lalu Lintas Gorontalo`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#111">Pembaruan Status Laporan</h2>
          <p style="color:#444">${body}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <p style="color:#888;font-size:12px">
            Laporan: ${laporan.kecamatan_nama} · Status: ${laporan.status}<br/>
            ${laporan.deskripsi || ''}
          </p>
          <a href="https://traffic-gorontalo.vercel.app" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#333;color:#fff;border-radius:8px;text-decoration:none;font-size:14px">
            Lihat Website
          </a>
        </div>
      `,
    }),
  })
}