# 🚦 Lalu Lintas Kabupaten Gorontalo

Aplikasi pemantauan lalu lintas real-time untuk 6 kecamatan di Kabupaten Gorontalo:
**Limboto · Limboto Barat · Tibawa · Bongomeme · Dungaliyo · Pulubala**

## Fitur
- 💬 **Chat AI** — tanya kondisi lalu lintas pakai bahasa natural
- 🗺️ **Peta interaktif** — Google Maps dengan traffic layer real-time
- 📝 **Laporan lapangan** — siapa saja bisa submit kondisi
- 📋 **Riwayat laporan** — history laporan per kecamatan
- 🚨 **Alert otomatis** — notifikasi jika ada area macet total
- 📱 **Mobile-first** — responsif di semua ukuran layar

---

## Setup & Deploy

### 1. Clone & Install

```bash
git clone https://github.com/USERNAME/traffic-gorontalo.git
cd traffic-gorontalo
npm install
```

### 2. Buat file `.env.local`

```bash
cp .env.local.example .env.local
```

Isi nilai-nilainya (lihat bagian API Keys di bawah).

### 3. Setup Supabase

1. Buat akun di [supabase.com](https://supabase.com)
2. Buat project baru
3. Buka **SQL Editor** → klik **New Query**
4. Copy-paste isi file `supabase-schema.sql` → klik **Run**
5. Buka **Settings → API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Google Maps API Key

1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Buat project baru
3. Aktifkan **Maps JavaScript API** dan **Maps Embed API**
4. Buat **API Key** di Credentials
5. (Opsional) Batasi key hanya untuk domain kamu
6. Copy ke `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### 5. Anthropic API Key

1. Buka [console.anthropic.com](https://console.anthropic.com)
2. Settings → API Keys → Create Key
3. Copy ke `ANTHROPIC_API_KEY`

---

## Deploy ke Vercel

### Via GitHub (Rekomendasi)

1. Push project ke GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/traffic-gorontalo.git
git push -u origin main
```

2. Buka [vercel.com](https://vercel.com) → **New Project**
3. Import repo dari GitHub
4. Tambahkan **Environment Variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | key dari Google |
| `NEXT_PUBLIC_SUPABASE_URL` | URL dari Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key dari Supabase |
| `ANTHROPIC_API_KEY` | key dari Anthropic |

5. Klik **Deploy** ✅

---

## Jalankan Lokal

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

> **Catatan:** Tanpa API key, app tetap berjalan dalam **demo mode**:
> - Peta menggunakan OpenStreetMap (gratis, tanpa traffic layer)
> - Chat AI menggunakan response fallback
> - Laporan tersimpan di memory (hilang saat refresh)

---

## Struktur Project

```
traffic-gorontalo/
├── pages/
│   ├── index.js          # Halaman utama
│   ├── _app.js
│   ├── _document.js
│   └── api/
│       └── chat.js       # Endpoint Anthropic AI
├── components/
│   ├── AlertBanner.jsx   # Notifikasi macet
│   ├── StatusBar.jsx     # Status per kecamatan
│   ├── ChatPanel.jsx     # Chat tanya jawab AI
│   ├── MapView.jsx       # Peta + traffic layer
│   ├── ReportForm.jsx    # Form laporan lapangan
│   └── ReportHistory.jsx # Riwayat laporan
├── lib/
│   └── supabase.js       # Config & constants
├── styles/
│   └── globals.css       # Global styles
├── supabase-schema.sql   # SQL schema database
└── .env.local.example    # Template environment variables
```

---

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Realtime)
- **Peta**: Google Maps Embed API / OpenStreetMap
- **AI Chat**: Anthropic Claude API
- **Deploy**: Vercel + GitHub

---

## Lisensi

MIT — bebas digunakan dan dimodifikasi.
