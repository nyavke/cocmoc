import { useState } from 'react'

export default function WelcomeScreen({ onEnter }) {
  const [exiting, setExiting] = useState(false)
  const mono = "'Space Mono', monospace"
  const sans = "'Space Grotesk', sans-serif"

  const handleEnter = () => {
    setExiting(true)
    setTimeout(onEnter, 900)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,4,0.82)',
      backdropFilter: 'blur(3px)',
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.9s ease',
      pointerEvents: exiting ? 'none' : 'auto',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
        animation: 'wsFadeUp 1s ease both',
      }}>
        <span style={{
          fontFamily: mono, fontSize: 10, letterSpacing: '0.55em',
          color: 'rgba(140,80,255,0.65)',
          textShadow: '0 0 20px rgba(140,80,255,0.4)',
        }}>
          ✦ COCMOC.RU ✦
        </span>

        <h1 style={{
          fontFamily: sans, fontWeight: 300,
          fontSize: 'clamp(28px,5.5vw,72px)',
          letterSpacing: '-0.02em', lineHeight: 1.05,
          color: 'rgba(255,255,255,0.92)',
          margin: 0, textAlign: 'center',
        }}>
          The next civilization
        </h1>

        <p style={{
          fontFamily: mono, fontSize: 9, letterSpacing: '0.28em',
          color: 'rgba(255,255,255,0.22)', margin: 0,
        }}>
          ONCHAIN · DECENTRALIZED · COSMIC
        </p>

        <button
          onClick={handleEnter}
          style={{
            marginTop: 12,
            fontFamily: mono, fontSize: 10, letterSpacing: '0.45em',
            color: 'rgba(255,255,255,0.85)',
            background: 'none',
            border: '1px solid rgba(140,80,255,0.45)',
            padding: '13px 44px',
            cursor: 'pointer',
            transition: 'color 0.3s, border-color 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(140,80,255,0.9)'
            e.currentTarget.style.color = 'rgba(180,120,255,1)'
            e.currentTarget.style.boxShadow = '0 0 24px rgba(140,80,255,0.25)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(140,80,255,0.45)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          ENTER
        </button>
      </div>

      <style>{`
        @keyframes wsFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
