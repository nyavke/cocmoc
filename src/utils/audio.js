let _ctx = null

function ctx() {
  if (!_ctx) {
    const C = window.AudioContext || window.webkitAudioContext
    if (!C) return null
    _ctx = new C()
  }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

// Base frequencies per crystal station
const FREQS = [432, 528, 639, 741, 852]

// Crystal scroll chime — called when station changes
export function playChime(stationIdx) {
  const c = ctx(); if (!c) return
  const f = FREQS[stationIdx] || 528
  const now = c.currentTime

  const master = c.createGain()
  master.gain.setValueAtTime(0.10, now)
  master.gain.exponentialRampToValueAtTime(0.001, now + 1.4)
  master.connect(c.destination)

  // Two harmonic sines — fundamental + natural overtone
  ;[[f, 0], [f * 2.76, 0.01]].forEach(([freq, delay]) => {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = freq
    o.connect(master)
    o.start(now + delay)
    o.stop(now + 1.4)
  })

  // Click transient (high-freq sine, very short)
  const click = c.createOscillator()
  const cg = c.createGain()
  click.type = 'sine'
  click.frequency.value = f * 8
  cg.gain.setValueAtTime(0.04, now)
  cg.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
  click.connect(cg); cg.connect(c.destination)
  click.start(now); click.stop(now + 0.06)
}

// Crystal enter sound — whoosh + crystalline harmonics
export function playEnter(stationIdx) {
  const c = ctx(); if (!c) return
  const f = FREQS[stationIdx] || 528
  const now = c.currentTime

  // Whoosh (noise → bandpass)
  const buf = c.createBuffer(1, c.sampleRate, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const noise = c.createBufferSource()
  noise.buffer = buf
  const filt = c.createBiquadFilter()
  filt.type = 'bandpass'
  filt.frequency.setValueAtTime(3000, now)
  filt.frequency.exponentialRampToValueAtTime(f * 0.4, now + 1.6)
  filt.Q.value = 2.5
  const ng = c.createGain()
  ng.gain.setValueAtTime(0, now)
  ng.gain.linearRampToValueAtTime(0.22, now + 0.07)
  ng.gain.exponentialRampToValueAtTime(0.001, now + 1.6)
  noise.connect(filt); filt.connect(ng); ng.connect(c.destination)
  noise.start(now)

  // Crystal harmonics — staggered arrival
  ;[f * 0.5, f, f * 2, f * 3.14, f * 5].forEach((freq, i) => {
    const o = c.createOscillator()
    const g = c.createGain()
    const vol = [0.14, 0.11, 0.07, 0.04, 0.02][i]
    const t0 = now + i * 0.045
    o.type = 'sine'
    o.frequency.value = freq
    g.gain.setValueAtTime(0, t0)
    g.gain.linearRampToValueAtTime(vol, t0 + 0.03)
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 2.2 + i * 0.15)
    o.connect(g); g.connect(c.destination)
    o.start(t0); o.stop(t0 + 2.5)
  })
}

// Crystal exit sound — descending tone
export function playExit() {
  const c = ctx(); if (!c) return
  const now = c.currentTime
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(880, now)
  o.frequency.exponentialRampToValueAtTime(220, now + 0.35)
  g.gain.setValueAtTime(0.09, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
  o.connect(g); g.connect(c.destination)
  o.start(now); o.stop(now + 0.4)
}
