'use client'

const PLATFORM_CONFIG = {
  instagram: { emoji: '📸', label: 'Instagram' },
  facebook:  { emoji: '📘', label: 'Facebook' },
  tiktok:    { emoji: '🎵', label: 'TikTok' },
  twitter:   { emoji: '🐦', label: 'Twitter/X' },
  youtube:   { emoji: '▶️',  label: 'YouTube' },
  berita:    { emoji: '📰', label: 'Berita' },
  lainnya:   { emoji: '🔗', label: 'Lainnya' },
}

export default function EmbedFeed({ posts = [] }) {
  if (!posts.length) return null

  return (
    <div className="px-4 mb-6">
      <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-3">
        📱 Dari Media Sosial &amp; Berita
      </p>
      <div className="grid grid-cols-3 gap-2">
        {posts.map((post) => {
          const cfg = PLATFORM_CONFIG[post.platform] || PLATFORM_CONFIG.lainnya
          return (
            <a
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