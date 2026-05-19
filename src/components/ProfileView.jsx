import { useState } from 'react'

const mono = "'Space Mono', monospace"
const sans = "'Space Grotesk', sans-serif"
const G = '140, 80, 255'

function Avatar({ user }) {
  const url  = user.user_metadata?.avatar_url
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || '?'
  const initials = name.slice(0, 2).toUpperCase()
  const [imgErr, setImgErr] = useState(false)

  return (
    <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', inset: -4, borderRadius: '50%',
        border: `1px solid rgba(${G}, 0.5)`,
        boxShadow: `0 0 18px rgba(${G}, 0.35), 0 0 40px rgba(${G}, 0.12)`,
        animation: 'avatarPulse 3s ease-in-out infinite',
      }} />
      {url && !imgErr ? (
        <img
          src={url} alt="" onError={() => setImgErr(true)}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: `2px solid rgba(${G}, 0.25)` }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: `rgba(${G}, 0.08)`,
          border: `1px solid rgba(${G}, 0.35)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: mono, fontSize: 24, color: `rgba(${G}, 0.9)`, letterSpacing: '0.05em',
        }}>
          {initials}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid rgba(${G}, 0.06)` }}>
      <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.18)' }}>{label}</span>
      <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.12em', color: accent ? `rgba(${G}, 0.75)` : 'rgba(255,255,255,0.5)' }}>{value}</span>
    </div>
  )
}

function StatusDot() {
  return (
    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'rgba(80,255,160,0.9)', boxShadow: '0 0 8px rgba(80,255,160,0.7)', animation: 'statusPulse 2s ease-in-out infinite', marginRight: 8, verticalAlign: 'middle' }} />
  )
}

function LogoutBtn({ onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: mono, fontSize: 10, letterSpacing: '0.3em',
        border: `1px solid rgba(${G}, ${hov ? 0.45 : 0.18})`,
        background: hov ? `rgba(${G}, 0.08)` : 'transparent',
        color: hov ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
        padding: '11px 0', width: '100%', borderRadius: 0, cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      ВЫХОД ИЗ СИСТЕМЫ
    </button>
  )
}

export default function ProfileView({ user, onLogout }) {
  const name        = user.user_metadata?.full_name || user.email?.split('@')[0] || 'CITIZEN'
  const provider    = (user.app_metadata?.provider || 'email').toUpperCase()
  const cosmicId    = user.id?.replace(/-/g, '').slice(0, 16).toUpperCase()
  const joined      = new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.5em', color: `rgba(${G}, 0.4)`, marginBottom: 8 }}>
          ◈ COSMIC IDENTITY
        </div>
        <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 'clamp(18px, 2.5vw, 24px)', color: 'rgba(255,255,255,0.88)', letterSpacing: '0.04em' }}>
          CITIZEN PROFILE
        </div>
      </div>

      <div style={{ height: 1, background: `linear-gradient(to right, rgba(${G}, 0.25), transparent)`, marginBottom: 24 }} />

      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
        <Avatar user={user} />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: sans, fontWeight: 500, fontSize: 17,
            color: 'rgba(255,255,255,0.92)', letterSpacing: '0.06em',
            textTransform: 'uppercase', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {name}
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
            <StatusDot />
            <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.3em', color: 'rgba(80,255,160,0.7)' }}>ONLINE</span>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div style={{ marginBottom: 20 }}>
        <Field label="COSMIC.ID"  value={cosmicId + '···'} accent />
        <Field label="CLEARANCE"  value="CITIZEN · LVL 1"  accent />
        <Field label="PROVIDER"   value={provider} />
        <Field label="JOINED"     value={joined} />
        <Field label="NODE"       value="SINGULARITY" />
      </div>

      {/* Power bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.18)' }}>COSMIC POWER</span>
          <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.2em', color: `rgba(${G}, 0.6)` }}>LVL 1 / ∞</span>
        </div>
        <div style={{ height: 3, background: `rgba(${G}, 0.08)`, borderRadius: 0, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: '4%',
            background: `linear-gradient(to right, rgba(${G}, 0.6), rgba(${G}, 1))`,
            boxShadow: `0 0 8px rgba(${G}, 0.6)`,
            animation: 'powerPulse 2s ease-in-out infinite',
          }} />
        </div>
      </div>

      <LogoutBtn onClick={onLogout} />

      <style>{`
        @keyframes avatarPulse {
          0%, 100% { box-shadow: 0 0 18px rgba(${G}, 0.35), 0 0 40px rgba(${G}, 0.12); }
          50%       { box-shadow: 0 0 26px rgba(${G}, 0.55), 0 0 55px rgba(${G}, 0.2); }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes powerPulse {
          0%, 100% { opacity: 0.8; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
