import { useState, useEffect, useRef } from 'react'
import { useLang } from '../context/LangContext'

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

export default function LangDropdown({ style = {} }) {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const mono = "'Space Mono', monospace"

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', ...style }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          fontFamily: mono, fontSize: 9, letterSpacing: '0.32em',
          color: open ? 'rgba(140,80,255,0.9)' : 'rgba(255,255,255,0.4)',
          background: 'none',
          border: '1px solid ' + (open ? 'rgba(140,80,255,0.5)' : 'rgba(255,255,255,0.12)'),
          padding: '5px 11px',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 7,
          transition: 'color 0.25s, border-color 0.25s',
          pointerEvents: 'auto',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'rgba(140,80,255,0.9)'; e.currentTarget.style.borderColor = 'rgba(140,80,255,0.5)' }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' } }}
      >
        {lang.toUpperCase()}
        <span style={{ opacity: 0.5, fontSize: 7, marginLeft: 2 }}>{open ? '▴' : '▾'}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 5px)', left: 0,
          background: 'rgba(2,0,10,0.97)',
          border: '1px solid rgba(140,80,255,0.2)',
          backdropFilter: 'blur(12px)',
          zIndex: 999,
          width: '100%',
          overflow: 'hidden',
          animation: 'ddFadeIn 0.15s ease both',
        }}>
          {LANGS.map(({ code, label }) => {
            const active = code === lang
            return (
              <button
                key={code}
                onClick={() => { setLang(code); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%',
                  fontFamily: mono, fontSize: 9, letterSpacing: '0.25em',
                  padding: '8px 12px',
                  color: active ? 'rgba(140,80,255,0.95)' : 'rgba(255,255,255,0.35)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', whiteSpace: 'nowrap',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(140,80,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = active ? 'rgba(140,80,255,0.95)' : 'rgba(255,255,255,0.35)' }}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes ddFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
