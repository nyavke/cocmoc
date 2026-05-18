import { useRef, useEffect, useState } from 'react'
import { playTypeClick, setSoundEnabled } from '../utils/audio'

const STATIONS = [
  { label: 'COCMOC.RU',    sub: 'Creating the next onchain civilization',    tag: 'EST. 2024' },
  { label: 'NOVA PROTOCOL',  sub: 'Decentralized infrastructure · 10K nodes',  tag: 'INFRASTRUCTURE' },
  { label: 'STELLAR MARKET', sub: 'Onchain economy without borders · $2.4B',   tag: 'ECONOMY' },
  { label: 'VOID IDENTITY',  sub: 'Self-sovereign identity · 2.1M citizens',   tag: 'IDENTITY' },
  { label: 'NEBULA GRID',    sub: 'Distributed stellar compute · 840 PFLOPS',  tag: 'COMPUTE' },
  { label: 'THE SINGULARITY',sub: 'Beyond the event horizon · ∞',              tag: '∞' },
]

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·✦◈◉'

function ScrambleText({ text }) {
  const ref = useRef(null)
  const prev = useRef('')

  useEffect(() => {
    if (!ref.current || prev.current === text) return
    prev.current = text
    const el = ref.current
    let frame = 0, prevDone = 0, raf
    const run = () => {
      const p = Math.min(frame / 20, 1)
      const done = Math.floor(p * text.length)
      if (done > prevDone) { playTypeClick(); prevDone = done }
      el.textContent = text.split('').map((ch, i) =>
        ch === ' ' ? ' ' : i < done ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]
      ).join('')
      frame++
      if (frame <= 30) raf = requestAnimationFrame(run)
      else el.textContent = text
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [text])

  return <span ref={ref}>{text}</span>
}

export default function Overlay({ stationIdx, subProgress, inBlackHole }) {
  const s = STATIONS[Math.min(stationIdx, STATIONS.length - 1)]
  const isBH = stationIdx >= 5
  const mono = "'Space Mono', monospace"
  const sans = "'Space Grotesk', sans-serif"
  const [soundOn, setSoundOn] = useState(true)

  // Sync default sound state to audio module on mount
  useEffect(() => { setSoundEnabled(true) }, [])

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
  }

  const overlayOpacity = inBlackHole ? 0 : 1
  const counter = '0' + (Math.min(stationIdx, 4) + 1) + ' / 05'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10,
      pointerEvents: 'none',
      opacity: overlayOpacity,
      transition: 'opacity 1.5s ease',
    }}>

      {/* ── Logo + hints top-left */}
      <div style={{ position:'absolute', top:32, left:40, display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{
            fontFamily: mono, fontSize: 11, color: 'rgba(140,80,255,0.8)',
            textShadow: '0 0 12px rgba(140,80,255,0.6)',
            display: 'inline-block',
            animation: 'overlay-spin 12s linear infinite',
          }}>✦</span>
          <span style={{ fontFamily:mono, fontSize:10, letterSpacing:'0.4em', color:'rgba(255,255,255,0.3)', fontWeight:700 }}>
            <ScrambleText text="COCMOC.RU" />
          </span>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8, paddingLeft:2 }}>
          <span style={{ fontFamily:mono, fontSize:9, letterSpacing:'0.18em', color:'rgba(255,255,255,0.28)' }}>
            <ScrambleText text="Scroll down to discover." />
          </span>
          <button
            onClick={toggleSound}
            style={{
              fontFamily: mono, fontSize: 9, letterSpacing: '0.15em',
              color: soundOn ? 'rgba(140,80,255,0.9)' : 'rgba(255,255,255,0.45)',
              background: soundOn ? 'rgba(140,80,255,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${soundOn ? 'rgba(140,80,255,0.35)' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 3, cursor: 'pointer',
              padding: '5px 10px', pointerEvents: 'auto',
              transition: 'all 0.25s ease',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = soundOn ? 'rgba(140,80,255,0.7)' : 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = soundOn ? 'rgba(140,80,255,0.35)' : 'rgba(255,255,255,0.12)'}
          >
            <span>{soundOn ? '♪' : '♪×'}</span>
            <span>Sound: {soundOn ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>

      {/* ── Tag top-right */}
      <div style={{ position:'absolute', top:36, right:40, fontFamily:mono, fontSize:9, letterSpacing:'0.3em', color:'rgba(140,80,255,0.3)' }}>
        ✦ <ScrambleText text={s.tag} />
      </div>

      {/* ── Main title bottom-left */}
      <div style={{ position:'absolute', bottom:'18vh', left:40, maxWidth:'72vw' }}>
        <div style={{ fontFamily:mono, fontSize:9, letterSpacing:'0.4em', color:'rgba(140,80,255,0.35)', marginBottom:14 }}>
          <ScrambleText text={counter} />
        </div>
        <h1 style={{
          fontFamily: sans, fontWeight: 300,
          fontSize: 'clamp(26px, 4.5vw, 64px)',
          letterSpacing: '-0.02em', lineHeight: 1.0,
          color: isBH ? 'rgba(255,150,80,0.8)' : 'rgba(255,255,255,0.82)',
          margin: 0, marginBottom: 14,
          textShadow: isBH ? '0 0 30px rgba(255,100,30,0.4)' : 'none',
          transition: 'color 0.8s ease, text-shadow 0.8s ease',
        }}>
          <ScrambleText text={s.label} />
        </h1>
        <p style={{ fontFamily:mono, fontSize:10, letterSpacing:'0.12em', color:'rgba(255,255,255,0.18)', margin:0 }}>
          <ScrambleText text={s.sub} />
        </p>
      </div>

      {/* ── Right progress bar */}
      <div style={{
        position:'absolute', right:40, top:'50%', transform:'translateY(-50%)',
        display:'flex', flexDirection:'column', alignItems:'center', gap:8,
      }}>
        <span style={{ fontFamily:mono, fontSize:8, letterSpacing:'0.3em', color:'rgba(255,255,255,0.08)', writingMode:'vertical-rl', marginBottom:12 }}>
          <ScrambleText text="SCROLL" />
        </span>
        <div style={{ width:1, height:120, background:'rgba(140,80,255,0.1)', position:'relative' }}>
          <div style={{
            position:'absolute', left:-1.5, width:4, height:4, borderRadius:'50%',
            background:'rgba(140,80,255,0.8)',
            boxShadow:'0 0 8px rgba(140,80,255,0.8)',
            top:`${(Math.min(stationIdx, 4) / 4) * 116}px`,
            transition:'top 0.4s ease',
          }} />
        </div>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            width: i===stationIdx ? 3 : 1,
            height: i===stationIdx ? 3 : 1,
            borderRadius:'50%',
            background: i===stationIdx ? 'rgba(140,80,255,0.8)' : 'rgba(255,255,255,0.08)',
            transition:'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* ── Descend hint on first station */}
      {stationIdx === 0 && (
        <div style={{
          position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:8,
          opacity: Math.max(0, 1 - subProgress * 4),
        }}>
          <div style={{ width:1, height:36, background:'linear-gradient(to bottom,transparent,rgba(140,80,255,0.45))' }} />
          <span style={{ fontFamily:mono, fontSize:8, letterSpacing:'0.4em', color:'rgba(255,255,255,0.12)' }}>
            <ScrambleText text="DESCEND" />
          </span>
        </div>
      )}

      <style>{`
        @keyframes overlay-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
