import { useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { Button, Label } from 'semantic-ui-react'
import { useCart } from '../context/cart'
import { CURRENCY } from '../data/products'
import { ArrowIcon } from './Icons'

/**
 * Editorial product entry: photo inside an organic mask, oversized index
 * number, price stamp and an order button. `variant` changes the layout
 * (feature | tall | wide | square) so the catalog never looks like a grid
 * of identical cards.
 */
export default function ProductCard({ product, index, variant = 'square', headingLevel = 3, ref }) {
  const cart = useCart()
  const HeadingTag = `h${headingLevel}`
  const [loaded, setLoaded] = useState(false)
  const number = String(index + 1).padStart(2, '0')

  return (
    <motion.article
      ref={ref}
      className={`product product--${variant}`}
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/menu/${product.id}`}
        className={`product__media ${loaded ? 'is-loaded' : ''}`}
        // duplicate of the title link for pointer users; skipped by keyboard / screen readers
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
        <span className="product__price">
          <small>desde</small>
          {CURRENCY}
          {product.price}
        </span>
      </Link>

      <div className="product__body">
        <span className="product__index">{number}</span>
        <p className="product__tagline">{product.tagline}</p>
        <HeadingTag className="product__name">
          <Link to={`/menu/${product.id}`}>{product.name}</Link>
        </HeadingTag>
        <p className="product__desc">{product.description}</p>
        <div className="product__meta">
          {product.tags.map((tag) => (
            <Label key={tag} className="ck-tag">
              {tag}
            </Label>
          ))}
          <span className="product__unit">
            {product.unit} · {product.sizes.length === 1 ? '1 tamaño' : `${product.sizes.length} tamaños`}
          </span>
        </div>
        <div className="product__actions">
          <Button as={Link} to={`/menu/${product.id}`} className="ck-btn ck-btn--link">
            Ver detalle
          </Button>
          <Button className="ck-btn ck-btn--link" onClick={() => cart.addProduct(product)}>
            Agregar al carrito <ArrowIcon />
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
