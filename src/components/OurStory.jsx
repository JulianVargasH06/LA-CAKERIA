import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { SITE } from '../data/site'
import CircleBadge from './CircleBadge'
import Reveal from './Reveal'

// Placeholder figures — edit to match the real bakery.
const FACTS = [
  { value: '2014', label: 'primer horno encendido' },
  { value: '36 h', label: 'de reposo en nuestras masas' },
  { value: '100 %', label: 'hecho a mano, en casa' },
]

export default function OurStory() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  const smallY = useTransform(scrollYProgress, [0, 1], ['18%', '-18%'])

  return (
    <section className="story section" id="historia" ref={ref} aria-labelledby="story-title">
      <div className="section__inner story__inner">
        <div className="story__media">
          <div className="story__photo">
            <motion.img
              src={SITE.storyImage}
              alt="Manos de pastelera amasando sobre una mesa enharinada"
              loading="lazy"
              style={{ y: imageY }}
            />
          </div>
          <motion.div className="story__photo story__photo--small" style={{ y: smallY }}>
            <img src={SITE.storyImageAlt} alt="Panes y masas recién horneadas" loading="lazy" />
          </motion.div>
          <CircleBadge className="story__badge" text="Desde 2014 · Pastelería de autor · " />
        </div>

        <div className="story__text">
          <Reveal as="p" className="eyebrow">Nuestra historia</Reveal>
          <Reveal as="h2" className="display story__title" id="story-title" delay={0.05}>
            Harina, paciencia <em>y</em> un horno pequeño.
          </Reveal>
          <Reveal as="p" className="story__lead" delay={0.1}>
            La Cakería nació en una cocina de barrio con una idea sencilla: hornear pocas cosas,
            pero hacerlas extraordinarias.
          </Reveal>
          <Reveal as="p" className="story__body" delay={0.15}>
            Trabajamos con cacao de origen, frutas de temporada y mantequilla de verdad. Cada
            torta se monta a mano la misma mañana en que sale por la puerta. Sin atajos, sin
            conservantes — solo oficio.
          </Reveal>
          <ul className="story__facts">
            {FACTS.map((f, i) => (
              <Reveal as="li" key={f.label} delay={0.2 + i * 0.08}>
                <strong>{f.value}</strong>
                <span>{f.label}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
