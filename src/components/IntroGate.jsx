import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Floating particle data ─────────────────────────────────────── */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  duration: 6 + Math.random() * 8,
  delay: Math.random() * 5,
  opacity: 0.15 + Math.random() * 0.35,
}))

/* ─── Rain hearts spawned on tap ─────────────────────────────────── */
const RAIN = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: 4 + (i / 17) * 92 + (Math.random() - 0.5) * 6,
  delay: Math.random() * 0.8,
  size: 14 + Math.random() * 18,
  drift: (Math.random() - 0.5) * 40,
  duration: 1.6 + Math.random() * 0.8,
}))

/* ─── Stars background ───────────────────────────────────────────── */
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: 0.5 + Math.random() * 1.5,
  opacity: 0.2 + Math.random() * 0.6,
  blink: 2.5 + Math.random() * 4,
}))

/* ═══════════════════════════════════════════════════════════════════ */
export default function IntroGate({ audioRef, onEnterComplete }) {
  const [phase, setPhase] = useState('idle')   // idle | hearts | fade
  const [heartsDone, setHeartsDone] = useState(false)
  const hasTriggered = useRef(false)

  /* Auto-cleanup: if somehow skipped */
  useEffect(() => {
    if (heartsDone) {
      const t = setTimeout(() => setPhase('fade'), 200)
      return () => clearTimeout(t)
    }
  }, [heartsDone])

  useEffect(() => {
    if (phase === 'fade') {
      const t = setTimeout(() => onEnterComplete(), 900)
      return () => clearTimeout(t)
    }
  }, [phase, onEnterComplete])

  const handleTap = useCallback(async () => {
    if (hasTriggered.current) return
    hasTriggered.current = true

    /* ── Start music (mobile-safe) ─────────────────────────────── */
    if (audioRef?.current) {
      try {
        audioRef.current.volume = 0.4
        audioRef.current.currentTime = 0
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) await playPromise.catch(() => {})
      } catch (_) {}
    }

    /* ── Trigger hearts rain → fade ────────────────────────────── */
    setPhase('hearts')
    setTimeout(() => setHeartsDone(true), 2000)
  }, [audioRef])

  return (
    <AnimatePresence>
      {phase !== 'fade' && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          style={styles.root}
          onPointerDown={handleTap}
        >
          {/* ── Gradient sky ──────────────────────────────────────── */}
          <div style={styles.gradientBg} />

          {/* ── Stars ─────────────────────────────────────────────── */}
          <svg style={styles.starsSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
            {STARS.map(s => (
              <motion.circle
                key={s.id}
                cx={s.x} cy={s.y} r={s.r}
                fill="white"
                initial={{ opacity: s.opacity }}
                animate={{ opacity: [s.opacity, s.opacity * 0.2, s.opacity] }}
                transition={{ duration: s.blink, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 3 }}
              />
            ))}
          </svg>

          {/* ── Floating soft orbs ────────────────────────────────── */}
          {PARTICLES.map(p => (
            <motion.div
              key={p.id}
              style={{
                ...styles.particle,
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                opacity: p.opacity,
              }}
              animate={{ y: [0, -22, 0], opacity: [p.opacity, p.opacity * 1.6, p.opacity] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          {/* ── Heart rain (on tap) ────────────────────────────────── */}
          <AnimatePresence>
            {phase === 'hearts' && RAIN.map(h => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0.9, y: -40, x: 0, scale: 0.4 }}
                animate={{
                  opacity: 0,
                  y: typeof window !== 'undefined' ? window.innerHeight + 60 : 900,
                  x: h.drift,
                  scale: [0.4, 1.1, 0.9],
                }}
                transition={{ duration: h.duration, delay: h.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  ...styles.rainHeart,
                  left: `${h.x}%`,
                  fontSize: h.size,
                }}
              >
                💙
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ── Center card ───────────────────────────────────────── */}
          <motion.div
            style={styles.card}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={
              phase === 'hearts'
                ? { opacity: 1, y: 0, scale: 1.04, filter: 'drop-shadow(0 0 32px #4fa3e088)' }
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={{ duration: 1.1, ease: 'easeOut' }}
          >
            {/* Shimmer border */}
            <motion.div
              style={styles.shimmerBorder}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />

            {/* Inner content */}
            <div style={styles.cardInner}>
              {/* Icon */}
              <motion.div
                style={styles.moonIcon}
                animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                🌙
              </motion.div>

              {/* Title */}
              <motion.h1
                style={styles.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.9 }}
              >
                Happy Birthday, Meriam
                <span style={styles.titleHeart}> 💙</span>
              </motion.h1>

              {/* Divider */}
              <motion.div
                style={styles.divider}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              />

              {/* Subtitle */}
              <motion.p
                style={styles.subtitle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.9 }}
              >
                A little moment… before the magic begins
              </motion.p>

              {/* CTA Button */}
              <motion.button
                style={styles.button}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.8 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 28px #4fa3e066' }}
                whileTap={{ scale: 0.97 }}
                onPointerDown={(e) => { e.stopPropagation(); handleTap() }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  Tap to Begin 💙
                </motion.span>
              </motion.button>

              {/* Fine print */}
              <motion.p
                style={styles.hint}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                transition={{ delay: 1.8, duration: 1 }}
              >
                with sound
              </motion.p>
            </div>
          </motion.div>

          {/* ── Vignette ──────────────────────────────────────────── */}
          <div style={styles.vignette} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
const styles = {
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
  },

  gradientBg: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse 80% 60% at 30% 20%, #0d1f4a 0%, transparent 70%),
      radial-gradient(ellipse 70% 50% at 70% 80%, #0a1930 0%, transparent 60%),
      linear-gradient(160deg, #070e22 0%, #0c1836 40%, #071325 80%, #050c1e 100%)
    `,
  },

  starsSvg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },

  particle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #7eb8e8 0%, #4fa3e0 60%, transparent 100%)',
    pointerEvents: 'none',
    filter: 'blur(1px)',
  },

  rainHeart: {
    position: 'fixed',
    top: 0,
    pointerEvents: 'none',
    zIndex: 10000,
    lineHeight: 1,
    filter: 'drop-shadow(0 0 6px #4fa3e099)',
  },

  card: {
    position: 'relative',
    width: 'min(88vw, 420px)',
    borderRadius: 28,
    padding: 3,
    background: 'transparent',
    zIndex: 10,
  },

  shimmerBorder: {
    position: 'absolute',
    inset: 0,
    borderRadius: 28,
    padding: 1.5,
    background: 'linear-gradient(135deg, #4fa3e0 0%, #1a3a6b 30%, #7ec8f0 60%, #1a3a6b 80%, #4fa3e0 100%)',
    backgroundSize: '200% 200%',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'destination-out',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },

  cardInner: {
    background: 'rgba(8, 20, 50, 0.72)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    borderRadius: 26,
    padding: '44px 36px 36px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },

  moonIcon: {
    fontSize: 38,
    marginBottom: 20,
    filter: 'drop-shadow(0 0 12px #4fa3e055)',
    lineHeight: 1,
  },

  title: {
    margin: 0,
    fontSize: 'clamp(1.35rem, 5vw, 1.75rem)',
    fontWeight: 700,
    color: '#e8f4ff',
    textAlign: 'center',
    letterSpacing: '0.02em',
    lineHeight: 1.3,
    fontFamily: `'Georgia', 'Times New Roman', serif`,
    textShadow: '0 0 30px #4fa3e055',
  },

  titleHeart: {
    display: 'inline-block',
    filter: 'drop-shadow(0 0 8px #4fa3e0)',
  },

  divider: {
    width: 56,
    height: 1.5,
    background: 'linear-gradient(90deg, transparent, #4fa3e088, transparent)',
    borderRadius: 2,
    margin: '18px 0 14px',
    transformOrigin: 'center',
  },

  subtitle: {
    margin: 0,
    fontSize: 'clamp(0.78rem, 2.5vw, 0.92rem)',
    color: '#8ab8d8',
    textAlign: 'center',
    letterSpacing: '0.06em',
    fontStyle: 'italic',
    lineHeight: 1.6,
    fontFamily: `'Georgia', serif`,
    maxWidth: 260,
  },

  button: {
    marginTop: 32,
    padding: '14px 36px',
    borderRadius: 50,
    border: '1.5px solid #4fa3e055',
    background: 'linear-gradient(135deg, rgba(79,163,224,0.18) 0%, rgba(30,80,150,0.25) 100%)',
    color: '#c8e6ff',
    fontSize: '0.95rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    transition: 'border-color 0.3s',
    fontFamily: `'Georgia', serif`,
    WebkitTapHighlightColor: 'transparent',
  },

  hint: {
    marginTop: 14,
    margin: '14px 0 0',
    fontSize: '0.72rem',
    color: '#4fa3e0',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontFamily: 'system-ui, sans-serif',
  },

  vignette: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(3,8,20,0.65) 100%)',
    pointerEvents: 'none',
  },
}
