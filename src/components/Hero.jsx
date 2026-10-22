import { lazy, Suspense, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from 'semantic-ui-react'
import { useInView } from '../hooks/useInView'
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { hasWebGL } from '../hooks/webgl'
import CakeFallback from './CakeFallback'
import CircleBadge from './CircleBadge'
import SceneBoundary from './SceneBoundary'
import { ArrowIcon, ChocolateIcon, DropIcon, FlowerIcon, RaspberryIcon, SpongeIcon } from './Icons'

const CakeScene = lazy(() => import('../three/CakeScene'))

const EASE = [0.22, 1, 0.36, 1]

// "chocolate & frambuesa" split into lines; on mobile each word half becomes its own line
const TITLE = [
  ['choco', 'late'],
  ['& fram', 'buesa'],
]

const INGREDIENTS = [
  { key: 'choc', label: 'Chocolate', sub: 'amargo 70 %', icon: ChocolateIcon, tone: 'dark', note: 'Cacao de origen, fundido lento para un ganache espejo.' },
  { key: 'rasp', label: 'Frambuesa', sub: 'fresca', icon: RaspberryIcon, tone: 'red', note: 'Fruta de temporada seleccionada cada mañana.' },
  { key: 'sponge', label: 'Bizcocho', sub: 'de cacao', icon: SpongeIcon, tone: 'caramel', note: 'Miga húmeda, horneada en molde de hierro.' },
  { key: 'jam', label: 'Compota', sub: 'de frambuesa', icon: DropIcon, tone: 'pink', note: 'Cocción corta para conservar acidez y color.' },
]

function SplitLetters({ text, delay }) {
  return (
    <span className="split" aria-hidden="true">
      {[...text].map((ch, i) => (
        <motion.span
          key={i}
          className="split__char"
          initial={{ y: '105%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 1, delay: delay + i * 0.035, ease: EASE }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </span>
  )
}

function IngredientPill({ item, index, open, onToggle }) {
  const Icon = item.icon
  return (
    <motion.li
      className={`pill pill--${item.tone} ${open ? 'is-open' : ''}`}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 1.1 + index * 0.1, ease: EASE }}
    >
      <button type="button" className="pill__btn" aria-expanded={open} onClick={onToggle}>
        <span className="pill__icon"><Icon /></span>
        <span className="pill__label">
          {item.label}
          <small>{item.sub}</small>
        </span>
        <span className="pill__plus" aria-hidden="true" />
      </button>
      <motion.p
        className="pill__note"
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        {item.note}
      </motion.p>
    </motion.li>
  )
}

export default function Hero({ onOrder }) {
  const heroRef = useRef(null)
  const isMobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const inView = useInView(heroRef)
  const [openPill, setOpenPill] = useState(null)
  const webgl = hasWebGL()

  const fallback = <CakeFallback className="hero__fallback" />
  const sceneProps = { mobile: isMobile, animate: !reduced, active: inView, eventSource: heroRef }

  return (
    <section className="hero" id="inicio" ref={heroRef} aria-labelledby="hero-title">
      <div className="hero__panel">
        <svg className="hero__blob" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
          <path d="M70 18C240 2 400 30 560 14 720 0 860 8 940 26 990 40 996 140 988 300 980 470 1000 610 990 780 984 900 992 968 900 984 720 1000 560 978 380 992 230 1004 90 996 34 970 0 940 8 820 14 640 20 470 0 320 10 170 14 70 22 26 70 18Z" />
        </svg>
        <span className="hero__grain" aria-hidden="true" />

        {webgl && !isMobile && (
          <div className="hero__stage hero__stage--back" aria-hidden="true">
            <SceneBoundary fallback={null}>
              <Suspense fallback={null}>
                <CakeScene layer="back" {...sceneProps} />
              </Suspense>
            </SceneBoundary>
          </div>
        )}

        <h1 className="hero__title" id="hero-title">
          <span className="sr-only">Chocolate y frambuesa</span>
          {TITLE.map((line, li) => (
            <span className="hero__line" key={li}>
              {line.map((part, pi) => (
                <span className="hero__part" key={pi}>
                  <SplitLetters text={part} delay={0.15 + li * 0.18 + pi * 0.12} />
                </span>
              ))}
            </span>
          ))}
        </h1>

        <div className="hero__stage hero__stage--front">
          {webgl ? (
            <SceneBoundary fallback={fallback}>
              <Suspense fallback={<div className="hero__loading" aria-hidden="true" />}>
                <CakeScene layer="front" {...sceneProps} />
              </Suspense>
            </SceneBoundary>
          ) : (
            fallback
          )}
        </div>

        <motion.p
          className="hero__kicker"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
        >
          <span>N.º 01</span> Edición de autor — Otoño
        </motion.p>

        <CircleBadge className="hero__badge" />

        <div className="hero__copy">
          <motion.p
            className="hero__claim"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.9, ease: EASE }}
          >
            Intenso.<br />Cremoso.<br />Irresistible.
          </motion.p>
          <motion.p
            className="hero__text"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.9, ease: EASE }}
          >
            Chocolate oscuro que se encuentra con frambuesa vibrante en cada bocado. Horneado a mano, cada mañana.
          </motion.p>
          <motion.div
            className="hero__ctas"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.9, ease: EASE }}
          >
            <Button as="a" href="#menu" className="ck-btn ck-btn--dark">
              Ver el menú <ArrowIcon />
            </Button>
            <Button className="ck-btn ck-btn--outline" onClick={() => onOrder('Dark Chocolate Raspberry')}>
              Pedir esta torta
            </Button>
          </motion.div>
        </div>

        <ul className="hero__pills" aria-label="Ingredientes">
          {INGREDIENTS.map((item, i) => (
            <IngredientPill
              key={item.key}
              item={item}
              index={i}
              open={openPill === item.key}
              onToggle={() => setOpenPill((k) => (k === item.key ? null : item.key))}
            />
          ))}
        </ul>

        <a href="#menu" className="hero__scroll" aria-label="Bajar al menú">
          <FlowerIcon size={18} />
        </a>
      </div>
    </section>
  )
}
