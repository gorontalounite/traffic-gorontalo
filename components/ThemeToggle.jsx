import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light') {
      setDark(false)
      document.documentElement.classList.add('light')
    }
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 bg-asphalt-800 border border-asphalt-600 hover:bg-asphalt-700 rounded-full px-2.5 py-1 transition-all"
      title="Ganti tema"
    >
      <span className="text-sm">{dark ? '☀️' : '🌙'}</span>
      <span className="text-xs font-mono text-gray-400">{dark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
