import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link, NavLink } from 'react-router'
import { Button, Menu } from 'semantic-ui-react'
import { NAV_LINKS, SITE } from '../data/site'

export function Logo({ className = '' }) {
  return (
    <Link to="/" className={`logo ${className}`} aria-label={`${SITE.name}, inicio`}>
      la cakería<span className="logo__dot">.</span>
    </Link>
  )
}

/** Route links use NavLink (adds .active + aria-current); anchors stay plain <a>. */
const linkProps = (link) => (link.to ? { as: NavLink, to: link.to } : { as: 'a', href: link.href })

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
            <Menu.Item key={link.label} {...linkProps(link)} className="navbar__link">
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
              {NAV_LINKS.map((link, i) => {
                const Item = link.to ? NavLink : 'a'
                const target = link.to ? { to: link.to } : { href: link.href }
                return (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                  >
                    <Item {...target} onClick={() => setOpen(false)}>
                      {link.label}
                    </Item>
                  </motion.div>
                )
              })}
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
