import { motion } from 'framer-motion'

function MatchScore({ score = 92, compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={compact ? 'match-score compact' : 'match-score'}
    >
      <div className="match-score-ring" style={{ '--score': `${score}%` }}>
        <span>{score}%</span>
      </div>
      <div className="match-text">
        <strong>Compatibility</strong>
        <small>You have similar budget preferences, study habits and sleep schedules.</small>
      </div>
    </motion.div>
  )
}

export default MatchScore
