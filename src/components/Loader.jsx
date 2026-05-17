import { useEffect, useRef, useState } from 'react'

const GLYPHS = '✦ ✧ ◈ ◉ ⬡ ❋ ◎ ✺ ⊹ ✵'.split(' ')

export default function Loader({ done }) {
  const [glyphs, setGlyphs] = useState(Array(12).fill('·'))
  const [exiting, setExiting] = useState(false)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    let n = 0
    const id = setInterval(() => {
      n = Math.min(n + Math.random() * 22 + 5, 100)
      setPct(Math.floor(n))
      setGlyphs(g => g.map((_, i) => Math.random() > 0.7 ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : g[i]))
    }, 90)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (done) setExiting(true)
  }, [done])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24,
      opacity: exiting ? 0 : 1,
      pointerEvents: exiting ? 'none' : 'auto',
      transition: 'opacity 1s ease',
    }}>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 22, letterSpacing: '0.6em',
        color: 'rgba(140, 80, 255, 0.9)',
        textShadow: '0 0 40px rgba(140,80,255,0.6)',
      }}>
        {glyphs.join(' ')}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 160, height: 1,
          background: 'rgba(140,80,255,0.15)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0,
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #4820c0, #8c50ff)',
            boxShadow: '0 0 10px rgba(140,80,255,0.8)',
            transition: 'width 0.1s ease',
          }} />
        </div>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10, letterSpacing: '0.1em',
          color: 'rgba(140,80,255,0.4)',
        }}>{String(pct).padStart(3,'0')}</span>
      </div>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 9, letterSpacing: '0.5em',
        color: 'rgba(255,255,255,0.08)',
        textTransform: 'uppercase',
        marginTop: 8,
      }}>INITIALIZING STELLAR FIELD</div>
    </div>
  )
}
