import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from 'semantic-ui-react'
import {
  DECORATIONS,
  describeCake,
  FILLINGS,
  GLAZES,
  priceFor,
  resolveCake,
  SIGNATURE_CAKE,
  SPONGES,
} from '../data/cakeOptions'
import { CURRENCY } from '../data/products'
import { useInView } from '../hooks/useInView'
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { hasWebGL } from '../hooks/webgl'
import CakeFallback from './CakeFallback'
import Reveal from './Reveal'
import SceneBoundary from './SceneBoundary'

const CustomizerScene = lazy(() => import('../three/CustomizerScene'))

const GROUPS = [
  { key: 'sponge', title: 'Bizcocho', options: SPONGES, swatch: (o) => o.base },
  { key: 'filling', title: 'Relleno', options: FILLINGS, swatch: (o) => o.color },
  { key: 'glaze', title: 'Cobertura', options: GLAZES, swatch: (o) => o.color },
  { key: 'decoration', title: 'Decoración', options: DECORATIONS },
]

/**
 * Full cake configurator (used by /personaliza). The 3D scene, options,
 * colour easing and price rules are the same ones the landing used before.
 * Options change materials/colours and show or hide toppings — not the
 * cake's shape.
 */
export default function CakeCustomizer({ onOrder }) {
  const [selection, setSelection] = useState(SIGNATURE_CAKE)
  const cake = useMemo(() => resolveCake(selection), [selection])
  const price = priceFor(selection)
  const stageRef = useRef(null)
  const inView = useInView(stageRef)
  const isMobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const webgl = hasWebGL()

  return (
    <section className="custom custom--page" aria-labelledby="custom-title">
      <div className="section__inner custom__inner">
        <div className="custom__stage" ref={stageRef}>
          <svg className="custom__blob" viewBox="0 0 600 600" aria-hidden="true">
            <path d="M302 36c96-4 196 40 240 128 44 86 22 186-20 268-44 84-128 140-226 132-100-8-186-58-226-150C30 322 34 214 92 134 146 60 214 40 302 36Z" />
          </svg>
          {webgl ? (
            <SceneBoundary fallback={<CakeFallback />}>
              <Suspense fallback={null}>
                <CustomizerScene cake={cake} animate={!reduced} active={inView} mobile={isMobile} />
              </Suspense>
            </SceneBoundary>
          ) : (
            <CakeFallback />
          )}
          {!isMobile && webgl && <p className="custom__hint">Arrastra para girar</p>}
        </div>

        <div className="custom__panel">
          <Reveal as="p" className="eyebrow eyebrow--light">Taller de autor</Reveal>
          <Reveal as="h1" className="display custom__title" id="custom-title" delay={0.05}>
            Diseña <em>tu</em> torta
          </Reveal>
          <Reveal as="p" className="custom__lead" delay={0.1}>
            Elige cada capa y mira cómo cambian sus colores y acabados en 3D. Nosotros la horneamos.
          </Reveal>

          {GROUPS.map((group, i) => (
            <fieldset className="custom__group" key={group.key}>
              <legend>
                <span className="custom__step">{String(i + 1).padStart(2, '0')}</span>
                {group.title}
              </legend>
              <div className="custom__options">
                {Object.entries(group.options).map(([key, option]) => {
                  const active = selection[group.key] === key
                  return (
                    <Button
                      key={key}
                      type="button"
                      className={`ck-chip ${active ? 'is-active' : ''}`}
                      aria-pressed={active}
                      onClick={() => setSelection((s) => ({ ...s, [group.key]: key }))}
                    >
                      {group.swatch && (
                        <span className="ck-chip__swatch" style={{ background: group.swatch(option) }} />
                      )}
                      {option.label}
                    </Button>
                  )
                })}
              </div>
            </fieldset>
          ))}

          <div className="custom__review">
            <h2 className="custom__review-title">Tu combinación</h2>
            <dl className="custom__recap">
              {GROUPS.map((group) => (
                <div key={group.key}>
                  <dt>{group.title}</dt>
                  <dd>{group.options[selection[group.key]].label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="custom__summary">
            <div>
              <span className="custom__price-label">Precio estimado</span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={price}
                  className="custom__price"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                >
                  {CURRENCY}
                  {price}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="custom__actions">
              <Button
                className="ck-btn ck-btn--cream ck-btn--lg"
                onClick={() => onOrder('Torta personalizada', describeCake(selection))}
              >
                Solicitar mi torta
              </Button>
              <button type="button" className="custom__reset" onClick={() => setSelection(SIGNATURE_CAKE)}>
                Volver a la receta de la casa
              </button>
            </div>
          </div>
          <p className="custom__note">
            Precio de referencia calculado con las tarifas de ejemplo del proyecto; se confirma al
            procesar tu solicitud.
          </p>
        </div>
      </div>
    </section>
  )
}
