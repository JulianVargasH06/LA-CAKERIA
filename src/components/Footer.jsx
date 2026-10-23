import { Link } from 'react-router'
import { Button, Icon } from 'semantic-ui-react'
import { NAV_LINKS, SITE } from '../data/site'
import { ArrowIcon } from './Icons'
import Reveal from './Reveal'

/** Contact block + footer. All data comes from src/data/site.js. */
export default function Footer({ onOrder }) {
  const year = new Date().getFullYear()

  return (
    <footer className="footer" id="contacto" aria-labelledby="contact-title">
      <div className="footer__inner">
        <div className="footer__cta">
          <Reveal as="p" className="eyebrow eyebrow--light">Contacto</Reveal>
          <Reveal as="h2" className="display footer__title" id="contact-title" delay={0.05}>
            ¿Celebramos <em>juntos?</em>
          </Reveal>
          <Reveal delay={0.1}>
            <Button className="ck-btn ck-btn--cream ck-btn--lg" onClick={() => onOrder()}>
              Solicitar pedido <ArrowIcon />
            </Button>
          </Reveal>
        </div>

        <div className="footer__grid">
          <div>
            <h3>Visítanos</h3>
            <p>
              {SITE.address}
              <br />
              {SITE.city}
            </p>
          </div>
          <div>
            <h3>Escríbenos</h3>
            <p>
              <a href={`tel:${SITE.phone.replace(/\s/g, '')}`}>{SITE.phone}</a>
              <br />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
          </div>
          <div>
            <h3>Horario</h3>
            <p>
              {SITE.hours.map((h) => (
                <span key={h.days} className="footer__hour">
                  {h.days} <b>{h.time}</b>
                </span>
              ))}
            </p>
          </div>
          <div>
            <h3>Síguenos</h3>
            <ul className="footer__socials">
              {SITE.socials.map((s) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noreferrer" aria-label={s.name} className="ck-round">
                    <Icon name={s.icon} fitted />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <nav aria-label="Pie de página">
            <Link to="/">Inicio</Link>
            {NAV_LINKS.map((l) =>
              l.to ? (
                <Link key={l.label} to={l.to}>
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href}>
                  {l.label}
                </a>
              ),
            )}
          </nav>
          <p>© {year} {SITE.name} — {SITE.slogan}</p>
        </div>

        <p className="footer__wordmark" aria-hidden="true">
          la cakería.
        </p>
      </div>
    </footer>
  )
}
