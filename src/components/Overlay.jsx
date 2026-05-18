import { useRef, useEffect, useState } from 'react'
import { playTypeClick, setSoundEnabled } from '../utils/audio'
import { useLang } from '../context/LangContext'
import { T } from '../utils/i18n'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·'

function ScrambleText({ text, fast = false }) {
  const ref = useRef(null)
  const prev = useRef('')

  useEffect(() => {
    if (!ref.current || prev.current === text) return
    prev.current = text
    const el = ref.current
    let frame = 0, prevDone = 0, raf
    const revealAt = fast ? 22 : 100
    const totalFrames = fast ? 32 : 120
    const run = () => {
      const p = Math.min(frame / revealAt, 1)
      const done = Math.floor(p * text.length)
      if (done > prevDone) { playTypeClick(); prevDone = done }
      el.textContent = text.split('').map((ch, i) =>
        ch === ' ' ? ' ' : i < done ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]
      ).join('')
      frame++
      if (frame <= totalFrames) raf = requestAnimationFrame(run)
      else el.textContent = text
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [text])

  return <span ref={ref}>{text}</span>
}

export default function Overlay({ stationIdx, subProgress, inBlackHole }) {
  const { lang } = useLang()
  const t = T[lang]
  const s = t.stations[Math.min(stationIdx, t.stations.length - 1)]
  const isBH = stationIdx >= 5
  const mono = "'Space Mono', monospace"
  const sans = "'Space Grotesk', sans-serif"
  const [soundOn, setSoundOn] = useState(true)
  const [soundHoverKey, setSoundHoverKey] = useState(0)

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
        <div style={{ display:'flex', alignItems:'center' }}>
          <span style={{ fontFamily:mono, fontSize:10, letterSpacing:'0.4em', color:'rgba(255,255,255,0.55)', fontWeight:700 }}>
            <ScrambleText text="COCMOC.RU" />
          </span>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8, paddingLeft:2 }}>
          <span style={{ fontFamily:mono, fontSize:9, letterSpacing:'0.18em', color:'rgba(255,255,255,0.45)' }}>
            <ScrambleText text={t.ui.scroll} fast />
          </span>
          <button
            onClick={toggleSound}
            onMouseEnter={() => setSoundHoverKey(k => k + 1)}
            style={{
              fontFamily: mono, fontSize: 9, letterSpacing: '0.18em',
              color: soundOn ? 'rgba(140,80,255,0.7)' : 'rgba(255,255,255,0.35)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, textAlign: 'left', pointerEvents: 'auto',
              transition: 'color 0.3s ease',
            }}
          >
            <ScrambleText key={soundHoverKey} text={soundOn ? t.ui.soundOn : t.ui.soundOff} fast />
          </button>
        </div>
      </div>

      {/* ── Tag top-right */}
      <div style={{ position:'absolute', top:36, right:40, fontFamily:mono, fontSize:9, letterSpacing:'0.3em', color:'rgba(140,80,255,0.55)' }}>
        ✦ <ScrambleText text={s.tag} />
      </div>

      {/* ── Main title bottom-left */}
      <div style={{ position:'absolute', bottom:'8vh', left:40, maxWidth:'72vw' }}>
        <div style={{ fontFamily:mono, fontSize:9, letterSpacing:'0.4em', color:'rgba(140,80,255,0.6)', marginBottom:14 }}>
          <ScrambleText text={counter} />
        </div>
        <h1 style={{
          fontFamily: sans, fontWeight: 300,
          fontSize: 'clamp(26px, 4.5vw, 64px)',
          letterSpacing: '-0.02em', lineHeight: 1.0,
          color: isBH ? 'rgba(255,150,80,0.95)' : 'rgba(255,255,255,0.95)',
          margin: 0, marginBottom: 14,
          textShadow: isBH ? '0 0 30px rgba(255,100,30,0.4)' : 'none',
          transition: 'color 0.8s ease, text-shadow 0.8s ease',
        }}>
          <ScrambleText text={s.label} />
        </h1>
        <p style={{ fontFamily:mono, fontSize:10, letterSpacing:'0.12em', color:'rgba(255,255,255,0.38)', margin:0 }}>
          <ScrambleText text={s.sub} />
        </p>
      </div>

      {/* ── Right progress bar */}
      <div style={{
        position:'absolute', right:40, top:'50%', transform:'translateY(-50%)',
        display:'flex', flexDirection:'column', alignItems:'center', gap:8,
      }}>
        <span style={{ fontFamily:mono, fontSize:8, letterSpacing:'0.3em', color:'rgba(255,255,255,0.25)', writingMode:'vertical-rl', marginBottom:12 }}>
          <ScrambleText text={t.ui.scrollBar} />
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
          <span style={{ fontFamily:mono, fontSize:8, letterSpacing:'0.4em', color:'rgba(255,255,255,0.3)' }}>
            <ScrambleText text={t.ui.descend} fast />
          </span>
        </div>
      )}

      <style>{`
        @keyframes overlay-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
