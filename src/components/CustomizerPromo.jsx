import { lazy, Suspense, useMemo, useRef } from 'react'
import { Link } from 'react-router'
import { Button } from 'semantic-ui-react'
import { DECORATIONS, FILLINGS, GLAZES, resolveCake, SIGNATURE_CAKE, SPONGES } from '../data/cakeOptions'
import { useInView } from '../hooks/useInView'
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { hasWebGL } from '../hooks/webgl'
import CakeFallback from './CakeFallback'
import { ArrowIcon } from './Icons'
import Reveal from './Reveal'
import SceneBoundary from './SceneBoundary'

const CustomizerScene = lazy(() => import('../three/CustomizerScene'))

const COUNTS = [
  { n: Object.keys(SPONGES).length, label: 'bizcochos' },
  { n: Object.keys(FILLINGS).length, label: 'rellenos' },
  { n: Object.keys(GLAZES).length, label: 'coberturas' },
  { n: Object.keys(DECORATIONS).length, label: 'decoraciones' },
]

/**
 * Home page teaser for /personaliza: a non-interactive preview of the same
 * 3D customizer scene (paused off screen) and a call to action. The full
 * controls live only on the dedicated page.
 */
export default function CustomizerPromo() {
  const cake = useMemo(() => resolveCake(SIGNATURE_CAKE), [])
  const stageRef = useRef(null)
  const inView = useInView(stageRef)
  const isMobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const webgl = hasWebGL()

  return (
    <section className="custom custom--promo" aria-labelledby="promo-title">
      <div className="section__inner custom__inner">
        <div className="custom__stage" ref={stageRef}>
          <svg className="custom__blob" viewBox="0 0 600 600" aria-hidden="true">
            <path d="M302 36c96-4 196 40 240 128 44 86 22 186-20 268-44 84-128 140-226 132-100-8-186-58-226-150C30 322 34 214 92 134 146 60 214 40 302 36Z" />
          </svg>
          {webgl ? (
            <SceneBoundary fallback={<CakeFallback />}>
              <Suspense fallback={null}>
                <CustomizerScene cake={cake} animate={!reduced} active={inView} mobile={isMobile} interactive={false} />
              </Suspense>
            </SceneBoundary>
          ) : (
            <CakeFallback />
          )}
        </div>

        <div className="custom__panel">
          <Reveal as="p" className="eyebrow eyebrow--light">Taller de autor</Reveal>
          <Reveal as="h2" className="display custom__title" id="promo-title" delay={0.05}>
            Tu torta, <em>capa</em> por capa
          </Reveal>
          <Reveal as="p" className="custom__lead" delay={0.1}>
            Elige bizcocho, relleno, cobertura y decoración, y mira el resultado en 3D antes de
            pedirla.
          </Reveal>
          <Reveal as="ul" className="custom__counts" delay={0.15}>
            {COUNTS.map((c) => (
              <li key={c.label}>
                <strong>{c.n}</strong> {c.label}
              </li>
            ))}
          </Reveal>
          <Reveal delay={0.2}>
            <Button as={Link} to="/personaliza" className="ck-btn ck-btn--cream ck-btn--lg">
              Crear mi torta <ArrowIcon />
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
