import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PLATFORM_CONFIG = {
  instagram: { label: 'Instagram', emoji: '📸' },
  tiktok: { label: 'TikTok', emoji: '🎵' },
  berita: { label: 'Berita', emoji: '📰' },
  lainnya: { label: 'Lainnya', emoji: '🔗' },
}

export default function EmbedFeed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    if (!supabase) { setLoading(false); return }
    try {
      const { data } = await supabase
        .from('embed_posts')
        .select('*')
        .eq('aktif', true)
        .order('created_at', { ascending: false })
        .limit(9)
      if (data) setPosts(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null
  if (posts.length === 0) return null

  return (
    <div className="px-4 mb-6">
      <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-3">
        📱 Dari Media Sosial & Berita
      </p>
      <div className="grid grid-cols-3 gap-2">
        {posts.map((post) => {
          const cfg = PLATFORM_CONFIG[post.platform] || PLATFORM_CONFIG.lainnya
          return (
            
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square bg-asphalt-800 border border-asphalt-600 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:bg-asphalt-700 hover:border-asphalt-500 transition-all active:scale-95"
            >
              <span className="text-2xl">{cfg.emoji}</span>
              <span className="text-xs text-gray-500 font-mono text-center px-1 leading-tight line-clamp-2">
                {post.caption || cfg.label}
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
