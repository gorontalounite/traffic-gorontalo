-- Jalankan SQL ini di Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql/new

CREATE TABLE IF NOT EXISTS laporan_lalu_lintas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kecamatan_id TEXT NOT NULL,
  kecamatan_nama TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('lancar', 'padat', 'macet')),
  deskripsi TEXT,
  nama_pelapor TEXT DEFAULT 'Anonim',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE laporan_lalu_lintas ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read" ON laporan_lalu_lintas
  FOR SELECT USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert" ON laporan_lalu_lintas
  FOR INSERT WITH CHECK (true);

-- Index for faster queries
CREATE INDEX idx_laporan_kecamatan ON laporan_lalu_lintas(kecamatan_id);
CREATE INDEX idx_laporan_created ON laporan_lalu_lintas(created_at DESC);
