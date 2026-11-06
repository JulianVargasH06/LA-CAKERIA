import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router'
import { Button } from 'semantic-ui-react'
import { SITE } from '../data/site'
import CircleBadge from './CircleBadge'
import { ArrowIcon } from './Icons'
import Reveal from './Reveal'

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
          <CircleBadge className="story__badge" text="Hecho a mano · Pastelería de autor · " />
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
          <Reveal delay={0.2}>
            <Button as={Link} to="/nosotros" className="ck-btn ck-btn--dark">
              Conoce nuestra historia <ArrowIcon />
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
