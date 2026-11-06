import { motion } from 'motion/react'
import CircleBadge from './CircleBadge'

const EASE = [0.22, 1, 0.36, 1]

/** Same organic outline as the home hero panel. */
export const PANEL_PATH =
  'M70 18C240 2 400 30 560 14 720 0 860 8 940 26 990 40 996 140 988 300 980 470 1000 610 990 780 984 900 992 968 900 984 720 1000 560 978 380 992 230 1004 90 996 34 970 0 940 8 820 14 640 20 470 0 320 10 170 14 70 22 26 70 18Z'

/**
 * Red frame + organic cream panel + print grain: the hero's visual language,
 * reused to open every inner page. Put any layout inside.
 */
export function PagePanel({ className = '', children, labelledBy }) {
  return (
    <section className={`page-panel ${className}`} aria-labelledby={labelledBy}>
      <div className="page-panel__inner">
        <svg className="page-panel__blob" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
          <path d={PANEL_PATH} />
        </svg>
        <span className="page-panel__grain" aria-hidden="true" />
        {children}
      </div>
    </section>
  )
}

/**
 * Editorial page opening: eyebrow, oversized title, short intro,
 * rotating stamp and an optional visual (`aside`).
 */
export default function PageHeader({ id, eyebrow, title, intro, badge, aside, children }) {
  return (
    <PagePanel className={`page-head ${aside ? 'page-head--split' : ''}`} labelledBy={id}>
      <div className="page-head__text">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          className="page-head__title"
          id={id}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.05, ease: EASE }}
        >
          {title}
        </motion.h1>
        {intro && (
          <motion.p
            className="page-head__intro"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
          >
            {intro}
          </motion.p>
        )}
        {children}
      </div>
      {aside && (
        <motion.div
          className="page-head__aside"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
        >
          {aside}
        </motion.div>
      )}
      {badge && <CircleBadge className="page-head__badge" text={badge} />}
    </PagePanel>
  )
}
