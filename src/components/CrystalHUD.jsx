import { useEffect, useRef, useState } from 'react'
import { playTypeClick } from '../utils/audio'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—+/\\'
const mono = "'Space Mono', monospace"

const HUD = [
  { id: 'CRYSTAL_01', tag: 'COCMOC.RU',      x: '+00.00', y: '+00.00', z: '+006.00', date: '2024.01.01' },
  { id: 'CRYSTAL_02', tag: 'NOVA PROTOCOL',  x: '+02.50', y: '-00.50', z: '-032.00', date: '2024.03.14' },
  { id: 'CRYSTAL_03', tag: 'STELLAR MARKET', x: '-02.50', y: '+00.50', z: '-064.00', date: '2024.06.28' },
  { id: 'CRYSTAL_04', tag: 'VOID IDENTITY',  x: '+03.00', y: '-01.00', z: '-096.00', date: '2024.09.15' },
  { id: 'CRYSTAL_05', tag: 'NEBULA GRID',    x: '-02.00', y: '+01.00', z: '-128.00', date: '2024.12.01' },
]

function ScrambleText({ text, delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    let frame = 0, raf, prevDone = 0
    el.textContent = ''
    const run = () => {
      const p = Math.min(frame / 18, 1)
      const done = Math.floor(p * text.length)
      if (done > prevDone) { playTypeClick(); prevDone = done }
      el.textContent = text.split('').map((c, i) =>
        c === ' ' ? ' ' : i < done ? c : CHARS[Math.floor(Math.random() * CHARS.length)]
      ).join('')
      frame++
      if (frame <= 26) raf = requestAnimationFrame(run)
      else el.textContent = text
    }
    const tid = setTimeout(() => { raf = requestAnimationFrame(run) }, delay)
    return () => { clearTimeout(tid); cancelAnimationFrame(raf) }
  }, [text, delay])
  return <span ref={ref} />
}

export default function CrystalHUD({ stationIdx, inBlackHole }) {
  const [visible, setVisible] = useState(false)
  const [hudIdx, setHudIdx] = useState(0)
  const [mountKey, setMountKey] = useState(0)
  const prevIdx = useRef(-1)
  const tidRef = useRef()

  useEffect(() => {
    if (inBlackHole || stationIdx >= 5) { setVisible(false); return }
    if (stationIdx === prevIdx.current) return
    prevIdx.current = stationIdx
    clearTimeout(tidRef.current)
    setHudIdx(stationIdx)
    setMountKey(k => k + 1)
    setVisible(true)
    tidRef.current = setTimeout(() => setVisible(false), 4500)
    return () => clearTimeout(tidRef.current)
  }, [stationIdx, inBlackHole])

  const h = HUD[hudIdx] || HUD[0]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 15, pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transition: visible ? 'opacity 0.25s ease' : 'opacity 1.0s ease',
    }}>
      {/* SVG annotation lines */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {/* → top-left label */}
        <line x1="49%" y1="41%" x2="22%" y2="16%" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <line x1="21%" y1="15.5%" x2="23%" y2="15%" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

        {/* → right coords */}
        <line x1="54%" y1="40%" x2="74%" y2="33%" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <line x1="74%" y1="32.5%" x2="76%" y2="33.5%" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

        {/* → bottom-right */}
        <line x1="54%" y1="48%" x2="74%" y2="68%" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        <line x1="74%" y1="67.5%" x2="76%" y2="68.5%" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

        {/* Corner brackets around crystal */}
        <line x1="44%" y1="35%" x2="44%" y2="30%" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        <line x1="44%" y1="30%" x2="47%" y2="30%" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />

        <line x1="56%" y1="35%" x2="56%" y2="30%" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        <line x1="56%" y1="30%" x2="53%" y2="30%" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />

        <line x1="44%" y1="54%" x2="44%" y2="59%" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        <line x1="44%" y1="59%" x2="47%" y2="59%" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />

        <line x1="56%" y1="54%" x2="56%" y2="59%" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        <line x1="56%" y1="59%" x2="53%" y2="59%" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
      </svg>

      {/* All text remounts on new station via key */}
      <div key={mountKey}>
        {/* Top-left: id + tag */}
        <div style={{
          position: 'absolute', top: '12%', left: '8%',
          fontFamily: mono, fontSize: 10, letterSpacing: '0.22em',
          lineHeight: 1.9, color: 'rgba(255,255,255,0.72)',
        }}>
          <div><ScrambleText text={h.id} delay={80} /></div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9 }}>
            <ScrambleText text={h.tag} delay={200} />
          </div>
        </div>

        {/* Right: X Y Z */}
        <div style={{
          position: 'absolute', top: '30%', right: '24%',
          fontFamily: mono, fontSize: 9, letterSpacing: '0.2em',
          lineHeight: 2.1, color: 'rgba(255,255,255,0.45)',
          textAlign: 'right',
        }}>
          <div>X&nbsp;&nbsp;<ScrambleText text={h.x} delay={350} /></div>
          <div>Y&nbsp;&nbsp;<ScrambleText text={h.y} delay={440} /></div>
          <div>Z&nbsp;&nbsp;<ScrambleText text={h.z} delay={530} /></div>
        </div>

        {/* Bottom-right: date + hint */}
        <div style={{
          position: 'absolute', bottom: '29%', right: '24%',
          fontFamily: mono, fontSize: 9, letterSpacing: '0.22em',
          lineHeight: 1.9, textAlign: 'right',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.35)' }}>
            D&nbsp;<ScrambleText text={h.date} delay={620} />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
            <ScrambleText text="CLICK TO EXPLORE" delay={750} />
          </div>
        </div>
      </div>
    </div>
  )
}
