import { useRef, useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import NavDots from './components/NavDots'
import IntroGate from './components/IntroGate'
import WelcomeSection from './sections/WelcomeSection'
import BirthdaySection from './sections/BirthdaySection'
import MessageSection from './sections/MessageSection'
import PoetrySection from './sections/PoetrySection'
import KokoSection from './sections/KokoSection'
import DuaSection from './sections/DuaSection'
import bgMusic from './music/your-song.mp3'

const SECTION_COUNT = 6

export default function App() {
  const scrollContainerRef = useRef(null)
  const sectionRefs = useRef(Array.from({ length: SECTION_COUNT }, () => null))
  const audioRef = useRef(null)

  const [isIntroDone, setIsIntroDone] = useState(false)
  const [musicStarted, setMusicStarted] = useState(false)
  const [activeSection, setActiveSection] = useState(0)

  const setRef = useCallback((index) => (el) => {
    sectionRefs.current[index] = el
  }, [])

  /* ── Callback from IntroGate once animation sequence completes ── */
  const handleEnterComplete = useCallback(() => {
    setIsIntroDone(true)
    setMusicStarted(true)
  }, [])

  /* ── Fallback music start for any interaction after intro ─────── */
  useEffect(() => {
    if (!isIntroDone || musicStarted) return
    const startMusic = async () => {
      if (!audioRef.current) return
      try {
        audioRef.current.volume = 0.4
        await audioRef.current.play()
        setMusicStarted(true)
        window.removeEventListener('pointerdown', startMusic)
        window.removeEventListener('touchstart', startMusic)
        window.removeEventListener('click', startMusic)
      } catch (_) {}
    }
    window.addEventListener('pointerdown', startMusic)
    window.addEventListener('touchstart', startMusic)
    window.addEventListener('click', startMusic)
    return () => {
      window.removeEventListener('pointerdown', startMusic)
      window.removeEventListener('touchstart', startMusic)
      window.removeEventListener('click', startMusic)
    }
  }, [isIntroDone, musicStarted])

  /* ── Track active section for NavDots ────────────────────────── */
  useEffect(() => {
    if (!isIntroDone) return
    const container = scrollContainerRef.current
    if (!container) return

    const observers = sectionRefs.current.map((el, i) => {
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(i) },
        { root: container, threshold: 0.5 }
      )
      obs.observe(el)
      return obs
    })

    return () => observers.forEach(obs => obs?.disconnect())
  }, [isIntroDone])

  const scrollTo = useCallback((index) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <>
      {/* ── Background Music ───────────────────────────────────────── */}
      <audio
        ref={audioRef}
        src={bgMusic}
        loop
        preload="auto"
        playsInline
        style={{ display: 'none' }}
      />

      {/* ── Cinematic Intro Gate ───────────────────────────────────── */}
      <AnimatePresence>
        {!isIntroDone && (
          <IntroGate
            key="intro"
            audioRef={audioRef}
            onEnterComplete={handleEnterComplete}
          />
        )}
      </AnimatePresence>

      {/* ── Main Site (revealed after intro) ──────────────────────── */}
      <AnimatePresence>
        {isIntroDone && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{ position: 'relative', width: '100%', height: '100%' }}
          >
            <div className="noise-overlay" aria-hidden="true" />

            <NavDots active={activeSection} scrollTo={scrollTo} />

            <main ref={scrollContainerRef} className="scroll-container" role="main">
              <WelcomeSection sectionRef={setRef(0)} />
              <BirthdaySection sectionRef={setRef(1)} />
              <MessageSection sectionRef={setRef(2)} />
              <PoetrySection sectionRef={setRef(3)} />
              <KokoSection sectionRef={setRef(4)} />
              <DuaSection sectionRef={setRef(5)} />
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
