import CakeCustomizer from '../components/CakeCustomizer'
import Reveal from '../components/Reveal'

const STEPS = [
  { title: 'Elige', text: 'Combina bizcocho, relleno, cobertura y decoración. Gira la torta para verla desde todos los lados.' },
  { title: 'Revisa', text: 'Comprueba tu combinación y el precio estimado antes de enviarla.' },
  { title: 'Solicita', text: 'Agrégala al carrito, elige el tamaño y envía tu solicitud con la fecha. Te confirmamos disponibilidad y precio final.' },
]

/** "/personaliza" — the full 3D configurator, moved here from the landing page. */
export default function PersonalizePage() {
  return (
    <>
      <title>Personaliza tu torta — La Cakería</title>
      <CakeCustomizer />

      <section className="sheet steps" aria-labelledby="steps-title">
        <div className="section__inner">
          <Reveal as="p" className="eyebrow">Cómo funciona</Reveal>
          <Reveal as="h2" className="display steps__title" id="steps-title" delay={0.05}>
            De la pantalla <em>al horno</em>
          </Reveal>
          <ol className="steps__list">
            {STEPS.map((step, i) => (
              <Reveal as="li" key={step.title} delay={0.1 + i * 0.08}>
                <span className="steps__num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
