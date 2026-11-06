import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CURRENCY } from '../data/products'

/**
 * Circular price stamp pinned to the corner of the 3D stage. It pops on
 * every change and briefly shows the difference (+$4, −$3) so the effect of
 * each option is easy to read.
 */
export default function PriceStamp({ price }) {
  // previous price kept in state (updated during render) to compute the delta
  const [shown, setShown] = useState({ price, delta: 0 })
  if (shown.price !== price) setShown({ price, delta: price - shown.price })
  const { delta } = shown

  return (
    <div className="price-stamp" role="status" aria-live="polite">
      <span className="price-stamp__label">precio estimado</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={price}
          className="price-stamp__value"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.25, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        >
          {CURRENCY}
          {price}
        </motion.span>
      </AnimatePresence>
      <AnimatePresence>
        {delta !== 0 && (
          <motion.span
            key={`${price}-${delta}`}
            className="price-stamp__delta"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {delta > 0 ? '+' : '−'}
            {CURRENCY}
            {Math.abs(delta)}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
