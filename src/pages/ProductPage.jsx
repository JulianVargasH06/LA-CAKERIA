import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link, useParams } from 'react-router'
import { Button, Label } from 'semantic-ui-react'
import DrinkPicker from '../components/DrinkPicker'
import { PagePanel } from '../components/PagePanel'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import { useCart } from '../context/cart'
import { DEFAULT_DRINK } from '../data/drinks'
import { categoryLabel, getProduct, PRODUCTS } from '../data/products'
import { formatCOP, formatCOPAmount } from '../utils/currency'
import NotFoundPage from './NotFoundPage'

const EASE = [0.22, 1, 0.36, 1]

/**
 * "/menu/:productId" — product sheet. Shows only the fields defined in
 * src/data/products.js (no invented ingredients, allergens or stock).
 */
export default function ProductPage() {
  const { productId } = useParams()
  const product = getProduct(productId)
  if (!product) return <NotFoundPage />
  // keyed so the selected size resets when moving to another product
  return <ProductDetail key={product.id} product={product} />
}

function ProductDetail({ product }) {
  const cart = useCart()
  const [sizeIndex, setSizeIndex] = useState(product.defaultSize)
  const [drink, setDrink] = useState(DEFAULT_DRINK)
  const size = product.sizes[sizeIndex]

  const related = PRODUCTS.filter((p) => p.id !== product.id)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 3)

  return (
    <>
      <title>{`${product.name} — La Cakería`}</title>
      <PagePanel className="detail" labelledBy="detail-title">
        <motion.div
          className="detail__media"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: EASE }}
        >
          <img src={product.image} alt={product.name} />
          <span className="product__price detail__price" aria-live="polite">
            <small>{size.label}</small>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={size.price}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {formatCOPAmount(size.price)}
              </motion.span>
            </AnimatePresence>
            <small>COP</small>
          </span>
        </motion.div>

        <motion.div
          className="detail__body"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: EASE }}
        >
          <nav className="detail__crumbs" aria-label="Ruta de navegación">
            <Link to="/menu">Menú</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/menu?categoria=${product.category}`}>{categoryLabel(product.category)}</Link>
          </nav>
          <p className="eyebrow">{product.tagline}</p>
          <h1 className="detail__title" id="detail-title">
            {product.name}
          </h1>
          <p className="detail__desc">{product.description}</p>

          <dl className="detail__facts">
            <div>
              <dt>Formato</dt>
              <dd>{product.unit}</dd>
            </div>
            <div>
              <dt>Destaca por</dt>
              <dd className="detail__tags">
                {product.tags.map((tag) => (
                  <Label key={tag} className="ck-tag">
                    {tag}
                  </Label>
                ))}
              </dd>
            </div>
            <div>
              <dt id="size-label">Tamaño</dt>
              <dd className="detail__sizes" role="group" aria-labelledby="size-label">
                {product.sizes.map((s, i) => (
                  <Button
                    key={s.label}
                    type="button"
                    className={`ck-size ck-size--light ${i === sizeIndex ? 'is-active' : ''}`}
                    aria-pressed={i === sizeIndex}
                    onClick={() => setSizeIndex(i)}
                  >
                    {s.label}
                    <small>{formatCOP(s.price)}</small>
                  </Button>
                ))}
              </dd>
            </div>
            <div className="detail__drink">
              <dt className="sr-only">Bebida</dt>
              <dd>
                <DrinkPicker value={drink} onChange={setDrink} />
              </dd>
            </div>
          </dl>
          <p className="detail__note">
            Precios de referencia por tamaño. Incluye una bebida a elegir, sin costo adicional.
            El precio final y la disponibilidad se confirman al procesar tu solicitud.
          </p>

          <div className="detail__actions">
            <Button className="ck-btn ck-btn--red ck-btn--lg" onClick={() => cart.addProduct(product, sizeIndex, drink)}>
              Agregar al carrito · {formatCOP(size.price)}
            </Button>
            <Button as={Link} to="/menu" className="ck-btn ck-btn--outline ck-btn--lg">
              Volver al menú
            </Button>
          </div>
        </motion.div>
      </PagePanel>

      <section className="sheet related" aria-labelledby="related-title">
        <div className="section__inner">
          <Reveal as="h2" className="display related__title" id="related-title">
            También te puede <em>gustar</em>
          </Reveal>
          <div className="menu__grid">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={PRODUCTS.indexOf(p)} variant={['tall', 'square', 'blob'][i]} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
