import { motion } from 'framer-motion'
import { MapPin, MessageCircle, PiggyBank, Sparkles, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

function FlatmateCard({ flatmate, onConnect }) {
  return (
    <motion.article whileHover={{ y: -4 }} className="flatmate-card">
      {flatmate.profileImage ? (
        <img src={flatmate.profileImage} alt={flatmate.name} className="flatmate-photo" />
      ) : (
        <div className="flatmate-photo flatmate-initials" aria-label={`${flatmate.name} initials`}>
          {flatmate.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
        </div>
      )}

      <div className="flatmate-content">
        <div className="flatmate-header">
          <div>
            <h3>{flatmate.name}</h3>
            <p>{flatmate.course}</p>
          </div>
          <div className="match-pill">
            <Star size={12} fill="currentColor" /> {flatmate.compatibility}% Match
          </div>
        </div>

        <div className="profile-meta">
          <span><MapPin size={14} /> {flatmate.university}</span>
        </div>

        <div className="flatmate-facts">
          <div><PiggyBank size={14} /> ₹{flatmate.budget.min.toLocaleString()}–₹{flatmate.budget.max.toLocaleString()}</div>
          <div><Sparkles size={14} /> {flatmate.sleep}</div>
        </div>

        <div className="flatmate-tags">
          <span>{flatmate.studyStyle}</span>
          <span>{flatmate.lifestyle}</span>
        </div>

        <div className="card-actions split-actions">
          <Link to={`/flatmate/${flatmate.id}`} className="button button-light button-small">
            View Profile
          </Link>
          <button type="button" className="button button-dark button-small" onClick={() => onConnect?.(flatmate.id)}>
            Connect
          </button>
          {flatmate.phone && (
            <a
              href={`https://api.whatsapp.com/send?phone=91${flatmate.phone}&text=${encodeURIComponent(`Hi ${flatmate.name}, I'm looking for a flatmate and came across your profile. Are you still looking?`)}`}
              target="_blank"
              rel="noreferrer"
              className="button button-whatsapp button-small"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export default FlatmateCard
