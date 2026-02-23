const SECTIONS = ['welcome', 'birthday', 'message', 'poetry', 'koko', 'dua']

export default function NavDots({ active, scrollTo }) {
  return (
    <nav className="nav-dots" aria-label="Section navigation">
      {SECTIONS.map((id, i) => (
        <button
          key={id}
          className={`nav-dot${active === i ? ' active' : ''}`}
          onClick={() => scrollTo(i)}
          aria-label={`Go to section ${i + 1}`}
        />
      ))}
    </nav>
  )
}
