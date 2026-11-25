import { Facebook, Instagram, Linkedin, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

const footerLinks = [
  { label: 'Contact', to: '/about' },
]

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div className="brand footer-brand"><span className="brand-mark" aria-hidden="true">FF</span><span>FlatFinder</span></div>
          <p className="footer-tagline">Find Your Place. Find Your People.</p>
        </div>

        <div className="footer-links">
          {footerLinks.map((item) => (
            <Link key={item.label} to={item.to} className="footer-link">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="social-row" aria-label="Social links">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-icon"><Facebook size={16} /></a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-icon"><Instagram size={16} /></a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-icon"><Linkedin size={16} /></a>
          <a href="mailto:hello@flatfinder.app" aria-label="Email" className="social-icon"><Mail size={16} /></a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 FlatFinder</span>
      </div>
    </footer>
  )
}

export default Footer
