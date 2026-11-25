import { motion } from 'framer-motion'
import { BedDouble, MapPin, Ruler, Save, ShieldCheck, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

function PropertyCard({ property, saved, onToggleSave }) {
  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      className="property-card"
    >
      <div className="property-image-wrap">
        {['SV Building', 'VR Building'].includes(property.name) ? (
          <div className="property-card-image property-card-placeholder" aria-hidden="true" />
        ) : (
          <img src={property.images[0]} alt={`${property.name} cover`} className="property-card-image" />
        )}
        <div className="property-badges">
          {property.verified && (
            <span className="status-badge verified"><ShieldCheck size={12} /> Verified Listing</span>
          )}
          <button
            type="button"
            className={`icon-button ${saved ? 'saved' : ''}`}
            aria-label={saved ? 'Remove saved property' : 'Save property'}
            onClick={() => onToggleSave(property.id)}
          >
            <Save size={16} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="property-card-body">
        <div className="property-header-row">
          <h3>{property.name}</h3>
          <span className="rating-pip"><Star size={12} fill="currentColor" /> 4.8</span>
        </div>

        <div className="meta-line">
          <MapPin size={14} /> {property.location}
        </div>

        <div className="property-metrics">
          <span>{property.distance} km from campus</span>
          <span>₹{property.rent.toLocaleString()} / month</span>
        </div>

        <div className="property-meta-grid">
          <span><BedDouble size={14} /> {property.roomType}</span>
          <span><Ruler size={14} /> {property.furnished}</span>
        </div>

        <div className="amenity-list">
          {property.amenities.slice(0, 3).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <div className="card-actions">
          <Link to={`/property/${property.id}`} className="button button-dark button-small">
            View Details
          </Link>
          <button type="button" className="inline-link" onClick={() => onToggleSave(property.id)}>
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </motion.article>
  )
}

export default PropertyCard
