import { useEffect, useRef } from 'react'

const TRAIL_MAX = 28

export default function Cursor() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const mouse = { x: -300, y: -300 }
    const ring  = { x: -300, y: -300 }
    const trail = []

    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('mousemove', onMove)

    let angle = 0
    let raf

    const animate = () => {
      raf = requestAnimationFrame(animate)

      // Lagged ring
      ring.x += (mouse.x - ring.x) * 0.10
      ring.y += (mouse.y - ring.y) * 0.10

      // Trail history
      trail.push({ x: mouse.x, y: mouse.y })
      if (trail.length > TRAIL_MAX) trail.shift()

      angle += 0.022

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // ── Trail ──────────────────────────────────────────────────────
      for (let i = 1; i < trail.length; i++) {
        const t = i / trail.length
        const alpha = t * 0.55
        const r = t * 5
        const p = trail[i]
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r + 1)
        grd.addColorStop(0, `rgba(160,90,255,${alpha})`)
        grd.addColorStop(1, `rgba(100,40,200,0)`)
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
      }

      // ── Outer rotating ring (lagged) ───────────────────────────────
      ctx.save()
      ctx.translate(ring.x, ring.y)
      ctx.rotate(angle)

      // Ring itself
      ctx.beginPath()
      ctx.arc(0, 0, 14, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(140,80,255,0.35)'
      ctx.lineWidth = 1
      ctx.stroke()

      // 4 tick marks at 90° intervals
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2
        const c = Math.cos(a), s = Math.sin(a)
        ctx.beginPath()
        ctx.moveTo(c * 11, s * 11)
        ctx.lineTo(c * 17, s * 17)
        ctx.strokeStyle = 'rgba(180,110,255,0.7)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      ctx.restore()

      // ── Crosshair (exact mouse pos) ────────────────────────────────
      const cx = mouse.x, cy = mouse.y
      ctx.strokeStyle = 'rgba(210,170,255,0.9)'
      ctx.lineWidth = 1
      ctx.beginPath()
      // horizontal
      ctx.moveTo(cx - 11, cy); ctx.lineTo(cx - 4, cy)
      ctx.moveTo(cx +  4, cy); ctx.lineTo(cx + 11, cy)
      // vertical
      ctx.moveTo(cx, cy - 11); ctx.lineTo(cx, cy - 4)
      ctx.moveTo(cx, cy +  4); ctx.lineTo(cx, cy + 11)
      ctx.stroke()

      // Center dot glow
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 5)
      grd.addColorStop(0, 'rgba(220,180,255,1)')
      grd.addColorStop(1, 'rgba(140,80,255,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, 5, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()

      // Hard center pixel
      ctx.beginPath()
      ctx.arc(cx, cy, 1.2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,240,255,1)'
      ctx.fill()
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}
    />
  )
}
