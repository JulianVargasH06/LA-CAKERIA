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
    <section className="custom section" id="personaliza" aria-labelledby="custom-title">
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
          <Reveal as="h2" className="display custom__title" id="custom-title" delay={0.05}>
            Diseña <em>tu</em> torta
          </Reveal>
          <Reveal as="p" className="custom__lead" delay={0.1}>
            Elige cada capa y mira cómo cambia en 3D. Nosotros la horneamos.
          </Reveal>

          {GROUPS.map((group) => (
            <fieldset className="custom__group" key={group.key}>
              <legend>{group.title}</legend>
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
            <Button
              className="ck-btn ck-btn--cream ck-btn--lg"
              onClick={() => onOrder('Torta personalizada', describeCake(selection))}
            >
              Pedir mi torta
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
