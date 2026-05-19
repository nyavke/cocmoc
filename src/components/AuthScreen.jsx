import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import CrystalPreview from './CrystalPreview'
import ProfileView from './ProfileView'

const CRYSTAL = {
  scaleY: 2.3, seed: 7,
  colA: [0.18, 0.05, 0.70],
  colB: [0.55, 0.20, 1.00],
  colC: [0.85, 0.65, 1.00],
}

const STARS = Array.from({ length: 70 }, (_, i) => ({
  left:    (i * 137.508) % 100,
  top:     (i * 97.3)   % 100,
  size:    0.5 + (i % 5) * 0.4,
  opacity: 0.05 + (i % 8) * 0.04,
  dur:     2 + (i % 5) * 0.8,
  delay:   (i % 7) * 0.5,
}))

const TELEM = [
  ['SYS.STATUS',  'ONLINE'],
  ['AUTH.LAYER',  'ACTIVE'],
  ['ENCRYPT',     'AES-256'],
  ['NODE',        'SINGULARITY'],
]

const mono = "'Space Mono', monospace"
const sans = "'Space Grotesk', sans-serif"
const G = '140, 80, 255'

function HudCorners() {
  const c = `rgba(${G}, 0.45)`
  const base = { position: 'absolute', width: 18, height: 18 }
  return (
    <>
      <div style={{ ...base, top: -1, left: -1,  borderTop: `1px solid ${c}`, borderLeft:  `1px solid ${c}` }} />
      <div style={{ ...base, top: -1, right: -1, borderTop: `1px solid ${c}`, borderRight: `1px solid ${c}` }} />
      <div style={{ ...base, bottom: -1, left: -1,  borderBottom: `1px solid ${c}`, borderLeft:  `1px solid ${c}` }} />
      <div style={{ ...base, bottom: -1, right: -1, borderBottom: `1px solid ${c}`, borderRight: `1px solid ${c}` }} />
    </>
  )
}

function Input({ type, placeholder, value, onChange, required, minLength, maxLength, autoComplete }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type} placeholder={placeholder} value={value} onChange={onChange}
      required={required} minLength={minLength} maxLength={maxLength} autoComplete={autoComplete}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        fontFamily: mono, fontSize: 12, letterSpacing: '0.12em',
        background: focused ? `rgba(${G}, 0.06)` : `rgba(${G}, 0.03)`,
        border: `1px solid rgba(${G}, ${focused ? 0.55 : 0.18})`,
        borderRadius: 0,
        color: 'rgba(255,255,255,0.85)',
        padding: '11px 14px', outline: 'none',
        width: '100%', boxSizing: 'border-box',
        boxShadow: focused ? `0 0 16px rgba(${G}, 0.12), inset 0 0 10px rgba(${G}, 0.04)` : 'none',
        transition: 'all 0.3s',
      }}
    />
  )
}

function Btn({ children, onClick, disabled, submit, ghost }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type={submit ? 'submit' : 'button'} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: mono, fontSize: 10, letterSpacing: '0.3em',
        border: `1px solid rgba(${G}, ${hov ? 0.7 : ghost ? 0.2 : 0.3})`,
        background: ghost
          ? hov ? `rgba(${G}, 0.08)` : 'transparent'
          : hov ? `rgba(${G}, 0.2)` : `rgba(${G}, 0.08)`,
        color: hov ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
        padding: '12px 0', width: '100%', borderRadius: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        textShadow: hov ? `0 0 12px rgba(${G}, 0.7)` : 'none',
        boxShadow: hov ? `0 0 24px rgba(${G}, 0.12)` : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {children}
    </button>
  )
}

function ErrMsg({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      fontFamily: mono, fontSize: 9, letterSpacing: '0.1em',
      color: 'rgba(255,90,90,0.85)', padding: '8px 12px',
      border: '1px solid rgba(255,90,90,0.2)',
      background: 'rgba(255,50,50,0.04)',
    }}>
      ✕ {msg}
    </div>
  )
}

export default function AuthScreen({ visible }) {
  const [tab,      setTab]      = useState('login')
  const [step,     setStep]     = useState('form')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [code,     setCode]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [user,     setUser]     = useState(null)
  const [blink,    setBlink]    = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 530)
    return () => clearInterval(id)
  }, [])

  const clear = () => setError(null)

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); clear()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message); else setStep('verify')
    setLoading(false)
  }

  const handleVerify = async (e) => {
    e.preventDefault(); setLoading(true); clear()
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'signup' })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); clear()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleGoogle = async () => {
    clear()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://cocmoc.ru' },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setStep('form'); setEmail(''); setPassword(''); setCode('')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: '#000008',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
      transition: 'opacity 2s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden',
    }}>

      {/* Stars */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {STARS.map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${s.left}%`, top: `${s.top}%`,
            width: s.size, height: s.size, borderRadius: '50%',
            background: `rgba(${G}, ${s.opacity})`,
            animation: `bh-twinkle ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>

      {/* Global scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1, zIndex: 1,
        background: `linear-gradient(to right, transparent, rgba(${G}, 0.25), transparent)`,
        animation: 'globalScan 8s linear infinite',
        pointerEvents: 'none',
      }} />

      {/* Top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, rgba(${G}, 0.15), transparent)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 32, left: 40, pointerEvents: 'none' }}>
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.4em', color: `rgba(${G}, 0.3)`, fontWeight: 700 }}>✦ COCMOC.RU</span>
      </div>
      <div style={{ position: 'absolute', top: 36, right: 40, fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }}>THE SINGULARITY</div>

      {/* Layout */}
      <div className="auth-layout">

        {/* Crystal side */}
        <div className="auth-crystal-side">
          <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.4em', color: `rgba(${G}, 0.3)`, marginBottom: 14, textAlign: 'center' }}>
            STATION 01 · COCMOC.RU
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <CrystalPreview {...CRYSTAL} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
            {TELEM.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.15)' }}>{k}</span>
                <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.2em', color: `rgba(${G}, 0.55)` }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="auth-form-side">
          <div style={{
            position: 'relative',
            padding: '32px 28px',
            border: `1px solid rgba(${G}, 0.12)`,
            background: 'rgba(0,0,8,0.75)',
            backdropFilter: 'blur(10px)',
          }}>
            <HudCorners />

            {/* Form scan line */}
            <div style={{
              position: 'absolute', left: 0, right: 0, height: 1,
              background: `linear-gradient(to right, transparent, rgba(${G}, 0.5), transparent)`,
              animation: 'formScan 4s linear infinite',
              pointerEvents: 'none',
            }} />

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.5em', color: `rgba(${G}, 0.4)`, marginBottom: 8 }}>
                ◈ IDENTITY PROTOCOL
              </div>
              <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 'clamp(18px, 2.5vw, 24px)', color: 'rgba(255,255,255,0.88)', letterSpacing: '0.04em' }}>
                SYSTEM ACCESS{blink ? '▋' : ' '}
              </div>
            </div>

            <div style={{ height: 1, background: `linear-gradient(to right, rgba(${G}, 0.25), transparent)`, marginBottom: 22 }} />

            {user ? (
              <ProfileView user={user} onLogout={handleLogout} />

            ) : step === 'verify' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontFamily: sans, fontSize: 13, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em' }}>
                  Код отправлен на <span style={{ color: `rgba(${G}, 0.7)` }}>{email}</span>
                </div>
                <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    type="text" placeholder="_ _ _ _ _ _"
                    value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={8} required
                    style={{
                      fontFamily: mono, fontSize: 26, letterSpacing: '0.6em', textAlign: 'center',
                      background: `rgba(${G}, 0.04)`,
                      border: `1px solid rgba(${G}, 0.25)`,
                      borderRadius: 0, color: 'rgba(255,255,255,0.88)',
                      padding: '16px 0', outline: 'none',
                      width: '100%', boxSizing: 'border-box',
                    }}
                  />
                  <ErrMsg msg={error} />
                  <Btn submit disabled={loading || code.length < 1}>
                    {loading ? 'ПРОВЕРКА...' : 'ПОДТВЕРДИТЬ'}
                  </Btn>
                </form>
                <button onClick={() => { setStep('form'); clear() }} style={{ background: 'none', border: 'none', fontFamily: mono, fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  ← НАЗАД
                </button>
              </div>

            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Tabs */}
                <div style={{ display: 'flex' }}>
                  {[['login', 'ВОЙТИ'], ['register', 'РЕГИСТРАЦИЯ']].map(([t, label]) => (
                    <button key={t} onClick={() => { setTab(t); clear() }} style={{
                      flex: 1, background: 'none', border: 'none',
                      borderBottom: `1px solid rgba(${G}, ${tab === t ? 0.55 : 0.1})`,
                      fontFamily: mono, fontSize: 9, letterSpacing: '0.3em',
                      color: tab === t ? `rgba(${G}, 0.9)` : 'rgba(255,255,255,0.2)',
                      padding: '9px 0', cursor: 'pointer',
                      textShadow: tab === t ? `0 0 10px rgba(${G}, 0.5)` : 'none',
                      transition: 'all 0.3s',
                    }}>
                      {label}
                    </button>
                  ))}
                </div>

                <form onSubmit={tab === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Input type="email" placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
                  <Input
                    type="password"
                    placeholder={tab === 'login' ? 'ПАРОЛЬ' : 'ПАРОЛЬ · МИН. 6 СИМВОЛОВ'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    minLength={6} required
                  />
                  <ErrMsg msg={error} />
                  <Btn submit disabled={loading}>
                    {loading ? '...' : tab === 'login' ? 'ВОЙТИ В СИСТЕМУ' : 'СОЗДАТЬ АККАУНТ'}
                  </Btn>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: `rgba(${G}, 0.1)` }} />
                  <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.12)' }}>ИЛИ</span>
                  <div style={{ flex: 1, height: 1, background: `rgba(${G}, 0.1)` }} />
                </div>

                <Btn onClick={handleGoogle} ghost>G · ПРОДОЛЖИТЬ ЧЕРЕЗ GOOGLE</Btn>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ position: 'absolute', bottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, pointerEvents: 'none' }}>
        <div style={{ width: 1, height: 32, background: `linear-gradient(to bottom, transparent, rgba(${G}, 0.2))` }} />
        <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.05)' }}>✦ 2024 · ALL RIGHTS RESERVED</span>
      </div>

      <style>{`
        @keyframes bh-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50%       { opacity: 1; transform: scale(1.3); }
        }
        @keyframes globalScan {
          0%   { top: -1px; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 0.5; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes formScan {
          0%   { top: 0%; opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        input::placeholder { color: rgba(255,255,255,0.18); }
        .auth-layout {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 56px;
          position: relative;
          z-index: 2;
          padding: 0 40px;
          max-width: 840px;
          width: 100%;
        }
        .auth-crystal-side {
          display: flex;
          flex-direction: column;
          width: 260px;
          height: 360px;
          flex-shrink: 0;
        }
        .auth-form-side {
          flex: 1;
          min-width: 0;
          max-width: 380px;
        }
        @media (max-width: 700px) {
          .auth-layout {
            flex-direction: column;
            gap: 20px;
            padding: 80px 20px 40px;
            overflow-y: auto;
            max-height: 100vh;
            align-items: center;
          }
          .auth-crystal-side {
            width: 160px;
            height: 180px;
          }
          .auth-form-side {
            width: 100%;
            max-width: 340px;
          }
        }
      `}</style>
    </div>
  )
}
