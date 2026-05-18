import { useState } from 'react'
import { useLang } from '../context/LangContext'
import { T } from '../utils/i18n'

const NAME = 'NYAVKE'

const LINKS = [
  {
    display: 'nyavke@gmail.com',
    href: 'mailto:nyavke@gmail.com',
    glow: '140, 80, 255',
    label: 'EMAIL',
  },
  {
    display: '@nyavke',
    href: 'https://t.me/nyavke',
    glow: '38, 166, 229',
    label: 'TELEGRAM',
  },
  {
    display: 'github.com/nyavke',
    href: 'https://github.com/nyavke',
    glow: '52, 211, 153',
    label: 'GITHUB',
  },
]

const STARS = Array.from({ length: 70 }, (_, i) => ({
  left: ((i * 137.508) % 100),
  top:  ((i * 97.3)   % 100),
  size: 0.5 + (i % 5) * 0.4,
  opacity: 0.05 + (i % 8) * 0.04,
  dur: 2 + (i % 5) * 0.8,
  delay: (i % 7) * 0.5,
}))

function GlowLetter({ ch }) {
  const [hov, setHov] = useState(false)
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-block',
        color: hov ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.05)',
        textShadow: hov
          ? '0 0 15px rgba(140,80,255,1), 0 0 40px rgba(140,80,255,0.6), 0 0 80px rgba(140,80,255,0.25), 0 0 160px rgba(100,50,200,0.1)'
          : 'none',
        transition: 'color 0.35s ease, text-shadow 0.35s ease',
        cursor: 'default',
        letterSpacing: '0.08em',
      }}
    >
      {ch}
    </span>
  )
}

function LinkItem({ display, href, glow, label }) {
  const [hov, setHov] = useState(false)
  const mono = "'Space Mono', monospace"
  const sans = "'Space Grotesk', sans-serif"

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <span style={{
        fontFamily: mono,
        fontSize: 9,
        letterSpacing: '0.35em',
        color: hov ? `rgba(${glow}, 0.7)` : 'rgba(255,255,255,0.1)',
        transition: 'color 0.4s ease',
      }}>
        {label}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          fontFamily: sans,
          fontWeight: 300,
          fontSize: 'clamp(13px, 1.5vw, 18px)',
          letterSpacing: '0.04em',
          color: hov ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)',
          textDecoration: 'none',
          textShadow: hov
            ? `0 0 10px rgba(${glow},1), 0 0 25px rgba(${glow},0.6), 0 0 55px rgba(${glow},0.25), 0 0 100px rgba(${glow},0.08)`
            : 'none',
          transition: 'all 0.45s ease',
          cursor: 'pointer',
          display: 'block',
          padding: '4px 0',
          position: 'relative',
        }}
      >
        {display}
        <span style={{
          position: 'absolute',
          bottom: 0, left: 0,
          width: hov ? '100%' : '0%',
          height: 1,
          background: `rgba(${glow}, 0.5)`,
          boxShadow: hov ? `0 0 8px rgba(${glow}, 0.8)` : 'none',
          transition: 'width 0.4s ease, box-shadow 0.4s ease',
        }} />
      </a>
    </div>
  )
}

export default function ContactScreen({ visible }) {
  const { lang } = useLang()
  const t = T[lang].ui
  const mono = "'Space Mono', monospace"
  const sans = "'Space Grotesk', sans-serif"

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: 50,
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
      transition: 'opacity 2s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {STARS.map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: `rgba(140,80,255,${s.opacity})`,
            animation: `bh-twinkle ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 1,
        background: 'linear-gradient(to right, transparent, rgba(140,80,255,0.15), transparent)',
      }} />
      <div style={{
        position: 'absolute', top: 32, left: 40,
        display: 'flex', alignItems: 'center', gap: 10,
        pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: mono, fontSize: 10, letterSpacing: '0.4em',
          color: 'rgba(140,80,255,0.25)', fontWeight: 700,
        }}>✦ COCMOC.RU</span>
      </div>
      <div style={{
        position: 'absolute', top: 36, right: 40,
        fontFamily: mono, fontSize: 9, letterSpacing: '0.3em',
        color: 'rgba(255,255,255,0.05)',
        pointerEvents: 'none',
      }}>{t.singularity}</div>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 0,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          fontFamily: sans, fontWeight: 300,
          fontSize: 'clamp(64px, 12vw, 180px)',
          letterSpacing: '0.2em',
          marginBottom: '5vh',
          userSelect: 'none',
          display: 'flex',
        }}>
          {NAME.split('').map((ch, i) => <GlowLetter key={i} ch={ch} />)}
        </div>
        <div style={{
          width: 'clamp(200px, 40vw, 600px)',
          height: 1,
          background: 'linear-gradient(to right, transparent, rgba(140,80,255,0.25), transparent)',
          marginBottom: '7vh',
        }} />
        <div style={{
          display: 'flex',
          gap: 'clamp(32px, 6vw, 96px)',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {LINKS.map((l, i) => <LinkItem key={i} {...l} />)}
        </div>

      </div>
      <div style={{
        position: 'absolute', bottom: 32,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 12,
        pointerEvents: 'none',
      }}>
        <div style={{
          width: 1, height: 32,
          background: 'linear-gradient(to bottom, transparent, rgba(140,80,255,0.2))',
        }} />
        <span style={{
          fontFamily: mono, fontSize: 9, letterSpacing: '0.4em',
          color: 'rgba(255,255,255,0.05)',
        }}>
          {t.rights}
        </span>
      </div>

      <style>{`
        @keyframes bh-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50%       { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}
