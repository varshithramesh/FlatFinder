import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

function StatCard({ value, suffix = '', label, duration = 1200 }) {
  const [current, setCurrent] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const startTime = performance.now()

          const tick = (time) => {
            const progress = Math.min((time - startTime) / duration, 1)
            const eased = 1 - (1 - progress) ** 3
            const next = Math.round(value * eased)
            setCurrent(next)
            if (progress < 1) requestAnimationFrame(tick)
          }

          requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [duration, value])

  return (
    <motion.div ref={ref} className="stat-card" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <strong>{current}{suffix}</strong>
      <span>{label}</span>
    </motion.div>
  )
}

export default StatCard
