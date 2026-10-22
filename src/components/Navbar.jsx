import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Button, Menu } from 'semantic-ui-react'
import { NAV_LINKS, SITE } from '../data/site'

export function Logo({ className = '' }) {
  return (
    <a href="#inicio" className={`logo ${className}`} aria-label={`${SITE.name}, inicio`}>
      la cakería<span className="logo__dot">.</span>
    </a>
  )
}

export default function Navbar({ onOrder }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar__inner">
        <Logo />

        <Menu as="nav" secondary className="navbar__links" aria-label="Principal">
          {NAV_LINKS.map((link) => (
            <Menu.Item key={link.href} as="a" href={link.href} className="navbar__link">
              {link.label}
            </Menu.Item>
          ))}
        </Menu>

        <div className="navbar__actions">
          <Button className="ck-btn ck-btn--cream navbar__order" onClick={() => onOrder()}>
            Hacer pedido
          </Button>
          <button
            type="button"
            className={`ck-round navbar__toggle ${open ? 'is-open' : ''}`}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ clipPath: 'circle(0% at 92% 4%)' }}
            animate={{ clipPath: 'circle(150% at 92% 4%)' }}
            exit={{ clipPath: 'circle(0% at 92% 4%)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav aria-label="Menú móvil">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
            <Button
              className="ck-btn ck-btn--red ck-btn--lg"
              onClick={() => {
                setOpen(false)
                onOrder()
              }}
            >
              Hacer pedido
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
