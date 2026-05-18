let _soundEnabled = false
export function setSoundEnabled(v) {
  _soundEnabled = v
  if (_ambGain) {
    const c = ctx(); if (!c) return
    const now = c.currentTime
    _ambGain.gain.cancelScheduledValues(now)
    _ambGain.gain.setValueAtTime(_ambGain.gain.value, now)
    _ambGain.gain.linearRampToValueAtTime(v ? AMB_VOL : 0, now + 0.8)
  }
}
export function isSoundEnabled() { return _soundEnabled }

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

// Browsers block AudioContext until a user gesture. Pre-unlock on the earliest
// possible signals so sounds work from the first scroll/scramble.
function _unlock() {
  ctx() // creates + resumes context
  ;['mousemove','pointerdown','keydown','scroll','touchstart'].forEach(
    e => document.removeEventListener(e, _unlock)
  )
}
;['mousemove','pointerdown','keydown','scroll','touchstart'].forEach(
  e => document.addEventListener(e, _unlock, { once: false, passive: true })
)

// Base frequencies per crystal station
const FREQS = [432, 528, 639, 741, 852]

// Crystal scroll chime — called when station changes
export function playChime(stationIdx) {
  if (!_soundEnabled) return
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
  if (!_soundEnabled) return
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

// Typewriter click — short noise burst, globally throttled so overlapping scramblers don't stack
let _lastClick = 0
export function playTypeClick() {
  if (!_soundEnabled) return
  const c = ctx(); if (!c) return
  const now = c.currentTime
  if (now - _lastClick < 0.028) return   // ~35 clicks/sec max
  _lastClick = now
  const len = Math.floor(c.sampleRate * 0.011)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = c.createBufferSource(); src.buffer = buf
  const filt = c.createBiquadFilter()
  filt.type = 'bandpass'
  filt.frequency.value = 3800 + Math.random() * 1800
  filt.Q.value = 1.8
  const g = c.createGain()
  g.gain.setValueAtTime(0.032, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.011)
  src.connect(filt); filt.connect(g); g.connect(c.destination)
  src.start(now)
}

// Black hole entry — dramatic whoosh + bass drop + pitch sweep
export function playBlackHole() {
  if (!_soundEnabled) return
  const c = ctx(); if (!c) return
  const now = c.currentTime

  // Whoosh: noise through bandpass sweeping 3kHz → 40Hz
  const buf = c.createBuffer(1, c.sampleRate * 3, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const noise = c.createBufferSource(); noise.buffer = buf
  const filt = c.createBiquadFilter()
  filt.type = 'bandpass'
  filt.frequency.setValueAtTime(3200, now)
  filt.frequency.exponentialRampToValueAtTime(42, now + 1.8)
  filt.Q.value = 0.7
  const ng = c.createGain()
  ng.gain.setValueAtTime(0, now)
  ng.gain.linearRampToValueAtTime(0.22, now + 0.06)
  ng.gain.exponentialRampToValueAtTime(0.001, now + 3.2)
  noise.connect(filt); filt.connect(ng); ng.connect(c.destination)
  noise.start(now)

  // Deep bass dive
  const bass = c.createOscillator()
  const bg = c.createGain()
  bass.type = 'sine'
  bass.frequency.setValueAtTime(90, now)
  bass.frequency.exponentialRampToValueAtTime(22, now + 2.2)
  bg.gain.setValueAtTime(0, now)
  bg.gain.linearRampToValueAtTime(0.28, now + 0.12)
  bg.gain.exponentialRampToValueAtTime(0.001, now + 3.0)
  bass.connect(bg); bg.connect(c.destination)
  bass.start(now); bass.stop(now + 3.5)

  // Harmonic pitch drops — 3 sines plunging into the singularity
  ;[520, 1040, 2080].forEach((f0, i) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(f0, now)
    o.frequency.exponentialRampToValueAtTime(f0 * 0.05, now + 1.4)
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(0.04 - i * 0.01, now + 0.04)
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.4)
    o.connect(g); g.connect(c.destination)
    o.start(now); o.stop(now + 1.6)
  })
}

// Crystal exit sound — descending tone
export function playExit() {
  if (!_soundEnabled) return
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

// ── Ambient music ─────────────────────────────────────────────────────────────
const AMB_VOL = 0.14
let _ambGain = null
let _ambNodes = []
let _ambSubOscs = []

export function startAmbient() {
  if (_ambNodes.length > 0) return
  const c = ctx(); if (!c) return
  const now = c.currentTime

  _ambGain = c.createGain()
  _ambGain.gain.setValueAtTime(0, now)
  if (_soundEnabled) _ambGain.gain.linearRampToValueAtTime(AMB_VOL, now + 8)
  _ambGain.connect(c.destination)

  // Sub drone — two detuned sines create slow ~0.3 Hz beating
  ;[55, 55.3].forEach(f => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'sine'; o.frequency.value = f
    g.gain.value = 0.55
    o.connect(g); g.connect(_ambGain)
    o.start(now)
    _ambNodes.push(o)
    _ambSubOscs.push(o)
  })

  // Mid pad — 110 Hz sine with very slow frequency wobble
  ;(() => {
    const o = c.createOscillator()
    const lfo = c.createOscillator()
    const lfoG = c.createGain()
    const g = c.createGain()
    o.type = 'sine'; o.frequency.value = 110
    lfo.type = 'sine'; lfo.frequency.value = 0.047
    lfoG.gain.value = 2.5
    g.gain.value = 0.30
    lfo.connect(lfoG); lfoG.connect(o.frequency)
    o.connect(g); g.connect(_ambGain)
    o.start(now); lfo.start(now)
    _ambNodes.push(o, lfo)
  })()

  // High shimmer — 220 Hz with slow gain breathing
  ;(() => {
    const o = c.createOscillator()
    const lfo = c.createOscillator()
    const lfoG = c.createGain()
    const g = c.createGain()
    o.type = 'sine'; o.frequency.value = 220
    lfo.type = 'sine'; lfo.frequency.value = 0.063
    lfoG.gain.value = 0.04
    g.gain.value = 0.09
    lfo.connect(lfoG); lfoG.connect(g.gain)
    o.connect(g); g.connect(_ambGain)
    o.start(now); lfo.start(now)
    _ambNodes.push(o, lfo)
  })()

  // Noise floor — filtered white noise for subtle space texture
  ;(() => {
    const bufLen = Math.floor(c.sampleRate * 3.73)
    const buf = c.createBuffer(1, bufLen, c.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1
    const src = c.createBufferSource()
    src.buffer = buf; src.loop = true
    const filt = c.createBiquadFilter()
    filt.type = 'lowpass'; filt.frequency.value = 90; filt.Q.value = 0.4
    const g = c.createGain(); g.gain.value = 0.07
    src.connect(filt); filt.connect(g); g.connect(_ambGain)
    src.start(now)
    _ambNodes.push(src)
  })()
}

export function stopAmbient() {
  if (!_ambGain) return
  const c = ctx(); if (!c) return
  const now = c.currentTime
  _ambGain.gain.cancelScheduledValues(now)
  _ambGain.gain.setValueAtTime(_ambGain.gain.value, now)
  _ambGain.gain.linearRampToValueAtTime(0, now + 2)
  const nodes = [..._ambNodes]
  _ambNodes = []; _ambSubOscs = []; _ambGain = null
  setTimeout(() => nodes.forEach(n => { try { n.stop() } catch (_) {} }), 2200)
}

// t=0 → normal space  t=1 → deep inside black hole
export function setAmbientMood(t) {
  if (!_ambSubOscs.length) return
  const c = ctx(); if (!c) return
  const now = c.currentTime
  ;[55, 55.3].forEach((base, i) => {
    _ambSubOscs[i].frequency.setTargetAtTime(base + (36 - base) * t, now, 2.0)
  })
}
