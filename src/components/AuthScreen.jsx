import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const STARS = Array.from({ length: 70 }, (_, i) => ({
  left:    (i * 137.508) % 100,
  top:     (i * 97.3)   % 100,
  size:    0.5 + (i % 5) * 0.4,
  opacity: 0.05 + (i % 8) * 0.04,
  dur:     2 + (i % 5) * 0.8,
  delay:   (i % 7) * 0.5,
}))

const mono = "'Space Mono', monospace"
const sans = "'Space Grotesk', sans-serif"
const G = '140, 80, 255'

function Input({ type, placeholder, value, onChange, required, minLength, maxLength, autoComplete }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      minLength={minLength}
      maxLength={maxLength}
      autoComplete={autoComplete}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        fontFamily: mono,
        fontSize: 12,
        letterSpacing: '0.12em',
        background: `rgba(${G}, 0.04)`,
        border: `1px solid rgba(${G}, ${focused ? 0.55 : 0.18})`,
        borderRadius: 2,
        color: 'rgba(255,255,255,0.82)',
        padding: '11px 14px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: focused ? `0 0 14px rgba(${G}, 0.12)` : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    />
  )
}

function Btn({ children, onClick, disabled, submit, ghost }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type={submit ? 'submit' : 'button'}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: mono,
        fontSize: 10,
        letterSpacing: '0.3em',
        border: `1px solid rgba(${G}, ${hov ? 0.65 : 0.25})`,
        background: ghost
          ? 'transparent'
          : hov ? `rgba(${G}, 0.16)` : `rgba(${G}, 0.07)`,
        color: hov ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.45)',
        padding: '12px 0',
        width: '100%',
        borderRadius: 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        textShadow: hov ? `0 0 12px rgba(${G}, 0.7)` : 'none',
        boxShadow: hov ? `0 0 22px rgba(${G}, 0.1)` : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: `rgba(${G}, 0.1)` }} />
      <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.12)' }}>ИЛИ</span>
      <div style={{ flex: 1, height: 1, background: `rgba(${G}, 0.1)` }} />
    </div>
  )
}

function ErrorMsg({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      fontFamily: mono, fontSize: 9, letterSpacing: '0.1em',
      color: 'rgba(255, 90, 90, 0.85)',
      padding: '8px 12px',
      border: '1px solid rgba(255,90,90,0.2)',
      borderRadius: 2,
      background: 'rgba(255,50,50,0.05)',
    }}>
      {msg}
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const clear = () => setError(null)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true); clear()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setStep('verify')
    setLoading(false)
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true); clear()
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'signup' })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); clear()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleGoogle = async () => {
    clear()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setStep('form')
    setEmail(''); setPassword(''); setCode('')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
      transition: 'opacity 2s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>

      {/* Stars */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {STARS.map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${s.left}%`, top: `${s.top}%`,
            width: s.size, height: s.size,
            borderRadius: '50%',
            background: `rgba(${G}, ${s.opacity})`,
            animation: `bh-twinkle ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>

      {/* Top line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, rgba(${G}, 0.15), transparent)` }} />
      <div style={{ position: 'absolute', top: 32, left: 40, pointerEvents: 'none' }}>
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.4em', color: `rgba(${G}, 0.25)`, fontWeight: 700 }}>✦ COCMOC.RU</span>
      </div>
      <div style={{ position: 'absolute', top: 36, right: 40, fontFamily: mono, fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }}>THE SINGULARITY</div>

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 1, width: 'clamp(280px, 88vw, 360px)', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {user ? (
          /* ── Profile ── */
          <>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.45em', color: `rgba(${G}, 0.45)` }}>ИДЕНТИФИКАЦИЯ ПОДТВЕРЖДЕНА</div>
              <div style={{
                fontFamily: sans, fontSize: 'clamp(12px, 2vw, 15px)',
                color: 'rgba(255,255,255,0.65)', letterSpacing: '0.04em', wordBreak: 'break-all',
              }}>
                {user.email}
              </div>
            </div>
            <div style={{ height: 1, background: `linear-gradient(to right, transparent, rgba(${G}, 0.2), transparent)` }} />
            <Btn onClick={handleLogout} ghost>ВЫХОД ИЗ СИСТЕМЫ</Btn>
          </>

        ) : step === 'verify' ? (
          /* ── OTP verify ── */
          <>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.45em', color: `rgba(${G}, 0.45)` }}>ПОДТВЕРЖДЕНИЕ АККАУНТА</div>
              <div style={{ fontFamily: sans, fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>
                Код отправлен на {email}
              </div>
            </div>
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                placeholder="_ _ _ _ _ _"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                required
                style={{
                  fontFamily: mono,
                  fontSize: 28,
                  letterSpacing: '0.6em',
                  textAlign: 'center',
                  background: `rgba(${G}, 0.04)`,
                  border: `1px solid rgba(${G}, 0.25)`,
                  borderRadius: 2,
                  color: 'rgba(255,255,255,0.85)',
                  padding: '14px 0',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              <ErrorMsg msg={error} />
              <Btn submit disabled={loading || code.length < 6}>
                {loading ? 'ПРОВЕРКА...' : 'ПОДТВЕРДИТЬ'}
              </Btn>
            </form>
            <button
              onClick={() => { setStep('form'); clear() }}
              style={{ background: 'none', border: 'none', fontFamily: mono, fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.18)', cursor: 'pointer', padding: 0 }}
            >
              ← НАЗАД
            </button>
          </>

        ) : (
          /* ── Login / Register ── */
          <>
            {/* Tabs */}
            <div style={{ display: 'flex' }}>
              {[['login', 'ВОЙТИ'], ['register', 'РЕГИСТРАЦИЯ']].map(([t, label]) => (
                <button key={t} onClick={() => { setTab(t); clear() }} style={{
                  flex: 1, background: 'none', border: 'none',
                  borderBottom: `1px solid rgba(${G}, ${tab === t ? 0.55 : 0.1})`,
                  fontFamily: mono, fontSize: 9, letterSpacing: '0.35em',
                  color: tab === t ? `rgba(${G}, 0.9)` : 'rgba(255,255,255,0.18)',
                  padding: '10px 0', cursor: 'pointer',
                  textShadow: tab === t ? `0 0 10px rgba(${G}, 0.5)` : 'none',
                  transition: 'all 0.3s',
                }}>
                  {label}
                </button>
              ))}
            </div>

            <form
              onSubmit={tab === 'login' ? handleLogin : handleRegister}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <Input
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Input
                type="password"
                placeholder={tab === 'login' ? 'ПАРОЛЬ' : 'ПАРОЛЬ (мин. 6 символов)'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />
              <ErrorMsg msg={error} />
              <Btn submit disabled={loading}>
                {loading ? '...' : tab === 'login' ? 'ВОЙТИ В СИСТЕМУ' : 'СОЗДАТЬ АККАУНТ'}
              </Btn>
            </form>

            <Divider />

            <Btn onClick={handleGoogle} ghost>G · ПРОДОЛЖИТЬ ЧЕРЕЗ GOOGLE</Btn>
          </>
        )}
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
        input::placeholder { color: rgba(255,255,255,0.18); }
      `}</style>
    </div>
  )
}
