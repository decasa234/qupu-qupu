// src/components/Reveal.tsx
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export default function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        type: 'spring',
        stiffness: 95,
        damping: 14,
        mass: 0.9,
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}
