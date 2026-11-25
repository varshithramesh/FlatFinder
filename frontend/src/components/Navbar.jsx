import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Find a Flat', to: '/find-flat' },
  { label: 'Find a Flatmate', to: '/find-flatmate' },
  { label: 'About & How It Works', to: '/about' },
]

function Navbar({ user, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header className={`nav-shell ${isScrolled ? 'nav-shell-scrolled' : ''}`}>
      <nav className="nav container" aria-label="Main navigation">
        <Link to="/" className="brand" aria-label="FlatFinder home">
          <motion.span
            className="brand-mark"
            aria-hidden="true"
          >
            FF
          </motion.span>
          <span>FlatFinder</span>
        </Link>

        <div className="nav-links desktop-only">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-actions desktop-only">
          {user ? (
            <button type="button" className="text-link" onClick={onLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login" className="text-link">Login</Link>
              <Link to="/signup" className="button button-dark">Get Started</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="menu-toggle mobile-only"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mobile-menu"
            id="mobile-navigation"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mobile-actions">
              {user ? (
                <button type="button" className="text-link" onClick={() => { onLogout(); setMenuOpen(false) }}>Logout</button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="text-link">Login</Link>
                  <Link to="/signup" onClick={() => setMenuOpen(false)} className="button button-dark">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
