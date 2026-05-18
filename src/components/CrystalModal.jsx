import { useEffect, useRef, useCallback, useState } from 'react'
import { playExit, playTypeClick } from '../utils/audio'
import CrystalPreview from './CrystalPreview'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·✦◈◉—/'

function ScrambleText({ text, delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0, raf, prevDone = 0
    const run = () => {
      const p = Math.min(frame / 20, 1)
      const done = Math.floor(p * text.length)
      if (done > prevDone) { playTypeClick(); prevDone = done }
      el.textContent = text.split('').map((c, i) =>
        c === ' ' ? ' ' : i < done ? c : CHARS[Math.floor(Math.random() * CHARS.length)]
      ).join('')
      frame++
      if (frame <= 30) raf = requestAnimationFrame(run)
      else el.textContent = text
    }
    const tid = setTimeout(() => { raf = requestAnimationFrame(run) }, delay)
    return () => { clearTimeout(tid); cancelAnimationFrame(raf) }
  }, [text, delay])
  return <span ref={ref} style={{ opacity: 0, animation: `scrambleFadeIn 0.01s ${delay}ms both` }}>{text}</span>
}

export const MODAL_DATA = [
  {
    title: 'COCMOC.RU',
    tag: 'EST. 2024',
    body: [
      'We build the infrastructure',
      'for the next civilization —',
      'one that lives among the stars.',
      '',
      'Not a promise.',
      'Not a roadmap.',
      'A foundation.',
    ],
    stats: [],
    colA: [0.18, 0.05, 0.70], colB: [0.55, 0.20, 1.00], colC: [0.85, 0.65, 1.00],
    scaleY: 2.3, seed: 7,
  },
  {
    title: 'NOVA PROTOCOL',
    tag: 'INFRASTRUCTURE',
    body: [
      'A decentralized consensus layer',
      'powering the first truly',
      'self-sovereign civilization.',
      '',
      'No single point of failure.',
      'No central authority.',
      'No compromise.',
    ],
    stats: ['10,000 NODES', '∞ UPTIME', 'ZERO FAILURES'],
    colA: [0.00, 0.20, 0.90], colB: [0.00, 0.65, 1.00], colC: [0.40, 0.90, 1.00],
    scaleY: 2.0, seed: 13,
  },
  {
    title: 'STELLAR MARKET',
    tag: 'ECONOMY',
    body: [
      'A fully onchain economy where',
      'resources, assets, and reputation',
      'flow like starlight —',
      '',
      'Frictionless.',
      'Borderless.',
      'Unstoppable.',
    ],
    stats: ['$2.4B VOLUME', '180+ MARKETS', '∞ LIQUIDITY'],
    colA: [0.70, 0.30, 0.00], colB: [1.00, 0.60, 0.10], colC: [1.00, 0.85, 0.40],
    scaleY: 1.9, seed: 42,
  },
  {
    title: 'VOID IDENTITY',
    tag: 'IDENTITY',
    body: [
      'Your cosmic fingerprint.',
      'A self-sovereign identity system',
      'that lives as long as the universe.',
      '',
      'No servers.',
      'No gatekeepers.',
      'No expiry date.',
    ],
    stats: ['2.1M CITIZENS', '0 DATA LEAKS', '∞ SOVEREIGNTY'],
    colA: [0.50, 0.00, 0.50], colB: [0.90, 0.00, 0.75], colC: [1.00, 0.50, 0.90],
    scaleY: 2.5, seed: 99,
  },
  {
    title: 'NEBULA GRID',
    tag: 'COMPUTE',
    body: [
      'Distributed compute fabric',
      'woven across the constellation',
      'of contributors.',
      '',
      'Training minds.',
      'Rendering worlds.',
      'Building futures.',
    ],
    stats: ['840 PFLOPS', '99.9% UPTIME', '∞ SCALE'],
    colA: [0.00, 0.50, 0.35], colB: [0.00, 0.85, 0.55], colC: [0.35, 1.00, 0.70],
    scaleY: 2.1, seed: 23,
  },
]

export default function CrystalModal({ idx, onClose }) {
  const data = MODAL_DATA[idx]
  const [phase, setPhase] = useState('entering')
  const [bodyLines, setBodyLines] = useState(() => data.body.map(() => ''))
  const spotRef = useRef(null)
  const mono = "'Space Mono', monospace"
  const sans = "'Space Grotesk', sans-serif"

  // Colours
  const accentR = Math.round(data.colB[0] * 255)
  const accentG = Math.round(data.colB[1] * 255)
  const accentB = Math.round(data.colB[2] * 255)
  const accent = `rgb(${accentR},${accentG},${accentB})`
  const bg = `rgba(${Math.round(data.colA[0]*12)},${Math.round(data.colA[1]*6)},${Math.round(data.colA[2]*22)},0.97)`

  // Entrance
  useEffect(() => {
    const t = setTimeout(() => setPhase('visible'), 40)
    return () => clearTimeout(t)
  }, [])

  // Body scramble — shared state keeps both x-ray layers in sync
  useEffect(() => {
    const timers = [], rafs = []
    data.body.forEach((line, li) => {
      if (!line.trim()) {
        setBodyLines(prev => { const n=[...prev]; n[li]=''; return n })
        return
      }
      let frame = 0, prevDone = 0
      const run = () => {
        const p = Math.min(frame / 20, 1)
        const done = Math.floor(p * line.length)
        if (done > prevDone) { playTypeClick(); prevDone = done }
        const s = line.split('').map((c, i) =>
          c === ' ' ? ' ' : i < done ? c : CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join('')
        setBodyLines(prev => { const n=[...prev]; n[li]=s; return n })
        frame++
        if (frame <= 30) rafs[li] = requestAnimationFrame(run)
        else setBodyLines(prev => { const n=[...prev]; n[li]=line; return n })
      }
      timers[li] = setTimeout(() => { rafs[li] = requestAnimationFrame(run) }, 320 + li * 75)
    })
    return () => { timers.forEach(clearTimeout); rafs.forEach(cancelAnimationFrame) }
  }, [])

  // Close handler
  const close = useCallback(() => {
    setPhase('exiting')
    playExit()
    setTimeout(onClose, 420)
  }, [onClose])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // X-ray mouse tracking — direct DOM, no re-render
  const handleMouseMove = useCallback((e) => {
    if (!spotRef.current) return
    const rect = spotRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const mask = `radial-gradient(circle 230px at ${x}px ${y}px, black 0%, black 38%, transparent 68%)`
    spotRef.current.style.WebkitMaskImage = mask
    spotRef.current.style.maskImage = mask
  }, [])

  const bodyText = data.body.join('\n')
  const entering = phase === 'entering'
  const exiting = phase === 'exiting'

  return (
    <div
      onMouseMove={handleMouseMove}
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: bg,
        backdropFilter: 'blur(2px)',
        display: 'flex', flexDirection: 'column',
        padding: 'clamp(40px,6vw,80px)',
        opacity: entering || exiting ? 0 : 1,
        transform: entering ? 'scale(1.04)' : exiting ? 'scale(0.98)' : 'scale(1)',
        transition: entering
          ? 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)'
          : 'opacity 0.38s ease, transform 0.38s ease',
        cursor: 'default',
      }}
    >
      {/* ── 3D CRYSTAL PREVIEW (right side) ──────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 'min(42vw, 520px)',
        height: 'min(42vw, 520px)',
        opacity: phase === 'visible' ? 1 : 0,
        transition: 'opacity 0.9s 0.35s ease',
        zIndex: 2,
      }}>
        <CrystalPreview
          scaleY={data.scaleY}
          seed={data.seed}
          colA={data.colA}
          colB={data.colB}
          colC={data.colC}
        />
      </div>

      {/* Flash on entry */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'white', zIndex: 1,
        animation: 'crystalFlash 0.45s ease-out forwards',
      }} />

      {/* ── TOP ROW ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 'clamp(40px,7vh,80px)',
        position: 'relative', zIndex: 2,
        animation: 'fadeUp 0.5s 0.15s ease both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 28, height: 1, background: accent, opacity: 0.7 }} />
          <span style={{
            fontFamily: mono, fontSize: 9, letterSpacing: '0.35em',
            color: accent, opacity: 0.8,
          }}>✦ <ScrambleText text={data.tag} delay={80} /></span>
        </div>
        <button
          onClick={close}
          style={{
            fontFamily: mono, fontSize: 11, letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none',
            cursor: 'pointer', padding: '8px 12px',
            transition: 'color 0.25s ease',
          }}
          onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.25)'}
        >
          ✕ ESC
        </button>
      </div>

      {/* ── TITLE ────────────────────────────────────────────────────────── */}
      <h2 style={{
        fontFamily: sans, fontWeight: 300,
        fontSize: 'clamp(28px,5vw,72px)',
        letterSpacing: '-0.02em', lineHeight: 1.0,
        color: 'rgba(255,255,255,0.88)',
        margin: 0, marginBottom: 'clamp(24px,4vh,48px)',
        position: 'relative', zIndex: 2,
        animation: 'fadeUp 0.55s 0.22s ease both',
      }}>
        <ScrambleText text={data.title} delay={180} />
      </h2>

      {/* ── DIVIDER ──────────────────────────────────────────────────────── */}
      <div style={{
        height: 1, marginBottom: 'clamp(24px,4vh,48px)',
        background: `linear-gradient(to right, ${accent}44, transparent)`,
        position: 'relative', zIndex: 2,
        animation: 'growLine 0.6s 0.3s ease both',
        transformOrigin: 'left',
      }} />

      {/* ── X-RAY TEXT BODY ──────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
        {/* Base layer — dim gray */}
        <div style={{
          fontFamily: sans, fontWeight: 300,
          fontSize: 'clamp(18px,2.5vw,32px)',
          lineHeight: 1.65, letterSpacing: '-0.01em',
          color: 'rgba(160,150,175,0.22)',
        }}>
          {bodyLines.map((line, i) =>
            line === ''
              ? <div key={i} style={{ height: '1.65em' }} />
              : <div key={i}>{line || ' '}</div>
          )}
        </div>

        {/* Spotlight layer — bright, masked by mouse */}
        <div
          ref={spotRef}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            fontFamily: sans, fontWeight: 300,
            fontSize: 'clamp(18px,2.5vw,32px)',
            lineHeight: 1.65, letterSpacing: '-0.01em',
            color: 'rgba(242,238,252,0.92)',
            textShadow: `0 0 12px rgba(255,255,255,0.55), 0 0 28px rgba(${accentR},${accentG},${accentB},0.3)`,
            WebkitMaskImage: 'radial-gradient(circle 230px at 50% 50%, black 0%, black 38%, transparent 68%)',
            maskImage:       'radial-gradient(circle 230px at 50% 50%, black 0%, black 38%, transparent 68%)',
          }}
        >
          {bodyLines.map((line, i) =>
            line === ''
              ? <div key={i} style={{ height: '1.65em' }} />
              : <div key={i}>{line || ' '}</div>
          )}
        </div>
      </div>

      {/* ── DIVIDER 2 ────────────────────────────────────────────────────── */}
      {data.stats.length > 0 && (
        <>
          <div style={{
            height: 1, margin: 'clamp(24px,4vh,40px) 0',
            background: `rgba(${accentR},${accentG},${accentB},0.12)`,
            position: 'relative', zIndex: 2,
            animation: 'fadeUp 0.5s 0.7s ease both',
          }} />

          {/* ── STATS ───────────────────────────────────────────────────── */}
          <div style={{
            display: 'flex', gap: 'clamp(24px,5vw,80px)',
            position: 'relative', zIndex: 2,
            animation: 'fadeUp 0.5s 0.8s ease both',
          }}>
            {data.stats.map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{
                  fontFamily: mono, fontSize: 'clamp(14px,1.8vw,22px)',
                  letterSpacing: '0.04em',
                  color: accent,
                  textShadow: `0 0 16px rgba(${accentR},${accentG},${accentB},0.5)`,
                }}>
                  <ScrambleText text={s} delay={780 + i * 100} />
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── BOTTOM HINT ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 'clamp(24px,4vh,40px)', right: 'clamp(24px,4vw,60px)',
        fontFamily: mono, fontSize: 9, letterSpacing: '0.25em',
        color: 'rgba(255,255,255,0.1)',
        animation: 'fadeUp 0.4s 1.0s ease both',
      }}>
        <ScrambleText text="PRESS ESC TO CLOSE" delay={1000} />
      </div>

      <style>{`
        @keyframes scrambleFadeIn { to { opacity: 1; } }
        @keyframes crystalFlash {
          0%   { opacity: 0.35; }
          100% { opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes growLine {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}
