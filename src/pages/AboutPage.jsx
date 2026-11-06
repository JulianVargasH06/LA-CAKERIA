import { Link } from 'react-router'
import { Button } from 'semantic-ui-react'
import CircleBadge from '../components/CircleBadge'
import { ArrowIcon, FlowerIcon } from '../components/Icons'
import Marquee from '../components/Marquee'
import PageHeader from '../components/PagePanel'
import Reveal from '../components/Reveal'
import { ABOUT_HERO_IMAGE, ESSENCE, GALLERY, INGREDIENTS, PRINCIPLES, PROCESS } from '../data/about'

/** "/nosotros" — brand story, craft process, ingredients and gallery. */
export default function AboutPage() {
  return (
    <>
      <title>Nuestra historia — La Cakería</title>
      <PageHeader
        id="about-title"
        eyebrow="Nuestra historia"
        title={
          <>
            El oficio detrás de <em>cada</em> torta
          </>
        }
        intro="Harina, paciencia y un horno pequeño. Así trabajamos: con pocas recetas, mucho tiempo y las manos en la masa."
        badge="Pastelería de autor · Hecho a mano · "
        aside={
          <div className="about-head__photo">
            <img src={ABOUT_HERO_IMAGE.src} alt={ABOUT_HERO_IMAGE.alt} />
          </div>
        }
      />

      <div className="sheet about">
        {/* 1 · Esencia */}
        <section className="section__inner about-essence" aria-labelledby="essence-title">
          <Reveal as="p" className="eyebrow">Nuestra esencia</Reveal>
          <Reveal as="h2" className="about-essence__quote" id="essence-title" delay={0.05}>
            “{ESSENCE.quote}”
          </Reveal>
          <div className="about-essence__body">
            <Reveal className="about-essence__photo" delay={0.1}>
              <img src={ESSENCE.image.src} alt={ESSENCE.image.alt} loading="lazy" />
            </Reveal>
            <div className="about-essence__text">
              {ESSENCE.paragraphs.map((p, i) => (
                <Reveal as="p" key={i} delay={0.15 + i * 0.08}>
                  {p}
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 2 · Proceso */}
        <section className="section__inner about-process" aria-labelledby="process-title">
          <header className="about-section-head">
            <Reveal as="p" className="eyebrow">El proceso artesanal</Reveal>
            <Reveal as="h2" className="display" id="process-title" delay={0.05}>
              Cuatro gestos, <em>sin atajos</em>
            </Reveal>
          </header>
          <ol className="about-process__list">
            {PROCESS.map((step, i) => (
              <Reveal as="li" key={step.title} className="about-step" delay={i * 0.08}>
                <div className="about-step__photo">
                  <img src={step.image} alt={step.alt} loading="lazy" />
                </div>
                <span className="about-step__num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </section>
      </div>

      {/* 3 · Ingredientes (sobre el rojo, entre dos hojas crema) */}
      <section className="about-ingredients" aria-labelledby="ingredients-title">
        <div className="section__inner">
          <Reveal as="p" className="eyebrow eyebrow--light">Nuestros ingredientes</Reveal>
          <Reveal as="h2" className="display about-ingredients__title" id="ingredients-title" delay={0.05}>
            Lo que <em>sí</em> lleva
          </Reveal>
          <ul className="about-ingredients__list">
            {INGREDIENTS.map((item, i) => (
              <Reveal as="li" key={item.name} className={`about-ingredient pill--${item.tone}`} delay={i * 0.08}>
                <FlowerIcon size={20} />
                <h3>{item.name}</h3>
                <p>{item.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <Marquee />

      <div className="sheet about about--closing">
        {/* 4 · Manera de crear */}
        <section className="section__inner about-create" aria-labelledby="create-title">
          <div className="about-create__head">
            <Reveal as="p" className="eyebrow">Nuestra manera de crear</Reveal>
            <Reveal as="h2" className="display" id="create-title" delay={0.05}>
              Una torta es <em>una</em> experiencia
            </Reveal>
            <CircleBadge className="about-create__badge" text="Sabor · Detalle · Mesa compartida · " />
          </div>
          <ul className="about-create__list">
            {PRINCIPLES.map((p, i) => (
              <Reveal as="li" key={p.title} delay={0.1 + i * 0.08}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* 5 · Galería */}
        <section className="section__inner about-gallery" aria-labelledby="gallery-title">
          <Reveal as="h2" className="display about-gallery__title" id="gallery-title">
            Del taller <em>a tu mesa</em>
          </Reveal>
          <div className="about-gallery__grid">
            {GALLERY.map((img, i) => (
              <Reveal key={img.src} className={`about-gallery__item about-gallery__item--${i + 1}`} delay={(i % 3) * 0.08}>
                <img src={img.src} alt={img.alt} loading="lazy" />
              </Reveal>
            ))}
          </div>
        </section>

        {/* 6 · Llamada a la acción */}
        <section className="section__inner about-cta" aria-labelledby="about-cta-title">
          <Reveal as="h2" className="display" id="about-cta-title">
            ¿Se te antojó <em>algo?</em>
          </Reveal>
          <Reveal className="about-cta__actions" delay={0.08}>
            <Button as={Link} to="/menu" className="ck-btn ck-btn--red ck-btn--lg">
              Descubrir el menú <ArrowIcon />
            </Button>
            <Button as={Link} to="/personaliza" className="ck-btn ck-btn--outline ck-btn--lg">
              Crear mi torta
            </Button>
          </Reveal>
        </section>
      </div>
    </>
  )
}
