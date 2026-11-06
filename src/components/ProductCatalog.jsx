import { Link } from 'react-router'
import { Button } from 'semantic-ui-react'
import { FEATURED_PRODUCTS, PRODUCTS } from '../data/products'
import { ArrowIcon, FlowerIcon } from './Icons'
import ProductCard from './ProductCard'
import Reveal from './Reveal'

const VARIANTS = ['blob', 'tall', 'square']

/** Home page: featured products (same data source as /menu) + link to the full menu. */
export default function ProductCatalog() {
  return (
    <section className="catalog section" id="destacados" aria-labelledby="catalog-title">
      <div className="section__inner">
        <header className="catalog__head">
          <Reveal as="p" className="eyebrow">Favoritos de la casa</Reveal>
          <Reveal as="h2" className="display catalog__title" id="catalog-title" delay={0.05}>
            Hecho para <em>antojarse</em>
          </Reveal>
          <Reveal className="catalog__intro" delay={0.1}>
            <p>
              Una selección de lo que más sale del horno. Horneamos en pequeños lotes; los precios
              son de referencia y se confirman al hacer tu pedido.
            </p>
            <Button as={Link} to="/menu" className="ck-btn ck-btn--outline">
              Ver todo el menú <ArrowIcon />
            </Button>
          </Reveal>
        </header>

        <div className="catalog__grid">
          {FEATURED_PRODUCTS.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={PRODUCTS.indexOf(product)}
              variant={VARIANTS[i % VARIANTS.length]}
            />
          ))}

          <Reveal className="catalog__more">
            <Link to="/menu" className="catalog__more-link">
              <FlowerIcon size={26} />
              <span className="catalog__more-count">{PRODUCTS.length}</span>
              <span className="catalog__more-label">
                creaciones en el menú completo
                <b>
                  Ver todo el menú <ArrowIcon />
                </b>
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
